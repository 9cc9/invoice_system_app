export const STATUS_COLOR = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  DOWNLOADED: 'success',
  RETURNED: 'warning',
  ARCHIVED: 'warning',
  INVALID: 'error',
  TRANS_FIN: 'processing',
  SUCCESS: 'success',
};

export const DOWNLOADABLE_STATUSES = new Set(['SUBMITTED', 'DOWNLOADED', 'ARCHIVED']);

/** 终态：不允许再流转 */
export const TERMINAL_STATUSES = new Set(['INVALID', 'SUCCESS']);

export const RETURNED_STATUS = 'RETURNED';

/** 标记为该状态时必须填写审核备注 */
export const REQUIRES_REVIEW_REMARK_STATUSES = new Set([RETURNED_STATUS]);

/** 学生可编辑（草稿、已退回） */
export const isEditableByStudent = (status) => status === 'DRAFT' || status === RETURNED_STATUS;

/** 当前状态是否允许管理员标记为流转状态（与后端 isStatusMarkable 一致） */
export const isStatusMarkable = (status) => (
  Boolean(status) && status !== 'DRAFT' && status !== RETURNED_STATUS && !TERMINAL_STATUSES.has(status)
);
