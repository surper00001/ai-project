'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, MoreVertical, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { CodeBlock } from './CodeBlock';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  index?: number;
}

/**
 * 消息气泡组件
 * 显示用户和AI的消息，包含丰富的动画效果和交互功能
 */
export function MessageBubble({ message, isUser, index = 0 }: MessageBubbleProps) {
  // 获取主题配置
  const { themeConfig } = useTheme();
  
  // DOM引用
  const bubbleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 消息进入动画
  useEffect(() => {
    if (bubbleRef.current && avatarRef.current && contentRef.current) {
      // 清除之前的动画
      gsap.killTweensOf([bubbleRef.current, avatarRef.current, contentRef.current]);
      
      // 初始状态
      gsap.set(bubbleRef.current, { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(avatarRef.current, { opacity: 0, scale: 0 });
      gsap.set(contentRef.current, { opacity: 0, x: isUser ? 20 : -20 });
      
      // 创建时间线动画
      const tl = gsap.timeline({ delay: index * 0.1 });
      
      // 头像动画
      tl.to(avatarRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
      // 气泡容器动画
      .to(bubbleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.2")
      // 内容动画
      .to(contentRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.3");
    }
  }, [index, isUser]);

  // 内容更新动画 - 优化流式输入体验
  useEffect(() => {
    if (contentRef.current && message.content !== displayedContent) {
      // 只在内容长度变化较大时才执行动画，避免流式输入时的频繁动画
      const contentLengthDiff = Math.abs(message.content.length - displayedContent.length);
      
      if (contentLengthDiff > 10 || displayedContent === '') {
        // 内容变化时的动画
        gsap.fromTo(contentRef.current,
          { scale: 0.98, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }
        );
      }
      setDisplayedContent(message.content);
    }
  }, [message.content, displayedContent]);

  // 悬停动画
  useEffect(() => {
    if (bubbleRef.current) {
      if (isHovered) {
        gsap.to(bubbleRef.current, {
          scale: 1.02,
          y: -2,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(bubbleRef.current, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isHovered]);

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      
      // 复制成功动画
      if (bubbleRef.current) {
        gsap.to(bubbleRef.current, {
          scale: 1.05,
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

  // 点赞功能
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
    
    // 点赞动画
    if (bubbleRef.current) {
      gsap.to(bubbleRef.current, {
        scale: 1.03,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  // 点踩功能
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
    
    // 点踩动画
    if (bubbleRef.current) {
      gsap.to(bubbleRef.current, {
        scale: 0.97,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  // 重新生成功能
  const handleRegenerate = () => {
    // 重新生成动画
    if (bubbleRef.current) {
      gsap.to(bubbleRef.current, {
        rotation: 360,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
    // 这里可以添加重新生成的逻辑
  };

  // 解析消息内容，分离代码块和普通文本
  const parseContent = (content: string) => {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string; filename?: string }> = [];
    
    // 匹配代码块：```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: formatTextContent(textContent)
          });
        }
      }
      
      // 添加代码块
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push({
        type: 'code',
        content: code,
        language: language
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后剩余的文本
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: formatTextContent(textContent)
        });
      }
    }
    
    // 如果没有代码块，返回整个内容作为文本
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: formatTextContent(content)
      });
    }
    
    return parts;
  };

  // 格式化普通文本内容
  const formatTextContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      .replace(/`(.*?)`/g, `<code style="background: ${themeConfig.colors.surface}50; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; border: 1px solid ${themeConfig.colors.primary}30;">$1</code>`)
      .replace(/\n/g, '<br>');
  };

  return (
    <div
      ref={bubbleRef}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-bubble mb-6 relative z-10 message-bubble-container`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-start space-x-4 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''} relative`}>
        {/* 增强的头像 */}
        <div 
          ref={avatarRef}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden message-bubble-avatar ${
            isUser ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
          style={{ 
            background: isUser 
              ? themeConfig.colors.gradient 
              : `linear-gradient(135deg, ${themeConfig.colors.accent}, ${themeConfig.colors.secondary})`,
            transition: 'all 0.3s ease'
          }}
        >
          {isUser ? (
            <User className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
          
          {/* 头像发光效果 */}
          <div 
            className="absolute inset-0 rounded-full glow"
            style={{ 
              boxShadow: `0 0 15px ${isUser ? themeConfig.colors.primary : themeConfig.colors.accent}50`
            }}
          />
          
          {/* 在线状态指示器 */}
          {!isUser && (
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{ 
                background: themeConfig.colors.accent,
                borderColor: themeConfig.colors.background
              }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: themeConfig.colors.background }}
              />
            </div>
          )}
        </div>

        {/* 增强的消息气泡 */}
        <div 
          className={`relative group rounded-2xl p-5 shadow-2xl transition-all duration-300 max-w-full message-bubble-content ${
            isUser 
              ? 'text-white' 
              : 'backdrop-blur-xl border text-gray-100'
          }`}
          style={{ 
            background: isUser 
              ? themeConfig.colors.gradient 
              : `${themeConfig.colors.surface}30`,
            borderColor: isUser 
              ? 'transparent' 
              : `${themeConfig.colors.primary}30`,
            transition: 'all 0.3s ease',
            zIndex: 20,
            position: 'relative'
          }}
        >
          {/* 气泡背景装饰 */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-10"
            style={{ 
              backgroundImage: themeConfig.colors.gradient,
              backgroundSize: '200% 200%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'aurora-flow 6s ease infinite'
            }}
          />
          
          {/* 消息内容 */}
          <div 
            ref={contentRef}
            className="prose prose-invert max-w-none text-base leading-relaxed relative z-10 streaming-text"
            style={{ 
              color: themeConfig.colors.text
            }}
          >
            {parseContent(displayedContent).map((part, index) => (
              <div key={index} className="mb-4 last:mb-0">
                {part.type === 'text' ? (
                  <div dangerouslySetInnerHTML={{ __html: part.content }} />
                ) : (
                  <CodeBlock 
                    code={part.content} 
                    language={part.language}
                    filename={part.filename}
                  />
                )}
              </div>
            ))}
            {isTyping && (
              <span 
                className="inline-block w-2 h-5 ml-1 animate-pulse"
                style={{ background: themeConfig.colors.primary }}
              />
            )}
          </div>
          
          {/* 操作按钮组 */}
          <div className={`absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 message-actions ${
            showActions ? 'opacity-100' : ''
          }`} style={{ zIndex: 30 }}>
            {/* 复制按钮 */}
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ 
                background: `${themeConfig.colors.surface}50`,
                color: themeConfig.colors.text
              }}
              title="复制消息"
            >
              {copied ? (
                <Check className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* AI消息的额外操作 */}
            {!isUser && (
              <>
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    liked ? 'scale-110' : ''
                  }`}
                  style={{ 
                    background: liked ? `${themeConfig.colors.accent}30` : `${themeConfig.colors.surface}50`,
                    color: liked ? themeConfig.colors.accent : themeConfig.colors.text
                  }}
                  title="点赞"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDislike}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    disliked ? 'scale-110' : ''
                  }`}
                  style={{ 
                    background: disliked ? `${themeConfig.colors.primary}30` : `${themeConfig.colors.surface}50`,
                    color: disliked ? themeConfig.colors.primary : themeConfig.colors.text
                  }}
                  title="点踩"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRegenerate}
                  className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                  style={{ 
                    background: `${themeConfig.colors.surface}50`,
                    color: themeConfig.colors.text
                  }}
                  title="重新生成"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ 
                background: `${themeConfig.colors.surface}50`,
                color: themeConfig.colors.text
              }}
              title="更多操作"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* 时间戳和状态 */}
          <div 
            className={`text-xs mt-3 flex items-center justify-between ${
              isUser ? 'text-white/60' : 'text-gray-400'
            }`}
            style={{ color: themeConfig.colors.text, opacity: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-1 h-1 rounded-full"
                style={{ 
                  background: isUser ? themeConfig.colors.background : themeConfig.colors.primary,
                  opacity: 0.6
                }}
              />
              <span>
                {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* 消息状态指示器 */}
            {isUser && (
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: themeConfig.colors.accent }}
                />
                <span className="text-xs">已发送</span>
              </div>
            )}
          </div>

          {/* 消息尾巴 */}
          <div 
            className={`absolute top-4 ${
              isUser ? '-right-2' : '-left-2'
            } w-4 h-4 transform rotate-45`}
            style={{ 
              background: isUser 
                ? themeConfig.colors.gradient 
                : `${themeConfig.colors.surface}30`,
              borderColor: isUser 
                ? 'transparent' 
                : `${themeConfig.colors.primary}30`,
              zIndex: 15
            }}
          />
        </div>
      </div>
    </div>
  );
}
