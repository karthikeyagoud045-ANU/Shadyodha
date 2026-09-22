# APTOS 2019 — Training Data

Place the APTOS 2019 dataset here.

## Download Instructions

1. Go to: https://www.kaggle.com/c/aptos2019-blindness-detection/data
2. Download `train.csv` and the `train_images/` folder
3. Place them in this directory (`matlab/data/aptos2019/`)

## Expected Structure

```
matlab/data/aptos2019/
├── train.csv             ← CSV with columns: id_code, diagnosis (0-4)
└── train_images/         ← 3662 JPEG fundus photographs
    ├── 000c1434d8d7.png
    ├── 001639a390f0.png
    └── ...
```

## Dataset Summary

| Grade | Label          | Count | %     |
|-------|----------------|-------|-------|
| 0     | No DR          | 1,805 | 49.3% |
| 1     | Mild NPDR      | 370   | 10.1% |
| 2     | Moderate NPDR  | 999   | 27.3% |
| 3     | Severe NPDR    | 193   | 5.3%  |
| 4     | Proliferative  | 295   | 8.1%  |
| **Total** |            | **3,662** | |

## Citation

Karthik, Maggie, & Mani. (2019). *APTOS 2019 Blindness Detection*. Kaggle.
