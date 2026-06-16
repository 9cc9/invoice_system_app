/**
 * 按钮组件（Web实现）
 * 基于 antd Button 实现
 */

import { Button as AntdButton } from 'antd';

export const Button = ({ children, onClick, style, ...props }) => {
  return (
    <AntdButton 
      onClick={onClick} 
      style={style}
      {...props}
    >
      {children}
    </AntdButton>
  );
};

