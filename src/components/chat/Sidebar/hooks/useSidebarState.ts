'use client';

import { useState, useRef } from 'react';

/**
 * 消息接口定义
 */
export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

/**
 * 聊天会话接口定义
 */
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 侧边栏状态管理Hook
 * 管理侧边栏的所有状态
 */
export function useSidebarState() {
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'messages'>('recent');
  const [showHistoryManagement, setShowHistoryManagement] = useState(false);
  
  // DOM引用
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  return {
    // 搜索和筛选状态
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showHistoryManagement,
    setShowHistoryManagement,
    
    // DOM引用
    sidebarRef,
    overlayRef,
    searchRef
  };
}
