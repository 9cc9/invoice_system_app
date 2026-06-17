/**
 * 报销单 API
 */

import { apiClient } from 'shared/api/client';
import { API_ENDPOINTS } from 'shared/api/endpoints';
import { getApiBaseUrl } from 'shared/constants/config';
import { POST_LOGIN_REDIRECT_KEY } from 'shared/constants/routes';

export const fetchExpenseCategories = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.EXPENSE_CATEGORIES);

export const fetchBusinessCategories = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.BUSINESS_CATEGORIES);

export const fetchFormStatuses = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.FORM_STATUSES);

export const listReimbursementForms = (params) => {
  const normalized = typeof params === 'string' ? { status: params } : (params || {});
  const searchParams = new URLSearchParams();
  Object.entries(normalized).forEach(([key, value]) => {
    if (value != null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return apiClient.get(`${API_ENDPOINTS.REIMBURSEMENT_FORMS.LIST}${query ? `?${query}` : ''}`);
};

export const buildReimbursementDownloadFilename = (forms) => {
  if (!forms?.length) {
    return `reimbursement_export_${Date.now()}.zip`;
  }

  const sanitize = (value) => {
    if (!value) return '未命名';
    return String(value).replace(/[\\/:*?"<>|]/g, '_');
  };

  const form = forms[0];
  let filename = [
    sanitize(form.businessCategoryLabel || form.businessCategory),
    sanitize(form.studentName),
    sanitize(form.studentAccountNo),
    sanitize(form.expenseCategoryLabel || form.expenseCategory),
  ].join('-');

  if (forms.length > 1) {
    filename += `_等${forms.length}条`;
  }

  return `${filename}.zip`;
};

const parseDownloadFilename = (response) => {
  const customFilename = response.headers.get('x-download-filename');
  if (customFilename) {
    try {
      return decodeURIComponent(customFilename);
    } catch {
      return customFilename;
    }
  }

  const disposition = response.headers.get('content-disposition') || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || null;
};

export const batchDownloadReimbursementForms = async (formIds, suggestedFilename) => {
  const baseURL = getApiBaseUrl();
  const response = await fetch(`${baseURL}${API_ENDPOINTS.REIMBURSEMENT_FORMS.BATCH_DOWNLOAD}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ formIds }),
  });

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const { useAuthStore } = await import('entities/auth');
    useAuthStore.getState().clearAuth();
    if (!window.location.pathname.includes('/login')) {
      try {
        sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, window.location.pathname);
      } catch {
        // ignore
      }
      window.location.href = '/login';
    }
    throw new Error(errorData.message || '未登录或会话已过期');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || contentType.includes('application/json')) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();
  const filename = parseDownloadFilename(response) || suggestedFilename || `reimbursement_export_${Date.now()}.zip`;
  return { blob, filename };
};

export const getReimbursementForm = (id) =>
  apiClient.get(API_ENDPOINTS.REIMBURSEMENT_FORMS.DETAIL(id));

export const createReimbursementForm = (payload) =>
  apiClient.post(API_ENDPOINTS.REIMBURSEMENT_FORMS.CREATE, payload);

export const updateReimbursementForm = (id, payload) =>
  apiClient.put(API_ENDPOINTS.REIMBURSEMENT_FORMS.DETAIL(id), payload);

export const submitReimbursementForm = (id) =>
  apiClient.post(API_ENDPOINTS.REIMBURSEMENT_FORMS.SUBMIT(id));

export const deleteReimbursementForm = (id) =>
  apiClient.delete(API_ENDPOINTS.REIMBURSEMENT_FORMS.DETAIL(id));
