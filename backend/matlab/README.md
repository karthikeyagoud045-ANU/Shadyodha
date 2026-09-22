# DRISHTI AI — MATLAB Intelligence Pipeline

> **Project:** SIH26038 — Explainable AI for Diabetic Retinopathy Screening in Rural India  
> **Team:** ShadYodha  
> **Component:** AI/ML Intelligence Layer (MATLAB R2024a)

---

## Overview

DRISHTI AI is an **Agentic Explainable Retinal Screening & Referral Platform** that performs automated Diabetic Retinopathy (DR) grading from fundus photographs. This MATLAB pipeline implements the complete intelligence layer:

```
Input Fundus Image → Quality Agent → Preprocessing (CLAHE + Denoise) →
ResNet-101 Classifier → [Softmax → Calibration → DR Grade 0-4] +
[Grad-CAM → Heatmap] + [Lesion Detector → Annotation] → result.json →
Node.js reads result.json
```

### DR Classification (ICDR Scale)
| Grade | Label | Referable | Triage |
|-------|-------|-----------|--------|
| 0 | No DR | No | Annual screening |
| 1 | Mild NPDR | No | Annual screening |
| 2 | Moderate NPDR | **Yes** | Within 7 days |
| 3 | Severe NPDR | **Yes** | Within 48 hours |
| 4 | Proliferative DR | **Yes** | Within 24 hours |

**Referable rule:** `grade >= 2`

---

## Prerequisites

### MATLAB Toolboxes Required
- MATLAB R2024a or later
- Deep Learning Toolbox
- Image Processing Toolbox
- Computer Vision Toolbox
- Statistics and Machine Learning Toolbox
- (Optional) Medical Imaging Toolbox
- (Optional) Simulink + SimEvents

### Hardware
- **Training:** NVIDIA GPU with ≥6GB VRAM recommended (CUDA-compatible)
- **Inference:** CPU-only is sufficient (GPU recommended for <5s inference)
- **RAM:** ≥16GB recommended for training

---

## Folder Structure

```
matlab/
├── main/
│   └── run_screening.m          ← MAIN ENTRY POINT (Node.js calls this)
├── preprocessing/
│   ├── preprocess_fundus.m      ← Master: crop, resize, CLAHE, denoise
│   ├── normalize_illumination.m
│   └── apply_clahe.m
├── quality/
│   ├── assess_image_quality.m   ← Master quality assessment
│   ├── check_focus.m            ← Laplacian variance
│   ├── check_illumination.m     ← Brightness histogram
│   └── check_field_of_view.m    ← Circular mask coverage
├── classification/
│   ├── train_dr_model.m         ← Transfer learning training script
│   ├── classify_dr.m            ← Inference function
│   ├── load_model.m             ← Load/cache trained ResNet-101
│   └── get_severity_label.m     ← ICDR grade → label mapping
├── explainability/
│   ├── generate_gradcam.m       ← Grad-CAM heatmap generation
│   ├── overlay_gradcam.m        ← Overlay heatmap on original
│   ├── detect_lesions.m         ← Lesion detection (MA, HE, EX, SE)
│   └── annotate_lesions.m       ← Draw bounding boxes
├── calibration/
│   ├── calibrate_confidence.m   ← Isotonic regression / Platt scaling
│   └── evaluate_calibration.m   ← ECE computation
├── evaluation/
│   ├── compute_metrics.m        ← Full evaluation harness
│   ├── plot_confusion_matrix.m
│   ├── plot_roc_curve.m
│   └── generate_report.m
├── simulation/
│   ├── run_simulation.m         ← Discrete-event operational simulation
│   └── export_results.m         ← Export simulation metrics to JSON
├── models/
│   └── trained_DR_ResNet101.mat ← Trained model (NOT in git — see below)
├── data/
│   ├── aptos2019/               ← Training dataset
│   └── idrid/                   ← Validation dataset
├── utils/
│   ├── write_result_json.m
│   ├── read_image_safe.m
│   └── logger.m
├── test/
│   └── test_pipeline.m          ← Test suite (11 tests)
├── README.md                    ← This file
└── MODEL_CARD.md                ← Model documentation
```

---

## Quick Start

### 1. Clone and Setup

```bash
cd drishti-AI
```

Open MATLAB and run:
```matlab
addpath(genpath('matlab'));
```

### 2. Download Datasets

#### APTOS 2019 (Training)
1. Go to: https://www.kaggle.com/c/aptos2019-blindness-detection
2. Download `train.csv` and `train_images/` folder
3. Place in: `matlab/data/aptos2019/`

Expected structure:
```
matlab/data/aptos2019/
├── train.csv           ← Columns: id_code, diagnosis
└── train_images/       ← 3662 JPEG files
    ├── 000c1434d8d7.png
    ├── 001639a390f0.png
    └── ...
```

