/**
 * Redirect 组件适配器
 * 
 * 统一对外 API：
 * - Web: 使用 react-router-dom 的 Navigate
 * - React Native: 可以使用 react-navigation 的导航
 * - 构建工具会自动选择对应平台实现
 */

// 构建工具会自动选择对应平台的文件：
// - Web (Vite): 自动选择 Redirect.web.jsx
// - React Native (Metro): 自动选择 Redirect.native.jsx
import { Redirect } from './Redirect.web';

// 直接导出，构建工具会自动选择对应平台的实现
export { Redirect };
