/**
 * 按钮组件适配器（React Native 平台入口）
 * 
 * 构建工具会自动选择此文件（React Native 环境）
 */

import { Button as NativeButton } from './Button.native.jsx';

/**
 * 统一的 Button 组件（React Native 平台）
 * 统一处理 onClick/onPress，对外提供统一接口
 */
export const Button = ({ onClick, ...props }) => {
  return <NativeButton onClick={onClick} {...props} />;
};

