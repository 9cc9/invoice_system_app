/**
 * Text 组件（React Native 实现）
 * 跨平台的文本组件，React Native 平台使用 Text
 */

import { Text as RNText } from 'react-native';

export const Text = ({ children, style, ...props }) => {
  return (
    <RNText style={style} {...props}>
      {children}
    </RNText>
  );
};

