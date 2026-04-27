# 线性回归建模步骤（Baseline）

本文档对应 `notebooks/linear_regression.ipynb`，用于构建第一个可解释、可复现的基线模型。

## 1. 目标与思路

- 目标：预测房价 `SalePrice`
- 方法：多元线性回归 `LinearRegression`
- 作用：作为后续随机森林、XGBoost 的性能对照基线

## 2. 数据读取

从 Kaggle 下载目录读取训练集：

```python
df = pd.read_csv("../data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/train.csv")
```

## 3. 特征选择

当前 notebook 使用了 5 个核心特征：

- `OverallQual`
- `GrLivArea`
- `GarageCars`
- `TotalBsmtSF`
- `YearBuilt`

目标列：

- `SalePrice`

## 4. 划分训练/验证集

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

- 验证集比例：20%
- 随机种子：42（保证结果可复现）

## 5. 训练模型

```python
model = LinearRegression()
model.fit(X_train, y_train)
```

## 6. 评估结果（当前项目实际值）

根据现有 notebook 输出：

- `R² = 0.793865396635656`
- `RMSE = 39763.295265780616`

说明：

- R² 约 0.79，说明基础拟合能力尚可
- RMSE 接近 4 万美元，仍有明显优化空间

## 7. 阶段结论

- 线性回归成功建立了可解释 baseline
- 在同一特征集下，后续应对比随机森林与 XGBoost 的提升幅度
- 若继续优化线性模型，可考虑：
  - 对数变换目标值（如 `log1p(SalePrice)`）
  - 扩展特征工程与交互项
  - 引入更多高相关字段