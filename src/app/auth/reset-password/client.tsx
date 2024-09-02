'use client';

import { Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { supabase } from '@/supabase/supabaseClient';

const ResetPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      console.log('Access Token:', token); // Ajoutez ce log pour vérifier le jeton d'accès
      setAccessToken(token);
    } else {
      console.error('Access token is missing from the URL');
      openNotificationWithIcon(
        'error',
        t('reset_password.error'),
        t('reset_password.error_message'),
      );
      router.push('/auth/forgot-password');
    }

    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
  }, [searchParams]);

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
        t('reset_password.password_mismatch'),
        t('reset_password.password_mismatch_message'),
      );
      return;
    }

    try {
      // Authentifier l'utilisateur avec le jeton d'accès
      const { data: sessionData, error: signInError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      console.log('Session Data:', sessionData); // Ajoutez ce log pour vérifier la réponse de setSession
      if (signInError) throw signInError;

      // Vérifiez que la session est bien établie
      if (!sessionData.session) {
        throw new Error('Session not established');
      }

      // Mettre à jour le mot de passe de l'utilisateur
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      openNotificationWithIcon(
        'success',
        t('reset_password.success'),
        t('reset_password.success_message'),
      );
      router.push('/auth/signin');
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error,
      );
      openNotificationWithIcon(
        'error',
        t('reset_password.error'),
        t('reset_password.error_message'),
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleResetPassword}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {t('reset_password.title')}
        </h2>
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {t('reset_password.new_password')}
          </label>
          <input
            type="password"
            placeholder={t('reset_password.enter_new_password')}
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
              ? t('signup.password_requirements')
              : passwordStrength === 100
                ? t('signup.password_strong')
                : t('signup.password_good')}
          </p>
        </div>
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {t('reset_password.confirm_password')}
          </label>
          <input
            type="password"
            placeholder={t('reset_password.reenter_new_password')}
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
            <p className="text-sm text-rose-500">
              {t('signup.password_mismatch')}
            </p>
          )}
        </div>
        <Button type="primary" htmlType="submit" className="w-full">
          {t('reset_password.submit')}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
