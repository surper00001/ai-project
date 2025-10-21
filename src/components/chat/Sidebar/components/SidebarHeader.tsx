'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, Bot, X } from 'lucide-react';

interface SidebarHeaderProps {
  /** 创建新会话回调 */
  onCreateSession: () => void;
  /** 关闭侧边栏回调 */
  onToggle: () => void;
}

/**
 * 侧边栏头部组件
 * 显示标题、用户信息和操作按钮
 */
export function SidebarHeader({ onCreateSession, onToggle }: SidebarHeaderProps) {
  const { themeConfig } = useTheme();

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const headerBackgroundStyle = {
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 8s ease infinite'
  };

  return (
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
      </div>
    </div>
  );
}





