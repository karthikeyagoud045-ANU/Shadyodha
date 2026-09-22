function plot_calibration(trueLabels, predictedProbs, calibratedProbs, outputPath)
% PLOT_CALIBRATION  Generate reliability diagram (calibration plot).
%
%   plot_calibration(trueLabels, predictedProbs, calibratedProbs, outputPath)
%
%   Shows before/after calibration reliability diagrams side by side.
%   A perfectly calibrated model has points on the diagonal.
%
%   Inputs:
%     trueLabels       - Nx1 true class labels (0-4)
%     predictedProbs   - Nx5 raw softmax probabilities (before calibration)
%     calibratedProbs  - Nx5 calibrated probabilities (after calibration)
%     outputPath       - Full path for saved PNG (default: calibration_plot.png)
%
%   Author: DRISHTI AI / ShadYodha (SIH26038)

    if nargin < 4
        outputPath = fullfile(pwd, 'calibration_plot.png');
    end
    if nargin < 3 || isempty(calibratedProbs)
        calibratedProbs = predictedProbs;
    end

    numBins = 10;
    binEdges = linspace(0, 1, numBins + 1);

    fig = figure('Visible', 'off', 'Position', [100 100 1000 450]);

    %% Panel 1: Before calibration
    subplot(1, 2, 1);
    [binAcc_before, binConf_before, binCounts_before] = ...
        compute_reliability(trueLabels, predictedProbs, numBins);
    plot_reliability_diagram(binEdges, binAcc_before, binConf_before, ...
        binCounts_before, 'Before Calibration (Raw Softmax)');

    %% Panel 2: After calibration
    subplot(1, 2, 2);
    [binAcc_after, binConf_after, binCounts_after] = ...
        compute_reliability(trueLabels, calibratedProbs, numBins);
    plot_reliability_diagram(binEdges, binAcc_after, binConf_after, ...
        binCounts_after, 'After Calibration (Isotonic Regression)');

    %% Compute and display ECE
    ece_before = sum(binCounts_before .* abs(binAcc_before - binConf_before)) / sum(binCounts_before);
    ece_after  = sum(binCounts_after  .* abs(binAcc_after  - binConf_after))  / sum(binCounts_after);

    sgtitle(sprintf('Calibration Reliability Diagram | ECE Before: %.3f → After: %.3f', ...
        ece_before, ece_after), 'FontSize', 12, 'FontWeight', 'bold');

    %% Save
    outputDir = fileparts(outputPath);
    if ~isempty(outputDir) && ~isfolder(outputDir)
        mkdir(outputDir);
    end
    saveas(fig, outputPath);
    close(fig);

    fprintf('Calibration plot saved: %s\n', outputPath);
end


function [binAcc, binConf, binCounts] = compute_reliability(trueLabels, probs, numBins)
% COMPUTE_RELIABILITY  Compute reliability diagram data.
    [~, predClass] = max(probs, [], 2);
    predClass = predClass - 1;            % 0-indexed
    maxProbs  = max(probs, [], 2);        % confidence = max softmax prob
    isCorrect = (predClass == trueLabels);

    binEdges = linspace(0, 1, numBins + 1);
    binAcc    = zeros(numBins, 1);
    binConf   = zeros(numBins, 1);
    binCounts = zeros(numBins, 1);

    for b = 1:numBins
        lo = binEdges(b);
        hi = binEdges(b + 1);
        if b == numBins
            inBin = maxProbs >= lo & maxProbs <= hi;
        else
            inBin = maxProbs >= lo & maxProbs < hi;
        end
        binCounts(b) = sum(inBin);
        if binCounts(b) > 0
            binAcc(b)  = mean(isCorrect(inBin));
            binConf(b) = mean(maxProbs(inBin));
        else
            binAcc(b)  = 0;
            binConf(b) = (lo + hi) / 2;
        end
    end
end


function plot_reliability_diagram(binEdges, binAcc, binConf, binCounts, titleStr)
% PLOT_RELIABILITY_DIAGRAM  Plot a single reliability diagram panel.
    numBins = numel(binAcc);
    binCenters = (binEdges(1:end-1) + binEdges(2:end)) / 2;

    % Gap fill (difference between accuracy and confidence)
    hold on;
    for b = 1:numBins
        if binCounts(b) > 0
            lo = binEdges(b);
            hi = binEdges(b+1);
            w  = hi - lo;
            % Perfect calibration bar (light blue)
            fill([lo lo+w lo+w lo], [0 0 binCenters(b) binCenters(b)], ...
                [0.8 0.85 1.0], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
            % Actual bar
            fill([lo lo+w lo+w lo], [0 0 binAcc(b) binAcc(b)], ...
                [0.2 0.5 0.85], 'EdgeColor', [0.1 0.3 0.6], 'LineWidth', 0.5);
        end
    end

    % Diagonal (perfect calibration)
    plot([0 1], [0 1], 'k--', 'LineWidth', 1.5, 'DisplayName', 'Perfect calibration');

    % Mark operating points
    validBins = binCounts > 0;
    scatter(binConf(validBins), binAcc(validBins), 50, 'ro', ...
        'filled', 'DisplayName', 'Model');

    xlabel('Mean Confidence', 'FontSize', 10);
    ylabel('Fraction Correct (Accuracy)', 'FontSize', 10);
    title(titleStr, 'FontSize', 10, 'FontWeight', 'bold');
    xlim([0 1]); ylim([0 1]);
    grid on; box on;
    legend({'Perfect', 'Gap', 'Model'}, 'Location', 'northwest', 'FontSize', 8);
    hold off;
end
