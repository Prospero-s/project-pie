import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importez vos fichiers de traduction JSON
import frSignIn from './locales/fr/signin.json';
import enSignIn from './locales/en/signin.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        signin: frSignIn,
      },
      en: {
        signin: enSignIn,
      },
    },
    lng: ['fr', 'en'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;