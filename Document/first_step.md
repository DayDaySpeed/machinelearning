# 第一步该做什么

如果你刚接手这个项目，请先完成下面 4 件事。

## 1) 准备环境

- 安装 Python 3 和 Node.js
- 安装依赖：`pip install -r requirements.txt`
- 或使用脚本：`./install.sh -install`

## 2) 下载数据

运行：

```bash
python3 data/get_data.py
```

确认目录下有 `train.csv`、`test.csv` 等文件：

- `data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/`

## 3) 跑 EDA notebook

打开并运行 `notebooks/eda.ipynb`，至少完成：

- `df.info()`
- `df.describe()`
- `SalePrice` 分布图
- 相关性排序（含 `SalePrice`）

## 4) 跑 baseline

运行 `notebooks/linear_regression.ipynb`，得到首个可复现指标：

- R²
- RMSE

这样你就有了一条完整主线：  
**数据 -> 分析 -> baseline -> 进阶模型优化**。
