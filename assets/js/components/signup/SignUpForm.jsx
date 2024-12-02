import React from 'react';
import InputField from '@/components/common/field/InputField';
import PasswordStrengthField from '@/components/common/field/PasswordStrengthField';
import PasswordField from '@/components/common/field/PasswordField';

const SignUpForm = ({ t, fullName, setFullName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, passwordMatch, handleConfirmPasswordChange }) => (
  <div className="space-y-4">
    <InputField
      label={t('full_name')}
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      placeholder={t('enter_full_name')}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 sm:py-3 px-4 text-black text-lg sm:text-base outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <InputField
      label={t('email')}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder={t('enter_email')}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 sm:py-3 px-4 text-black text-lg sm:text-base outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <PasswordStrengthField
      label={t('password')}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder={t('enter_password')}
      className="w-full rounded-lg border border-stroke bg-transparent py-4 sm:py-3 px-4 text-black text-lg sm:text-base outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
    />
    <PasswordField
      label={t('confirm_password')}
      value={confirmPassword}
      onChange={handleConfirmPasswordChange}
      placeholder={t('reenter_password')}
      className={`w-full rounded-lg border ${
        !passwordMatch && confirmPassword
          ? 'border-rose-500'
          : 'border-stroke dark:border-form-strokedark'
      } bg-transparent py-4 sm:py-3 px-4 text-black text-lg sm:text-base outline-none focus:border-primary focus-visible:shadow-none dark:bg-form-input dark:text-white dark:focus:border-primary`}
    />
    {!passwordMatch && confirmPassword && (
      <p className="text-sm text-rose-500">{t('password_mismatch')}</p>
    )}
  </div>
);

export default SignUpForm;