import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import SignInForm from '@/components/signin/SignInForm';
import VerificationModal from '@/components/signin/VerificationModal';
import ForgotPasswordModal from '@/components/signin/ForgotPasswordModal';
import gsap from 'gsap';
import {
  signInWithEmail,
  signInWithProvider,
  resendVerificationEmail,
  resetPassword,
  confirmSignUp,
  confirmResetPassword,
} from '@/services/auth/awsAuthService';
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

  const handleSignIn = async e => {
    e.preventDefault();
    setLoading(true);
    const result = await signInWithEmail(
      email,
      password,
      t,
      setUser,
      navigate,
      lng,
    );
    setShowVerificationModal(result.showVerificationModal);

    // Stocker temporairement le mot de passe si l'utilisateur n'est pas confirmé
    if (result.showVerificationModal) {
      try {
        sessionStorage.setItem('temp_password', password);
      } catch (e) {
        console.error('Erreur lors du stockage temporaire du mot de passe:', e);
      }
    }

    setLoading(false);
  };

  const handleResendVerificationEmail = async () => {
    setLoading(true);
    const result = await resendVerificationEmail(email, t);
    if (result.success) {
      // La notification est déjà gérée dans le service
    }
    setLoading(false);
  };

  const handleForgotPassword = async e => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async email => {
    const result = await resetPassword(email, t);
    return result.success;
  };

  const handleConfirmCode = async () => {
    setLoading(true);

    // Récupérer le mot de passe temporaire
    let tempPassword = '';
    try {
      tempPassword = sessionStorage.getItem('temp_password') || '';
      // Ne pas supprimer le mot de passe maintenant au cas où il y aurait une erreur
    } catch (e) {
      console.error(
        'Erreur lors de la récupération du mot de passe temporaire:',
        e,
      );
    }

    try {
      const result = await confirmSignUp(email, verificationCode, t);

      if (result.success) {
        // Supprimer le mot de passe temporaire une fois la vérification réussie
        try {
          sessionStorage.removeItem('temp_password');
        } catch (e) {
          console.error(
            'Erreur lors de la suppression du mot de passe temporaire:',
            e,
          );
        }

        // Si on a un mot de passe temporaire, on tente de se connecter
        if (tempPassword) {
          console.error('Tentative de connexion après confirmation...');
          const loginResult = await signInWithEmail(
            email,
            tempPassword,
            t,
            setUser,
            navigate,
            lng,
          );

          if (!loginResult.showVerificationModal) {
            // La connexion a réussi
            setShowVerificationModal(false);
          } else {
            // Si la connexion a échoué, rediriger vers la page de connexion
            console.error('Échec de connexion automatique après confirmation');
            navigate(`/${lng}/auth/signin`);
          }
        } else {
          // Sinon on redirige simplement vers la page de connexion avec un message de succès
          navigate(`/${lng}/auth/signin`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation du code:', error);
      // La notification est déjà gérée dans le service
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (code, newPassword) => {
    const result = await confirmResetPassword(
      forgotPasswordEmail,
      code,
      newPassword,
      t,
    );
    return result.success;
  };

  return (
    <div className="w-full" ref={formRef}>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          {t('login_title')}
        </h2>
        <h3 className="font-degarism text-gray-600 text-lg mb-6">
          {t('login_subtitle')}
        </h3>
      </div>
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
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {t('continue_with_google')}
        </Button>
      </div>
      <div className="mt-2">
        <Button
          onClick={() => signInWithProvider('Microsoft', lng, t)}
          disabled={loading}
          className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/microsoft.svg"
            alt="Microsoft"
            className="w-5 h-5"
          />
          {t('continue_with_microsoft')}
        </Button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('no_account')}{' '}
          <Button
            type="link"
            onClick={() => navigate(`/${lng}/auth/signup`)}
            className="text-primary hover:text-primary/80 font-medium !p-0"
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
