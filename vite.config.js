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
  css: {
    postcss: "./postcss.config.cjs",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets/js"),
      "@img": path.resolve(__dirname, "assets/img"),
      buffer: 'buffer',
      process: 'process/browser',
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
    https: process.env.NODE_ENV === 'production' ? false : {
      key: './frankenphp/certs/tls.key',
      cert: './frankenphp/certs/tls.pem',
    },
    host: "0.0.0.0",
    port: 5173, // Choisir un port différent pour éviter les conflits
    strictPort: true, // Si le port est déjà occupé, échouer
    hmr: {
      host: process.env.NODE_ENV === 'production' ? 'ec2-54-234-153-106.compute-1.amazonaws.com' : 'localhost',
      protocol: process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: "./assets/app.jsx",
      },
    },
  },
  define: {
    global: 'window',
    'process.env': process.env
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
});
