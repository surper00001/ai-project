'use client';

import { Button } from '@/components/ui/button';
import { SimpleThemeToggle } from '@/components/SimpleThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Plus, 
  Bot, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Settings, 
  LogOut 
} from 'lucide-react';
// @ts-expect-error - next-auth type definitions issue
import { signOut } from 'next-auth/react';

interface ChatHeaderProps {
  /** 当前会话标题 */
  sessionTitle?: string;
  /** 用户名称 */
  userName?: string;
  /** 是否静音 */
  isMuted: boolean;
  /** 是否全屏 */
  isFullscreen: boolean;
  /** 是否显示设置 */
  showSettings: boolean;
  /** 是否显示性能监控 */
  showPerformanceMonitor: boolean;
  /** 侧边栏开关回调 */
  onToggleSidebar: () => void;
  /** 静音切换回调 */
  onToggleMute: () => void;
  /** 全屏切换回调 */
  onToggleFullscreen: () => void;
  /** 设置切换回调 */
  onToggleSettings: () => void;
  /** 性能监控切换回调 */
  onTogglePerformanceMonitor: () => void;
}

/**
 * 聊天界面头部组件
 * 显示用户信息、状态指示器和控制按钮
 */
export function ChatHeader({
  sessionTitle,
  userName,
  isMuted,
  isFullscreen,
  showSettings,
  showPerformanceMonitor,
  onToggleSidebar,
  onToggleMute,
  onToggleFullscreen,
  onToggleSettings,
  onTogglePerformanceMonitor
}: ChatHeaderProps) {
  const { themeConfig } = useTheme();

  /**
   * 退出登录处理函数
   */
  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div 
      className="backdrop-blur-xl border-b p-6 shadow-2xl relative overflow-hidden chat-top-bar"
      style={{ 
        background: `${themeConfig.colors.surface}20`,
        borderColor: `${themeConfig.colors.primary}30`,
        transition: 'all 0.5s ease',
        zIndex: 30,
        position: 'relative'
      }}
    >
      {/* 顶部栏背景装饰 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: themeConfig.colors.gradient,
          backgroundSize: '200% 200%',
          animation: 'aurora-flow 6s ease infinite'
        }}
      />
      
      <div className="flex items-center justify-between relative z-10">
        {/* 左侧区域 */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="rounded-full p-3 transition-all duration-300 hover:scale-110 elastic"
            style={{ 
              color: themeConfig.colors.text,
              background: `${themeConfig.colors.primary}20`
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ 
                background: themeConfig.colors.gradient,
                transition: 'all 0.5s ease'
              }}
            >
              <Bot className="w-7 h-7 text-white" />
              <div className="absolute inset-0 rounded-full glow" />
            </div>
            <div>
              <h1 
                className="text-xl font-bold slide-in-left"
                style={{ color: themeConfig.colors.text }}
              >
                {sessionTitle || 'AI 聊天助手'}
              </h1>
              <p 
                className="text-sm slide-in-left"
                style={{ 
                  color: themeConfig.colors.text,
                  opacity: 0.7 
                }}
              >
                {userName}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧控制区域 */}
        <div className="flex items-center space-x-3">
          {/* 状态指示器 */}
          <div 
            className="flex items-center space-x-2 px-4 py-2 rounded-full"
            style={{ 
              background: `${themeConfig.colors.accent}20`,
              border: `1px solid ${themeConfig.colors.accent}40`
            }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: themeConfig.colors.accent }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: themeConfig.colors.accent }}
            >
              AI 在线
            </span>
          </div>

          {/* 控制按钮组 */}
          <div className="flex items-center space-x-2">
            {/* 静音按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMute}
              className="rounded-full p-2 transition-all duration-300 hover:scale-110"
              style={{ 
                color: themeConfig.colors.text,
                background: isMuted ? `${themeConfig.colors.primary}30` : 'transparent'
              }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            {/* 全屏按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="rounded-full p-2 transition-all duration-300 hover:scale-110"
              style={{ 
                color: themeConfig.colors.text,
                background: isFullscreen ? `${themeConfig.colors.primary}30` : 'transparent'
              }}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* 设置按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSettings}
              className="rounded-full p-2 transition-all duration-300 hover:scale-110"
              style={{ 
                color: themeConfig.colors.text,
                background: showSettings ? `${themeConfig.colors.primary}30` : 'transparent'
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* 性能监控按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePerformanceMonitor}
              className="rounded-full p-2 transition-all duration-300 hover:scale-110"
              style={{ 
                color: themeConfig.colors.text,
                background: showPerformanceMonitor ? `${themeConfig.colors.primary}30` : 'transparent'
              }}
              title="性能监控"
            >
              📊
            </Button>

            {/* 主题切换按钮 */}
            <SimpleThemeToggle />

            {/* 退出登录按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-full p-2 transition-all duration-300 hover:scale-110"
              style={{ 
                color: themeConfig.colors.text,
                background: 'transparent'
              }}
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}







