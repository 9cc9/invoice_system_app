/**
 * Message 组件（React Native实现）
 * 
 * 注意：React Native 的消息提示方式与 Web 不同，
 * 这里提供一个占位实现，实际使用时需要根据具体的 toast 库进行调整
 */

/**
 * Message 组件（Native 占位实现）
 * 实际使用时需要根据项目选择的 toast 库进行实现
 * 例如：react-native-toast-message, react-native-root-toast 等
 */
export const message = {
  success: (content) => {
    console.log('Success:', content);
    // 实际使用时调用 toast 库
    // Toast.show({ type: 'success', text1: content });
  },
  error: (content) => {
    console.error('Error:', content);
    // 实际使用时调用 toast 库
    // Toast.show({ type: 'error', text1: content });
  },
  info: (content) => {
    console.info('Info:', content);
    // 实际使用时调用 toast 库
    // Toast.show({ type: 'info', text1: content });
  },
  warning: (content) => {
    console.warn('Warning:', content);
    // 实际使用时调用 toast 库
    // Toast.show({ type: 'warning', text1: content });
  },
};
