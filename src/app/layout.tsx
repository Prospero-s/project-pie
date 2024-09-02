'use client';
import '@/css/satoshi.css';
import '@/css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'jsvectormap/dist/css/jsvectormap.css';

import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import Loader from '@/components/common/Loader';
import FloatingBubble from '@/components/FloatingBubble/FloatingBubble';
import { useLanguage } from '@/hooks/useLanguage';

import i18n from '../../i18n';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { changeLanguage, getCurrentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    initializeLanguage();
    setMounted(true);
    setTimeout(() => setLoading(false), 1000);
  }, [initializeLanguage]);

  useEffect(() => {
    setPageLoading(true);
    // Simuler un délai de chargement
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const initialLang = 'en';

  return (
    <html lang={mounted ? getCurrentLanguage() : initialLang}>
      <I18nextProvider i18n={i18n}>
        <body suppressHydrationWarning={true}>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {loading || pageLoading ? <Loader /> : children}
            {!loading && !pageLoading && <FloatingBubble />}
          </div>
        </body>
      </I18nextProvider>
    </html>
  );
}
