import React, { useEffect, useState } from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';

const ToggleMode = () => {
  // État du thème, récupère depuis localStorage ou par défaut 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light',
  );

  // Fonction toggle thème
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    // Appliquer la classe thème sur body
    document.body.classList.remove('light', 'dark');
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.add('light');
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:ring-1 hover:ring-black/10 transition-all duration-300 cursor-pointer select-none dark:hover:bg-gray-700"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        type="button"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <MoonOutlined className="text-lg text-gray-600 dark:text-gray-300" />
        ) : (
          <SunOutlined className="text-lg text-yellow-500" />
        )}
      </button>
    </div>
  );
};

export default ToggleMode;
