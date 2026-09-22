function [illumScore, isAcceptable, issues] = check_illumination(img)
%CHECK_ILLUMINATION Evaluates the illumination of a fundus image.
%   [illumScore, isAcceptable, issues] = CHECK_ILLUMINATION(img)
%
%   Inputs:
%       img - RGB image (uint8)
%
%   Outputs:
%       illumScore   - Normalized illumination score between 0 and 1
%       isAcceptable - Logical indicating if illumination is adequate
%       issues       - Cell array of strings describing any issues found

    try
        % Convert to grayscale
        if size(img, 3) > 1
            grayImg = rgb2gray(img);
        else
            grayImg = img;
        end
        
        % Compute mean intensity and std on retinal tissue (exclude black border)
        retinaMask = grayImg > 15;
        if any(retinaMask(:))
            retinaPixels = double(grayImg(retinaMask));
            meanIntensity = mean(retinaPixels);
            stdDev = std(retinaPixels);
        else
            meanIntensity = mean(double(grayImg(:)));
            stdDev = std(double(grayImg(:)));
        end
        
        isAcceptable = true;
        issues = {};
        
        if meanIntensity < 45
            issues{end+1} = 'low_illumination';
            isAcceptable = false;
        elseif meanIntensity > 220
            issues{end+1} = 'overexposed';
            isAcceptable = false;
        end
        
        if stdDev < 8
            issues{end+1} = 'uniform_artifact';
            isAcceptable = false;
        end
        
        % Calculate illumScore: normalized 0-1 based on distance from ideal center (130)
        score = 1 - abs(meanIntensity - 130) / 130;
        illumScore = max(0, min(1, score));
        
    catch ME
        warning('Error in check_illumination: %s', ME.message);
        illumScore = 0;
        isAcceptable = false;
        issues = {'error'};
    end
end
