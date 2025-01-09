import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Ignorer le chemin de callback
    if (location.pathname === '/auth/callback') {
      return;
    }

    const allowedLanguages = ['fr', 'en'];
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Si le premier segment est une langue valide
    if (allowedLanguages.includes(pathSegments[0])) {
      // Mettre à jour la langue dans i18n
      i18n.changeLanguage(pathSegments[0]);
      
      // Vérifier si c'est la langue stockée
      const storedLang = localStorage.getItem('preferredLanguage');
      if (storedLang && storedLang !== pathSegments[0]) {
        // Remplacer la langue dans le chemin
        const newPath = `/${storedLang}/${pathSegments.slice(1).join('/')}`;
        localStorage.removeItem('preferredLanguage');
        navigate(newPath, { replace: true });
      }
      return;
    }

    // Si pas de langue dans l'URL
    const storedLang = localStorage.getItem('preferredLanguage');
    const userLang = navigator.language.split('-')[0];
    const defaultLang = storedLang || (allowedLanguages.includes(userLang) ? userLang : 'fr');
    
    // Mettre à jour la langue dans i18n
    i18n.changeLanguage(defaultLang);
    
    if (storedLang) {
      localStorage.removeItem('preferredLanguage');
    }

    // Construire le nouveau chemin avec la langue
    const newPath = `/${defaultLang}${location.pathname}`;
    navigate(newPath, { replace: true });
  }, [location.pathname, navigate, i18n]);

  return null;
};

export default LanguageRedirect; 