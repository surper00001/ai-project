@echo off
REM AI Project Docker 部署脚本 (Windows)
REM 使用方法: deploy.bat [dev|prod]

setlocal enabledelayedexpansion

REM 设置颜色 (Windows 10+)
for /f %%i in ('echo prompt $E ^| cmd') do set "ESC=%%i"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "NC=%ESC%[0m"

REM 打印带颜色的消息
:print_message
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查 Docker 是否安装
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker 未安装，请先安装 Docker Desktop"
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose 未安装，请先安装 Docker Compose"
    exit /b 1
)

call :print_message "Docker 和 Docker Compose 已安装"
goto :eof

REM 检查环境变量文件
:check_env_file
if not exist .env (
    call :print_warning ".env 文件不存在，从 env.example 复制"
    if exist env.example (
        copy env.example .env >nul
        call :print_warning "请编辑 .env 文件设置正确的环境变量"
        exit /b 1
    ) else (
        call :print_error "env.example 文件不存在"
        exit /b 1
    )
)
call :print_message "环境变量文件检查完成"
goto :eof

REM 构建和启动开发环境
:deploy_dev
call :print_message "开始部署开发环境..."

REM 停止现有容器
docker-compose down

REM 构建并启动
docker-compose up --build -d

REM 等待数据库启动
call :print_message "等待数据库启动..."
timeout /t 10 /nobreak >nul

REM 运行数据库迁移
call :print_message "运行数据库迁移..."
docker-compose exec -T app npx prisma migrate deploy

REM 生成 Prisma 客户端
call :print_message "生成 Prisma 客户端..."
docker-compose exec -T app npx prisma generate

call :print_message "开发环境部署完成！"
call :print_message "应用地址: http://localhost:3000"
goto :eof

REM 构建和启动生产环境
:deploy_prod
call :print_message "开始部署生产环境..."

REM 停止现有容器
docker-compose -f docker-compose.prod.yml down

REM 构建并启动
docker-compose -f docker-compose.prod.yml up --build -d

REM 等待数据库启动
call :print_message "等待数据库启动..."
timeout /t 15 /nobreak >nul

REM 运行数据库迁移
call :print_message "运行数据库迁移..."
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

REM 生成 Prisma 客户端
call :print_message "生成 Prisma 客户端..."
docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate

call :print_message "生产环境部署完成！"
call :print_message "应用地址: http://localhost:3000"
goto :eof

REM 显示帮助信息
:show_help
echo AI Project Docker 部署脚本
echo.
echo 使用方法:
echo   deploy.bat dev     - 部署开发环境
echo   deploy.bat prod    - 部署生产环境
echo   deploy.bat help    - 显示帮助信息
echo.
echo 示例:
echo   deploy.bat dev
echo   deploy.bat prod
goto :eof

REM 主函数
:main
set "environment=%1"
if "%environment%"=="" set "environment=dev"

if "%environment%"=="dev" (
    call :check_docker
    if errorlevel 1 exit /b 1
    call :check_env_file
    if errorlevel 1 exit /b 1
    call :deploy_dev
) else if "%environment%"=="prod" (
    call :check_docker
    if errorlevel 1 exit /b 1
    call :check_env_file
    if errorlevel 1 exit /b 1
    call :deploy_prod
) else if "%environment%"=="help" (
    call :show_help
) else (
    call :print_error "未知的环境: %environment%"
    call :show_help
    exit /b 1
)

goto :eof

REM 运行主函数
call :main %*
