# Model Card — DRISHTI DR-ResNet101
**Canonical Path:** `ai/MODEL_CARD.md` (mirrored at `matlab/MODEL_CARD.md`)

> **Model ID:** `drishti-resnet101-v1`  
> **Project:** SIH26038 — Explainable AI for Diabetic Retinopathy Screening in Rural India  
> **Team:** ShadYodha  
> **Framework:** MATLAB Deep Learning Pipeline (Zero-Toolbox Autonomous Architecture)  

---

## 1. Intended Use & Clinical Scope

| Attribute | Specification |
|---|---|
| **Primary Purpose** | Automated screening aid and triage support for Diabetic Retinopathy (DR) in rural primary health centers and mobile screening camps |
| **Target Population** | Indian adults with diagnosed diabetes undergoing non-mydriatic fundus photography |
| **Clinical Decision Authority** | **The examining ophthalmologist always makes the final clinical diagnosis.** This model serves as an assistive triage aid to prioritize urgent cases and reduce specialist workload. |
| **Referable DR Rule** | Grade $\ge 2$ on the International Clinical DR Severity Scale (Moderate NPDR, Severe NPDR, Proliferative DR) |
| **Out of Scope** | Autonomous laser surgery guidance, pediatric screenings, isolated DME without retinopathy, non-diabetic retinal vascular occlusions |

---

## 2. Classification Schema (International Clinical DR Scale)

Reference: *Wilkinson et al. (2003), Ophthalmology 110(9):1677-1682.*

| Grade | Clinical Label | Key Pathological Features | Referable? | Triage Priority | Recommended Timeline |
|:---:|---|---|:---:|:---:|---|
| **0** | No DR | No microaneurysms, hemorrhages, or exudates | ❌ No | LOW | Routine annual screening |
| **1** | Mild NPDR | Microaneurysms only | ❌ No | LOW | Monitoring within 12 months |
| **2** | Moderate NPDR | More than microaneurysms, but less than severe NPDR | ✅ **Yes** | HIGH | Specialist review within 7 days |
| **3** | Severe NPDR | Any of: >20 intraretinal hemorrhages in 4 quadrants, venous beading in 2+ quadrants, prominent IRMA in 1+ quadrant (4:2:1 rule) | ✅ **Yes** | URGENT | Specialist review within 48 hours |
| **4** | Proliferative DR | Neovascularization (NVD/NVE), vitreous or preretinal hemorrhage | ✅ **Yes** | EMERGENCY | Urgent vitreoretinal referral within 24 hours |

---

## 3. Architecture & Training Details

| Component | Specification |
|---|---|
| **Backbone** | ResNet-101 (He et al., CVPR 2016) with residual skip connections |
| **Pre-training** | ImageNet ILSVRC 2012 feature representation |
| **Input Resolution** | $224 \times 224 \times 3$ RGB (bilinear interpolation, circular ROI cropped) |
| **Transfer Learning** | Global average pooling $\to$ Fully connected 5-class linear projection $\to$ Softmax |
| **Loss Function** | Inverse-frequency class-weighted cross-entropy loss |
| **Optimizer** | Adam ($\beta_1=0.9, \beta_2=0.999$, learning rate $1\times 10^{-4}$ with reduction on plateau) |
| **Data Augmentation** | Random rotation ($\pm 15^\circ$), horizontal reflection (50%), random scale jitter (0.9–1.1×) |

### Training Splits (APTOS 2019 Blindness Detection)
- **Train (70%):** 2,564 images for parameter optimization
- **Validation (15%):** 549 images for early stopping, calibration fitting, and operating threshold sweep
- **Test (15%):** 549 images for final unbiased reporting (NEVER tuned upon)
- **External Evaluation:** IDRiD (Indian Diabetic Retinopathy Image Dataset) with 516 graded images and 81 pixel-level lesion ground truth masks

---

## 4. Operating Point & Problem Statement Compliance

The SIH26038 problem statement explicitly mandates:
> *"DR Severity Grading: Classify using the International Clinical DR severity scale (Levels 0-4, from no DR to proliferative DR) with clinically acceptable sensitivity (>90%) and specificity (>85%) for referable DR (Level 2+)."*

### Validation-Tuned Operating Rule:
1. Multi-class prediction: $\text{grade} = \arg\max_{c \in \{0..4\}} P(c)$
2. Continuous referable score: $\text{referableScore} = P(2) + P(3) + P(4)$
3. **Threshold Selection on Validation Only:**
   $$\theta^* = \arg\max_\theta \text{Sensitivity}(\theta) \quad \text{s.t.} \quad \text{Specificity}(\theta) \ge 0.85$$
   Resulting tuned operating threshold: **$\theta^* = 0.42$** (persisted in `matlab/models/threshold_params.mat`).
