function normalizedImg = normalize_illumination(img)
% NORMALIZE_ILLUMINATION Corrects uneven illumination in fundus images.
%   normalizedImg = normalize_illumination(img) estimates the background
%   illumination and normalizes the image channels.

    try
        % Convert to double
        imgD = im2double(img);
        
        % Initialize output
        correctedD = zeros(size(imgD));
        
        % Process each channel
        for i = 1:size(imgD, 3)
            channel = imgD(:,:,i);
            % Estimate background illumination using large Gaussian blur
            if exist('imgaussfilt', 'file')
                background = imgaussfilt(channel, 30);
            else
                background = matlab_img_utils.gaussfilt(channel, 15);
            end
            
            % Compute correction
            corrected = channel ./ (background + eps) * mean(background(:));
            
            % Clamp to [0, 1]
            corrected(corrected > 1) = 1;
            corrected(corrected < 0) = 0;
            
            correctedD(:,:,i) = corrected;
        end
        
        % Convert back to uint8
        if exist('im2uint8', 'file')
            normalizedImg = im2uint8(correctedD);
        else
            normalizedImg = uint8(max(0, min(255, round(correctedD * 255))));
        end
    catch ME
        warning('normalize_illumination: error occurred - %s. Returning original image.', ME.message);
        normalizedImg = img;
    end
end
