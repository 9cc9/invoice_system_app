/**
 * 报销单创建 / 编辑页
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, InputNumber, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Form, FormItem, useForm } from 'shared/ui/Form';
import { Input } from 'shared/ui/Input';
import { Button } from 'shared/ui/Button';
import { message } from 'shared/ui/Message';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { useAuthStore } from 'entities/auth';
import {
  buildFormPayload,
  createEmptyInvoiceItem,
  createReimbursementForm,
  updateReimbursementForm,
  submitReimbursementForm,
  getReimbursementForm,
  fetchExpenseCategories,
  fetchBusinessCategories,
} from 'entities/reimbursement';
import { FileUploadField } from 'components/reimbursement';
import { ROUTES } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { styles } from './ReimbursementFormPage.styles';

const { TextArea } = Input;

const parseInvoiceAmount = (value) => {
  if (value == null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

export const ReimbursementFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation(['common', 'reimbursement']);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [expenseOptions, setExpenseOptions] = useState([]);
  const [businessOptions, setBusinessOptions] = useState([]);
  const [formId, setFormId] = useState(id || null);
  const [autoAmountIndexes, setAutoAmountIndexes] = useState(() => new Set());

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [expense, business] = await Promise.all([
          fetchExpenseCategories(),
          fetchBusinessCategories(),
        ]);
        setExpenseOptions(expense || []);
        setBusinessOptions(business || []);
      } catch (error) {
        message.error(error.message || t('reimbursement:message.loadOptionsFailed'));
      }
    };
    loadOptions();
  }, [t]);

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({
        items: [createEmptyInvoiceItem()],
      });
      return;
    }

    const loadForm = async () => {
      setPageLoading(true);
      try {
        const data = await getReimbursementForm(id);
        if (data.status !== 'DRAFT') {
          message.warning(t('reimbursement:message.notEditable'));
          navigate(ROUTES.STUDENT_HOME, { replace: true });
          return;
        }
        form.setFieldsValue({
          businessCategory: data.businessCategory,
          expenseCategory: data.expenseCategory,
          remark: data.remark,
          items: (data.items || []).map((item) => ({
            invoiceName: item.invoiceName,
            invoiceFileUrl: item.invoiceFileUrl,
            invoiceAmount: item.invoiceAmount,
            actualPaidAmount: item.actualPaidAmount,
            paymentRecordUrl: item.paymentRecordUrl || '',
            explanationFileUrl: item.explanationFileUrl || '',
          })),
        });
        setFormId(data.id);
        setAutoAmountIndexes(new Set());
      } catch (error) {
        message.error(error.message || t('reimbursement:message.loadFormFailed'));
        navigate(ROUTES.STUDENT_HOME, { replace: true });
      } finally {
        setPageLoading(false);
      }
    };
    loadForm();
  }, [id, isEdit, form, navigate, t]);

  const persistForm = async (values) => {
    const payload = buildFormPayload(values);
    if (formId) {
      return updateReimbursementForm(formId, payload);
    }
    const created = await createReimbursementForm(payload);
    setFormId(created.id);
    return created;
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await persistForm(values);
      message.success(t('reimbursement:message.draftSaved'));
    } catch (error) {
      if (error?.errorFields) {
        message.error(t('reimbursement:message.validationFailed'));
        return;
      }
      message.error(error.message || t('reimbursement:message.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceUploadResult = (itemIndex, result) => {
    const items = form.getFieldValue('items') || [];

    if (!result) {
      setAutoAmountIndexes((prev) => {
        const next = new Set(prev);
        next.delete(itemIndex);
        return next;
      });
      const nextItems = items.map((item, index) => (
        index === itemIndex
          ? { ...item, invoiceFileUrl: undefined, invoiceAmount: undefined }
          : item
      ));
      form.setFieldsValue({ items: nextItems });
      return;
    }

    const amount = parseInvoiceAmount(result.invoiceAmount);
    const nextItems = items.map((item, index) => {
      if (index !== itemIndex) {
        return item;
      }
      const nextItem = {
        ...item,
        invoiceFileUrl: result.fileUrl ?? item.invoiceFileUrl,
      };
      if (amount != null) {
        nextItem.invoiceAmount = amount;
      }
      return nextItem;
    });
    form.setFieldsValue({ items: nextItems });

    if (amount != null) {
      setAutoAmountIndexes((prev) => new Set(prev).add(itemIndex));
      message.success(t('reimbursement:message.invoiceAmountRecognized'));
      return;
    }

    setAutoAmountIndexes((prev) => {
      const next = new Set(prev);
      next.delete(itemIndex);
      return next;
    });
    message.warning(t('reimbursement:message.invoiceAmountNotRecognized'));
  };

  const handleRemoveItem = (remove, fieldName, index) => {
    remove(fieldName);
    setAutoAmountIndexes((prev) => {
      const next = new Set();
      prev.forEach((itemIndex) => {
        if (itemIndex < index) {
          next.add(itemIndex);
        } else if (itemIndex > index) {
          next.add(itemIndex - 1);
        }
      });
      return next;
    });
  };

  const handleSubmit = async (values) => {
    if (!values.items || values.items.length === 0) {
      message.error(t('reimbursement:validation.itemsRequired'));
      return;
    }

    try {
      setLoading(true);
      const saved = await persistForm(values);
      const targetId = saved.id || formId;
      await submitReimbursementForm(targetId);
      message.success(t('reimbursement:message.submitSuccess'));
      navigate(ROUTES.STUDENT_HOME, { replace: true });
    } catch (error) {
      if (error?.errorFields) {
        message.error(t('reimbursement:message.validationFailed'));
        return;
      }
      message.error(error.message || t('reimbursement:message.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={styles.page}>
        <Text>{t('common:label.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isEdit ? t('reimbursement:title.editForm') : t('reimbursement:title.createForm')}
          </Text>
          <Text style={styles.readonlyField}>
            {t('reimbursement:form.studentAccountNo')}: {user?.accountNo}
          </Text>
        </View>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.STUDENT_HOME)}>
          {t('reimbursement:button.backToList')}
        </Button>
      </View>

      <View style={styles.container}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Text style={styles.sectionTitle}>{t('reimbursement:section.basicInfo')}</Text>

          <FormItem
            name="businessCategory"
            label={t('reimbursement:form.businessCategory')}
            rules={[{ required: true, message: t('reimbursement:validation.businessCategoryRequired') }]}
          >
            <Select
              placeholder={t('reimbursement:form.businessCategoryPlaceholder')}
              options={businessOptions.map((item) => ({ value: item.code, label: item.label }))}
            />
          </FormItem>

          <FormItem
            name="expenseCategory"
            label={t('reimbursement:form.expenseCategory')}
            rules={[{ required: true, message: t('reimbursement:validation.expenseCategoryRequired') }]}
          >
            <Select
              placeholder={t('reimbursement:form.expenseCategoryPlaceholder')}
              options={expenseOptions.map((item) => ({ value: item.code, label: item.label }))}
            />
          </FormItem>

          <FormItem name="remark" label={t('reimbursement:form.remark')}>
            <TextArea rows={3} placeholder={t('reimbursement:form.remarkPlaceholder')} />
          </FormItem>

          <Text style={styles.sectionTitle}>{t('reimbursement:section.invoiceItems')}</Text>

          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length < 1) {
                    return Promise.reject(new Error(t('reimbursement:validation.itemsRequired')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    style={styles.itemCard}
                    bordered={false}
                    title={
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemIndexLabel}>
                            {t('reimbursement:item.title', { index: index + 1 })}
                          </Text>
                          <FormItem
                            {...field}
                            name={[field.name, 'invoiceName']}
                            rules={[{ required: true, message: t('reimbursement:validation.invoiceNameRequired') }]}
                            style={styles.invoiceNameFormItem}
                          >
                            <Input
                              variant="borderless"
                              placeholder={t('reimbursement:item.invoiceNamePlaceholder')}
                              style={styles.invoiceNameInput}
                            />
                          </FormItem>
                        </View>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveItem(remove, field.name, index)}
                          >
                            {t('reimbursement:button.removeItem')}
                          </Button>
                        )}
                      </View>
                    }
                  >
                    <FormItem
                      {...field}
                      name={[field.name, 'invoiceFileUrl']}
                      label={t('reimbursement:item.invoiceFile')}
                      rules={[{ required: true, message: t('reimbursement:validation.invoiceFileRequired') }]}
                    >
                      <FileUploadField
                        fileType="invoice"
                        formId={formId}
                        itemId={`item-${index}`}
                        required
                        onUploadResult={(result) => handleInvoiceUploadResult(field.name, result)}
                      />
                    </FormItem>

                    <FormItem
                      {...field}
                      name={[field.name, 'invoiceAmount']}
                      label={
                        autoAmountIndexes.has(index)
                          ? t('reimbursement:item.invoiceAmountAuto')
                          : t('reimbursement:item.invoiceAmount')
                      }
                      rules={[{ required: true, message: t('reimbursement:validation.invoiceAmountRequired') }]}
                    >
                      <InputNumber
                        min={0.01}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        readOnly={autoAmountIndexes.has(index)}
                      />
                    </FormItem>

                    <FormItem
                      {...field}
                      name={[field.name, 'actualPaidAmount']}
                      label={t('reimbursement:item.actualPaidAmount')}
                      rules={[{ required: true, message: t('reimbursement:validation.actualPaidAmountRequired') }]}
                    >
                      <InputNumber
                        min={0.01}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="0.00"
                      />
                    </FormItem>

                    <FormItem
                      {...field}
                      name={[field.name, 'paymentRecordUrl']}
                      label={t('reimbursement:item.paymentRecord')}
                    >
                      <FileUploadField fileType="payment" formId={formId} itemId={`item-${index}-payment`} />
                    </FormItem>

                    <FormItem
                      {...field}
                      name={[field.name, 'explanationFileUrl']}
                      label={t('reimbursement:item.explanationFile')}
                      dependencies={[
                        ['items', field.name, 'invoiceAmount'],
                        ['items', field.name, 'actualPaidAmount'],
                      ]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const invoiceAmount = getFieldValue(['items', field.name, 'invoiceAmount']);
                            const actualPaidAmount = getFieldValue(['items', field.name, 'actualPaidAmount']);
                            if (
                              actualPaidAmount != null
                              && invoiceAmount != null
                              && Number(actualPaidAmount) > Number(invoiceAmount)
                              && !value
                            ) {
                              return Promise.reject(
                                new Error(t('reimbursement:validation.explanationRequired')),
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <FileUploadField fileType="explanation" formId={formId} itemId={`item-${index}-explain`} />
                    </FormItem>
                  </Card>
                ))}

                <View style={styles.addButtonWrap}>
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add(createEmptyInvoiceItem())}
                  >
                    {t('reimbursement:button.addInvoice')}
                  </Button>
                </View>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>

          <View style={styles.actions}>
            <Button onClick={handleSaveDraft} loading={loading}>
              {t('reimbursement:button.saveDraft')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('reimbursement:button.submitForm')}
            </Button>
          </View>
        </Form>
      </View>
    </View>
  );
};
