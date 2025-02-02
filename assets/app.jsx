/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./css/app.css";

import './js/lib/polyfills';
import { Amplify } from 'aws-amplify';
import { I18nextProvider } from 'react-i18next';
import i18n from "./js/i18n";

import { UserProvider } from "@/context/userContext";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Investments from "@/pages/Investments";
import AllCompanies from "@/pages/AllCompanies";
import AuthCallback from "@/pages/AuthCallback";
import AuthLayout from "@/components/common/layout/AuthLayout";
import ProtectedRoute from "@/components/common/auth/ProtectedRoute";
import AppLayout from "@/components/common/layout/AppLayout";
import GroupSelection from "@/pages/GroupSelection";
import GroupRedirect from "@/components/common/redirect/GroupRedirect";
import LanguageRedirect from "@/components/common/redirect/LanguageRedirect";
import { RedirectProvider } from "@/context/redirectContext";
import.meta.glob(["../img/**"]);

// Exposer navigate globalement
window._env_ = {
  navigate: (path) => navigate(path)
};

// Détecter la langue initiale à partir de l'URL ou des préférences
const detectInitialLanguage = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const allowedLanguages = ['fr', 'en'];
  
  if (pathSegments.length > 0 && allowedLanguages.includes(pathSegments[0])) {
    return pathSegments[0];
  }
  
  const storedLang = localStorage.getItem('preferredLanguage');
  const userLang = navigator.language.split('-')[0];
  return storedLang || (allowedLanguages.includes(userLang) ? userLang : 'fr');
};

// Définir la langue initiale
const initialLang = detectInitialLanguage();
i18n.changeLanguage(initialLang);

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_AWS_CLIENT_ID,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    oauth: {
      domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
      scope: ['openid', 'email', 'profile'],
      redirectSignIn: `${window.location.origin}/auth/callback`,
      redirectSignOut: `${window.location.origin}/${initialLang}/auth/signin`,
      responseType: 'code',
      clientId: import.meta.env.VITE_AWS_CLIENT_ID,
      providers: ['Google', 'Microsoft']
    },
    cookieStorage: {
      domain: 'localhost',
      path: '/',
      expires: 365,
      secure: true
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <UserProvider>
        <RedirectProvider>
          <Router>
            <LanguageRedirect />
            <GroupRedirect />
            <Routes>
              <Route
                path="/:lng/auth/*"
                element={
                  <AuthLayout i18n={i18n}>
                    <Routes>
                      <Route path="signin" element={<SignIn i18n={i18n} />} />
                      <Route path="signup" element={<SignUp i18n={i18n} />} />
                    </Routes>
                  </AuthLayout>
                }
              />
              <Route
                path="/:lng/group-selection"
                element={
                  <ProtectedRoute i18n={i18n}>
                    <GroupSelection i18n={i18n} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:lng/*"
                element={
                  <ProtectedRoute i18n={i18n}>
                    <AppLayout i18n={i18n}>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard i18n={i18n} />} />
                        <Route path="investments" element={<Investments i18n={i18n} />} />
                        <Route path="companies" element={<AllCompanies i18n={i18n} />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/auth/callback" element={<AuthCallback i18n={i18n} />} />
            </Routes>
          </Router>
        </RedirectProvider>
      </UserProvider>
    </I18nextProvider>
  </React.StrictMode>
);