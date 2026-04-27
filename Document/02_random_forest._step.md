# 随机森林建模步骤

本文档对应 `notebooks/random_forest.ipynb`，用于在与线性回归相同特征下进行非线性建模对比。

## 1. 模型定位

- 算法：`RandomForestRegressor`
- 目的：捕捉特征与房价之间的非线性关系，提升基线性能
- 对照对象：`LinearRegression`

## 2. 数据与特征

读取数据：

```python
df = pd.read_csv("../data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/train.csv")
```

使用的 5 个特征与 baseline 保持一致：

- `OverallQual`
- `GrLivArea`
- `GarageCars`
- `TotalBsmtSF`
- `YearBuilt`

标签：

- `SalePrice`

## 3. 划分与训练

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)
```

## 4. 评估结果（当前项目实际值）

根据现有 notebook 输出：

- `R² = 0.8909884152402685`
- `RMSE = 28916.334751651524`

## 5. 与线性回归对比

- R²：`0.79 -> 0.89`（显著提升）
- RMSE：`39763 -> 28916`（误差明显下降）

结论：在当前特征组合下，随机森林已明显优于线性回归，证明房价关系存在非线性结构。

## 6. 可继续优化方向

- 调参：`max_depth`、`min_samples_leaf`、`max_features`
- 使用交叉验证替代单次切分评估
- 扩展特征（Neighborhood、OverallCond、KitchenQual 等）
