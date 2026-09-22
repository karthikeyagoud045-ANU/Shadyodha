function [calibratedProb, calibParams] = calibrate_confidence(rawProbs, trueLabels, method)
%CALIBRATE_CONFIDENCE Calibrates raw softmax probabilities
%   [calibratedProb, calibParams] = calibrate_confidence(rawProbs, trueLabels, method)
%   rawProbs: Nx5 matrix of softmax probabilities (N samples, 5 classes)
%   trueLabels: Nx1 vector of true class labels (0-4), leave empty [] for inference
%   method: 'isotonic' (default) or 'platt'

    if nargin < 3
        method = 'isotonic';
    end

    [N, C] = size(rawProbs);
    calibratedProb = zeros(N, C);

    if isempty(trueLabels)
        % Inference mode
        if isstruct(method)
            calibParams = method;
            method = calibParams.method;
        else
            error('For inference, provide calibParams struct as the third argument.');
        end
        
        for c = 1:C
            probs_c = rawProbs(:, c);
            if strcmp(method, 'isotonic')
                % Linear interpolation using breakpoints
                calibratedProb(:, c) = interp1(calibParams.breakpoints{c}, calibParams.values{c}, probs_c, 'linear', 'extrap');
            elseif strcmp(method, 'platt')
                % Platt scaling
                a = calibParams.a(c);
                b = calibParams.b(c);
                % Convert back to logit
                logit = log(probs_c ./ (1 - probs_c + eps));
                calibratedProb(:, c) = 1 ./ (1 + exp(a * logit + b));
            end
        end
        
        % Normalize to sum to 1
        calibratedProb = max(calibratedProb, 0);
        calibratedProb = calibratedProb ./ (sum(calibratedProb, 2) + eps);
        return;
    end
    
    % Training mode
    calibParams.method = method;
    if strcmp(method, 'isotonic')
        calibParams.breakpoints = cell(C, 1);
        calibParams.values = cell(C, 1);
    else
        calibParams.a = zeros(C, 1);
        calibParams.b = zeros(C, 1);
    end

    for c = 1:C
        probs_c = rawProbs(:, c);
        y_c = (trueLabels == (c - 1)); % Binary target for this class
        
        if strcmp(method, 'isotonic')
            % Sort by predicted probability
            [sorted_probs, sort_idx] = sort(probs_c);
            sorted_y = double(y_c(sort_idx));
            
            % Simple Pool Adjacent Violators (PAV) algorithm
            n = length(sorted_probs);
            p = sorted_y;
            w = ones(size(p));
            block_count = 1;
            for i = 2:n
                block_count = block_count + 1;
                p(block_count) = p(i);
                w(block_count) = 1;
                while block_count > 1 && p(block_count-1) >= p(block_count)
                    % Merge
                    p(block_count-1) = (p(block_count-1)*w(block_count-1) + p(block_count)*w(block_count)) / (w(block_count-1) + w(block_count));
                    w(block_count-1) = w(block_count-1) + w(block_count);
                    block_count = block_count - 1;
                end
            end
            
            % Reconstruct
            iso_y = zeros(n, 1);
            idx = 1;
            for i = 1:block_count
                iso_y(idx:idx+w(i)-1) = p(i);
                idx = idx + w(i);
            end
            
            % Ensure strictly increasing breakpoints for interpolation
            [unique_probs, unique_idx] = unique(sorted_probs);
            calibParams.breakpoints{c} = unique_probs;
            calibParams.values{c} = iso_y(unique_idx);
            
            % Apply to get calibrated
            calibratedProb(sort_idx, c) = iso_y;
            
        elseif strcmp(method, 'platt')
            % Optimize a, b using NLL minimization (Platt scaling)
            logit = log(probs_c ./ (1 - probs_c + eps));
            y_double = double(y_c);
            
            % NLL loss function for Platt scaling
            loss_fn = @(params) -sum( ...
                y_double .* log(1 ./ (1 + exp(params(1) * logit + params(2))) + eps) + ...
                (1 - y_double) .* log(1 - 1 ./ (1 + exp(params(1) * logit + params(2))) + eps));
                                    
            % Fminsearch to optimise a and b
            opts = optimset('Display', 'off');
            best_params = fminsearch(loss_fn, [1, 0], opts);
            
            calibParams.a(c) = best_params(1);
            calibParams.b(c) = best_params(2);
            
            calibratedProb(:, c) = 1 ./ (1 + exp(best_params(1) * logit + best_params(2)));
        end
    end
    
    % Normalize to sum to 1
    calibratedProb = max(calibratedProb, 0);
    calibratedProb = calibratedProb ./ (sum(calibratedProb, 2) + eps);
end
