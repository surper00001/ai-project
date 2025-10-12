#!/bin/bash

# Ubuntu 服务器部署脚本
# 使用方法: ./server-deploy.sh [setup|deploy|update]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="ai-project"
PROJECT_DIR="/opt/$PROJECT_NAME"
SERVICE_USER="ai-project"
REPO_URL="https://github.com/your-username/your-repo.git"  # 替换为你的仓库地址
DOMAIN="your-domain.com"  # 替换为你的域名

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 安装必要的软件包
install_dependencies() {
    print_step "安装系统依赖..."
    
    # 更新包列表
    apt update
    
    # 安装必要的软件包
    apt install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        nano \
        unzip
    
    print_message "系统依赖安装完成"
}

# 安装 Docker
install_docker() {
    print_step "安装 Docker..."
    
    # 移除旧版本
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
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
    
    print_message "Docker 安装完成"
}

# 创建项目用户
create_user() {
    print_step "创建项目用户..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/bash -d "$PROJECT_DIR" -m "$SERVICE_USER"
        usermod -aG docker "$SERVICE_USER"
        print_message "用户 $SERVICE_USER 创建完成"
    else
        print_message "用户 $SERVICE_USER 已存在"
    fi
}

# 配置防火墙
setup_firewall() {
    print_step "配置防火墙..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    print_message "防火墙配置完成"
}

# 配置 fail2ban
setup_fail2ban() {
    print_step "配置 fail2ban..."
    
    cat > /etc/fail2ban/jail.local << EOF
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
    
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    print_message "fail2ban 配置完成"
}

# 克隆项目代码
clone_project() {
    print_step "克隆项目代码..."
    
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "项目目录已存在，备份现有代码..."
        mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 克隆代码
    git clone "$REPO_URL" "$PROJECT_DIR"
    
    # 设置权限
    chown -R "$SERVICE_USER:$SERVICE_USER" "$PROJECT_DIR"
    
    print_message "项目代码克隆完成"
}

# 配置环境变量
setup_environment() {
    print_step "配置环境变量..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "已创建 .env 文件，请编辑配置："
            print_warning "nano $PROJECT_DIR/.env"
        else
            print_error "env.example 文件不存在"
            exit 1
        fi
    fi
    
    # 设置权限
    chown "$SERVICE_USER:$SERVICE_USER" .env
    chmod 600 .env
    
    print_message "环境变量配置完成"
}

# 配置 Nginx
setup_nginx() {
    print_step "配置 Nginx..."
    
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 代理到应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_message "Nginx 配置完成"
}

# 获取 SSL 证书
setup_ssl() {
    print_step "获取 SSL 证书..."
    
    # 临时禁用 HTTPS 重定向
    sed -i 's/return 301/#return 301/' /etc/nginx/sites-available/$PROJECT_NAME
    systemctl reload nginx
    
    # 获取证书
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN"
    
    # 恢复 HTTPS 重定向
    sed -i 's/#return 301/return 301/' /etc/nginx/sites-available/$PROJECT_NAME
    systemctl reload nginx
    
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_message "SSL 证书配置完成"
}

# 创建系统服务
create_systemd_service() {
    print_step "创建系统服务..."
    
    cat > /etc/systemd/system/$PROJECT_NAME.service << EOF
[Unit]
Description=AI Project Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=$SERVICE_USER
Group=$SERVICE_USER

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable $PROJECT_NAME
    
    print_message "系统服务创建完成"
}

# 部署应用
deploy_app() {
    print_step "部署应用..."
    
    cd "$PROJECT_DIR"
    
    # 切换到项目用户
    sudo -u "$SERVICE_USER" bash << EOF
cd $PROJECT_DIR

# 拉取最新代码
git pull origin main

# 构建并启动
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# 等待服务启动
sleep 15

# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy || true

# 生成 Prisma 客户端
docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate || true
EOF
    
    print_message "应用部署完成"
}

# 更新应用
update_app() {
    print_step "更新应用..."
    
    cd "$PROJECT_DIR"
    
    # 切换到项目用户
    sudo -u "$SERVICE_USER" bash << EOF
cd $PROJECT_DIR

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up --build -d

# 等待服务启动
sleep 15

# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy || true
EOF
    
    print_message "应用更新完成"
}

# 显示状态
show_status() {
    print_step "服务状态："
    
    echo "Docker 服务："
    systemctl status docker --no-pager -l
    
    echo -e "\n应用服务："
    systemctl status $PROJECT_NAME --no-pager -l
    
    echo -e "\nNginx 服务："
    systemctl status nginx --no-pager -l
    
    echo -e "\nDocker 容器："
    docker ps
    
    echo -e "\n应用日志："
    docker-compose -f "$PROJECT_DIR/docker-compose.prod.yml" logs --tail=20
}

# 显示帮助信息
show_help() {
    echo "Ubuntu 服务器部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 setup    - 初始服务器设置"
    echo "  $0 deploy   - 部署应用"
    echo "  $0 update   - 更新应用"
    echo "  $0 status   - 查看服务状态"
    echo "  $0 help     - 显示帮助信息"
    echo ""
    echo "注意："
    echo "  1. 请先修改脚本中的 REPO_URL 和 DOMAIN 变量"
    echo "  2. 确保服务器可以访问 GitHub 仓库"
    echo "  3. 确保域名已正确解析到服务器 IP"
}

# 主函数
main() {
    local action=${1:-help}
    
    case $action in
        "setup")
            check_root
            install_dependencies
            install_docker
            create_user
            setup_firewall
            setup_fail2ban
            clone_project
            setup_environment
            setup_nginx
            setup_ssl
            create_systemd_service
            deploy_app
            print_message "服务器设置完成！"
            print_message "请访问: https://$DOMAIN"
            ;;
        "deploy")
            check_root
            deploy_app
            ;;
        "update")
            check_root
            update_app
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知的操作: $action"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
