classdef logger
    %LOGGER Logging utility class for DRISHTI AI.
    %   Provides static methods for info, warn, error, and debug logging.
    
    properties (Constant, Access = private)
        LOG_VAR_NAME = 'drishti_logger_filePath';
    end
    
    methods (Static)
        function setLogFile(path)
            %SETLOGFILE Sets the persistent log file path.
            setenv('DRISHTI_LOGGER_FILEPATH', path);
            try
                % Create directory if it doesn't exist
                [dirPath, ~, ~] = fileparts(path);
                if ~isempty(dirPath) && ~exist(dirPath, 'dir')
                    mkdir(dirPath);
                end
            catch
                warning('Failed to create log directory: %s', dirPath);
            end
        end
        
        function info(msg, varargin)
            %INFO Logs an info message.
            logger.logMessage('INFO', msg, varargin{:});
        end
        
        function warn(msg, varargin)
            %WARN Logs a warning message.
            logger.logMessage('WARN', msg, varargin{:});
        end
        
        function error(msg, varargin)
            %ERROR Logs an error message.
            logger.logMessage('ERROR', msg, varargin{:});
        end
        
        function debug(msg, varargin)
            %DEBUG Logs a debug message if DRISHTI_DEBUG is set.
            if ~isempty(getenv('DRISHTI_DEBUG'))
                logger.logMessage('DEBUG', msg, varargin{:});
            end
        end
    end
    
    methods (Static, Access = private)
        function logMessage(level, msg, varargin)
            %LOGMESSAGE Internal method to format and write log messages.
            timestamp = datestr(now, 'yyyy-mm-dd HH:MM:SS');
            
            % Format message if varargin is provided
            if ~isempty(varargin)
                formattedMsg = sprintf(msg, varargin{:});
            else
                formattedMsg = msg;
            end
            
            logStr = sprintf('[%s %s] %s\n', level, timestamp, formattedMsg);
            
            % Print to console
            fprintf('%s', logStr);
            
            % Write to log file if set
            logFilePath = getenv('DRISHTI_LOGGER_FILEPATH');
            if ~isempty(logFilePath)
                try
                    fid = fopen(logFilePath, 'a');
                    if fid ~= -1
                        fprintf(fid, '%s', logStr);
                        fclose(fid);
                    end
                catch
                    % Ignore file write errors
                end
            end
        end
    end
end
