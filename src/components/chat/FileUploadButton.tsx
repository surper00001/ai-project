'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { gsap } from 'gsap';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadButton({ onFileSelect, disabled = false }: FileUploadButtonProps) {
  const { themeConfig } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;
    
    setIsUploading(true);
    
    // 上传动画
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    
    try {
      await onFileSelect(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 重置input值，允许重复选择同一文件
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled || isUploading}
        className={`
          relative flex items-center space-x-2 px-4 py-2 rounded-xl 
          transition-all duration-300 transform hover:scale-105 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${isDragOver ? 'scale-110' : ''}
        `}
        style={{
          background: isDragOver 
            ? themeConfig.colors.gradient 
            : `${themeConfig.colors.surface}30`,
          border: `2px dashed ${isDragOver ? themeConfig.colors.background : themeConfig.colors.primary}40`,
          color: isDragOver ? themeConfig.colors.background : themeConfig.colors.text,
          boxShadow: isDragOver 
            ? `0 0 20px ${themeConfig.colors.primary}50` 
            : `0 0 10px ${themeConfig.colors.primary}20`
        }}
        title={isUploading ? "上传中..." : "点击或拖拽文件到此处"}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isUploading ? '上传中...' : '上传文件'}
        </span>
        
        {/* 上传进度指示器 */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
              <span className="text-xs text-white">处理中...</span>
            </div>
          </div>
        )}
        
        {/* 拖拽提示 */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="text-center">
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">释放文件</span>
            </div>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv,.js,.ts,.css,.html,.py,.java,.c,.cpp,.cs,.xml,.yaml,.yml"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
