/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import symfonyPlugin from 'vite-plugin-symfony';
import path from 'path';

/* if you're using React */
// import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    /* react(), // if you're using React */
    // react(),
    symfonyPlugin(),
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'assets/js'),
      '@img': path.resolve(__dirname, 'assets/img'),
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    https:
      process.env.APP_ENV === 'dev'
        ? {
            key: './frankenphp/certs/tls.key',
            cert: './frankenphp/certs/tls.pem',
          }
        : false,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: process.env.APP_ENV === 'prod' ? 'tryprospero.fr' : 'localhost',
    },
    proxy: {
      '/api/pdf-processor': {
        target: 'http://pdf_processor:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/pdf-processor/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: './assets/app.jsx',
      },
    },
  },
  define: {
    global: 'window',
    'process.env': process.env,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
