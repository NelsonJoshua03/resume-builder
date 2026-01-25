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
      'firebase/storage'
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
          // Better chunk splitting
          if (id.includes('node_modules')) {
            // Split Firebase modules
            if (id.includes('firebase')) {
              if (id.includes('firebase/app')) return 'vendor-firebase-core'
              if (id.includes('firebase/firestore')) return 'vendor-firebase-firestore'
              if (id.includes('firebase/auth')) return 'vendor-firebase-auth'
              if (id.includes('firebase/analytics')) return 'vendor-firebase-analytics'
              if (id.includes('firebase/functions')) return 'vendor-firebase-functions'
              return 'vendor-firebase-other'
            }
            
            // Split React
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            
            // Split React Router
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            
            // Split UI libraries
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons'
            }
            
            // Split PDF/Image libraries
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'vendor-pdf'
            }
            
            // Split Markdown libraries
            if (id.includes('react-markdown') || id.includes('rehype') || id.includes('remark')) {
              return 'vendor-markdown'
            }
            
            // Split syntax highlighter
            if (id.includes('react-syntax-highlighter')) {
              return 'vendor-syntax'
            }
            
            // Split Tailwind/typography
            if (id.includes('@tailwindcss')) {
              return 'vendor-tailwind'
            }
            
            // Everything else
            return 'vendor-other'
          }
          
          // Split your own code by route/page
          if (id.includes('src/components/')) {
            if (id.includes('seo-pages/')) return 'seo-pages'
            if (id.includes('job-pages/')) return 'job-pages'
            if (id.includes('/admin/')) return 'admin-pages'
            if (id.includes('/blog/')) return 'blog-pages'
            return 'components'
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 500, // Lower warning limit to catch issues earlier
    cssCodeSplit: true,
    target: 'es2020',
    reportCompressedSize: true,
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