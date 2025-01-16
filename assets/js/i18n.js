import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importez vos fichiers de traduction JSON
import frSignIn from './locales/fr/signin.json';
import enSignIn from './locales/en/signin.json';
import frSignUp from './locales/fr/signup.json';
import enSignUp from './locales/en/signup.json';
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
        menu: frMenu,
        investments: frInvestments,
      },
      en: {
        signin: enSignIn,
        signup: enSignUp,
        menu: enMenu,
        investments: enInvestments,
      },
    },
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },
    initImmediate: true
  });

export default i18n;
