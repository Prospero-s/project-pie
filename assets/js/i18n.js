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
import frAllCompanies from './locales/fr/allCompanies.json';
import enAllCompanies from './locales/en/allCompanies.json';
import frGroups from './locales/fr/groups.json';
import enGroups from './locales/en/groups.json';
import enGlobal from './locales/en/global.json';
import frGlobal from './locales/fr/global.json';
import enDashboard from './locales/en/dashboard.json';
import frDashboard from './locales/fr/dashboard.json';
import enSettings from './locales/en/settings.json';
import frSettings from './locales/fr/settings.json';
import enCharts from './locales/en/charts.json';
import frCharts from './locales/fr/charts.json';
import enDocuments from './locales/en/documents.json';
import frDocuments from './locales/fr/documents.json';
import enMetrics from './locales/en/metrics.json';
import frMetrics from './locales/fr/metrics.json';
import enExtractResult from './locales/en/extractresult.json';
import frExtractResult from './locales/fr/extractresult.json';
import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';
import enEventLog from './locales/en/eventLog.json';
import frEventLog from './locales/fr/eventLog.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      translation: {
        ...frGlobal,
        ...frMetrics,
        metrics: frMetrics,
      },
      signin: frSignIn,
      signup: frSignUp,
      menu: frMenu,
      investments: frInvestments,
      allCompanies: frAllCompanies,
      groups: frGroups,
      global: frGlobal,
      dashboard: frDashboard,
      settings: frSettings,
      charts: frCharts,
      documents: frDocuments,
      metrics: frMetrics,
      extractresult: frExtractResult,
      common: frCommon,
      eventLog: frEventLog,
    },
    en: {
      translation: {
        ...enGlobal,
        ...enMetrics,
        metrics: enMetrics,
      },
      signin: enSignIn,
      signup: enSignUp,
      menu: enMenu,
      investments: enInvestments,
      allCompanies: enAllCompanies,
      groups: enGroups,
      global: enGlobal,
      dashboard: enDashboard,
      settings: enSettings,
      charts: enCharts,
      documents: enDocuments,
      metrics: enMetrics,
      extractresult: enExtractResult,
      common: enCommon,
      eventLog: enEventLog,
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
  defaultNS: 'translation',
  ns: [
    'translation',
    'signin',
    'signup',
    'menu',
    'investments',
    'allCompanies',
    'groups',
    'global',
    'dashboard',
    'settings',
    'charts',
    'documents',
    'metrics',
    'common',
    'eventLog',
  ],
  initImmediate: true,
});

export default i18n;
