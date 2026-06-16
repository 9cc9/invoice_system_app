/**
 * 发票文件上传字段
 */

import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'shared/ui/Button';
import { uploadFile } from 'entities/file';
import { message } from 'shared/ui/Message';
import { useTranslation } from 'shared/hooks/useTranslation';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';

export const FileUploadField = ({
  value,
  onChange,
  fileType = 'file',
  formId,
  itemId,
  required = false,
  onUploadResult,
}) => {
  const { t } = useTranslation(['reimbursement']);

  const fileList = value
    ? [{
        uid: value,
        name: value.split('/').pop() || t('reimbursement:file.uploaded'),
        status: 'done',
        url: value,
      }]
    : [];

  return (
    <Upload
      accept={ACCEPT}
      maxCount={1}
      fileList={fileList}
      customRequest={async ({ file, onSuccess, onError }) => {
        try {
          const result = await uploadFile(file, { formId, itemId, fileType });
          onUploadResult?.(result);
          onChange?.(result.fileUrl);
          onSuccess?.(result);
          message.success(t('reimbursement:message.uploadSuccess'));
        } catch (error) {
          message.error(error.message || t('reimbursement:message.uploadFailed'));
          onError?.(error);
        }
      }}
      onRemove={() => {
        onChange?.(undefined);
        onUploadResult?.(null);
        return true;
      }}
    >
      <Button icon={<UploadOutlined />}>
        {required ? t('reimbursement:button.uploadRequired') : t('reimbursement:button.uploadOptional')}
      </Button>
    </Upload>
  );
};
