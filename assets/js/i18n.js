import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importez vos fichiers de traduction JSON
import frSignIn from './locales/fr/signin.json';
import enSignIn from './locales/en/signin.json';
import frSignUp from './locales/fr/signup.json';
import enSignUp from './locales/en/signup.json';
import frResetPassword from './locales/fr/reset-password.json';
import enResetPassword from './locales/en/reset-password.json';
import frMenu from './locales/fr/menu.json';
import enMenu from './locales/en/menu.json';
import frInvestments from './locales/fr/investments.json';
import enInvestments from './locales/en/investments.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        signin: frSignIn,
        signup: frSignUp,
        resetPassword: frResetPassword,
        menu: frMenu,
        investments: frInvestments,
      },
      en: {
        signin: enSignIn,
        signup: enSignUp,
        resetPassword: enResetPassword,
        menu: enMenu,
        investments: enInvestments,
      },
    },
    lng: ['fr', 'en'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;