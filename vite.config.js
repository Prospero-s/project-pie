import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import symfonyPlugin from "vite-plugin-symfony";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), symfonyPlugin(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets/js"),
    },
  },
  root: 'assets',  // Répertoire d'entrée de Vite (par défaut, Vite s'attend à ce que le code source se trouve ici)
  build: {
    outDir: 'public/build',  // Dossier de sortie pour les fichiers compilés (public/build est souvent utilisé dans Symfony)
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',  // Permet d'accepter toutes les connexions
    port: 5173,        // Le port sur lequel Vite écoute
    hmr: {
      host: 'localhost',  // Utilise localhost pour Hot Module Replacement
      protocol: 'ws', 
    },
  }
});
