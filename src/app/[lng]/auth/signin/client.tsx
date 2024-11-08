'use client';

import {
  GoogleOutlined,
  MailOutlined,
  WindowsOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/app/i18n/client';
import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { useUser } from '@/context/userContext';
import { supabase } from '@/lib/supabaseClient';

const ClientSignIn = ({ lng }: { lng: string }) => {
  const { t } = useTranslation(lng, 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
    );
  }, []);

  const isFormValid = () => {
    return email.trim() !== '' && password.trim() !== '';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
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
        console.log('Connexion réussie, redirection manuelle');
        openNotificationWithIcon(
          'success',
          t('login_success'),
          t('login_success_message'),
        );
        setUser(data.user);
        router.push(`/${lng}/user/dashboard`);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      openNotificationWithIcon(
        'error',
        t('login_error'),
        t('login_error_message'),
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + `/${lng}/user/dashboard`, // Assurez-vous que cette URL est correcte
        },
      });
    } catch (error) {
      console.error('Erreur de connexion avec Google:', error);
      openNotificationWithIcon(
        'error',
        t('login_error_title'),
        t('login_error_message'),
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: window.location.origin + `/${lng}/user/dashboard`, // Assurez-vous que cette URL est correcte
        },
      });
    } catch (error) {
      console.error('Erreur de connexion avec Microsoft:', error);
      openNotificationWithIcon(
        'error',
        t('login_error_title'),
        t('login_error_message'),
      );
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      openNotificationWithIcon(
        'success',
        t('verification_email_resent'),
        t('check_inbox'),
      );
      setShowVerificationModal(false);
    } catch (error) {
      console.error("Erreur lors du renvoi de l'email de vérification:", error);
      openNotificationWithIcon(
        'error',
        t('resend_error'),
        t('resend_error_message'),
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail,
        {
          redirectTo: window.location.origin + '/dashboard', // Assurez-vous que cette URL est correcte
        },
      );
      if (error) throw error;
      openNotificationWithIcon(
        'success',
        t('forgot_password.email_sent'),
        t('forgot_password.check_inbox'),
      );
      setShowForgotPasswordModal(false);
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error,
      );
      openNotificationWithIcon(
        'error',
        t('forgot_password.error'),
        t('forgot_password.error_message'),
      );
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen w-screen">
        <div className="md:w-3/5 w-full h-1/2 md:h-full">
          <Image
            src="/images/illustration/illustration-login.webp"
            width={1000}
            height={1000}
            alt="SignIn"
            priority
            className="w-full h-full"
          />
        </div>
        <div className="md:w-2/5 w-full md:h-full flex items-center justify-center md:mb-0">
          <div
            className="w-full md:w-2/3 h-full p-4 md:p-8 md:h-auto"
            ref={formRef}
          >
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
              {t('login_title')}
            </h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="mb-5 space-y-2">
                <label className="block font-medium text-black dark:text-white">
                  {t('email')}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('enter_email')}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-5 space-y-2">
                <label className="block font-medium text-black dark:text-white">
                  {t('password')}
                </label>
                <Input.Password
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('enter_password')}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <Button
                  onClick={handleForgotPassword}
                  type="link"
                  className="text-sm text-primary block mt-2"
                >
                  {t('forgot_password_text')}
                </Button>
              </div>
              <div className="mb-5 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!isFormValid() || loading}
                  className={`w-full rounded-lg border h-12 flex items-center justify-center bg-primary p-4 text-white transition ${
                    isFormValid()
                      ? 'hover:bg-opacity-90'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {t('login')}
                </Button>
              </div>
            </form>
            <div className="flex items-center justify-center mb-4 mt-4">
              <span className="text-gray-500">{t('or_connect_with')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <Button
                icon={<GoogleOutlined />}
                disabled={loading}
                className="flex-1 h-12 flex items-center justify-center bg-rose-600 hover:!bg-white hover:!border-rose-600 hover:!text-rose-600 border-rose-600 text-white"
                onClick={signInWithGoogle}
              >
                Google
              </Button>
              <Button
                icon={<WindowsOutlined />}
                disabled={loading}
                className="flex-1 h-12 flex items-center justify-center bg-blue-500 hover:!bg-white hover:!border-blue-500 hover:!text-blue-500 border-blue-500 text-white"
                onClick={signInWithMicrosoft}
              >
                Microsoft
              </Button>
            </div>
            <div className="mt-6 text-center">
              <p>
                {t('no_account')}{' '}
                <Link href={`/${lng}/auth/signup`} className="text-primary">
                  {t('create_account')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={showVerificationModal}
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
            {t('email_not_verified')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('please_verify_email')}
          </p>
          <Button
            type="primary"
            disabled={loading}
            onClick={resendVerificationEmail}
            className="w-full mb-2"
          >
            {t('resend_verification_email')}
          </Button>
        </div>
      </Modal>
      <Modal
        open={showForgotPasswordModal}
        onCancel={() => setShowForgotPasswordModal(false)}
        footer={null}
        centered
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <MailOutlined className="text-blue-600 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('forgot_password.title')}
          </h3>
          <Input
            type="email"
            value={forgotPasswordEmail}
            onChange={e => setForgotPasswordEmail(e.target.value)}
            placeholder={t('forgot_password.email')}
            className="w-full md:w-2/3 mb-4"
          />
          <Button
            type="primary"
            onClick={handleForgotPasswordSubmit}
            className="w-full md:w-2/3 mb-4"
            disabled={loading}
          >
            {t('forgot_password.submit')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ClientSignIn;
