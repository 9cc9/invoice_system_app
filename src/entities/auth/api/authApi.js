/**
 * 认证相关 API
 */

import { apiClient } from 'shared/api/client';
import { API_ENDPOINTS } from 'shared/api/endpoints';

/**
 * 登录
 * @param {string} accountNo - 学号或工号
 * @param {string} password - 密码
 * @returns {Promise<{user: object, sessionToken: string}>}
 */
export const login = async (accountNo, password) => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
    accountNo,
    password,
  });
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
