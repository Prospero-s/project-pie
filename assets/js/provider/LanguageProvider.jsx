import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LanguageProvider = ({ children, i18n }) => {
  const { lng } = useParams();

  useEffect(() => {
    console.log('lng', lng);
    console.log('i18n', i18n);
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  return <>{children}</>;
};

export default LanguageProvider;