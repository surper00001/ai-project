import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境优化配置
  serverExternalPackages: ['@prisma/client'],
  
  // 图片优化配置
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'production', // 生产环境禁用图片优化以提升性能
  },
  
  // 环境变量配置
  env: {
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    QWEN_API_URL: process.env.QWEN_API_URL,
  },
  
  // 生产环境优化
  compress: true,
  poweredByHeader: false,
  
  // 输出配置
  output: 'standalone', // 支持Docker部署
  
  // 实验性功能已移除，使用 serverExternalPackages
};

export default nextConfig;
