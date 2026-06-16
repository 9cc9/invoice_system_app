/**
 * 报销单 API
 */

import { apiClient } from 'shared/api/client';
import { API_ENDPOINTS } from 'shared/api/endpoints';

export const fetchExpenseCategories = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.EXPENSE_CATEGORIES);

export const fetchBusinessCategories = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.BUSINESS_CATEGORIES);

export const fetchFormStatuses = () =>
  apiClient.get(API_ENDPOINTS.ENUMS.FORM_STATUSES);

export const listReimbursementForms = (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiClient.get(`${API_ENDPOINTS.REIMBURSEMENT_FORMS.LIST}${query}`);
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
