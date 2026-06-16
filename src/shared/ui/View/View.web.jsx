/**
 * View 组件（Web实现）
 * 跨平台的容器组件，Web 平台基于 antd Space/Flex 或原生 div
 * 
 * 统一使用 onClick 接口，在 shared/ui 层自动适配平台差异
 * 
 * 支持以下 props：
 * - gap: 子元素间距，如果提供则使用 Space 组件
 * - direction: 'horizontal' | 'vertical'，如果提供则使用 Space 组件
 * - flex: 是否使用 Flex 布局
 */

import { Space, Flex } from 'antd';

export const View = ({ children, style, onClick, gap, direction, flex, ...props }) => {
  // 如果指定了 flex，使用 Flex 组件
  if (flex) {
    return (
      <Flex style={style} onClick={onClick} {...props}>
        {children}
      </Flex>
    );
  }

  // 如果指定了 gap 或 direction，使用 Space 组件
  if (gap !== undefined || direction) {
    return (
      <Space 
        style={style} 
        onClick={onClick}
        size={gap}
        direction={direction}
        {...props}
      >
        {children}
      </Space>
    );
  }

  // 默认使用 div
  return (
    <div style={style} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

