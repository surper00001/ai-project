'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './MessageBubble';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from './LoadingSpinner';
import { SimpleThemeToggle } from '@/components/SimpleThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, Plus, Bot, Settings, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content: message
        })
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
                  // 更新AI消息内容 - 优化性能，减少不必要的重渲染
                  currentAssistantContent += data.content;
                  setCurrentSession(prev => {
                    if (!prev) return null;
                    
                    const updatedMessages = prev.messages.map(msg => 
                      msg.id === data.messageId 
                        ? { ...msg, content: currentAssistantContent }
                        : msg
                    );
                    
                    return {
                      ...prev,
                      messages: updatedMessages
                    };
                  });
                  break;
                  
                case 'done':
                  // 完成流式输出
                  setSessions(prev => prev.map(s => 
                    s.id === currentSession.id 
                      ? { ...s, messages: [...s.messages, userMessage, assistantMessage] }
                      : s
                  ));
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
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10">
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
          className="flex-1 overflow-y-auto p-6 space-y-6 relative"
          style={{ 
            background: `linear-gradient(to bottom, transparent, ${themeConfig.colors.surface}10)`,
            transition: 'all 0.5s ease'
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
            className="backdrop-blur-xl border-t p-6 shadow-2xl relative overflow-hidden"
            style={{ 
              background: `${themeConfig.colors.surface}20`,
              borderColor: `${themeConfig.colors.primary}30`,
              transition: 'all 0.5s ease'
            }}
          >
            {/* 输入区域背景装饰 */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={inputAreaBackgroundStyle}
            ></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="flex space-x-4">
                {/* 输入框容器 */}
                <div className="flex-1 relative group">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入你的消息..."
                    disabled={isLoading}
                    className="w-full rounded-2xl px-6 py-4 text-lg shadow-lg transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent relative z-20"
                    style={{ 
                      background: `${themeConfig.colors.surface}30`,
                      borderColor: `${themeConfig.colors.primary}40`,
                      color: themeConfig.colors.text,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  
                  {/* 输入状态指示器 */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
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
                    className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: `linear-gradient(45deg, ${themeConfig.colors.primary}20, ${themeConfig.colors.secondary}20)`,
                      boxShadow: `0 0 20px ${themeConfig.colors.primary}30`
                    }}
                  />
                </div>
                
                {/* 发送按钮 */}
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
                  style={{ 
                    background: inputMessage.trim() ? themeConfig.colors.gradient : `${themeConfig.colors.surface}50`,
                    color: themeConfig.colors.background,
                    transition: 'all 0.3s ease'
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
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
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
              </div>
              
              {/* 输入提示 */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div 
                  className="flex items-center space-x-2"
                  style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                >
                  <span>按 Enter 发送，Shift + Enter 换行</span>
                </div>
                <div 
                  className="flex items-center space-x-2"
                  style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                >
                  <span>{inputMessage.length}/2000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
