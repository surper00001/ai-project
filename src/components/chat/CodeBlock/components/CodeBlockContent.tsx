'use client';

import { RefObject } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { highlightCode } from '../utils/syntaxHighlighter';

interface CodeBlockContentProps {
  /** 代码内容 */
  code: string;
  /** 编程语言 */
  language: string;
  /** 是否全屏模式 */
  isFullscreen: boolean;
  /** 代码元素引用 */
  codeRef: RefObject<HTMLPreElement | null>;
}

/**
 * 代码块内容组件
 * 显示语法高亮的代码内容
 */
export function CodeBlockContent({
  code,
  language,
  isFullscreen,
  codeRef
}: CodeBlockContentProps) {
  const { themeConfig } = useTheme();

  return (
    <div className="relative">
      <pre
        ref={codeRef}
        className={`overflow-x-auto ${
          isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-96'
        }`}
        style={{
          background: `${themeConfig.colors.background}80`,
          color: themeConfig.colors.text,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '16px',
          margin: 0
        }}
      >
        <code
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language)
          }}
        />
      </pre>

      {/* 代码块装饰效果 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeConfig.colors.primary}20, transparent)`,
          animation: 'cyber-scan 3s linear infinite'
        }}
      />
    </div>
  );
}
