/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import AuthRedirect from '@/hooks/authRedirect';
import { AuthProvider } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabaseClient';

const ClientSignUp = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [, setError] = useState('');
  const [, setSuccess] = useState(false);
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

    if (passwordStrength < 75) {
      setError(t('signup.weak_password'));
      openNotificationWithIcon(
        'error',
        t('signup.weak_password'),
        t('signup.password_strength_error'),
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(t('signup.password_mismatch'));
      openNotificationWithIcon(
        'error',
        t('signup.password_mismatch'),
        t('signup.password_mismatch_message'),
      );
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
        setError(t('signup.email_already_registered'));
        openNotificationWithIcon(
          'error',
          t('signup.registration_error_title'),
          t('signup.email_already_registered'),
        );
        return;
      }

      setSuccess(true);
      openNotificationWithIcon(
        'success',
        t('signup.registration_successful'),
        t('signup.verification_email_sent'),
      );
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      setError(t('signup.registration_error'));
      openNotificationWithIcon(
        'error',
        t('signup.registration_error_title'),
        t('signup.registration_error_message'),
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
                <div className="px-26 py-17.5 text-center">
                  <Image
                    src="/images/icon/logo-dark.png"
                    alt="SignIn"
                    width={400}
                    height={400}
                    className="mb-4"
                  />
                  <h1 className="text-2xl font-bold text-center">
                    {t('signup.subtitle')}
                  </h1>
                </div>
              </div>
              <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
                <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                  <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
                    {t('signup.title')}
                  </h2>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block font-medium text-black dark:text-white">
                        {t('signup.full_name')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('signup.enter_full_name')}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium text-black dark:text-white">
                        {t('signup.email')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder={t('signup.enter_email')}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium text-black dark:text-white">
                        {t('signup.password')}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder={t('signup.enter_password')}
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
                          ? t('signup.password_requirements')
                          : passwordStrength === 100
                            ? t('signup.password_strong')
                            : t('signup.password_good')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium text-black dark:text-white">
                        {t('signup.confirm_password')}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder={t('signup.reenter_password')}
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
                          {t('signup.password_mismatch')}
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
                        {t('signup.create_account')}
                      </button>
                    </div>

                    <div className="mt-6 text-center">
                      <p>
                        {t('signup.already_have_account')}{' '}
                        <Link href="/auth/signin" className="text-primary">
                          {t('signup.sign_in')}
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthRedirect>
    </AuthProvider>
  );
};

export default ClientSignUp;
