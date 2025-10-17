'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, MessageSquare, Filter } from 'lucide-react';

interface SidebarFiltersProps {
  /** 当前排序方式 */
  sortBy: 'recent' | 'name' | 'messages';
  /** 排序方式变化回调 */
  onSortChange: (sortBy: 'recent' | 'name' | 'messages') => void;
}

/**
 * 侧边栏筛选组件
 * 提供排序和筛选功能
 */
export function SidebarFilters({ sortBy, onSortChange }: SidebarFiltersProps) {
  const { themeConfig } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => onSortChange('recent')}
        size="sm"
        variant={sortBy === 'recent' ? 'default' : 'ghost'}
        className="rounded-lg transition-all duration-300"
        style={{ 
          background: sortBy === 'recent' ? themeConfig.colors.primary : 'transparent',
          color: sortBy === 'recent' ? themeConfig.colors.background : themeConfig.colors.text
        }}
      >
        <Clock className="w-3 h-3 mr-1" />
        最近
      </Button>
      <Button
        onClick={() => onSortChange('name')}
        size="sm"
        variant={sortBy === 'name' ? 'default' : 'ghost'}
        className="rounded-lg transition-all duration-300"
        style={{ 
          background: sortBy === 'name' ? themeConfig.colors.primary : 'transparent',
          color: sortBy === 'name' ? themeConfig.colors.background : themeConfig.colors.text
        }}
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        名称
      </Button>
      <Button
        onClick={() => onSortChange('messages')}
        size="sm"
        variant={sortBy === 'messages' ? 'default' : 'ghost'}
        className="rounded-lg transition-all duration-300"
        style={{ 
          background: sortBy === 'messages' ? themeConfig.colors.primary : 'transparent',
          color: sortBy === 'messages' ? themeConfig.colors.background : themeConfig.colors.text
        }}
      >
        <Filter className="w-3 h-3 mr-1" />
        消息数
      </Button>
    </div>
  );
}

