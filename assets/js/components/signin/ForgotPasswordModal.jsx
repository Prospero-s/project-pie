import React, { useState } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import PasswordStrengthField from '@/components/common/field/PasswordStrengthField';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

const ForgotPasswordModal = ({ 
  t, 
  showForgotPasswordModal, 
  setShowForgotPasswordModal, 
  forgotPasswordEmail,
  setForgotPasswordEmail,
  handleForgotPasswordSubmit,
  handleConfirmPasswordReset,
  loading 
}) => {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const handleSubmit = async () => {
    if (step === 1) {
      const success = await handleForgotPasswordSubmit(forgotPasswordEmail);
      if (success) {
        setStep(2);
        setVerificationCode('');  // Réinitialiser le code
      }
    } else if (step === 2) {
      // Vérification du code uniquement
      if (verificationCode.trim()) {
        setIsCodeVerified(true);
        setStep(3);
      }
    } else {
      if (newPassword !== confirmPassword) {
        openNotificationWithIcon('error', t('forgot_password.error'), t('forgot_password.passwords_dont_match'));
        return;
      }
      const success = await handleConfirmPasswordReset(verificationCode, newPassword);
      if (success) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setShowForgotPasswordModal(false);
    setStep(1);
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCodeVerified(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Form layout="vertical">
            <Form.Item label={t('forgot_password.email')}>
              <Input
                prefix={<MailOutlined />}
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder={t('forgot_password.enter_email')}
              />
            </Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              block
            >
              {t('forgot_password.submit')}
            </Button>
          </Form>
        );
      case 2:
        return (
          <Form layout="vertical">
            <Form.Item label={t('forgot_password.verification_code')}>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t('forgot_password.enter_code')}
              />
            </Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              block
            >
              {t('verify')}
            </Button>
          </Form>
        );
      case 3:
        return (
          <Form layout="vertical">
            <Form.Item label={t('forgot_password.new_password')}>
              <PasswordStrengthField
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('forgot_password.enter_new_password')}
              />
            </Form.Item>
            <Form.Item label={t('forgot_password.confirm_password')}>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('forgot_password.reenter_password')}
              />
            </Form.Item>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              block
            >
              {t('forgot_password.reset_password')}
            </Button>
          </Form>
        );
    }
  };

  return (
    <Modal
      title={t('forgot_password.title')}
      open={showForgotPasswordModal}
      onCancel={handleClose}
      footer={null}
      centered
      className="max-w-md"
    >
      {renderStepContent()}
    </Modal>
  );
};

export default ForgotPasswordModal;