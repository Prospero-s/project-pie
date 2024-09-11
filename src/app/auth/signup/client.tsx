/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import { Input } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { useLoading } from '@/hooks/LoadingContext';
import { supabase } from '@/supabase/supabaseClient';

const ClientSignUp = () => {
  const { t } = useTranslation('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [, setError] = useState('');
  const [, setSuccess] = useState(false);
  const { setLoading } = useLoading();
  const router = useRouter();

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

  const isFormValid = () => {
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      fullName.trim() !== '' &&
      password === confirmPassword &&
      passwordStrength >= 75
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (passwordStrength < 75) {
      setError(t('weak_password'));
      openNotificationWithIcon(
        'error',
        t('weak_password'),
        t('password_strength_error'),
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      openNotificationWithIcon(
        'error',
        t('password_mismatch'),
        t('password_mismatch_message'),
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        setError(t('email_already_registered'));
        openNotificationWithIcon(
          'error',
          t('registration_error_title'),
          t('email_already_registered'),
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      openNotificationWithIcon(
        'success',
        t('registration_successful'),
        t('verification_email_sent'),
      );
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      setError(t('registration_error'));
      openNotificationWithIcon(
        'error',
        t('registration_error_title'),
        t('registration_error_message'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                src="/images/icon/logo-dark.png"
                alt="SignUp"
                width={400}
                height={400}
                className="mb-4"
              />
              <h1 className="text-2xl font-bold text-center">
                {t('subtitle')}
              </h1>
            </div>
          </div>
          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
                {t('title')}
              </h2>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-medium text-black dark:text-white">
                    {t('full_name')}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t('enter_full_name')}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-black dark:text-white">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder={t('enter_email')}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-black dark:text-white">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Input.Password
                      type="password"
                      placeholder={t('enter_password')}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength >= 75
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-sm ${
                      passwordStrength < 75
                        ? 'text-yellow-600'
                        : 'text-green-600'
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
                  <label className="block font-medium text-black dark:text-white">
                    {t('confirm_password')}
                  </label>
                  <div className="relative">
                    <Input.Password
                      type="password"
                      placeholder={t('reenter_password')}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`w-full rounded-lg border ${
                        !passwordMatch && confirmPassword
                          ? 'border-rose-500'
                          : 'border-stroke dark:border-form-strokedark'
                      } bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    />
                  </div>
                  {!passwordMatch && confirmPassword && (
                    <p className="text-sm text-rose-500">
                      {t('password_mismatch')}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className={`w-full rounded-lg border border-primary bg-primary p-4 text-white transition ${
                      isFormValid()
                        ? 'hover:bg-opacity-90'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {t('create_account')}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p>
                    {t('already_have_account')}{' '}
                    <Link href="/auth/signin" className="text-primary">
                      {t('sign_in')}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSignUp;
