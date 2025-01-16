import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { signUpWithEmail } from '@/services/auth/awsAuthService';
import SignUpForm from '@/components/signup/SignUpForm';
import SignUpButton from '@/components/signup/SignUpButton';
import SignUpLink from '@/components/signup/SignUpLink';
import ConfirmationCodeModal from '@/components/signup/ConfirmationCodeModal';
import { confirmSignUp } from '@/services/auth/awsAuthService';

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

  const handleConfirmPasswordChange = (e) => {
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
      password === confirmPassword
    );
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setLoading(true);
      const success = await signUpWithEmail(email, password, fullName, t, navigate, lng);
      if (success) {
        setRegisteredEmail(email);
        setShowConfirmationModal(true);
      }
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    setLoading(true);
    await confirmSignUp(registeredEmail, verificationCode, t);
    setLoading(false);
    navigate(`/${lng}/signin`);
  };

  return (
    <>
      <div className="w-full p-2 sm:p-6" ref={formRef}>
        <h2 className="mb-8 text-2xl font-bold text-black text-center">
          {t('title')}
        </h2>
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
            setConfirmPassword={setConfirmPassword}
            passwordMatch={passwordMatch}
            handleConfirmPasswordChange={handleConfirmPasswordChange}
          />
          <SignUpButton t={t} isFormValid={isFormValid} />
          <SignUpLink t={t} lng={lng} />
        </form>
      </div>
      <ConfirmationCodeModal
        t={t}
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmCode}
        code={verificationCode}
        setCode={setVerificationCode}
        loading={loading}
      />
    </>
  );
};

export default SignUp;