'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * 代码块状态管理Hook
 * 管理代码块的复制、全屏、展开等状态
 */
export function useCodeBlock() {
  // 状态管理
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // DOM引用
  const codeRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 代码块进入动画
   * 使用GSAP实现平滑的进入效果
   */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  /**
   * 复制代码到剪贴板
   * @param code 要复制的代码内容
   */
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // 复制成功动画
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scale: 1.02,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  /**
   * 下载代码文件
   * @param code 代码内容
   * @param filename 文件名
   * @param language 语言类型
   */
  const downloadCode = (code: string, filename?: string, language?: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language === 'text' ? 'txt' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 切换全屏模式
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * 切换展开/收起状态
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return {
    // 状态
    copied,
    isFullscreen,
    isExpanded,
    
    // DOM引用
    codeRef,
    containerRef,
    
    // 方法
    copyToClipboard,
    downloadCode,
    toggleFullscreen,
    toggleExpanded
  };
}





