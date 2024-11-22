import React from 'react';
import { Modal, Input, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const ForgotPasswordModal = ({ t, showForgotPasswordModal, setShowForgotPasswordModal, forgotPasswordEmail, setForgotPasswordEmail, handleForgotPasswordSubmit, loading }) => (
  <Modal
    open={showForgotPasswordModal}
    onCancel={() => setShowForgotPasswordModal(false)}
    footer={null}
    centered
  >
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <MailOutlined className="text-blue-600 text-2xl" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {t('forgot_password.title')}
      </h3>
      <Input
        type="email"
        value={forgotPasswordEmail}
        onChange={e => setForgotPasswordEmail(e.target.value)}
        placeholder={t('forgot_password.email')}
        className="w-full md:w-2/3 mb-4"
      />
      <Button
        type="primary"
        onClick={handleForgotPasswordSubmit}
        className="w-full md:w-2/3 mb-4"
        disabled={loading}
      >
        {t('forgot_password.submit')}
      </Button>
    </div>
  </Modal>
);

export default ForgotPasswordModal;