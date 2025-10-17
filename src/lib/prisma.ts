import { PrismaClient } from "@prisma/client";

/**
 * Prisma数据库客户端配置
 * 
 * 这个文件配置了Prisma ORM的数据库连接和客户端实例
 * 主要功能：
 * 1. 创建全局Prisma客户端实例
 * 2. 防止在开发环境中创建多个数据库连接
 * 3. 配置日志记录（仅在开发环境中启用）
 * 4. 确保在生产环境中正确管理数据库连接
 */

// 全局类型定义，用于存储Prisma客户端实例
// 在开发环境中，这可以防止热重载时创建多个数据库连接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma客户端实例
 * 
 * 使用单例模式确保整个应用程序只有一个数据库连接实例
 * 在开发环境中，如果已存在实例则复用，否则创建新实例
 * 在生产环境中，每次都会创建新实例
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // 日志配置
  // 在开发环境中记录所有数据库查询，便于调试
  // 在生产环境中禁用日志以提高性能
  log: process.env.NODE_ENV === "development" ? ['query'] : [],
});

// 在开发环境中将Prisma客户端实例存储到全局对象中
// 这样可以防止Next.js的热重载功能创建多个数据库连接
// 在生产环境中不执行此操作，确保每次请求都使用新的连接
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
