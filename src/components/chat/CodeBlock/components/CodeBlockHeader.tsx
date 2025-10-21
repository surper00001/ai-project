'use client';

import { Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getLanguageName } from '../utils/syntaxHighlighter';

interface CodeBlockHeaderProps {
  /** 编程语言 */
  language: string;
  /** 文件名 */
  filename?: string;
  /** 代码行数 */
  lineCount: number;
  /** 是否已复制 */
  copied: boolean;
  /** 是否全屏模式 */
  isFullscreen: boolean;
  /** 是否已展开 */
  isExpanded: boolean;
  /** 是否需要显示展开按钮 */
  shouldShowExpand: boolean;
  /** 复制代码回调 */
  onCopy: () => void;
  /** 下载代码回调 */
  onDownload: () => void;
  /** 切换全屏回调 */
  onToggleFullscreen: () => void;
  /** 切换展开回调 */
  onToggleExpanded: () => void;
}

/**
 * 代码块头部组件
 * 显示语言标识、文件名、行数统计和操作按钮
 */
export function CodeBlockHeader({
  language,
  filename,
  lineCount,
  copied,
  isFullscreen,
  isExpanded,
  shouldShowExpand,
  onCopy,
  onDownload,
  onToggleFullscreen,
  onToggleExpanded
}: CodeBlockHeaderProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{ 
        background: `${themeConfig.colors.surface}30`,
        borderColor: `${themeConfig.colors.primary}20`
      }}
    >
      {/* 左侧信息区域 */}
      <div className="flex items-center space-x-3">
        {/* 语言标识 */}
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            background: themeConfig.colors.gradient,
            color: themeConfig.colors.background
          }}
        >
          {getLanguageName(language)}
        </div>
        
        {/* 文件名 */}
        {filename && (
          <div 
            className="text-sm font-medium"
            style={{ color: themeConfig.colors.text }}
          >
            {filename}
          </div>
        )}
        
        {/* 行数统计 */}
        <div 
          className="text-xs"
          style={{ color: themeConfig.colors.text, opacity: 0.6 }}
        >
          {lineCount} 行
        </div>
      </div>

      {/* 右侧操作按钮区域 */}
      <div className="flex items-center space-x-2">
        {/* 复制按钮 */}
        <button
          onClick={onCopy}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{ 
            background: copied ? `${themeConfig.colors.accent}30` : `${themeConfig.colors.surface}50`,
            color: copied ? themeConfig.colors.accent : themeConfig.colors.text
          }}
          title="复制代码"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* 下载按钮 */}
        <button
          onClick={onDownload}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{ 
            background: `${themeConfig.colors.surface}50`,
            color: themeConfig.colors.text
          }}
          title="下载代码"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* 展开/收起按钮 */}
        {shouldShowExpand && (
          <button
            onClick={onToggleExpanded}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
            style={{ 
              background: `${themeConfig.colors.surface}50`,
              color: themeConfig.colors.text
            }}
            title={isExpanded ? "收起代码" : "展开代码"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* 全屏按钮 */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{ 
            background: `${themeConfig.colors.surface}50`,
            color: themeConfig.colors.text
          }}
          title={isFullscreen ? "退出全屏" : "全屏查看"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}





