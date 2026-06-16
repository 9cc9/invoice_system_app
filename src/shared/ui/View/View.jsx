/**
 * View 组件适配器
 * 
 * 统一对外 API：
 * - Web: 使用 div
 * - React Native: 使用 View
 * - 构建工具会自动选择对应平台实现
 */

// 构建工具会自动选择对应平台的文件：
// - Web (Vite): 自动选择 View.web.jsx
// - React Native (Metro): 自动选择 View.native.jsx
import { View } from './View.web';

// 直接导出，构建工具会自动选择对应平台的实现
export { View };

