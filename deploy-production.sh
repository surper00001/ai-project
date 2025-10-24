#!/bin/bash

# ===========================================
# AI Project - 生产环境部署脚本
# 服务器IP: 39.96.218.145
# ===========================================

set -e  # 遇到错误立即退出

echo "🚀 开始部署 AI Project 到生产环境..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查环境变量文件
if [ ! -f "env.production" ]; then
    echo -e "${RED}❌ 错误: 找不到 env.production 文件${NC}"
    echo "请确保 env.production 文件存在并配置正确"
    exit 1
fi

echo -e "${YELLOW}📋 检查生产环境配置...${NC}"

# 加载环境变量
export $(cat env.production | grep -v '^#' | xargs)

# 检查必要的环境变量
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "QWEN_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ 错误: 环境变量 $var 未设置${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ 环境变量检查通过${NC}"

# 停止现有容器
echo -e "${YELLOW}🛑 停止现有容器...${NC}"
docker-compose down || true

# 清理旧镜像
echo -e "${YELLOW}🧹 清理旧镜像...${NC}"
docker image prune -f || true

# 构建新镜像
echo -e "${YELLOW}🏗️  构建应用镜像...${NC}"
docker-compose build --no-cache

# 启动服务
echo -e "${YELLOW}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${YELLOW}🔍 检查服务状态...${NC}"
docker-compose ps

# 检查应用健康状态
echo -e "${YELLOW}🏥 检查应用健康状态...${NC}"
if curl -f http://localhost:3000/api/auth/session > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 应用健康检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  应用可能还在启动中，请稍后检查${NC}"
fi

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo -e "${BLUE}📝 部署信息：${NC}"
echo "🌐 应用地址: http://39.96.218.145"
echo "🔧 管理命令:"
echo "  - 查看日志: docker-compose logs -f"
echo "  - 重启服务: docker-compose restart"
echo "  - 停止服务: docker-compose down"
echo "  - 更新应用: docker-compose pull && docker-compose up -d"
echo ""
echo -e "${BLUE}🔍 故障排除：${NC}"
echo "  - 检查端口占用: netstat -tlnp | grep :80"
echo "  - 检查数据库连接: docker-compose exec app npx prisma db push"
echo "  - 查看详细日志: docker-compose logs app"
