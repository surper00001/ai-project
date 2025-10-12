# Docker 部署指南

本文档介绍如何使用 Docker 部署 AI Project Next.js 应用。

## 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)
- Git

## 快速开始

### 1. 克隆项目并准备环境

```bash
# 克隆项目
git clone <your-repository-url>
cd ai-project

# 复制环境变量文件
cp env.example .env

# 编辑环境变量文件，设置你的配置
nano .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置以下关键变量：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:your_secure_password_here@postgres:5432/ai_project"

# NextAuth 配置
NEXTAUTH_URL="http://your-domain.com"  # 生产环境使用你的域名
NEXTAUTH_SECRET="your_nextauth_secret_here"  # 生成一个强密码

# 应用配置
NODE_ENV="production"
```

### 3. 构建和启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec app npx prisma migrate deploy

# 生成 Prisma 客户端
docker-compose exec app npx prisma generate
```

### 5. 访问应用

- 应用地址: http://localhost:3000
- 数据库: localhost:5432

## 生产环境部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 配置域名和 SSL

```bash
# 安装 Nginx
sudo apt install nginx -y

# 配置反向代理
sudo nano /etc/nginx/sites-available/ai-project
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 使用 Let's Encrypt 配置 SSL

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. 生产环境 docker-compose.yml

创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ai-project-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ai_project
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ai-project-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ai-project-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres
    networks:
      - ai-project-network

volumes:
  postgres_data:

networks:
  ai-project-network:
    driver: bridge
```

## 常用命令

### 开发环境

```bash
# 启动开发环境
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建
docker-compose up --build -d
```

### 生产环境

```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 更新应用
git pull
docker-compose -f docker-compose.prod.yml up --build -d

# 备份数据库
docker-compose exec postgres pg_dump -U postgres ai_project > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres ai_project < backup.sql
```

### 数据库管理

```bash
# 进入数据库容器
docker-compose exec postgres psql -U postgres -d ai_project

# 运行 Prisma 迁移
docker-compose exec app npx prisma migrate deploy

# 重置数据库
docker-compose exec app npx prisma migrate reset

# 查看数据库状态
docker-compose exec app npx prisma migrate status
```

## 监控和日志

### 查看应用日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f postgres
```

### 监控资源使用

```bash
# 查看容器资源使用情况
docker stats

# 查看容器详细信息
docker-compose ps
```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5432
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **应用启动失败**
   ```bash
   # 查看详细错误日志
   docker-compose logs app
   ```

4. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R $USER:$USER .
   ```

### 性能优化

1. **启用 Docker BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

2. **使用多阶段构建缓存**
   ```bash
   docker-compose build --parallel
   ```

3. **配置资源限制**
   在 `docker-compose.yml` 中添加：
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

## 安全建议

1. **更改默认密码**
   - 数据库密码
   - NextAuth 密钥
   - 其他敏感信息

2. **使用环境变量**
   - 不要在代码中硬编码敏感信息
   - 使用 `.env` 文件管理环境变量

3. **定期更新**
   ```bash
   # 更新 Docker 镜像
   docker-compose pull
   docker-compose up -d
   ```

4. **备份策略**
   ```bash
   # 创建备份脚本
   #!/bin/bash
   docker-compose exec postgres pg_dump -U postgres ai_project > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## 支持

如果遇到问题，请检查：
1. Docker 和 Docker Compose 版本
2. 环境变量配置
3. 网络连接
4. 日志文件

更多信息请参考：
- [Docker 官方文档](https://docs.docker.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
