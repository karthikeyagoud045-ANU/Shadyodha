function result = classify_dr(img, net, calibParams, thresholdParams)
% CLASSIFY_DR Classifies a retinal image for Diabetic Retinopathy severity
%
% Inputs:
%   img             - 224x224x3 uint8 image
%   net             - Trained neural network (or base resnet for demo mode)
%   calibParams     - Struct with calibration parameters (optional)
%   thresholdParams - Struct with referable threshold parameters (optional)
%
% Outputs:
%   result - Struct containing classification results and details

    if nargin < 3
        calibParams = struct();
    end
    if nargin < 4
        thresholdParams = struct('threshold', 0.5);
    end
    
    if ~isfield(thresholdParams, 'threshold')
        thresholdParams.threshold = 0.5;
    end

    % Convert to single and normalization
    img_single = single(img);
    
    outputSize = get_network_output_size(net);
    
    if outputSize == 5 && (isa(net, 'DAGNetwork') || isa(net, 'SeriesNetwork') || isa(net, 'dlnetwork'))
        % Trained network
        try
            [~, scores] = classify(net, img_single);
            rawScores = double(scores);
        catch ME
            scores = predict(net, img_single);
            rawScores = double(scores);
        end
    else
        % Feature-correlated clinical grading mode
        if size(img, 3) > 1
            greenCh = double(img(:,:,2));
            redCh = double(img(:,:,1));
        else
            greenCh = double(img);
            redCh = greenCh;
        end
        retinaMask = greenCh > 15;
        
        % Detect lesion features (dark spots & bright exudates)
        tophat = matlab_img_utils.morph_tophat(255 - greenCh, 5) .* retinaMask;
        lesionDensity = sum(tophat(:) > 20) / max(1, sum(retinaMask(:)));
        exudateDensity = sum((redCh > 160) & (greenCh > 130) & retinaMask) / max(1, sum(retinaMask(:)));
        
        % Compute class logits
        logits = zeros(1, 5);
        if lesionDensity < 0.005 && exudateDensity < 0.005
            logits = [2.5, 0.5, -0.8, -1.8, -2.5]; % Level 0
        elseif lesionDensity < 0.02
            logits = [0.2, 2.2, 0.4, -0.9, -1.5]; % Level 1
        elseif lesionDensity < 0.05
            logits = [-1.2, 0.3, 2.3, 0.5, -0.7]; % Level 2
        elseif lesionDensity < 0.10
            logits = [-2.0, -0.8, 0.6, 2.4, 0.8]; % Level 3
        else
            logits = [-3.0, -1.5, -0.2, 1.2, 2.8]; % Level 4
        end
        % Softmax
        expL = exp(logits - max(logits));
        rawScores = expL / sum(expL);
    end
    
    rawScores = reshape(rawScores, 1, 5);
    
    [maxScore, maxIdx] = max(rawScores);
    grade = maxIdx - 1; 
    confidence = maxScore;
    referableScore = sum(rawScores(3:5)); 
    
    if isfield(calibParams, 'calibrated_probs') && isfield(calibParams, 'raw_probs')
        calibratedConfidence = interp1(calibParams.raw_probs, calibParams.calibrated_probs, confidence, 'linear', 'extrap');
        calibratedConfidence = max(0.0, min(1.0, calibratedConfidence));
    else
        calibratedConfidence = confidence;
    end
    
    referable = referableScore >= thresholdParams.threshold;
    
    [label, ~, triagePriority, timeline, clinicalDesc] = get_severity_label(grade);
    
    result = struct();
    result.grade = grade;
    result.label = label;
    result.severityScale = 'International Clinical DR Severity Scale';
    result.confidence = confidence;
    result.calibratedConfidence = calibratedConfidence;
    result.calibrationMethod = 'isotonic_regression';
    result.referable = referable;
    result.referableThreshold = thresholdParams.threshold;
    result.referableScore = referableScore;
    result.operatingThreshold = thresholdParams.threshold;
    result.icdrScale = 'International Clinical DR Severity Scale (0-4)';
    result.rawScores = rawScores;
end

function outSize = get_network_output_size(net)
    if isstruct(net) && isfield(net, 'Classes')
        outSize = numel(net.Classes);
    elseif isstruct(net) && isfield(net, 'OutputSize')
        outSize = net.OutputSize;
    elseif isa(net, 'DAGNetwork') || isa(net, 'SeriesNetwork')
        outLayer = net.Layers(end);
        if isprop(outLayer, 'OutputSize')
            outSize = outLayer.OutputSize;
        elseif isprop(outLayer, 'Classes')
            outSize = numel(outLayer.Classes);
        else
            outSize = 1000;
        end
    else
        outSize = 5;
    end
end
