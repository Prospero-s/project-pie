import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import {
  signUpWithEmail,
  resendVerificationEmail,
  confirmSignUp,
} from '@/services/auth/awsAuthService';
import SignUpForm from '@/components/signup/SignUpForm';
import SignUpButton from '@/components/signup/SignUpButton';
import SignUpLink from '@/components/signup/SignUpLink';
import ConfirmationCodeModal from '@/components/signup/ConfirmationCodeModal';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

const SignUp = ({ i18n }) => {
  const { t } = useTranslation('signup', { i18n });
  const lng = useParams().lng;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    fullName: '',
  });

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

  const validateForm = () => {
    let valid = true;
    const errors = {
      email: '',
      password: '',
      fullName: '',
    };

    // Vérification de l'email
    if (!email.trim()) {
      errors.email = t('email_required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('email_invalid');
      valid = false;
    }

    // Vérification du nom complet
    if (!fullName.trim()) {
      errors.fullName = t('fullname_required');
      valid = false;
    }

    // Vérification du mot de passe
    if (!password.trim()) {
      errors.password = t('password_required');
      valid = false;
    } else if (password.length < 8) {
      errors.password = t('password_length_error');
      valid = false;
    }

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      valid = false;
    } else {
      setPasswordMatch(true);
    }

    setFormErrors(errors);
    return valid;
  };

  const handleConfirmPasswordChange = e => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordMatch(confirmPass === password || confirmPass === '');
  };

  const isFormValid = () => {
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      password.length >= 8 &&
      confirmPassword.trim() !== '' &&
      fullName.trim() !== '' &&
      password === confirmPassword
    );
  };

  const handleSignUp = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, fullName, t);

      if (result.success) {
        setRegisteredEmail(email);
        setShowConfirmationModal(true);

        // Afficher la notification ici pour éviter les doublons
        openNotificationWithIcon(
          'success',
          t('registration_successful'),
          t('verification_email_sent'),
        );
      }
    } catch (err) {
      openNotificationWithIcon(
        'error',
        t('registration_error_title'),
        `${t('registration_error_message')} ${err.message || ''}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const result = await resendVerificationEmail(registeredEmail || email, t);
      if (result.success) {
        openNotificationWithIcon(
          'success',
          t('resend_success'),
          t('verification_code_resent'),
        );
      }
    } catch (err) {
      openNotificationWithIcon(
        'error',
        t('resend_error'),
        `${t('resend_error_message')} ${err.message || ''}`,
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!verificationCode.trim()) {
      openNotificationWithIcon(
        'warning',
        t('verification_warning'),
        t('verification_code_required'),
      );
      return;
    }

    setVerifyLoading(true);
    try {
      const result = await confirmSignUp(registeredEmail, verificationCode, t);

      if (result.success) {
        openNotificationWithIcon(
          'success',
          t('verification_successful'),
          t('account_verified'),
        );
        setShowConfirmationModal(false);
        navigate(`/${lng}/auth/signin`);
      }
    } catch (err) {
      openNotificationWithIcon(
        'error',
        t('verification_error'),
        `${t('verification_error_message')} ${err.message || ''}`,
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <>
      <div className="w-full" ref={formRef}>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            {t('title')}
          </h2>
          <h4 className="text-gray-600 text-md mb-6">{t('subtitle')}</h4>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <SignUpForm
            t={t}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            passwordMatch={passwordMatch}
            handleConfirmPasswordChange={handleConfirmPasswordChange}
            errors={formErrors}
          />
          <SignUpButton t={t} isFormValid={isFormValid} loading={loading} />
          <SignUpLink t={t} lng={lng} />
        </form>
      </div>
      <ConfirmationCodeModal
        t={t}
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmCode}
        onResend={handleResendCode}
        code={verificationCode}
        setCode={setVerificationCode}
        loading={verifyLoading}
        resendLoading={resendLoading}
      />
    </>
  );
};

export default SignUp;
