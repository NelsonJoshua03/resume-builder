// src/firebase/config.ts - PRODUCTION READY (UPDATED)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getAnalytics, 
  Analytics,
  logEvent,
  setUserId,
  setUserProperties,
  isSupported 
} from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getPerformance } from 'firebase/performance';

// Helper to safely get environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Check import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value && value !== 'undefined') return value;
  }
  
  // Check process.env (Node.js/SSR)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value && value !== 'undefined') return value;
  }
  
  // Check window._env_ (injected in production)
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  return defaultValue;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase only once
let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let performance: any = null;

// Type-safe GDPR consent check
const checkGDPRConsent = (): boolean => {
  const gdprConsent = localStorage.getItem('gdpr_consent');
  return gdprConsent === 'accepted';
};

export const initializeFirebase = () => {
  // Don't reinitialize
  if (app) {
    return { app, firestore, analytics, auth, performance };
  }

  // Check if any Firebase config is provided
  const hasAnyConfig = Object.values(firebaseConfig).some(value => 
    value && value !== 'undefined' && value.trim() !== ''
  );

  if (!hasAnyConfig) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase configuration missing. Analytics will be disabled.');
    }
    
    return { app: null, firestore: null, analytics: null, auth: null, performance: null };
  }

  // Validate required config
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn('Firebase API Key missing. Analytics will be limited.');
  }

  try {
    // Minimal logging in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing Firebase...');
    }
    
    app = initializeApp(firebaseConfig);

    const hasConsent = checkGDPRConsent();

    // Initialize Firestore
    try {
      firestore = getFirestore(app);
      
      // Enable offline persistence for better UX
      if (typeof window !== 'undefined' && hasConsent) {
        enableIndexedDbPersistence(firestore)
          .catch((err: any) => {
            // Silent fail in production
            if (process.env.NODE_ENV === 'development') {
              if (err.code === 'failed-precondition') {
                console.warn('Multiple tabs open, persistence enabled in one tab only');
              } else if (err.code === 'unimplemented') {
                console.warn('Browser doesn\'t support persistence');
              }
            }
          });
      }
    } catch (firestoreError) {
      // Silent fail
    }

    // Initialize Analytics (only with consent)
    if (typeof window !== 'undefined' && app && hasConsent) {
      isSupported().then((supported) => {
        if (supported && app) {
          try {
            analytics = getAnalytics(app);
            
            const userId = localStorage.getItem('firebase_user_id');
            if (userId && analytics) {
              setUserId(analytics, userId);
            }
            
            // Set production user properties
            setUserProperties(analytics, {
              environment: getEnvVar('VITE_ENV', 'production'),
              app_version: '1.0.0',
              platform: 'web',
              domain: window.location.hostname
            });
          } catch (analyticsError) {
            // Silent fail
          }
        }
      }).catch(() => {
        // Silent fail
      });
      
      // Initialize Performance
      try {
        if (app) {
          performance = getPerformance(app);
        }
      } catch (perfError) {
        // Silent fail
      }
    }

    // Initialize Auth
    try {
      if (app) {
        auth = getAuth(app);
      }
    } catch (authError) {
      // Silent fail
    }

    // Minimal status log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Firebase initialized successfully');
    }

  } catch (error) {
    // Silent fail in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Firebase initialization error:', error);
    }
  }

  return { app, firestore, analytics, auth, performance };
};

// Get service instances
export const getFirestoreInstance = (): Firestore | null => {
  if (!firestore && app) {
    try {
      firestore = getFirestore(app);
    } catch (error) {
      // Silent fail
    }
  }
  return firestore;
};

export const getAnalyticsInstance = (): Analytics | null => {
  if (!analytics) {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && !analytics && app) {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      });
    }
  }
  return analytics;
};

export const getAuthInstance = (): Auth | null => {
  if (!auth && app) {
    try {
      auth = getAuth(app);
    } catch (error) {
      // Silent fail
    }
  }
  return auth;
};

export const getPerformanceInstance = () => performance;

// Helper to log events
export const logAnalyticsEvent = (eventName: string, params?: any): void => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  const essentialEvents = ['page_view', 'error', 'consent_given', 'user_identified'];
  const isEssential = essentialEvents.includes(eventName);
  
  if (!hasConsent && !isEssential) {
    return;
  }

  const analytics = getAnalyticsInstance();
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      // Silent fail
    }
  } else {
    // Store in localStorage as fallback
    try {
      const fallbackKey = `firebase_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(fallbackKey, JSON.stringify({
        eventName,
        params,
        timestamp: new Date().toISOString(),
        isFallback: true
      }));
    } catch (error) {
      // Silent fail
    }
  }
};

// Sync localStorage fallback events to Firestore
export const syncFallbackEvents = async (): Promise<number> => {
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return 0;
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const fallbackKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('firebase_event_') || key.startsWith('fb_fallback_'))) {
        fallbackKeys.push(key);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Syncing ${fallbackKeys.length} fallback events...`);
    }
    
    let successCount = 0;
    for (const key of fallbackKeys) {
      try {
        const eventStr = localStorage.getItem(key);
        if (eventStr) {
          const event = JSON.parse(eventStr);
          
          await addDoc(collection(firestore, 'events'), {
            ...event,
            syncedAt: serverTimestamp(),
            originalKey: key
          });
          
          localStorage.removeItem(key);
          successCount++;
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    if (process.env.NODE_ENV === 'development' && successCount > 0) {
      console.log(`Synced ${successCount} events to Firestore`);
    }
    return successCount;
  } catch (error) {
    // Silent fail
    return 0;
  }
};

// Get Firebase status for debugging
export const getFirebaseStatus = () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  return {
    app: !!app,
    firestore: !!firestore,
    analytics: !!analytics,
    auth: !!auth,
    performance: !!performance,
    gdprConsent: hasConsent,
    configPresent: Object.values(firebaseConfig).some(v => v && v !== 'undefined'),
    projectId: firebaseConfig.projectId,
    environment: getEnvVar('VITE_ENV', 'production'),
    measurementId: firebaseConfig.measurementId
  };
};

// Reinitialize with consent (for GDPR consent changes)
export const reinitializeFirebaseWithConsent = () => {
  // Don't reset app, just analytics
  analytics = null;
  
  if (app) {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      });
    }
  }
  
  return { app, firestore, analytics, auth, performance };
};

export const isFirebaseReady = (): boolean => {
  return !!app;
};

// Auto-sync fallback events when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (localStorage.getItem('gdpr_consent') === 'accepted') {
      syncFallbackEvents();
    }
  });

  // Auto-sync every 5 minutes when online
  setInterval(() => {
    if (navigator.onLine && localStorage.getItem('gdpr_consent') === 'accepted') {
      syncFallbackEvents();
    }
  }, 300000); // 5 minutes
}

// Initialize on import
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure DOM is ready
  setTimeout(() => {
    initializeFirebase();
    
    // Try to sync any pending events after initialization
    if (localStorage.getItem('gdpr_consent') === 'accepted') {
      setTimeout(() => {
        syncFallbackEvents();
      }, 5000);
    }
  }, 1000);
}

// Add global type declaration
declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

export default {
  initializeFirebase,
  getFirestoreInstance,
  getAnalyticsInstance,
  getAuthInstance,
  getPerformanceInstance,
  logAnalyticsEvent,
  syncFallbackEvents,
  getFirebaseStatus,
  reinitializeFirebaseWithConsent,
  isFirebaseReady
};