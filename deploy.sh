#!/bin/bash

# ===========================================
# AI Project - Ubuntu 服务器部署脚本
# ===========================================

set -e  # 遇到错误立即退出

echo "🚀 开始部署 AI Project..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境变量文件
if [ ! -f "env.production" ]; then
    echo -e "${RED}❌ 错误: 找不到 env.production 文件${NC}"
    echo "请确保 env.production 文件存在并配置正确"
    exit 1
fi

echo -e "${YELLOW}📋 检查环境配置...${NC}"

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

# 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm ci --production=false

# 生成 Prisma 客户端
echo -e "${YELLOW}🔧 生成 Prisma 客户端...${NC}"
npm run db:generate

# 数据库迁移
echo -e "${YELLOW}🗄️  执行数据库迁移...${NC}"
npm run db:migrate

# 构建生产版本
echo -e "${YELLOW}🏗️  构建生产版本...${NC}"
npm run build:prod

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📝 下一步操作："
echo "1. 启动应用: npm run start:prod"
echo "2. 或使用 PM2: pm2 start npm --name 'ai-project' -- run start:prod"
echo "3. 配置 Nginx 反向代理到端口 3000"
echo ""
echo "🔗 应用将在 http://localhost:3000 运行"
