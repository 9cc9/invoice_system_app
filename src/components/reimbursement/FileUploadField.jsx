/**
 * 发票文件上传字段
 */

import { useRef } from 'react';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'shared/ui/Button';
import { uploadFile } from 'entities/file';
import { message } from 'shared/ui/Message';
import { useTranslation } from 'shared/hooks/useTranslation';

const DEFAULT_ACCEPT = '.pdf,.jpg,.jpeg,.png';

const normalizeValue = (value, multiple) => {
  if (multiple) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }
  return value || undefined;
};

export const FileUploadField = ({
  value,
  onChange,
  fileType = 'file',
  formId,
  itemId,
  required = false,
  onUploadResult,
  multiple = false,
  maxCount = 1,
  accept = DEFAULT_ACCEPT,
}) => {
  const { t } = useTranslation(['reimbursement']);
  const fileUrls = normalizeValue(value, multiple);
  const valueRef = useRef(fileUrls);
  valueRef.current = fileUrls;
  const uploadQueueRef = useRef(Promise.resolve());

  const fileList = (multiple ? fileUrls : (fileUrls ? [fileUrls] : [])).map((url, index) => ({
    uid: `${url}-${index}`,
    name: url.split('/').pop() || t('reimbursement:file.uploaded'),
    status: 'done',
    url,
  }));

  const emitChange = (nextValue) => {
    if (multiple) {
      onChange?.(nextValue.length > 0 ? nextValue : undefined);
      return;
    }
    onChange?.(nextValue);
  };

  const enqueueUpload = (task) => {
    const next = uploadQueueRef.current.then(task);
    uploadQueueRef.current = next.catch(() => {});
    return next;
  };

  const handleBeforeUpload = (file, batchFileList) => {
    if (!multiple) {
      return true;
    }
    const remaining = maxCount - valueRef.current.length;
    const batchIndex = batchFileList.indexOf(file);
    if (remaining <= 0) {
      if (batchIndex === 0) {
        message.error(t('reimbursement:message.uploadMaxCountExceeded', { max: maxCount }));
      }
      return Upload.LIST_IGNORE;
    }
    if (batchIndex >= remaining) {
      if (batchIndex === remaining) {
        message.error(t('reimbursement:message.uploadMaxCountExceeded', { max: maxCount }));
      }
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  return (
    <Upload
      accept={accept}
      multiple={multiple}
      maxCount={maxCount}
      fileList={fileList}
      beforeUpload={handleBeforeUpload}
      customRequest={({ file, onSuccess, onError }) => {
        enqueueUpload(async () => {
          try {
            const uploadItemId = multiple ? `${itemId}-${file.uid}` : itemId;
            const result = await uploadFile(file, { formId, itemId: uploadItemId, fileType });
            if (!multiple) {
              onUploadResult?.(result);
            }
            const currentUrls = multiple ? [...valueRef.current] : undefined;
            const nextValue = multiple
              ? [...currentUrls, result.fileUrl]
              : result.fileUrl;
            if (multiple) {
              valueRef.current = nextValue;
            }
            emitChange(nextValue);
            onSuccess?.(result);
            message.success(t('reimbursement:message.uploadSuccess'));
          } catch (error) {
            message.error(error.message || t('reimbursement:message.uploadFailed'));
            onError?.(error);
            throw error;
          }
        });
      }}
      onRemove={(file) => {
        if (multiple) {
          const nextValue = fileUrls.filter((url) => url !== file.url);
          valueRef.current = nextValue;
          emitChange(nextValue);
        } else {
          onChange?.(undefined);
          onUploadResult?.(null);
        }
        return true;
      }}
    >
      <Button icon={<UploadOutlined />}>
        {required ? t('reimbursement:button.uploadRequired') : t('reimbursement:button.uploadOptional')}
      </Button>
    </Upload>
  );
};
