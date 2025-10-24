/**
 * 聊天组件共享工具函数
 * 提供所有聊天相关组件使用的通用工具函数
 */

import { 
  SUPPORTED_FILE_TYPES, 
  SUPPORTED_FILE_EXTENSIONS, 
  MAX_FILE_SIZE,
  DEVICE_THRESHOLDS,
  ANIMATION_CONFIG
} from './constants';

/**
 * 设备性能检测工具
 */
export const deviceUtils = {
  /**
   * 检测是否为移动设备
   */
  isMobile: (): boolean => {
    return window.innerWidth <= DEVICE_THRESHOLDS.MOBILE;
  },

  /**
   * 检测是否为低端设备
   */
  isLowEnd: (): boolean => {
    return window.innerWidth <= DEVICE_THRESHOLDS.LOW_END;
  },

  /**
   * 获取设备类型
   */
  getDeviceType: (): 'desktop' | 'mobile' | 'low-end' => {
    if (deviceUtils.isLowEnd()) return 'low-end';
    if (deviceUtils.isMobile()) return 'mobile';
    return 'desktop';
  },

  /**
   * 获取动画配置
   */
  getAnimationConfig: () => {
    const deviceType = deviceUtils.getDeviceType();
    return ANIMATION_CONFIG[deviceType.toUpperCase() as keyof typeof ANIMATION_CONFIG];
  }
};

/**
 * 文件处理工具
 */
export const fileUtils = {
  /**
   * 验证文件类型
   * @param file 文件对象
   * @returns 是否为支持的文件类型
   */
  isValidFileType: (file: File): boolean => {
    // 检查MIME类型
    if (SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
      return true;
    }
    
    // 检查文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_FILE_EXTENSIONS.includes(extension as typeof SUPPORTED_FILE_EXTENSIONS[number]);
  },

  /**
   * 验证文件大小
   * @param file 文件对象
   * @returns 是否为有效文件大小
   */
  isValidFileSize: (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  },

  /**
   * 验证文件
   * @param file 文件对象
   * @returns 验证结果
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    if (!fileUtils.isValidFileSize(file)) {
      return { valid: false, error: '文件大小不能超过 5MB' };
    }
    
    if (!fileUtils.isValidFileType(file)) {
      return { valid: false, error: '不支持的文件类型，请上传文本文件' };
    }
    
    return { valid: true };
  },

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的文件大小字符串
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /**
   * 获取文件语言类型
   * @param filename 文件名
   * @returns 语言类型
   */
  getFileLanguage: (filename: string): string => {
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
  }
};

/**
 * 文本处理工具
 */
export const textUtils = {
  /**
   * 截断文本
   * @param text 原始文本
   * @param maxLength 最大长度
   * @param suffix 后缀
   * @returns 截断后的文本
   */
  truncate: (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
  },

  /**
   * 格式化时间
   * @param dateString 日期字符串
   * @returns 格式化后的时间字符串
   */
  formatTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('zh-CN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  },

  /**
   * 高亮搜索关键词
   * @param text 原始文本
   * @param keyword 关键词
   * @returns 高亮后的HTML字符串
   */
  highlightKeyword: (text: string, keyword: string): string => {
    if (!keyword.trim()) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark style="background: rgba(255, 255, 0, 0.3); padding: 0 2px;">$1</mark>');
  }
};

/**
 * 性能优化工具
 */
export const performanceUtils = {
  /**
   * 节流函数
   * @param func 要节流的函数
   * @param delay 延迟时间
   * @returns 节流后的函数
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param delay 延迟时间
   * @returns 防抖后的函数
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * 内存使用监控
   * @returns 内存使用信息
   */
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

/**
 * 错误处理工具
 */
export const errorUtils = {
  /**
   * 获取用户友好的错误消息
   * @param error 错误对象
   * @returns 用户友好的错误消息
   */
  getUserFriendlyMessage: (error: Error): string => {
    const errorMessages: { [key: string]: string } = {
      'API_QUOTA_EXCEEDED': '⚠️ API调用次数已达上限，请稍后再试或联系管理员',
      'API_KEY_INVALID': '🔑 API密钥配置有误，请联系管理员',
      'API_SERVICE_UNAVAILABLE': '🔧 AI服务暂时不可用，请稍后重试',
      'NETWORK_ERROR': '🌐 网络连接异常，请检查网络后重试',
      'API_ERROR': '❌ AI服务出现错误，请稍后重试',
      'AbortError': '⏰ 请求已取消',
      'TimeoutError': '⏰ 请求超时，请稍后重试'
    };
    
    return errorMessages[error.name] || errorMessages[error.message] || '❌ 发生未知错误，请稍后重试';
  },

  /**
   * 记录错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  logError: (error: Error, context?: string) => {
    console.error(`[${context || 'Unknown'}] Error:`, error);
    
    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
  }
};

/**
 * 样式工具
 */
export const styleUtils = {
  /**
   * 生成渐变样式
   * @param colors 颜色数组
   * @param direction 渐变方向
   * @returns CSS渐变字符串
   */
  createGradient: (colors: string[], direction = '45deg'): string => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },

  /**
   * 生成阴影样式
   * @param color 阴影颜色
   * @param intensity 强度
   * @returns CSS阴影字符串
   */
  createGlow: (color: string, intensity = 0.3): string => {
    return `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
  },

  /**
   * 生成动画样式
   * @param name 动画名称
   * @param duration 持续时间
   * @param easing 缓动函数
   * @returns CSS动画字符串
   */
  createAnimation: (name: string, duration = '0.3s', easing = 'ease'): string => {
    return `${name} ${duration} ${easing}`;
  }
};







