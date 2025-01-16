/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.{twig,html.twig}", "./assets/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'gray-light': '#E2E7EA',
        'navy': '#313847',
        'dark': '#131818',
        'blue-light': '#8AAAD9',
        'blue-primary': '#297CF7',
        'blue-secondary': '#297CF7',
        'blue-dark': '#1248A6',
      },
    },
  },
  plugins: [],
};