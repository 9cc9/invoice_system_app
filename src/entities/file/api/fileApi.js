/**
 * 文件上传 API
 */

import { apiClient } from 'shared/api/client';
import { API_ENDPOINTS } from 'shared/api/endpoints';

/**
 * @param {File} file
 * @param {{ formId?: string, itemId?: string, fileType?: string }} options
 */
export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.formId) {
    formData.append('formId', options.formId);
  }
  if (options.itemId) {
    formData.append('itemId', options.itemId);
  }
  if (options.fileType) {
    formData.append('fileType', options.fileType);
  }
  return apiClient.upload(API_ENDPOINTS.FILES.UPLOAD, formData);
};

/**
 * 文件地址已是 OSS 直链，直接返回即可。
 * @param {string} fileUrl
 */
export const getFileDownloadUrl = (fileUrl) => fileUrl || '';
