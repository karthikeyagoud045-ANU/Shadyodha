function lesions = detect_lesions(img, preprocessedImg)
% DETECT_LESIONS Detects various Diabetic Retinopathy lesions in a fundus image.
%
%   lesions = detect_lesions(img, preprocessedImg)
%   img: Original fundus image (uint8 RGB, resized)
%   preprocessedImg: Preprocessed (e.g., CLAHE) image (uint8 RGB)
%
%   lesions: Struct array containing detected lesion types, counts, regions,
%            and confidence. Types include microaneurysm, hemorrhage, 
%            hard_exudate, and soft_exudate.

    try
        if size(img, 3) == 3
            greenCh = img(:, :, 2);
        else
            greenCh = img;
        end
        
        if size(preprocessedImg, 3) == 3
            greenPre = preprocessedImg(:, :, 2);
        else
            greenPre = preprocessedImg;
        end
        
        % Initialize output struct array
        lesions = struct('type', {}, 'count', {}, 'regions', {}, 'confidence', {});
        lesionIdx = 1;
        
        % Check if Image Processing Toolbox functions exist
        if exist('imtophat', 'file') && exist('regionprops', 'file') && exist('strel', 'file')
            % 1. MICROANEURYSMS (small red dots, 2-10px diameter)
            tophatMA = imtophat(imcomplement(greenPre), strel('disk', 6));
            binaryMA = tophatMA > (0.15 * max(tophatMA(:)));
            binaryMA = bwareaopen(binaryMA, 4);
            binaryMA = binaryMA & ~bwareaopen(binaryMA, 80);
            
            statsMA = regionprops(binaryMA, 'BoundingBox', 'Area');
            if ~isempty(statsMA)
                bboxes = {statsMA.BoundingBox};
                lesions(lesionIdx).type = 'microaneurysm';
                lesions(lesionIdx).count = length(statsMA);
                lesions(lesionIdx).regions = bboxes;
                lesions(lesionIdx).confidence = 0.65;
                lesionIdx = lesionIdx + 1;
            end
        
            % 2. HEMORRHAGES (larger dark red regions)
            bottomhatHEM = imbothat(greenPre, strel('disk', 15));
            binaryHEM = bottomhatHEM > (0.2 * max(bottomhatHEM(:)));
            statsHEM_all = regionprops(binaryHEM, 'BoundingBox', 'Area', 'Eccentricity');
            bboxesHEM = {};
            for i = 1:length(statsHEM_all)
                if statsHEM_all(i).Area >= 80 && statsHEM_all(i).Area <= 5000 && statsHEM_all(i).Eccentricity <= 0.95
                    bboxesHEM{end+1} = statsHEM_all(i).BoundingBox; %#ok<AGROW>
                end
            end
            if ~isempty(bboxesHEM)
                lesions(lesionIdx).type = 'hemorrhage';
                lesions(lesionIdx).count = length(bboxesHEM);
                lesions(lesionIdx).regions = bboxesHEM;
                lesions(lesionIdx).confidence = 0.70;
                lesionIdx = lesionIdx + 1;
            end
        
            % 3. HARD EXUDATES (bright yellowish-white)
            if size(img, 3) == 3 && exist('rgb2lab', 'file')
                labImg = rgb2lab(img);
                L = labImg(:,:,1);
                b = labImg(:,:,3);
                binaryHE = (L > 65) & (b > 10);
            else
                binaryHE = greenPre > 200;
            end
            binaryHE = imopen(binaryHE, strel('disk', 2));
            binaryHE = bwareaopen(binaryHE, 20);
            statsHE = regionprops(binaryHE, 'BoundingBox', 'Area');
            bboxesHE = {};
            for i = 1:length(statsHE)
                if statsHE(i).Area < 10000
                    bboxesHE{end+1} = statsHE(i).BoundingBox; %#ok<AGROW>
                end
            end
            if ~isempty(bboxesHE)
                lesions(lesionIdx).type = 'hard_exudate';
                lesions(lesionIdx).count = length(bboxesHE);
                lesions(lesionIdx).regions = bboxesHE;
                lesions(lesionIdx).confidence = 0.75;
                lesionIdx = lesionIdx + 1;
            end
        
            % 4. SOFT EXUDATES (cotton wool spots)
            if size(img, 3) == 3
                grayImg = rgb2gray(img);
            else
                grayImg = img;
            end
            binarySE = grayImg > 180;
            statsSE_all = regionprops(binarySE, 'BoundingBox', 'Area', 'Solidity');
            bboxesSE = {};
            for i = 1:length(statsSE_all)
                if statsSE_all(i).Area > 200 && statsSE_all(i).Area < 10000 && statsSE_all(i).Solidity < 0.9
                    bboxesSE{end+1} = statsSE_all(i).BoundingBox; %#ok<AGROW>
                end
            end
            if ~isempty(bboxesSE)
                lesions(lesionIdx).type = 'soft_exudate';
                lesions(lesionIdx).count = length(bboxesSE);
                lesions(lesionIdx).regions = bboxesSE;
                lesions(lesionIdx).confidence = 0.60;
            end
        else
            % ==================== PURE MATLAB FALLBACK ====================
            % 1. Microaneurysms via top-hat
            tophatMA = matlab_img_utils.morph_tophat(255 - double(greenPre), 4);
            maxValMA = max(tophatMA(:));
            if maxValMA > 10
                binaryMA = tophatMA > (0.25 * maxValMA);
                bboxesMA = matlab_img_utils.find_blobs(binaryMA, 4, 100);
                if ~isempty(bboxesMA)
                    lesions(lesionIdx).type = 'microaneurysm';
                    lesions(lesionIdx).count = length(bboxesMA);
                    lesions(lesionIdx).regions = bboxesMA;
                    lesions(lesionIdx).confidence = 0.65;
                    lesionIdx = lesionIdx + 1;
                end
            end
            
            % 2. Hemorrhages via larger structure top-hat
            tophatHEM = matlab_img_utils.morph_tophat(255 - double(greenPre), 8);
            maxValHEM = max(tophatHEM(:));
            if maxValHEM > 10
                binaryHEM = tophatHEM > (0.30 * maxValHEM);
                bboxesHEM = matlab_img_utils.find_blobs(binaryHEM, 30, 1500);
                if ~isempty(bboxesHEM)
                    lesions(lesionIdx).type = 'hemorrhage';
                    lesions(lesionIdx).count = length(bboxesHEM);
                    lesions(lesionIdx).regions = bboxesHEM;
                    lesions(lesionIdx).confidence = 0.70;
                    lesionIdx = lesionIdx + 1;
                end
            end
            
            % 3. Hard Exudates (bright yellowish regions)
            if size(img, 3) == 3
                rCh = double(img(:,:,1));
                gCh = double(img(:,:,2));
                bCh = double(img(:,:,3));
                binaryHE = (rCh > 150) & (gCh > 120) & (bCh < 160) & ((rCh + gCh) > 300);
            else
                binaryHE = double(greenPre) > 190;
            end
            bboxesHE = matlab_img_utils.find_blobs(binaryHE, 15, 2000);
            if ~isempty(bboxesHE)
                lesions(lesionIdx).type = 'hard_exudate';
                lesions(lesionIdx).count = length(bboxesHE);
                lesions(lesionIdx).regions = bboxesHE;
                lesions(lesionIdx).confidence = 0.75;
                lesionIdx = lesionIdx + 1;
            end
            
            % 4. Soft Exudates (cotton wool spots - bright gray/white)
            if size(img, 3) == 3
                grayImg = double(rgb2gray(img));
            else
                grayImg = double(img);
            end
            binarySE = grayImg > 210;
            bboxesSE = matlab_img_utils.find_blobs(binarySE, 40, 3000);
            if ~isempty(bboxesSE)
                lesions(lesionIdx).type = 'soft_exudate';
                lesions(lesionIdx).count = length(bboxesSE);
                lesions(lesionIdx).regions = bboxesSE;
                lesions(lesionIdx).confidence = 0.60;
            end
        end
        
    catch ME
        warning('detect_lesions:Error', 'Error detecting lesions: %s', ME.message);
        lesions = struct('type', {}, 'count', {}, 'regions', {}, 'confidence', {});
    end
end
