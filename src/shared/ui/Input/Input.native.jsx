/**
 * Input 组件（React Native）
 * 基于 React Native TextInput 实现
 */

import { TextInput} from 'react-native';

/**
 * Input 组件（Native 实现）
 */
export const Input = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry,
  style,
  ...props 
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={style}
      {...props}
    />
  );
};

/**
 * Input.Password 组件（Native 实现）
 */
Input.Password = ({ placeholder, value, onChangeText, style, ...props }) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={true}
      style={style}
      {...props}
    />
  );
};
