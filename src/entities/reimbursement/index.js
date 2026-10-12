export {
  fetchCategories,
  fetchFormStatuses,
  fetchAdminMarkableStatuses,
  listReimbursementForms,
  batchDownloadReimbursementForms,
  buildReimbursementDownloadFilename,
  getReimbursementForm,
  createReimbursementForm,
  updateReimbursementForm,
  submitReimbursementForm,
  deleteReimbursementForm,
  markReimbursementFormStatus,
} from './api/reimbursementApi';

export {
  STATUS_COLOR,
  DOWNLOADABLE_STATUSES,
  TERMINAL_STATUSES,
  isStatusMarkable,
  isEditableByStudent,
  RETURNED_STATUS,
  REQUIRES_REVIEW_REMARK_STATUSES,
} from './status';

export { MarkStatusModal } from './ui/MarkStatusModal';

const PAYMENT_RECORD_THRESHOLD = 200;

export const requiresPaymentRecord = (amount, officialTransferInvoice = false) => {
  if (officialTransferInvoice) {
    return false;
  }
  const num = Number(amount);
  return Number.isFinite(num) && num >= PAYMENT_RECORD_THRESHOLD;
};

export const REMARK_TEMPLATE_EXPENSE_CATEGORIES = ['MATERIAL', 'TRAVEL'];
export const IOT_CONTEST_BUSINESS_CATEGORY = 'IOT_CONTEST';
export const DACHUANG_PROJECT_BUSINESS_CATEGORY = 'DACHUANG_PROJECT';
export const FRESHMAN_PROJECT_BUSINESS_CATEGORY = 'FRESHMAN_PROJECT';

const OPTIONAL_MATERIAL_REMARK_BUSINESS_CATEGORIES = new Set([
  DACHUANG_PROJECT_BUSINESS_CATEGORY,
  FRESHMAN_PROJECT_BUSINESS_CATEGORY,
]);

const usesOptionalMaterialRemarkTemplate = (businessCategory) => (
  OPTIONAL_MATERIAL_REMARK_BUSINESS_CATEGORIES.has(businessCategory)
);

export const buildRemarkTemplate = (expenseCategory, t, user = {}, businessCategory) => {
  const studentInfo = {
    studentName: user.name || '',
    studentAccountNo: user.accountNo || '',
  };
  if (expenseCategory === 'MATERIAL') {
    if (usesOptionalMaterialRemarkTemplate(businessCategory)) {
      return '';
    }
    return t('reimbursement:form.remarkTemplateMaterial', studentInfo);
  }
  if (expenseCategory === 'TRAVEL') {
    if (businessCategory === IOT_CONTEST_BUSINESS_CATEGORY) {
      return t('reimbursement:form.remarkTemplateTravelIot', studentInfo);
    }
    return t('reimbursement:form.remarkTemplateTravel', studentInfo);
  }
  return '';
};

export const getRemarkGuideKey = (expenseCategory, businessCategory) => {
  if (expenseCategory === 'MATERIAL') {
    if (usesOptionalMaterialRemarkTemplate(businessCategory)) {
      return null;
    }
    return 'remarkGuideMaterial';
  }
  if (expenseCategory === 'TRAVEL') {
    return businessCategory === IOT_CONTEST_BUSINESS_CATEGORY
      ? 'remarkGuideTravelIot'
      : 'remarkGuideTravel';
  }
  return null;
};

/** 是否展示竞赛类备注填写框架与「填入备注模板」 */
export const shouldShowRemarkFramework = (expenseCategory, businessCategory) => {
  if (!expenseCategory) {
    return false;
  }
  if (expenseCategory === 'MATERIAL' && usesOptionalMaterialRemarkTemplate(businessCategory)) {
    return false;
  }
  return expenseCategory === 'MATERIAL' || expenseCategory === 'TRAVEL';
};

export const isOptionalMaterialRemarkBusiness = (expenseCategory, businessCategory) => (
  expenseCategory === 'MATERIAL' && usesOptionalMaterialRemarkTemplate(businessCategory)
);

export const isRemarkTemplate = (remark, t, user = {}) => {
  const normalizedRemark = (remark || '').trim();
  if (!normalizedRemark) {
    return true;
  }
  const templates = REMARK_TEMPLATE_EXPENSE_CATEGORIES.flatMap((category) => (
    category === 'TRAVEL'
      ? [
        buildRemarkTemplate(category, t, user),
        buildRemarkTemplate(category, t, user, IOT_CONTEST_BUSINESS_CATEGORY),
      ]
      : [
        buildRemarkTemplate(category, t, user),
        ...[...OPTIONAL_MATERIAL_REMARK_BUSINESS_CATEGORIES].map((code) => (
          buildRemarkTemplate(category, t, user, code)
        )),
      ]
  ));
  return templates.some((template) => template.trim() === normalizedRemark);
};

export const createEmptyInvoiceItem = () => ({
  invoiceName: '',
  invoiceFileUrl: '',
  invoiceAmount: undefined,
  actualPaidAmount: undefined,
  amountMismatchReason: '',
  paymentRecordUrls: [],
  officialTransferInvoice: false,
  hasVagueItemName: false,
  purchaseListFileUrl: '',
  explanationFileUrl: '',
  issuerPayeeInconsistent: false,
});

const amountsEqual = (invoiceAmount, paidAmount) => {
  const invoice = Number(invoiceAmount);
  const paid = Number(paidAmount);
  if (!Number.isFinite(invoice) || !Number.isFinite(paid)) {
    return true;
  }
  return Math.abs(invoice - paid) < 0.005;
};

export const buildFormPayload = (values) => ({
  expenseCategory: values.expenseCategory,
  businessCategory: values.businessCategory,
  remark: values.remark || '',
  items: (values.items || []).map((item) => {
    const needsPaymentRecord = requiresPaymentRecord(
      item.invoiceAmount,
      item.officialTransferInvoice,
    );
    return {
      invoiceName: item.invoiceName,
      invoiceFileUrl: item.invoiceFileUrl,
      invoiceAmount: item.invoiceAmount,
      officialTransferInvoice: Boolean(item.officialTransferInvoice),
      actualPaidAmount: needsPaymentRecord ? item.actualPaidAmount : null,
      amountMismatchReason: needsPaymentRecord && !amountsEqual(item.invoiceAmount, item.actualPaidAmount)
        ? (item.amountMismatchReason || '').trim() || null
        : null,
      paymentRecordUrls: needsPaymentRecord
        ? (item.paymentRecordUrls || []).filter(Boolean)
        : [],
      explanationFileUrl: needsPaymentRecord && item.issuerPayeeInconsistent
        ? (item.explanationFileUrl || null)
        : null,
      hasVagueItemName: Boolean(item.hasVagueItemName),
      purchaseListFileUrl: item.hasVagueItemName
        ? (item.purchaseListFileUrl || null)
        : null,
    };
  }),
});
