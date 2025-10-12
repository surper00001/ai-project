# Ubuntu 服务器部署指南

本指南将帮助你在 Ubuntu 服务器上部署 AI Project Next.js 应用。

## 前置要求

- Ubuntu 20.04+ 服务器
- 服务器 root 权限或 sudo 权限
- 域名（可选，用于 HTTPS）
- GitHub 仓库（用于代码管理）

## 部署方式选择

### 方式一：自动化部署（推荐）

使用提供的自动化脚本，一键完成所有配置。

### 方式二：手动部署

逐步手动配置每个组件。

## 方式一：自动化部署

### 1. 准备服务器

```bash
# 连接到服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y
```

### 2. 上传部署脚本

```bash
# 在本地创建脚本文件
# 将 server-deploy.sh 内容复制到服务器

# 或者使用 scp 上传
scp server-deploy.sh root@your-server-ip:/root/
```

### 3. 修改配置

编辑脚本中的配置变量：

```bash
nano server-deploy.sh
```

修改以下变量：
```bash
REPO_URL="https://github.com/your-username/your-repo.git"  # 你的仓库地址
DOMAIN="your-domain.com"  # 你的域名
```

### 4. 运行自动化部署

```bash
# 给脚本执行权限
chmod +x server-deploy.sh

# 运行初始设置
./server-deploy.sh setup
```

### 5. 配置环境变量

```bash
# 编辑环境变量文件
nano /opt/ai-project/.env
```

设置必要的环境变量：
```env
DATABASE_URL="postgresql://postgres:your_secure_password@postgres:5432/ai_project"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your_nextauth_secret_here"
POSTGRES_PASSWORD="your_secure_password"
```

### 6. 启动服务

```bash
# 启动应用
systemctl start ai-project

# 查看状态
systemctl status ai-project
```

## 方式二：手动部署

### 1. 安装 Docker

```bash
# 更新包列表
apt update

# 安装必要的软件包
apt install -y curl wget git nginx

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 启动 Docker 服务
systemctl start docker
systemctl enable docker
```

### 2. 创建项目用户

```bash
# 创建专用用户
useradd -r -s /bin/bash -d /opt/ai-project -m ai-project
usermod -aG docker ai-project
```

### 3. 克隆项目代码

```bash
# 切换到项目用户
su - ai-project

# 克隆代码
git clone https://github.com/your-username/your-repo.git /opt/ai-project
cd /opt/ai-project

# 设置权限
chown -R ai-project:ai-project /opt/ai-project
```

### 4. 配置环境变量

```bash
# 复制环境变量文件
cp env.example .env

# 编辑环境变量
nano .env
```

### 5. 构建和启动应用

```bash
# 构建并启动
docker-compose -f docker-compose.prod.yml up --build -d

# 等待服务启动
sleep 15

# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# 生成 Prisma 客户端
docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
```

### 6. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
cat > /etc/nginx/sites-available/ai-project << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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
EOF

# 启用站点
ln -s /etc/nginx/sites-available/ai-project /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx
```

### 7. 配置 SSL 证书（可选）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

### 8. 创建系统服务

```bash
# 创建 systemd 服务文件
cat > /etc/systemd/system/ai-project.service << 'EOF'
[Unit]
Description=AI Project Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ai-project
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=ai-project
Group=ai-project

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启用服务
systemctl enable ai-project

# 启动服务
systemctl start ai-project
```

## 配置 GitHub Actions 自动部署

### 1. 设置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `HOST`: 服务器 IP 地址
- `USERNAME`: 服务器用户名
- `SSH_KEY`: 服务器 SSH 私钥
- `PORT`: SSH 端口（默认 22）

### 2. 生成 SSH 密钥对

```bash
# 在服务器上生成密钥对
ssh-keygen -t rsa -b 4096 -C "deploy@your-domain.com"

# 将公钥添加到 authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# 将私钥内容复制到 GitHub Secrets
cat ~/.ssh/id_rsa
```

### 3. 推送代码触发部署

```bash
# 在本地推送代码
git add .
git commit -m "Deploy to production"
git push origin main
```

## 常用管理命令

### 查看服务状态

```bash
# 查看应用状态
systemctl status ai-project

# 查看 Docker 容器
docker ps

# 查看应用日志
docker-compose -f /opt/ai-project/docker-compose.prod.yml logs -f
```

### 更新应用

```bash
# 手动更新
cd /opt/ai-project
sudo -u ai-project git pull origin main
sudo -u ai-project docker-compose -f docker-compose.prod.yml up --build -d

# 或使用脚本
./server-deploy.sh update
```

### 备份数据库

```bash
# 创建备份
docker-compose -f /opt/ai-project/docker-compose.prod.yml exec postgres pg_dump -U postgres ai_project > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
docker-compose -f /opt/ai-project/docker-compose.prod.yml exec -T postgres psql -U postgres ai_project < backup.sql
```

### 重启服务

```bash
# 重启应用
systemctl restart ai-project

# 重启 Nginx
systemctl restart nginx

# 重启 Docker
systemctl restart docker
```

## 安全配置

### 1. 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 配置防火墙规则
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 2. 配置 fail2ban

```bash
# 安装 fail2ban
apt install -y fail2ban

# 配置 fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

# 重启 fail2ban
systemctl restart fail2ban
systemctl enable fail2ban
```

### 3. 更新系统

```bash
# 设置自动更新
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 监控和日志

### 1. 查看日志

```bash
# 应用日志
docker-compose -f /opt/ai-project/docker-compose.prod.yml logs -f app

# 数据库日志
docker-compose -f /opt/ai-project/docker-compose.prod.yml logs -f postgres

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u ai-project -f
```

### 2. 监控资源使用

```bash
# 查看系统资源
htop

# 查看 Docker 资源使用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

## 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 查看详细日志
   docker-compose -f /opt/ai-project/docker-compose.prod.yml logs app
   
   # 检查环境变量
   cat /opt/ai-project/.env
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose -f /opt/ai-project/docker-compose.prod.yml exec postgres pg_isready -U postgres
   
   # 检查网络连接
   docker network ls
   ```

3. **Nginx 配置错误**
   ```bash
   # 测试 Nginx 配置
   nginx -t
   
   # 查看 Nginx 错误日志
   tail -f /var/log/nginx/error.log
   ```

4. **SSL 证书问题**
   ```bash
   # 检查证书状态
   certbot certificates
   
   # 手动续期
   certbot renew --dry-run
   ```

### 性能优化

1. **启用 Gzip 压缩**
   ```bash
   # 在 Nginx 配置中添加
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **配置缓存**
   ```bash
   # 在 Nginx 配置中添加
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **限制请求大小**
   ```bash
   # 在 Nginx 配置中添加
   client_max_body_size 10M;
   ```

## 维护建议

1. **定期备份**
   - 设置自动数据库备份
   - 备份应用代码和配置

2. **监控系统**
   - 设置系统监控
   - 配置告警通知

3. **安全更新**
   - 定期更新系统包
   - 更新 Docker 镜像

4. **日志管理**
   - 设置日志轮转
   - 定期清理旧日志

## 支持

如果遇到问题，请检查：
1. 服务器系统日志
2. 应用日志
3. 网络连接
4. 配置文件

更多信息请参考：
- [Docker 官方文档](https://docs.docker.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Nginx 配置指南](https://nginx.org/en/docs/)
