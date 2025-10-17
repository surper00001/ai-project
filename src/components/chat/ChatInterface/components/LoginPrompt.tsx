'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Bot } from 'lucide-react';

/**
 * 登录提示组件
 * 当用户未登录时显示，提示用户先登录
 */
export function LoginPrompt() {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="flex items-center justify-center h-screen relative overflow-hidden"
      style={{ 
        background: themeConfig.colors.gradient,
        transition: 'all 0.5s ease'
      }}
    >
      {/* 动态背景粒子效果 */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30 float-particle"
            style={{
              background: themeConfig.colors.primary,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center text-white relative z-10">
        <div className="relative mb-8">
          <Bot className="w-20 h-20 mx-auto mb-4 heartbeat" style={{ color: themeConfig.colors.primary }} />
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full glow" style={{ 
            boxShadow: `0 0 20px ${themeConfig.colors.primary}` 
          }} />
        </div>
        <h2 className="text-3xl font-bold mb-4 slide-in-up" style={{ color: themeConfig.colors.text }}>
          请先登录
        </h2>
        <p className="text-lg slide-in-up" style={{ 
          color: themeConfig.colors.text,
          opacity: 0.8 
        }}>
          登录后即可开始与AI聊天
        </p>
      </div>
    </div>
  );
}

