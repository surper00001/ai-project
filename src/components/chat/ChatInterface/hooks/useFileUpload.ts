'use client';

import { useState } from 'react';
import { UploadedFile, ChatSession, Message } from './useChatState';

/**
 * 文件上传管理Hook
 * 处理文件上传、预览、分析和移除功能
 */
export function useFileUpload(
  currentSession: ChatSession | null,
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>,
  uploadedFiles: UploadedFile[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setAbortController: React.Dispatch<React.SetStateAction<AbortController | null>>
) {
  /**
   * 读取文件内容
   * @param file 文件对象
   * @returns Promise<string> 文件内容
   */
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

  /**
   * 获取文件语言类型
   * @param filename 文件名
   * @returns 语言类型
   */
  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'bash',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'txt': 'text'
    };
    return languageMap[ext || ''] || 'text';
  };

  /**
   * 处理文件选择
   * @param file 选择的文件
   */
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // 检查文件大小 (限制为 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过 5MB');
      return;
    }

    // 检查文件类型
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'text/javascript',
      'text/typescript',
      'text/css',
      'text/html',
      'application/x-python',
      'text/x-python',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++',
      'text/x-csharp',
      'application/xml',
      'text/xml',
      'application/yaml',
      'text/yaml'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|json|csv|js|ts|css|html|py|java|c|cpp|cs|xml|yaml|yml)$/i)) {
      alert('不支持的文件类型，请上传文本文件');
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
      
      // 显示上传成功消息
      const successMessage = {
        id: Date.now().toString(),
        content: `📁 文件上传成功：${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\n文件已准备就绪，你可以询问关于这个文件的问题，或者让我分析文件内容。`,
        role: 'ASSISTANT' as const,
        createdAt: new Date().toISOString()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, successMessage]
      } : null);
    } catch (error) {
      console.error('文件读取失败:', error);
      alert('文件读取失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 分析文件内容
   * @param file 上传的文件
   */
  const analyzeFile = async (file: UploadedFile) => {
    if (!currentSession || !setIsLoading) return;

    const analysisPrompt = `请分析这个文件的内容：

文件名：${file.name}
文件大小：${(file.size / 1024).toFixed(2)} KB
文件类型：${file.type}

文件内容：
\`\`\`${getFileLanguage(file.name)}
${file.content}
\`\`\`

请提供以下分析：
1. 文件类型和用途
2. 主要功能和特点
3. 代码结构分析（如果是代码文件）
4. 潜在问题或改进建议
5. 相关技术栈或工具推荐`;

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      content: `📁 分析文件：${file.name}`,
      role: 'USER' as const,
      createdAt: new Date().toISOString()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    // 发送分析请求
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    // 设置超时
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30秒超时

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content: analysisPrompt
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to analyze file');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantMessage: Message | null = null;
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                assistantMessage = {
                  id: data.messageId,
                  content: '',
                  role: 'ASSISTANT',
                  createdAt: new Date().toISOString(),
                  chatSessionId: currentSession.id
                };
                setCurrentSession(prev => prev && assistantMessage ? {
                  ...prev,
                  messages: [...prev.messages, assistantMessage]
                } : prev);
              } else if (data.type === 'chunk' && assistantMessage) {
                currentContent += data.content;
                setCurrentSession(prev => {
                  if (!prev) return null;
                  const updatedMessages = prev.messages.map(msg => 
                    msg.id === data.messageId 
                      ? { ...msg, content: currentContent }
                      : msg
                  );
                  return { ...prev, messages: updatedMessages };
                });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('File analysis interrupted or timed out');
        // 添加超时消息
        const timeoutMessage = {
          id: Date.now().toString(),
          content: `⏰ 文件分析超时，请稍后重试或尝试分析较小的文件。`,
          role: 'ASSISTANT' as const,
          createdAt: new Date().toISOString()
        };
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, timeoutMessage]
        } : null);
      } else {
        console.error('Error analyzing file:', error);
        
        // 根据错误类型显示不同的错误消息
        let errorContent = '❌ 文件分析失败，请稍后重试';
        
        if (error instanceof Error) {
          switch (error.message) {
            case 'API_QUOTA_EXCEEDED':
              errorContent = '⚠️ API调用次数已达上限，无法分析文件，请稍后再试或联系管理员';
              break;
            case 'API_KEY_INVALID':
              errorContent = '🔑 API密钥配置有误，请联系管理员';
              break;
            case 'API_SERVICE_UNAVAILABLE':
              errorContent = '🔧 AI服务暂时不可用，请稍后重试';
              break;
            case 'NETWORK_ERROR':
              errorContent = '🌐 网络连接异常，请检查网络后重试';
              break;
            case 'API_ERROR':
              errorContent = '❌ AI服务出现错误，请稍后重试';
              break;
            default:
              errorContent = '❌ 文件分析失败，请检查网络连接或稍后重试';
          }
        }
        
        const errorMessage = {
          id: Date.now().toString(),
          content: errorContent,
          role: 'ASSISTANT' as const,
          createdAt: new Date().toISOString()
        };
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage]
        } : null);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * 预览文件内容
   * @param file 上传的文件
   */
  const previewFile = (file: UploadedFile) => {
    const previewMessage = {
      id: Date.now().toString(),
      content: `📁 文件预览：${file.name}\n\n\`\`\`${getFileLanguage(file.name)}\n${file.content}\n\`\`\``,
      role: 'ASSISTANT' as const,
      createdAt: new Date().toISOString()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, previewMessage]
    } : null);
  };

  /**
   * 移除上传的文件
   * @param fileId 文件ID
   */
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return {
    handleFileSelect,
    analyzeFile,
    previewFile,
    removeFile,
    getFileLanguage
  };
}










