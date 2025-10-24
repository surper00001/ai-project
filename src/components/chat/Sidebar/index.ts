/**
 * Sidebar组件导出文件
 * 统一导出所有相关组件和Hooks
 */

// 主组件
export { Sidebar } from './Sidebar';

// 子组件
export { SidebarHeader } from './components/SidebarHeader';
export { SidebarSearch } from './components/SidebarSearch';
export { SidebarFilters } from './components/SidebarFilters';
export { SidebarFooter } from './components/SidebarFooter';

// 自定义Hooks
export { useSidebarState } from './hooks/useSidebarState';
export { useSidebarAnimations } from './hooks/useSidebarAnimations';
export { useSidebarStatistics } from './hooks/useSidebarStatistics';

// 类型定义
export type { Message, ChatSession } from './hooks/useSidebarState';







