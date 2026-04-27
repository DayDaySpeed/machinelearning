# 房价预测项目说明

## 项目目标

基于房屋结构与质量等特征，训练回归模型预测房价 `SalePrice`，并通过前后端提供可交互预测服务。

## 当前实现概况

- 数据源：Kaggle House Prices 竞赛数据
- 模型路线：线性回归 -> 随机森林 -> XGBoost
- 当前最佳：XGBoost（在现有 5 个特征上表现最优）

## 当前统一特征

- `OverallQual`
- `GrLivArea`
- `GarageCars`
- `TotalBsmtSF`
- `YearBuilt`

## 模型效果（来自当前 notebooks）

| 模型 | R² | RMSE |
| --- | --- | --- |
| Linear Regression | 0.793865 | 39763.30 |
| Random Forest | 0.890988 | 28916.33 |
| XGBoost | 0.897930 | 27980.53 |

## 系统结构

- 训练与分析：`notebooks/`
- 模型文件：`models/house_price_model.pkl`
- 后端 API：`app/backend/app.py`（`/predict`）
- 前端页面：`app/frontend/`
- 启动脚本：`install.sh`

## API 输入输出（后端）

请求（JSON）字段：

- `OverallQual`
- `GrLivArea`
- `GarageCars`
- `TotalBsmtSF`
- `YearBuilt`

返回：

```json
{
  "predicted_price": 215000.0
}
```

## 下一步优化建议

- 增加特征工程（类别变量编码、缺失值策略、对数变换）
- 增加交叉验证和系统化调参
- 为接口增加输入范围校验与异常提示
- 增加模型版本号管理和回滚机制
