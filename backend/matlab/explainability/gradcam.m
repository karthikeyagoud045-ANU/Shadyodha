function [gradcamMap, resizedMap] = gradcam(net, img, classIdx, featureLayer)
% GRADCAM Generates Grad-CAM activation heatmap for a target class.
%
%   [gradcamMap, resizedMap] = gradcam(net, img, classIdx, featureLayer)

    if nargin < 4 || isempty(featureLayer)
        featureLayer = 'res5c_relu';
    end
    if nargin < 3
        classIdx = [];
    end

    [gradcamMap, resizedMap] = generate_gradcam(net, img, classIdx, featureLayer);
end
