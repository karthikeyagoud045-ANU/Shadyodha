function results = run_simulation(params)
% RUN_SIMULATION  Discrete-event simulation of DRISHTI AI screening workflow.
%
%   results = run_simulation(params)
%
%   Simulates the complete patient screening workflow:
%     Patient Arrival → Registration → Fundus Camera → AI Processing →
%     [Referable] → Ophthalmologist Review → Completed
%     [Non-referable] → Completed
%
%   This is a programmatic discrete-event simulation that produces
%   identical output metrics to the Simulink/SimEvents model
%   (drishti_sim_model.slx) without requiring Simulink.
%
%   Input params (struct with fields):
%     patientsPerDay       - Number of patients per day (default: 100)
%     numCameras           - Number of fundus cameras (default: 2)
%     aiProcessingTimeSec  - AI processing time per image (default: 5)
%     numOphthalmologists   - Number of ophthalmologists (default: 1)
%     reviewTimeSec        - Doctor review time per case (default: 180)
%     bandwidthMbps        - Network bandwidth in Mbps (default: 2)
%     referableRate        - Fraction of cases that are referable (default: 0.25)
%     operatingHours       - Clinic operating hours per day (default: 8)
%     registrationTimeSec  - Registration time per patient (default: 120)
%     captureTimeSec       - Camera capture time per eye (default: 60)
%     simDays              - Number of days to simulate (default: 5)
%     outputDir            - Directory for output (default: current dir)
%
%   Output:
%     results - struct with simulation metrics
%     Also writes simulation_results.json to outputDir
%
%   Author: DRISHTI AI / ShadYodha (SIH26038)

    %% Parse Parameters with Defaults
    if nargin < 1 || isempty(params)
        params = struct();
    end
    
    p = set_defaults(params);
    
    logger.info('========================================');
    logger.info('DRISHTI AI Operational Simulation');
    logger.info('========================================');
    logger.info('Parameters:');
    logger.info('  Patients/day: %d', p.patientsPerDay);
    logger.info('  Cameras: %d', p.numCameras);
    logger.info('  AI processing: %d sec', p.aiProcessingTimeSec);
    logger.info('  Ophthalmologists: %d', p.numOphthalmologists);
    logger.info('  Review time: %d sec', p.reviewTimeSec);
    logger.info('  Bandwidth: %.1f Mbps', p.bandwidthMbps);
    logger.info('  Referable rate: %.0f%%', p.referableRate * 100);
    logger.info('  Sim days: %d', p.simDays);
    
    %% Run Discrete-Event Simulation
    simTic = tic;
    
    totalOperatingSeconds = p.operatingHours * 3600;
    totalPatients = p.patientsPerDay * p.simDays;
    
    % Image transfer time based on bandwidth (avg fundus ~3MB)
    avgImageSizeMB = 3;
    transferTimeSec = (avgImageSizeMB * 8) / p.bandwidthMbps;
    
    % Pre-generate patient arrivals (Poisson process)
    rng(42, 'twister'); % Reproducible
    meanInterArrival = totalOperatingSeconds / p.patientsPerDay;
    
    % ===== Per-day simulation =====
    dailyMetrics = struct();
    allWaitTimes = [];
    allThroughputTimes = [];
    
    for day = 1:p.simDays
        logger.info('--- Simulating Day %d ---', day);
        
        % Generate arrival times for this day (Poisson process)
        nPatients = p.patientsPerDay;
        if exist('exprnd', 'file')
            interArrivals = exprnd(meanInterArrival, nPatients, 1);
        else
            interArrivals = -meanInterArrival * log(max(eps, rand(nPatients, 1)));
        end
        arrivalTimes = cumsum(interArrivals);
        
        % Clamp to operating hours
        arrivalTimes = arrivalTimes(arrivalTimes <= totalOperatingSeconds);
        nPatients = numel(arrivalTimes);
        
        % Determine which patients are referable
        isReferable = rand(nPatients, 1) < p.referableRate;
        
        % ===== Service Queues =====
        % Track when each resource becomes free (earliest available time)
        regFreeAt = 0;                                         % 1 registrar
        cameraFreeAt = zeros(1, p.numCameras);                 % cameras
        aiFreeAt = 0;                                          % AI server (1)
        docFreeAt = zeros(1, p.numOphthalmologists);           % doctors
        
        % Patient timing records
        patientData = zeros(nPatients, 7); 
        % Columns: [arrival, regStart, regEnd, camEnd, aiEnd, docEnd, completed]
        
        % Randomized service times with small variance
        regTimes    = max(30, p.registrationTimeSec + randn(nPatients,1)*20);
        capTimes    = max(20, p.captureTimeSec + randn(nPatients,1)*10);
        aiTimes     = max(1,  p.aiProcessingTimeSec + randn(nPatients,1)*1);
        reviewTimes = max(30, p.reviewTimeSec + randn(nPatients,1)*30);
        
        % Queue length trackers
        regQueueLen  = zeros(nPatients, 1);
        camQueueLen  = zeros(nPatients, 1);
        aiQueueLen   = zeros(nPatients, 1);
        docQueueLen  = zeros(nPatients, 1);
        
        for i = 1:nPatients
            arrival = arrivalTimes(i);
            
            % STAGE 1: Registration (single queue)
            regStart = max(arrival, regFreeAt);
            regEnd = regStart + regTimes(i);
            regFreeAt = regEnd;
            regQueueLen(i) = max(0, regFreeAt - arrival - regTimes(i)) / meanInterArrival;
            
            % STAGE 2: Fundus Camera (multiple servers)
            [camStart, camIdx] = min(cameraFreeAt);
            camStart = max(regEnd, camStart);
            camEnd = camStart + capTimes(i);
            cameraFreeAt(camIdx) = camEnd;
            camQueueLen(i) = sum(cameraFreeAt > regEnd) / p.numCameras;
            
            % STAGE 3: Image Transfer + AI Processing
            aiStart = max(camEnd + transferTimeSec, aiFreeAt);
            aiEnd = aiStart + aiTimes(i);
            aiFreeAt = aiEnd;
            aiQueueLen(i) = max(0, aiFreeAt - camEnd - transferTimeSec) / meanInterArrival;
            
            % STAGE 4: Doctor Review (only for referable cases)
            if isReferable(i)
                [docStart, docIdx] = min(docFreeAt);
                docStart = max(aiEnd, docStart);
                docEnd = docStart + reviewTimes(i);
                docFreeAt(docIdx) = docEnd;
                docQueueLen(i) = sum(docFreeAt > aiEnd) / p.numOphthalmologists;
                completed = docEnd;
            else
                docEnd = aiEnd;
                completed = aiEnd;
            end
            
            patientData(i,:) = [arrival, regStart, regEnd, camEnd, aiEnd, docEnd, completed];
        end
        
        % ===== Compute Daily Metrics =====
        waitTimes = patientData(:,2) - patientData(:,1); % reg wait
        totalWaitTimes = patientData(:,7) - patientData(:,1); % total time
        
        dailyMetrics(day).day = day;
        dailyMetrics(day).patientsProcessed = nPatients;
        dailyMetrics(day).referableCases = sum(isReferable);
        dailyMetrics(day).avgWaitTimeMin = mean(totalWaitTimes) / 60;
        dailyMetrics(day).maxWaitTimeMin = max(totalWaitTimes) / 60;
        dailyMetrics(day).avgRegQueueWaitMin = mean(waitTimes) / 60;
        dailyMetrics(day).maxRegQueueLen = ceil(max(regQueueLen));
        dailyMetrics(day).maxCamQueueLen = ceil(max(camQueueLen));
        dailyMetrics(day).maxAiQueueLen = ceil(max(aiQueueLen));
        dailyMetrics(day).maxDocQueueLen = ceil(max(docQueueLen));
        
        % Utilization: fraction of operating hours each resource was busy
        lastPatientDone = max(patientData(:,7));
        effectiveTime = max(totalOperatingSeconds, lastPatientDone);
        
        dailyMetrics(day).cameraUtilPct = 100 * sum(capTimes(1:nPatients)) / ...
            (p.numCameras * effectiveTime);
        dailyMetrics(day).aiUtilPct = 100 * sum(aiTimes(1:nPatients)) / effectiveTime;
        dailyMetrics(day).docUtilPct = 100 * sum(reviewTimes(isReferable)) / ...
            (p.numOphthalmologists * effectiveTime);
        
        allWaitTimes = [allWaitTimes; totalWaitTimes]; %#ok<AGROW>
        allThroughputTimes = [allThroughputTimes; totalWaitTimes]; %#ok<AGROW>
        
        logger.info('  Day %d: %d patients | Avg wait: %.1f min | Referable: %d', ...
            day, nPatients, dailyMetrics(day).avgWaitTimeMin, ...
            dailyMetrics(day).referableCases);
    end
    
    simTime = toc(simTic);
    
    %% Aggregate Results
    totalProcessed = sum([dailyMetrics.patientsProcessed]);
    avgDailyThroughput = totalProcessed / p.simDays;
    
    % Identify bottleneck
    avgCamUtil = mean([dailyMetrics.cameraUtilPct]);
    avgAiUtil  = mean([dailyMetrics.aiUtilPct]);
    avgDocUtil = mean([dailyMetrics.docUtilPct]);
    
    [~, bottleneckIdx] = max([avgCamUtil, avgAiUtil, avgDocUtil]);
    bottleneckNames = {'fundus_camera', 'ai_processing', 'ophthalmologist_review'};
    bottleneck = bottleneckNames{bottleneckIdx};
    
    %% Build Results Struct
    results = struct();
    results.simulationId = sprintf('SIM-%s', datestr(now, 'yyyymmdd-HHMMSS'));
    results.simulationTimeSeconds = round(simTime, 2);
    results.parameters = p;
    
    results.metrics = struct();
    results.metrics.totalPatientsSimulated = totalProcessed;
    results.metrics.simDays = p.simDays;
    results.metrics.dailyThroughput = round(avgDailyThroughput);
    results.metrics.averageWaitTimeMin = round(mean(allWaitTimes)/60, 1);
    results.metrics.medianWaitTimeMin = round(median(allWaitTimes)/60, 1);
    results.metrics.maxWaitTimeMin = round(max(allWaitTimes)/60, 1);
    results.metrics.p95WaitTimeMin = round(prctile(allWaitTimes, 95)/60, 1);
    results.metrics.maxQueueLength = max([dailyMetrics.maxRegQueueLen]);
    results.metrics.cameraUtilizationPct = round(avgCamUtil, 1);
    results.metrics.aiUtilizationPct = round(avgAiUtil, 1);
    results.metrics.doctorUtilizationPct = round(avgDocUtil, 1);
    results.metrics.referralBacklog = sum([dailyMetrics.maxDocQueueLen]);
    results.metrics.bottleneckIdentification = bottleneck;
    
    results.dailyBreakdown = dailyMetrics;
    
    results.recommendations = generate_recommendations(results.metrics, p);
    
    %% Write Output
    if ~isfolder(p.outputDir)
        mkdir(p.outputDir);
    end
    
    jsonPath = fullfile(p.outputDir, 'simulation_results.json');
    export_results(results, jsonPath);
    
    logger.info('========================================');
    logger.info('Simulation Complete');
    logger.info('  Total patients: %d over %d days', totalProcessed, p.simDays);
    logger.info('  Daily throughput: %d', results.metrics.dailyThroughput);
    logger.info('  Avg wait: %.1f min', results.metrics.averageWaitTimeMin);
    logger.info('  Bottleneck: %s', bottleneck);
    logger.info('  Results: %s', jsonPath);
    logger.info('========================================');
