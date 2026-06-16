/**
 * Form 组件适配器
 * 
 * 统一对外 API：
 * - Web: 使用 antd Form
 * - React Native: 可以使用 react-hook-form 或其他表单库
 * - 构建工具会自动选择对应平台实现
 */

// 构建工具会自动选择对应平台的文件：
// - Web (Vite): 自动选择 Form.web.jsx
// - React Native (Metro): 自动选择 Form.native.jsx
import { Form, FormItem } from './Form.web';

// 只导出组件，符合 Fast Refresh 的要求
// Hook 请从 './useForm' 导入
export { Form, FormItem };
