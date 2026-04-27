# 项目目录结构（priceProjections）

下面是当前仓库的实际结构与用途说明，便于快速定位文件。

```text
priceProjections/
├── app/
│   ├── backend/
│   │   └── app.py                    # Flask 预测接口，加载训练好的模型
│   └── frontend/                     # React + Vite 前端页面
│       ├── src/App.jsx
│       ├── package.json
│       └── ...
├── data/
│   ├── get_data.py                   # 使用 kagglehub 下载竞赛数据
│   ├── download_data.sh              # 数据下载脚本（需先配置凭证）
│   └── kaggle_cache/                 # Kaggle 下载缓存目录
├── docker/
│   └── ...                           # 容器相关配置
├── models/
│   └── house_price_model.pkl         # 当前部署使用的模型文件
├── notebooks/
│   ├── eda.ipynb                     # 数据探索分析
│   ├── linear_regression.ipynb       # 线性回归基线
│   ├── random_forest.ipynb           # 随机森林模型
│   └── xgboost.ipynb                 # XGBoost 模型（当前最佳）
├── Document/
│   ├── data_describetion.md          # 数据集说明
│   ├── linear_regression_step.md     # 线性回归步骤说明
│   ├── random_forest._step.md        # 随机森林步骤说明
│   ├── xgboost_step.md               # XGBoost 步骤说明
│   └── steps.md                      # 全流程步骤导航
├── requirements.txt                  # Python 依赖
├── install.sh                        # 一键安装/启动脚本（容器和本地模式）
├── docker-compose.yml
└── README.md
```

## 快速定位建议

- 想看模型训练过程：`notebooks/`
- 想改线上预测逻辑：`app/backend/app.py`
- 想改页面和输入项：`app/frontend/src/App.jsx`
- 想更新环境与部署方式：`install.sh`、`docker-compose.yml`