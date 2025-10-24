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
  chatSessionId?: string;
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
 * 上传文件接口定义
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: string;
}

/**
 * 聊天状态管理Hook
 * 管理聊天界面的所有状态
 */
export function useChatState() {
  // 会话相关状态
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  
  // 输入相关状态
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // UI状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  
  // 文件上传状态
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // 粒子效果状态
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);
  
  // DOM引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // 流式更新节流控制
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingContentRef = useRef<string>('');

  return {
    // 会话状态
    sessions,
    setSessions,
    currentSession,
    setCurrentSession,
    
    // 输入状态
    inputMessage,
    setInputMessage,
    isLoading,
    setIsLoading,
    isInterrupting,
    setIsInterrupting,
    abortController,
    setAbortController,
    
    // UI状态
    sidebarOpen,
    setSidebarOpen,
    isFullscreen,
    setIsFullscreen,
    isMuted,
    setIsMuted,
    showSettings,
    setShowSettings,
    showPerformanceMonitor,
    setShowPerformanceMonitor,
    
    // 文件状态
    uploadedFiles,
    setUploadedFiles,
    isUploading,
    setIsUploading,
    
    // 粒子效果
    particles,
    setParticles,
    
    // DOM引用
    messagesEndRef,
    chatContainerRef,
    inputRef,
    mainContainerRef,
    backgroundRef,
    
    // 流式更新控制
    updateTimeoutRef,
    pendingContentRef
  };
}










