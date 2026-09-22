function plot_confusion_matrix(confMat, classLabels, outputPath)
%PLOT_CONFUSION_MATRIX Plots and saves a confusion matrix
%   plot_confusion_matrix(confMat, classLabels, outputPath)

    fig = figure('Visible', 'off');
    
    % Use heatmap if available
    try
        h = heatmap(classLabels, classLabels, confMat);
        h.Title = 'DR Classification Confusion Matrix';
        h.XLabel = 'Predicted Grade';
        h.YLabel = 'True Grade';
        h.Colormap = hot; % or YlOrRd if defined
    catch
        % Fallback for older MATLAB versions
        imagesc(confMat);
        colormap(hot);
        colorbar;
        title('DR Classification Confusion Matrix');
        xlabel('Predicted Grade');
        ylabel('True Grade');
        set(gca, 'XTick', 1:length(classLabels), 'XTickLabel', classLabels);
        set(gca, 'YTick', 1:length(classLabels), 'YTickLabel', classLabels);
        
        % Add text annotations
        [m, n] = size(confMat);
        for i = 1:m
            for j = 1:n
                text(j, i, num2str(confMat(i, j)), 'HorizontalAlignment', 'center', ...
                    'Color', 'black', 'FontSize', 12, 'FontWeight', 'bold');
            end
        end
    end
    
    % Save
    saveas(fig, outputPath);
    close(fig);
end
