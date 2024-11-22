import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import { supabase } from '@/lib/supabaseClient';
import { openNotificationWithIcon } from '@/components/common/Notification/NotifAlert';
import SignInForm from '@/components/signin/SignInForm';
import SignInButtons from '@/components/signin/SignInButtons';
import VerificationModal from '@/components/signin/VerificationModal';
import ForgotPasswordModal from '@/components/signin/ForgotPasswordModal';
import gsap from 'gsap';
import illustrationLogin from '../../img/illustration/illustration-login.webp';

const SignIn = ({ i18n }) => {
  const { t } = useTranslation('signin', { i18n });
  const { lng } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
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

  const handleSignIn = async (e) => {
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
        openNotificationWithIcon(
          'success',
          t('login_success'),
          t('login_success_message'),
        );
        setUser(data.user);
        navigate(`/${lng}/user/dashboard`);
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

  const signInWithGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + `/${lng}/user/dashboard`,
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

  const signInWithMicrosoft = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: window.location.origin + `/${lng}/user/dashboard`,
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

  const resendVerificationEmail = async (e) => {
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail,
        {
          redirectTo: window.location.origin + '/dashboard',
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
          <img
            src={illustrationLogin}
            alt="SignIn"
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
            <SignInForm
              t={t}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignIn={handleSignIn}
              isFormValid={isFormValid}
              loading={loading}
              handleForgotPassword={handleForgotPassword}
            />
            <div className="flex items-center justify-center mb-4 mt-4">
              <span className="text-gray-500">{t('or_connect_with')}</span>
            </div>
            <SignInButtons
              t={t}
              signInWithGoogle={signInWithGoogle}
              signInWithMicrosoft={signInWithMicrosoft}
              loading={loading}
            />
            <div className="mt-6 text-center">
              <p>
                {t('no_account')}{' '}
                <a href={`/${lng}/auth/signup`} className="text-primary">
                  {t('create_account')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <VerificationModal
        t={t}
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        resendVerificationEmail={resendVerificationEmail}
        loading={loading}
      />
      <ForgotPasswordModal
        t={t}
        showForgotPasswordModal={showForgotPasswordModal}
        setShowForgotPasswordModal={setShowForgotPasswordModal}
        forgotPasswordEmail={forgotPasswordEmail}
        setForgotPasswordEmail={setForgotPasswordEmail}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
        loading={loading}
      />
    </>
  );
};

export default SignIn;