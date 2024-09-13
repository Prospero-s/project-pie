'use client';

import { Button, Input } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useTranslation } from '@/app/i18n/client';
import AuthLayout from '@/components/common/Layouts/AuthLayout';
import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { supabase } from '@/lib/supabaseClient';

export default function ClientResetPassword({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'reset-password');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fragmentParams = new URLSearchParams(
      window.location.hash.substring(1),
    );

    const token =
      urlParams.get('access_token') || fragmentParams.get('access_token');
    const refreshToken = fragmentParams.get('refresh_token');

    if (token) {
      setAccessToken(token);
    } else {
      openNotificationWithIcon('error', t('error'), t('error_message'));
      router.push('/signin');
    }

    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
  }, [router, t]);

  const checkPasswordStrength = (pass: string) => {
    let strength = 0;

    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[$@#&!+-."'{}[\]\\|?<>^%$!]/.test(pass);

    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;

    if (pass.length >= 8) {
      strength += 15;
    }

    if (pass.length >= 12) {
      strength += 5;
    }

    setPasswordStrength(Math.min(strength, 100));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordMatch(confirmPass === password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      openNotificationWithIcon(
        'error',
        t('password_mismatch'),
        t('password_mismatch_message'),
      );
      return;
    }

    try {
      const { data: sessionData, error: signInError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      if (signInError) throw signInError;
      if (!sessionData.session) {
        throw new Error('Session not established');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        if (
          updateError.message.includes(
            'New password should be different from the old password',
          )
        ) {
          openNotificationWithIcon(
            'error',
            t('same_password_error'),
            t('same_password_error_message'),
          );
        } else {
          throw updateError;
        }
      } else {
        openNotificationWithIcon('success', t('success'), t('success_message'));
      }
    } catch (error) {
      openNotificationWithIcon('error', t('error'), t('error_message'));
    }
  };

  return (
    <AuthLayout lng={lng}>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleResetPassword}
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            {t('title')}
          </h2>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              {t('new_password')}
            </label>
            <Input.Password
              type="password"
              placeholder={t('enter_new_password')}
              value={password}
              onChange={handlePasswordChange}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-700 outline-none focus:border-blue-500"
              required
            />
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passwordStrength >= 75 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
            <p
              className={`text-sm ${
                passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
              }`}
            >
              {passwordStrength < 75
                ? t('password_requirements')
                : passwordStrength === 100
                  ? t('password_strong')
                  : t('password_good')}
            </p>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
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
              } bg-white py-3 px-4 text-gray-700 outline-none focus:border-blue-500`}
              required
            />
            {!passwordMatch && confirmPassword && (
              <p className="text-sm text-rose-500">{t('password_mismatch')}</p>
            )}
          </div>
          <Button type="primary" htmlType="submit" className="w-full">
            {t('submit')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
