'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface CodeBlockOverlayProps {
  /** 子组件内容 */
  children: React.ReactNode;
  /** 关闭全屏回调 */
  onClose: () => void;
}

/**
 * 代码块全屏遮罩组件
 * 在全屏模式下显示，提供背景遮罩和点击关闭功能
 */
export function CodeBlockOverlay({ children, onClose }: CodeBlockOverlayProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: `${themeConfig.colors.background}95` }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

