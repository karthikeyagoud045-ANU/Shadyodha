function annotatedImg = annotate_lesions(img, lesions, outputDir)
% ANNOTATE_LESIONS Annotates an image with bounding boxes for detected lesions.
%
%   annotatedImg = annotate_lesions(img, lesions, outputDir)
%   img: Original fundus image (uint8 RGB)
%   lesions: Struct array from detect_lesions
%   outputDir: Directory to save the annotated image
%
%   annotatedImg: Image with drawn rectangles and labels

    annotatedImg = img;
    
    if isempty(lesions)
        return;
    end
    
    try
        for i = 1:length(lesions)
            type = lesions(i).type;
            regions = lesions(i).regions;
            count = lesions(i).count;
            
            % Determine color based on lesion type
            switch type
                case 'microaneurysm'
                    color = [255, 0, 0]; % Red
                case 'hemorrhage'
                    color = [200, 0, 0]; % Dark Red
                case 'hard_exudate'
                    color = [255, 255, 0]; % Yellow
                case 'soft_exudate'
                    color = [255, 255, 255]; % White
                otherwise
                    color = [0, 255, 0]; % Green default
            end
            
            % Draw bounding boxes
            if exist('insertShape', 'file') && exist('insertText', 'file')
                for j = 1:length(regions)
                    bbox = regions{j};
                    annotatedImg = insertShape(annotatedImg, 'Rectangle', bbox, ...
                        'Color', color, 'LineWidth', 2);
                end
                
                % Add label for the lesion type with count
                label = sprintf('%s: %d', strrep(type, '_', ' '), count);
                
                if ~isempty(regions)
                    firstBbox = regions{1};
                    textPos = [firstBbox(1), max(1, firstBbox(2) - 20)];
                else
                    textPos = [10, 10 + (i-1)*30];
                end
                
                annotatedImg = insertText(annotatedImg, textPos, label, ...
                    'FontSize', 14, 'BoxColor', color, 'BoxOpacity', 0.6, 'TextColor', 'black');
            else
                % Pure MATLAB drawing fallback
                [imgH, imgW, ~] = size(annotatedImg);
                for j = 1:length(regions)
                    bbox = regions{j};
                    x1 = max(1, round(bbox(1)));
                    y1 = max(1, round(bbox(2)));
                    x2 = min(imgW, x1 + round(bbox(3)));
                    y2 = min(imgH, y1 + round(bbox(4)));
                    for c = 1:3
                        annotatedImg(y1:min(imgH, y1+1), x1:x2, c) = color(c);
                        annotatedImg(max(1, y2-1):y2, x1:x2, c) = color(c);
                        annotatedImg(y1:y2, x1:min(imgW, x1+1), c) = color(c);
                        annotatedImg(y1:y2, max(1, x2-1):x2, c) = color(c);
                    end
                end
            end
        end
        
        % Save image if output directory is provided
        if nargin >= 3 && ~isempty(outputDir)
            if ~exist(outputDir, 'dir')
                mkdir(outputDir);
            end
            
            outputPath = fullfile(outputDir, 'lesion_annotation.png');
            imwrite(annotatedImg, outputPath);
        end
    catch ME
        warning('annotate_lesions:Error', 'Error annotating lesions: %s', ME.message);
    end
end
