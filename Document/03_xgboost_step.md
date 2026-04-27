# XGBoost 建模步骤（当前最佳）

本文档对应 `notebooks/xgboost.ipynb`。在当前项目中，XGBoost 是三个模型里效果最好的方案。

## 1. 模型定位
- 介绍：XGBoost（Extreme Gradient Boosting）是一种 基于梯度提升（Gradient Boosting）的高效机器学习算法，主要用于 回归和分类问题，在 Kaggle、数据竞赛和工业应用中非常流行。
- 算法：`XGBRegressor`
- 目的：进一步降低预测误差，作为部署候选模型

## 2. 数据与特征

数据源：

```python
df = pd.read_csv("../data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/train.csv")
```

当前使用特征（与前两个模型一致）：

- `OverallQual`
- `GrLivArea`
- `GarageCars`
- `TotalBsmtSF`
- `YearBuilt`

目标值：

- `SalePrice`

## 3. 训练配置

```python
model = XGBRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=4,
    random_state=42
)
model.fit(X_train, y_train)
```

数据切分方式：

- `train_test_split(test_size=0.2, random_state=42)`

## 4. 评估结果（当前项目实际值）

根据现有 notebook 输出：

- `R² = 0.8979299664497375`
- `RMSE = 27980.534948424414`

## 5. 与其他模型对比

| 模型 | R² | RMSE |
| --- | --- | --- |
| 线性回归 | 0.7939 | 39763.30 |
| 随机森林 | 0.8910 | 28916.33 |
| XGBoost | 0.8979 | 27980.53 |

结论：XGBoost 在当前数据处理与特征组合下表现最佳，可作为默认部署模型。

## 6. 部署建议

- 将训练好的 XGBoost 模型序列化为 `models/house_price_model.pkl`
- 后端接口 `app/backend/app.py` 按同样 5 维特征顺序接收输入并预测
- 生产环境建议固定依赖版本并保存训练参数快照，避免结果漂移
