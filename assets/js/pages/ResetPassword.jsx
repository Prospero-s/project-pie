import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';
import { handleResetPassword } from '@/services/reset-password/resetPasswordService';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

const ResetPasswordPage = ({ i18n }) => {
  const { t } = useTranslation('resetPassword', { i18n });
  const lng = useParams().lng;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
    let accessToken = urlParams.get('access_token') || fragmentParams.get('access_token');
    let refreshToken = urlParams.get('refresh_token') || fragmentParams.get('refresh_token');
    if (!accessToken) {
      openNotificationWithIcon('error', t('error'), t('error_message'));
      navigate(`/${lng}/auth/signin`);
    } else {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    }

    return () => {
      if (accessToken && refreshToken) {
        navigate(`/${lng}/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}`);
      }
    };
  }, [navigate, t]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleResetPassword(password, confirmPassword, t, accessToken, refreshToken, lng);
  };

  return (
    <div className="w-full p-2 sm:p-6" ref={formRef}>
      <h2 className="mb-8 text-3xl font-bold text-black dark:text-white text-center">
        {t('title')}
      </h2>
      <ResetPasswordForm t={t} handleResetPassword={handleFormSubmit} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />
    </div>
  );
};

export default ResetPasswordPage;