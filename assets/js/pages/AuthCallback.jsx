import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import { useTranslation } from 'react-i18next';
import { handleAuthCallback } from '@/services/auth/authCallbackService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { i18n } = useTranslation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleAuthCallback(setUser, navigate, i18n.language);
      } catch (error) {
        console.error(
          "Erreur lors du traitement du callback d'authentification:",
          error,
        );
        navigate(`/${i18n.language}/auth/signin`, { replace: true });
      }
    };

    processCallback();
  }, [navigate, setUser, i18n.language]);

  return null;
};

export default AuthCallback;
