import React, { useState } from 'react';
import { Button, Input } from 'antd';
import PasswordStrengthField from '@/components/common/field/PasswordStrengthField';

const ResetPasswordForm = ({ t, handleResetPassword, password, setPassword, confirmPassword, setConfirmPassword }) => {
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordMatch(confirmPass === password);
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <PasswordStrengthField
        label={t('new_password')}
        value={password}
        onChange={handlePasswordChange}
        placeholder={t('enter_new_password')}
        className="w-full rounded-lg border border-gray-300 bg-white py-4 sm:py-3 px-4 text-gray-700 text-lg sm:text-base outline-none focus:border-blue-500"
      />
      <div className="space-y-2">
        <label className="block font-medium text-lg sm:text-base text-gray-700">
          {t('confirm_password')}
        </label>
        <Input.Password
          type="password"
          placeholder={t('reenter_new_password')}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`w-full rounded-lg border ${
            !passwordMatch && confirmPassword
              ? 'border-rose-500'
              : 'border-gray-300'
          } bg-white py-4 sm:py-3 px-4 text-gray-700 text-lg sm:text-base outline-none focus:border-blue-500`}
          required
        />
        {!passwordMatch && confirmPassword && (
          <p className="text-sm text-rose-500">{t('password_mismatch')}</p>
        )}
      </div>
      <Button type="primary" htmlType="submit" className="w-full h-14 sm:h-12 text-lg sm:text-base">
        {t('submit')}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;