'use client';

import { useState } from 'react';
import { FileUploadButton } from '@/components/chat/FileUploadButton';
import { useTheme } from '@/contexts/ThemeContext';
import { FileText, Bot, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: string;
}

export default function TestFileUpload() {
  const { themeConfig } = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // 检查文件大小 (限制为 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const content = await readFileContent(file);
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
        uploadedAt: new Date().toISOString()
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
    } catch (error) {
      console.error('文件读取失败:', error);
      alert('文件读取失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const previewFile = (file: UploadedFile) => {
    alert(`文件内容预览：\n\n${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}`);
  };

  return (
    <div className="min-h-screen p-8" style={{ background: themeConfig.colors.background }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            文件上传功能测试
          </h1>
          <p 
            className="text-xl"
            style={{ color: themeConfig.colors.text, opacity: 0.8 }}
          >
            测试文件上传、预览和管理功能
          </p>
        </div>

        {/* 文件上传区域 */}
        <div 
          className="p-8 rounded-2xl mb-8"
          style={{
            background: `${themeConfig.colors.surface}20`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
        >
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            上传文件
          </h2>
          
          <div className="flex items-center space-x-4">
            <FileUploadButton 
              onFileSelect={handleFileSelect} 
              disabled={isUploading}
            />
            <div 
              className="text-sm"
              style={{ color: themeConfig.colors.text, opacity: 0.6 }}
            >
              支持 .txt, .md, .js, .py, .json, .csv 等文件
            </div>
          </div>
        </div>

        {/* 已上传文件列表 */}
        {uploadedFiles.length > 0 && (
          <div 
            className="p-8 rounded-2xl"
            style={{
              background: `${themeConfig.colors.surface}20`,
              border: `1px solid ${themeConfig.colors.primary}30`
            }}
          >
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: themeConfig.colors.text }}
            >
              已上传文件 ({uploadedFiles.length})
            </h2>
            
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: `${themeConfig.colors.surface}30`,
                    border: `1px solid ${themeConfig.colors.primary}20`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <FileText 
                      className="w-8 h-8" 
                      style={{ color: themeConfig.colors.primary }} 
                    />
                    <div>
                      <h3 
                        className="font-semibold"
                        style={{ color: themeConfig.colors.text }}
                      >
                        {file.name}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                      >
                        {(file.size / 1024).toFixed(1)} KB • {file.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => previewFile(file)}
                      className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                      title="预览文件"
                    >
                      <FileText className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="移除文件"
                    >
                      <X className="w-4 h-4" style={{ color: themeConfig.colors.primary }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div 
          className="mt-8 p-6 rounded-xl"
          style={{
            background: `${themeConfig.colors.surface}20`,
            border: `1px solid ${themeConfig.colors.primary}30`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: themeConfig.colors.text }}
          >
            使用说明
          </h3>
          <ul 
            className="space-y-2 text-sm"
            style={{ color: themeConfig.colors.text, opacity: 0.8 }}
          >
            <li>• 点击"上传文件"按钮或拖拽文件到上传区域</li>
            <li>• 支持文本文件、代码文件、配置文件等</li>
            <li>• 文件大小限制为 5MB</li>
            <li>• 上传成功后可以预览文件内容</li>
            <li>• 可以随时移除不需要的文件</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
