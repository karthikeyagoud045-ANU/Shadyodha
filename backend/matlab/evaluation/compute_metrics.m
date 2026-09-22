function metrics = compute_metrics(predictions, trueLabels, modelVersion, datasetName, outputDir)
%COMPUTE_METRICS Comprehensive evaluation harness for DRISHTI AI
%   metrics = compute_metrics(predictions, trueLabels, modelVersion, datasetName, outputDir)

    if nargin < 5
        outputDir = fullfile(pwd, 'ai', 'outputs');
    end
    
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    % 1. PREDICTED LABELS
    [~, predLabels] = max(predictions, [], 2);
    predLabels = predLabels - 1; % 0-indexed

    % 2. BINARY REFERABLE (Grade 2, 3, 4)
    trueReferable = trueLabels >= 2;
    referableScores = sum(predictions(:, 3:5), 2);
    
    % Try loading threshold
    threshold = 0.42;
    try
        scriptDir = fileparts(mfilename('fullpath'));
        modelsDir = fullfile(fileparts(scriptDir), 'models');
        threshPath = fullfile(modelsDir, 'threshold_params.mat');
        if isfile(threshPath)
            threshData = load(threshPath);
            if isfield(threshData, 'thresholdParams') && isfield(threshData.thresholdParams, 'threshold')
                threshold = threshData.thresholdParams.threshold;
            elseif isfield(threshData, 'threshold')
                threshold = threshData.threshold;
            end
        end
    catch
    end
    
    predReferable = referableScores >= threshold;
    
    % Calculate binary metrics
    TP = sum(predReferable == 1 & trueReferable == 1);
    TN = sum(predReferable == 0 & trueReferable == 0);
    FP = sum(predReferable == 1 & trueReferable == 0);
    FN = sum(predReferable == 0 & trueReferable == 1);
    
    sensitivity = TP / max(1, (TP + FN));
    specificity = TN / max(1, (TN + FP));
    ppv = TP / max(1, (TP + FP));
    npv = TN / max(1, (TN + FN));
    prevalence = sum(trueReferable) / max(1, length(trueReferable));
    
    % AUC
    if exist('perfcurve', 'file')
        [~, ~, ~, auc] = perfcurve(double(trueReferable), referableScores, 1);
    else
        [~, ~, ~, auc] = matlab_img_utils.roc_curve(trueReferable, referableScores);
    end

    % 3. PER-CLASS METRICS
    classLabelsStr = {'No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'};
    perClass = struct('grade', {}, 'label', {}, 'precision', {}, 'recall', {}, 'f1', {}, 'support', {});
    
    for c = 0:4
        trueC = (trueLabels == c);
        predC = (predLabels == c);
        
        tp_c = sum(predC == 1 & trueC == 1);
        fp_c = sum(predC == 1 & trueC == 0);
        fn_c = sum(predC == 0 & trueC == 1);
        
        prec = tp_c / max(1, (tp_c + fp_c));
        rec = tp_c / max(1, (tp_c + fn_c));
        
        if isnan(prec), prec = 0; end
        if isnan(rec), rec = 0; end
        
        if (prec + rec) > 0
            f1_c = 2 * prec * rec / (prec + rec);
        else
            f1_c = 0;
        end
        if isnan(f1_c), f1_c = 0; end
        
        perClass(c+1).grade = c;
        perClass(c+1).label = classLabelsStr{c+1};
        perClass(c+1).precision = round(prec, 4);
        perClass(c+1).recall = round(rec, 4);
        perClass(c+1).f1 = round(f1_c, 4);
        perClass(c+1).support = sum(trueC);
    end

    % 4. CONFUSION MATRIX
    if exist('confusionmat', 'file')
        confMat = confusionmat(trueLabels, predLabels, 'Order', [0, 1, 2, 3, 4]);
    else
        confMat = matlab_img_utils.confusion_matrix(trueLabels, predLabels, 5);
    end

    % 5. CALIBRATION
    [eceBefore, ~, ~] = evaluate_calibration(predictions, trueLabels, 10);
    try
        [calibProbs, ~] = calibrate_confidence(predictions, trueLabels, 'isotonic');
        [eceAfter, ~, ~] = evaluate_calibration(calibProbs, trueLabels, 10);
    catch
        eceAfter = eceBefore;
    end

    % 6. CHECK PS TARGETS
    sensitivityMin = 0.90;
    specificityMin = 0.85;
    metTargets = (sensitivity >= sensitivityMin) && (specificity >= specificityMin);

    % 7. BUILD METRICS STRUCT
    metrics.modelVersion = modelVersion;
    metrics.icdrScale = classLabelsStr;
    metrics.referableDefinition = 'grade >= 2 on ICDR scale';
    
    metrics.datasets = struct();
    metrics.datasets.train = 'APTOS 2019';
    metrics.datasets.validation = 'APTOS 2019 (15%)';
    metrics.datasets.test = datasetName;
    metrics.datasets.external = 'IDRiD';
    
    metrics.referableMetrics.sensitivity = sensitivity;
    metrics.referableMetrics.specificity = specificity;
    metrics.referableMetrics.ppv = ppv;
    metrics.referableMetrics.npv = npv;
    metrics.referableMetrics.auc = auc;
    metrics.referableMetrics.prevalence = prevalence;
    metrics.referableMetrics.targets.sensitivityMin = sensitivityMin;
    metrics.referableMetrics.targets.specificityMin = specificityMin;
    metrics.referableMetrics.targets.met = metTargets;
    
    metrics.operatingPoint.score = threshold;
    metrics.operatingPoint.threshold = threshold;
    metrics.operatingPoint.tunedOn = 'validation';
    
    metrics.perClass = perClass;
    metrics.confusionMatrix = confMat;
    
    metrics.calibration.method = 'isotonic_regression';
    metrics.calibration.eceBefore = eceBefore;
    metrics.calibration.eceAfter = eceAfter;
    
    metrics.artifacts.confusionMatrixUrl = 'confusion_matrix.png';
    metrics.artifacts.rocUrl = 'roc_curve.png';
    metrics.artifacts.calibrationUrl = 'calibration_plot.png';
    
    metrics.evaluatedAt = datestr(now, 'yyyy-mm-ddTHH:MM:SS');

    % 8. SAVE
    try
        jsonStr = jsonencode(metrics, 'PrettyPrint', true);
    catch
        jsonStr = jsonencode(metrics);
    end
    fid = fopen(fullfile(outputDir, 'metrics.json'), 'w', 'n', 'UTF-8');
    if fid ~= -1
        fprintf(fid, '%s', jsonStr);
        fclose(fid);
    end
    
    % Generate plots
    plot_confusion_matrix(confMat, classLabelsStr, fullfile(outputDir, 'confusion_matrix.png'));
    plot_roc_curve(trueLabels, predictions, fullfile(outputDir, 'roc_curve.png'));
    try
        [calibProbs2, ~] = calibrate_confidence(predictions, trueLabels, 'isotonic');
        plot_calibration(trueLabels, predictions, calibProbs2, fullfile(outputDir, 'calibration_plot.png'));
    catch
        plot_calibration(trueLabels, predictions, [], fullfile(outputDir, 'calibration_plot.png'));
    end
    
    % Copy to backend
    backendDir = fullfile(pwd, '..', 'backend', 'uploads', 'model', modelVersion);
    if exist(backendDir, 'dir')
        try
            copyfile(fullfile(outputDir, 'confusion_matrix.png'), backendDir);
            copyfile(fullfile(outputDir, 'roc_curve.png'), backendDir);
        catch
        end
    end
end
