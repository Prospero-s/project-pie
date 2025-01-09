import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useUser } from '@/context/userContext';

const ProtectedRoute = ({ children, i18n }) => {
  const { user, loading } = useUser();
  const location = useLocation();
  const { lng } = useParams();

  if (loading) {
    return (
      <>
      </>
    );
  }

  if (!user) {
    return <Navigate to={`/${i18n.language}/auth/signin`} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;