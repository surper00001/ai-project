# 🚀 快速配置指南

## 1️⃣ 创建 Vercel Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **"Storage"** 标签
4. 点击 **"Create Database"**
5. 选择 **"Postgres"**
6. 输入数据库名称: `ai-project-db`
7. 点击 **"Create"**

## 2️⃣ 复制环境变量

创建数据库后，Vercel 会自动生成数据库连接信息。在 Vercel 控制台中设置以下环境变量：

### 必需的环境变量:

```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=us7/XqCrmVcxSYnSf9eDecP9+pc/a8szWx8rBwzD8U4=
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 可选的环境变量 (OAuth 登录):

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 3️⃣ 设置环境变量的步骤

1. 在 Vercel 控制台中，点击 **"Settings"** 标签
2. 点击 **"Environment Variables"** 部分
3. 点击 **"Add New"** 按钮
4. 输入变量名和值
5. 确保选择 **"Production"** 环境
6. 点击 **"Save"**

## 4️⃣ 重新部署

设置完环境变量后，点击 **"Deployments"** 标签，然后点击 **"Redeploy"** 按钮。

## ⚡ 一键配置脚本

你也可以运行配置脚本来自动生成环境变量：

```bash
node setup-vercel-env.js
```

## 🎯 重要提醒

- ✅ **在 Vercel 控制台中设置环境变量**
- ❌ **不要在 `vercel.json` 中配置环境变量**
- 🔄 **设置环境变量后需要重新部署**
- 🌐 **NEXTAUTH_URL 必须与你的实际 Vercel 应用 URL 匹配**

## 🆘 遇到问题？

1. 检查环境变量是否正确设置
2. 确保所有变量都设置为 "Production" 环境
3. 重新部署项目
4. 查看 Vercel 部署日志中的错误信息



