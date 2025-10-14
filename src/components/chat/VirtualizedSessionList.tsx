'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  MessageSquare, 
  Trash2, 
  Star, 
  Clock,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface VirtualizedSessionListProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  searchQuery: string;
  sortBy: 'recent' | 'name' | 'messages';
  className?: string;
}

/**
 * 虚拟化会话列表组件
 * 只渲染可见区域的会话，支持分页加载和自动清理
 */
export const VirtualizedSessionList = memo(function VirtualizedSessionList({
  sessions,
  currentSession,
  onSelectSession,
  onDeleteSession,
  searchQuery,
  sortBy,
  className = ''
}: VirtualizedSessionListProps) {
  const { themeConfig } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  // 虚拟化配置
  const ITEM_HEIGHT = 120; // 预估每个会话项的高度
  const OVERSCAN = 3; // 额外渲染的会话数量
  const PAGE_SIZE = 20; // 每页显示的会话数量
  
  // 过滤和排序会话
  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           getLastMessage(session).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'messages':
          return b.messages.length - a.messages.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchQuery, sortBy]);

  // 分页处理
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredAndSortedSessions.length / PAGE_SIZE);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredAndSortedSessions.slice(0, endIndex);
  }, [filteredAndSortedSessions, currentPage]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      paginatedSessions.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, paginatedSessions.length]);

  // 获取可见会话
  const visibleSessions = useMemo(() => {
    return paginatedSessions.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [paginatedSessions, visibleRange]);

  // 计算总高度和偏移
  const totalHeight = paginatedSessions.length * ITEM_HEIGHT;
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT;

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    
    // 检查是否需要加载更多
    const { scrollTop: scroll, scrollHeight, clientHeight } = e.currentTarget;
    if (scroll + clientHeight >= scrollHeight - 100 && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

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

  // 重置分页当搜索或排序改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('zh-CN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) return '新对话';
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // 如果会话数量较少，不使用虚拟化
  if (filteredAndSortedSessions.length <= 20) {
    return (
      <div className={className}>
        <div 
          ref={containerRef}
          className="overflow-y-auto space-y-3"
          onScroll={handleScroll}
        >
          {paginatedSessions.map((session, index) => (
            <SessionItem
              key={session.id}
              session={session}
              currentSession={currentSession}
              onSelectSession={onSelectSession}
              onDeleteSession={onDeleteSession}
              formatDate={formatDate}
              getLastMessage={getLastMessage}
              isExpanded={expandedSessions.has(session.id)}
              onToggleExpanded={() => toggleExpanded(session.id)}
              index={index}
            />
          ))}
          
          {/* 加载更多按钮 */}
          {currentPage < totalPages && (
            <div className="text-center py-4">
              <Button
                onClick={() => setCurrentPage(prev => prev + 1)}
                variant="ghost"
                className="text-sm"
                style={{ color: themeConfig.colors.text }}
              >
                加载更多 ({filteredAndSortedSessions.length - paginatedSessions.length} 个会话)
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className="overflow-y-auto"
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
            {visibleSessions.map((session, index) => (
              <div
                key={session.id}
                style={{ height: ITEM_HEIGHT }}
                className="flex items-start"
              >
                <SessionItem
                  session={session}
                  currentSession={currentSession}
                  onSelectSession={onSelectSession}
                  onDeleteSession={onDeleteSession}
                  formatDate={formatDate}
                  getLastMessage={getLastMessage}
                  isExpanded={expandedSessions.has(session.id)}
                  onToggleExpanded={() => toggleExpanded(session.id)}
                  index={visibleRange.startIndex + index}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* 加载更多指示器 */}
        {currentPage < totalPages && (
          <div className="text-center py-4">
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              variant="ghost"
              className="text-sm"
              style={{ color: themeConfig.colors.text }}
            >
              加载更多 ({filteredAndSortedSessions.length - paginatedSessions.length} 个会话)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

// 会话项组件
const SessionItem = memo(function SessionItem({
  session,
  currentSession,
  onSelectSession,
  onDeleteSession,
  formatDate,
  getLastMessage,
  isExpanded,
  onToggleExpanded,
  index
}: {
  session: ChatSession;
  currentSession: ChatSession | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  formatDate: (dateString: string) => string;
  getLastMessage: (session: ChatSession) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  index: number;
}) {
  const { themeConfig } = useTheme();

  return (
    <div
      className={`p-4 cursor-pointer transition-all duration-300 group rounded-xl border relative overflow-hidden m-3 ${
        currentSession?.id === session.id 
          ? 'shadow-lg' 
          : 'hover:shadow-md'
      }`}
      style={{
        background: currentSession?.id === session.id 
          ? `${themeConfig.colors.primary}20`
          : `${themeConfig.colors.surface}20`,
        borderColor: currentSession?.id === session.id 
          ? `${themeConfig.colors.primary}50`
          : `${themeConfig.colors.primary}20`,
        animationDelay: `${index * 0.05}s`,
        transition: 'all 0.3s ease'
      }}
      onClick={() => onSelectSession(session.id)}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 会话标题 */}
            <div className="flex items-center space-x-2 mb-2">
              <h3 
                className="font-semibold truncate text-base"
                style={{ color: themeConfig.colors.text }}
              >
                {session.title}
              </h3>
              {session.messages.length > 10 && (
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: themeConfig.colors.accent }}
                />
              )}
            </div>
            
            {/* 最后一条消息 */}
            <p 
              className="text-sm truncate mb-3 leading-relaxed"
              style={{ color: themeConfig.colors.text, opacity: 0.8 }}
            >
              {getLastMessage(session)}
            </p>
            
            {/* 会话信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs">
                <div 
                  className="flex items-center space-x-1"
                  style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(session.updatedAt)}</span>
                </div>
                <div 
                  className="flex items-center space-x-1"
                  style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{session.messages.length} 条消息</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
              variant="ghost"
              size="sm"
              className="rounded-full p-2 hover:scale-110 transition-all duration-300"
              style={{ 
                color: themeConfig.colors.text,
                background: `${themeConfig.colors.surface}50`
              }}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              variant="ghost"
              size="sm"
              className="rounded-full p-2 hover:scale-110 transition-all duration-300"
              style={{ 
                color: themeConfig.colors.primary,
                background: `${themeConfig.colors.primary}20`
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
