#!/bin/bash

# AI Project Docker 部署脚本
# 使用方法: ./deploy.sh [dev|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "Docker 和 Docker Compose 已安装"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，从 env.example 复制"
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "请编辑 .env 文件设置正确的环境变量"
            exit 1
        else
            print_error "env.example 文件不存在"
            exit 1
        fi
    fi
    print_message "环境变量文件检查完成"
}

# 构建和启动开发环境
deploy_dev() {
    print_message "开始部署开发环境..."
    
    # 停止现有容器
    docker-compose down
    
    # 构建并启动
    docker-compose up --build -d
    
    # 等待数据库启动
    print_message "等待数据库启动..."
    sleep 10
    
    # 运行数据库迁移
    print_message "运行数据库迁移..."
    docker-compose exec -T app npx prisma migrate deploy || true
    
    # 生成 Prisma 客户端
    print_message "生成 Prisma 客户端..."
    docker-compose exec -T app npx prisma generate || true
    
    print_message "开发环境部署完成！"
    print_message "应用地址: http://localhost:3000"
}

# 构建和启动生产环境
deploy_prod() {
    print_message "开始部署生产环境..."
    
    # 停止现有容器
    docker-compose -f docker-compose.prod.yml down
    
    # 构建并启动
    docker-compose -f docker-compose.prod.yml up --build -d
    
    # 等待数据库启动
    print_message "等待数据库启动..."
    sleep 15
    
    # 运行数据库迁移
    print_message "运行数据库迁移..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy || true
    
    # 生成 Prisma 客户端
    print_message "生成 Prisma 客户端..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate || true
    
    print_message "生产环境部署完成！"
    print_message "应用地址: http://localhost:3000"
}

# 显示帮助信息
show_help() {
    echo "AI Project Docker 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh dev     - 部署开发环境"
    echo "  ./deploy.sh prod    - 部署生产环境"
    echo "  ./deploy.sh help    - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh dev"
    echo "  ./deploy.sh prod"
}

# 主函数
main() {
    local environment=${1:-dev}
    
    case $environment in
        "dev")
            check_docker
            check_env_file
            deploy_dev
            ;;
        "prod")
            check_docker
            check_env_file
            deploy_prod
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知的环境: $environment"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
