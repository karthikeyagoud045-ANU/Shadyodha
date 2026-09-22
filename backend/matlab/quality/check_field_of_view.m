function [fovPercentage, isSufficient] = check_field_of_view(img)
%CHECK_FIELD_OF_VIEW Measures the field of view of a fundus image.
%   [fovPercentage, isSufficient] = CHECK_FIELD_OF_VIEW(img) calculates the
%   percentage of the image that contains the retinal region.
%
%   Inputs:
%       img - RGB image (uint8)
%
%   Outputs:
%       fovPercentage - Percentage of area covered by retina (0-100)
%       isSufficient  - Logical indicating if FOV > 60%

    try
        % Convert to grayscale
        if size(img, 3) > 1
            grayImg = rgb2gray(img);
        else
            grayImg = img;
        end
        
        % Threshold to find retinal region (fundus vs black border)
        binary = grayImg > 15;
        
        totalPixels = numel(grayImg);
        retinalPixels = sum(binary(:));
        fovPercentage = (retinalPixels / totalPixels) * 100;
        
        isSufficient = fovPercentage > 60;
        
    catch ME
        warning('Error in check_field_of_view: %s', ME.message);
        fovPercentage = 0;
        isSufficient = false;
    end
end
