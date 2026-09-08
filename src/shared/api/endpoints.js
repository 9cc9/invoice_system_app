/**
 * API 端点
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login.json',
    LOGOUT: '/logout.json',
    PROFILE: '/profile.json',
    CHANGE_PASSWORD: '/profile/changePassword.json',
  },
  ENUMS: {
    CATEGORIES: '/enums/categories.json',
    FORM_STATUSES: '/enums/reimbursementFormStatuses.json',
    ADMIN_MARKABLE_STATUSES: '/enums/adminMarkableFormStatuses.json',
  },
  REIMBURSEMENT_FORMS: {
    LIST: '/reimbursementForms/list.json',
    CREATE: '/reimbursementForms.json',
    DETAIL: (id) => `/reimbursementForms/${id}.json`,
    SUBMIT: (id) => `/reimbursementForms/${id}/submit.json`,
    MARK_STATUS: (id) => `/reimbursementForms/${id}/markStatus.json`,
    BATCH_DOWNLOAD: '/reimbursementForms/batchDownload.json',
  },
  FILES: {
    UPLOAD: '/files/upload.json',
  },
};
