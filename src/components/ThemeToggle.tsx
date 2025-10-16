'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Zap, 
  Sparkles, 
  Palette,
  ChevronDown,
  Check
} from 'lucide-react';
import { gsap } from 'gsap';

// 主题图标映射
const themeIcons = {
  light: Sun,
  dark: Moon,
  cyberpunk: Zap,
  neon: Sparkles,
  aurora: Palette,
};

// 主题切换按钮组件
export function ThemeToggle() {
  const { theme, setTheme, themeConfig, isTransitioning } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // 当前主题图标
  const CurrentIcon = themeIcons[theme];

  // 切换下拉菜单
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 选择主题
  const selectTheme = (themeName: string) => {
    setTheme(themeName as 'light' | 'dark' | 'system');
    setIsOpen(false);
  };

  // 动画效果
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo('.theme-option', 
        { 
          opacity: 0, 
          y: -10, 
          scale: 0.9 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.3, 
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isOpen]);

  return (
    <div className="relative z-50">
      {/* 主切换按钮 */}
      <Button
        onClick={toggleDropdown}
        className={`
          relative overflow-hidden group
          bg-gradient-to-r from-purple-500 to-blue-500 
          hover:from-purple-600 hover:to-blue-600
          text-white rounded-full p-3 shadow-lg
          transition-all duration-300 transform
          hover:scale-105 hover:shadow-xl
          ${isTransitioning ? 'animate-pulse' : ''}
        `}
        disabled={isTransitioning}
        style={{ zIndex: 1000 }}
      >
        {/* 背景动画效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* 图标容器 */}
        <div className="relative z-10 flex items-center space-x-2">
          <CurrentIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden sm:block text-sm font-medium">
            {themeConfig.displayName}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* 脉冲效果 */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
      </Button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 9999 }}>
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10"></div>
          
          {/* 菜单头部 */}
          <div className="relative p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">选择主题</h3>
            <p className="text-gray-300 text-xs mt-1">个性化你的聊天体验</p>
          </div>

          {/* 主题选项 */}
          <div className="relative p-2 space-y-1">
            {Object.entries(themeIcons).map(([themeName, Icon], index) => (
              <button
                key={themeName}
                className={`
                  theme-option w-full flex items-center justify-between p-3 rounded-xl
                  transition-all duration-300 group
                  ${theme === themeName 
                    ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/50' 
                    : 'hover:bg-white/10 border border-transparent'
                  }
                  ${hoveredTheme === themeName ? 'scale-105 shadow-lg' : ''}
                `}
                onClick={() => selectTheme(themeName)}
                onMouseEnter={() => setHoveredTheme(themeName)}
                onMouseLeave={() => setHoveredTheme(null)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center space-x-3">
                  {/* 主题图标 */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${theme === themeName 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg' 
                      : 'bg-white/20 group-hover:bg-white/30'
                    }
                  `}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* 主题信息 */}
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">
                      {themeName === 'light' && '明亮模式'}
                      {themeName === 'dark' && '暗黑模式'}
                      {themeName === 'cyberpunk' && '赛博朋克'}
                      {themeName === 'neon' && '霓虹灯'}
                      {themeName === 'aurora' && '极光'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {themeName === 'light' && '清新简洁的明亮界面'}
                      {themeName === 'dark' && '护眼的暗色主题'}
                      {themeName === 'cyberpunk' && '未来科技感十足'}
                      {themeName === 'neon' && '炫酷霓虹灯效果'}
                      {themeName === 'aurora' && '梦幻极光色彩'}
                    </div>
                  </div>
                </div>

                {/* 选中状态 */}
                {theme === themeName && (
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 菜单底部 */}
          <div className="relative p-3 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
              <span>实时预览主题效果</span>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {isOpen && (
        <div 
          className="fixed inset-0" 
          style={{ zIndex: 9998 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// 快速主题切换按钮（简化版）
export function QuickThemeToggle() {
  const { toggleTheme, themeConfig, isTransitioning } = useTheme();
  const CurrentIcon = themeIcons[themeConfig.name as keyof typeof themeIcons];

  return (
    <Button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden group
        bg-gradient-to-r from-purple-500 to-blue-500 
        hover:from-purple-600 hover:to-blue-600
        text-white rounded-full p-2 shadow-lg
        transition-all duration-300 transform
        hover:scale-110 hover:shadow-xl
        ${isTransitioning ? 'animate-pulse' : ''}
      `}
      disabled={isTransitioning}
      title={`当前主题: ${themeConfig.displayName}`}
    >
      {/* 背景动画效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      {/* 图标 */}
      <div className="relative z-10">
        <CurrentIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
      </div>

      {/* 脉冲效果 */}
      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
    </Button>
  );
}
