'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Bot, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * 加载指示器组件
 * 显示AI正在思考的动画效果，包含多种加载动画
 */
export function LoadingSpinner() {
  // 获取主题配置
  const { themeConfig } = useTheme();
  
  // DOM引用
  const spinnerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // 组件加载动画
  useEffect(() => {
    if (spinnerRef.current && avatarRef.current && bubbleRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([spinnerRef.current, avatarRef.current, bubbleRef.current]);
      
      // 初始状态
      gsap.set(spinnerRef.current, { opacity: 0, y: 20, scale: 0.95 });
      gsap.set(avatarRef.current, { opacity: 0, scale: 0 });
      gsap.set(bubbleRef.current, { opacity: 0, x: -20 });
      
      // 创建时间线动画
      const tl = gsap.timeline();
      
      // 头像动画
      tl.to(avatarRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
      // 气泡容器动画
      .to(spinnerRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.2")
      // 气泡内容动画
      .to(bubbleRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.3");
    }

    // 点动画 - 增强版本
    dotsRef.current.forEach((dot, index) => {
      if (dot) {
        gsap.killTweensOf(dot);
        gsap.to(dot, {
          opacity: 0.3,
          scale: 0.8,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          delay: index * 0.2,
          ease: "power2.inOut"
        });
      }
    });
  }, []);

  return (
    <div ref={spinnerRef} className="flex justify-start mb-6">
      <div className="flex items-start space-x-4 max-w-[80%]">
        {/* 增强的AI头像 */}
        <div 
          ref={avatarRef}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${themeConfig.colors.accent}, ${themeConfig.colors.secondary})`,
            transition: 'all 0.3s ease'
          }}
        >
          <Bot className="w-6 h-6 text-white" />
          
          {/* 头像发光效果 */}
          <div 
            className="absolute inset-0 rounded-full glow"
            style={{ 
              boxShadow: `0 0 15px ${themeConfig.colors.accent}50`
            }}
          />
          
          {/* 旋转加载环 */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-current opacity-30 rotate-halo"
            style={{ 
              borderTopColor: themeConfig.colors.background,
              animationDuration: '2s'
            }}
          />
        </div>

        {/* 增强的加载气泡 */}
        <div 
          ref={bubbleRef}
          className="backdrop-blur-xl border rounded-2xl p-5 shadow-2xl relative overflow-hidden"
          style={{ 
            background: `${themeConfig.colors.surface}30`,
            borderColor: `${themeConfig.colors.primary}30`,
            transition: 'all 0.3s ease'
          }}
        >
          {/* 气泡背景装饰 */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{ 
              background: themeConfig.colors.gradient,
              backgroundSize: '200% 200%',
              animation: 'aurora-flow 4s ease infinite'
            }}
          />
          
          <div className="flex items-center space-x-3 relative z-10">
            {/* 加载文本 */}
            <span 
              className="text-base font-medium"
              style={{ color: themeConfig.colors.text }}
            >
              AI聊天助手正在思考
            </span>
            
            {/* 多种加载动画 */}
            <div className="flex items-center space-x-2">
              {/* 点动画 */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      if (el) dotsRef.current[index] = el;
                    }}
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      background: themeConfig.colors.primary,
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
              
              {/* 旋转加载图标 */}
              <Loader2 
                className="w-4 h-4 animate-spin"
                style={{ color: themeConfig.colors.accent }}
              />
            </div>
          </div>
          
          {/* 消息尾巴 */}
          <div 
            className="absolute top-4 -left-2 w-4 h-4 transform rotate-45"
            style={{ 
              background: `${themeConfig.colors.surface}30`,
              borderColor: `${themeConfig.colors.primary}30`
            }}
          />
          
          {/* 思考波浪效果 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
            <div 
              className="h-full w-full"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${themeConfig.colors.primary}50, transparent)`,
                animation: 'wave 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
