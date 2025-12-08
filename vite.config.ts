import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  // Note: Don't load NODE_ENV from .env files - let Vite handle it
  const env = loadEnv(mode, process.cwd(), 'VITE_'); // Only load VITE_ prefixed vars
  
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      react(),
      
      // HTML plugin with environment variable injection
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
      
      // PWA Support
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
        }
      }),
      
      // Compression for production
      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false
      }),
      
      // Bundle visualizer (only in development)
      isDevelopment && visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: false
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@types': '/src/types',
        '@assets': '/src/assets'
      }
    },
    
    // Optimization configuration
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/firestore',
        'firebase/auth',
        'firebase/analytics',
        'firebase/storage',
        'jspdf',
        'html2canvas',
        'lucide-react'
      ],
      exclude: ['pdfjs-dist'],
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true
        }
      }
    },
    
    // Build configuration
    build: {
      target: 'es2020',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      cssMinify: isProduction,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info']
        },
        format: {
          comments: false
        },
        mangle: {
          safari10: true
        }
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split vendor chunks for better caching
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('react')) {
                return 'vendor-react';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              return 'vendor';
            }
            
            // Split our own components
            if (id.includes('src/components/ResumeBuilder')) {
              return 'app-resume-builder';
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
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false,
      emptyOutDir: true
    },
    
    // Server configuration
    server: {
      port: 3001,
      host: true,
      open: !isProduction,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      hmr: {
        overlay: true
      }
    },
    
    // Preview configuration (for production build preview)
    preview: {
      port: 3002,
      host: true,
      cors: true,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    },
    
    // Environment variable definitions
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
      __APP_ENV__: JSON.stringify(mode),
      // Set NODE_ENV properly - this is the correct way
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction ? '[hash:base64:8]' : '[name]__[local]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    // Logging configuration
    logLevel: isProduction ? 'warn' : 'info',
    clearScreen: false
  };
});