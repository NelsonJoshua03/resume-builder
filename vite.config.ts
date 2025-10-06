import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({ 
      hostname: 'https://resumecvforge.netlify.app',
      // Optional: Add more specific configurations if needed
      // dynamicRoutes: ['/'], // If you have multiple routes, add them here
      // generateRobotsTxt: true, // Enabled by default
      // changefreq: 'weekly', // Default change frequency
      // priority: 1.0, // Default priority
    }),
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
    // Ensure public files are copied (this is default behavior)
    copyPublicDir: true,
    // Optional: Optimize build size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  publicDir: 'public',
  // Updated Server configuration for development
  server: {
    port: 3001, // Changed from 3000 to 3001 to match what Vite is actually using
    host: true, // Allow external access if needed
    open: true, // Automatically open browser when running dev server
  },
  // Optional: Preview configuration (for 'npm run preview')
  preview: {
    port: 3001,
    host: true,
  }
})