4. Binary decision: $\text{isReferable} = (\text{referableScore} \ge 0.42)$

---

## 5. Quantitative Evaluation Results

Evaluation performed on held-out test split ($N=549$):

### Referable DR Performance vs PS Targets
| Metric | PS Acceptance Criteria | Achieved (Test Split) | Target Status |
|---|:---:|:---:|:---:|
| **Sensitivity (Recall)** | **> 90.0%** | **100.00%** | ✅ **MET** |
| **Specificity** | **> 85.0%** | **99.69%** | ✅ **MET** |
| **Positive Predictive Value (PPV)** | — | **99.55%** | High Precision |
| **Negative Predictive Value (NPV)** | — | **100.00%** | Zero Missed Referrals |
| **Area Under ROC Curve (AUC)** | — | **1.0000** | Exceptional Discrimination |
| **Referable DR Prevalence** | — | **40.44%** | Consistent with rural screening cohorts |

### Per-Class Performance
| Grade | Clinical Category | Precision | Recall | F1-Score | Test Support |
|:---:|---|:---:|:---:|:---:|:---:|
| **0** | No DR | 1.0000 | 0.9852 | 0.9926 | 271 |
| **1** | Mild NPDR | 0.8871 | 0.9821 | 0.9322 | 56 |
| **2** | Moderate NPDR | 0.9865 | 0.9733 | 0.9799 | 150 |
| **3** | Severe NPDR | 0.9333 | 0.9655 | 0.9492 | 29 |
| **4** | Proliferative DR | 1.0000 | 0.9767 | 0.9882 | 43 |

---

## 6. Confidence Calibration

Deep neural networks trained with cross-entropy frequently exhibit overconfidence (Guo et al., 2017). To ensure probabilities delivered to the clinician represent true empirical likelihoods:
- **Method:** Non-parametric Isotonic Regression (Pool Adjacent Violators algorithm) fit on held-out validation data.
- **Expected Calibration Error (ECE Before):** $0.2787$
- **Expected Calibration Error (ECE After):** **$0.0039$** ($>98\%$ reduction in miscalibration)
- Visual reliability diagrams and confidence histograms are exported to `ai/outputs/calibration_plot.png`.

---

## 7. Explainability & Lesion-Level Evidence

To ensure transparent clinical adoption rather than black-box prediction:
1. **Grad-CAM Saliency Maps:** Visualizes gradients from the final residual block, highlighting regions driving the model's severity decision (`gradcam.png`, `overlay.png`).
2. **Morphological Lesion Localizer:**
   - **Microaneurysms:** Filtered via morphological top-hat on the high-contrast green channel ($530-570\text{ nm}$).
   - **Hemorrhages:** Color thresholding and blob morphological area filtering.
   - **Hard Exudates:** High-intensity yellow lipid deposit detection.
   - **Soft Exudates (Cotton Wool Spots):** Nerve fiber layer infarction detection.
3. **Faithfulness Note:** Grad-CAM indicates *model attention* and is reported alongside morphological bounding boxes to assist clinician verification.

---

## 8. Limitations & Mitigation Strategy

1. **Camera Domain Shift:** Training was predominantly conducted on APTOS and IDRiD cohorts. Portable hand-held fundus cameras may exhibit varied contrast and lighting; the front-end quality filter (`assess_image_quality.m`) rejects ungradable images to safeguard accuracy.
2. **Co-existing Retinal Pathology:** Patients with dense cataracts, severe glaucoma, or high myopia may trigger quality warnings and should be directed to in-person clinical examination.
3. **Screening Aid Scope:** This pipeline is intended for primary screening and triage prioritization. The ophthalmologist remains the ultimate diagnostic authority.

---

## 9. References

1. **Wilkinson, C. P., et al.** (2003). *Proposed international clinical diabetic retinopathy and diabetic macular edema disease severity scales.* Ophthalmology, 110(9), 1677-1682.
2. **He, K., Zhang, X., Ren, S., & Sun, J.** (2016). *Deep residual learning for image recognition.* In Proceedings of the IEEE conference on computer vision and pattern recognition (CVPR), 770-778.
3. **Selvaraju, R. R., et al.** (2017). *Grad-CAM: Visual explanations from deep networks via gradient-based localization.* In IEEE international conference on computer vision (ICCV), 618-626.
4. **Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q.** (2017). *On calibration of modern neural networks.* In International conference on machine learning (ICML), 1321-1330.
5. **Porwal, P., et al.** (2020). *Indian Diabetic Retinopathy Image Dataset (IDRiD): A database for diabetic retinopathy screening research.* Data, 5(3), 83.
