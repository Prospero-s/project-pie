import '@/css/satoshi.css';
import '@/css/style.css';

import { dir } from 'i18next';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';
import { UserProvider } from '@/context/userContext';

import { useTranslation } from '../i18n';
import { fallbackLng, languages } from '../i18n/settings';

export async function generateStaticParams() {
  return languages.map(lng => ({ lng }));
}

export async function generateMetadata({
  params: { lng },
}: {
  params: {
    lng: string;
  };
}) {
  if (languages.indexOf(lng) < 0) lng = fallbackLng;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng);
  return {
    title: t('title'),
    description:
      'A playground to explore new Next.js 13/14 app directory features such as nested layouts, instant loading states, streaming, and component level data fetching.',
  };
}

export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: {
    lng: string;
  };
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body>
        <UserProvider>
          <DefaultLayout lng={lng}>{children}</DefaultLayout>
        </UserProvider>
      </body>
    </html>
  );
}
