import React from 'react';
import { Modal, Input, Button } from 'antd';

const ConfirmationCodeModal = ({ 
  t, 
  visible, 
  onClose, 
  onConfirm, 
  code, 
  setCode, 
  loading 
}) => {
  return (
    <Modal
      title={t('verify_email')}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className="space-y-4">
        <p>{t('enter_verification_code')}</p>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('verification_code')}
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button 
            type="primary" 
            onClick={onConfirm}
            loading={loading}
          >
            {t('verify')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationCodeModal; 