# ⚡ Vercel 数据库创建 - 快速步骤

## 🎯 5分钟快速配置

### 1️⃣ 创建数据库
```
Vercel Dashboard → 选择项目 → Storage → Create Database → Postgres
```
- 数据库名称: `ai-project-db`
- 地区: 选择最近的 (推荐 `iad1`)
- 点击 "Create"

### 2️⃣ 设置环境变量
```
项目页面 → Settings → Environment Variables → Add New
```

添加以下变量 (全部设置为 Production 环境):

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | 你的应用 URL |
| `NEXTAUTH_SECRET` | `us7/XqCrmVcxSYnSf9eDecP9+pc/a8szWx8rBwzD8U4=` | 认证密钥 |
| `NODE_ENV` | `production` | 生产环境 |

### 3️⃣ 验证数据库变量
检查是否自动添加了:
- ✅ `DATABASE_URL` (自动生成)
- ✅ `DIRECT_URL` (自动生成)

### 4️⃣ 重新部署
```
Deployments → 最新部署 → ... → Redeploy
```

## 🔍 详细操作截图说明

### 步骤 1: 进入 Storage
1. 登录 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 点击你的项目
3. 点击顶部 **"Storage"** 标签

### 步骤 2: 创建 Postgres 数据库
1. 点击 **"Create Database"**
2. 选择 **"Postgres"**
3. 填写:
   - Name: `ai-project-db`
   - Region: `iad1` (或最近的地区)
4. 点击 **"Create"**

### 步骤 3: 复制连接信息
创建完成后，会显示:
```
Database URL: postgresql://username:password@host:port/database
Direct URL: postgresql://username:password@host:port/database
```

### 步骤 4: 设置环境变量
1. 点击 **"Settings"** 标签
2. 点击 **"Environment Variables"**
3. 点击 **"Add New"** 添加每个变量

### 步骤 5: 重新部署
1. 点击 **"Deployments"** 标签
2. 找到最新部署
3. 点击 **"..."** → **"Redeploy"**

## ✅ 完成检查清单

- [ ] 数据库创建成功
- [ ] 环境变量全部设置 (Production 环境)
- [ ] NEXTAUTH_URL 设置为正确的应用 URL
- [ ] 重新部署完成
- [ ] 应用可以正常访问

## 🆘 如果遇到问题

1. **数据库创建失败**: 检查账户配额
2. **环境变量未自动添加**: 手动复制数据库连接字符串
3. **部署失败**: 检查所有环境变量是否正确设置
4. **应用无法访问**: 确认 NEXTAUTH_URL 设置正确

## 💡 小贴士

- Vercel Postgres 免费额度: 512MB 存储
- 数据库连接字符串会自动添加到环境变量
- 设置环境变量后必须重新部署才能生效
- 所有环境变量都要设置为 "Production" 环境



