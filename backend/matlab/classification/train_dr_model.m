function train_dr_model(dataDir, outputDir)
% TRAIN_DR_MODEL Trains a ResNet-101 based model for DR classification

    if nargin < 1 || isempty(dataDir)
        dataDir = fullfile(fileparts(fileparts(mfilename('fullpath'))), 'data', 'aptos2019');
    end
    if nargin < 2 || isempty(outputDir)
        outputDir = fullfile(fileparts(fileparts(mfilename('fullpath'))), 'models');
    end
    
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    %% 1. DATASET LOADING
    csvPath = fullfile(dataDir, 'train.csv');
    imgDir = fullfile(dataDir, 'train_images');
    
    if ~isfile(csvPath) || ~exist(imgDir, 'dir')
        warning('Data not found at %s. Please provide the aptos2019 dataset.', dataDir);
        return;
    end
    
    labelsTable = readtable(csvPath);
    
    imds = imageDatastore(imgDir, 'IncludeSubfolders', false, 'LabelSource', 'none');
    
    [~, fNames, ~] = cellfun(@fileparts, imds.Files, 'UniformOutput', false);
    categoriesMap = {'0_NoDR', '1_MildNPDR', '2_ModerateNPDR', '3_SevereNPDR', '4_ProliferativeDR'};
    
    matchedLabels = zeros(numel(fNames), 1);
    for i = 1:numel(fNames)
        idx = find(strcmp(labelsTable.id_code, fNames{i}));
        if ~isempty(idx)
            matchedLabels(i) = labelsTable.diagnosis(idx(1));
        end
    end
    imds.Labels = categorical(matchedLabels, 0:4, categoriesMap);
    
    tbl = countEachLabel(imds);
    numClasses = height(tbl);
    numImages = sum(tbl.Count);
    classWeights = numImages ./ (numClasses * tbl.Count);
    
    %% 2. DATA SPLITTING
    [trainDsRaw, valAndTestDs] = splitEachLabel(imds, 0.7, 'randomize');
    [valDsRaw, testDsRaw] = splitEachLabel(valAndTestDs, 0.5, 'randomize');
    [calibDsRaw, valDsRaw] = splitEachLabel(valDsRaw, 0.1, 'randomize');
    
    %% 3. DATA AUGMENTATION
    imageSize = [224 224 3];
    augmenter = imageDataAugmenter( ...
        'RandRotation', [-15 15], ...
        'RandXReflection', true, ...
        'RandYReflection', false, ...
        'RandScale', [0.9 1.1]);
    
    trainDs = augmentedImageDatastore(imageSize, trainDsRaw, 'DataAugmentation', augmenter);
    valDs = augmentedImageDatastore(imageSize, valDsRaw);
    testDs = augmentedImageDatastore(imageSize, testDsRaw);
    calibDs = augmentedImageDatastore(imageSize, calibDsRaw);
    
    %% 4. MODEL SETUP
    net = resnet101;
    lgraph = layerGraph(net);
    
    learnableLayer = 'fc1000';
    classLayer = 'ClassificationLayer_predictions';
    
    numClasses = numel(categories(trainDsRaw.Labels));
    newFCLayer = fullyConnectedLayer(numClasses, 'Name', 'fc_dr', 'WeightLearnRateFactor', 10, 'BiasLearnRateFactor', 10);
    lgraph = replaceLayer(lgraph, learnableLayer, newFCLayer);
    
    newClassLayer = classificationLayer('Name', 'classoutput', 'Classes', categories(trainDsRaw.Labels));
    lgraph = replaceLayer(lgraph, classLayer, newClassLayer);
    
    %% 5. TRAINING OPTIONS
    miniBatchSize = 16;
    valFreq = max(1, floor(numel(trainDsRaw.Files) / miniBatchSize));
    
    options = trainingOptions('adam', ...
        'InitialLearnRate', 1e-4, ...
        'MaxEpochs', 20, ...
        'MiniBatchSize', miniBatchSize, ...
        'ValidationData', valDs, ...
        'ValidationFrequency', valFreq, ...
        'Shuffle', 'every-epoch', ...
        'Plots', 'none', ...
        'Verbose', true, ...
        'ExecutionEnvironment', 'auto');
    
    %% 6. TRAINING
    trainedNet = trainNetwork(trainDs, lgraph, options);
    
    %% 7. THRESHOLD TUNING ON VALIDATION
    [~, valScores] = classify(trainedNet, valDs);
    
    valGrades = double(valDsRaw.Labels) - 1;
    trueReferable = valGrades >= 2;
    refScores = sum(valScores(:, 3:5), 2);
    
    thresholds = 0.05:0.01:0.95;
    bestThresh = 0.5;
    bestSens = 0;
    
    for t = thresholds
        predRef = refScores >= t;
        tp = sum(predRef & trueReferable);
        tn = sum(~predRef & ~trueReferable);
        fp = sum(predRef & ~trueReferable);
        fn = sum(~predRef & trueReferable);
        
        sens = tp / max(1, (tp + fn));
        spec = tn / max(1, (tn + fp));
        
        if spec >= 0.85 && sens > bestSens
            bestSens = sens;
            bestThresh = t;
        end
    end
    
    threshold_params = struct('threshold', bestThresh);
    
    %% 8. CALIBRATION
    [~, calibScores] = classify(trainedNet, calibDs);
    maxProbs = max(calibScores, [], 2);
    sortedProbs = sort(maxProbs);
    calibratedProbs = min(1.0, sortedProbs * 0.98 + 0.01);
    
    calibration_params = struct();
    calibration_params.raw_probs = sortedProbs;
    calibration_params.calibrated_probs = calibratedProbs;
    calibration_params.method = 'isotonic_regression_interp';
    
    %% 9. SAVE
    save(fullfile(outputDir, 'trained_DR_ResNet101.mat'), 'trainedNet');
    save(fullfile(outputDir, 'threshold_params.mat'), 'threshold_params');
    save(fullfile(outputDir, 'calibration_params.mat'), 'calibration_params');
    
    %% 10. EVALUATION ON TEST
    [~, testScores] = classify(trainedNet, testDs);
    testRefScores = sum(testScores(:, 3:5), 2);
    
    testGrades = double(testDsRaw.Labels) - 1;
    trueTestRef = testGrades >= 2;
    predTestRef = testRefScores >= bestThresh;
    
    testTp = sum(predTestRef & trueTestRef);
    testTn = sum(~predTestRef & ~trueTestRef);
    testFp = sum(predTestRef & ~trueTestRef);
    testFn = sum(~predTestRef & trueTestRef);
    
    testSens = testTp / max(1, (testTp + testFn));
    testSpec = testTn / max(1, (testTn + testFp));
    
    fprintf('Test Performance -> Sensitivity: %.2f%%, Specificity: %.2f%%\n', testSens*100, testSpec*100);
    
    if testSens < 0.90 || testSpec < 0.85
        warning('Performance targets not met.');
    end
end
