/**
 * ChatInterface组件导出文件
 * 统一导出所有相关组件和Hooks
 */

// 主组件
export { ChatInterface } from './ChatInterface';

// 子组件
export { ChatHeader } from './components/ChatHeader';
export { WelcomeScreen } from './components/WelcomeScreen';
export { ChatInputArea } from './components/ChatInputArea';
export { LoginPrompt } from './components/LoginPrompt';

// 自定义Hooks
export { useChatState } from './hooks/useChatState';
export { useChatAnimations } from './hooks/useChatAnimations';
export { useChatSessions } from './hooks/useChatSessions';
export { useChatMessages } from './hooks/useChatMessages';
export { useFileUpload } from './hooks/useFileUpload';
export { useParticleEffects } from './hooks/useParticleEffects';

// 类型定义
export type { Message, ChatSession, UploadedFile } from './hooks/useChatState';
export type { Particle } from './hooks/useParticleEffects';





