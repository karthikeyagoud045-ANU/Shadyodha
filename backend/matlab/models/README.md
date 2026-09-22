# Place trained model file here

## File: `trained_DR_ResNet101.mat`

This directory stores the trained MATLAB model file.

The `.mat` file is **NOT committed to git** due to its size (~300MB).

### Download
After training completes, the model will be available at:
- **Google Drive:** *(link to be added after training)*

### Contents of trained_DR_ResNet101.mat
- `trainedNet` — DAGNetwork (ResNet-101, fine-tuned, 5-class output)

### Companion files (also saved here during training)
- `calibration_params.mat` — Isotonic regression calibration mapping
- `threshold_params.mat`   — Validated operating threshold for referable DR

### Generate these files
```matlab
train_dr_model('matlab/data/aptos2019', 'matlab/models');
```
