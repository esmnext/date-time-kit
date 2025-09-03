#!/bin/bash

# 项目路径
PROJECT_ROOT=$(pwd)
WEB_COMPONENT_DIR="$PROJECT_ROOT/packages/web-component"
DEMO_DIR="$PROJECT_ROOT/examples/web-component-demo"
DEV_PORT=3000

# 检查 fswatch 是否安装
check_fswatch() {
    if ! command -v fswatch &> /dev/null; then
        echo "错误: fswatch 未安装。请运行: brew install fswatch"
        exit 1
    fi
}

# 停止开发服务器
stop_dev_server() {
    # 直接杀死占用端口的进程
    local port_pid=$(lsof -ti:$DEV_PORT 2>/dev/null)
    if [ ! -z "$port_pid" ]; then
        echo "停止开发服务器..."
        kill $port_pid 2>/dev/null
        sleep 1
        # 如果进程仍在运行，强制杀死
        if kill -0 $port_pid 2>/dev/null; then
            kill -9 $port_pid 2>/dev/null
        fi
    fi
}

# 构建 web-component
build_web_component() {
    cd "$WEB_COMPONENT_DIR"
    pnpm build
}

# 启动开发服务器
start_dev_server() {
    cd "$DEMO_DIR"
    pnpm dev &
    sleep 2
}

# 处理文件变更
handle_file_change() {
    local changed_file="$1"
    echo "文件变更: $changed_file"
    
    stop_dev_server
    build_web_component
    start_dev_server
}

# 清理函数
cleanup() {
    stop_dev_server
    exit 0
}

# 初始化
init() {
    # 检查目录是否存在
    if [ ! -d "$WEB_COMPONENT_DIR" ]; then
        echo "错误: web-component 目录不存在: $WEB_COMPONENT_DIR"
        exit 1
    fi
    
    if [ ! -d "$DEMO_DIR" ]; then
        echo "错误: demo 目录不存在: $DEMO_DIR"
        exit 1
    fi
    
    stop_dev_server
    build_web_component
    start_dev_server
}

# 主函数
main() {
    echo "启动文件监听..."
    
    check_fswatch
    trap cleanup SIGINT SIGTERM
    init
    
    echo "监听 packages/web-component 目录，按 Ctrl+C 停止"
    
    fswatch --recursive \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude="\.git" \
        --exclude="\.DS_Store" \
        --exclude=".*\.log" \
        "$WEB_COMPONENT_DIR" | while read file; do
        handle_file_change "$file"
    done
}

# 启动主程序
main
