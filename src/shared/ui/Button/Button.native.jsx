/**
 * 按钮组件（React Native 实现）
 */

import { TouchableOpacity, Text } from 'react-native';

export const Button = ({ children, onClick, style, ...props }) => {
  const baseStyle = {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      style={[baseStyle, style]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={{ fontSize: 14, fontWeight: '500' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

