# Price Projections | 房价预测系统

中文 | [English](#english)

---

## 中文

### 项目简介

本项目基于 Kaggle House Prices 数据集，训练回归模型预测房价（`SalePrice`），并提供可交互的前后端应用用于在线估价。  
当前模型路线为：线性回归 -> 随机森林 -> XGBoost（部署版本）。

### 功能特性

- 房价预测（后端模型推理）
- 前端输入校验（范围、数字类型、空值）
- 结果展示（预测价格、误差范围、市场评价）
- 简单可解释信息（主要影响因素提示）
- 预算推荐（支持不同购房偏好）
- 模型效果对比展示（Linear / RF / XGBoost）

### 模型表现（当前 Notebook 结果）

| 模型 | R² | RMSE |
| --- | --- | --- |
| Linear Regression | 0.793865 | 39763.30 |
| Random Forest | 0.890988 | 28916.33 |
| XGBoost | 0.897930 | 27980.53 |

### 当前统一特征

- `OverallQual`：整体质量评分
- `GrLivArea`：地上居住面积
- `GarageCars`：车库容量
- `TotalBsmtSF`：地下室总面积
- `YearBuilt`：建造年份

### 技术栈

- 机器学习：`scikit-learn`、`xgboost`
- 后端：`Flask`、`gunicorn`
- 前端：`React` + `Vite`
- 部署：`Docker`、`docker compose`、`Nginx`

### 项目结构

```text
priceProjections/
├── app/
│   ├── backend/app.py              # Flask 预测接口（/predict）
│   └── frontend/                   # React + Vite 前端
├── data/
│   ├── get_data.py                 # Kaggle 数据下载脚本
│   └── kaggle_cache/...            # 下载后的数据缓存
├── docker/                         # Dockerfile 与 Nginx 配置
├── models/house_price_model.pkl    # 当前部署模型
├── notebooks/                      # EDA 与模型训练过程
├── Document/                       # 项目说明文档
├── docker-compose.yml
├── install.sh                      # 一键安装/启动（本地 + 容器）
└── requirements.txt
```

### 数据准备

1. 安装 Python 依赖（见 `requirements.txt`）。
2. 下载数据：
   ```bash
   python3 data/get_data.py
   ```
3. 确认数据落盘目录：
   `data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/`

### 快速开始

#### 方式 A：Docker（推荐）

```bash
./install.sh -start
```

- 前端地址：`http://127.0.0.1:18080`
- 后端服务由前端容器通过内部网络访问（`backend:5000`）

常用命令：

```bash
./install.sh -status
./install.sh -logs
./install.sh -stop
```

#### 方式 B：本地开发

1. 安装依赖（会创建 `.venv` 并执行前端 `npm ci`）：

```bash
./install.sh -install
```

2. 启动本地前后端：

```bash
./install.sh -start-local
```

- 后端：`http://localhost:5000`
- 前端：`http://localhost:5100`

常用命令：

```bash
./install.sh -status-local
./install.sh -restart-local
./install.sh -stop-local
```

### API 说明

#### `POST /predict`

请求体（JSON）：

```json
{
  "OverallQual": 7,
  "GrLivArea": 1800,
  "GarageCars": 2,
  "TotalBsmtSF": 900,
  "YearBuilt": 2004
}
```

响应：

```json
{
  "predicted_price": 215000.0
}
```

`curl` 示例（本地后端）：

```bash
curl -X POST "http://localhost:5000/predict" \
  -H "Content-Type: application/json" \
  -d '{"OverallQual":7,"GrLivArea":1800,"GarageCars":2,"TotalBsmtSF":900,"YearBuilt":2004}'
```

### 模型训练与实验流程

- `notebooks/eda.ipynb`：探索性分析
- `notebooks/linear_regression.ipynb`：基线模型
- `notebooks/random_forest.ipynb`：树模型增强
- `notebooks/xgboost.ipynb`：当前最佳模型

配套步骤文档可参考 `Document/` 下的说明文件。

### 常见问题

- `docker compose` 不可用：请先安装 Docker Desktop 或 Docker Engine + Compose 插件。
- 本地模式无法启动：先执行 `./install.sh -install`，并检查 `python3` 与 `npm` 是否可用。
- 前端请求失败：确认后端是否运行在 `5000` 端口，或容器是否正常启动。

---

## English

### Overview

This project predicts house prices (`SalePrice`) using regression models trained on the Kaggle House Prices dataset, and provides an interactive full-stack web app for online estimation.  
Model evolution in this repository: Linear Regression -> Random Forest -> XGBoost (deployed model).

### Features

- House price prediction via backend model inference
- Frontend input validation (range, numeric checks, empty input handling)
- Prediction output with error range and market-level hint
- Lightweight explainability hints for key drivers
- Budget-based recommendation with preference modes
- Built-in model comparison panel (Linear / RF / XGBoost)

### Model Performance (from current notebooks)

| Model | R² | RMSE |
| --- | --- | --- |
| Linear Regression | 0.793865 | 39763.30 |
| Random Forest | 0.890988 | 28916.33 |
| XGBoost | 0.897930 | 27980.53 |

### Unified Input Features

- `OverallQual` (overall quality score)
- `GrLivArea` (above-ground living area)
- `GarageCars` (garage capacity)
- `TotalBsmtSF` (total basement area)
- `YearBuilt` (construction year)

### Tech Stack

- ML: `scikit-learn`, `xgboost`
- Backend: `Flask`, `gunicorn`
- Frontend: `React` + `Vite`
- Deployment: `Docker`, `docker compose`, `Nginx`

### Project Structure

```text
priceProjections/
├── app/
│   ├── backend/app.py              # Flask prediction API (/predict)
│   └── frontend/                   # React + Vite frontend
├── data/
│   ├── get_data.py                 # Kaggle data downloader
│   └── kaggle_cache/...            # downloaded dataset cache
├── docker/                         # Dockerfiles and Nginx config
├── models/house_price_model.pkl    # deployed model artifact
├── notebooks/                      # EDA and model training notebooks
├── Document/                       # project docs
├── docker-compose.yml
├── install.sh                      # one-script setup/run (local + docker)
└── requirements.txt
```

### Data Preparation

1. Install Python dependencies (see `requirements.txt`).
2. Download dataset:
   ```bash
   python3 data/get_data.py
   ```
3. Verify files are in:
   `data/kaggle_cache/competitions/house-prices-advanced-regression-techniques/`

### Quick Start

#### Option A: Docker (recommended)

```bash
./install.sh -start
```

- Frontend: `http://127.0.0.1:18080`
- Backend is accessed internally by the frontend container (`backend:5000`)

Common commands:

```bash
./install.sh -status
./install.sh -logs
./install.sh -stop
```

#### Option B: Local Development

1. Install dependencies (`.venv` + frontend `npm ci`):

```bash
./install.sh -install
```

2. Start local backend and frontend:

```bash
./install.sh -start-local
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5100`

Common commands:

```bash
./install.sh -status-local
./install.sh -restart-local
./install.sh -stop-local
```

### API

#### `POST /predict`

Request JSON:

```json
{
  "OverallQual": 7,
  "GrLivArea": 1800,
  "GarageCars": 2,
  "TotalBsmtSF": 900,
  "YearBuilt": 2004
}
```

Response:

```json
{
  "predicted_price": 215000.0
}
```

`curl` example (local backend):

```bash
curl -X POST "http://localhost:5000/predict" \
  -H "Content-Type: application/json" \
  -d '{"OverallQual":7,"GrLivArea":1800,"GarageCars":2,"TotalBsmtSF":900,"YearBuilt":2004}'
```

### Training Workflow

- `notebooks/eda.ipynb`: exploratory data analysis
- `notebooks/linear_regression.ipynb`: baseline model
- `notebooks/random_forest.ipynb`: tree-based improvement
- `notebooks/xgboost.ipynb`: best-performing model

More procedural notes are available in `Document/`.

### Troubleshooting

- `docker compose` not found: install Docker and Compose plugin first.
- Local startup fails: run `./install.sh -install` and verify `python3` / `npm` availability.
- Frontend request fails: check backend on port `5000` or container health.