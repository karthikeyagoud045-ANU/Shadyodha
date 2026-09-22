function [isValid, report] = validate_manifest(manifestPath, imagesDir)
% VALIDATE_MANIFEST Validates dataset CSV manifest and image existence.
%
%   [isValid, report] = validate_manifest(manifestPath, imagesDir)

    if nargin < 2
        imagesDir = fileparts(manifestPath);
    end

    report = struct();
    report.totalEntries = 0;
    report.validImages = 0;
    report.missingImages = {};
    report.gradeDistribution = zeros(1, 5);

    if ~isfile(manifestPath)
        isValid = false;
        report.error = sprintf('Manifest file not found: %s', manifestPath);
        return;
    end

    fid = fopen(manifestPath, 'r');
    if fid == -1
        isValid = false;
        report.error = sprintf('Cannot open manifest file: %s', manifestPath);
        return;
    end

    headerLine = fgetl(fid);
    lineNum = 1;
    validCount = 0;

    while ~feof(fid)
        line = strtrim(fgetl(fid));
        if isempty(line)
            continue;
        end
        lineNum = lineNum + 1;
        tokens = strsplit(line, ',');
        if length(tokens) >= 2
            imgId = strtrim(tokens{1});
            gradeStr = strtrim(tokens{2});
            grade = str2double(gradeStr);

            imgFound = false;
            exts = {'', '.png', '.jpg', '.jpeg'};
            for e = 1:length(exts)
                testPath = fullfile(imagesDir, [imgId exts{e}]);
                if isfile(testPath)
                    imgFound = true;
                    break;
                end
            end

            if imgFound
                validCount = validCount + 1;
                if ~isnan(grade) && grade >= 0 && grade <= 4
                    report.gradeDistribution(grade + 1) = report.gradeDistribution(grade + 1) + 1;
                end
            else
                report.missingImages{end + 1} = imgId;
            end
        end
    end
    fclose(fid);

    report.totalEntries = lineNum - 1;
    report.validImages = validCount;
    isValid = isempty(report.missingImages) && (validCount > 0);
end
