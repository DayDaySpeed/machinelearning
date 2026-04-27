# 项目实施步骤总览

## Step 1 数据准备

- 阅读：`Document/data_describetion.md`
- 下载数据：`python3 data/get_data.py`
- 检查数据文件是否已落在 `data/kaggle_cache/...`

## Step 2 数据探索（EDA）

- 运行：`notebooks/eda.ipynb`
- 输出重点：
  - `SalePrice` 分布
  - 关键特征与 `SalePrice` 关系
  - 缺失值与异常值概览

## Step 3 建立基线模型（线性回归）

- 运行：`notebooks/linear_regression.ipynb`
- 阅读：`Document/linear_regression_step.md`
- 目标：先得到一个可解释 baseline

## Step 4 模型增强（随机森林）

- 运行：`notebooks/random_forest.ipynb`
- 阅读：`Document/random_forest._step.md`
- 目标：验证树模型对非线性关系的提升

## Step 5 最优模型（XGBoost）

- 运行：`notebooks/xgboost.ipynb`
- 阅读：`Document/xgboost_step.md`
- 目标：获得当前最佳 R² 和更低 RMSE

## Step 6 模型部署与服务化

- 模型文件：`models/house_price_model.pkl`
- 后端接口：`app/backend/app.py`
- 前端页面：`app/frontend/`
- 一键脚本：`install.sh`（支持本地与容器模式）

## Step 7 交付建议

- 在 README 中维护模型对比表（R²、RMSE）
- 固化训练参数与数据版本
- 增加接口异常输入校验和日志记录
