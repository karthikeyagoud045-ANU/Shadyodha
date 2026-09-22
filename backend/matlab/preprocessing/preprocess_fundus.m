function [processedImg, originalResized] = preprocess_fundus(img, targetSize)
% PREPROCESS_FUNDUS Master preprocessing function for fundus images.
%   [processedImg, originalResized] = preprocess_fundus(img, targetSize)
%   crops, resizes, normalizes illumination, applies CLAHE, and denoises.

    try
        % Default targetSize = [224 224] if not provided
        if nargin < 2 || isempty(targetSize)
            targetSize = [224 224];
        end
        
        % Step 1: Crop to circular ROI (remove black borders)
        if size(img, 3) > 1
            grayImg = rgb2gray(img);
        else
            grayImg = img;
        end
        mask = grayImg > 15;
        
        [rows, cols] = find(mask);
        if ~isempty(rows)
            margin = 5;
            y1 = max(1, min(rows) - margin);
            y2 = min(size(img, 1), max(rows) + margin);
            x1 = max(1, min(cols) - margin);
            x2 = min(size(img, 2), max(cols) + margin);
            croppedImg = img(y1:y2, x1:x2, :);
        else
            croppedImg = img;
        end
        
        % Step 2: Resize to targetSize using imresize with 'bilinear' method
        resizedImg = imresize(croppedImg, targetSize, 'bilinear');
        
        % Step 3: Save a copy as originalResized
        originalResized = resizedImg;
        
        % Step 4: Normalize illumination
        normImg = normalize_illumination(resizedImg);
        
        % Step 5: Apply CLAHE
        claheImg = apply_clahe(normImg);
        
        % Step 6: Optional denoise (light Gaussian smoothing)
        if exist('imgaussfilt', 'file')
            processedImgD = imgaussfilt(im2double(claheImg), 0.5);
        else
            processedImgD = matlab_img_utils.gaussfilt(im2double(claheImg), 0.5);
        end
        if exist('im2uint8', 'file')
            processedImg = im2uint8(processedImgD);
        else
            processedImg = uint8(max(0, min(255, round(processedImgD * 255))));
        end
        
    catch ME
        warning('preprocess_fundus: error occurred - %s', ME.message);
        % Attempt fallback
        if exist('originalResized', 'var')
            processedImg = originalResized;
        else
            processedImg = imresize(img, targetSize, 'bilinear');
            originalResized = processedImg;
        end
    end
end
