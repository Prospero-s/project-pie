import React from 'react';
import { Modal, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const VerificationModal = ({ t, showVerificationModal, setShowVerificationModal, resendVerificationEmail, loading }) => (
  <Modal
    open={showVerificationModal}
    onCancel={() => setShowVerificationModal(false)}
    footer={null}
    centered
  >
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
        <MailOutlined className="text-yellow-600 text-2xl" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('email_not_verified')}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {t('please_verify_email')}
      </p>
      <Button
        type="primary"
        htmlType="submit"
        disabled={loading}
        onClick={resendVerificationEmail}
        className="w-full mb-2"
      >
        {t('resend_verification_email')}
      </Button>
    </div>
  </Modal>
);

export default VerificationModal;