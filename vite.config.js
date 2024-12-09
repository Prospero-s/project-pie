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
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    https: {
      key: './frankenphp/certs/tls.key',
      cert: './frankenphp/certs/tls.pem',
    },
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
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
