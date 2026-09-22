function run_screening(inputImagePath, outputDir, screeningId)
% RUN_SCREENING  Main entry point for DRISHTI AI retinal screening pipeline.
%
%   run_screening(inputImagePath, outputDir)
%   run_screening(inputImagePath, outputDir, screeningId)
%
%   This is the SINGLE function that Node.js calls via:
%     matlab -batch "run_screening('/path/to/image.jpg', '/path/to/output')"
%
%   Pipeline:
%     1. Load fundus image
%     2. Quality assessment → reject if fails
%     3. Preprocess image (CLAHE, denoise, resize)
%     4. ResNet-101 classification (5-class ICDR grading)
%     5. Confidence calibration (isotonic regression)
%     6. Grad-CAM explainability heatmap
%     7. Lesion detection and annotation
%     8. Triage and referral decision
%     9. Write result.json + image outputs
%
%   Inputs:
%     inputImagePath - Absolute path to fundus image (JPEG/PNG/TIFF)
%     outputDir      - Directory where result.json and images are saved
%     screeningId    - (Optional) Screening ID string; auto-generated if omitted
%
%   Outputs (written to outputDir):
%     result.json           - Structured JSON with all results
%     gradcam.png           - Grad-CAM heatmap
%     overlay.png           - Heatmap overlaid on original
%     lesion_annotation.png - Lesion bounding box annotations
%
%   Author: DRISHTI AI / ShadYodha (SIH26038)
%   Date:   2024

    %% ==================== INITIALIZATION ====================
    overallTic = tic;
    
    % Add all MATLAB subfolders to path
    thisDir = fileparts(mfilename('fullpath'));
    if exist(fullfile(thisDir, 'quality'), 'dir')
        matlabRoot = thisDir;
    else
        matlabRoot = fileparts(thisDir);
    end
    addpath(genpath(matlabRoot));
    
    % Auto-generate screening ID if not provided
    if nargin < 3 || isempty(screeningId)
        screeningId = sprintf('SCR-%s', datestr(now, 'yyyymmdd-HHMMSS'));
    end
    
    % Ensure output directory exists
    if ~isfolder(outputDir)
        mkdir(outputDir);
    end
    
    % Model version identifier
    modelVersion = 'drishti-resnet101-v1';
    
    logger.info('========================================');
    logger.info('DRISHTI AI Retinal Screening Pipeline');
    logger.info('Screening ID: %s', screeningId);
    logger.info('Input: %s', inputImagePath);
    logger.info('Output: %s', outputDir);
    logger.info('========================================');
    
    %% ==================== ERROR-WRAPPED PIPELINE ====================
    try
        %% STEP 1: Load Image
        logger.info('[1/9] Loading fundus image...');
        [img, loadSuccess, loadErr] = read_image_safe(inputImagePath);
        
        if ~loadSuccess
            logger.error('Image load failed: %s', loadErr);
            write_error_json(outputDir, screeningId, modelVersion, ...
                sprintf('Image load failed: %s', loadErr), overallTic);
            return;
        end
        logger.info('  Image loaded: %dx%dx%d', size(img,1), size(img,2), size(img,3));
        
        %% STEP 2: Quality Assessment
        logger.info('[2/9] Assessing image quality...');
        qualityResult = assess_image_quality(img);
        
        logger.info('  Quality score: %.2f | Gradable: %s', ...
            qualityResult.score, mat2str(qualityResult.gradable));
        logger.info('  Focus: %.2f | Illumination: %.2f | FOV: %.1f%%', ...
            qualityResult.focusScore, qualityResult.illuminationScore, ...
            qualityResult.fovPercentage);
        
        if ~qualityResult.gradable
            % Image quality failed → write rejection JSON and return
            logger.warn('Image quality FAILED. Writing rejection result.');
            
            processingTimeMs = round(toc(overallTic) * 1000);
            
            rejectionResult = struct();
            rejectionResult.screeningId = screeningId;
            rejectionResult.status = 'rejected';
            rejectionResult.processingTimeMs = processingTimeMs;
            rejectionResult.modelVersion = modelVersion;
            
            % Quality sub-struct
            iq = struct();
            iq.gradable = false;
            iq.score = round(qualityResult.score, 2);
            iq.focusScore = round(qualityResult.focusScore, 2);
            iq.illuminationScore = round(qualityResult.illuminationScore, 2);
            iq.fovPercentage = round(qualityResult.fovPercentage, 1);
            iq.issues = qualityResult.issues;
            iq.recommendation = qualityResult.recommendation;
            rejectionResult.imageQuality = iq;
            
            % Null fields for rejected images
            rejectionResult.prediction = [];
            rejectionResult.explainability = [];
            rejectionResult.triage = [];
            
            write_result_json(outputDir, rejectionResult);
            
            logger.info('Rejection result written to %s', outputDir);
            logger.info('Processing time: %d ms', processingTimeMs);
            return;
        end
        
        %% STEP 3: Preprocess Image
        logger.info('[3/9] Preprocessing fundus image...');
        [processedImg, originalResized] = preprocess_fundus(img);
        logger.info('  Preprocessed to %dx%dx%d', ...
            size(processedImg,1), size(processedImg,2), size(processedImg,3));
        
        %% STEP 4: Load Model and Classify
        logger.info('[4/9] Loading DR classification model...');
        [net, modelLoaded, mVersion] = load_model();
        
        if ~modelLoaded
            logger.warn('Trained model not found — running in DEMO mode');
        end
        
        % Load calibration and threshold params
        modelsDir = fullfile(matlabRoot, 'models');
        calibParams = [];
        thresholdParams = struct('threshold', 0.5); % default
        
        calibPath = fullfile(modelsDir, 'calibration_params.mat');
        if isfile(calibPath)
            calibData = load(calibPath);
            if isfield(calibData, 'calibParams')
                calibParams = calibData.calibParams;
            end
        end
        
        threshPath = fullfile(modelsDir, 'threshold_params.mat');
        if isfile(threshPath)
            threshData = load(threshPath);
            if isfield(threshData, 'thresholdParams')
                thresholdParams = threshData.thresholdParams;
            end
        end
        
        logger.info('[5/9] Classifying DR severity...');
        classResult = classify_dr(processedImg, net, calibParams, thresholdParams);
        
        logger.info('  Grade: %d (%s)', classResult.grade, classResult.label);
        logger.info('  Confidence: %.2f (calibrated: %.2f)', ...
            classResult.confidence, classResult.calibratedConfidence);
        logger.info('  Referable: %s (score: %.3f, threshold: %.3f)', ...
            mat2str(classResult.referable), classResult.referableScore, ...
            classResult.operatingThreshold);
        
        %% STEP 6: Grad-CAM Explainability
        logger.info('[6/9] Generating Grad-CAM heatmap...');
        try
            [heatmap, ~] = generate_gradcam(net, processedImg, classResult.grade);
            [~, ~] = overlay_gradcam(originalResized, heatmap, outputDir);
            gradcamGenerated = true;
            logger.info('  Grad-CAM saved: gradcam.png, overlay.png');
        catch gcErr
            logger.warn('Grad-CAM generation failed: %s', gcErr.message);
            gradcamGenerated = false;
            % Create placeholder images
            imwrite(originalResized, fullfile(outputDir, 'gradcam.png'));
            imwrite(originalResized, fullfile(outputDir, 'overlay.png'));
        end
        
        %% STEP 7: Lesion Detection
        logger.info('[7/9] Detecting and annotating lesions...');
        try
            lesions = detect_lesions(originalResized, processedImg);
            annotatedImg = annotate_lesions(originalResized, lesions, outputDir);
            logger.info('  Lesions detected:');
            for li = 1:numel(lesions)
                logger.info('    %s: %d', lesions(li).type, lesions(li).count);
            end
        catch lesErr
            logger.warn('Lesion detection failed: %s', lesErr.message);
            lesions = struct('type', {}, 'count', {}, 'regions', {});
            imwrite(originalResized, fullfile(outputDir, 'lesion_annotation.png'));
        end
        
        %% STEP 8: Generate Clinical Note
        logger.info('[8/9] Generating clinical note...');
        clinicalNote = generate_clinical_note(classResult, lesions);
        
        %% STEP 9: Build and Write Result JSON
        logger.info('[9/9] Writing result.json...');
        processingTimeMs = round(toc(overallTic) * 1000);
        
        % Build the complete result struct
        result = build_result_struct(screeningId, modelVersion, processingTimeMs, ...
            qualityResult, classResult, lesions, clinicalNote, gradcamGenerated);
        
        % Write JSON
        write_result_json(outputDir, result);
        
        logger.info('========================================');
        logger.info('Screening COMPLETE');
        logger.info('  Status: %s', result.status);
        logger.info('  Grade: %d (%s)', classResult.grade, classResult.label);
        logger.info('  Referable: %s', mat2str(classResult.referable));
        logger.info('  Triage: %s', result.triage.priority);
        logger.info('  Processing time: %d ms', processingTimeMs);
        logger.info('  Output: %s', outputDir);
        logger.info('========================================');
        
    catch pipelineErr
        %% PIPELINE ERROR HANDLING
        logger.error('Pipeline failed: %s', pipelineErr.message);
        logger.error('Stack trace:');
        for si = 1:numel(pipelineErr.stack)
            logger.error('  %s (line %d)', pipelineErr.stack(si).name, ...
                pipelineErr.stack(si).line);
        end
        
        write_error_json(outputDir, screeningId, modelVersion, ...
            pipelineErr.message, overallTic);
    end
