'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings } from 'lucide-react';

interface SidebarFooterProps {
  /** 统计信息 */
  statistics: {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    memoryUsage: number;
  };
  /** 显示历史管理面板回调 */
  onShowHistoryManagement: () => void;
}

/**
 * 侧边栏底部组件
 * 显示状态指示器、模型信息和统计信息
 */
export function SidebarFooter({ statistics, onShowHistoryManagement }: SidebarFooterProps) {
  const { themeConfig } = useTheme();

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const footerBackgroundStyle = {
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 10s ease infinite'
  };

  return (
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
              onClick={onShowHistoryManagement}
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
  );
}







