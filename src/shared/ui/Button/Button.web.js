/**
 * 按钮组件适配器（Web 平台入口）
 * 
 * 构建工具会自动选择此文件（Web 环境）
 */

import { Button as WebButton } from './Button.web.jsx';

/**
 * 统一的 Button 组件（Web 平台）
 * 统一使用 onClick 接口，直接传递给 Web 实现
 */
export const Button = ({ onClick, ...props }) => {
  return <WebButton onClick={onClick} {...props} />;
};

