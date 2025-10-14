# Vercel 部署指南

## 部署前准备

### 1. 环境变量配置

**重要：** 环境变量必须在 Vercel 控制台中设置，不要在 `vercel.json` 中配置！

#### 在 Vercel 控制台中设置环境变量的步骤：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 点击 "Environment Variables" 部分
5. 添加以下环境变量：

```bash
# NextAuth 配置
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# 数据库配置 (推荐使用 Vercel Postgres 或 PlanetScale)
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# OAuth 提供商配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 其他配置
NODE_ENV=production
```

#### 环境变量设置注意事项：

- **NEXTAUTH_URL**: 设置为你的 Vercel 应用 URL，例如 `https://your-app.vercel.app`
- **NEXTAUTH_SECRET**: 生成一个随机字符串，可以使用 `openssl rand -base64 32` 命令生成
- **DATABASE_URL**: 你的数据库连接字符串
- **DIRECT_URL**: 与 DATABASE_URL 相同（用于 Prisma 连接池）
- 确保所有环境变量都设置为 "Production" 环境

### 2. 数据库设置

推荐使用以下数据库服务：
- **Vercel Postgres** (推荐)
- **PlanetScale**
- **Supabase**
- **Railway**

### 3. 部署步骤

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 设置环境变量
4. 部署

### 4. 部署后操作

部署完成后，需要运行数据库迁移：

```bash
npx prisma db push
```

## 注意事项

- 确保所有 TypeScript 类型错误已修复
- 检查所有 API 路由是否正常工作
- 验证身份验证配置
- 测试文件上传功能（如果使用）

## 故障排除

### 常见错误及解决方案：

#### 1. "Environment Variable 'NEXTAUTH_URL' references Secret 'nextauth_url', which does not exist"

**原因：** 在 `vercel.json` 中错误地引用了环境变量

**解决方案：**
- 删除 `vercel.json` 中的 `env` 部分
- 在 Vercel 控制台的 "Environment Variables" 中直接设置环境变量
- 不要使用 `@` 符号引用

#### 2. "NEXTAUTH_URL is not defined"

**解决方案：**
- 在 Vercel 控制台中设置 `NEXTAUTH_URL=https://your-app.vercel.app`
- 确保 URL 与你的实际 Vercel 应用 URL 匹配

#### 3. 数据库连接错误

**解决方案：**
- 检查 `DATABASE_URL` 和 `DIRECT_URL` 是否正确设置
- 确保数据库服务正在运行
- 检查数据库连接字符串格式

#### 4. OAuth 提供商错误

**解决方案：**
- 检查 Google/GitHub OAuth 应用配置
- 确保回调 URL 设置为 `https://your-app.vercel.app/api/auth/callback/google`
- 验证客户端 ID 和密钥是否正确

### 生成 NEXTAUTH_SECRET

如果需要生成新的 NEXTAUTH_SECRET，可以运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 检查清单

部署前请确认：
- [ ] 所有环境变量都在 Vercel 控制台中设置
- [ ] `vercel.json` 中没有 `env` 配置
- [ ] 数据库连接正常
- [ ] OAuth 提供商配置正确
- [ ] NEXTAUTH_URL 设置为正确的 Vercel 应用 URL
