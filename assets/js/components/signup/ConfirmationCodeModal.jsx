import React from 'react';
import { Modal, Input, Button, Space } from 'antd';

const ConfirmationCodeModal = ({
  t,
  visible,
  onClose,
  onConfirm,
  onResend,
  code,
  setCode,
  loading,
  resendLoading,
}) => {
  return (
    <Modal
      title={t('verify_email')}
      open={visible}
      onCancel={loading || resendLoading ? null : onClose}
      maskClosable={!(loading || resendLoading)}
      closable={!(loading || resendLoading)}
      footer={null}
    >
      <div className="space-y-4">
        <p>{t('enter_verification_code')}</p>
        <Input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={t('verification_code')}
          disabled={loading || resendLoading}
        />
        <div className="flex flex-col space-y-2">
          <Button
            type="link"
            onClick={onResend}
            loading={resendLoading}
            disabled={loading || resendLoading}
            className="self-start"
          >
            {t('resend_verification_code')}
          </Button>

          <Space className="self-end">
            <Button onClick={onClose} disabled={loading || resendLoading}>
              {t('cancel')}
            </Button>
            <Button
              type="primary"
              onClick={onConfirm}
              loading={loading}
              disabled={loading || resendLoading}
            >
              {t('verify')}
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationCodeModal;