end


%% ==================== HELPER FUNCTIONS ====================

function clinicalNote = generate_clinical_note(classResult, lesions)
% GENERATE_CLINICAL_NOTE  Generate clinical evidence note based on findings.
    
    [~, ~, ~, ~, clinicalDesc] = get_severity_label(classResult.grade);
    
    % Build lesion evidence string
    lesionStr = '';
    lesionTypes = {};
    for i = 1:numel(lesions)
        if lesions(i).count > 0
            lesionTypes{end+1} = strrep(lesions(i).type, '_', ' '); %#ok<AGROW>
        end
    end
    
    if ~isempty(lesionTypes)
        if numel(lesionTypes) == 1
            lesionStr = lesionTypes{1};
        elseif numel(lesionTypes) == 2
            lesionStr = [lesionTypes{1} ' and ' lesionTypes{2}];
        else
            lesionStr = strjoin(lesionTypes(1:end-1), ', ');
            lesionStr = [lesionStr ', and ' lesionTypes{end}];
        end
        lesionStr = sprintf(' with %s', lesionStr);
    end
    
    if classResult.grade == 0
        clinicalNote = 'No evidence of diabetic retinopathy. Recommend routine annual screening.';
    elseif classResult.grade == 1
        clinicalNote = sprintf('Evidence of mild non-proliferative diabetic retinopathy%s. Recommend routine monitoring with annual follow-up.', lesionStr);
    else
        clinicalNote = sprintf('Evidence of %s%s consistent with Level %d on the International Clinical DR Severity Scale.', ...
            lower(classResult.label), lesionStr, classResult.grade);
    end
