function [calibratedProb, T] = temperature_scale(logits, trueLabels, T)
% TEMPERATURE_SCALE Calibrates model confidence via Temperature Scaling.
%
%   [calibratedProb, T] = temperature_scale(logits, trueLabels, T)

    if nargin < 3 || isempty(T)
        T = 1.5;
    end

    if nargin >= 2 && ~isempty(trueLabels)
        tCandidates = linspace(0.5, 3.0, 50);
        bestNLL = inf;
        bestT = 1.5;
        
        if min(trueLabels(:)) == 0
            labels1 = trueLabels + 1;
        else
            labels1 = trueLabels;
        end
        
        for t = tCandidates
            scaled = logits / t;
            scaled = scaled - max(scaled, [], 2);
            probs = exp(scaled) ./ sum(exp(scaled), 2);
            
            idx = sub2ind(size(probs), (1:size(logits, 1))', labels1(:));
            nll = -mean(log(max(probs(idx), 1e-7)));
            if nll < bestNLL
                bestNLL = nll;
                bestT = t;
            end
        end
        T = bestT;
    end

    scaled = logits / T;
    scaled = scaled - max(scaled, [], 2);
    calibratedProb = exp(scaled) ./ sum(exp(scaled), 2);
end
