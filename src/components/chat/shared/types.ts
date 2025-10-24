/**
 * 聊天组件共享类型定义
 * 定义所有聊天相关组件使用的类型
 */

/**
 * 消息接口
 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息内容 */
  content: string;
  /** 消息角色 */
  role: 'USER' | 'ASSISTANT';
  /** 创建时间 */
  createdAt: string;
  /** 可选的会话ID */
  chatSessionId?: string;
}

/**
 * 聊天会话接口
 */
export interface ChatSession {
  /** 会话唯一标识 */
  id: string;
  /** 会话标题 */
  title: string;
  /** 消息列表 */
  messages: Message[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 上传文件接口
 */
export interface UploadedFile {
  /** 文件唯一标识 */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: string;
  /** 文件内容 */
  content: string;
  /** 上传时间 */
  uploadedAt: string;
}

/**
 * 粒子效果接口
 */
export interface Particle {
  /** 水平位置百分比 */
  left: number;
  /** 垂直位置百分比 */
  top: number;
  /** 动画延迟时间（秒） */
  animationDelay: number;
  /** 动画持续时间（秒） */
  animationDuration: number;
}

/**
 * 统计信息接口
 */
export interface Statistics {
  /** 总会话数 */
  totalSessions: number;
  /** 总消息数 */
  totalMessages: number;
  /** 平均每会话消息数 */
  averageMessagesPerSession: number;
  /** 内存使用量（KB） */
  memoryUsage: number;
}

/**
 * 排序方式类型
 */
export type SortBy = 'recent' | 'name' | 'messages';

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'low-end';

/**
 * 流式响应类型
 */
export interface StreamResponse {
  /** 响应类型 */
  type: 'user_message' | 'start' | 'chunk' | 'done' | 'interrupted' | 'error' | 'quota_exceeded' | 'api_key_error' | 'service_unavailable' | 'network_error' | 'api_error' | 'unknown_error';
  /** 消息ID */
  messageId?: string;
  /** 消息内容 */
  message?: Message;
  /** 内容片段 */
  content?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 消息数量 */
  messageCount: number;
  /** 渲染时间 */
  renderTime?: number;
  /** 内存使用量 */
  memoryUsage?: number;
  /** 其他自定义指标 */
  [key: string]: unknown;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 颜色配置 */
  colors: {
    /** 背景色 */
    background: string;
    /** 表面色 */
    surface: string;
    /** 主色调 */
    primary: string;
    /** 次要色 */
    secondary: string;
    /** 强调色 */
    accent: string;
    /** 文本色 */
    text: string;
    /** 渐变 */
    gradient: string;
  };
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 节流时间（毫秒） */
  throttleTime: number;
  /** 粒子数量 */
  particleCount: number;
  /** 动画持续时间（秒） */
  animationDuration: number;
}

/**
 * 文件验证结果接口
 */
export interface FileValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  /** 组件名称 */
  component?: string;
  /** 操作类型 */
  action?: string;
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId?: string;
  /** 其他上下文信息 */
  [key: string]: unknown;
}

/**
 * 历史记录管理操作类型
 */
export type HistoryAction = 'cleanup' | 'export' | 'import' | 'delete';

/**
 * 历史记录管理配置接口
 */
export interface HistoryConfig {
  /** 最大会话数 */
  maxSessions: number;
  /** 每会话最大消息数 */
  maxMessagesPerSession: number;
  /** 清理间隔（毫秒） */
  cleanupInterval: number;
}

/**
 * 搜索配置接口
 */
export interface SearchConfig {
  /** 搜索查询 */
  query: string;
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 是否使用正则表达式 */
  useRegex?: boolean;
  /** 搜索范围 */
  scope?: 'title' | 'content' | 'all';
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  /** 排序字段 */
  field: SortBy;
  /** 排序方向 */
  direction: 'asc' | 'desc';
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  /** 当前页码 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总数 */
  total: number;
}

/**
 * 组件状态接口
 */
export interface ComponentState {
  /** 是否加载中 */
  loading: boolean;
  /** 是否错误 */
  error: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 是否初始化 */
  initialized: boolean;
}







