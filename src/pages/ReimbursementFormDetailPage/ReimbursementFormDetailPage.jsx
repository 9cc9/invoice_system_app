/**
 * 报销单详情页（只读）
 */

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Descriptions, Tag } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { Button } from 'shared/ui/Button';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { message } from 'shared/ui/Message';
import { getFileDownloadUrl } from 'entities/file';
import {
  batchDownloadReimbursementForms,
  buildReimbursementDownloadFilename,
  getReimbursementForm,
} from 'entities/reimbursement';
import { ROUTES } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { styles } from './ReimbursementFormDetailPage.styles';

const STATUS_COLOR = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  DOWNLOADED: 'success',
  ARCHIVED: 'warning',
};

const DOWNLOADABLE_STATUSES = new Set(['SUBMITTED', 'DOWNLOADED', 'ARCHIVED']);

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatAmount = (value) => {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `¥${num.toFixed(2)}`;
};

const getFileName = (url) => {
  if (!url) return '';
  try {
    return decodeURIComponent(url.split('/').pop() || url);
  } catch {
    return url.split('/').pop() || url;
  }
};

const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const DetailField = ({ label, children }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
  </View>
);

const FileLinks = ({ urls, emptyLabel = '-' }) => {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : (urls ? [urls] : []);
  if (!list.length) {
    return <Text style={styles.fieldValue}>{emptyLabel}</Text>;
  }
  return (
    <View style={styles.fileLinks}>
      {list.map((url) => (
        <a
          key={url}
          href={getFileDownloadUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.fileLink}
        >
          {getFileName(url)}
        </a>
      ))}
    </View>
  );
};

export const ReimbursementFormDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common', 'reimbursement']);
  const isAdminView = location.pathname.startsWith('/admin/');
  const backRoute = isAdminView ? ROUTES.ADMIN_HOME : ROUTES.STUDENT_HOME;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadForm = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReimbursementForm(id);
      setForm(data);
    } catch (error) {
      message.error(error.message || t('reimbursement:message.loadFormFailed'));
      navigate(backRoute, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [backRoute, id, navigate, t]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleDownload = async () => {
    if (!form || !DOWNLOADABLE_STATUSES.has(form.status)) return;
    setDownloading(true);
    try {
      const suggestedFilename = buildReimbursementDownloadFilename([form]);
      const { blob, filename } = await batchDownloadReimbursementForms([form.id], suggestedFilename);
      triggerBlobDownload(blob, filename);
      message.success(t('reimbursement:teacher.message.downloadSuccess'));
      await loadForm();
    } catch (error) {
      message.error(error.message || t('reimbursement:teacher.message.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.loadingText}>{t('common:label.loading')}</Text>
      </View>
    );
  }

  if (!form) {
    return null;
  }

  const formatBool = (value) => (
    value ? t('reimbursement:detail.yes') : t('reimbursement:detail.no')
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('reimbursement:title.formDetail')}</Text>
          <View style={styles.summaryRow}>
            <Tag color={STATUS_COLOR[form.status] || 'default'}>
              {form.statusLabel || form.status}
            </Tag>
            <Text style={styles.fieldValue}>
              {t('reimbursement:list.totalAmount', { amount: form.totalInvoiceAmount ?? 0 })}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {!isAdminView && form.status === 'DRAFT' && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(ROUTES.STUDENT_FORM_EDIT(form.id))}
            >
              {t('reimbursement:button.editDraft')}
            </Button>
          )}
          {isAdminView && DOWNLOADABLE_STATUSES.has(form.status) && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownload}
            >
              {t('reimbursement:teacher.button.download')}
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backRoute)}>
            {t('reimbursement:button.backToList')}
          </Button>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{t('reimbursement:section.basicInfo')}</Text>
        <Descriptions column={{ xs: 1, sm: 2 }} size="middle" style={{ marginBottom: '24px' }}>
          {isAdminView && (
            <>
              <Descriptions.Item label={t('reimbursement:form.studentAccountNo')}>
                {form.studentAccountNo || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('reimbursement:detail.studentName')}>
                {form.studentName || '-'}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label={t('reimbursement:form.businessCategory')}>
            {form.businessCategoryLabel || form.businessCategory || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('reimbursement:form.expenseCategory')}>
            {form.expenseCategoryLabel || form.expenseCategory || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('reimbursement:detail.totalActualPaidAmount')}>
            {formatAmount(form.totalActualPaidAmount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('reimbursement:detail.submittedAt')}>
            {formatDateTime(form.submittedAt)}
          </Descriptions.Item>
          <Descriptions.Item label={t('reimbursement:detail.createdAt')}>
            {formatDateTime(form.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label={t('reimbursement:form.remark')} span={2}>
            {form.remark || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Text style={styles.sectionTitle}>
          {t('reimbursement:section.invoiceItems')}
          {' '}
          ({t('reimbursement:list.itemCount', { count: form.items?.length || 0 })})
        </Text>

        {(form.items || []).map((item, index) => (
          <View key={item.id || index} style={styles.itemCard}>
            <Text style={styles.itemTitle}>
              {t('reimbursement:item.title', { index: index + 1 })}
              {item.invoiceName ? ` · ${item.invoiceName}` : ''}
            </Text>

            <DetailField label={t('reimbursement:item.invoiceAmount')}>
              <Text style={styles.fieldValue}>{formatAmount(item.invoiceAmount)}</Text>
            </DetailField>

            <DetailField label={t('reimbursement:item.invoiceFile')}>
              <FileLinks urls={item.invoiceFileUrl} />
            </DetailField>

            <DetailField label={t('reimbursement:item.officialTransferInvoice')}>
              <Text style={styles.fieldValue}>{formatBool(item.officialTransferInvoice)}</Text>
            </DetailField>

            {item.actualPaidAmount != null && (
              <DetailField label={t('reimbursement:item.actualPaidAmount')}>
                <Text style={styles.fieldValue}>{formatAmount(item.actualPaidAmount)}</Text>
              </DetailField>
            )}

            {item.amountMismatchReason && (
              <DetailField label={t('reimbursement:item.amountMismatchReason')}>
                <Text style={styles.fieldValue}>{item.amountMismatchReason}</Text>
              </DetailField>
            )}

            {(item.paymentRecordUrls?.length > 0) && (
              <DetailField label={t('reimbursement:item.paymentRecord')}>
                <FileLinks urls={item.paymentRecordUrls} />
              </DetailField>
            )}

            <DetailField label={t('reimbursement:item.hasVagueItemName')}>
              <Text style={styles.fieldValue}>{formatBool(item.hasVagueItemName)}</Text>
            </DetailField>

            {item.hasVagueItemName && (
              <DetailField label={t('reimbursement:item.purchaseListFile')}>
                <FileLinks urls={item.purchaseListFileUrl} />
              </DetailField>
            )}

            {item.explanationFileUrl && (
              <DetailField label={t('reimbursement:item.explanationFile')}>
                <FileLinks urls={item.explanationFileUrl} />
              </DetailField>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
