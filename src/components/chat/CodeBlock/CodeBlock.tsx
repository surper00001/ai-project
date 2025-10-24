'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useCodeBlock } from './hooks/useCodeBlock';
import { 
  getLineCount, 
  shouldShowExpand, 
  getDisplayCode 
} from './utils/syntaxHighlighter';
import { CodeBlockHeader } from './components/CodeBlockHeader';
import { CodeBlockContent } from './components/CodeBlockContent';
import { CodeBlockExpandButton } from './components/CodeBlockExpandButton';
import { CodeBlockOverlay } from './components/CodeBlockOverlay';

interface CodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 编程语言 */
  language?: string;
  /** 文件名 */
  filename?: string;
  /** 是否显示行号（暂时未使用） */
  showLineNumbers?: boolean;
}

/**
 * 代码块组件
 * 提供语法高亮、一键复制、全屏查看等功能
 * 
 * 功能特性：
 * - 语法高亮：支持JavaScript、Python、CSS、HTML等多种语言
 * - 一键复制：点击复制按钮将代码复制到剪贴板
 * - 文件下载：支持将代码下载为文件
 * - 全屏查看：支持全屏模式查看长代码
 * - 展开收起：长代码自动折叠，可手动展开
 * - 动画效果：使用GSAP实现平滑的进入和交互动画
 */
export function CodeBlock({ 
  code, 
  language = 'text', 
  filename, 
  showLineNumbers = true // 暂时未使用 
}: CodeBlockProps) {
  const { themeConfig } = useTheme();
  
  // 使用自定义Hook管理状态和逻辑
  const {
    copied,
    isFullscreen,
    isExpanded,
    codeRef,
    containerRef,
    copyToClipboard,
    downloadCode,
    toggleFullscreen,
    toggleExpanded
  } = useCodeBlock();

  // 计算代码相关数据
  const lineCount = getLineCount(code);
  const shouldShowExpandButton = shouldShowExpand(lineCount, isExpanded);
  const displayCode = getDisplayCode(code, lineCount, isExpanded);

  // 事件处理函数
  const handleCopy = () => copyToClipboard(code);
  const handleDownload = () => downloadCode(code, filename, language);
  const handleCloseFullscreen = () => toggleFullscreen();

  // 代码块内容组件
  const codeBlockContent = (
    <div
      ref={containerRef}
      className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
      style={{
        background: `${themeConfig.colors.surface}20`,
        border: `1px solid ${themeConfig.colors.primary}30`,
        backdropFilter: 'blur(10px)',
        boxShadow: isFullscreen 
          ? `0 0 50px ${themeConfig.colors.primary}30` 
          : `0 0 20px ${themeConfig.colors.primary}20`
      }}
    >
      {/* 代码块头部 */}
      <CodeBlockHeader
        language={language}
        filename={filename}
        lineCount={lineCount}
        copied={copied}
        isFullscreen={isFullscreen}
        isExpanded={isExpanded}
        shouldShowExpand={shouldShowExpandButton}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onToggleFullscreen={toggleFullscreen}
        onToggleExpanded={toggleExpanded}
      />

      {/* 代码内容 */}
      <CodeBlockContent
        code={displayCode}
        language={language}
        isFullscreen={isFullscreen}
        codeRef={codeRef}
      />

      {/* 展开提示按钮 */}
      {shouldShowExpandButton && (
        <CodeBlockExpandButton
          lineCount={lineCount}
          onToggleExpanded={toggleExpanded}
        />
      )}
    </div>
  );

  // 全屏模式渲染
  if (isFullscreen) {
    return (
      <CodeBlockOverlay onClose={handleCloseFullscreen}>
        {codeBlockContent}
      </CodeBlockOverlay>
    );
  }

  return codeBlockContent;
}










