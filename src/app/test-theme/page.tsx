'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SimpleThemeToggle } from '@/components/SimpleThemeToggle';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Zap, Sparkles, Palette } from 'lucide-react';

/**
 * 主题测试页面
 * 用于测试主题切换功能
 */
export default function TestThemePage() {
  const { theme, setTheme, themeConfig, isTransitioning } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: '明亮模式' },
    { name: 'dark', icon: Moon, label: '暗黑模式' },
    { name: 'cyberpunk', icon: Zap, label: '赛博朋克' },
    { name: 'neon', icon: Sparkles, label: '霓虹灯' },
    { name: 'aurora', icon: Palette, label: '极光' },
  ] as const;

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-500"
      style={{ 
        background: themeConfig.colors.background,
        color: themeConfig.colors.text
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              background: themeConfig.colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            主题切换测试页面
          </h1>
          <p 
            className="text-lg"
            style={{ color: themeConfig.colors.text, opacity: 0.8 }}
          >
            当前主题: {themeConfig.displayName}
          </p>
        </div>

        {/* 主题切换按钮 */}
        <div className="flex justify-center">
          <SimpleThemeToggle />
        </div>

        {/* 主题选择按钮组 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {themes.map(({ name, icon: Icon, label }) => (
            <Button
              key={name}
              onClick={() => setTheme(name as any)}
              disabled={isTransitioning}
              className={`p-4 h-auto flex flex-col items-center space-y-2 transition-all duration-300 ${
                theme === name ? 'scale-105 shadow-lg' : ''
              }`}
              style={{
                background: theme === name 
                  ? themeConfig.colors.gradient 
                  : `${themeConfig.colors.surface}30`,
                color: theme === name 
                  ? themeConfig.colors.background 
                  : themeConfig.colors.text,
                border: `1px solid ${themeConfig.colors.primary}30`
              }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          ))}
        </div>

        {/* 主题信息展示 */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            background: `${themeConfig.colors.surface}20`,
            borderColor: `${themeConfig.colors.primary}30`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            当前主题信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                主题名称
              </h3>
              <p style={{ color: themeConfig.colors.text, opacity: 0.8 }}>
                {themeConfig.displayName} ({themeConfig.name})
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                主色调
              </h3>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2"
                  style={{ 
                    background: themeConfig.colors.primary,
                    borderColor: themeConfig.colors.background
                  }}
                />
                <span style={{ color: themeConfig.colors.text, opacity: 0.8 }}>
                  {themeConfig.colors.primary}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                背景色
              </h3>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2"
                  style={{ 
                    background: themeConfig.colors.background,
                    borderColor: themeConfig.colors.primary
                  }}
                />
                <span style={{ color: themeConfig.colors.text, opacity: 0.8 }}>
                  {themeConfig.colors.background}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                强调色
              </h3>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2"
                  style={{ 
                    background: themeConfig.colors.accent,
                    borderColor: themeConfig.colors.background
                  }}
                />
                <span style={{ color: themeConfig.colors.text, opacity: 0.8 }}>
                  {themeConfig.colors.accent}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 动画效果展示 */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            background: `${themeConfig.colors.surface}20`,
            borderColor: `${themeConfig.colors.primary}30`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            动画效果展示
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="p-4 rounded-xl text-center animate-bounce"
              style={{ background: `${themeConfig.colors.primary}20` }}
            >
              <p style={{ color: themeConfig.colors.text }}>弹跳动画</p>
            </div>
            <div 
              className="p-4 rounded-xl text-center animate-pulse"
              style={{ background: `${themeConfig.colors.secondary}20` }}
            >
              <p style={{ color: themeConfig.colors.text }}>脉冲动画</p>
            </div>
            <div 
              className="p-4 rounded-xl text-center animate-ping"
              style={{ background: `${themeConfig.colors.accent}20` }}
            >
              <p style={{ color: themeConfig.colors.text }}>Ping动画</p>
            </div>
            <div 
              className="p-4 rounded-xl text-center glow"
              style={{ background: `${themeConfig.colors.primary}20` }}
            >
              <p style={{ color: themeConfig.colors.text }}>发光效果</p>
            </div>
          </div>
        </div>

        {/* 状态指示器 */}
        {isTransitioning && (
          <div 
            className="fixed top-4 right-4 p-4 rounded-xl shadow-lg"
            style={{ 
              background: themeConfig.colors.gradient,
              color: themeConfig.colors.background
            }}
          >
            <p className="font-medium">正在切换主题...</p>
          </div>
        )}
      </div>
    </div>
  );
}
