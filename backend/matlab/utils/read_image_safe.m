function [img, success, errMsg] = read_image_safe(imagePath)
%READ_IMAGE_SAFE Safe image loading utility.
%
%   [img, success, errMsg] = read_image_safe(imagePath)
%   Loads an image from imagePath, validates its format, size, and
%   converts it to RGB if it is grayscale.
%
%   Inputs:
%       imagePath - string or char array, path to the image
%
%   Outputs:
%       img     - uint8 RGB image (if successful), else empty
%       success - logical, true if successful, false otherwise
%       errMsg  - string, error description if failed

    img = [];
    success = false;
    errMsg = "";

    try
        % Check if a web URL was provided (or accidentally prefixed with a local path)
        imagePathStr = char(imagePath);
        httpIdx = strfind(imagePathStr, 'http://');
        httpsIdx = strfind(imagePathStr, 'https://');
        urlIdx = [httpIdx, httpsIdx];
        if ~isempty(urlIdx)
            urlStart = min(urlIdx);
            actualUrl = imagePathStr(urlStart:end);
            tempPath = fullfile(tempdir, 'drishti_downloaded_fundus.jpg');
            try
                websave(tempPath, actualUrl);
                imagePath = tempPath;
            catch webErr
                % Fallback via curl
                [status, ~] = system(sprintf('curl -s -L -o "%s" "%s"', tempPath, actualUrl));
                if status == 0 && isfile(tempPath)
                    imagePath = tempPath;
                else
                    errMsg = "Failed to download image from URL: " + string(webErr.message);
                    return;
                end
            end
        end

        % Validate that imagePath exists
        if ~isfile(imagePath)
            errMsg = "File does not exist: " + string(imagePath);
            return;
        end

        % Validate extension
        [~, ~, ext] = fileparts(imagePath);
        ext = lower(ext);
        validExts = {'.jpg', '.jpeg', '.png', '.tiff', '.tif'};
        if ~ismember(ext, validExts)
            errMsg = "Invalid image extension: " + string(ext);
            return;
        end

        % Try imread
        try
            loadedImg = imread(imagePath);
        catch ME
            errMsg = "Failed to read image: " + string(ME.message);
            return;
        end

        % Check if it's 2D (grayscale) or indexed
        if ismatrix(loadedImg)
            % Convert grayscale to RGB
            loadedImg = repmat(loadedImg, [1, 1, 3]);
        elseif ndims(loadedImg) == 3 && size(loadedImg, 3) == 1
            loadedImg = repmat(loadedImg, [1, 1, 3]);
        end

        % Validate image is at least 100x100 pixels
        if size(loadedImg, 1) < 100 || size(loadedImg, 2) < 100
            errMsg = "Image size is less than 100x100 pixels";
            return;
        end

        % Return successful result
        img = loadedImg;
        success = true;

    catch ME
        errMsg = "Unexpected error: " + string(ME.message);
    end
end
