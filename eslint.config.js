import js from "@eslint/js";

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: true,
        document: true,
        console: true,
        module: true,
        require: true,
      },
    },
    files: ["assets/js/**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Basic rules
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-unused-vars": "warn",
      "no-console": "warn",
      
      // Add more rules as needed
    },
  },
]; 