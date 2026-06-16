/**
 * ReimbursementFormPage 样式
 */

export const styles = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#f8fafc',
    padding: '24px clamp(16px, 4vw, 32px)',
    boxSizing: 'border-box',
  },
  header: {
    maxWidth: '960px',
    margin: '0 auto 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: 'clamp(20px, 4vw, 32px)',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '16px',
    display: 'block',
  },
  itemCard: {
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#fafafa',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  itemTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  itemIndexLabel: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    flexShrink: 0,
  },
  invoiceNameFormItem: {
    flex: 1,
    marginBottom: 0,
    minWidth: 0,
  },
  invoiceNameInput: {
    fontSize: '15px',
    fontWeight: 500,
    padding: 0,
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
  },
  addButtonWrap: {
    marginBottom: '24px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  readonlyField: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '16px',
  },
  rulesHint: {
    display: 'block',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.6,
    marginBottom: '16px',
    whiteSpace: 'pre-line',
  },
  explanationLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  templateLink: {
    padding: 0,
    height: 'auto',
  },
  draftSavedModalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 0 4px',
    textAlign: 'center',
  },
  draftSavedModalIcon: {
    fontSize: '48px',
    color: '#52c41a',
  },
};
