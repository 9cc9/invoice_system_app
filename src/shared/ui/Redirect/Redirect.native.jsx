/**
 * Redirect 组件（React Native实现）
 * 基于 react-navigation 的导航
 * 
 * 注意：React Native 的路由导航方式与 Web 不同，
 * 这里提供一个占位实现，实际使用时需要根据具体的导航库进行调整
 */

import { useEffect } from 'react';

/**
 * Redirect 组件
 * @param {string} to - 重定向的目标路径
 * @param {object} state - 传递给目标路由的状态
 * @param {boolean} replace - 是否替换历史记录而不是推送
 * @param {object} navigation - React Navigation 的 navigation 对象（需要从外部传入）
 */
export const Redirect = ({ to, state, replace = false, navigation, ...props }) => {
  useEffect(() => {
    if (navigation) {
      if (replace) {
        navigation.replace(to, state);
      } else {
        navigation.navigate(to, state);
      }
    }
  }, [navigation, to, state, replace]);

  // React Native 中不需要返回 JSX，导航操作在 useEffect 中完成
  return null;
};
