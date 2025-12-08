import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      react(),
      
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: 'CareerCraft.in - Free ATS Resume Builder & Job Portal',
            description: 'Create professional ATS-optimized resumes for Indian job market. Find latest job openings in India.',
            keywords: 'resume builder India, ATS resume maker, job portal India, Indian job search',
            gaMeasurementId: env.VITE_GA_MEASUREMENT_ID || 'G-WSKZJDJW77',
            firebaseMeasurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WSKZJDJW77',
            googleAdsenseClient: env.VITE_GOOGLE_ADSENSE_CLIENT || 'ca-pub-7970100235833186',
            environment: mode
          }
        }
      }),
      
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'CareerCraft India',
          short_name: 'CareerCraft',
          description: 'India\'s premier career platform - Free ATS-friendly resume builder and job portal',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/logos/careercraft-logo-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/logos/careercraft-logo-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB limit instead of 2 MB
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot,json}'
          ],
          // Don't cache source maps or compressed files
          globIgnores: ['**/*.map', '**/*.gz']
        },
        // Disable precaching for large files by using a filter
        injectManifest: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
        }
      })
    ],
    
    build: {
      target: 'es2020',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      cssMinify: isProduction,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2 // More aggressive minification
        },
        mangle: true
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Better chunk splitting to reduce main bundle size
            if (id.includes('node_modules')) {
              // Separate large libraries
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('react') && !id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('react-dom')) {
                return 'vendor-react-dom';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('@dnd-kit')) {
                return 'vendor-dnd';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
                return 'vendor-markdown';
              }
              if (id.includes('react-router-dom')) {
                return 'vendor-router';
              }
              if (id.includes('axios')) {
                return 'vendor-axios';
              }
              if (id.includes('react-hook-form') || id.includes('zod')) {
                return 'vendor-forms';
              }
              // Group remaining node_modules
              return 'vendor-other';
            }
            
            // Split our own code
            if (id.includes('src/components/ResumeBuilder')) {
              return 'app-resume';
            }
            if (id.includes('src/components/Blog')) {
              return 'app-blog';
            }
            if (id.includes('src/components/PDF')) {
              return 'app-pdf';
            }
            if (id.includes('src/components/Analytics')) {
              return 'app-analytics';
            }
          },
          chunkFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      chunkSizeWarningLimit: 2000, // Increased from 1500 to 2000
      reportCompressedSize: false,
      emptyOutDir: true
    },
    
    server: {
      port: 3001,
      host: true,
      open: !isProduction,
      cors: true
    },
    
    preview: {
      port: 3002,
      host: true,
      cors: true
    },
    
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
      __APP_ENV__: JSON.stringify(mode)
    }
  };
});