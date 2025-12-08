// vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_API_URL: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_FIREBASE: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_ANALYTICS_TRACK_RESUME_DOWNLOADS: string
  readonly VITE_ANALYTICS_TRACK_JOB_APPLICATIONS: string
  readonly VITE_ANALYTICS_TRACK_USER_FLOW: string
  readonly VITE_ANALYTICS_LOCAL_STORAGE_BACKUP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Google Analytics
interface Window {
  dataLayer: any[]
  gtag: (...args: any[]) => void
  pageLoadStart?: number
}

// For Vite HTML plugin
declare const __APP_ENV__: string
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string