'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { EnhancedInput as Input } from '@/components/ui/enhanced-input';
import { MessageBubble } from './MessageBubble';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from './LoadingSpinner';
import { FileUploadButton } from './FileUploadButton';
import { SimpleThemeToggle } from '@/components/SimpleThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, Plus, Bot, Settings, Volume2, VolumeX, Maximize2, Minimize2, Square, Upload, FileText, X } from 'lucide-react';

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: string;
}

/**
 * 聊天界面主组件
 * 提供完整的聊天功能，包括消息发送、会话管理、主题切换等
 */
export function ChatInterface() {
  // 获取用户会话信息
  const { data: session } = useSession();
  
  // 获取主题配置
  const { themeConfig, isTransitioning } = useTheme();
  
  // 状态管理
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // 粒子效果状态
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);
  
  // DOM引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // 流式更新节流控制
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingContentRef = useRef<string>('');

  // 页面加载动画
  useEffect(() => {
    if (mainContainerRef.current && backgroundRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([mainContainerRef.current, backgroundRef.current]);
      
      // 初始状态
      gsap.set(mainContainerRef.current, { opacity: 0, y: 50 });
      gsap.set(backgroundRef.current, { opacity: 0, scale: 1.1 });
      
      // 页面进入动画
      const tl = gsap.timeline();
      tl.to(backgroundRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out"
      })
      .to(mainContainerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5");
    }
  }, []);

  // 主题切换动画
  useEffect(() => {
    if (isTransitioning && backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      });
    }
  }, [isTransitioning]);

  // 加载聊天会话
  useEffect(() => {
    if (session?.user?.email) {
      loadSessions();
    }
  }, [session]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // 生成粒子效果数据（仅在客户端）
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // 清理定时器，避免内存泄漏
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = { ...data.session, messages: [] };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const interruptConversation = async () => {
    if (abortController) {
      setIsInterrupting(true);
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsInterrupting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // 创建新的AbortController用于中断请求
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content: message
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let userMessage: any = null;
      let assistantMessage: any = null;
      let currentAssistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'user_message':
                  userMessage = data.message;
                  // 立即添加用户消息
                  setCurrentSession(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, userMessage]
                  } : null);
                  break;
                  
                case 'start':
                  // 创建空的AI消息
                  assistantMessage = {
                    id: data.messageId,
                    content: '',
                    role: 'ASSISTANT',
                    createdAt: new Date().toISOString(),
                    chatSessionId: currentSession.id
                  };
                  setCurrentSession(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, assistantMessage]
                  } : null);
                  break;
                  
                case 'chunk':
                  // 更新AI消息内容 - 使用优化的节流更新
                  currentAssistantContent += data.content;
                  
                  // 使用优化的更新函数，减少重渲染
                  updateStreamingContent(data.messageId, currentAssistantContent, false);
                  break;
                  
                case 'done':
                  // 完成流式输出 - 确保最终内容被更新
                  updateStreamingContent(data.messageId, currentAssistantContent, true);
                  
                  // 清除节流定时器
                  if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                    updateTimeoutRef.current = null;
                  }
                  
                  setSessions(prev => prev.map(s => 
                    s.id === currentSession.id 
                      ? { ...s, messages: [...s.messages, userMessage, assistantMessage] }
                      : s
                  ));
                  break;
                  
                case 'interrupted':
                  // 对话被中断
                  console.log('Conversation interrupted');
                  // 更新当前会话中的消息状态
                  setCurrentSession(prev => {
                    if (!prev) return null;
                    const updatedMessages = prev.messages.map(msg => 
                      msg.id === data.messageId 
                        ? { ...msg, content: msg.content + '\n\n[对话已中断]' }
                        : msg
                    );
                    return { ...prev, messages: updatedMessages };
                  });
                  break;
                  
                case 'error':
                  console.error('Stream error:', data.error);
                  break;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Conversation interrupted by user');
        // 中断时不需要显示错误，只是停止加载
      } else {
        console.error('Error sending message:', error);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 优化的流式内容更新函数
  const updateStreamingContent = useCallback((messageId: string, content: string, immediate = false) => {
    pendingContentRef.current = content;
    
    // 清除之前的定时器
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // 立即更新或延迟更新
    const updateContent = () => {
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const updatedMessages = prev.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: pendingContentRef.current }
            : msg
        );
        
        return {
          ...prev,
          messages: updatedMessages
        };
      });
    };
    
    if (immediate) {
      updateContent();
    } else {
      // 使用节流，每100ms最多更新一次
      updateTimeoutRef.current = setTimeout(updateContent, 100);
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 文件处理函数
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

  // 读取文件内容
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

  // 分析文件内容
  const analyzeFile = async (file: UploadedFile) => {
    if (!currentSession || isLoading) return;

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
      let assistantMessage: any = null;
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
                setCurrentSession(prev => prev ? {
                  ...prev,
                  messages: [...prev.messages, assistantMessage]
                } : null);
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
            } catch (e) {
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
        // 添加错误消息
        const errorMessage = {
          id: Date.now().toString(),
          content: `❌ 文件分析失败，请检查网络连接或稍后重试。`,
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

  // 获取文件语言类型
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

  // 预览文件内容
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

  // 移除上传的文件
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 稳定的样式对象，避免重新渲染时的样式冲突
  const inputAreaBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 8s ease infinite'
  }), [themeConfig.colors.gradient]);

  const mainBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '400% 400%',
    animation: 'aurora-flow 8s ease infinite'
  }), [themeConfig.colors.gradient]);

  const topBarBackgroundStyle = useMemo(() => ({
    backgroundImage: themeConfig.colors.gradient,
    backgroundSize: '200% 200%',
    animation: 'aurora-flow 6s ease infinite'
  }), [themeConfig.colors.gradient]);

  // 移除重复的GSAP动画，避免与MessageBubble组件中的动画冲突

  // 如果用户未登录，显示登录提示
  if (!session) {
    return (
      <div 
        className="flex items-center justify-center h-screen relative overflow-hidden"
        style={{ 
          background: themeConfig.colors.gradient,
          transition: 'all 0.5s ease'
        }}
      >
        {/* 动态背景粒子效果 */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-30 float-particle"
              style={{
                background: themeConfig.colors.primary,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center text-white relative z-10">
          <div className="relative mb-8">
            <Bot className="w-20 h-20 mx-auto mb-4 heartbeat" style={{ color: themeConfig.colors.primary }} />
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full glow" style={{ 
              boxShadow: `0 0 20px ${themeConfig.colors.primary}` 
            }}></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 slide-in-up" style={{ color: themeConfig.colors.text }}>
            请先登录
          </h2>
          <p className="text-lg slide-in-up" style={{ 
            color: themeConfig.colors.text,
            opacity: 0.8 
          }}>
            登录后即可开始与AI聊天
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mainContainerRef}
      className={`flex h-screen relative overflow-hidden transition-all duration-500 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ 
        background: themeConfig.colors.background,
        transition: 'all 0.5s ease'
      }}
    >
      {/* 动态背景装饰 */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-30"
        style={mainBackgroundStyle}
      >
        {/* 主题特定的背景效果 */}
        {themeConfig.name === 'cyberpunk' && (
          <div className="absolute inset-0 cyber-scan"></div>
        )}
        
        {/* 浮动粒子 */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full float-particle"
            style={{
              background: themeConfig.colors.primary,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* 侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onCreateSession={createNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative z-10 min-h-0">
        {/* 增强的顶部栏 */}
        <div 
          className="backdrop-blur-xl border-b p-6 shadow-2xl relative overflow-hidden"
          style={{ 
            background: `${themeConfig.colors.surface}20`,
            borderColor: `${themeConfig.colors.primary}30`,
            transition: 'all 0.5s ease'
          }}
        >
          {/* 顶部栏背景装饰 */}
          <div 
            className="absolute inset-0 opacity-10"
            style={topBarBackgroundStyle}
          ></div>
          
          <div className="flex items-center justify-between relative z-10">
            {/* 左侧区域 */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-full p-3 transition-all duration-300 hover:scale-110 elastic"
                style={{ 
                  color: themeConfig.colors.text,
                  background: `${themeConfig.colors.primary}20`
                }}
              >
                <Plus className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                  style={{ 
                    background: themeConfig.colors.gradient,
                    transition: 'all 0.5s ease'
                  }}
                >
                  <Bot className="w-7 h-7 text-white" />
                  <div className="absolute inset-0 rounded-full glow"></div>
                </div>
                <div>
                  <h1 
                    className="text-xl font-bold slide-in-left"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {currentSession?.title || 'AI 聊天助手'}
                  </h1>
                  <p 
                    className="text-sm slide-in-left"
                    style={{ 
                      color: themeConfig.colors.text,
                      opacity: 0.7 
                    }}
                  >
                    {session?.user?.name || session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧控制区域 */}
            <div className="flex items-center space-x-3">
              {/* 状态指示器 */}
              <div 
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{ 
                  background: `${themeConfig.colors.accent}20`,
                  border: `1px solid ${themeConfig.colors.accent}40`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: themeConfig.colors.accent }}
                ></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: themeConfig.colors.accent }}
                >
                  AI 在线
                </span>
              </div>

              {/* 控制按钮组 */}
              <div className="flex items-center space-x-2">
                {/* 静音按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full p-2 transition-all duration-300 hover:scale-110"
                  style={{ 
                    color: themeConfig.colors.text,
                    background: isMuted ? `${themeConfig.colors.primary}30` : 'transparent'
                  }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                {/* 全屏按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-full p-2 transition-all duration-300 hover:scale-110"
                  style={{ 
                    color: themeConfig.colors.text,
                    background: isFullscreen ? `${themeConfig.colors.primary}30` : 'transparent'
                  }}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>

                {/* 设置按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="rounded-full p-2 transition-all duration-300 hover:scale-110"
                  style={{ 
                    color: themeConfig.colors.text,
                    background: showSettings ? `${themeConfig.colors.primary}30` : 'transparent'
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* 主题切换按钮 */}
                <SimpleThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* 增强的消息区域 */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative"
          style={{ 
            background: `linear-gradient(to bottom, transparent, ${themeConfig.colors.surface}10)`,
            transition: 'all 0.5s ease',
            minHeight: 0, // 确保flex子元素可以收缩
            paddingBottom: '2rem' // 为输入区域留出空间
          }}
        >
          {currentSession ? (
            <>
              {/* 消息列表 */}
              <div className="space-y-6">
                {currentSession.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isUser={message.role === 'USER'}
                    index={index}
                  />
                ))}
              </div>
              
              {/* 加载指示器 */}
              {isLoading && <LoadingSpinner />}
              
              {/* 滚动锚点 */}
              <div ref={messagesEndRef} />
            </>
          ) : (
            /* 欢迎界面 */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto">
                {/* 主图标区域 */}
                <div className="relative mb-12">
                  <div 
                    className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                    style={{ 
                      background: themeConfig.colors.gradient,
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <Bot className="w-16 h-16 text-white" />
                    <div className="absolute inset-0 rounded-full glow"></div>
                  </div>
                  
                  {/* 环绕动画圆环 */}
                  <div className="absolute inset-0 w-32 h-32 mx-auto">
                    <div 
                      className="absolute inset-0 rounded-full border-2 rotate-halo"
                      style={{ 
                        borderColor: `${themeConfig.colors.primary}30`,
                        borderTopColor: themeConfig.colors.primary
                      }}
                    ></div>
                    <div 
                      className="absolute inset-2 rounded-full border-2 rotate-halo"
                      style={{ 
                        borderColor: `${themeConfig.colors.secondary}20`,
                        borderTopColor: themeConfig.colors.secondary,
                        animationDirection: 'reverse',
                        animationDuration: '3s'
                      }}
                    ></div>
                  </div>
                  
                  {/* 状态指示器 */}
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: themeConfig.colors.accent }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ background: themeConfig.colors.background }}
                    ></div>
                  </div>
                </div>

                {/* 欢迎文字 */}
                <div className="space-y-6">
                  <h2 
                    className="text-5xl font-bold slide-in-up"
                    style={{ 
                      backgroundImage: themeConfig.colors.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    欢迎使用 AI 聊天助手
                  </h2>
                  
                  <p 
                    className="text-xl slide-in-up"
                    style={{ 
                      color: themeConfig.colors.text,
                      opacity: 0.8 
                    }}
                  >
                    我是你的AI聊天助手，可以和你聊天、回答问题、提供帮助，让我们的对话更有趣
                  </p>
                  
                  {/* 功能特色 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[
                      { icon: '💬', title: '智能对话', desc: '自然流畅的对话体验' },
                      { icon: '🎨', title: '多主题', desc: '多种炫酷主题选择' },
                      { icon: '⚡', title: '快速响应', desc: '实时流式输出' }
                    ].map((feature, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl backdrop-blur-sm border slide-in-up"
                        style={{ 
                          background: `${themeConfig.colors.surface}20`,
                          borderColor: `${themeConfig.colors.primary}30`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: themeConfig.colors.text }}
                        >
                          {feature.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ 
                            color: themeConfig.colors.text,
                            opacity: 0.7 
                          }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* 开始按钮 */}
                  <div className="mt-12">
                    <Button
                      onClick={createNewSession}
                      className="px-12 py-6 rounded-full font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 elastic"
                      style={{ 
                        background: themeConfig.colors.gradient,
                        color: themeConfig.colors.background
                      }}
                    >
                      <Plus className="w-6 h-6 mr-3" />
                      开始新对话
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 增强的输入区域 */}
        {currentSession && (
          <div 
            className="backdrop-blur-xl border-t shadow-2xl relative overflow-hidden"
            style={{ 
              background: `${themeConfig.colors.surface}20`,
              borderColor: `${themeConfig.colors.primary}30`,
              transition: 'all 0.5s ease',
              padding: '1.5rem 0',
              marginTop: 'auto'
            }}
          >
            {/* 输入区域背景装饰 */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={inputAreaBackgroundStyle}
            ></div>
            
            <div className="max-w-5xl mx-auto relative z-10 px-4 sm:px-6">
              <div className="flex flex-col space-y-3">
                {/* 文件上传区域 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileUploadButton 
                      onFileSelect={handleFileSelect} 
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
                            onClick={() => previewFile(file)}
                            className="p-1 rounded-full hover:bg-green-500/20 transition-colors"
                            title="预览文件"
                          >
                            <FileText className="w-3 h-3" style={{ color: themeConfig.colors.accent }} />
                          </button>
                          <button
                            onClick={() => analyzeFile(file)}
                            className="p-1 rounded-full hover:bg-blue-500/20 transition-colors"
                            title="分析文件"
                            disabled={isLoading}
                          >
                            <Bot className="w-3 h-3" style={{ color: themeConfig.colors.accent }} />
                          </button>
                          <button
                            onClick={() => removeFile(file.id)}
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
                  <div className="flex-1 relative group">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                      onClick={interruptConversation}
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
                      onClick={sendMessage}
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
        )}
      </div>
    </div>
  );
}
