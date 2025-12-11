import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  build: {
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['html2canvas', 'jspdf']
        }
      }
    },
    // IMPORTANT: This ensures SPA fallback works
    outDir: 'dist',
  },
  publicDir: 'public',
  server: {
    port: 3001,
    host: true,
    open: true,
    // IMPORTANT: Enable SPA routing in development
    historyApiFallback: true,
  },
  preview: {
    port: 3001,
    host: true,
    // IMPORTANT: Enable SPA routing in preview mode
    historyApiFallback: true,
  }
})