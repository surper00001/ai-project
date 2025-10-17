'use client';

import { useEffect, useState } from 'react';

/**
 * 粒子效果接口定义
 */
export interface Particle {
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

/**
 * 粒子效果管理Hook
 * 根据设备性能生成和管理粒子效果
 */
export function useParticleEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);

  /**
   * 生成粒子效果数据（仅在客户端）- 性能优化
   * 根据设备性能调整粒子数量
   */
  useEffect(() => {
    const generateParticles = () => {
      const isMobile = window.innerWidth <= 768;
      const isLowEnd = window.innerWidth <= 480;
      
      // 根据设备性能调整粒子数量
      let particleCount = 20;
      if (isLowEnd) {
        particleCount = 0; // 低端设备不显示粒子
      } else if (isMobile) {
        particleCount = 5; // 移动设备减少粒子数量
      }
      
      const newParticles = Array.from({ length: particleCount }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return particles;
}

