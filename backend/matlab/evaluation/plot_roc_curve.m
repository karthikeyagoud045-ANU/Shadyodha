function plot_roc_curve(trueLabels, predictions, outputPath)
%PLOT_ROC_CURVE Plots and saves ROC curves (Binary and per-class)
%   plot_roc_curve(trueLabels, predictions, outputPath)

    fig = figure('Visible', 'off', 'Position', [100, 100, 800, 600]);
    
    % Colors for per-class ROC
    colors = lines(5);
    
    hold on;
    
    % Plot diagonal
    plot([0, 1], [0, 1], 'k--', 'LineWidth', 1.5, 'DisplayName', 'Random Guess');
    
    % Plot binary referable
    trueReferable = trueLabels >= 2;
    referableScores = sum(predictions(:, 3:5), 2);
    if exist('perfcurve', 'file')
        [X_bin, Y_bin, T_bin, AUC_bin] = perfcurve(double(trueReferable), referableScores, 1);
    else
        [X_bin, Y_bin, T_bin, AUC_bin] = matlab_img_utils.roc_curve(trueReferable, referableScores);
    end
    
    p_bin = plot(X_bin, Y_bin, 'k-', 'LineWidth', 2.5, ...
        'DisplayName', sprintf('Referable DR (AUC = %.3f)', AUC_bin));
        
    % Mark the operating point
    [~, op_idx] = min(abs(T_bin - 0.42));
    plot(X_bin(op_idx), Y_bin(op_idx), 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'r', ...
        'DisplayName', 'Operating Point (thresh=0.42)');
    
    % Plot per-class (One-vs-Rest)
    classLabelsStr = {'No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'};
    for c = 0:4
        trueC = (trueLabels == c);
        scoresC = predictions(:, c+1);
        
        if exist('perfcurve', 'file')
            [X_c, Y_c, ~, AUC_c] = perfcurve(double(trueC), scoresC, 1);
        else
            [X_c, Y_c, ~, AUC_c] = matlab_img_utils.roc_curve(trueC, scoresC);
        end
        plot(X_c, Y_c, '-', 'Color', colors(c+1, :), 'LineWidth', 1.5, ...
            'DisplayName', sprintf('Class %d: %s (AUC = %.3f)', c, classLabelsStr{c+1}, AUC_c));
    end
    
    hold off;
    
    % Aesthetics
    title('ROC Curves - DRISHTI AI');
    xlabel('False Positive Rate (1 - Specificity)');
    ylabel('True Positive Rate (Sensitivity)');
    grid on;
    legend('Location', 'southeast');
    
    % Save
    saveas(fig, outputPath);
    close(fig);
end
