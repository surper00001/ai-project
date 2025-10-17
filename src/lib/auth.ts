import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth.js 认证配置
 * 
 * 这个配置文件定义了应用程序的认证策略和提供商
 * 主要功能：
 * 1. 配置凭据认证提供商（用户名/密码登录）
 * 2. 设置JWT会话策略
 * 3. 定义自定义页面路由
 * 4. 配置回调函数处理用户数据
 */
export const authOptions = {
  // 暂时禁用Prisma适配器，使用JWT策略
  // 使用JWT可以提供更好的性能和兼容性，特别是在无服务器环境中
  // adapter: PrismaAdapter(prisma),
  
  // 认证提供商配置
  providers: [
    // 凭据认证提供商 - 支持用户名/密码登录
    CredentialsProvider({
      name: "credentials", // 提供商名称
      credentials: {
        email: { label: "Email", type: "email" }, // 邮箱字段
        password: { label: "Password", type: "password" }, // 密码字段
      },
      
      /**
       * 用户认证函数
       * 验证用户提供的凭据是否有效
       * @param credentials - 用户提供的登录凭据
       * @returns 认证成功返回用户信息，失败返回null
       */
      async authorize(credentials) {
        try {
          console.log("🔐 Authorization attempt for:", credentials?.email);
          
          // 验证必填字段
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          // 从数据库查找用户
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          // 检查用户是否存在
          if (!user) {
            console.log("❌ User not found:", credentials.email);
            return null;
          }

          // 检查用户是否设置了密码
          if (!user.password) {
            console.log("❌ User has no password set:", credentials.email);
            return null;
          }

          // 验证密码
          // 使用bcrypt比较明文密码和哈希密码
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for:", credentials.email);
            return null;
          }

          // 认证成功，返回用户信息
          console.log("✅ Authentication successful for:", credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  
  // 会话配置
  session: {
    strategy: "jwt" as const, // 使用JWT策略，与凭据提供商兼容性更好
  },
  
  // 自定义页面路由
  pages: {
    signIn: "/auth/signin", // 登录页面路径
    error: "/auth/signin", // 错误页面重定向到登录页
  },
  
  // 回调函数配置
  callbacks: {
    /**
     * JWT回调函数
     * 在JWT令牌创建或更新时调用
     * @param token - JWT令牌对象
     * @param user - 用户对象（仅在登录时提供）
     * @returns 更新后的JWT令牌
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      // 如果是新用户登录，将用户ID添加到令牌中
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    /**
     * 会话回调函数
     * 在会话创建或更新时调用
     * @param session - 会话对象
     * @param user - 用户对象（仅在数据库会话策略时提供）
     * @returns 更新后的会话对象
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user }: { session: any; user: any }) {
      // 将用户ID添加到会话中（从JWT令牌获取）
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  
  // 调试模式配置
  debug: process.env.NODE_ENV === "development", // 仅在开发环境中启用调试模式
};
