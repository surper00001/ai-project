# 🗄️ Vercel Dashboard 数据库创建完整指南

## 📋 前提条件
- 已登录 [Vercel Dashboard](https://vercel.com/dashboard)
- 已导入你的 AI 项目到 Vercel

## 🚀 步骤 1: 进入项目页面

1. 在 Vercel Dashboard 主页，找到你的 AI 项目
2. 点击项目名称进入项目详情页

## 🗄️ 步骤 2: 创建数据库

### 2.1 进入 Storage 页面
1. 在项目页面顶部，点击 **"Storage"** 标签
2. 如果第一次使用，会看到 "Create your first database" 页面

### 2.2 创建 Postgres 数据库
1. 点击 **"Create Database"** 按钮
2. 选择 **"Postgres"** 数据库类型
3. 填写数据库信息：
   - **Database Name**: `ai-project-db` (或你喜欢的名称)
   - **Region**: 选择离你最近的地区 (推荐 `iad1` 或 `hnd1`)
4. 点击 **"Create"** 按钮

### 2.3 等待创建完成
- 创建过程大约需要 1-2 分钟
- 创建完成后会显示数据库连接信息

## ⚙️ 步骤 3: 获取数据库连接信息

创建完成后，Vercel 会自动显示：

```
Database URL: postgresql://username:password@host:port/database
Direct URL: postgresql://username:password@host:port/database
```

**重要**: 这些连接字符串会自动添加到你的环境变量中！

## 🔧 步骤 4: 设置其他环境变量

### 4.1 进入环境变量设置
1. 在项目页面，点击 **"Settings"** 标签
2. 在左侧菜单中点击 **"Environment Variables"**

### 4.2 添加必需的环境变量
点击 **"Add New"** 按钮，逐个添加以下变量：

#### 变量 1: NEXTAUTH_URL
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://your-app-name.vercel.app` (替换为你的实际应用 URL)
- **Environment**: 选择 **"Production"**

#### 变量 2: NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: `us7/XqCrmVcxSYnSf9eDecP9+pc/a8szWx8rBwzD8U4=`
- **Environment**: 选择 **"Production"**

#### 变量 3: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: 选择 **"Production"**

### 4.3 验证数据库变量
检查是否已自动添加：
- `DATABASE_URL` (应该已存在)
- `DIRECT_URL` (应该已存在)

如果没有自动添加，手动添加：
- **Name**: `DATABASE_URL`
- **Value**: 从数据库页面复制的 Database URL
- **Environment**: **"Production"**

- **Name**: `DIRECT_URL`
- **Value**: 从数据库页面复制的 Direct URL
- **Environment**: **"Production"**

## 🔄 步骤 5: 重新部署

### 5.1 触发重新部署
1. 在项目页面，点击 **"Deployments"** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 确认重新部署

### 5.2 等待部署完成
- 部署过程大约需要 2-3 分钟
- 部署完成后，你的应用就可以正常使用了

## ✅ 验证部署

### 检查部署状态
1. 在 Deployments 页面查看部署状态
2. 如果显示 "Ready"，说明部署成功

### 测试应用
1. 点击部署记录中的域名链接
2. 访问你的应用
3. 尝试注册/登录功能

## 🆘 常见问题

### Q: 数据库创建失败
**A**: 检查你的 Vercel 账户是否有足够的配额，免费账户有数据库限制

### Q: 环境变量没有自动添加
**A**: 手动从数据库页面复制连接字符串到环境变量中

### Q: 部署后仍然报错
**A**: 检查所有环境变量是否正确设置，特别是 NEXTAUTH_URL

### Q: 找不到 Storage 标签
**A**: 确保你的 Vercel 账户已升级到支持数据库的版本

## 📊 数据库管理

### 查看数据库状态
1. 在 Storage 页面可以看到数据库状态
2. 显示连接数、存储使用量等信息

### 数据库连接
1. 点击数据库名称进入详情页
2. 可以查看连接字符串、重置密码等

## 🎯 总结

通过以上步骤，你可以：
- ✅ 创建免费的 Vercel Postgres 数据库
- ✅ 自动配置数据库连接环境变量
- ✅ 设置 NextAuth 认证环境变量
- ✅ 成功部署 AI 项目

**无需修改任何代码**，所有配置都在 Vercel Dashboard 中完成！



