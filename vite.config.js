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
    watch: {
      usePolling: true,
    },
    https: true,
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'tryprospero.fr',
      clientPort: 5173,
      protocol: 'https'
    },
    cors: true,
  },
  build: {
    rollupOptions: {
      input: {
        app: "./assets/app.jsx",
      },
    },
    manifest: true,
    outDir: 'public/build',
    assetsDir: '',
    emptyOutDir: true,
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
