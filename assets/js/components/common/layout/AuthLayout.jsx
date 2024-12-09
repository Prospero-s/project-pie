import React from 'react';
import { Navigate } from 'react-router-dom';
import illustrationLogin from '@img/illustration/illustration-login.webp';
import { useUser } from '@/context/userContext';

const AuthLayout = ({ children, i18n }) => {
  const { user } = useUser();

  if (user) {
    return <Navigate to={`/${i18n.language}/dashboard`} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-x-hidden">
      <div className="hidden lg:block lg:w-3/5">
        <img
          src={illustrationLogin}
          alt="Auth Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full h-full lg:w-2/5 flex items-center justify-center px-2 py-10 lg:px-0 lg:py-0">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;