import React from 'react';
import { Button, Checkbox } from 'antd';
import InputField from '@/components/common/field/InputField';
import PasswordField from '@/components/common/field/PasswordField';

const SignInForm = ({ t, email, setEmail, password, setPassword, handleSignIn, isFormValid, loading, handleForgotPassword }) => (
  <form onSubmit={handleSignIn} className="space-y-4">
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
      <InputField
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Entrez votre email"
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
      />
    </div>
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
      <PasswordField
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
      />
    </div>
    <div className="flex items-center justify-between">
      <Checkbox className="text-sm text-gray-600">{t('remember_me')}</Checkbox>
      <Button
        onClick={handleForgotPassword}
        type="link"
        className="text-sm text-primary hover:text-primary/80 p-0"
      >
        {t('forgot_password_text')}
      </Button>
    </div>
    <Button
      type="primary"
      htmlType="submit"
      disabled={!isFormValid() || loading}
      className={`w-full rounded-lg h-10 text-sm font-medium flex items-center justify-center bg-primary p-0 text-white transition ${
        isFormValid() ? 'hover:bg-opacity-90' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {t('login')}
    </Button>
  </form>
);

export default SignInForm;