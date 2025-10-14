'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

interface VirtualizedMessageListProps {
  messages: Message[];
  className?: string;
}

/**
 * 虚拟化消息列表组件
 * 只渲染可见区域的消息，大幅提升性能
 */
export const VirtualizedMessageList = memo(function VirtualizedMessageList({ messages, className = '' }: VirtualizedMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // 虚拟化配置
  const ITEM_HEIGHT = 120; // 预估每条消息的高度
  const OVERSCAN = 5; // 额外渲染的消息数量
  
  // 计算可见范围
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      messages.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, messages.length]);
  
  // 获取可见消息
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [messages, visibleRange]);
  
  // 计算总高度和偏移
  const totalHeight = messages.length * ITEM_HEIGHT;
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT;
  
  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // 监听容器大小变化
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);
  
  // 当消息数量变化时自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 延迟滚动，确保DOM已更新
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, scrollToBottom]);
  
  // 如果消息数量较少，不使用虚拟化
  if (messages.length <= 20) {
    return (
      <div 
        ref={containerRef}
        className={`overflow-y-auto space-y-6 ${className}`}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.role === 'USER'}
            index={index}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      {/* 虚拟化容器 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleMessages.map((message, index) => (
            <div
              key={message.id}
              style={{ height: ITEM_HEIGHT }}
              className="flex items-start"
            >
              <MessageBubble
                message={message}
                isUser={message.role === 'USER'}
                index={visibleRange.startIndex + index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
