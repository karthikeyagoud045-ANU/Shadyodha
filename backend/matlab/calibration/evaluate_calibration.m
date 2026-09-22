function [ece, mce, reliabilityData] = evaluate_calibration(predictedProbs, trueLabels, numBins)
%EVALUATE_CALIBRATION Calculates Expected Calibration Error and Maximum Calibration Error
%   [ece, mce, reliabilityData] = evaluate_calibration(predictedProbs, trueLabels, numBins)
%   predictedProbs: Nx5 matrix of probabilities
%   trueLabels: Nx1 vector of true labels (0-4)
%   numBins: number of bins for reliability computation (default 10)

    if nargin < 3
        numBins = 10;
    end
    
    [N, ~] = size(predictedProbs);
    
    % Get the max probability and the predicted class
    [maxProbs, predLabels] = max(predictedProbs, [], 2);
    predLabels = predLabels - 1; % 0-indexed
    
    % Determine if the prediction was correct
    isCorrect = (predLabels == trueLabels);
    
    % Bin the probabilities
    binEdges = linspace(0, 1, numBins + 1);
    
    binAccuracy = zeros(numBins, 1);
    binConfidence = zeros(numBins, 1);
    binCounts = zeros(numBins, 1);
    
    ece = 0;
    mce = 0;
    
    for i = 1:numBins
        % Find samples in this bin
        if i == numBins
            inBin = (maxProbs >= binEdges(i)) & (maxProbs <= binEdges(i+1));
        else
            inBin = (maxProbs >= binEdges(i)) & (maxProbs < binEdges(i+1));
        end
        
        binCount = sum(inBin);
        binCounts(i) = binCount;
        
        if binCount > 0
            % Compute accuracy and average confidence in this bin
            binAccuracy(i) = mean(isCorrect(inBin));
            binConfidence(i) = mean(maxProbs(inBin));
            
            % Difference for ECE and MCE
            diff = abs(binAccuracy(i) - binConfidence(i));
            
            ece = ece + (binCount / N) * diff;
            mce = max(mce, diff);
        end
    end
    
    % Return reliability data for plotting
    reliabilityData.binEdges = binEdges;
    reliabilityData.binAccuracy = binAccuracy;
    reliabilityData.binConfidence = binConfidence;
    reliabilityData.binCounts = binCounts;
end
