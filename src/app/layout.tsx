'use client';
import '@/css/satoshi.css';
import '@/css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'jsvectormap/dist/css/jsvectormap.css';

import React, { useCallback, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import Loader from '@/components/common/Loader';
import FloatingBubble from '@/components/FloatingBubble/FloatingBubble';
import { LoadingProvider, useLoading } from '@/hooks/LoadingContext'; // Assurez-vous que l'import est correct
import { AuthProvider } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

import i18n from '../../i18n';

const RootLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { loading, setLoading } = useLoading(); // Utilisation correcte du hook
  const { changeLanguage, getCurrentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const initializeLanguage = useCallback(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    const userLanguage = navigator.language.split('-')[0];
    const supportedLanguages = ['fr', 'en'];

    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      changeLanguage(savedLanguage);
    } else if (supportedLanguages.includes(userLanguage)) {
      changeLanguage(userLanguage);
    } else {
      changeLanguage('en');
    }
  }, [changeLanguage]);

  useEffect(() => {
    setLoading(true);
    initializeLanguage();
    setMounted(true);
    setTimeout(() => setLoading(false), 1000);
  }, [initializeLanguage, setLoading]);

  useEffect(() => {
    if (window.location.pathname.includes('/dashboard')) {
      setLoading(false);
    }
  }, [setLoading]);

  const initialLang = 'en';

  return (
    <html lang={mounted ? getCurrentLanguage() : initialLang}>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <body suppressHydrationWarning={true}>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {loading ? <Loader /> : children}
              {!loading && mounted && <FloatingBubble />}
            </div>
          </body>
        </I18nextProvider>
      </AuthProvider>
    </html>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoadingProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </LoadingProvider>
  );
}
