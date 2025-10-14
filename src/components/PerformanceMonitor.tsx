'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  messageCount: number;
}

interface PerformanceMonitorProps {
  messageCount: number;
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
}

/**
 * 性能监控组件
 * 监控应用的性能指标，在性能下降时提供警告
 */
export function PerformanceMonitor({ messageCount, onPerformanceIssue }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    messageCount: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // 获取内存使用情况（如果支持）
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
        
        const newMetrics: PerformanceMetrics = {
          fps,
          memoryUsage,
          renderTime: performance.now() - lastTime,
          messageCount
        };
        
        setMetrics(newMetrics);
        
        // 检查性能问题
        if (fps < 30 || memoryUsage > 100 || messageCount > 100) {
          onPerformanceIssue?.(newMetrics);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [messageCount, onPerformanceIssue]);

  // 性能警告
  const hasPerformanceIssues = metrics.fps < 30 || metrics.memoryUsage > 100 || messageCount > 100;

  if (!hasPerformanceIssues && !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`p-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ${
          hasPerformanceIssues 
            ? 'bg-red-500/20 border-red-500/50 text-red-100' 
            : 'bg-blue-500/20 border-blue-500/50 text-blue-100'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">
            {hasPerformanceIssues ? '⚠️ 性能警告' : '📊 性能监控'}
          </h4>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            {isVisible ? '隐藏' : '显示'}
          </button>
        </div>
        
        {isVisible && (
          <div className="space-y-1 text-xs">
            <div>FPS: {metrics.fps}</div>
            <div>内存: {metrics.memoryUsage}MB</div>
            <div>消息数: {messageCount}</div>
            {hasPerformanceIssues && (
              <div className="mt-2 p-2 bg-red-500/20 rounded text-xs">
                <div>建议：</div>
                <div>• 减少动画效果</div>
                <div>• 清理旧消息</div>
                <div>• 刷新页面</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
