import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  // 暂时禁用Prisma适配器，使用JWT策略
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Authorization attempt for:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log("❌ User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.log("❌ User has no password set:", credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for:", credentials.email);
            return null;
          }

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
  session: {
    strategy: "jwt" as const, // Keep JWT for better compatibility with credentials provider
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Add error page
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user }: { session: any; user: any }) {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
};
