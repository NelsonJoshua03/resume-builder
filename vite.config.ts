import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

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
            environment: mode
          }
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
          drop_debugger: true
        }
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
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
              return 'vendor-other';
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
      chunkSizeWarningLimit: 2000,
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