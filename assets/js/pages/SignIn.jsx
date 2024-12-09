import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import SignInForm from '@/components/signin/SignInForm';
import SignInButtons from '@/components/signin/SignInButtons';
import VerificationModal from '@/components/signin/VerificationModal';
import ForgotPasswordModal from '@/components/signin/ForgotPasswordModal';
import gsap from 'gsap';
import { signInWithEmail, signInWithProvider, resendVerificationEmail, resetPassword } from '@/services/signin/authService';
import { Button } from 'antd';

const SignIn = ({ i18n }) => {
  const { t } = useTranslation('signin', { i18n });
  const lng = useParams().lng;
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
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

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
    const result = await signInWithEmail(email, password, t, setUser, navigate, lng);
    setShowVerificationModal(result.showVerificationModal);
    setLoading(false);
  };

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signInWithProvider('google', lng, t);
    setLoading(false);
  };

  const handleSignInWithMicrosoft = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signInWithProvider('azure', lng, t);
    setLoading(false);
  };

  const handleResendVerificationEmail = async (e) => {
    e.preventDefault();
    const success = await resendVerificationEmail(email, t);
    if (success) setShowVerificationModal(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const success = await resetPassword(forgotPasswordEmail, lng, t);
    if (success) setShowForgotPasswordModal(false);
  };

  return (
    <div className="w-full p-2 sm:p-6" ref={formRef}>
      <h2 className="mb-8 text-2xl font-bold text-black text-center">
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
        signInWithGoogle={handleSignInWithGoogle}
        signInWithMicrosoft={handleSignInWithMicrosoft}
        loading={loading}
      />
      <div className="mt-6 text-center">
        <p>
          {t('no_account')}{' '}
          <Button
            type="link"
            href={`/${lng}/auth/signup`}
            className="text-primary text-base !p-0"
          >
            {t('create_account')}
          </Button>
        </p>
      </div>
      <VerificationModal
        t={t}
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        resendVerificationEmail={handleResendVerificationEmail}
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
    </div>
  );
};

export default SignIn;