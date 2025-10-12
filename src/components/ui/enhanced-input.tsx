'use client';

import React, { forwardRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

/**
 * 增强输入框组件接口
 */
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'neon' | 'cyberpunk';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  showPassword?: boolean;
  onClear?: () => void;
  error?: boolean;
  success?: boolean;
}

/**
 * 增强输入框组件
 * 提供多种视觉效果和交互功能
 */
export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    icon,
    iconPosition = 'left',
    clearable = false,
    showPassword = false,
    onClear,
    error = false,
    success = false,
    type = 'text',
    value,
    ...props 
  }, ref) => {
    // 获取主题配置
    const { themeConfig } = useTheme();
    
    // 状态管理
    const [isFocused, setIsFocused] = useState(false);
    const [showText, setShowText] = useState(!showPassword);

    // 输入框尺寸配置
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
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
            background: `${themeConfig.colors.surface}30`,
            border: `1px solid ${themeConfig.colors.primary}30`,
            backdropFilter: 'blur(10px)',
            boxShadow: isFocused ? `0 0 20px ${themeConfig.colors.primary}30` : 'none'
          };
        case 'neon':
          return {
            ...baseStyles,
            background: 'transparent',
            border: `2px solid ${themeConfig.colors.primary}`,
            boxShadow: isFocused 
              ? `0 0 15px ${themeConfig.colors.primary}, inset 0 0 15px ${themeConfig.colors.primary}20`
              : `0 0 5px ${themeConfig.colors.primary}50`
          };
        case 'cyberpunk':
          return {
            ...baseStyles,
            background: `${themeConfig.colors.background}80`,
            border: `1px solid ${themeConfig.colors.primary}`,
            boxShadow: isFocused 
              ? `0 0 20px ${themeConfig.colors.primary}60, 0 0 40px ${themeConfig.colors.primary}30`
              : `0 0 10px ${themeConfig.colors.primary}40`
          };
        default:
          return {
            ...baseStyles,
            background: `${themeConfig.colors.surface}50`,
            border: `1px solid ${themeConfig.colors.primary}40`,
            boxShadow: isFocused ? `0 0 15px ${themeConfig.colors.primary}20` : 'none'
          };
      }
    };

    // 状态样式
    const getStateStyles = () => {
      if (error) {
        return {
          borderColor: themeConfig.colors.primary,
          boxShadow: `0 0 15px ${themeConfig.colors.primary}40`
        };
      }
      if (success) {
        return {
          borderColor: themeConfig.colors.accent,
          boxShadow: `0 0 15px ${themeConfig.colors.accent}40`
        };
      }
      return {};
    };

    // 处理清除功能
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    // 处理密码显示切换
    const togglePasswordVisibility = () => {
      setShowText(!showText);
    };

    return (
      <div className="relative group">
        {/* 输入框容器 */}
        <div 
          className={cn(
            'relative rounded-xl transition-all duration-300',
            sizeClasses[size],
            isFocused && 'scale-105'
          )}
          style={{
            background: variant === 'glass' ? 'transparent' : 'transparent',
            transition: 'all 0.3s ease'
          }}
        >
          {/* 背景装饰 */}
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
            style={{ 
              background: themeConfig.colors.gradient,
              backgroundSize: '200% 200%',
              animation: 'aurora-flow 6s ease infinite'
            }}
          />

          {/* 输入框 */}
          <input
            ref={ref}
            type={showPassword && !showText ? 'password' : type}
            value={value}
            className={cn(
              'relative border-0 bg-transparent focus:ring-0 focus:ring-offset-0 placeholder:opacity-60 w-full outline-none',
              sizeClasses[size],
              className
            )}
            style={{
              ...getVariantStyles(),
              ...getStateStyles(),
              zIndex: 100,
              position: 'relative'
            }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* 左侧图标 */}
          {icon && iconPosition === 'left' && (
            <div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              style={{ color: themeConfig.colors.text, opacity: 0.6, zIndex: 90 }}
            >
              {icon}
            </div>
          )}

          {/* 右侧图标区域 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2" style={{ zIndex: 90 }}>
            {/* 清除按钮 */}
            {clearable && value && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                style={{ color: themeConfig.colors.text, opacity: 0.6 }}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* 密码显示切换 */}
            {showPassword && (
              <button
                onClick={togglePasswordVisibility}
                className="p-1 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                style={{ color: themeConfig.colors.text, opacity: 0.6 }}
              >
                {showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {/* 右侧图标 */}
            {icon && iconPosition === 'right' && (
              <div style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
                {icon}
              </div>
            )}
          </div>

          {/* 聚焦指示器 */}
          {isFocused && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ 
                boxShadow: `0 0 0 2px ${themeConfig.colors.primary}30`,
                animation: 'pulse 2s infinite',
                zIndex: 80
              }}
            />
          )}

          {/* 状态指示器 */}
          {(error || success) && (
            <div 
              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full pointer-events-none"
              style={{ 
                background: error ? themeConfig.colors.primary : themeConfig.colors.accent,
                animation: 'pulse 1s infinite',
                zIndex: 80
              }}
            />
          )}

          {/* 特殊效果 */}
          {variant === 'neon' && isFocused && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ 
                background: `linear-gradient(45deg, transparent, ${themeConfig.colors.primary}10, transparent)`,
                animation: 'neon-flicker 1.5s infinite alternate',
                zIndex: 70
              }}
            />
          )}

          {variant === 'cyberpunk' && isFocused && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${themeConfig.colors.primary}20, transparent)`,
                animation: 'cyber-scan 2s linear infinite',
                zIndex: 70
              }}
            />
          )}
        </div>

        {/* 输入提示 */}
        {props.placeholder && (
          <div 
            className="absolute -bottom-6 left-0 text-xs opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
            style={{ color: themeConfig.colors.text, opacity: 0.5 }}
          >
            {props.placeholder}
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

