'use client';

import {
  AppleOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  WindowsOutlined,
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import AuthRedirect from '@/hooks/authRedirect';
import { AuthProvider } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabaseClient';

const ClientSignIn = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.status === 400 &&
          error.message.includes('Email not confirmed')
        ) {
          setShowVerificationModal(true);
        } else {
          throw error;
        }
      } else if (data.user) {
        openNotificationWithIcon(
          'success',
          t('signin.login_success'),
          t('signin.login_success_message'),
        );
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      openNotificationWithIcon(
        'error',
        t('signin.login_error'),
        t('signin.login_error_message'),
      );
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      openNotificationWithIcon(
        'error',
        t('signin.login_error'),
        t('signin.login_error_message'),
      );
    }
  };

  const signInWithMicrosoft = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email openid profile',
      },
    });
    if (error) {
      console.error('Erreur de connexion Microsoft:', error);
      openNotificationWithIcon(
        'error',
        t('signin.login_error'),
        t('signin.login_error_message'),
      );
    } else if (data) {
      console.log('Connexion Microsoft réussie:', data);
    }
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    if (error) {
      openNotificationWithIcon(
        'error',
        t('signin.login_error_title'),
        t('signin.login_error_message'),
      );
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      openNotificationWithIcon(
        'success',
        t('signin.verification_email_resent'),
        t('signin.check_inbox'),
      );
      setShowVerificationModal(false);
    } catch (error) {
      console.error("Erreur lors du renvoi de l'email de vérification:", error);
      openNotificationWithIcon(
        'error',
        t('signin.resend_error'),
        t('signin.resend_error_message'),
      );
    }
  };

  return (
    <AuthProvider>
      <AuthRedirect>
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-wrap items-center">
              <div className="hidden w-full xl:block xl:w-1/2">
                <div className="flex flex-col items-center justify-center h-full">
                  <Image
                    src="/images/icon/logo-dark.png"
                    alt="SignIn"
                    width={400}
                    height={400}
                    className="mb-4"
                  />
                  <h1 className="text-2xl font-bold text-center">
                    {t('signin.login_subtitle')}
                  </h1>
                </div>
              </div>
              <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
                <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                  <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
                    {t('signin.login_title')}
                  </h2>
                  <form onSubmit={handleSignIn}>
                    <div className="mb-4">
                      <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('signin.email')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder={t('signin.enter_email')}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <span className="absolute right-4 top-4">
                          <MailOutlined className="text-gray-500" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('signin.password')}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder={t('signin.enter_password')}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <span className="absolute right-4 top-4">
                          <LockOutlined className="text-gray-500" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-5">
                      <input
                        type="submit"
                        value={t('signin.login')}
                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                      />
                    </div>
                  </form>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-gray-500">
                      {t('signin.or_connect_with')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <Button
                      icon={<GoogleOutlined />}
                      className="flex-1 h-12 flex items-center justify-center bg-rose-600 hover:!bg-white hover:!border-rose-600 hover:!text-rose-600 border-rose-600 text-white"
                      onClick={signInWithGoogle}
                    >
                      Google
                    </Button>
                    <Button
                      icon={<WindowsOutlined />}
                      className="flex-1 h-12 flex items-center justify-center bg-blue-500 hover:!bg-white hover:!border-blue-500 hover:!text-blue-500 border-blue-500 text-white"
                      onClick={signInWithMicrosoft}
                    >
                      Microsoft
                    </Button>
                    <Button
                      icon={<AppleOutlined />}
                      className="flex-1 h-12 flex items-center justify-center bg-black hover:!bg-white hover:!border-black hover:!text-black border-black text-white"
                      onClick={signInWithApple}
                    >
                      Apple
                    </Button>
                  </div>
                  <div className="mt-6 text-center">
                    <p>
                      {t('signin.no_account')}{' '}
                      <Link href="/auth/signup" className="text-primary">
                        {t('signin.create_account')}
                      </Link>
                    </p>
                    <Link
                      href="/auth/forgot-password"
                      className="text-primary hover:underline"
                    >
                      {t('signin.forgot_password')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal
          visible={showVerificationModal}
          onCancel={() => setShowVerificationModal(false)}
          footer={null}
          centered
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('signin.email_not_verified')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('signin.please_verify_email')}
            </p>
            <Button
              type="primary"
              onClick={resendVerificationEmail}
              className="w-full mb-2"
            >
              {t('signin.resend_verification_email')}
            </Button>
          </div>
        </Modal>
      </AuthRedirect>
    </AuthProvider>
  );
};

export default ClientSignIn;
