export {
  fetchExpenseCategories,
  fetchBusinessCategories,
  fetchFormStatuses,
  listReimbursementForms,
  getReimbursementForm,
  createReimbursementForm,
  updateReimbursementForm,
  submitReimbursementForm,
  deleteReimbursementForm,
} from './api/reimbursementApi';

const PAYMENT_RECORD_THRESHOLD = 200;

const requiresPaymentRecord = (amount) => {
  const num = Number(amount);
  return Number.isFinite(num) && num >= PAYMENT_RECORD_THRESHOLD;
};

export const createEmptyInvoiceItem = () => ({
  invoiceName: '',
  invoiceFileUrl: '',
  invoiceAmount: undefined,
  actualPaidAmount: undefined,
  paymentRecordUrls: [],
  explanationFileUrl: '',
  issuerPayeeInconsistent: false,
});

export const buildFormPayload = (values) => ({
  expenseCategory: values.expenseCategory,
  businessCategory: values.businessCategory,
  remark: values.remark || '',
  items: (values.items || []).map((item) => ({
    invoiceName: item.invoiceName,
    invoiceFileUrl: item.invoiceFileUrl,
    invoiceAmount: item.invoiceAmount,
    actualPaidAmount: item.actualPaidAmount,
    paymentRecordUrls: requiresPaymentRecord(item.invoiceAmount)
      ? (item.paymentRecordUrls || []).filter(Boolean)
      : [],
    explanationFileUrl: requiresPaymentRecord(item.invoiceAmount) && item.issuerPayeeInconsistent
      ? (item.explanationFileUrl || null)
      : null,
  })),
});
