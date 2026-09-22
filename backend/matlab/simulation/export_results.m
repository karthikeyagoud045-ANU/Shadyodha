function outputPath = export_results(results, outputPath)
% EXPORT_RESULTS  Export simulation results to a JSON file.
%
%   export_results(results, outputPath)
%
%   Inputs:
%     results    - struct with simulation results from run_simulation
%     outputPath - Full path to output JSON file (default: simulation_results.json)
%
%   Outputs:
%     outputPath - Path to the written JSON file
%
%   Author: DRISHTI AI / ShadYodha (SIH26038)

    if nargin < 2 || isempty(outputPath)
        outputPath = fullfile(pwd, 'simulation_results.json');
    end
    
    % Ensure output directory exists
    outputDir = fileparts(outputPath);
    if ~isempty(outputDir) && ~isfolder(outputDir)
        mkdir(outputDir);
    end
    
    % Add metadata
    results.exportedAt = datestr(now, 'yyyy-mm-ddTHH:MM:SS');
    results.platform = 'DRISHTI AI Operational Simulator';
    results.version = '1.0';
    
    % Convert to JSON
    try
        jsonStr = jsonencode(results, 'PrettyPrint', true);
    catch
        jsonStr = jsonencode(results);
        % Manual pretty-print fallback
        jsonStr = strrep(jsonStr, ',', sprintf(',\n'));
        jsonStr = strrep(jsonStr, '{', sprintf('{\n'));
        jsonStr = strrep(jsonStr, '}', sprintf('\n}'));
    end
    
    % Write file
    fid = fopen(outputPath, 'w', 'n', 'UTF-8');
    if fid == -1
        error('export_results:writeError', 'Cannot open file for writing: %s', outputPath);
    end
    
    cleanupObj = onCleanup(@() fclose(fid));
    fprintf(fid, '%s', jsonStr);
    
    logger.info('Simulation results exported to: %s', outputPath);
end
