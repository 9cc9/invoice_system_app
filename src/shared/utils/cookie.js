/**
 * Cookie 工具函数
 */

/**
 * Cookie 名称常量
 */
export const COOKIE_NAMES = {
  SESSION_TOKEN: 'SESSION_TOKEN', // 会话令牌
};

/**
 * 获取 Cookie 值
 * @param {string} name - Cookie 名称
 * @returns {string|null} Cookie 值，如果不存在则返回 null
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') {
    // React Native 环境
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  
  return null;
};

/**
 * 检查 Cookie 是否存在
 * @param {string} name - Cookie 名称
 * @returns {boolean} 是否存在
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

/**
 * 删除 Cookie
 * @param {string} name - Cookie 名称
 * @param {object} options - 可选配置
 * @param {string} options.path - Cookie 路径，默认为 '/'
 * @param {string} options.domain - Cookie 域名
 * @param {boolean} options.secure - 是否只在 HTTPS 下发送
 * @param {string} options.sameSite - SameSite 属性
 */
export const deleteCookie = (name, options = {}) => {
  if (typeof document === 'undefined') {
    // React Native 环境
    return;
  }

  const {
    path = '/',
    domain,
    secure,
    sameSite = 'Lax',
  } = options;

  // 通过设置过期时间为过去的时间来删除 Cookie
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  if (secure) {
    cookieString += '; secure';
  }
  
  if (sameSite) {
    cookieString += `; sameSite=${sameSite}`;
  }

  document.cookie = cookieString;
};
