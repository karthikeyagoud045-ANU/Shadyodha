function [focusScore, isSharp] = check_focus(img)
%CHECK_FOCUS Assesses the focus/sharpness of a retinal fundus image.
%   [focusScore, isSharp] = CHECK_FOCUS(img) evaluates the focus quality of
%   an RGB image using the variance of the Laplacian response.
%
%   Inputs:
%       img - RGB image (uint8)
%
%   Outputs:
%       focusScore - Normalized score between 0 and 1
%       isSharp    - Logical indicating if the image meets the sharpness threshold

    try
        % Convert img (uint8 RGB) to grayscale
        if size(img, 3) > 1
            grayImg = rgb2gray(img);
        else
            grayImg = img;
        end
        
        % Apply Laplacian filter using conv2 (zero dependency)
        kernel = [0 1 0; 1 -4 1; 0 1 0];
        laplacianImg = conv2(double(grayImg), kernel, 'same');
        
        % Compute variance of the Laplacian response
        laplacianVar = var(laplacianImg(:));
        
        % Threshold: if laplacianVar > 100, isSharp = true
        isSharp = laplacianVar > 100;
        
        % Normalize to 0-1 score
        focusScore = min(1, laplacianVar / 500);
        
    catch ME
        warning('Error in check_focus: %s', ME.message);
        focusScore = 0;
        isSharp = false;
    end
end
