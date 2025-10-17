'use client';

import { useEffect, useMemo } from 'react';
// @ts-expect-error - next-auth type definitions issue
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { Sidebar } from '../Sidebar';
import { VirtualizedMessageList } from '../VirtualizedMessageList';
import { LoadingSpinner } from '../LoadingSpinner';
import { ChatHeader } from './components/ChatHeader';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInputArea } from './components/ChatInputArea';
import { LoginPrompt } from './components/LoginPrompt';
import { useChatState } from './hooks/useChatState';
import { useChatAnimations } from './hooks/useChatAnimations';
import { useChatSessions } from './hooks/useChatSessions';
import { useChatMessages } from './hooks/useChatMessages';
import { useFileUpload } from './hooks/useFileUpload';
import { useParticleEffects } from './hooks/useParticleEffects';

/**
 * 聊天界面主组件
 * 提供完整的聊天功能，包括消息发送、会话管理、主题切换等
 * 
 * 功能特性：
 * - 智能对话：支持流式输出和实时交互
 * - 会话管理：创建、选择、删除聊天会话
 * - 文件上传：支持多种文件格式的上传和分析
 * - 主题切换：多种炫酷主题选择
 * - 性能优化：根据设备性能调整动画和效果
 * - 响应式设计：适配桌面和移动设备
 */
export function ChatInterface() {
  // 获取用户会话信息
  const { data: session } = useSession();
  
  // 获取主题配置
  const { themeConfig, isTransitioning } = useTheme();
  
  // 使用自定义Hooks管理状态
  const {
    sessions,
    setSessions,
    currentSession,
    setCurrentSession,
    inputMessage,
    setInputMessage,
    isLoading,
    setIsLoading,
    isInterrupting,
    setIsInterrupting,
    abortController,
    setAbortController,
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
    uploadedFiles,
    setUploadedFiles,
    isUploading,
    setIsUploading,
    messagesEndRef,
    chatContainerRef,
    inputRef,
    mainContainerRef,
    backgroundRef,
    updateTimeoutRef,
    pendingContentRef
  } = useChatState();

  // 使用粒子效果Hook
  const particles = useParticleEffects();

  // 使用动画管理Hook
  useChatAnimations(mainContainerRef, backgroundRef, isTransitioning);

  // 使用会话管理Hook
  const {
    loadSessions,
    createNewSession,
    selectSession,
    deleteSession,
    handleHistoryCleanup
  } = useChatSessions(sessions, setSessions, setCurrentSession, setSidebarOpen);

  // 使用消息管理Hook
  const {
    sendMessage,
    interruptConversation,
    scrollToBottom,
    updateStreamingContent
  } = useChatMessages(
    currentSession,
    setCurrentSession,
    setIsLoading,
    setAbortController,
    setIsInterrupting,
    updateTimeoutRef,
    pendingContentRef,
    messagesEndRef
  );

  // 使用文件上传Hook
  const {
    handleFileSelect,
    analyzeFile,
    previewFile,
    removeFile
  } = useFileUpload(
    currentSession,
    setCurrentSession,
    uploadedFiles,
    setUploadedFiles,
    setIsUploading,
    setIsLoading,
    setAbortController
  );

  // 加载聊天会话
  useEffect(() => {
    if (session?.user?.email) {
      loadSessions();
    }
  }, [session, loadSessions]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, scrollToBottom]);

  // 清理定时器，避免内存泄漏
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateTimeoutRef]);

  // 事件处理函数
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleInterruptConversation = () => {
    interruptConversation(abortController);
  };

  // 性能问题处理
  const handlePerformanceIssue = (metrics: { fps: number; memoryUsage: number; renderTime: number; messageCount: number }) => {
    console.warn('性能问题检测:', metrics);
    // 可以在这里添加自动优化逻辑
    if (metrics.messageCount > 100) {
      // 建议清理旧消息
      console.log('建议清理旧消息以提升性能');
    }
  };

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const mainBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '400% 400%',
    animation: 'aurora-flow 8s ease infinite'
  }), [themeConfig.colors.gradient]);

  // 如果用户未登录，显示登录提示
  if (!session) {
    return <LoginPrompt />;
  }

  return (
    <div 
      ref={mainContainerRef}
      className={`flex h-screen relative overflow-hidden transition-all duration-500 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ 
        background: themeConfig.colors.background,
        transition: 'all 0.5s ease'
      }}
    >
      {/* 动态背景装饰 */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-30"
        style={mainBackgroundStyle}
      >
        {/* 主题特定的背景效果 */}
        {themeConfig.name === 'cyberpunk' && (
          <div className="absolute inset-0 cyber-scan" />
        )}
        
        {/* 浮动粒子 */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full float-particle"
            style={{
              background: themeConfig.colors.primary,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* 侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onCreateSession={createNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative z-10 min-h-0 chat-container">
        {/* 增强的顶部栏 */}
        <ChatHeader
          sessionTitle={currentSession?.title}
          userName={session?.user?.name || session?.user?.email}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          showSettings={showSettings}
          showPerformanceMonitor={showPerformanceMonitor}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onTogglePerformanceMonitor={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
        />

        {/* 增强的消息区域 */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative chat-messages"
          style={{ 
            background: `linear-gradient(to bottom, transparent, ${themeConfig.colors.surface}10)`,
            transition: 'all 0.5s ease',
            minHeight: 0, // 确保flex子元素可以收缩
            paddingBottom: '2rem', // 为输入区域留出空间
            zIndex: 10,
            position: 'relative'
          }}
        >
          {currentSession ? (
            <>
              {/* 虚拟化消息列表 */}
              <VirtualizedMessageList
                messages={currentSession.messages}
                className="flex-1 p-4 sm:p-6"
              />
              
              {/* 加载指示器 */}
              {isLoading && <LoadingSpinner />}
              
              {/* 滚动锚点 */}
              <div ref={messagesEndRef} />
            </>
          ) : (
            /* 欢迎界面 */
            <WelcomeScreen onCreateSession={createNewSession} />
          )}
        </div>

        {/* 增强的输入区域 */}
        {currentSession && (
          <ChatInputArea
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
            isInterrupting={isInterrupting}
            isUploading={isUploading}
            uploadedFiles={uploadedFiles}
            onFileSelect={handleFileSelect}
            onPreviewFile={previewFile}
            onAnalyzeFile={analyzeFile}
            onRemoveFile={removeFile}
            onSendMessage={handleSendMessage}
            onInterruptConversation={handleInterruptConversation}
            inputRef={inputRef}
          />
        )}
      </div>

      {/* 性能监控组件 */}
      {showPerformanceMonitor && (
        <PerformanceMonitor
          messageCount={currentSession?.messages.length || 0}
          onPerformanceIssue={handlePerformanceIssue}
        />
      )}
    </div>
  );
}
