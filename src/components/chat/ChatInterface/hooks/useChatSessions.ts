'use client';

import { useEffect, useCallback } from 'react';
import { ChatSession } from './useChatState';
import { historyManager } from '@/lib/historyManager';

/**
 * 聊天会话管理Hook
 * 处理会话的CRUD操作和历史记录管理
 */
export function useChatSessions(
  sessions: ChatSession[],
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>,
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>,
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  /**
   * 初始化历史记录管理器
   */
  useEffect(() => {
    historyManager.setSessions(sessions);
  }, [sessions]);

  /**
   * 加载所有会话
   */
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        console.error('Failed to load sessions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, [setSessions]);

  /**
   * 创建新会话
   */
  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = { ...data.session, messages: [] };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }, [setSessions, setCurrentSession, setSidebarOpen]);

  /**
   * 选择会话
   * @param sessionId 会话ID
   */
  const selectSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setSidebarOpen(false);
      } else {
        console.error('Failed to select session:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [setCurrentSession, setSidebarOpen]);

  /**
   * 删除会话
   * @param sessionId 会话ID
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (sessions.find(s => s.id === sessionId) === sessions.find(s => s.id === sessionId)) {
          setCurrentSession(null);
        }
      } else {
        console.error('Failed to delete session:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [setSessions, setCurrentSession, sessions]);

  /**
   * 历史记录清理
   */
  const handleHistoryCleanup = useCallback(() => {
    const cleanedSessions = historyManager.cleanupOldSessions();
    const cleanedMessages = historyManager.cleanupLongSessions();
    const limitedSessions = historyManager.limitSessionCount();
    
    if (cleanedSessions > 0 || cleanedMessages > 0 || limitedSessions > 0) {
      // 重新加载会话
      loadSessions();
      console.log(`清理完成: ${cleanedSessions}个会话, ${cleanedMessages}个长会话, ${limitedSessions}个限制会话`);
    }
  }, [loadSessions]);

  return {
    loadSessions,
    createNewSession,
    selectSession,
    deleteSession,
    handleHistoryCleanup
  };
}

