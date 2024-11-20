import { defineConfig } from "vite";
import symfonyPlugin from "vite-plugin-symfony";
import path from "path";

/* if you're using React */
// import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    /* react(), // if you're using React */
    // react(),
    symfonyPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets/js"),
    },
  },
  server: {
    // // Dehors container
    // hmr: false,
    // // Dedans container
    watch: {
      usePolling: true,
    },
    // https: true,
    https: {
      key: './frankenphp/certs/tls.key',
      cert: './frankenphp/certs/tls.pem',
    },
    host: "0.0.0.0",
    port: 5173, // Choisir un port différent pour éviter les conflits
    strictPort: true, // Si le port est déjà occupé, échouer
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: "./assets/app.jsx",
      },
    },
  },
});
