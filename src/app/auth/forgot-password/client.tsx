'use client';

import { Button } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { supabase } from '@/supabase/supabaseClient';

const ClientForgotPassword = () => {
  const { t } = useTranslation('forgot-password');
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://localhost:3000/auth/reset-password?access_token=`,
      });
      if (error) throw error;
      openNotificationWithIcon('success', t('email_sent'), t('check_inbox'));
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error,
      );
      openNotificationWithIcon('error', t('error'), t('error_message'));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleForgotPassword}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {t('title')}
        </h2>
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            type="email"
            placeholder={t('enter_email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-700 outline-none focus:border-blue-500"
            required
          />
        </div>
        <Button type="primary" htmlType="submit" className="w-full">
          {t('submit')}
        </Button>
      </form>
    </div>
  );
};

export default ClientForgotPassword;
