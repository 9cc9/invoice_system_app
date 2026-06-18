/**
 * 老师首页：按业务类目分 tab 查看学生报销单，支持 ZIP 打包下载
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Table, Tag, Input, Select, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'shared/ui/Button';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { message } from 'shared/ui/Message';
import { useAuthStore } from 'entities/auth';
import {
  fetchCategories,
  fetchFormStatuses,
  listReimbursementForms,
  batchDownloadReimbursementForms,
  buildReimbursementDownloadFilename,
} from 'entities/reimbursement';
import { ROUTES } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { styles } from './TeacherHomePage.styles';

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

const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const TeacherHomePage = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation(['common', 'auth', 'reimbursement']);
  const navigate = useNavigate();

  const [businessCategories, setBusinessCategories] = useState([]);
  const [formStatuses, setFormStatuses] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({
    studentAccountNo: '',
    studentName: '',
    status: '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoryData, statuses] = await Promise.all([
          fetchCategories(),
          fetchFormStatuses(),
        ]);
        const categories = categoryData?.businessCategories || [];
        setBusinessCategories(categories);
        setFormStatuses((statuses || []).filter((item) => item.code !== 'DRAFT'));
        if (categories?.length) {
          setActiveTab(categories[0].code);
        }
      } catch (error) {
        message.error(error.message || t('reimbursement:message.loadOptionsFailed'));
      }
    };
    loadOptions();
  }, [t]);

  const loadForms = useCallback(async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      const data = await listReimbursementForms({
        businessCategory: activeTab,
        studentAccountNo: filters.studentAccountNo.trim() || undefined,
        studentName: filters.studentName.trim() || undefined,
        status: filters.status || undefined,
      });
      setForms(data || []);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error(error.message || t('reimbursement:message.loadListFailed'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, t]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleLogout = async () => {
    await logout();
    message.success(t('common:message.logoutSuccess'));
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleDownload = async (formIds, formsMeta) => {
    if (!formIds.length) {
      message.warning(t('reimbursement:teacher.message.selectFormsFirst'));
      return;
    }

    const suggestedFilename = formsMeta?.length
      ? buildReimbursementDownloadFilename(formsMeta)
      : buildReimbursementDownloadFilename(
          forms.filter((form) => formIds.includes(form.id)),
        );

    setDownloading(true);
    try {
      const { blob, filename } = await batchDownloadReimbursementForms(formIds, suggestedFilename);
      triggerBlobDownload(blob, filename);
      message.success(t('reimbursement:teacher.message.downloadSuccess'));
      await loadForms();
    } catch (error) {
      message.error(error.message || t('reimbursement:teacher.message.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: t('reimbursement:form.studentAccountNo'),
        dataIndex: 'studentAccountNo',
        key: 'studentAccountNo',
        width: 120,
      },
      {
        title: t('reimbursement:teacher.column.studentName'),
        dataIndex: 'studentName',
        key: 'studentName',
        width: 100,
      },
      {
        title: t('reimbursement:form.expenseCategory'),
        dataIndex: 'expenseCategoryLabel',
        key: 'expenseCategoryLabel',
        width: 120,
      },
      {
        title: t('reimbursement:teacher.column.invoiceCount'),
        key: 'itemCount',
        width: 100,
        render: (_, record) => t('reimbursement:list.itemCount', { count: record.items?.length || 0 }),
      },
      {
        title: t('reimbursement:teacher.column.totalAmount'),
        key: 'totalAmount',
        width: 110,
        render: (_, record) => t('reimbursement:list.totalAmount', { amount: record.totalInvoiceAmount ?? 0 }),
      },
      {
        title: t('reimbursement:teacher.column.status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => (
          <Tag color={STATUS_COLOR[record.status] || 'default'}>
            {record.statusLabel || record.status}
          </Tag>
        ),
      },
      {
        title: t('reimbursement:teacher.column.submittedAt'),
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        width: 170,
        render: (value) => formatDateTime(value),
      },
      {
        title: t('reimbursement:teacher.column.actions'),
        key: 'actions',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Button
            type="link"
            icon={<DownloadOutlined />}
            disabled={!DOWNLOADABLE_STATUSES.has(record.status) || downloading}
            onClick={() => handleDownload([record.id], [record])}
          >
            {t('reimbursement:teacher.button.download')}
          </Button>
        ),
      },
    ],
    [downloading, t],
  );

  const tabItems = businessCategories.map((category) => ({
    key: category.code,
    label: category.label,
    children: (
      <View>
        <View style={styles.toolbar}>
          <View style={styles.filters}>
            <Input
              style={styles.filterInput}
              placeholder={t('reimbursement:form.studentAccountNo')}
              value={filters.studentAccountNo}
              allowClear
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, studentAccountNo: event.target.value }))
              }
              onPressEnter={loadForms}
            />
            <Input
              style={styles.filterInput}
              placeholder={t('reimbursement:teacher.filter.studentNamePlaceholder')}
              value={filters.studentName}
              allowClear
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, studentName: event.target.value }))
              }
              onPressEnter={loadForms}
            />
            <Select
              style={styles.filterSelect}
              placeholder={t('reimbursement:teacher.filter.statusPlaceholder')}
              value={filters.status || undefined}
              allowClear
              options={formStatuses.map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value || '' }))}
            />
            <Button onClick={loadForms}>{t('reimbursement:teacher.button.search')}</Button>
          </View>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={!selectedRowKeys.length}
            onClick={() =>
              handleDownload(
                selectedRowKeys,
                forms.filter((form) => selectedRowKeys.includes(form.id)),
              )
            }
          >
            {t('reimbursement:teacher.button.batchDownload', { count: selectedRowKeys.length })}
          </Button>
        </View>

        <View style={styles.tableWrap}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={forms}
            loading={loading}
            pagination={{ pageSize: 20, showSizeChanger: false }}
            locale={{
              emptyText: <Empty description={t('reimbursement:teacher.empty.noForms')} />,
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              getCheckboxProps: (record) => ({
                disabled: !DOWNLOADABLE_STATUSES.has(record.status),
              }),
            }}
            scroll={{ x: 960 }}
          />
        </View>
      </View>
    ),
  }));

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('auth:title.teacherHome')}</Text>
          <Text style={styles.subtitle}>
            {t('auth:message.welcomeUser', {
              name: user?.name,
              accountNo: user?.accountNo,
            })}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button onClick={handleLogout}>{t('common:button.logout')}</Button>
        </View>
      </View>

      <View style={styles.contentCard}>
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={(key) => {
            setActiveTab(key);
            setSelectedRowKeys([]);
          }}
        />
      </View>
    </View>
  );
};
