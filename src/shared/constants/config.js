/**
 * 应用配置常量
 */

export function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084';
  }
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084';
  }
  return window.location.origin;
}

export const APP_CONFIG = {
  get API_BASE_URL() {
    return getApiBaseUrl();
  },
};
