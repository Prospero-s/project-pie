import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (lang: string) => {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    },
    [i18n],
  );

  const getCurrentLanguage = useCallback(() => i18n.language, [i18n]);

  return { changeLanguage, getCurrentLanguage };
};
