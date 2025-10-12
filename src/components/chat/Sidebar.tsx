'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  X, 
  Clock,
  Bot,
  Search,
  Filter,
  Star,
  MoreHorizontal
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

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onCreateSession: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * 侧边栏组件
 * 显示聊天会话列表，支持搜索、筛选和会话管理
 */
export function Sidebar({
  sessions,
  currentSession,
  onSelectSession,
  onDeleteSession,
  onCreateSession,
  isOpen,
  onToggle
}: SidebarProps) {
  // 获取主题配置
  const { themeConfig } = useTheme();
  
  // DOM引用
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'messages'>('recent');

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const headerBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 8s ease infinite'
  }), [themeConfig.colors.gradient]);

  const sessionItemBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 6s ease infinite'
  }), [themeConfig.colors.gradient]);

  const footerBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 10s ease infinite'
  }), [themeConfig.colors.gradient]);

  // 侧边栏开关动画
  useEffect(() => {
    if (sidebarRef.current && overlayRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([sidebarRef.current, overlayRef.current]);
      
      if (isOpen) {
        // 打开动画
        const tl = gsap.timeline();
        tl.fromTo(sidebarRef.current,
          { x: -320, opacity: 0, scale: 0.95 },
          { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        )
        .fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          "-=0.2"
        );
      } else {
        // 关闭动画
        const tl = gsap.timeline();
        tl.to(sidebarRef.current, {
          x: -320,
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in"
        })
        .to(overlayRef.current, {
          opacity: 0,
          duration: 0.2
        }, "-=0.1");
      }
    }
  }, [isOpen]);

  // 搜索功能
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getLastMessage(session).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // 排序功能
  const sortedSessions = [...filteredSessions].sort((a, b) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
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

  return (
    <>
      {/* 增强的遮罩层 */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onToggle}
          style={{ 
            background: `linear-gradient(135deg, ${themeConfig.colors.background}80, ${themeConfig.colors.surface}80)`,
            backdropFilter: 'blur(8px)',
            zIndex: 40
          }}
        />
      )}

      {/* 增强的侧边栏 */}
      <div
        ref={sidebarRef}
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 flex flex-col shadow-2xl chat-sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300 ease-in-out`}
        style={{ 
          background: `${themeConfig.colors.surface}95`,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${themeConfig.colors.primary}30`,
          transition: 'all 0.3s ease',
          zIndex: 50
        }}
      >
        {/* 增强的头部 */}
        <div 
          className="p-6 border-b relative overflow-hidden"
          style={{ 
            background: `${themeConfig.colors.surface}20`,
            borderColor: `${themeConfig.colors.primary}30`
          }}
        >
          {/* 头部背景装饰 */}
          <div 
            className="absolute inset-0 opacity-10"
            style={headerBackgroundStyle}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                  style={{ 
                    background: themeConfig.colors.gradient,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Bot className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 rounded-full glow" />
                </div>
                <div>
                  <h2 
                    className="text-lg font-bold"
                    style={{ color: themeConfig.colors.text }}
                  >
                    聊天历史
                  </h2>
                  <p 
                    className="text-xs"
                    style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                  >
                    管理你的对话
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onCreateSession}
                  size="sm"
                  className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  style={{ 
                    background: themeConfig.colors.gradient,
                    color: themeConfig.colors.background
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden rounded-full hover:scale-110 transition-all duration-300"
                  style={{ 
                    color: themeConfig.colors.text,
                    background: `${themeConfig.colors.primary}20`
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 搜索和筛选区域 */}
            <div className="space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: themeConfig.colors.text, opacity: 0.5 }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="搜索对话..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                  style={{ 
                    background: `${themeConfig.colors.surface}50`,
                    borderColor: `${themeConfig.colors.primary}30`,
                    color: themeConfig.colors.text,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* 筛选按钮组 */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSortBy('recent')}
                  size="sm"
                  variant={sortBy === 'recent' ? 'default' : 'ghost'}
                  className="rounded-lg transition-all duration-300"
                  style={{ 
                    background: sortBy === 'recent' ? themeConfig.colors.primary : 'transparent',
                    color: sortBy === 'recent' ? themeConfig.colors.background : themeConfig.colors.text
                  }}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  最近
                </Button>
                <Button
                  onClick={() => setSortBy('name')}
                  size="sm"
                  variant={sortBy === 'name' ? 'default' : 'ghost'}
                  className="rounded-lg transition-all duration-300"
                  style={{ 
                    background: sortBy === 'name' ? themeConfig.colors.primary : 'transparent',
                    color: sortBy === 'name' ? themeConfig.colors.background : themeConfig.colors.text
                  }}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  名称
                </Button>
                <Button
                  onClick={() => setSortBy('messages')}
                  size="sm"
                  variant={sortBy === 'messages' ? 'default' : 'ghost'}
                  className="rounded-lg transition-all duration-300"
                  style={{ 
                    background: sortBy === 'messages' ? themeConfig.colors.primary : 'transparent',
                    color: sortBy === 'messages' ? themeConfig.colors.background : themeConfig.colors.text
                  }}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  消息数
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 增强的会话列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedSessions.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: themeConfig.colors.gradient,
                  transition: 'all 0.3s ease'
                }}
              >
                <MessageSquare className="w-10 h-10 text-white" />
                <div className="absolute inset-0 rounded-full glow" />
              </div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: themeConfig.colors.text }}
              >
                {searchQuery ? '没有找到匹配的对话' : '还没有聊天记录'}
              </h3>
              <p 
                className="text-sm"
                style={{ color: themeConfig.colors.text, opacity: 0.7 }}
              >
                {searchQuery ? '尝试其他搜索词' : '创建新对话开始聊天'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`p-4 cursor-pointer transition-all duration-300 group rounded-xl border relative overflow-hidden ${
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
                  {/* 会话项背景装饰 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={sessionItemBackgroundStyle}
                  />
                  
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
                            // 收藏功能
                          }}
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-2 hover:scale-110 transition-all duration-300"
                          style={{ 
                            color: themeConfig.colors.text,
                            background: `${themeConfig.colors.surface}50`
                          }}
                        >
                          <Star className="w-4 h-4" />
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
              ))}
            </div>
          )}
        </div>

        {/* 增强的底部信息 */}
        <div 
          className="p-6 border-t relative overflow-hidden"
          style={{ 
            background: `${themeConfig.colors.surface}20`,
            borderColor: `${themeConfig.colors.primary}30`
          }}
        >
          {/* 底部背景装饰 */}
          <div 
            className="absolute inset-0 opacity-5"
            style={footerBackgroundStyle}
          />
          
          <div className="text-center relative z-10">
            {/* 状态指示器 */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: themeConfig.colors.accent }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: themeConfig.colors.accent }}
              >
                AI 在线
              </span>
            </div>
            
            {/* 模型信息 */}
            <div className="space-y-1">
              <p 
                className="text-xs font-medium"
                style={{ color: themeConfig.colors.text, opacity: 0.8 }}
              >
                基于千问大模型
              </p>
              <p 
                className="text-xs"
                style={{ color: themeConfig.colors.text, opacity: 0.6 }}
              >
                AI聊天助手 v2.0
              </p>
            </div>
            
            {/* 统计信息 */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: `${themeConfig.colors.primary}20` }}>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {sessions.length}
                  </p>
                  <p 
                    style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                  >
                    总对话数
                  </p>
                </div>
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {sessions.reduce((total, session) => total + session.messages.length, 0)}
                  </p>
                  <p 
                    style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                  >
                    总消息数
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
