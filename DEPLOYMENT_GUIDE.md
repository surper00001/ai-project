# AI Project - Ubuntu 服务器部署指南

## 部署前准备

### 1. 服务器环境要求
- Ubuntu 18.04+ 
- Node.js 18+
- PostgreSQL 12+
- Nginx
- PM2 (进程管理)

### 2. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2

# 安装 Git
sudo apt install git -y
```

### 3. 配置 PostgreSQL

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE ai_project;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ai_project TO postgres;
\q
```

## 部署步骤

### 1. 克隆项目

```bash
# 创建项目目录
mkdir -p /var/www/ai-project
cd /var/www/ai-project

# 克隆代码
git clone https://github.com/your-username/ai-project.git .

# 或者如果已有代码，直接拉取
git pull origin main
```

### 2. 配置环境变量

```bash
# 复制生产环境配置
cp env.production .env.production

# 编辑环境变量 (重要：修改数据库密码和域名)
nano .env.production
```

**必须修改的配置：**
- `DATABASE_URL`: 数据库连接字符串
- `NEXTAUTH_URL`: 你的域名或IP地址
- `NEXTAUTH_SECRET`: 生成新的密钥

### 3. 执行部署

```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 4. 启动应用

#### 方式1: 直接启动
```bash
npm run start:prod
```

#### 方式2: 使用 PM2 (推荐)
```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start pm2.config.js

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/ai-project

# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-project /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 更新部署

当代码更新时，只需执行：

```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy.sh

# 重启应用
pm2 restart ai-project
```

## 监控和维护

### 查看应用状态
```bash
# PM2 状态
pm2 status

# 查看日志
pm2 logs ai-project

# 查看系统资源
pm2 monit
```

### 查看 Nginx 日志
```bash
# 访问日志
sudo tail -f /var/log/nginx/ai-project.access.log

# 错误日志
sudo tail -f /var/log/nginx/ai-project.error.log
```

### 数据库管理
```bash
# 进入数据库
sudo -u postgres psql ai_project

# 查看表
\dt

# 退出
\q
```

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查环境变量是否正确
   - 检查数据库连接
   - 查看 PM2 日志: `pm2 logs ai-project`

2. **Nginx 502 错误**
   - 检查应用是否在运行: `pm2 status`
   - 检查端口是否正确: `netstat -tlnp | grep 3000`

3. **数据库连接失败**
   - 检查 PostgreSQL 是否运行: `sudo systemctl status postgresql`
   - 检查数据库配置和密码

### 性能优化

1. **启用 Gzip 压缩**
2. **配置静态文件缓存**
3. **使用 CDN**
4. **数据库连接池优化**

## 安全建议

1. **防火墙配置**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **SSL 证书** (推荐使用 Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

3. **定期备份数据库**
```bash
# 创建备份脚本
sudo crontab -e
# 添加: 0 2 * * * pg_dump ai_project > /backup/ai_project_$(date +\%Y\%m\%d).sql
```

## 联系支持

如果遇到问题，请检查：
1. 日志文件
2. 环境变量配置
3. 网络连接
4. 数据库状态