end


%% ==================== HELPER FUNCTIONS ====================

function p = set_defaults(params)
% SET_DEFAULTS  Apply default parameter values.
    p = struct();
    p.patientsPerDay      = get_field_or(params, 'patientsPerDay', 100);
    p.numCameras          = get_field_or(params, 'numCameras', 2);
    p.aiProcessingTimeSec = get_field_or(params, 'aiProcessingTimeSec', 5);
    p.numOphthalmologists = get_field_or(params, 'numOphthalmologists', 1);
    p.reviewTimeSec       = get_field_or(params, 'reviewTimeSec', 180);
    p.bandwidthMbps       = get_field_or(params, 'bandwidthMbps', 2);
    p.referableRate       = get_field_or(params, 'referableRate', 0.25);
    p.operatingHours      = get_field_or(params, 'operatingHours', 8);
    p.registrationTimeSec = get_field_or(params, 'registrationTimeSec', 120);
    p.captureTimeSec      = get_field_or(params, 'captureTimeSec', 60);
    p.simDays             = get_field_or(params, 'simDays', 5);
    p.outputDir           = get_field_or(params, 'outputDir', pwd);
end

function val = get_field_or(s, fieldName, default)
% GET_FIELD_OR  Get struct field with default.
    if isfield(s, fieldName)
        val = s.(fieldName);
    else
        val = default;
    end
