'use client';

import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedInput as Input } from '@/components/ui/enhanced-input';
import { useTheme } from '@/contexts/ThemeContext';
import { FileUploadButton } from '../../FileUploadButton';
import { UploadedFile } from '../hooks/useChatState';
import { 
  Send, 
  Square, 
  FileText, 
  X, 
  Bot 
} from 'lucide-react';

interface ChatInputAreaProps {
  /** 输入消息内容 */
  inputMessage: string;
  /** 输入消息变化回调 */
  onInputChange: (value: string) => void;
  /** 键盘按下回调 */
  onKeyPress: (e: React.KeyboardEvent) => void;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否正在中断 */
  isInterrupting: boolean;
  /** 是否正在上传 */
  isUploading: boolean;
  /** 上传的文件列表 */
  uploadedFiles: UploadedFile[];
  /** 文件选择回调 */
  onFileSelect: (file: File) => void;
  /** 文件预览回调 */
  onPreviewFile: (file: UploadedFile) => void;
  /** 文件分析回调 */
  onAnalyzeFile: (file: UploadedFile) => void;
  /** 移除文件回调 */
  onRemoveFile: (fileId: string) => void;
  /** 发送消息回调 */
  onSendMessage: () => void;
  /** 中断对话回调 */
  onInterruptConversation: () => void;
  /** 输入框引用 */
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * 聊天输入区域组件
 * 包含文件上传、输入框和发送按钮
 */
export function ChatInputArea({
  inputMessage,
  onInputChange,
  onKeyPress,
  isLoading,
  isInterrupting,
  isUploading,
  uploadedFiles,
  onFileSelect,
  onPreviewFile,
  onAnalyzeFile,
  onRemoveFile,
  onSendMessage,
  onInterruptConversation,
  inputRef
}: ChatInputAreaProps) {
  const { themeConfig } = useTheme();

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const inputAreaBackgroundStyle = {
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 8s ease infinite'
  };

  return (
    <div 
      className="backdrop-blur-xl border-t shadow-2xl relative overflow-hidden chat-input-area"
      style={{ 
        background: `${themeConfig.colors.surface}20`,
        borderColor: `${themeConfig.colors.primary}30`,
        transition: 'all 0.5s ease',
        padding: '1.5rem 0',
        marginTop: 'auto',
        zIndex: 50,
        position: 'relative'
      }}
    >
      {/* 输入区域背景装饰 */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={inputAreaBackgroundStyle}
      />
      
      <div className="max-w-5xl mx-auto relative z-10 px-4 sm:px-6">
        <div className="flex flex-col space-y-3">
          {/* 文件上传区域 */}
          <div className="flex flex-col space-y-2 file-upload-area">
            <div className="flex items-center space-x-2">
              <FileUploadButton 
                onFileSelect={onFileSelect} 
                disabled={isLoading || isUploading}
              />
              <div 
                className="text-xs"
                style={{ color: themeConfig.colors.text, opacity: 0.6 }}
              >
                支持 .txt, .md, .js, .py, .json, .csv 等文件
              </div>
            </div>
            
            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg"
                    style={{
                      background: `${themeConfig.colors.surface}40`,
                      border: `1px solid ${themeConfig.colors.primary}30`
                    }}
                  >
                    <FileText className="w-4 h-4" style={{ color: themeConfig.colors.primary }} />
                    <span 
                      className="text-sm truncate max-w-32"
                      style={{ color: themeConfig.colors.text }}
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                    >
                      ({(file.size / 1024).toFixed(1)}KB)
                    </span>
                    <button
                      onClick={() => onPreviewFile(file)}
                      className="p-1 rounded-full hover:bg-green-500/20 transition-colors"
                      title="预览文件"
                    >
                      <FileText className="w-3 h-3" style={{ color: themeConfig.colors.accent }} />
                    </button>
                    <button
                      onClick={() => onAnalyzeFile(file)}
                      className="p-1 rounded-full hover:bg-blue-500/20 transition-colors"
                      title="分析文件"
                      disabled={isLoading}
                    >
                      <Bot className="w-3 h-3" style={{ color: themeConfig.colors.accent }} />
                    </button>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
                      title="移除文件"
                    >
                      <X className="w-3 h-3" style={{ color: themeConfig.colors.primary }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 输入框和按钮区域 */}
          <div className="flex items-end space-x-2 sm:space-x-3">
            {/* 输入框容器 */}
            <div className="flex-1 relative group input-container">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="输入你的消息..."
                disabled={isLoading}
                className="w-full rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent resize-none"
                style={{ 
                  background: `${themeConfig.colors.surface}30`,
                  borderColor: `${themeConfig.colors.primary}40`,
                  color: themeConfig.colors.text,
                  transition: 'all 0.3s ease',
                  zIndex: 50,
                  position: 'relative',
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              
              {/* 输入状态指示器 */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 60 }}>
                {isLoading ? (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ 
                          background: themeConfig.colors.primary,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: themeConfig.colors.accent }}
                  />
                )}
              </div>
              
              {/* 输入框聚焦效果 */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ 
                  background: `linear-gradient(45deg, ${themeConfig.colors.primary}20, ${themeConfig.colors.secondary}20)`,
                  boxShadow: `0 0 20px ${themeConfig.colors.primary}30`,
                  zIndex: 40
                }}
              />
            </div>
            
            {/* 发送/中断按钮 */}
            {isLoading ? (
              <Button
                onClick={onInterruptConversation}
                disabled={isInterrupting}
                className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none relative overflow-hidden group flex-shrink-0"
                style={{ 
                  background: `linear-gradient(45deg, #ef4444, #dc2626)`,
                  color: 'white',
                  transition: 'all 0.3s ease',
                  minHeight: '48px',
                  minWidth: '48px'
                }}
              >
                {/* 按钮背景动画 */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: `linear-gradient(45deg, #dc2626, #b91c1c)`
                  }}
                />
                
                <div className="relative z-10 flex items-center space-x-2">
                  <Square className="w-5 h-5" />
                  {isInterrupting && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {/* 按钮发光效果 */}
                <div 
                  className="absolute inset-0 rounded-2xl glow"
                  style={{ 
                    boxShadow: `0 0 20px #ef444450`
                  }}
                />
              </Button>
            ) : (
              <Button
                onClick={onSendMessage}
                disabled={!inputMessage.trim()}
                className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none relative overflow-hidden group flex-shrink-0"
                style={{ 
                  background: inputMessage.trim() ? themeConfig.colors.gradient : `${themeConfig.colors.surface}50`,
                  color: themeConfig.colors.background,
                  transition: 'all 0.3s ease',
                  minHeight: '48px',
                  minWidth: '48px'
                }}
              >
                {/* 按钮背景动画 */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: `linear-gradient(45deg, ${themeConfig.colors.accent}, ${themeConfig.colors.primary})`
                  }}
                />
                
                <div className="relative z-10 flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                </div>
                
                {/* 按钮发光效果 */}
                {inputMessage.trim() && (
                  <div 
                    className="absolute inset-0 rounded-2xl glow"
                    style={{ 
                      boxShadow: `0 0 20px ${themeConfig.colors.primary}50`
                    }}
                  />
                )}
              </Button>
            )}
          </div>
          
          {/* 输入提示 */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm px-2 space-y-1 sm:space-y-0">
            <div 
              className="flex items-center space-x-2"
              style={{ color: themeConfig.colors.text, opacity: 0.6 }}
            >
              <span className="text-xs">
                {isLoading ? '点击红色按钮中断对话' : '按 Enter 发送，Shift + Enter 换行'}
              </span>
            </div>
            <div 
              className="flex items-center space-x-2"
              style={{ color: themeConfig.colors.text, opacity: 0.6 }}
            >
              <span className="text-xs">{inputMessage.length}/2000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