#### IDRiD (Validation + Explainability)
1. Go to: https://idrid.grand-challenge.org/
2. Download image-level grades and lesion annotations
3. Place in: `matlab/data/idrid/`

Expected structure:
```
matlab/data/idrid/
├── images/             ← 516 fundus images
├── grades.csv          ← Image-level DR grades
└── annotations/        ← Pixel-level lesion masks (81 images)
```

### 3. Train the Model

```matlab
train_dr_model('matlab/data/aptos2019', 'matlab/models');
```

This will:
- Load and split APTOS 2019 dataset (70/15/15)
- Train ResNet-101 with transfer learning (~20 epochs)
- Tune operating threshold on validation set
- Fit isotonic regression calibration
- Save: `trained_DR_ResNet101.mat`, `calibration_params.mat`, `threshold_params.mat`
- Evaluate against PS targets (sensitivity >90%, specificity >85%)

**Training time:** ~2-4 hours on GPU, ~8-12 hours on CPU

### 4. Run Single Image Screening

```matlab
run_screening('path/to/fundus.jpg', 'path/to/output/');
```

Or from command line (Node.js integration):
```bash
matlab -batch "run_screening('C:/images/patient001.jpg', 'C:/output/scr001')"
```

### 5. Run Tests

```matlab
test_pipeline
```

Runs 11 automated tests covering the full pipeline.

---

## Node.js Integration

The backend calls MATLAB via:
```javascript
const { exec } = require('child_process');
exec(`matlab -batch "run_screening('${inputPath}', '${outputDir}')"`, (err, stdout) => {
    const result = JSON.parse(fs.readFileSync(path.join(outputDir, 'result.json')));
    // Process result...
});
```

### Output Files
After `run_screening` completes, `outputDir` contains:

| File | Description |
|------|-------------|
| `result.json` | Structured JSON with all results |
| `gradcam.png` | Grad-CAM heatmap |
| `overlay.png` | Heatmap overlaid on original image |
| `lesion_annotation.png` | Lesion bounding box annotations |

### result.json Schema
See `MODEL_CARD.md` for the complete JSON contract specification.

---

## Demo Mode

If the trained model (`trained_DR_ResNet101.mat`) is not present, the pipeline runs in **demo mode**:
- Uses pretrained ResNet-101 as base
- Generates plausible but random predictions
- All other pipeline components work normally
- Console output clearly indicates demo mode

This allows end-to-end integration testing without a trained model.

---

## Operational Simulation

Run the discrete-event simulation:
```matlab
params = struct();
params.patientsPerDay = 200;
params.numCameras = 3;
params.numOphthalmologists = 2;
params.simDays = 5;
params.outputDir = 'simulation_output';

results = run_simulation(params);
```

Output: `simulation_results.json` with throughput, wait times, utilization, and bottleneck analysis.

---

## Trained Model

**The trained `.mat` file is NOT stored in git** due to size (~300MB).

Download link: *[To be added after training — upload to Google Drive]*

Place in: `matlab/models/trained_DR_ResNet101.mat`

---

## Evaluation

After training, run the full evaluation:
```matlab
% Load test predictions (generated during training)
metrics = compute_metrics(predictions, trueLabels, 'drishti-resnet101-v1', 'aptos_test', 'ai/outputs');
```

Output in `ai/outputs/`:
- `metrics.json` — Comprehensive metrics matching backend registry schema
- `confusion_matrix.png` — 5×5 confusion matrix
- `roc_curve.png` — ROC curves with AUC
- `calibration_plot.png` — Reliability diagram

### PS Targets
| Metric | Target | Status |
|--------|--------|--------|
| Sensitivity (referable DR) | >90% | See metrics.json |
| Specificity (referable DR) | >85% | See metrics.json |

---

## Backend Registration

After evaluation:
```bash
node backend/scripts/register_model.js ai/outputs/metrics.json
```

Integration test:
```bash
# In backend/.env set:
# USE_MOCK_AI=false
# MATLAB_PATH=matlab

npm run demo  # Should pass 11/11 with real AI
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "resnet101 not found" | Install Deep Learning Toolbox: `matlab.addons.install('Deep Learning Toolbox')` |
| GPU out of memory | Reduce batch size in `train_dr_model.m` (try 8 or 4) |
| "adapthisteq not found" | Install Image Processing Toolbox |
| Slow inference | Ensure GPU is detected: `gpuDeviceCount` should return ≥1 |
| Demo mode activated | Train the model or download `trained_DR_ResNet101.mat` |

---

## License

Internal project — SIH 2024 submission by Team ShadYodha.

## Contact

- **AI/ML Lead:** Team ShadYodha
- **Project:** SIH26038 — DRISHTI AI
