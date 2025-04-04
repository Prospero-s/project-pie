import React from 'react';
import InputField from '@/components/common/field/InputField';
import PasswordStrengthField from '@/components/common/field/PasswordStrengthField';
import PasswordField from '@/components/common/field/PasswordField';

const SignUpForm = ({
  t,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  passwordMatch,
  handleConfirmPasswordChange,
}) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {t('full_name')}
      </label>
      <InputField
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        placeholder={t('enter_full_name')}
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
      />
    </div>
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {t('email')}
      </label>
      <InputField
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t('enter_email')}
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
      />
    </div>
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {t('password')}
      </label>
      <PasswordStrengthField
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={t('enter_password')}
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
      />
    </div>
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {t('confirm_password')}
      </label>
      <PasswordField
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder={t('reenter_password')}
        className={`w-full h-10 rounded-lg border ${
          !passwordMatch && confirmPassword
            ? 'border-rose-500'
            : 'border-gray-300'
        } bg-white px-3 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm`}
      />
      {!passwordMatch && confirmPassword && (
        <p className="text-sm text-rose-500 mt-1">{t('password_mismatch')}</p>
      )}
    </div>
  </div>
);

export default SignUpForm;
