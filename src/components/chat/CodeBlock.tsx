'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { gsap } from 'gsap';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

/**
 * 代码块组件
 * 提供语法高亮、一键复制、全屏查看等功能
 */
export function CodeBlock({ 
  code, 
  language = 'text', 
  filename, 
  showLineNumbers = true 
}: CodeBlockProps) {
  const { themeConfig } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 代码块进入动画
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  // 复制代码到剪贴板
  const copyToClipboard = async () => {
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

  // 下载代码文件
  const downloadCode = () => {
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

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 切换展开/收起
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // 简单的语法高亮（可以根据需要扩展）
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'javascript' || lang === 'js') {
      return code
        .replace(/(\b(?:function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b)/g, 
          '<span style="color: #c792ea;">$1</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
          '<span style="color: #c3e88d;">$1$2$1</span>')
        .replace(/(\/\/.*$)/gm, 
          '<span style="color: #676e95;">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, 
          '<span style="color: #676e95;">$1</span>');
    }
    
    if (lang === 'python') {
      return code
        .replace(/(\b(?:def|class|if|else|elif|for|while|import|from|return|try|except|finally|with|as|lambda|yield|async|await)\b)/g, 
          '<span style="color: #c792ea;">$1</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
          '<span style="color: #c3e88d;">$1$2$1</span>')
        .replace(/(#.*$)/gm, 
          '<span style="color: #676e95;">$1</span>');
    }
    
    if (lang === 'css') {
      return code
        .replace(/([.#]?[\w-]+)\s*{/g, 
          '<span style="color: #c792ea;">$1</span> {')
        .replace(/([\w-]+)\s*:/g, 
          '<span style="color: #89ddff;">$1</span>:')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
          '<span style="color: #c3e88d;">$1$2$1</span>');
    }
    
    if (lang === 'html') {
      return code
        .replace(/(&lt;\/?)([\w-]+)/g, 
          '<span style="color: #c792ea;">$1$2</span>')
        .replace(/(\s[\w-]+=)(["'`])((?:\\.|(?!\2)[^\\])*?)\2/g, 
          '<span style="color: #89ddff;">$1</span><span style="color: #c3e88d;">$2$3$2</span>');
    }
    
    return code;
  };

  // 获取语言显示名称
  const getLanguageName = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'ts': 'TypeScript',
      'typescript': 'TypeScript',
      'py': 'Python',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'sh': 'Shell',
      'bash': 'Bash',
      'sql': 'SQL',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'markdown': 'Markdown',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'dockerfile': 'Dockerfile',
      'text': 'Text'
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  // 计算代码行数
  const lineCount = code.split('\n').length;
  const shouldShowExpand = lineCount > 10 && !isExpanded;
  const displayCode = shouldShowExpand ? code.split('\n').slice(0, 10).join('\n') + '\n...' : code;

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
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ 
          background: `${themeConfig.colors.surface}30`,
          borderColor: `${themeConfig.colors.primary}20`
        }}
      >
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

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          {/* 复制按钮 */}
          <button
            onClick={copyToClipboard}
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
            onClick={downloadCode}
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
          {lineCount > 10 && (
            <button
              onClick={toggleExpanded}
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
            onClick={toggleFullscreen}
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

      {/* 代码内容 */}
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
              __html: highlightCode(displayCode, language)
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

      {/* 展开提示 */}
      {shouldShowExpand && (
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 text-center"
          style={{
            background: `linear-gradient(transparent, ${themeConfig.colors.surface}80)`,
            color: themeConfig.colors.text,
            opacity: 0.8
          }}
        >
          <button
            onClick={toggleExpanded}
            className="text-sm hover:underline"
          >
            点击展开完整代码 ({lineCount - 10} 行)
          </button>
        </div>
      )}
    </div>
  );

  // 全屏模式渲染
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: `${themeConfig.colors.background}95` }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsFullscreen(false);
          }
        }}
      >
        {codeBlockContent}
      </div>
    );
  }

  return codeBlockContent;
}
