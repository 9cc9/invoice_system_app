export const styles = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#f8fafc',
    padding: '24px clamp(16px, 4vw, 32px)',
    boxSizing: 'border-box',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '8px',
  },
  subtitle: {
    display: 'block',
    fontSize: '14px',
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  contentCard: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1,
  },
  filterInput: {
    width: '160px',
  },
  filterSelect: {
    width: '140px',
  },
  tableWrap: {
    overflowX: 'auto',
  },
};
