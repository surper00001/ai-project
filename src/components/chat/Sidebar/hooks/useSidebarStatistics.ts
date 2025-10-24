'use client';

import { useMemo } from 'react';
import { ChatSession } from './useSidebarState';

/**
 * 侧边栏统计信息Hook
 * 计算会话相关的统计信息
 */
export function useSidebarStatistics(sessions: ChatSession[]) {
  /**
   * 计算统计信息
   * 包括总会话数、总消息数、平均消息数、内存使用量等
   */
  const statistics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
    const memoryUsage = sessions.reduce((sum, session) => {
      const sessionSize = JSON.stringify(session).length;
      return sum + sessionSize;
    }, 0) / 1024; // 转换为KB

    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession,
      memoryUsage
    };
  }, [sessions]);

  return statistics;
}







