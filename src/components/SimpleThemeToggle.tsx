'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Zap, Sparkles, Palette } from 'lucide-react';

// 主题图标映射
const themeIcons = {
  light: Sun,
  dark: Moon,
  cyberpunk: Zap,
  neon: Sparkles,
  aurora: Palette,
};

/**
 * 简化的主题切换按钮
 * 用于测试主题切换功能
 */
export function SimpleThemeToggle() {
  const { theme, setTheme, themeConfig, isTransitioning } = useTheme();
  const CurrentIcon = themeIcons[theme];

  // 主题循环列表
  const themes = ['light', 'dark', 'cyberpunk', 'neon', 'aurora'] as const;
  
  // 切换到下一个主题
  const handleToggle = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isTransitioning}
      className="relative overflow-hidden group rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-105"
      style={{ 
        background: themeConfig.colors.gradient,
        color: themeConfig.colors.background,
        zIndex: 1000
      }}
      title={`当前主题: ${themeConfig.displayName} - 点击切换`}
    >
      {/* 背景动画效果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(45deg, ${themeConfig.colors.accent}, ${themeConfig.colors.primary})`
        }}
      />
      
      {/* 图标和文本 */}
      <div className="relative z-10 flex items-center space-x-2">
        <CurrentIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span className="hidden sm:block text-sm font-medium">
          {themeConfig.displayName}
        </span>
      </div>

      {/* 加载状态 */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        </div>
      )}

      {/* 脉冲效果 */}
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-100"
        style={{ background: themeConfig.colors.background }}
      />
    </Button>
  );
}

