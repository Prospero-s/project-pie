import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { signUpWithEmail } from '@/services/signup/authService';
import illustrationLogin from '../../img/illustration/illustration-login.webp';
import SignUpForm from '@/components/signup/SignUpForm';
import SignUpButton from '@/components/signup/SignUpButton';
import SignUpLink from '@/components/signup/SignUpLink';

const SignUp = ({ i18n }) => {
  const { t } = useTranslation('signup', { i18n });
  const { lng } = useParams();
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
    <div className="flex flex-col xl:flex-row h-screen w-screen overflow-x-hidden">
      <div className="w-full lg:w-3/5 h-1/2 lg:h-full flex-initial lg:flex-none">
        <img
          src={illustrationLogin}
          alt="SignIn"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-2/5 h-full flex items-center justify-center flex-1 lg:flex-none px-8 lg:px-0 py-10 lg:py-0">
        <div
          className="w-full lg:w-2/3 p-4 lg:p-8"
          ref={formRef}
        >
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
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
      </div>
    </div>
  );
};

export default SignUp;