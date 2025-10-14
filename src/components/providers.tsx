"use client";

// @ts-expect-error - next-auth type definitions issue
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState } from "react";

/**
 * 应用提供者组件
 * 包含会话管理、查询客户端和主题管理
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 创建React Query客户端实例
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 设置查询的默认配置
        staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
        retry: 3, // 失败时重试3次
        refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取数据
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          {/* 开发环境下显示React Query开发工具 */}
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
