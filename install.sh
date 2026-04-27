#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/app/frontend"
BACKEND_DIR="$ROOT_DIR/app/backend"
VENV_DIR="$ROOT_DIR/.venv"
LOG_DIR="$ROOT_DIR/logs"
BACKEND_PID_FILE="$LOG_DIR/backend.pid"
FRONTEND_PID_FILE="$LOG_DIR/frontend.pid"
DEFAULT_ACTION="start"
ACTION="${1:-$DEFAULT_ACTION}"

cd "$ROOT_DIR"

usage() {
  cat <<EOF
用法: ./install.sh [动作]

Docker Compose（默认）:
  -start, start           构建并后台启动容器（默认动作）
  -stop, stop             停止并移除容器
  -restart, restart       重启容器
  -status, status         查看容器状态
  -logs, logs             查看容器日志（跟随）

本地开发:
  -install, install       安装本地依赖（Python venv + npm）
  -start-local            本地后台启动前后端
  -stop-local             按 PID 停止本地前后端
  -restart-local          重启本地前后端
  -status-local           查看本地前后端状态

其他:
  -h, --help              显示帮助并退出

示例:
  ./install.sh -start
  ./install.sh -stop
  ./install.sh -install
  ./install.sh -start-local
EOF
}

get_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return 0
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return 0
  fi

  echo "未检测到 docker compose，请先安装 Docker Compose。"
  exit 1
}

COMPOSE_CMD="$(get_compose_cmd)"

ensure_service_not_running() {
  local name="$1"
  local pid_file="$2"
  if [[ ! -f "$pid_file" ]]; then
    return 0
  fi

  local pid
  pid="$(tr -d '[:space:]' < "$pid_file")"
  if [[ -z "$pid" ]]; then
    rm -f "$pid_file"
    return 0
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo "$name 已在运行 (PID: $pid)，请先执行 ./install.sh -stop-local"
    exit 1
  fi

  rm -f "$pid_file"
}

install_local_deps() {
  command -v python3 >/dev/null 2>&1 || { echo "python3 未安装"; exit 1; }
  command -v npm >/dev/null 2>&1 || { echo "npm 未安装"; exit 1; }

  echo ">>> 创建 Python 虚拟环境并安装后端依赖"
  python3 -m venv "$VENV_DIR"
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  python -m pip install --upgrade pip
  pip install -r "$ROOT_DIR/requirements.txt"
  deactivate

  echo ">>> 安装前端依赖"
  cd "$FRONTEND_DIR"
  npm ci
}

start_local() {
  mkdir -p "$LOG_DIR"
  ensure_service_not_running "后端" "$BACKEND_PID_FILE"
  ensure_service_not_running "前端" "$FRONTEND_PID_FILE"

  cd "$BACKEND_DIR"
  nohup "$VENV_DIR/bin/python" app.py > "$LOG_DIR/backend.log" 2>&1 &
  local backend_pid=$!
  echo "$backend_pid" > "$BACKEND_PID_FILE"

  cd "$FRONTEND_DIR"
  nohup npm run dev -- --host 0.0.0.0 --port 5100 > "$LOG_DIR/frontend.log" 2>&1 &
  local frontend_pid=$!
  echo "$frontend_pid" > "$FRONTEND_PID_FILE"

  echo ">>> 本地启动完成"
  echo "后端: http://localhost:5000 (PID: $backend_pid)"
  echo "前端: http://localhost:5100 (PID: $frontend_pid)"
  echo "日志目录: $LOG_DIR"
}

stop_by_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name: 未找到 PID 文件"
    return 0
  fi

  local pid
  pid="$(tr -d '[:space:]' < "$pid_file")"
  if [[ -z "$pid" ]]; then
    rm -f "$pid_file"
    echo "$name: PID 文件为空，已清理"
    return 0
  fi

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    echo "$name 已停止 (PID: $pid)"
  else
    echo "$name: 进程不存在 (PID: $pid)"
  fi

  rm -f "$pid_file"
}

status_by_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name: 未运行（无 PID 文件）"
    return 0
  fi

  local pid
  pid="$(tr -d '[:space:]' < "$pid_file")"
  if [[ -z "$pid" ]]; then
    echo "$name: PID 文件为空"
    return 0
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo "$name: 运行中 (PID: $pid)"
  else
    echo "$name: 未运行（PID 文件残留: $pid）"
  fi
}

case "$ACTION" in
  -h|--help|help)
    usage
    ;;
  -install|install)
    install_local_deps
    ;;
  -start|start)
    echo ">>> 构建并启动容器（反代模式）"
    echo ">>> 前端监听 127.0.0.1:18080，请在系统 Nginx 中反代到该端口"
    $COMPOSE_CMD up -d --build
    echo ">>> 启动完成"
    $COMPOSE_CMD ps
    ;;
  -stop|stop)
    echo ">>> 停止并移除容器"
    $COMPOSE_CMD down
    ;;
  -restart|restart)
    echo ">>> 重启容器"
    $COMPOSE_CMD down
    $COMPOSE_CMD up -d --build
    $COMPOSE_CMD ps
    ;;
  -status|status)
    echo ">>> 容器状态"
    $COMPOSE_CMD ps
    ;;
  -logs|logs)
    echo ">>> 容器日志"
    $COMPOSE_CMD logs -f --tail=200
    ;;
  -start-local|start-local)
    start_local
    ;;
  -stop-local|stop-local)
    stop_by_pid_file "后端" "$BACKEND_PID_FILE"
    stop_by_pid_file "前端" "$FRONTEND_PID_FILE"
    ;;
  -restart-local|restart-local)
    stop_by_pid_file "后端" "$BACKEND_PID_FILE"
    stop_by_pid_file "前端" "$FRONTEND_PID_FILE"
    start_local
    ;;
  -status-local|status-local)
    status_by_pid_file "后端" "$BACKEND_PID_FILE"
    status_by_pid_file "前端" "$FRONTEND_PID_FILE"
    ;;
  *)
    echo "未知动作: $ACTION"
    usage
    exit 1
    ;;
esac
