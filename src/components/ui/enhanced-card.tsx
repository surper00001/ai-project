'use client';

import React, { forwardRef } from 'react';
import { Card } from './card';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * 增强卡片组件接口
 */
interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neon' | 'cyberpunk' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

/**
 * 增强卡片组件
 * 提供多种视觉效果和交互功能
 */
export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    hover = true,
    glow = false,
    animated = false,
    interactive = false,
    children, 
    ...props 
  }, ref) => {
    // 获取主题配置
    const { themeConfig } = useTheme();

    // 卡片尺寸配置
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    // 变体样式配置
    const getVariantStyles = () => {
      const baseStyles = {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        color: themeConfig.colors.text
      };

      switch (variant) {
        case 'glass':
          return {
            ...baseStyles,
            background: `${themeConfig.colors.surface}20`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${themeConfig.colors.primary}30`,
            boxShadow: `0 8px 32px ${themeConfig.colors.background}20`
          };
        case 'neon':
          return {
            ...baseStyles,
            background: 'transparent',
            border: `2px solid ${themeConfig.colors.primary}`,
            boxShadow: `0 0 20px ${themeConfig.colors.primary}40, inset 0 0 20px ${themeConfig.colors.primary}10`
          };
        case 'cyberpunk':
          return {
            ...baseStyles,
            background: `${themeConfig.colors.background}80`,
            border: `1px solid ${themeConfig.colors.primary}`,
            boxShadow: `0 0 30px ${themeConfig.colors.primary}50, 0 0 60px ${themeConfig.colors.primary}20`
          };
        case 'gradient':
          return {
            ...baseStyles,
            backgroundImage: themeConfig.colors.gradient,
            backgroundSize: '200% 200%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            border: 'none',
            boxShadow: `0 8px 32px ${themeConfig.colors.primary}30`
          };
        default:
          return {
            ...baseStyles,
            background: `${themeConfig.colors.surface}30`,
            border: `1px solid ${themeConfig.colors.primary}20`,
            boxShadow: `0 4px 16px ${themeConfig.colors.background}10`
          };
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          // 基础样式
          'relative overflow-hidden rounded-2xl',
          // 尺寸样式
          sizeClasses[size],
          // 悬停效果
          hover && 'hover:scale-105 hover:shadow-2xl',
          // 交互效果
          interactive && 'cursor-pointer active:scale-95',
          // 动画效果
          animated && 'animate-pulse',
          // 自定义样式
          className
        )}
        style={{
          ...getVariantStyles()
        }}
        {...props}
      >
        {/* 背景装饰 */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            backgroundImage: themeConfig.colors.gradient,
            backgroundSize: '200% 200%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            animation: 'aurora-flow 8s ease infinite'
          }}
        />

        {/* 发光效果 */}
        {glow && (
          <div 
            className="absolute inset-0 rounded-2xl glow"
            style={{ 
              boxShadow: `0 0 30px ${themeConfig.colors.primary}50`
            }}
          />
        )}

        {/* 内容区域 */}
        <div className="relative z-10">
          {children}
        </div>

        {/* 特殊效果 */}
        {variant === 'neon' && (
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `linear-gradient(45deg, transparent, ${themeConfig.colors.primary}20, transparent)`,
              animation: 'neon-flicker 2s infinite alternate'
            }}
          />
        )}

        {variant === 'cyberpunk' && (
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${themeConfig.colors.primary}20, transparent)`,
              animation: 'cyber-scan 3s linear infinite'
            }}
          />
        )}

        {/* 边框动画 */}
        {variant === 'neon' && (
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{ 
              background: `conic-gradient(from 0deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary}, ${themeConfig.colors.accent}, ${themeConfig.colors.primary})`,
              padding: '2px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              animation: 'rotate-halo 4s linear infinite'
            }}
          />
        )}

        {/* 粒子效果 */}
        {variant === 'cyberpunk' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full float-particle"
                style={{
                  background: themeConfig.colors.primary,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        )}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

