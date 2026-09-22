function generate_report(metrics, outputDir)
%GENERATE_REPORT Generates a markdown evaluation report
%   generate_report(metrics, outputDir)

    if nargin < 2
        outputDir = pwd;
    end
    
    reportPath = fullfile(outputDir, 'evaluation_report.md');
    fid = fopen(reportPath, 'w');
    if fid == -1
        error('Cannot open file for writing: %s', reportPath);
    end
    
    fprintf(fid, '# DRISHTI AI Model Evaluation Report\n\n');
    fprintf(fid, '**Model Version**: %s\n', metrics.modelVersion);
    fprintf(fid, '**Evaluation Date**: %s\n', metrics.evaluatedAt);
    fprintf(fid, '**Test Dataset**: %s\n\n', metrics.datasets.test);
    
    fprintf(fid, '## Binary Referable Metrics (Grade >= 2)\n\n');
    
    targetsMet = metrics.referableMetrics.targets.met;
    if targetsMet
        fprintf(fid, '> **OVERALL STATUS**: :white_check_mark: PASS (Met PS Targets)\n\n');
    else
        fprintf(fid, '> **OVERALL STATUS**: :x: FAIL (Did not meet PS Targets)\n\n');
    end
    
    fprintf(fid, '| Metric | Value | Target | Status |\n');
    fprintf(fid, '|---|---|---|---|\n');
    
    % Sens
    sens = metrics.referableMetrics.sensitivity;
    sensTarget = metrics.referableMetrics.targets.sensitivityMin;
    sensStatus = ifelse(sens >= sensTarget, 'PASS', 'FAIL');
    fprintf(fid, '| Sensitivity | %.4f | >= %.2f | %s |\n', sens, sensTarget, sensStatus);
    
    % Spec
    spec = metrics.referableMetrics.specificity;
    specTarget = metrics.referableMetrics.targets.specificityMin;
    specStatus = ifelse(spec >= specTarget, 'PASS', 'FAIL');
    fprintf(fid, '| Specificity | %.4f | >= %.2f | %s |\n', spec, specTarget, specStatus);
    
    fprintf(fid, '| PPV | %.4f | N/A | N/A |\n', metrics.referableMetrics.ppv);
    fprintf(fid, '| NPV | %.4f | N/A | N/A |\n', metrics.referableMetrics.npv);
    fprintf(fid, '| AUC | %.4f | N/A | N/A |\n', metrics.referableMetrics.auc);
    fprintf(fid, '| Prevalence | %.4f | N/A | N/A |\n\n', metrics.referableMetrics.prevalence);
    
    fprintf(fid, '## Per-Class Breakdown\n\n');
    fprintf(fid, '| Grade | Label | Precision | Recall | F1-Score | Support |\n');
    fprintf(fid, '|---|---|---|---|---|---|\n');
    
    for i = 1:length(metrics.perClass)
        c = metrics.perClass(i);
        fprintf(fid, '| %d | %s | %.4f | %.4f | %.4f | %d |\n', ...
            c.grade, c.label, c.precision, c.recall, c.f1, c.support);
    end
    
    fprintf(fid, '\n## Calibration Results\n\n');
    fprintf(fid, '- **Method**: %s\n', metrics.calibration.method);
    fprintf(fid, '- **ECE Before Calibration**: %.4f\n', metrics.calibration.eceBefore);
    fprintf(fid, '- **ECE After Calibration**: %.4f\n\n', metrics.calibration.eceAfter);
    
    fprintf(fid, '## Recommendations\n\n');
    if ~targetsMet
        fprintf(fid, 'The model did not meet the primary screening targets. ');
        if sens < sensTarget
            fprintf(fid, 'Sensitivity is too low (%.4f < %.2f). Consider lowering the operating threshold or adjusting class weights to penalize false negatives more heavily. ', sens, sensTarget);
        end
        if spec < specTarget
            fprintf(fid, 'Specificity is too low (%.4f < %.2f). Consider raising the operating threshold or collecting more negative samples. ', spec, specTarget);
        end
    else
        fprintf(fid, 'The model meets all primary screening targets. It is ready for clinical validation/shadow deployment phase.\n');
    end
    
    fclose(fid);
    
    % Print summary to console
    fprintf('Report generated successfully at %s\n', reportPath);
    fprintf('Model: %s | Status: %s\n', metrics.modelVersion, ifelse(targetsMet, 'PASS', 'FAIL'));
    fprintf('Sensitivity: %.4f | Specificity: %.4f\n', sens, spec);
end

function out = ifelse(cond, a, b)
    if cond
        out = a;
    else
        out = b;
    end
end
