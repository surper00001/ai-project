'use client';

import { RefObject } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
  /** 搜索查询 */
  searchQuery: string;
  /** 搜索查询变化回调 */
  onSearchChange: (query: string) => void;
  /** 搜索框引用 */
  searchRef: RefObject<HTMLInputElement>;
}

/**
 * 侧边栏搜索组件
 * 提供搜索功能
 */
export function SidebarSearch({ searchQuery, onSearchChange, searchRef }: SidebarSearchProps) {
  const { themeConfig } = useTheme();

  return (
    <div className="relative">
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
        style={{ color: themeConfig.colors.text, opacity: 0.5 }}
      />
      <input
        ref={searchRef}
        type="text"
        placeholder="搜索对话..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
        style={{ 
          background: `${themeConfig.colors.surface}50`,
          borderColor: `${themeConfig.colors.primary}30`,
          color: themeConfig.colors.text,
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
}

