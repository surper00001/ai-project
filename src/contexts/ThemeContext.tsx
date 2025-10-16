'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// 定义主题类型
export type Theme = 'light' | 'dark' | 'cyberpunk' | 'neon' | 'aurora';

// 主题配置接口
interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    gradient: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

// 主题配置映射
const themeConfigs: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: '明亮模式',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      accent: '#06b6d4',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  dark: {
    name: 'dark',
    displayName: '暗黑模式',
    colors: {
      primary: '#8b5cf6',
      secondary: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#06b6d4',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  cyberpunk: {
    name: 'cyberpunk',
    displayName: '赛博朋克',
    colors: {
      primary: '#ff0080',
      secondary: '#00ffff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#00ff00',
      accent: '#ffff00',
      gradient: 'linear-gradient(135deg, #ff0080 0%, #00ffff 50%, #ffff00 100%)',
    },
    animations: {
      duration: '0.5s',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  neon: {
    name: 'neon',
    displayName: '霓虹灯',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ff00',
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      accent: '#00ffff',
      gradient: 'linear-gradient(135deg, #ff00ff 0%, #00ff00 50%, #00ffff 100%)',
    },
    animations: {
      duration: '0.4s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  aurora: {
    name: 'aurora',
    displayName: '极光',
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: '#0c0a1a',
      surface: '#1a1625',
      text: '#e2e8f0',
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #f59e0b 100%)',
    },
    animations: {
      duration: '0.6s',
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    },
  },
};

// 主题上下文接口
interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 获取当前主题配置
  const themeConfig = themeConfigs[theme];

  // 设置主题
  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme === theme) return;
    
    setIsTransitioning(true);
    
    // 添加主题切换动画
    document.documentElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // 应用主题到CSS变量
      applyThemeToCSS(themeConfigs[newTheme]);
      
      setTimeout(() => {
        setIsTransitioning(false);
        document.documentElement.style.transition = '';
      }, 100);
    }, 250);
  }, [theme]);

  // 切换主题（循环切换）
  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'cyberpunk', 'neon', 'aurora'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 应用主题到CSS变量
  const applyThemeToCSS = (config: ThemeConfig) => {
    const root = document.documentElement;
    
    // 设置CSS变量
    root.style.setProperty('--theme-primary', config.colors.primary);
    root.style.setProperty('--theme-secondary', config.colors.secondary);
    root.style.setProperty('--theme-background', config.colors.background);
    root.style.setProperty('--theme-surface', config.colors.surface);
    root.style.setProperty('--theme-text', config.colors.text);
    root.style.setProperty('--theme-accent', config.colors.accent);
    root.style.setProperty('--theme-gradient', config.colors.gradient);
    root.style.setProperty('--theme-animation-duration', config.animations.duration);
    root.style.setProperty('--theme-animation-easing', config.animations.easing);
    
    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${config.name}`);
  };

  // 初始化主题
  useEffect(() => {
    // 从本地存储获取主题
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themeConfigs[savedTheme]) {
      setThemeState(savedTheme);
      applyThemeToCSS(themeConfigs[savedTheme]);
    } else {
      // 默认主题
      setThemeState('dark');
      applyThemeToCSS(themeConfigs.dark);
    }
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value: ThemeContextType = {
    theme,
    themeConfig,
    setTheme,
    toggleTheme,
    isTransitioning,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用主题的钩子
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
