/**
 * Message 组件适配器
 * 
 * 统一对外 API：
 * - Web: 使用 antd message
 * - React Native: 可以使用 toast 库
 * - 构建工具会自动选择对应平台实现
 */

// 构建工具会自动选择对应平台的文件：
// - Web (Vite): 自动选择 Message.web.jsx
// - React Native (Metro): 自动选择 Message.native.jsx
import { message } from './Message.web';

// 直接导出，构建工具会自动选择对应平台的实现
export { message };
