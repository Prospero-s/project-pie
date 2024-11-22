import React from 'react';
import { Button } from 'antd';
import InputField from '@/components/common/InputField/InputField';
import PasswordField from '@/components/common/PasswordField/PasswordField';

const SignInForm = ({ t, email, setEmail, password, setPassword, handleSignIn, isFormValid, loading, handleForgotPassword }) => (
  <form onSubmit={handleSignIn} className="space-y-4">
    <InputField
      label={t('email')}
      value={email}
      onChange={e => setEmail(e.target.value)}
      placeholder={t('enter_email')}
      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <PasswordField
      label={t('password')}
      value={password}
      onChange={e => setPassword(e.target.value)}
      placeholder={t('enter_password')}
      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <Button
      onClick={handleForgotPassword}
      type="link"
      className="text-sm text-primary block mt-2"
    >
      {t('forgot_password_text')}
    </Button>
    <Button
      type="primary"
      htmlType="submit"
      disabled={!isFormValid() || loading}
      className={`w-full rounded-lg border h-12 flex items-center justify-center bg-primary p-4 text-white transition ${
        isFormValid() ? 'hover:bg-opacity-90' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {t('login')}
    </Button>
  </form>
);

export default SignInForm;