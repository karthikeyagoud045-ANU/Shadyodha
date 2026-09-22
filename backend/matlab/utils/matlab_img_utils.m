classdef matlab_img_utils
% MATLAB_IMG_UTILS Self-contained, pure-MATLAB image and statistical utilities.
% Provides robust fallbacks when Image Processing Toolbox or Statistics Toolbox
% are not installed.
%
% Author: DRISHTI AI / ShadYodha (SIH26038)

    methods (Static)
        function filtered = gaussfilt(img, sigma)
            % GAUSSFILT 2D Gaussian filter using separable convolution with conv2.
            if nargin < 2 || isempty(sigma)
                sigma = 1.0;
            end
            
            % Generate 1D Gaussian kernel
            halfSize = ceil(3 * sigma);
            x = -halfSize:halfSize;
            k = exp(- (x.^2) / (2 * sigma^2));
            k = k / sum(k);
            
            isUint8 = isa(img, 'uint8');
            imgD = double(img);
            
            filtered = zeros(size(imgD));
            numChannels = size(imgD, 3);
            
            for c = 1:numChannels
                % Separable 2D convolution (rows then columns)
                ch = imgD(:,:,c);
                temp = conv2(ch, k, 'same');
                filtered(:,:,c) = conv2(temp, k', 'same');
            end
            
            if isUint8
                filtered = uint8(max(0, min(255, round(filtered))));
            end
        end
        
        function [score, isSharp] = laplacian_focus(grayImg)
            % LAPLACIAN_FOCUS Evaluates focus using variance of Laplacian.
            if size(grayImg, 3) > 1
                grayImg = double(grayImg(:,:,2)); % Green channel
            else
                grayImg = double(grayImg);
            end
            
            kernel = [0 1 0; 1 -4 1; 0 1 0];
            lap = conv2(grayImg, kernel, 'same');
            lapVar = var(lap(:));
            
            isSharp = lapVar > 100;
            score = min(1.0, max(0.0, lapVar / 500));
        end
        
        function enhanced = clahe(img, numTiles, clipLimit)
            % CLAHE Simple, robust contrast-limited adaptive histogram equalization.
            if nargin < 2 || isempty(numTiles)
                numTiles = [8, 8];
            end
            if nargin < 3 || isempty(clipLimit)
                clipLimit = 0.02;
            end
            
            isUint8 = isa(img, 'uint8');
            imgD = double(img);
            if isUint8
                imgD = imgD / 255.0;
            end
            
            % If RGB, process each channel
            numChannels = size(imgD, 3);
            enhancedD = zeros(size(imgD));
            
            for c = 1:numChannels
                ch = imgD(:,:,c);
                [rows, cols] = size(ch);
                tileH = max(1, floor(rows / numTiles(1)));
                tileW = max(1, floor(cols / numTiles(2)));
                
                chOut = ch;
                % Local contrast enhancement tile by tile
                for r = 1:numTiles(1)
                    rIdx = ((r-1)*tileH + 1):min(rows, r*tileH);
                    for col = 1:numTiles(2)
                        cIdx = ((col-1)*tileW + 1):min(cols, col*tileW);
                        tile = ch(rIdx, cIdx);
                        
                        % Tile histogram equalization with clipping
                        tMin = min(tile(:));
                        tMax = max(tile(:));
                        if (tMax - tMin) > 1e-4
                            normalized = (tile - tMin) / (tMax - tMin);
                            gamma = 1.0 + clipLimit * 10;
                            tileEq = normalized.^gamma;
                            chOut(rIdx, cIdx) = tileEq * (tMax - tMin) + tMin;
                        end
                    end
                end
                
                % Blend slightly with original to preserve natural tone
                enhancedD(:,:,c) = 0.7 * chOut + 0.3 * ch;
            end
            
            if isUint8
                enhanced = uint8(max(0, min(255, round(enhancedD * 255.0))));
            else
                enhanced = max(0, min(1.0, enhancedD));
            end
        end
        
        function tophat = morph_tophat(grayImg, radius)
            % MORPH_TOPHAT White/Black top-hat transform using local min/max filter.
            if nargin < 2 || isempty(radius)
                radius = 5;
            end
            grayD = double(grayImg);
            
            % Subsample if large for performance
            [origR, origC] = size(grayD);
            scale = 1;
            if max(origR, origC) > 300
                scale = 300 / max(origR, origC);
                grayD = imresize(grayD, scale);
                radius = max(2, round(radius * scale));
            end
            
            % Local min then max (opening)
            opened = matlab_img_utils.local_min_max_filter(grayD, radius);
            tophatSub = max(0, grayD - opened);
            
            if scale ~= 1
                tophat = imresize(tophatSub, [origR, origC], 'bilinear');
            else
                tophat = tophatSub;
            end
        end
        
        function result = local_min_max_filter(img, radius)
            % 2D structural element min then max filter
            [rows, cols] = size(img);
            
            % Step 1: Local minimum (erosion)
            minImg = img;
            step = max(1, floor(radius / 2));
            for r = 1:step:rows
                r1 = max(1, r - radius);
                r2 = min(rows, r + radius);
                for c = 1:step:cols
                    c1 = max(1, c - radius);
                    c2 = min(cols, c + radius);
                    subWin = img(r1:r2, c1:c2);
                    minVal = min(subWin(:));
                    minImg(r:min(rows, r+step-1), c:min(cols, c+step-1)) = minVal;
                end
            end
            
            % Step 2: Local maximum (dilation on eroded img)
            result = minImg;
            for r = 1:step:rows
                r1 = max(1, r - radius);
                r2 = min(rows, r + radius);
                for c = 1:step:cols
                    c1 = max(1, c - radius);
                    c2 = min(cols, c + radius);
                    subWin = minImg(r1:r2, c1:c2);
                    maxVal = max(subWin(:));
                    result(r:min(rows, r+step-1), c:min(cols, c+step-1)) = maxVal;
                end
            end
        end
        
        function bboxes = find_blobs(binaryMask, minArea, maxArea)
            % FIND_BLOBS Connected component labeling returning bounding boxes [x, y, w, h]
            if nargin < 2, minArea = 4; end
            if nargin < 3, maxArea = 5000; end
            
            [rows, cols] = size(binaryMask);
            visited = false(rows, cols);
            bboxes = {};
            
            for r = 1:2:rows
                for c = 1:2:cols
                    if binaryMask(r, c) && ~visited(r, c)
                        % Flood fill BFS
                        queue = zeros(500, 2);
                        queue(1, :) = [r, c];
                        visited(r, c) = true;
                        qHead = 1;
                        qTail = 1;
                        
                        rMin = r; rMax = r;
                        cMin = c; cMax = c;
                        area = 0;
                        
                        while qHead <= qTail && area < maxArea
                            currR = queue(qHead, 1);
                            currC = queue(qHead, 2);
                            qHead = qHead + 1;
                            area = area + 1;
                            
                            rMin = min(rMin, currR);
                            rMax = max(rMax, currR);
                            cMin = min(cMin, currC);
                            cMax = max(cMax, currC);
                            
                            % 4-connected neighbors
                            neighbors = [currR-1, currC; currR+1, currC; currR, currC-1; currR, currC+1];
                            for nIdx = 1:4
                                nr = neighbors(nIdx, 1);
                                nc = neighbors(nIdx, 2);
                                if nr >= 1 && nr <= rows && nc >= 1 && nc <= cols
                                    if binaryMask(nr, nc) && ~visited(nr, nc)
                                        visited(nr, nc) = true;
                                        if qTail < size(queue, 1)
                                            qTail = qTail + 1;
                                            queue(qTail, :) = [nr, nc];
                                        end
                                    end
                                end
                            end
                        end
                        
                        if area >= minArea && area <= maxArea
                            w = cMax - cMin + 1;
                            h = rMax - rMin + 1;
                            bboxes{end+1} = [cMin, rMin, w, h]; %#ok<AGROW>
                        end
                    end
                end
            end
        end
        
        function confMat = confusion_matrix(trueLabels, predLabels, numClasses)
            % CONFUSION_MATRIX Compute confusion matrix for 0-indexed integer labels.
            if nargin < 3, numClasses = 5; end
            confMat = zeros(numClasses, numClasses);
            for i = 1:numel(trueLabels)
                t = trueLabels(i);
                p = predLabels(i);
                if t >= 0 && t < numClasses && p >= 0 && p < numClasses
                    confMat(t + 1, p + 1) = confMat(t + 1, p + 1) + 1;
                end
            end
        end
        
        function [fpr, tpr, thresholds, auc] = roc_curve(labels, scores)
            % ROC_CURVE Calculates ROC curve and AUC without statistics toolbox.
            labels = double(labels(:) > 0);
            scores = double(scores(:));
            
            [sortedScores, sortIdx] = sort(scores, 'descend');
            sortedLabels = labels(sortIdx);
            
            numPos = sum(sortedLabels == 1);
            numNeg = sum(sortedLabels == 0);
            
            if numPos == 0 || numNeg == 0
                fpr = [0; 1];
                tpr = [0; 1];
                thresholds = [1; 0];
                auc = 0.5;
                return;
            end
            
            tpr = [0; cumsum(sortedLabels == 1) / numPos];
            fpr = [0; cumsum(sortedLabels == 0) / numNeg];
            thresholds = [sortedScores(1) + 0.01; sortedScores];
            
            % Trapezoidal rule for AUC
            auc = trapz(fpr, tpr);
            auc = max(0, min(1.0, auc));
        end
    end
end
