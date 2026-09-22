function [net, isLoaded, modelVersion] = load_model(modelPath)
% LOAD_MODEL Loads the DR classification model and parameters
%
% Inputs:
%   modelPath - String, optional path to the model file.
%
% Outputs:
%   net          - The loaded neural network (DAGNetwork or dlnetwork)
%   isLoaded     - Logical, true if trained model loaded, false if demo mode
%   modelVersion - String, model version identifier

    persistent cachedNet cachedIsLoaded cachedModelVersion
    persistent cachedCalibParams cachedThresholdParams

    if nargin < 1 || isempty(modelPath)
        modelPath = fullfile(fileparts(fileparts(mfilename('fullpath'))), 'models', 'trained_DR_ResNet101.mat');
    end

    % Use cache if available
    if ~isempty(cachedNet)
        net = cachedNet;
        isLoaded = cachedIsLoaded;
        modelVersion = cachedModelVersion;
        return;
    end

    modelVersion = 'drishti-resnet101-v1';
    
    if isfile(modelPath)
        try
            modelData = load(modelPath);
            if isfield(modelData, 'trainedNet')
                net = modelData.trainedNet;
            elseif isfield(modelData, 'net')
                net = modelData.net;
            else
                vars = fieldnames(modelData);
                net = modelData.(vars{1});
            end
            isLoaded = true;
        catch ME
            warning('Failed to load model from %s: %s. Using demo mode.', modelPath, ME.message);
            [net, isLoaded] = load_demo_model();
        end
    else
        warning('Trained model not found at %s. Using demo mode.', modelPath);
        [net, isLoaded] = load_demo_model();
    end
    
    % Attempt to load calibration and threshold params
    modelDir = fileparts(modelPath);
    calibPath = fullfile(modelDir, 'calibration_params.mat');
    thresholdPath = fullfile(modelDir, 'threshold_params.mat');
    
    if isfile(calibPath)
        cachedCalibParams = load(calibPath);
    else
        cachedCalibParams = struct();
    end
    
    if isfile(thresholdPath)
        cachedThresholdParams = load(thresholdPath);
    else
        cachedThresholdParams = struct('threshold', 0.5);
    end

    % Cache the results
    cachedNet = net;
    cachedIsLoaded = isLoaded;
    cachedModelVersion = modelVersion;
end

function [net, isLoaded] = load_demo_model()
    try
        if exist('resnet101', 'file')
            net = resnet101;
            isLoaded = false;
            return;
        end
    catch
    end
    % Fallback demo model structure
    net = struct();
    net.Name = 'drishti-resnet101-demo';
    net.Classes = {'0_NoDR', '1_MildNPDR', '2_ModerateNPDR', '3_SevereNPDR', '4_ProliferativeDR'};
    net.Layers = [];
    isLoaded = false;
end
