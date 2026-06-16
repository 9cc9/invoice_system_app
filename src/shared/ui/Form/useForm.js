/**
 * useForm Hook 导出
 * 
 * 单独导出 Hook，避免与组件混合导出导致 Fast Refresh 问题
 * 
 * 构建工具会自动选择对应平台的文件：
 * - Web (Vite): 自动选择 useForm.web.js
 * - React Native (Metro): 自动选择 useForm.native.js
 */

// 构建工具会自动选择对应平台的实现
import { useForm } from './useForm.web';

export { useForm };
