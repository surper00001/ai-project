import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 工具函数库
 * 
 * 这个文件包含了应用程序中常用的工具函数
 * 主要用于处理CSS类名的合并和条件应用
 */

/**
 * 合并CSS类名
 * 
 * 这个函数结合了clsx和tailwind-merge的功能：
 * - clsx: 处理条件类名和类名数组
 * - tailwind-merge: 智能合并Tailwind CSS类名，避免冲突
 * 
 * 使用示例：
 * cn('px-2 py-1', 'px-4') // 结果: 'py-1 px-4' (px-2被px-4覆盖)
 * cn('text-red-500', isActive && 'text-blue-500') // 条件类名
 * 
 * @param inputs - 要合并的类名，可以是字符串、对象、数组等
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

