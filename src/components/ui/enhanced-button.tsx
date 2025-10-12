'use client';

import React, { forwardRef } from 'react';
import { Button } from './button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * 增强按钮组件接口
 */
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'glow' | 'neon' | 'cyberpunk';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animation?: 'none' | 'bounce' | 'pulse' | 'glow' | 'shake';
}

/**
 * 增强按钮组件
 * 提供多种炫酷的视觉效果和动画
 */
export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    animation = 'none',
    children, 
    disabled,
    ...props 
  }, ref) => {
    // 获取主题配置
    const { themeConfig } = useTheme();

    // 按钮尺寸配置
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    // 动画类名
    const animationClasses = {
      none: '',
      bounce: 'hover:animate-bounce',
      pulse: 'animate-pulse',
      glow: 'glow',
      shake: 'hover:animate-shake'
    };

    // 变体样式配置
    const getVariantStyles = () => {
      switch (variant) {
        case 'gradient':
          return {
            background: themeConfig.colors.gradient,
            color: themeConfig.colors.background,
            border: 'none',
            boxShadow: `0 4px 15px ${themeConfig.colors.primary}30`
          };
        case 'glow':
          return {
            background: `${themeConfig.colors.primary}20`,
            color: themeConfig.colors.text,
            border: `1px solid ${themeConfig.colors.primary}50`,
            boxShadow: `0 0 20px ${themeConfig.colors.primary}40`
          };
        case 'neon':
          return {
            background: 'transparent',
            color: themeConfig.colors.primary,
            border: `2px solid ${themeConfig.colors.primary}`,
            boxShadow: `0 0 10px ${themeConfig.colors.primary}, inset 0 0 10px ${themeConfig.colors.primary}20`
          };
        case 'cyberpunk':
          return {
            background: `${themeConfig.colors.background}80`,
            color: themeConfig.colors.primary,
            border: `1px solid ${themeConfig.colors.primary}`,
            boxShadow: `0 0 15px ${themeConfig.colors.primary}60, 0 0 30px ${themeConfig.colors.primary}30`
          };
        default:
          return {
            background: themeConfig.colors.primary,
            color: themeConfig.colors.background,
            border: 'none'
          };
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // 基础样式
          'relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95',
          // 尺寸样式
          sizeClasses[size],
          // 动画样式
          animationClasses[animation],
          // 禁用状态
          disabled && 'opacity-50 cursor-not-allowed transform-none',
          // 自定义样式
          className
        )}
        style={{
          ...getVariantStyles(),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        disabled={disabled || loading}
        {...props}
      >
        {/* 按钮背景动画效果 */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: `linear-gradient(45deg, ${themeConfig.colors.accent}, ${themeConfig.colors.primary})`
          }}
        />

        {/* 按钮内容 */}
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {/* 左侧图标 */}
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">
              {loading ? (
                <div 
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
              ) : (
                icon
              )}
            </span>
          )}

          {/* 按钮文本 */}
          {children && (
            <span className="font-medium">
              {children}
            </span>
          )}

          {/* 右侧图标 */}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">
              {loading ? (
                <div 
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
              ) : (
                icon
              )}
            </span>
          )}
        </div>

        {/* 特殊效果 */}
        {variant === 'neon' && (
          <div 
            className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `linear-gradient(45deg, transparent, ${themeConfig.colors.primary}20, transparent)`,
              animation: 'neon-flicker 2s infinite alternate'
            }}
          />
        )}

        {variant === 'cyberpunk' && (
          <div 
            className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${themeConfig.colors.primary}30, transparent)`,
              animation: 'cyber-scan 3s linear infinite'
            }}
          />
        )}

        {/* 脉冲效果 */}
        {animation === 'pulse' && (
          <div 
            className="absolute inset-0 rounded-inherit animate-ping opacity-20"
            style={{ background: themeConfig.colors.primary }}
          />
        )}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

