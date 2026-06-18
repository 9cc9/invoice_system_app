/**
 * 报销单创建 / 编辑页
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, InputNumber, Card, Checkbox, Modal, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons';
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
  fetchCategories,
} from 'entities/reimbursement';
import { FileUploadField } from 'components/reimbursement';
import { ROUTES } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { styles } from './ReimbursementFormPage.styles';

const { TextArea } = Input;

const PAYMENT_RECORD_THRESHOLD = 200;
const EXPLANATION_TEMPLATE_URL = '/images/explanation-template.png';

const requiresPaymentRecord = (amount) => {
  const num = Number(amount);
  return Number.isFinite(num) && num >= PAYMENT_RECORD_THRESHOLD;
};

const parseInvoiceAmount = (value) => {
  if (value == null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const amountsEqual = (invoiceAmount, paidAmount) => {
  const invoice = Number(invoiceAmount);
  const paid = Number(paidAmount);
  if (!Number.isFinite(invoice) || !Number.isFinite(paid)) {
    return true;
  }
  return Math.abs(invoice - paid) < 0.005;
};

const stripFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) {
    return filename.trim();
  }
  return filename.slice(0, lastDot).trim();
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
  const [categoryOptions, setCategoryOptions] = useState({
    businessCategories: [],
    expenseCategories: [],
    linkage: {},
  });
  const [formId, setFormId] = useState(id || null);
  const [autoAmountIndexes, setAutoAmountIndexes] = useState(() => new Set());
  const [explanationTemplateOpen, setExplanationTemplateOpen] = useState(false);
  const [draftSavedModalOpen, setDraftSavedModalOpen] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchCategories();
        setCategoryOptions({
          businessCategories: data?.businessCategories || [],
          expenseCategories: data?.expenseCategories || [],
          linkage: data?.linkage || {},
        });
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
            amountMismatchReason: item.amountMismatchReason || '',
            paymentRecordUrls: item.paymentRecordUrls || [],
            hasVagueItemName: Boolean(item.hasVagueItemName),
            purchaseListFileUrl: item.purchaseListFileUrl || '',
            explanationFileUrl: item.explanationFileUrl || '',
            issuerPayeeInconsistent: Boolean(item.explanationFileUrl),
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
      setDraftSavedModalOpen(true);
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
    const invoiceName = stripFileExtension(result.originalFilename);
    const nextItems = items.map((item, index) => {
      if (index !== itemIndex) {
        return item;
      }
      const nextItem = {
        ...item,
        invoiceFileUrl: result.fileUrl ?? item.invoiceFileUrl,
      };
      if (invoiceName) {
        nextItem.invoiceName = invoiceName;
      }
      if (amount != null) {
        nextItem.invoiceAmount = amount;
        if (!requiresPaymentRecord(amount)) {
          nextItem.actualPaidAmount = undefined;
          nextItem.amountMismatchReason = '';
          nextItem.paymentRecordUrls = [];
          nextItem.hasVagueItemName = false;
          nextItem.purchaseListFileUrl = '';
          nextItem.issuerPayeeInconsistent = false;
          nextItem.explanationFileUrl = '';
        }
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

  const handleInvoiceAmountChange = (itemIndex, value) => {
    const items = form.getFieldValue('items') || [];
    const nextItems = items.map((item, index) => {
      if (index !== itemIndex) {
        return item;
      }
      const nextItem = { ...item };
      if (requiresPaymentRecord(value)) {
        if (amountsEqual(value, item.actualPaidAmount)) {
          nextItem.amountMismatchReason = '';
        }
      } else {
        nextItem.actualPaidAmount = undefined;
        nextItem.amountMismatchReason = '';
        nextItem.paymentRecordUrls = [];
        nextItem.hasVagueItemName = false;
        nextItem.purchaseListFileUrl = '';
        nextItem.issuerPayeeInconsistent = false;
        nextItem.explanationFileUrl = '';
      }
      return nextItem;
    });
    form.setFieldsValue({ items: nextItems });
  };

  const handleActualPaidAmountChange = (itemIndex, value) => {
    const items = form.getFieldValue('items') || [];
    const nextItems = items.map((item, index) => {
      if (index !== itemIndex) {
        return item;
      }
      const nextItem = { ...item, actualPaidAmount: value };
      if (amountsEqual(item.invoiceAmount, value)) {
        nextItem.amountMismatchReason = '';
      }
      return nextItem;
    });
    form.setFieldsValue({ items: nextItems });
  };

  const handleIssuerPayeeInconsistentChange = (itemIndex, checked) => {
    if (checked) {
      return;
    }
    const items = form.getFieldValue('items') || [];
    const nextItems = items.map((item, index) => (
      index === itemIndex
        ? { ...item, explanationFileUrl: '' }
        : item
    ));
    form.setFieldsValue({ items: nextItems });
  };

  const handleHasVagueItemNameChange = (itemIndex, checked) => {
    if (checked) {
      return;
    }
    const items = form.getFieldValue('items') || [];
    const nextItems = items.map((item, index) => (
      index === itemIndex
        ? { ...item, purchaseListFileUrl: '' }
        : item
    ));
    form.setFieldsValue({ items: nextItems });
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

    for (let index = 0; index < values.items.length; index += 1) {
      const item = values.items[index];
      if (requiresPaymentRecord(item.invoiceAmount)) {
        if (item.actualPaidAmount == null || item.actualPaidAmount === '') {
          message.error(
            t('reimbursement:validation.actualPaidAmountRequiredWithIndex', { index: index + 1 }),
          );
          return;
        }
        if (!amountsEqual(item.invoiceAmount, item.actualPaidAmount)) {
          const reason = (item.amountMismatchReason || '').trim();
          if (!reason) {
            message.error(
              t('reimbursement:validation.amountMismatchReasonRequiredWithIndex', { index: index + 1 }),
            );
            return;
          }
        }
        const paymentCount = (item.paymentRecordUrls || []).filter(Boolean).length;
        if (paymentCount === 0) {
          message.error(
            t('reimbursement:validation.paymentRecordRequiredWithIndex', { index: index + 1 }),
          );
          return;
        }
        if (item.issuerPayeeInconsistent && !item.explanationFileUrl) {
          message.error(
            t('reimbursement:validation.explanationRequiredWithIndex', { index: index + 1 }),
          );
          return;
        }
        if (item.hasVagueItemName && !item.purchaseListFileUrl) {
          message.error(
            t('reimbursement:validation.purchaseListRequiredWithIndex', { index: index + 1 }),
          );
          return;
        }
      }
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

  const handleBusinessCategoryChange = (businessCategory) => {
    const currentExpenseCategory = form.getFieldValue('expenseCategory');
    const allowedCodes = categoryOptions.linkage[businessCategory] || [];
    if (currentExpenseCategory && !allowedCodes.includes(currentExpenseCategory)) {
      form.setFieldsValue({ expenseCategory: undefined });
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
              options={categoryOptions.businessCategories.map((item) => ({ value: item.code, label: item.label }))}
              onChange={handleBusinessCategoryChange}
            />
          </FormItem>

          <FormItem
            noStyle
            shouldUpdate={(prev, cur) => prev.businessCategory !== cur.businessCategory}
          >
            {({ getFieldValue }) => {
              const businessCategory = getFieldValue('businessCategory');
              const allowedCodes = new Set(categoryOptions.linkage[businessCategory] || []);
              const expenseCategoryOptions = categoryOptions.expenseCategories
                .filter((item) => allowedCodes.has(item.code))
                .map((item) => ({ value: item.code, label: item.label }));

              return (
                <FormItem
                  name="expenseCategory"
                  label={t('reimbursement:form.expenseCategory')}
                  rules={[{ required: true, message: t('reimbursement:validation.expenseCategoryRequired') }]}
                >
                  <Select
                    placeholder={t('reimbursement:form.expenseCategoryPlaceholder')}
                    disabled={!businessCategory}
                    options={expenseCategoryOptions}
                  />
                </FormItem>
              );
            }}
          </FormItem>

          <FormItem name="remark" label={t('reimbursement:form.remark')}>
            <TextArea rows={3} placeholder={t('reimbursement:form.remarkPlaceholder')} />
          </FormItem>

          <Text style={styles.sectionTitle}>{t('reimbursement:section.invoiceItems')}</Text>
          <Text style={styles.rulesHint}>{t('reimbursement:section.invoiceRules')}</Text>

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
                {fields.map((field, index) => {
                  const { key, ...restField } = field;

                  return (
                  <Card
                    key={key}
                    style={styles.itemCard}
                    bordered={false}
                    title={
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemIndexLabel}>
                            {t('reimbursement:item.title', { index: index + 1 })}
                          </Text>
                          <FormItem
                            {...restField}
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
                      {...restField}
                      name={[field.name, 'invoiceFileUrl']}
                      label={t('reimbursement:item.invoiceFile')}
                      extra={t('reimbursement:item.invoiceFileHint')}
                      rules={[{ required: true, message: t('reimbursement:validation.invoiceFileRequired') }]}
                    >
                      <FileUploadField
                        fileType="invoice"
                        formId={formId}
                        itemId={`item-${index}`}
                        accept=".pdf"
                        required
                        onUploadResult={(result) => handleInvoiceUploadResult(field.name, result)}
                      />
                    </FormItem>

                    <FormItem
                      {...restField}
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
                        onChange={(value) => handleInvoiceAmountChange(index, value)}
                      />
                    </FormItem>

                    <FormItem
                      noStyle
                      shouldUpdate={(prev, cur) => {
                        const prevAmount = prev.items?.[field.name]?.invoiceAmount;
                        const curAmount = cur.items?.[field.name]?.invoiceAmount;
                        const prevPaid = prev.items?.[field.name]?.actualPaidAmount;
                        const curPaid = cur.items?.[field.name]?.actualPaidAmount;
                        const prevFlag = prev.items?.[field.name]?.issuerPayeeInconsistent;
                        const curFlag = cur.items?.[field.name]?.issuerPayeeInconsistent;
                        const prevVague = prev.items?.[field.name]?.hasVagueItemName;
                        const curVague = cur.items?.[field.name]?.hasVagueItemName;
                        return prevAmount !== curAmount
                          || prevPaid !== curPaid
                          || prevFlag !== curFlag
                          || prevVague !== curVague;
                      }}
                    >
                      {({ getFieldValue }) => {
                        const invoiceAmount = getFieldValue(['items', field.name, 'invoiceAmount']);
                        const actualPaidAmount = getFieldValue(['items', field.name, 'actualPaidAmount']);
                        const needsPaymentRecord = requiresPaymentRecord(invoiceAmount);
                        const amountsMatch = amountsEqual(invoiceAmount, actualPaidAmount);
                        const issuerPayeeInconsistent = getFieldValue([
                          'items',
                          field.name,
                          'issuerPayeeInconsistent',
                        ]);
                        const hasVagueItemName = getFieldValue([
                          'items',
                          field.name,
                          'hasVagueItemName',
                        ]);

                        return (
                          <>
                            {needsPaymentRecord && (
                              <>
                                <FormItem
                                  {...restField}
                                  name={[field.name, 'actualPaidAmount']}
                                  label={t('reimbursement:item.actualPaidAmount')}
                                  extra={t('reimbursement:item.actualPaidAmountHint')}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('reimbursement:validation.actualPaidAmountRequired'),
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    min={0.01}
                                    precision={2}
                                    style={{ width: '100%' }}
                                    placeholder="0.00"
                                    onChange={(value) => handleActualPaidAmountChange(index, value)}
                                  />
                                </FormItem>

                                {!amountsMatch && (
                                  <FormItem
                                    {...restField}
                                    name={[field.name, 'amountMismatchReason']}
                                    label={t('reimbursement:item.amountMismatchReason')}
                                  >
                                    <Input
                                      placeholder={t('reimbursement:item.amountMismatchReasonPlaceholder')}
                                      maxLength={512}
                                    />
                                  </FormItem>
                                )}

                                <FormItem
                                  {...restField}
                                  name={[field.name, 'paymentRecordUrls']}
                                  label={t('reimbursement:item.paymentRecord')}
                                  extra={t('reimbursement:item.paymentRecordHint')}
                                >
                                  <FileUploadField
                                    fileType="payment"
                                    formId={formId}
                                    itemId={`item-${index}-payment`}
                                    multiple
                                    maxCount={5}
                                  />
                                </FormItem>

                                <FormItem
                                  {...restField}
                                  name={[field.name, 'hasVagueItemName']}
                                  valuePropName="checked"
                                >
                                  <Checkbox
                                    onChange={(event) => (
                                      handleHasVagueItemNameChange(index, event.target.checked)
                                    )}
                                  >
                                    <View style={styles.checkboxLabel}>
                                      <Text>{t('reimbursement:item.hasVagueItemName')}</Text>
                                    </View>
                                  </Checkbox>
                                </FormItem>

                                {hasVagueItemName && (
                                  <FormItem
                                    {...restField}
                                    name={[field.name, 'purchaseListFileUrl']}
                                    label={t('reimbursement:item.purchaseListFile')}
                                  >
                                    <FileUploadField
                                      fileType="purchaseList"
                                      formId={formId}
                                      itemId={`item-${index}-purchase-list`}
                                    />
                                  </FormItem>
                                )}

                                <FormItem
                                  {...restField}
                                  name={[field.name, 'issuerPayeeInconsistent']}
                                  valuePropName="checked"
                                >
                                  <Checkbox
                                    onChange={(event) => (
                                      handleIssuerPayeeInconsistentChange(index, event.target.checked)
                                    )}
                                  >
                                    {t('reimbursement:item.issuerPayeeInconsistent')}
                                  </Checkbox>
                                </FormItem>

                                {issuerPayeeInconsistent && (
                                  <FormItem
                                    {...restField}
                                    name={[field.name, 'explanationFileUrl']}
                                    label={(
                                      <View style={styles.explanationLabel}>
                                        <Text>{t('reimbursement:item.explanationFile')}</Text>
                                        <Button
                                          type="link"
                                          style={styles.templateLink}
                                          onClick={() => setExplanationTemplateOpen(true)}
                                        >
                                          {t('reimbursement:item.viewExplanationTemplate')}
                                        </Button>
                                      </View>
                                    )}
                                  >
                                    <FileUploadField
                                      fileType="explanation"
                                      formId={formId}
                                      itemId={`item-${index}-explain`}
                                    />
                                  </FormItem>
                                )}
                              </>
                            )}
                          </>
                        );
                      }}
                    </FormItem>
                  </Card>
                  );
                })}

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

      <Modal
        open={draftSavedModalOpen}
        title={t('reimbursement:message.draftSavedTitle')}
        centered
        okText={t('common:button.ok')}
        cancelButtonProps={{ style: { display: 'none' } }}
        onOk={() => setDraftSavedModalOpen(false)}
        onCancel={() => setDraftSavedModalOpen(false)}
      >
        <View style={styles.draftSavedModalContent}>
          <CheckCircleFilled style={styles.draftSavedModalIcon} />
          <Text>{t('reimbursement:message.draftSavedHint')}</Text>
        </View>
      </Modal>

      <Modal
        open={explanationTemplateOpen}
        title={t('reimbursement:item.explanationTemplateTitle')}
        footer={null}
        onCancel={() => setExplanationTemplateOpen(false)}
        width={720}
        centered
      >
        <Image
          src={EXPLANATION_TEMPLATE_URL}
          alt={t('reimbursement:item.explanationTemplateTitle')}
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>
    </View>
  );
};
