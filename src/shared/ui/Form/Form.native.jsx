/**
 * Form 组件（React Native实现）
 * 
 * 注意：React Native 的表单处理方式与 Web 不同，
 * 这里提供一个占位实现，实际使用时需要根据具体的表单库进行调整
 */

import { View } from '../View';
import { Text } from '../Text';

/**
 * Form 组件（Native 占位实现）
 * 实际使用时需要根据项目选择的表单库进行实现
 */
export const Form = ({ children, onFinish, ...props }) => {
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    // Native 平台的表单提交逻辑
    if (onFinish) {
      // 这里需要根据实际表单库的实现来收集表单数据
      onFinish({});
    }
  };

  return (
    <View {...props} onSubmit={handleSubmit}>
      {children}
    </View>
  );
};

/**
 * FormItem 组件（Native 占位实现）
 */
export const FormItem = ({ children, label, rules, ...props }) => {
  return (
    <View {...props}>
      {label && <Text>{label}</Text>}
      {children}
    </View>
  );
};
