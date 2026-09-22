function qualityResult = assess_image_quality(img)
%ASSESS_IMAGE_QUALITY Master quality function calling all sub-checks.
%   qualityResult = ASSESS_IMAGE_QUALITY(img) returns a struct with
%   quality metrics for a given RGB fundus image.
%
%   Inputs:
%       img - RGB image (uint8)
%
%   Outputs:
%       qualityResult - Struct containing:
%           gradable (logical)
%           score (double 0-1)
%           focusScore (double 0-1)
%           illuminationScore (double 0-1)
%           fovPercentage (double 0-100)
%           issues (cell array of strings)
%           recommendation (string)

    try
        % Perform focus check
        [focusScore, isSharp] = check_focus(img);
        
        % Perform illumination check
        [illumScore, isAcceptable, illumIssues] = check_illumination(img);
        
        % Perform FOV check
        [fovPct, isSufficient] = check_field_of_view(img);
        
        % Aggregate overall score
        score = 0.4 * focusScore + 0.35 * illumScore + 0.25 * (fovPct / 100);
        
        % Collect issues
        issues = illumIssues;
        if ~isSharp
            issues{end+1} = 'poor_focus';
        end
        if ~isSufficient
            issues{end+1} = 'insufficient_fov';
        end
        
        % Determine if gradable
        gradable = isSharp && isAcceptable && isSufficient;
        
        % Generate recommendation string
        if gradable
            recommendation = "Image is of sufficient quality for grading.";
        else
            if isempty(issues)
                recommendation = "Retake image: Unspecified issues";
            else
                recommendation = "Retake image: " + strjoin(string(issues), ", ");
            end
        end
        
        % Create result struct
        qualityResult = struct(...
            'gradable', gradable, ...
            'score', score, ...
            'focusScore', focusScore, ...
            'illuminationScore', illumScore, ...
            'fovPercentage', fovPct, ...
            'issues', {issues}, ...
            'recommendation', recommendation ...
        );
        
    catch ME
        warning('Error in assess_image_quality: %s', ME.message);
        qualityResult = struct(...
            'gradable', false, ...
            'score', 0, ...
            'focusScore', 0, ...
            'illuminationScore', 0, ...
            'fovPercentage', 0, ...
            'issues', {{'processing_error'}}, ...
            'recommendation', string(ME.message) ...
        );
    end
end
