function [overlayImg, heatmapImg] = overlay_gradcam(originalImg, heatmap, outputDir)
% OVERLAY_GRADCAM Overlays a Grad-CAM heatmap on the original image.
%
%   [overlayImg, heatmapImg] = overlay_gradcam(originalImg, heatmap, outputDir)
%   originalImg: uint8 RGB image (resized original)
%   heatmap: 2D double matrix (0-1) from generate_gradcam
%   outputDir: Directory to save the output images
%
%   overlayImg: The alpha-blended image
%   heatmapImg: The colored heatmap image using jet colormap

    % Ensure heatmap matches original image size
    imgSize = [size(originalImg, 1), size(originalImg, 2)];
    if size(heatmap, 1) ~= imgSize(1) || size(heatmap, 2) ~= imgSize(2)
        heatmap = imresize(heatmap, imgSize, 'bilinear');
    end

    % Apply jet colormap in pure MATLAB
    hMin = min(heatmap(:));
    hMax = max(heatmap(:));
    if hMax > hMin
        normH = (heatmap - hMin) / (hMax - hMin);
    else
        normH = zeros(size(heatmap));
    end
    idx = min(256, max(1, round(normH * 255) + 1));
    cmap = jet(256);
    heatmapColor = zeros(size(heatmap, 1), size(heatmap, 2), 3);
    for c = 1:3
        heatmapColor(:,:,c) = reshape(cmap(idx, c), size(heatmap));
    end
    heatmapImg = uint8(round(heatmapColor * 255));

    % Alpha blend overlay
    alpha = 0.4;
    overlayImg = uint8(double(originalImg) * (1 - alpha) + double(heatmapImg) * alpha);

    % Save images if output directory is provided
    if nargin >= 3 && ~isempty(outputDir)
        if ~exist(outputDir, 'dir')
            mkdir(outputDir);
        end
        
        heatmapPath = fullfile(outputDir, 'gradcam.png');
        overlayPath = fullfile(outputDir, 'overlay.png');
        
        try
            imwrite(heatmapImg, heatmapPath);
            imwrite(overlayImg, overlayPath);
        catch ME
            warning('overlay_gradcam:WriteFailed', 'Failed to write output images: %s', ME.message);
        end
    end
end
