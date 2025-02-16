import React from 'react';
import { Navigate } from 'react-router-dom';
import illustrationLogin from '@img/illustration/illustration-login-v1.png';
import logoProspero from '@img/logo/logo-icon-prospero-blue.svg';
import { useUser } from '@/context/userContext';
import FooterLayout from '@/components/common/layout/Footer';

const AuthLayout = ({ children, i18n }) => {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={`/${i18n.language}/dashboard`} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-white">
      <div className="w-full h-full lg:w-1/2 flex flex-col">
        <div className="px-8 py-6 lg:px-12">
          <div className="flex items-center gap-2">
            <img src={logoProspero} alt="Prospero Logo" className="h-8 w-8" />
            <span className="text-2xl font-semibold text-gray-900">
              Prospero
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
          <div className="max-w-sm w-full mx-auto">{children}</div>
        </div>
        <FooterLayout i18n={i18n} isDashboard={false} />
      </div>
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-50">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] aspect-[16/10] rounded-lg rounded-r-none shadow-xl overflow-hidden border-4 border-r-0 border-black">
          <img
            src={illustrationLogin}
            alt="Prospero Dashboard"
            className="w-full h-full object-cover object-left"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
