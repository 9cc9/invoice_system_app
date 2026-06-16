/**
 * 发票文件上传字段
 */

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

  return (
    <Upload
      accept={accept}
      multiple={multiple}
      maxCount={maxCount}
      fileList={fileList}
      customRequest={async ({ file, onSuccess, onError }) => {
        try {
          const uploadItemId = multiple
            ? `${itemId}-${fileUrls.length + 1}`
            : itemId;
          const result = await uploadFile(file, { formId, itemId: uploadItemId, fileType });
          if (!multiple) {
            onUploadResult?.(result);
          }
          const nextValue = multiple
            ? [...fileUrls, result.fileUrl]
            : result.fileUrl;
          emitChange(nextValue);
          onSuccess?.(result);
          message.success(t('reimbursement:message.uploadSuccess'));
        } catch (error) {
          message.error(error.message || t('reimbursement:message.uploadFailed'));
          onError?.(error);
        }
      }}
      onRemove={(file) => {
        if (multiple) {
          const nextValue = fileUrls.filter((url) => url !== file.url);
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
