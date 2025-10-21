/**
 * 聊天组件共享常量
 * 定义所有聊天相关组件使用的常量
 */

/**
 * 支持的文件类型
 * 用于文件上传功能
 */
export const SUPPORTED_FILE_TYPES = [
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
] as const;

/**
 * 支持的文件扩展名
 * 用于文件类型验证
 */
export const SUPPORTED_FILE_EXTENSIONS = [
  'txt', 'md', 'json', 'csv', 'js', 'ts', 'css', 'html', 
  'py', 'java', 'c', 'cpp', 'cs', 'xml', 'yaml', 'yml'
] as const;

/**
 * 文件大小限制
 * 单位：字节
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 消息长度限制
 */
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * 代码块展开阈值
 * 超过此行数时显示展开按钮
 */
export const CODE_BLOCK_EXPAND_THRESHOLD = 10;

/**
 * 设备性能检测阈值
 */
export const DEVICE_THRESHOLDS = {
  MOBILE: 768,
  LOW_END: 480
} as const;

/**
 * 动画性能配置
 * 根据设备性能调整动画参数
 */
export const ANIMATION_CONFIG = {
  DESKTOP: {
    THROTTLE_TIME: 100,
    PARTICLE_COUNT: 20,
    ANIMATION_DURATION: 0.6
  },
  MOBILE: {
    THROTTLE_TIME: 150,
    PARTICLE_COUNT: 5,
    ANIMATION_DURATION: 0.4
  },
  LOW_END: {
    THROTTLE_TIME: 200,
    PARTICLE_COUNT: 0,
    ANIMATION_DURATION: 0
  }
} as const;

/**
 * 流式更新配置
 */
export const STREAM_CONFIG = {
  TIMEOUT: 30000, // 30秒超时
  CHUNK_SIZE: 1024,
  RETRY_ATTEMPTS: 3
} as const;

/**
 * 历史记录管理配置
 */
export const HISTORY_CONFIG = {
  MAX_SESSIONS: 100,
  MAX_MESSAGES_PER_SESSION: 1000,
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000 // 7天
} as const;

/**
 * 主题相关常量
 */
export const THEME_CONFIG = {
  TRANSITION_DURATION: 500,
  GLOW_INTENSITY: 0.3,
  BACKDROP_BLUR: 20
} as const;





