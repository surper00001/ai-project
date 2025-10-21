'use client';

import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';

/**
 * 侧边栏动画管理Hook
 * 处理侧边栏的开关动画
 */
export function useSidebarAnimations(
  sidebarRef: RefObject<HTMLDivElement>,
  overlayRef: RefObject<HTMLDivElement>,
  isOpen: boolean
) {
  /**
   * 侧边栏开关动画
   * 使用GSAP实现平滑的开关效果
   */
  useEffect(() => {
    if (sidebarRef.current && overlayRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([sidebarRef.current, overlayRef.current]);
      
      if (isOpen) {
        // 打开动画
        const tl = gsap.timeline();
        tl.fromTo(sidebarRef.current,
          { x: -320, opacity: 0, scale: 0.95 },
          { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        )
        .fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          "-=0.2"
        );
      } else {
        // 关闭动画
        const tl = gsap.timeline();
        tl.to(sidebarRef.current, {
          x: -320,
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in"
        })
        .to(overlayRef.current, {
          opacity: 0,
          duration: 0.2
        }, "-=0.1");
      }
    }
  }, [isOpen, sidebarRef, overlayRef]);
}





