function [outFile] = write_result_json(outputDir, resultStruct)
%WRITE_RESULT_JSON JSON result writer.
%
%   outFile = write_result_json(outputDir, resultStruct)
%   Takes a MATLAB struct and writes it as formatted JSON to outputDir/result.json.
%   Uses jsonencode with PrettyPrint for R2024a.
%
%   Inputs:
%       outputDir    - string or char array, path to the output directory
%       resultStruct - struct, data to be converted to JSON
%
%   Outputs:
%       outFile      - string, full path to the written JSON file

    try
        % Ensure output directory exists
        if ~exist(outputDir, 'dir')
            mkdir(outputDir);
        end
        
        outFile = fullfile(outputDir, 'result.json');
        
        % Try to use PrettyPrint (R2024a supports this)
        try
            jsonStr = jsonencode(resultStruct, 'PrettyPrint', true);
        catch
            % Fallback for older versions if PrettyPrint fails
            jsonStr = jsonencode(resultStruct);
            % Simple formatting replacement (not perfect, but basic)
            jsonStr = strrep(jsonStr, ',', sprintf(',\n  '));
            jsonStr = strrep(jsonStr, '{', sprintf('{\n  '));
            jsonStr = strrep(jsonStr, '}', sprintf('\n}'));
        end
        
        % Write to file with UTF-8 encoding
        fid = fopen(outFile, 'w', 'n', 'UTF-8');
        if fid == -1
            error('Failed to open file for writing: %s', outFile);
        end
        
        fprintf(fid, '%s', jsonStr);
        fclose(fid);
        
    catch ME
        error('write_result_json:WriteError', 'Error writing JSON result: %s', ME.message);
    end
end
