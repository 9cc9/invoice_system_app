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

export const createEmptyInvoiceItem = () => ({
  invoiceName: '',
  invoiceFileUrl: '',
  invoiceAmount: undefined,
  actualPaidAmount: undefined,
  paymentRecordUrl: '',
  explanationFileUrl: '',
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
    paymentRecordUrl: item.paymentRecordUrl || null,
    explanationFileUrl: item.explanationFileUrl || null,
  })),
});
