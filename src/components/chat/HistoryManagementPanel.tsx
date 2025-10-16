'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Settings, 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface HistoryManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanup: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  statistics: {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    memoryUsage: number;
  };
}

/**
 * 历史记录管理面板
 * 提供清理、导出、导入、统计等功能
 */
export function HistoryManagementPanel({
  isOpen,
  onClose,
  onCleanup,
  onExport,
  onImport,
  statistics
}: HistoryManagementPanelProps) {
  const { themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'cleanup' | 'export' | 'statistics'>('cleanup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      document.body.appendChild(input);
      setFileInput(input);

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            onImport(content);
            setIsProcessing(false);
          };
          reader.readAsText(file);
        }
      };

      return () => {
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };
    }
  }, [isOpen, onImport]);

  const handleImport = () => {
    if (fileInput) {
      setIsProcessing(true);
      fileInput.click();
    }
  };

  const handleExport = () => {
    setIsProcessing(true);
    onExport();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const handleCleanup = () => {
    setIsProcessing(true);
    onCleanup();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 面板内容 */}
      <div 
        className="relative w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-xl rounded-2xl border shadow-2xl"
        style={{ 
          background: `${themeConfig.colors.surface}95`,
          borderColor: `${themeConfig.colors.primary}30`
        }}
      >
        {/* 头部 */}
        <div className="p-6 border-b" style={{ borderColor: `${themeConfig.colors.primary}20` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: themeConfig.colors.gradient }}
              >
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: themeConfig.colors.text }}
                >
                  历史记录管理
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                >
                  管理聊天历史和性能优化
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="rounded-full"
              style={{ color: themeConfig.colors.text }}
            >
              ✕
            </Button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b" style={{ borderColor: `${themeConfig.colors.primary}20` }}>
          {[
            { id: 'cleanup', label: '清理', icon: Trash2 },
            { id: 'export', label: '导出/导入', icon: Download },
            { id: 'statistics', label: '统计', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'sessions' | 'favorites' | 'settings')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 transition-all duration-300 ${
                activeTab === id ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === id ? themeConfig.colors.primary : themeConfig.colors.text,
                borderBottomColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                opacity: activeTab === id ? 1 : 0.7
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {activeTab === 'cleanup' && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle 
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: themeConfig.colors.primary }}
                />
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: themeConfig.colors.text }}
                >
                  清理历史记录
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                >
                  清理旧的和过长的对话记录，释放存储空间并提升性能
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: themeConfig.colors.text }}
                    >
                      清理30天前的记录
                    </span>
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                  >
                    删除超过30天未更新的对话
                  </p>
                </div>

                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: themeConfig.colors.text }}
                    >
                      清理长对话
                    </span>
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: themeConfig.colors.text, opacity: 0.6 }}
                  >
                    保留每个对话的最新50条消息
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCleanup}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl font-semibold"
                style={{ 
                  background: themeConfig.colors.gradient,
                  color: themeConfig.colors.background
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    清理中...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    开始清理
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="text-center">
                <Download 
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: themeConfig.colors.accent }}
                />
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: themeConfig.colors.text }}
                >
                  导出/导入数据
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                >
                  备份或恢复你的聊天历史记录
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{ 
                    background: themeConfig.colors.gradient,
                    color: themeConfig.colors.background
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      导出历史记录
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleImport}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{ 
                    borderColor: themeConfig.colors.primary,
                    color: themeConfig.colors.text
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  导入历史记录
                </Button>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{ background: `${themeConfig.colors.accent}10` }}
              >
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: themeConfig.colors.accent }} />
                  <div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: themeConfig.colors.text }}
                    >
                      提示
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                    >
                      导出的文件为JSON格式，包含所有对话记录。导入时会覆盖现有数据，请谨慎操作。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="text-center">
                <BarChart3 
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: themeConfig.colors.accent }}
                />
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: themeConfig.colors.text }}
                >
                  使用统计
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                >
                  查看你的聊天数据统计信息
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-xl border text-center"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: themeConfig.colors.primary }}
                  >
                    {statistics.totalSessions}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                  >
                    总对话数
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border text-center"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: themeConfig.colors.accent }}
                  >
                    {statistics.totalMessages}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                  >
                    总消息数
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border text-center"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: themeConfig.colors.secondary }}
                  >
                    {Math.round(statistics.averageMessagesPerSession)}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                  >
                    平均消息数
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border text-center"
                  style={{ 
                    background: `${themeConfig.colors.surface}30`,
                    borderColor: `${themeConfig.colors.primary}20`
                  }}
                >
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: themeConfig.colors.primary }}
                  >
                    {Math.round(statistics.memoryUsage)}KB
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: themeConfig.colors.text, opacity: 0.7 }}
                  >
                    存储使用
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
