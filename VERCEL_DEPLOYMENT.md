# Vercel 部署指南

## 部署前准备

### 1. 环境变量配置

在 Vercel 控制台中设置以下环境变量：

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

如果遇到问题，请检查：
1. 环境变量是否正确设置
2. 数据库连接是否正常
3. NextAuth 配置是否正确
4. API 路由是否有错误
