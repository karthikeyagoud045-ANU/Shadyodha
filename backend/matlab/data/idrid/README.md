# IDRiD — Validation + Explainability Data

Place the IDRiD dataset here.

## Download Instructions

1. Register at: https://idrid.grand-challenge.org/
2. Download the full dataset (Disease Grading + Lesion Segmentation tasks)
3. Place in this directory (`matlab/data/idrid/`)

## Expected Structure

```
matlab/data/idrid/
├── grades.csv              ← Image-level DR grades (516 images)
├── images/                 ← 516 fundus images (TIFF/JPEG)
│   ├── IDRiD_001.jpg
│   ├── IDRiD_002.jpg
│   └── ...
└── annotations/            ← Pixel-level lesion masks (81 images)
    ├── microaneurysms/
    ├── haemorrhages/
    ├── hard_exudates/
    └── soft_exudates/
```

## grades.csv Format

```
Image name,Retinopathy grade,Risk of macular edema
IDRiD_001,2,2
IDRiD_002,4,0
...
```

## Dataset Summary

- 516 images with image-level DR grades (0–4)
- 81 images with pixel-level lesion annotations
- Indian patient population (matches DRISHTI AI deployment context)

## Citation

Porwal, P., et al. (2020). *IDRiD: Diabetic Retinopathy Segmentation and Grading Challenge*.
Medical Image Analysis, 59, 101561.
