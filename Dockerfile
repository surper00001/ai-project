# 使用官方Node.js 18镜像作为基础镜像
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies，构建时需要）
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:18-alpine AS runner

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/prisma ./prisma

# 复制必要的运行时依赖
COPY --from=base /app/node_modules ./node_modules

# 设置权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
