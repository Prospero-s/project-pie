/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./templates/**/*.{twig,html.twig}', './assets/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        degarism: ['Degarism', 'sans-serif'],
      },
      backgroundColor: {
        gray_100: 'var(--gray-100-color)',
        white_100: 'var(--white-color)',
        gray_900: 'var(--gray-900-color)',
        gray_600: 'var(--gray-600-color)',
        success_500: 'var(--success-500-color)',
        success_700: 'var(--success-700-color)',
        error_700: 'var(--error-700-color)',
      },
      textColor: {
        gray_100: 'var(--gray-100-color)',
        white_100: 'var(--white-color)',
        gray_900: 'var(--gray-900-color)',
        gray_600: 'var(--gray-600-color)',
        success_500: 'var(--success-500-color)',
        success_700: 'var(--success-700-color)',
        error_700: 'var(--error-700-color)',
      },
      colors: {
        'gray-light': '#E2E7EA',
        navy: '#313847',
        dark: '#131818',
        'blue-light': '#8AAAD9',
        'blue-primary': '#297CF7',
        'blue-secondary': '#297CF7',
        'blue-dark': '#1248A6',
      },
    },
  },
  plugins: [],
};
