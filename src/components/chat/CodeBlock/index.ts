/**
 * CodeBlock组件导出文件
 * 统一导出所有相关组件和工具函数
 */

// 主组件
export { CodeBlock } from './CodeBlock';

// 子组件
export { CodeBlockHeader } from './components/CodeBlockHeader';
export { CodeBlockContent } from './components/CodeBlockContent';
export { CodeBlockExpandButton } from './components/CodeBlockExpandButton';
export { CodeBlockOverlay } from './components/CodeBlockOverlay';

// 自定义Hooks
export { useCodeBlock } from './hooks/useCodeBlock';

// 工具函数
export {
  LANGUAGE_MAP,
  getLanguageName,
  highlightCode,
  getLineCount,
  shouldShowExpand,
  getDisplayCode
} from './utils/syntaxHighlighter';










