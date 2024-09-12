'use client';

import '@/css/satoshi.css';
import '@/css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'jsvectormap/dist/css/jsvectormap.css';

import React from 'react';
import { I18nextProvider } from 'react-i18next';

import FloatingBubble from '@/components/FloatingBubble/FloatingBubble';
import { LoadingProvider, useLoading } from '@/hooks/LoadingContext';
import RouteGuard from '@/hooks/RouteGuard';
import { AuthProvider } from '@/hooks/useAuth';

import i18n from '../../i18n';

const RootLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useLoading();

  return (
    <AuthProvider>
      <RouteGuard>
        <I18nextProvider i18n={i18n}>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {!loading && children}
            {!loading && <FloatingBubble />}
          </div>
        </I18nextProvider>
      </RouteGuard>
    </AuthProvider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </LoadingProvider>
      </body>
    </html>
  );
}
