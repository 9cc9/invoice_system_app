/**
 * 认证相关 API
 */

import { apiClient } from 'shared/api/client';
import { API_ENDPOINTS } from 'shared/api/endpoints';

/**
 * 登录
 * @param {object} credentials
 * @param {string} credentials.accountNo - 学号或工号
 * @param {string} credentials.password - 密码
 * @param {string} [credentials.name] - 姓名（首次登录建号）
 * @param {string} [credentials.role] - 角色 STUDENT/TEACHER（首次登录建号）
 * @returns {Promise<{user: object, sessionToken: string}>}
 */
export const login = async ({ accountNo, password, name, role }) => {
  const payload = { accountNo, password };
  if (name) {
    payload.name = name;
  }
  if (role) {
    payload.role = role;
  }
  return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
};

/**
 * 登出
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
};

/**
 * 获取当前登录用户信息
 * @returns {Promise<object|null>}
 */
export const getProfile = async () => {
  return apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
};
