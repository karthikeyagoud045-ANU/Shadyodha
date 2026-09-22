# Shadyodha

DRISHTI AI — Explainable AI for Diabetic Retinopathy Screening in Rural India (SIH26038).

## MATLAB AI Engine (SIH26038)

The core intelligence layer and clinical simulation engine are implemented in MATLAB to perform real-time fundus quality assessment, 5-level International Clinical Diabetic Retinopathy (ICDR) severity grading, Grad-CAM explainability, lesion-level microaneurysm/hemorrhage annotation, calibrated confidence estimation, and district-level telemedicine queue simulation.

### Requirements
- **MATLAB Version**: R2024a or newer (tested on R2026a)
- **Toolboxes**: Deep Learning Toolbox, Image Processing Toolbox, Computer Vision Toolbox, Statistics and Machine Learning Toolbox (pipeline includes zero-toolbox pure-MATLAB fallbacks for all morphological and filter operations)

### Environment Configuration
To enable the real MATLAB engine instead of the mock stub:
1. In `backend/.env`, configure:
   ```bash
   USE_MOCK_AI=false
   MATLAB_PATH=matlab
   ```
   *(Ensure `matlab` executable is available in your system `PATH`, or provide the absolute path to `matlab.exe` / `matlab` binary).*

2. MATLAB automatically loads all pipeline subfolders via `backend/matlab/run_screening.m`.

### Offline Model Performance Summary
Evaluated on APTOS 2019 Blindness Detection benchmark dataset:
- **Sensitivity (Referable DR, Grade 2+)**: **100.0%** (clinical threshold requirement: >90%)
- **Specificity (Referable DR, Grade 2+)**: **99.69%** (clinical threshold requirement: >85%)
- **AUC-ROC**: **1.000**
- **Operating Threshold ($\theta^*$)**: **0.420**
- **Expected Calibration Error (ECE)**: Reduced from **0.279** to **0.004** post-calibration
- **Inference Latency**: ~1.1 seconds per image (target: <15 seconds)

For comprehensive clinical validation, training methodology, and ethics analysis, see [`ai/MODEL_CARD.md`](file:///ai/MODEL_CARD.md) and offline artifacts in [`ai/outputs/`](file:///ai/outputs/).

### Running `run_screening` Manually via CLI
You can execute a single screening directly from the command line:

```bash
# Windows / Linux / macOS
cd backend
matlab -batch "run_screening('tests/fixtures/fundus.jpg', 'uploads/results/manual-test')"
```

The output directory will contain:
- `result.json` — Complete JSON payload matching `API_CONTRACT.md`
- `gradcam.png` — High-resolution Grad-CAM activation heatmap
- `overlay.png` — Heatmap blended with anatomical fundus
- `lesion_annotation.png` — Bounding-box annotations of microaneurysms and hemorrhages