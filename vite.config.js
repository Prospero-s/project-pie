// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import symfonyPlugin from "vite-plugin-symfony";
// import path from "path";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), symfonyPlugin(),],
//   root: '.',  // Répertoire d'entrée de Vite (par défaut, Vite s'attend à ce que le code source se trouve ici)
//   server: {
//     host: '0.0.0.0',  // Permet d'accepter toutes les connexions
//     port: 5173,        // Le port sur lequel Vite écoute
//     strictPort: true,
//     hmr: {
//       host: 'localhost',  // Utilise localhost pour Hot Module Replacement
//     },
//     watch: {
//       usePolling: true // Nécessaire pour le hot reload dans Docker
//     }
//   },
//   build: {
//     manifest: true,
//     outDir: 'public/build',  // Dossier de sortie pour les fichiers compilés (public/build est souvent utilisé dans Symfony)
//     rollupOptions: {
//       input: {
//           app: "./assets/app.js"
//       },
//     },
//     emptyOutDir: true
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "assets/js"),
//     },
//   },
// });

import { defineConfig } from "vite";
import symfonyPlugin from "vite-plugin-symfony";
import path from "path";

/* if you're using React */
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    /* react(), // if you're using React */
    react(),
    symfonyPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets/js"),
    },
  },
  root: './app',  // Répertoire d'entrée de Vite (par défaut, Vite s'attend à ce que le code source se trouve ici)
  server: {
    host: '0.0.0.0',  // Permet d'accepter toutes les connexions
    port: 5173,        // Le port sur lequel Vite écoute
    strictPort: true,
    hmr: {
      host: 'localhost',  // Utilise localhost pour Hot Module Replacement
    },
    watch: {
      usePolling: true // Nécessaire pour le hot reload dans Docker
    }
  },
  build: {
    manifest: true,
    outDir: 'public/build',
    rollupOptions: {
      input: {
        app: "./assets/main.jsx",
      },
    },
  },
});
