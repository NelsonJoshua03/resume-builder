import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // CRITICAL: Exclude Firebase from optimization
  optimizeDeps: {
    exclude: ['firebase', 'firebase/app', 'firebase/firestore', 'firebase/analytics', 'firebase/auth']
  },
  build: {
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep for debugging
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/analytics', 'firebase/auth'],
          'chart-vendor': ['recharts'],
          'pdf-vendor': ['html2canvas', 'jspdf']
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
  server: {
    port: 3001,
    host: true,
    open: true,
    cors: true
  },
  preview: {
    port: 3001,
    host: true,
  }
})