# 数据库配置指南

## 🚀 快速配置 Vercel Postgres (推荐)

### 步骤 1: 创建 Vercel Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "Postgres"
6. 输入数据库名称 (例如: `ai-project-db`)
7. 选择地区 (推荐选择离你最近的地区)
8. 点击 "Create"

### 步骤 2: 获取数据库连接信息

创建完成后，Vercel 会自动生成：
- `DATABASE_URL` - 主连接字符串
- `DIRECT_URL` - 直接连接字符串 (通常与 DATABASE_URL 相同)

### 步骤 3: 设置环境变量

在 Vercel 控制台中设置以下环境变量：

```bash
# 数据库连接 (Vercel 会自动提供)
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# NextAuth 配置
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=us7/XqCrmVcxSYnSf9eDecP9+pc/a8szWx8rBwzD8U4=

# 其他配置
NODE_ENV=production
```

### 步骤 4: 运行数据库迁移

部署后，在 Vercel 控制台的 "Functions" 标签中运行：

```bash
npx prisma db push
```

## 🔧 其他数据库选项

### PlanetScale (MySQL)
- 免费额度: 5GB 存储
- 连接字符串格式: `mysql://username:password@host/database`

### Supabase (PostgreSQL)
- 免费额度: 500MB 存储
- 连接字符串格式: `postgresql://username:password@host:port/database`

### Railway (PostgreSQL)
- 免费额度: 1GB 存储
- 连接字符串格式: `postgresql://username:password@host:port/database`

## 📝 环境变量完整列表

```bash
# 必需的环境变量
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=us7/XqCrmVcxSYnSf9eDecP9+pc/a8szWx8rBwzD8U4=
DATABASE_URL=your-database-connection-string
DIRECT_URL=your-database-connection-string
NODE_ENV=production

# 可选的环境变量 (OAuth 登录)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## ⚠️ 注意事项

1. **不要**在 `vercel.json` 中配置环境变量
2. **必须**在 Vercel 控制台中设置环境变量
3. 确保所有环境变量都设置为 "Production" 环境
4. `NEXTAUTH_URL` 必须与你的实际 Vercel 应用 URL 匹配
5. 数据库连接字符串格式必须正确
