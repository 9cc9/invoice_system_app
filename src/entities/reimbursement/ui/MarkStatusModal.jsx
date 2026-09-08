import { useEffect, useState } from 'react';
import { Input, Modal, Select } from 'antd';
import { useTranslation } from 'shared/hooks/useTranslation';
import { REQUIRES_REVIEW_REMARK_STATUSES } from '../status';

export const MarkStatusModal = ({
  open,
  loading,
  statuses,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation(['reimbursement']);
  const [selectedStatus, setSelectedStatus] = useState(undefined);
  const [reviewRemark, setReviewRemark] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedStatus(undefined);
      setReviewRemark('');
    }
  }, [open]);

  const requiresReviewRemark = REQUIRES_REVIEW_REMARK_STATUSES.has(selectedStatus);
  const canSubmit = selectedStatus && (!requiresReviewRemark || reviewRemark.trim());

  const handleOk = () => {
    if (!canSubmit) {
      return Promise.reject();
    }
    return Promise.resolve(onConfirm(selectedStatus, reviewRemark.trim() || undefined));
  };

  return (
    <Modal
      title={t('reimbursement:teacher.markStatus.title')}
      open={open}
      confirmLoading={loading}
      okText={t('reimbursement:teacher.markStatus.confirm')}
      cancelText={t('reimbursement:teacher.markStatus.cancel')}
      okButtonProps={{ disabled: !canSubmit }}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Select
        style={{ width: '100%', marginBottom: 16 }}
        placeholder={t('reimbursement:teacher.markStatus.placeholder')}
        value={selectedStatus}
        options={(statuses || []).map((item) => ({
          value: item.code,
          label: item.label,
        }))}
        onChange={setSelectedStatus}
      />
      <Input.TextArea
        rows={4}
        value={reviewRemark}
        placeholder={
          requiresReviewRemark
            ? t('reimbursement:teacher.markStatus.reviewRemarkRequiredPlaceholder')
            : t('reimbursement:teacher.markStatus.reviewRemarkPlaceholder')
        }
        onChange={(event) => setReviewRemark(event.target.value)}
      />
    </Modal>
  );
};
