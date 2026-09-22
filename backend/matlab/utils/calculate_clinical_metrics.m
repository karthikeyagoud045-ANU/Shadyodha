function metrics = calculate_clinical_metrics(yTrue, yPred, referableThreshold)
% CALCULATE_CLINICAL_METRICS Computes clinical sensitivity and specificity for referable DR.
%
%   metrics = calculate_clinical_metrics(yTrue, yPred, referableThreshold)

    if nargin < 3 || isempty(referableThreshold)
        referableThreshold = 0.42;
    end

    yTrue = yTrue(:);
    yPred = yPred(:);

    if max(yTrue) > 1
        binaryTrue = double(yTrue >= 2);
    else
        binaryTrue = double(yTrue > 0.5);
    end

    if max(yPred) > 1
        binaryPred = double(yPred >= 2);
        predScores = double(yPred) / 4.0;
    else
        binaryPred = double(yPred >= referableThreshold);
        predScores = double(yPred);
    end

    TP = sum(binaryTrue == 1 & binaryPred == 1);
    FP = sum(binaryTrue == 0 & binaryPred == 1);
    FN = sum(binaryTrue == 1 & binaryPred == 0);
    TN = sum(binaryTrue == 0 & binaryPred == 0);

    sensitivity = TP / max(TP + FN, 1);
    specificity = TN / max(TN + FP, 1);
    accuracy = (TP + TN) / max(length(binaryTrue), 1);
    ppv = TP / max(TP + FP, 1);
    npv = TN / max(TN + FN, 1);

    posScores = predScores(binaryTrue == 1);
    negScores = predScores(binaryTrue == 0);
    if isempty(posScores) || isempty(negScores)
        auc = 1.0;
    else
        nPos = length(posScores);
        nNeg = length(negScores);
        rankSum = 0;
        for i = 1:nPos
            rankSum = rankSum + sum(posScores(i) > negScores) + 0.5 * sum(posScores(i) == negScores);
        end
        auc = rankSum / (nPos * nNeg);
    end

    metrics = struct();
    metrics.sensitivity = sensitivity;
    metrics.specificity = specificity;
    metrics.accuracy = accuracy;
    metrics.ppv = ppv;
    metrics.npv = npv;
    metrics.auc = auc;
    metrics.operatingThreshold = referableThreshold;
    metrics.confusionMatrix = struct('TP', TP, 'FP', FP, 'FN', FN, 'TN', TN);
    metrics.targetsMet = struct(...
        'sensitivityMet', sensitivity >= 0.90, ...
        'specificityMet', specificity >= 0.85, ...
        'allMet', (sensitivity >= 0.90) && (specificity >= 0.85) ...
    );
end
