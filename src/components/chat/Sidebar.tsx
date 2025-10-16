'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { VirtualizedSessionList } from './VirtualizedSessionList';
import { HistoryManagementPanel } from './HistoryManagementPanel';
import { 
  Plus, 
  MessageSquare, 
  X, 
  Clock,
  Bot,
  Search,
  Filter,
  Settings
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
  // const [showFavorites, setShowFavorites] = useState(false); // 暂时未使用
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'messages'>('recent');
  const [showHistoryManagement, setShowHistoryManagement] = useState(false);

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const headerBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 8s ease infinite'
  }), [themeConfig.colors.gradient]);

  // const sessionItemBackgroundStyle = useMemo(() => ({
  //   backgroundImage: themeConfig.colors.gradient,
  //   backgroundSize: '200% 200%',
  //   animation: 'aurora-flow 6s ease infinite'
  // }), [themeConfig.colors.gradient]);

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

  // 计算统计信息
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

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  //   if (diffInHours < 24) {
  //     return date.toLocaleTimeString('zh-CN', {
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } else if (diffInHours < 168) { // 7 days
  //     return date.toLocaleDateString('zh-CN', {
  //       weekday: 'short',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } else {
  //     return date.toLocaleDateString('zh-CN', {
  //       month: 'short',
  //       day: 'numeric'
  //     });
  //   }
  // };

  // const getLastMessage = (session: ChatSession) => {
  //   if (session.messages.length === 0) return '新对话';
  //   const lastMessage = session.messages[session.messages.length - 1];
  //   return lastMessage.content.length > 50 
  //     ? lastMessage.content.substring(0, 50) + '...'
  //     : lastMessage.content;
  // };

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

        {/* 虚拟化会话列表 */}
        <div className="flex-1 overflow-hidden">
          <VirtualizedSessionList
            sessions={sessions}
            currentSession={currentSession}
            onSelectSession={onSelectSession}
            onDeleteSession={onDeleteSession}
            searchQuery={searchQuery}
            sortBy={sortBy}
            className="h-full"
          />
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
                    {statistics.totalSessions}
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
                    {statistics.totalMessages}
                  </p>
                  <p 
                    style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                  >
                    总消息数
                  </p>
                </div>
              </div>
              
              {/* 管理按钮 */}
              <div className="mt-4">
                <Button
                  onClick={() => setShowHistoryManagement(true)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg"
                  style={{ 
                    borderColor: themeConfig.colors.primary,
                    color: themeConfig.colors.text
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  历史管理
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 历史记录管理面板 */}
      <HistoryManagementPanel
        isOpen={showHistoryManagement}
        onClose={() => setShowHistoryManagement(false)}
        onCleanup={() => {
          // 这里可以添加清理逻辑
          console.log('清理历史记录');
        }}
        onExport={() => {
          // 导出逻辑
          const data = JSON.stringify(sessions, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onImport={(data) => {
          // 导入逻辑
          try {
            const importedSessions = JSON.parse(data);
            console.log('导入会话数据:', importedSessions);
            // 这里需要更新父组件的sessions状态
          } catch (error) {
            console.error('导入失败:', error);
          }
        }}
        statistics={statistics}
      />
    </>
  );
}
