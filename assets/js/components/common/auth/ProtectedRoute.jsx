import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/userContext';

const ProtectedRoute = ({ children, i18n }) => {
  const { user } = useUser();
  const lng = i18n.language;

  if (!user) {
    return <Navigate to={`/${lng}/auth/signin`} replace />;
  }

  return children;
};

export default ProtectedRoute;