import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize React for production
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: [
      'firebase',
      'firebase/app',
      'firebase/firestore',
      'firebase/analytics',
      'firebase/auth',
      'firebase/functions',
      'firebase-admin'
    ],
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ]
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Simple chunk splitting
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('react')) {
              return 'vendor-react'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            return 'vendor'
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    target: 'es2020',
  },
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