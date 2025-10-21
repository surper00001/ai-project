#!/bin/bash

# Docker部署脚本
# 使用方法: ./deploy-docker.sh

set -e

echo "🚀 开始Docker部署..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo "❌ 未找到.env.production文件，请先创建环境变量文件"
    echo "请参考env.example文件创建.env.production"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理未使用的镜像
echo "🧹 清理未使用的Docker镜像..."
docker system prune -f

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 10

# 运行数据库迁移
echo "📊 运行数据库迁移..."
docker-compose exec app npx prisma migrate deploy

# 检查服务状态
echo "✅ 检查服务状态..."
docker-compose ps

echo "🎉 部署完成！"
echo "🌐 应用访问地址: http://your-server-ip:3000"
echo "🌐 Nginx代理地址: http://your-server-ip:80"
echo ""
echo "📝 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  查看应用日志: docker-compose logs -f app"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  进入容器: docker-compose exec app sh"
