/**
 * 学生首页：报销单列表 + 新建入口
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'shared/ui/Button';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { message } from 'shared/ui/Message';
import { useAuthStore } from 'entities/auth';
import { listReimbursementForms } from 'entities/reimbursement';
import { ROUTES } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { styles } from './StudentHomePage.styles';

const STATUS_COLOR = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  DOWNLOADED: 'success',
  ARCHIVED: 'warning',
};

export const StudentHomePage = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation(['common', 'auth', 'reimbursement']);
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReimbursementForms();
      setForms(data || []);
    } catch (error) {
      message.error(error.message || t('reimbursement:message.loadListFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleLogout = async () => {
    await logout();
    message.success(t('common:message.logoutSuccess'));
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleCreate = () => {
    navigate(ROUTES.STUDENT_FORM_CREATE);
  };

  const handleOpenForm = (form) => {
    if (form.status === 'DRAFT') {
      navigate(ROUTES.STUDENT_FORM_EDIT(form.id));
      return;
    }
    message.info(t('reimbursement:message.submittedReadonly'));
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('auth:title.studentHome')}</Text>
          <Text style={styles.subtitle}>
            {t('auth:message.welcomeUser', {
              name: user?.name,
              accountNo: user?.accountNo,
            })}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('reimbursement:button.createForm')}
          </Button>
          <Button onClick={handleLogout}>{t('common:button.logout')}</Button>
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>{t('reimbursement:title.myForms')}</Text>

        {loading ? (
          <Text style={styles.emptyText}>{t('common:label.loading')}</Text>
        ) : forms.length === 0 ? (
          <Empty description={t('reimbursement:empty.noForms')} />
        ) : (
          <View style={styles.list}>
            {forms.map((form) => (
              <View
                key={form.id}
                style={styles.listItem}
                onClick={() => handleOpenForm(form)}
              >
                <View style={styles.listItemMain}>
                  <Text style={styles.listItemTitle}>
                    {form.expenseCategoryLabel} · {form.businessCategoryLabel}
                  </Text>
                  <Text style={styles.listItemMeta}>
                    {t('reimbursement:list.itemCount', { count: form.items?.length || 0 })}
                    {' · '}
                    {t('reimbursement:list.totalAmount', { amount: form.totalInvoiceAmount ?? 0 })}
                  </Text>
                </View>
                <Tag color={STATUS_COLOR[form.status] || 'default'}>
                  {form.statusLabel || form.status}
                </Tag>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
