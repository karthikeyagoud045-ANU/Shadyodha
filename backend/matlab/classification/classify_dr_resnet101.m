function result = classify_dr_resnet101(img, net, calibParams, thresholdParams)
% CLASSIFY_DR_RESNET101 Classifies DR severity using fine-tuned ResNet-101.
%
%   result = classify_dr_resnet101(img, net, calibParams, thresholdParams)

    if nargin < 3 || isempty(calibParams)
        calibParams = struct();
    end
    if nargin < 4 || isempty(thresholdParams)
        thresholdParams = struct('threshold', 0.42);
    end

    result = classify_dr(img, net, calibParams, thresholdParams);
end
