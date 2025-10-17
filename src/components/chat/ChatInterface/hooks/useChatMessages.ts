'use client';

import { useCallback, RefObject } from 'react';
import { Message, ChatSession } from './useChatState';

/**
 * 聊天消息管理Hook
 * 处理消息发送、流式更新和滚动控制
 */
export function useChatMessages(
  currentSession: ChatSession | null,
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setAbortController: React.Dispatch<React.SetStateAction<AbortController | null>>,
  setIsInterrupting: React.Dispatch<React.SetStateAction<boolean>>,
  updateTimeoutRef: RefObject<NodeJS.Timeout | null>,
  pendingContentRef: RefObject<string>,
  messagesEndRef: RefObject<HTMLDivElement | null>
) {
  /**
   * 滚动到底部
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  /**
   * 优化的流式内容更新函数 - 性能优化
   * @param messageId 消息ID
   * @param content 内容
   * @param immediate 是否立即更新
   */
  const updateStreamingContent = useCallback((messageId: string, content: string, immediate = false) => {
    pendingContentRef.current = content;
    
    // 清除之前的定时器
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // 检查设备性能
    const isMobile = window.innerWidth <= 768;
    const isLowEnd = window.innerWidth <= 480;
    
    // 立即更新或延迟更新
    const updateContent = () => {
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const updatedMessages = prev.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: pendingContentRef.current }
            : msg
        );
        
        return {
          ...prev,
          messages: updatedMessages
        };
      });
    };
    
    if (immediate) {
      updateContent();
    } else {
      // 根据设备性能调整节流时间
      let throttleTime = 100; // 默认100ms
      if (isLowEnd) {
        throttleTime = 200; // 低端设备增加节流时间
      } else if (isMobile) {
        throttleTime = 150; // 移动设备适中的节流时间
      }
      
      updateTimeoutRef.current = setTimeout(updateContent, throttleTime);
    }
  }, [setCurrentSession, updateTimeoutRef, pendingContentRef]);

  /**
   * 发送消息
   * @param message 消息内容
   */
  const sendMessage = async (message: string) => {
    if (!message.trim() || !currentSession) return;

    setIsLoading(true);

    // 创建新的AbortController用于中断请求
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content: message
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let userMessage: { id: string; content: string; role: 'USER'; createdAt: string } | null = null;
      let assistantMessage: { id: string; content: string; role: 'ASSISTANT'; createdAt: string } | null = null;
      let currentAssistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'user_message':
                  userMessage = data.message;
                  // 立即添加用户消息
                  if (userMessage) {
                  setCurrentSession(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, userMessage!]
                  } : null);
                  }
                  break;
                  
                case 'start':
                  // 创建空的AI消息
                  assistantMessage = {
                    id: data.messageId,
                    content: '',
                    role: 'ASSISTANT',
                    createdAt: new Date().toISOString()
                  };
                  if (assistantMessage) {
                    setCurrentSession(prev => prev ? {
                      ...prev,
                      messages: [...prev.messages, assistantMessage!]
                    } : null);
                  }
                  break;
                  
                case 'chunk':
                  // 更新AI消息内容 - 使用优化的节流更新
                  currentAssistantContent += data.content;
                  
                  // 使用优化的更新函数，减少重渲染
                  updateStreamingContent(data.messageId, currentAssistantContent, false);
                  break;
                  
                case 'done':
                  // 完成流式输出 - 确保最终内容被更新
                  updateStreamingContent(data.messageId, currentAssistantContent, true);
                  
                  // 清除节流定时器
                  if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                    updateTimeoutRef.current = null;
                  }
                  break;
                  
                case 'interrupted':
                  // 对话被中断
                  console.log('Conversation interrupted');
                  // 更新当前会话中的消息状态
                  setCurrentSession(prev => {
                    if (!prev) return null;
                    const updatedMessages = prev.messages.map(msg => 
                      msg.id === data.messageId 
                        ? { ...msg, content: msg.content + '\n\n[对话已中断]' }
                        : msg
                    );
                    return { ...prev, messages: updatedMessages };
                  });
                  break;
                  
                case 'error':
                case 'quota_exceeded':
                case 'api_key_error':
                case 'service_unavailable':
                case 'network_error':
                case 'api_error':
                case 'unknown_error':
                  console.error('Stream error:', data.error);
                  
                  // 添加错误消息到聊天界面
                  const errorMessage = {
                    id: Date.now().toString(),
                    content: data.error || 'AI服务出现错误，请稍后重试',
                    role: 'ASSISTANT' as const,
                    createdAt: new Date().toISOString()
                  };
                  
                  setCurrentSession(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, errorMessage]
                  } : null);
                  break;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Conversation interrupted by user');
        // 中断时不需要显示错误，只是停止加载
      } else {
        console.error('Error sending message:', error);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * 中断对话
   */
  const interruptConversation = async (abortController: AbortController | null) => {
    if (abortController) {
      setIsInterrupting(true);
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsInterrupting(false);
    }
  };

  return {
    sendMessage,
    interruptConversation,
    scrollToBottom,
    updateStreamingContent
  };
}
