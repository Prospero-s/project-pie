import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/userContext';
import { Auth } from 'aws-amplify';

const ProtectedRoute = ({ children, i18n }) => {
  const { user, loading } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await Auth.currentAuthenticatedUser();
        setIsChecking(false);
      } catch (error) {
        setIsChecking(false);
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error,
        );
      }
    };
    checkAuth();
  }, []);

  if (loading || isChecking) {
    return null;
  }

  if (!user) {
    const currentLang = i18n.language || 'fr';
    return (
      <Navigate
        to={`/${currentLang}/auth/signin`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
