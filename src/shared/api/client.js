/**
 * API客户端
 */

import { getApiBaseUrl } from '../constants/config.js';

class ApiClient {
  async request(url, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const baseURL = getApiBaseUrl();
      const response = await fetch(`${baseURL}${url}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        err.httpStatus = response.status;
        err.url = url;
        err.backend = errorData;
        err.resultCode = errorData.resultCode ?? errorData.result_code;
        throw err;
      }

      const data = await response.json();

      if (data && data.success == false) {
        const err = new Error(data.message || 'Request failed');
        err.httpStatus = response.status;
        err.url = url;
        err.backend = data;
        err.resultCode = data.resultCode ?? data.result_code;
        throw err;
      }

      return data.data !== undefined ? data.data : data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body });
  }

  async put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export default apiClient;
