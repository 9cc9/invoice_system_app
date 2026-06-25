export {
  fetchCategories,
  fetchFormStatuses,
  listReimbursementForms,
  batchDownloadReimbursementForms,
  buildReimbursementDownloadFilename,
  getReimbursementForm,
  createReimbursementForm,
  updateReimbursementForm,
  submitReimbursementForm,
  deleteReimbursementForm,
} from './api/reimbursementApi';

const PAYMENT_RECORD_THRESHOLD = 200;

export const requiresPaymentRecord = (amount, officialTransferInvoice = false) => {
  if (officialTransferInvoice) {
    return false;
  }
  const num = Number(amount);
  return Number.isFinite(num) && num >= PAYMENT_RECORD_THRESHOLD;
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
