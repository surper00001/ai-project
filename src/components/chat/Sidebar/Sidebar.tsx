'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { VirtualizedSessionList } from '../VirtualizedSessionList';
import { HistoryManagementPanel } from '../HistoryManagementPanel';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarSearch } from './components/SidebarSearch';
import { SidebarFilters } from './components/SidebarFilters';
import { SidebarFooter } from './components/SidebarFooter';
import { useSidebarState } from './hooks/useSidebarState';
import { useSidebarAnimations } from './hooks/useSidebarAnimations';
import { useSidebarStatistics } from './hooks/useSidebarStatistics';
import { ChatSession } from './hooks/useSidebarState';

interface SidebarProps {
  /** 会话列表 */
  sessions: ChatSession[];
  /** 当前会话 */
  currentSession: ChatSession | null;
  /** 选择会话回调 */
  onSelectSession: (sessionId: string) => void;
  /** 删除会话回调 */
  onDeleteSession: (sessionId: string) => void;
  /** 创建新会话回调 */
  onCreateSession: () => void;
  /** 是否打开 */
  isOpen: boolean;
  /** 切换开关回调 */
  onToggle: () => void;
}

/**
 * 侧边栏组件
 * 显示聊天会话列表，支持搜索、筛选和会话管理
 * 
 * 功能特性：
 * - 会话列表：显示所有聊天会话
 * - 搜索功能：支持按内容搜索会话
 * - 排序筛选：按时间、名称、消息数排序
 * - 会话管理：创建、选择、删除会话
 * - 历史管理：清理、导出、导入历史记录
 * - 统计信息：显示会话和消息统计
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
  
  // 使用自定义Hooks管理状态
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showHistoryManagement,
    setShowHistoryManagement,
    sidebarRef,
    overlayRef,
    searchRef
  } = useSidebarState();

  // 使用统计信息Hook
  const statistics = useSidebarStatistics(sessions);

  // 使用动画管理Hook
  useSidebarAnimations(sidebarRef, overlayRef, isOpen);

  // 事件处理函数
  const handleHistoryCleanup = () => {
    // 这里可以添加清理逻辑
    console.log('清理历史记录');
  };

  const handleHistoryExport = () => {
    // 导出逻辑
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHistoryImport = (data: string) => {
    // 导入逻辑
    try {
      const importedSessions = JSON.parse(data);
      console.log('导入会话数据:', importedSessions);
      // 这里需要更新父组件的sessions状态
    } catch (error) {
      console.error('导入失败:', error);
    }
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
        <SidebarHeader
          onCreateSession={onCreateSession}
          onToggle={onToggle}
        />

        {/* 搜索和筛选区域 */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {/* 搜索框 */}
            <SidebarSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchRef={searchRef}
            />

            {/* 筛选按钮组 */}
            <SidebarFilters
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
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
        <SidebarFooter
          statistics={statistics}
          onShowHistoryManagement={() => setShowHistoryManagement(true)}
        />
      </div>

      {/* 历史记录管理面板 */}
      <HistoryManagementPanel
        isOpen={showHistoryManagement}
        onClose={() => setShowHistoryManagement(false)}
        onCleanup={handleHistoryCleanup}
        onExport={handleHistoryExport}
        onImport={handleHistoryImport}
        statistics={statistics}
      />
    </>
  );
}







