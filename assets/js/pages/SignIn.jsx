import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import SignInForm from '@/components/signin/SignInForm';
import SignInButtons from '@/components/signin/SignInButtons';
import VerificationModal from '@/components/signin/VerificationModal';
import ForgotPasswordModal from '@/components/signin/ForgotPasswordModal';
import gsap from 'gsap';
import { signInWithEmail, signInWithProvider, resendVerificationEmail, resetPassword, confirmSignUp, confirmResetPassword } from '@/services/auth/awsAuthService';
import { Button } from 'antd';

const SignIn = ({ i18n }) => {
  const { t } = useTranslation('signin', { i18n });
  const lng = useParams().lng;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
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
    await signInWithProvider('Google', lng, t);
    setLoading(false);
  };

  const handleSignInWithMicrosoft = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signInWithProvider('Microsoft', lng, t);
    setLoading(false);
  };

  const handleResendVerificationEmail = async () => {
    setLoading(true);
    await resendVerificationEmail(email, t);
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (email) => {
    return await resetPassword(email, t);
  };

  const handleConfirmCode = async () => {
    setLoading(true);
    const success = await confirmSignUp(email, verificationCode, t, navigate, lng);
    if (success) {
      await signInWithEmail(email, password, t, setUser, navigate, lng);
      setShowVerificationModal(false);
    }
    setLoading(false);
  };

  const handleConfirmPasswordReset = async (code, newPassword) => {
    return await confirmResetPassword(forgotPasswordEmail, code, newPassword, t);
  };

  const handleMicrosoftSignIn = () => {
    signInWithProvider('Microsoft', lng, t);
  };

  return (
    <div className="w-full" ref={formRef}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Se connecter
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Bienvenue ! Veuillez entrer vos informations.
      </p>
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
      <div className="mt-6">
        <Button
          onClick={() => signInWithProvider('Google', lng, t)}
          disabled={loading}
          className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuer avec Google
        </Button>
      </div>
      <div className="mt-2">
        <Button
          onClick={() => signInWithProvider('Microsoft', lng, t)}
          disabled={loading}
          className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
          Continuer avec Microsoft
        </Button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Button
            type="link"
            href={`/${lng}/auth/signup`}
            className="text-primary hover:text-primary/80 font-medium !p-0"
          >
            Créer un compte
          </Button>
        </p>
      </div>
      <VerificationModal
        t={t}
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        resendVerificationEmail={handleResendVerificationEmail}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        handleConfirmCode={handleConfirmCode}
        loading={loading}
      />
      <ForgotPasswordModal
        t={t}
        showForgotPasswordModal={showForgotPasswordModal}
        setShowForgotPasswordModal={setShowForgotPasswordModal}
        forgotPasswordEmail={forgotPasswordEmail}
        setForgotPasswordEmail={setForgotPasswordEmail}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
        handleConfirmPasswordReset={handleConfirmPasswordReset}
        loading={loading}
      />
    </div>
  );
};

export default SignIn;