import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { signUpWithEmail } from '@/services/signup/authService';
import SignUpForm from '@/components/signup/SignUpForm';
import SignUpButton from '@/components/signup/SignUpButton';
import SignUpLink from '@/components/signup/SignUpLink';

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
      await signUpWithEmail(email, password, fullName, t, navigate);
    }
  };

  return (
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
  );
};

export default SignUp;