/**
 * 历史记录管理工具
 * 提供自动清理、分页加载、性能优化等功能
 */

export interface ChatSession {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT';
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryManagerConfig {
  maxSessions: number; // 最大会话数量
  maxMessagesPerSession: number; // 每个会话最大消息数
  autoCleanupDays: number; // 自动清理天数
  enableVirtualization: boolean; // 是否启用虚拟化
  pageSize: number; // 分页大小
}

export class HistoryManager {
  private config: HistoryManagerConfig;
  private sessions: ChatSession[] = [];
  private lastCleanupTime: number = 0;

  constructor(config: Partial<HistoryManagerConfig> = {}) {
    this.config = {
      maxSessions: 100,
      maxMessagesPerSession: 50,
      autoCleanupDays: 30,
      enableVirtualization: true,
      pageSize: 20,
      ...config
    };
  }

  /**
   * 设置会话列表
   */
  setSessions(sessions: ChatSession[]): void {
    this.sessions = sessions;
    this.performAutoCleanup();
  }

  /**
   * 获取会话列表（带分页）
   */
  getSessions(page: number = 1, searchQuery: string = '', sortBy: string = 'recent'): {
    sessions: ChatSession[];
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  } {
    let filteredSessions = [...this.sessions];

    // 搜索过滤
    if (searchQuery) {
      filteredSessions = filteredSessions.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        this.getLastMessage(session).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序
    filteredSessions.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'messages':
          return b.messages.length - a.messages.length;
        default:
          return 0;
      }
    });

    // 分页
    const startIndex = (page - 1) * this.config.pageSize;
    const endIndex = startIndex + this.config.pageSize;
    const paginatedSessions = filteredSessions.slice(0, endIndex);

    return {
      sessions: paginatedSessions,
      totalPages: Math.ceil(filteredSessions.length / this.config.pageSize),
      totalCount: filteredSessions.length,
      hasMore: endIndex < filteredSessions.length
    };
  }

  /**
   * 添加新会话
   */
  addSession(session: ChatSession): void {
    this.sessions.unshift(session);
    this.performAutoCleanup();
  }

  /**
   * 更新会话
   */
  updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    const index = this.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...updates };
    }
  }

  /**
   * 删除会话
   */
  deleteSession(sessionId: string): void {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
  }

  /**
   * 清理旧会话
   */
  cleanupOldSessions(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.autoCleanupDays);
    
    const initialCount = this.sessions.length;
    this.sessions = this.sessions.filter(session => 
      new Date(session.updatedAt) > cutoffDate
    );
    
    return initialCount - this.sessions.length;
  }

  /**
   * 清理长会话
   */
  cleanupLongSessions(): number {
    let cleanedCount = 0;
    
    this.sessions.forEach(session => {
      if (session.messages.length > this.config.maxMessagesPerSession) {
        // 保留最新的消息
        const messagesToKeep = session.messages.slice(-this.config.maxMessagesPerSession);
        session.messages = messagesToKeep;
        cleanedCount++;
      }
    });
    
    return cleanedCount;
  }

  /**
   * 限制会话数量
   */
  limitSessionCount(): number {
    if (this.sessions.length <= this.config.maxSessions) {
      return 0;
    }
    
    const sessionsToRemove = this.sessions.length - this.config.maxSessions;
    // 按更新时间排序，删除最旧的会话
    this.sessions.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    this.sessions = this.sessions.slice(sessionsToRemove);
    
    return sessionsToRemove;
  }

  /**
   * 执行自动清理
   */
  private performAutoCleanup(): void {
    const now = Date.now();
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24小时
    
    if (now - this.lastCleanupTime < cleanupInterval) {
      return;
    }
    
    this.lastCleanupTime = now;
    
    let totalCleaned = 0;
    
    // 清理旧会话
    totalCleaned += this.cleanupOldSessions();
    
    // 清理长会话
    totalCleaned += this.cleanupLongSessions();
    
    // 限制会话数量
    totalCleaned += this.limitSessionCount();
    
    if (totalCleaned > 0) {
      console.log(`自动清理完成，清理了 ${totalCleaned} 个会话/消息`);
    }
  }

  /**
   * 获取会话统计信息
   */
  getStatistics(): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    oldestSession: Date | null;
    newestSession: Date | null;
    memoryUsage: number; // 估算内存使用（KB）
  } {
    const totalSessions = this.sessions.length;
    const totalMessages = this.sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
    
    const dates = this.sessions.map(s => new Date(s.updatedAt));
    const oldestSession = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const newestSession = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
    
    // 估算内存使用（粗略计算）
    const memoryUsage = this.sessions.reduce((sum, session) => {
      const sessionSize = JSON.stringify(session).length;
      return sum + sessionSize;
    }, 0) / 1024; // 转换为KB
    
    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession,
      oldestSession,
      newestSession,
      memoryUsage
    };
  }

  /**
   * 获取最后一条消息
   */
  private getLastMessage(session: ChatSession): string {
    if (session.messages.length === 0) return '新对话';
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  }

  /**
   * 导出会话数据
   */
  exportSessions(): string {
    return JSON.stringify(this.sessions, null, 2);
  }

  /**
   * 导入会话数据
   */
  importSessions(data: string): boolean {
    try {
      const sessions = JSON.parse(data);
      if (Array.isArray(sessions)) {
        this.sessions = sessions;
        this.performAutoCleanup();
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入会话数据失败:', error);
      return false;
    }
  }

  /**
   * 清空所有会话
   */
  clearAllSessions(): void {
    this.sessions = [];
  }

  /**
   * 获取配置
   */
  getConfig(): HistoryManagerConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<HistoryManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建默认实例
export const historyManager = new HistoryManager();



