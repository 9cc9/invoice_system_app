/**
 * View 组件（React Native 实现）
 * 跨平台的容器组件，React Native 平台使用 View
 */

import { View as RNView, TouchableOpacity } from 'react-native';

export const View = ({ children, style, onClick, ...props }) => {
  // 处理样式兼容性：React Native 不支持某些 Web 样式属性
  const nativeStyle = { ...style };
  
  // 移除 Web 特定的属性
  if (nativeStyle.display) {
    delete nativeStyle.display; // React Native View 默认就是 flex
  }
  
  // 移除 Web 特定的事件处理器和属性
  const { onMouseEnter: _onMouseEnter, onMouseLeave: _onMouseLeave, className: _className, ...restProps } = props;
  
  // 将 minHeight: '100vh' 转换为 flex: 1（全屏）
  if (nativeStyle.minHeight === '100vh' || nativeStyle.minHeight === '100%') {
    nativeStyle.flex = 1;
    delete nativeStyle.minHeight;
  }
  
  // 将 minHeight: '400px' 等转换为数值
  if (typeof nativeStyle.minHeight === 'string' && nativeStyle.minHeight.endsWith('px')) {
    nativeStyle.minHeight = parseInt(nativeStyle.minHeight, 10);
  }

  // React Native 平台：onClick 自动转换为 onPress
  // 如果有点击事件，使用 TouchableOpacity 包装
  if (onClick) {
    return (
      <TouchableOpacity
        style={nativeStyle}
        onPress={onClick}
        activeOpacity={0.7}
        {...restProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <RNView style={nativeStyle} {...restProps}>
      {children}
    </RNView>
  );
};

