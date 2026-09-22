function [enhancedImg, vesselMask] = enhance_vessels(img)
% ENHANCE_VESSELS Enhances retinal blood vessels from green channel.
%
%   [enhancedImg, vesselMask] = enhance_vessels(img)
%
%   Inputs:
%       img - RGB or grayscale fundus image
%   Outputs:
%       enhancedImg - Vessel-enhanced image (uint8)
%       vesselMask  - Binary segmentation of prominent vasculature

    if size(img, 3) == 3
        % Green channel offers highest contrast for blood vessels
        greenChan = img(:,:,2);
    else
        greenChan = img;
    end
    
    greenChan = double(greenChan);
    invGreen = 255 - greenChan;
    
    % Subtract local background
    h = ones(15, 15) / 225;
    background = conv2(invGreen, h, 'same');
    vesselEnhanced = invGreen - background;
    vesselEnhanced(vesselEnhanced < 0) = 0;
    
    maxVal = max(vesselEnhanced(:));
    if maxVal > 0
        vesselEnhanced = (vesselEnhanced / maxVal) * 255;
    end
    
    enhancedImg = uint8(vesselEnhanced);
    
    if nargout > 1
        threshold = mean(vesselEnhanced(:)) + 1.5 * std(vesselEnhanced(:));
        vesselMask = vesselEnhanced > threshold;
    end
end
