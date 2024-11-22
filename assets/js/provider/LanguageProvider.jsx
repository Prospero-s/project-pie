import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LanguageProvider = ({ children, i18n }) => {
  const { lng } = useParams();

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return <>{children}</>;
};

export default LanguageProvider;