import React from 'react';
import illustrationLogin from '@img/illustration/illustration-login.webp';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-x-hidden">
      <div className="flex-1 lg:w-3/5">
        <img
          src={illustrationLogin}
          alt="Auth Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-2/5 flex items-center justify-center px-2 py-32 lg:px-0 lg:py-0">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;