import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 部署配置
  serverExternalPackages: ['@prisma/client'],
  
  // 图片优化配置
  images: {
    domains: ['localhost'],
  },
  
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
