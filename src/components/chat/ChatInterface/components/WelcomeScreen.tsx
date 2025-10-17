'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Bot, Plus } from 'lucide-react';

interface WelcomeScreenProps {
  /** 创建新会话回调 */
  onCreateSession: () => void;
}

/**
 * 欢迎界面组件
 * 当没有当前会话时显示，提供功能介绍和开始按钮
 */
export function WelcomeScreen({ onCreateSession }: WelcomeScreenProps) {
  const { themeConfig } = useTheme();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-2xl mx-auto">
        {/* 主图标区域 */}
        <div className="relative mb-12">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ 
              background: themeConfig.colors.gradient,
              transition: 'all 0.5s ease'
            }}
          >
            <Bot className="w-16 h-16 text-white" />
            <div className="absolute inset-0 rounded-full glow" />
          </div>
          
          {/* 环绕动画圆环 */}
          <div className="absolute inset-0 w-32 h-32 mx-auto">
            <div 
              className="absolute inset-0 rounded-full border-2 rotate-halo"
              style={{ 
                borderColor: `${themeConfig.colors.primary}30`,
                borderTopColor: themeConfig.colors.primary
              }}
            />
            <div 
              className="absolute inset-2 rounded-full border-2 rotate-halo"
              style={{ 
                borderColor: `${themeConfig.colors.secondary}20`,
                borderTopColor: themeConfig.colors.secondary,
                animationDirection: 'reverse',
                animationDuration: '3s'
              }}
            />
          </div>
          
          {/* 状态指示器 */}
          <div 
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: themeConfig.colors.accent }}
          >
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ background: themeConfig.colors.background }}
            />
          </div>
        </div>

        {/* 欢迎文字 */}
        <div className="space-y-6">
          <h2 
            className="text-5xl font-bold slide-in-up"
            style={{ 
              backgroundImage: themeConfig.colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            欢迎使用 AI 聊天助手
          </h2>
          
          <p 
            className="text-xl slide-in-up"
            style={{ 
              color: themeConfig.colors.text,
              opacity: 0.8 
            }}
          >
            我是你的AI聊天助手，可以和你聊天、回答问题、提供帮助，让我们的对话更有趣
          </p>
          
          {/* 功能特色 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: '💬', title: '智能对话', desc: '自然流畅的对话体验' },
              { icon: '🎨', title: '多主题', desc: '多种炫酷主题选择' },
              { icon: '⚡', title: '快速响应', desc: '实时流式输出' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl backdrop-blur-sm border slide-in-up"
                style={{ 
                  background: `${themeConfig.colors.surface}20`,
                  borderColor: `${themeConfig.colors.primary}30`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ color: themeConfig.colors.text }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    color: themeConfig.colors.text,
                    opacity: 0.7 
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
          
          {/* 开始按钮 */}
          <div className="mt-12">
            <Button
              onClick={onCreateSession}
              className="px-12 py-6 rounded-full font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 elastic"
              style={{ 
                background: themeConfig.colors.gradient,
                color: themeConfig.colors.background
              }}
            >
              <Plus className="w-6 h-6 mr-3" />
              开始新对话
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