end


function result = build_result_struct(screeningId, modelVersion, processingTimeMs, ...
        qualityResult, classResult, lesions, clinicalNote, gradcamGenerated)
% BUILD_RESULT_STRUCT  Assemble the non-negotiable result.json structure.
    
    result = struct();
    result.screeningId = screeningId;
    result.status = 'completed';
    result.processingTimeMs = processingTimeMs;
    result.modelVersion = modelVersion;
    
    %% Image Quality
    iq = struct();
    iq.gradable = true;
    iq.score = round(qualityResult.score, 2);
    iq.focusScore = round(qualityResult.focusScore, 2);
    iq.illuminationScore = round(qualityResult.illuminationScore, 2);
    iq.fovPercentage = round(qualityResult.fovPercentage, 1);
    iq.issues = qualityResult.issues;
    iq.recommendation = 'Image quality acceptable for analysis';
    result.imageQuality = iq;
    
    %% Prediction
    pred = struct();
    pred.grade = classResult.grade;
    pred.label = classResult.label;
    pred.severityScale = classResult.severityScale;
    pred.confidence = round(classResult.confidence, 2);
    pred.calibratedConfidence = round(classResult.calibratedConfidence, 2);
    pred.calibrationMethod = classResult.calibrationMethod;
    pred.referable = classResult.referable;
    pred.referableThreshold = classResult.referableThreshold;
    pred.referableScore = round(classResult.referableScore, 4);
    pred.operatingThreshold = round(classResult.operatingThreshold, 4);
    pred.icdrScale = classResult.icdrScale;
    pred.rawScores = round(classResult.rawScores, 4);
    result.prediction = pred;
    
    %% Explainability
    expl = struct();
    if gradcamGenerated
        expl.gradcamUrl = 'gradcam.png';
        expl.overlayUrl = 'overlay.png';
    else
        expl.gradcamUrl = 'gradcam.png';
        expl.overlayUrl = 'overlay.png';
    end
    expl.annotationUrl = 'lesion_annotation.png';
    
    % Build detected lesions array
    detectedLesions = {};
    for i = 1:numel(lesions)
        if lesions(i).count > 0
            lesionEntry = struct();
            lesionEntry.type = lesions(i).type;
            lesionEntry.count = lesions(i).count;
            lesionEntry.regions = lesions(i).regions;
            detectedLesions{end+1} = lesionEntry; %#ok<AGROW>
        end
    end
    
    if isempty(detectedLesions)
        expl.detectedLesions = {};
    else
        expl.detectedLesions = detectedLesions;
    end
    
    expl.clinicalNote = clinicalNote;
    result.explainability = expl;
    
    %% Triage
    [~, isReferable, triagePriority, timeline, ~] = get_severity_label(classResult.grade);
    
    tri = struct();
    tri.priority = triagePriority;
    
    if classResult.grade >= 3
        tri.action = 'URGENT_OPHTHALMOLOGIST_REVIEW';
    elseif classResult.grade == 2
        tri.action = 'OPHTHALMOLOGIST_REVIEW';
    else
        tri.action = 'ROUTINE_SCREENING';
    end
    
    tri.isReferable = isReferable;
    tri.recommendedTimeline = timeline;
    
    if isReferable
        tri.reason = sprintf('Referable DR detected (Level %d, %s)', ...
            classResult.grade, classResult.label);
    else
        tri.reason = 'Non-referable DR. Continue routine screening.';
    end
    
    result.triage = tri;
end


function write_error_json(outputDir, screeningId, modelVersion, errMsg, overallTic)
% WRITE_ERROR_JSON  Write error result JSON when pipeline fails.
    
    if ~isfolder(outputDir)
        mkdir(outputDir);
    end
    
    processingTimeMs = round(toc(overallTic) * 1000);
    
    errorResult = struct();
    errorResult.screeningId = screeningId;
    errorResult.status = 'error';
    errorResult.processingTimeMs = processingTimeMs;
    errorResult.modelVersion = modelVersion;
    errorResult.error = struct('message', errMsg, ...
        'timestamp', datestr(now, 'yyyy-mm-ddTHH:MM:SS'));
    errorResult.imageQuality = [];
    errorResult.prediction = [];
    errorResult.explainability = [];
    errorResult.triage = [];
    
    try
        write_result_json(outputDir, errorResult);
    catch
        % Last resort: manual JSON write
        jsonStr = jsonencode(errorResult);
        fid = fopen(fullfile(outputDir, 'result.json'), 'w');
        if fid ~= -1
            fprintf(fid, '%s', jsonStr);
            fclose(fid);
        end
    end
    
    logger.error('Error result written to %s', outputDir);
    logger.error('Processing time: %d ms', processingTimeMs);
end