end

function recs = generate_recommendations(metrics, params)
% GENERATE_RECOMMENDATIONS  Generate operational recommendations.
    recs = {};
    
    if metrics.cameraUtilizationPct > 80
        recs{end+1} = sprintf('Camera utilization is high (%.0f%%). Consider adding %d more camera(s).', ...
            metrics.cameraUtilizationPct, max(1, ceil(params.numCameras * 0.5)));
    end
    
    if metrics.aiUtilizationPct > 90
        recs{end+1} = 'AI processing is at high utilization. Consider upgrading to GPU-accelerated processing.';
    end
    
    if metrics.doctorUtilizationPct > 80
        recs{end+1} = sprintf('Ophthalmologist utilization is high (%.0f%%). Consider adding %d more reviewer(s) or implementing tele-ophthalmology.', ...
            metrics.doctorUtilizationPct, max(1, ceil(params.numOphthalmologists * 0.5)));
    end
    
    if metrics.averageWaitTimeMin > 60
        recs{end+1} = sprintf('Average wait time is %.0f min, exceeding 60 min target. Primary bottleneck: %s.', ...
            metrics.averageWaitTimeMin, metrics.bottleneckIdentification);
    end
    
    if metrics.p95WaitTimeMin > 120
        recs{end+1} = sprintf('95th percentile wait time is %.0f min. Consider staggered appointments to reduce peak load.', ...
            metrics.p95WaitTimeMin);
    end
    
    if isempty(recs)
        recs{1} = 'Current resource allocation appears adequate for the simulated patient load.';
    end
end
