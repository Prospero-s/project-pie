import React, { useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';

const FloatingBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { changeLanguage, getCurrentLanguage } = useLanguage();

  const toggleBubble = () => setIsOpen(!isOpen);

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={toggleBubble}
        className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors"
      >
        {isOpen ? 'X' : getCurrentLanguage().toUpperCase()}
      </button>
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-xl p-4">
          <button
            onClick={() => handleLanguageChange('fr')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Français
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            English
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingBubble;
