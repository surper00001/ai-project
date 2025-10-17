'use client';

import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';

/**
 * 聊天界面动画管理Hook
 * 处理页面加载动画和主题切换动画
 */
export function useChatAnimations(
  mainContainerRef: RefObject<HTMLDivElement | null>,
  backgroundRef: RefObject<HTMLDivElement | null>,
  isTransitioning: boolean
) {
  /**
   * 页面加载动画 - 性能优化
   * 根据设备性能调整动画复杂度
   */
  useEffect(() => {
    if (mainContainerRef.current && backgroundRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([mainContainerRef.current, backgroundRef.current]);
      
      const isMobile = window.innerWidth <= 768;
      const isLowEnd = window.innerWidth <= 480;
      
      if (isLowEnd) {
        // 低端设备：直接显示，无动画
        gsap.set([mainContainerRef.current, backgroundRef.current], { 
          opacity: 1, 
          y: 0, 
          scale: 1 
        });
      } else if (isMobile) {
        // 移动设备：简化动画
        gsap.set(mainContainerRef.current, { opacity: 0, y: 20 });
        gsap.set(backgroundRef.current, { opacity: 0 });
        
        gsap.to(backgroundRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
        });
        gsap.to(mainContainerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      } else {
        // 桌面设备：保留原有动画但减少时长
        gsap.set(mainContainerRef.current, { opacity: 0, y: 30 });
        gsap.set(backgroundRef.current, { opacity: 0, scale: 1.05 });
        
        const tl = gsap.timeline();
        tl.to(backgroundRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power2.out"
        })
        .to(mainContainerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.4)"
        }, "-=0.3");
      }
    }
  }, [mainContainerRef, backgroundRef]);

  /**
   * 主题切换动画 - 性能优化
   * 根据设备性能调整动画效果
   */
  useEffect(() => {
    if (isTransitioning && backgroundRef.current) {
      const isMobile = window.innerWidth <= 768;
      const isLowEnd = window.innerWidth <= 480;
      
      if (isLowEnd) {
        // 低端设备：禁用主题切换动画
        return;
      } else if (isMobile) {
        // 移动设备：简化主题切换动画
        gsap.to(backgroundRef.current, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1
        });
      } else {
        // 桌面设备：保留原有动画
        gsap.to(backgroundRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1
        });
      }
    }
  }, [isTransitioning, backgroundRef]);
}
