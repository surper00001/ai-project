/**
 * 语法高亮工具函数
 * 提供简单的语法高亮功能，支持多种编程语言
 */

/**
 * 语言映射表
 * 将语言标识符映射为显示名称
 */
export const LANGUAGE_MAP: { [key: string]: string } = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'py': 'Python',
  'python': 'Python',
  'java': 'Java',
  'cpp': 'C++',
  'c': 'C',
  'cs': 'C#',
  'php': 'PHP',
  'rb': 'Ruby',
  'go': 'Go',
  'rs': 'Rust',
  'swift': 'Swift',
  'kt': 'Kotlin',
  'scala': 'Scala',
  'sh': 'Shell',
  'bash': 'Bash',
  'sql': 'SQL',
  'json': 'JSON',
  'xml': 'XML',
  'yaml': 'YAML',
  'yml': 'YAML',
  'md': 'Markdown',
  'markdown': 'Markdown',
  'html': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'Sass',
  'less': 'Less',
  'dockerfile': 'Dockerfile',
  'text': 'Text'
};

/**
 * 获取语言显示名称
 * @param lang 语言标识符
 * @returns 显示名称
 */
export function getLanguageName(lang: string): string {
  return LANGUAGE_MAP[lang.toLowerCase()] || lang.toUpperCase();
}

/**
 * JavaScript/TypeScript语法高亮
 * @param code 代码内容
 * @returns 高亮后的HTML字符串
 */
function highlightJavaScript(code: string): string {
  return code
    .replace(/(\b(?:function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b)/g, 
      '<span style="color: #c792ea;">$1</span>')
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
      '<span style="color: #c3e88d;">$1$2$1</span>')
    .replace(/(\/\/.*$)/gm, 
      '<span style="color: #676e95;">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, 
      '<span style="color: #676e95;">$1</span>');
}

/**
 * Python语法高亮
 * @param code 代码内容
 * @returns 高亮后的HTML字符串
 */
function highlightPython(code: string): string {
  return code
    .replace(/(\b(?:def|class|if|else|elif|for|while|import|from|return|try|except|finally|with|as|lambda|yield|async|await)\b)/g, 
      '<span style="color: #c792ea;">$1</span>')
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
      '<span style="color: #c3e88d;">$1$2$1</span>')
    .replace(/(#.*$)/gm, 
      '<span style="color: #676e95;">$1</span>');
}

/**
 * CSS语法高亮
 * @param code 代码内容
 * @returns 高亮后的HTML字符串
 */
function highlightCSS(code: string): string {
  return code
    .replace(/([.#]?[\w-]+)\s*{/g, 
      '<span style="color: #c792ea;">$1</span> {')
    .replace(/([\w-]+)\s*:/g, 
      '<span style="color: #89ddff;">$1</span>:')
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
      '<span style="color: #c3e88d;">$1$2$1</span>');
}

/**
 * HTML语法高亮
 * @param code 代码内容
 * @returns 高亮后的HTML字符串
 */
function highlightHTML(code: string): string {
  return code
    .replace(/(&lt;\/?)([\w-]+)/g, 
      '<span style="color: #c792ea;">$1$2</span>')
    .replace(/(\s[\w-]+=)(["'`])((?:\\.|(?!\2)[^\\])*?)\2/g, 
      '<span style="color: #89ddff;">$1</span><span style="color: #c3e88d;">$2$3$2</span>');
}

/**
 * 语法高亮主函数
 * @param code 代码内容
 * @param lang 语言类型
 * @returns 高亮后的HTML字符串
 */
export function highlightCode(code: string, lang: string): string {
  switch (lang.toLowerCase()) {
    case 'javascript':
    case 'js':
      return highlightJavaScript(code);
    case 'python':
    case 'py':
      return highlightPython(code);
    case 'css':
      return highlightCSS(code);
    case 'html':
      return highlightHTML(code);
    default:
      return code;
  }
}

/**
 * 计算代码行数
 * @param code 代码内容
 * @returns 行数
 */
export function getLineCount(code: string): number {
  return code.split('\n').length;
}

/**
 * 判断是否需要显示展开按钮
 * @param lineCount 行数
 * @param isExpanded 是否已展开
 * @returns 是否需要显示展开按钮
 */
export function shouldShowExpand(lineCount: number, isExpanded: boolean): boolean {
  return lineCount > 10 && !isExpanded;
}

/**
 * 获取显示的代码内容（考虑展开状态）
 * @param code 原始代码
 * @param lineCount 行数
 * @param isExpanded 是否已展开
 * @returns 显示的代码内容
 */
export function getDisplayCode(code: string, lineCount: number, isExpanded: boolean): string {
  const shouldShow = shouldShowExpand(lineCount, isExpanded);
  return shouldShow ? code.split('\n').slice(0, 10).join('\n') + '\n...' : code;
}





