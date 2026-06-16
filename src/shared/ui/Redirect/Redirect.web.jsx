/**
 * Redirect 组件（Web实现）
 * 基于 react-router-dom 的 Navigate 组件封装
 */

import { Navigate } from 'react-router-dom';

/**
 * Redirect 组件
 * @param {string} to - 重定向的目标路径
 * @param {object} state - 传递给目标路由的状态
 * @param {boolean} replace - 是否替换历史记录而不是推送
 */
export const Redirect = ({ to, state, replace = false, ...props }) => {
  return (
    <Navigate
      to={to}
      state={state}
      replace={replace}
      {...props}
    />
  );
};
