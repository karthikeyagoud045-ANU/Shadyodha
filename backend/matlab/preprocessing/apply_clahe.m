function enhancedImg = apply_clahe(img)
% APPLY_CLAHE Applies Contrast Limited Adaptive Histogram Equalization.
%   enhancedImg = apply_clahe(img) takes a uint8 RGB image and applies
%   CLAHE on the L channel of the LAB color space.

    try
        if exist('adapthisteq', 'file') && exist('rgb2lab', 'file')
            % Convert to LAB color space
            labImg = rgb2lab(img);
            L = labImg(:,:,1);
            L_norm = L / 100;
            L_enhanced = adapthisteq(L_norm, 'ClipLimit', 0.01, 'NumTiles', [8 8], 'Distribution', 'rayleigh');
            labImg(:,:,1) = L_enhanced * 100;
            enhancedImg = lab2rgb(labImg);
            enhancedImg = im2uint8(enhancedImg);
        else
            % Pure-MATLAB CLAHE fallback
            enhancedImg = matlab_img_utils.clahe(img, [8, 8], 0.02);
        end
    catch ME
        warning('apply_clahe: error occurred - %s. Using native CLAHE.', ME.message);
        enhancedImg = matlab_img_utils.clahe(img, [8, 8], 0.02);
    end
end
