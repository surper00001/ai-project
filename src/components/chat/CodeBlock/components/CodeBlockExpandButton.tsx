'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface CodeBlockExpandButtonProps {
  /** 总行数 */
  lineCount: number;
  /** 切换展开状态回调 */
  onToggleExpanded: () => void;
}

/**
 * 代码块展开按钮组件
 * 当代码行数超过10行时显示，用于展开/收起长代码
 */
export function CodeBlockExpandButton({
  lineCount,
  onToggleExpanded
}: CodeBlockExpandButtonProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 p-4 text-center"
      style={{
        background: `linear-gradient(transparent, ${themeConfig.colors.surface}80)`,
        color: themeConfig.colors.text,
        opacity: 0.8
      }}
    >
      <button
        onClick={onToggleExpanded}
        className="text-sm hover:underline"
      >
        点击展开完整代码 ({lineCount - 10} 行)
      </button>
    </div>
  );
}





