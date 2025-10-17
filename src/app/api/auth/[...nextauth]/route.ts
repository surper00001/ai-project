import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js 认证处理器
 * 
 * 这个文件是NextAuth.js的核心路由处理器，负责处理所有认证相关的请求：
 * - GET请求：处理登录、登出、会话检查等认证流程
 * - POST请求：处理认证表单提交、回调处理等
 * 
 * 使用动态路由 [...nextauth] 来捕获所有 /api/auth/* 路径的请求
 * 包括但不限于：
 * - /api/auth/signin - 登录页面
 * - /api/auth/signout - 登出处理
 * - /api/auth/session - 获取当前会话
 * - /api/auth/csrf - CSRF令牌
 * - /api/auth/providers - 获取认证提供商信息
 * - /api/auth/callback/* - OAuth回调处理
 */
const handler = NextAuth(authOptions);

// 导出GET和POST处理器，支持所有认证相关的HTTP方法
export { handler as GET, handler as POST };
