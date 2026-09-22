function [label, isReferable, triagePriority, timeline, clinicalDesc] = get_severity_label(grade)
% GET_SEVERITY_LABEL Returns clinical details based on ICDR grade
%
% Inputs:
%   grade - Integer (0 to 4) representing ICDR grade
%
% Outputs:
%   label          - String, ICDR severity label
%   isReferable    - Logical, true if grade >= 2
%   triagePriority - String, urgency priority
%   timeline       - String, recommended timeline for intervention
%   clinicalDesc   - String, detailed clinical description

    % Ensure grade is valid
    if grade < 0 || grade > 4
        error('Invalid ICDR grade. Must be between 0 and 4.');
    end

    % Determine if referable (grade >= 2)
    isReferable = grade >= 2;

    % Switch on grade to set specific values
    switch grade
        case 0
            label = 'No DR';
            triagePriority = 'LOW';
            timeline = 'Annual screening';
            clinicalDesc = 'No diabetic retinopathy detected...';
        case 1
            label = 'Mild NPDR';
            triagePriority = 'LOW';
            timeline = 'Annual screening';
            clinicalDesc = 'Mild non-proliferative diabetic retinopathy with few microaneurysms...';
        case 2
            label = 'Moderate NPDR';
            triagePriority = 'HIGH';
            timeline = 'Within 7 days';
            clinicalDesc = 'Moderate non-proliferative diabetic retinopathy with microaneurysms, dot-blot hemorrhages, and hard exudates...';
        case 3
            label = 'Severe NPDR';
            triagePriority = 'URGENT';
            timeline = 'Within 48 hours';
            clinicalDesc = 'Severe non-proliferative diabetic retinopathy with extensive hemorrhages, venous beading, and/or IRMA...';
        case 4
            label = 'Proliferative DR';
            triagePriority = 'EMERGENCY';
            timeline = 'Within 24 hours';
            clinicalDesc = 'Proliferative diabetic retinopathy with neovascularization...';
    end
end
