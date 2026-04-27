# 数据集说明（House Prices）

本项目使用 Kaggle 竞赛 **House Prices - Advanced Regression Techniques** 数据集。  
下载脚本位于 `data/get_data.py`，默认会写入 `data/kaggle_cache/`。

## 核心文件

### 1) `train.csv`（训练集）

- 包含约 1460 条样本、81 列（含目标列）
- 目标列为 `SalePrice`
- 用于：
  - EDA（探索性分析）
  - 模型训练
  - 本地验证（如 train/test split）

### 2) `test.csv`（测试集）

- 不包含 `SalePrice`
- 用于生成最终预测结果
- 在 Kaggle 场景中通常用于线上提交

### 3) `sample_submission.csv`

- 提交模板，格式如下：

```csv
Id,SalePrice
1461,123456
1462,234567
```

### 4) `data_description.txt`

- 每个字段的业务含义说明文档
- 特征工程和异常值分析时必须参考

## 本项目当前使用的关键特征

根据现有 notebook，当前三种模型统一使用以下 5 个特征：

- `OverallQual`：整体质量评分
- `GrLivArea`：地上居住面积
- `GarageCars`：车库容量（可停放车辆数）
- `TotalBsmtSF`：地下室总面积
- `YearBuilt`：建造年份

目标值：

- `SalePrice`

## 下载与准备

1. 安装依赖（见 `requirements.txt`）
2. 运行 `python3 data/get_data.py`
3. 确认数据已下载到 `data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/`
