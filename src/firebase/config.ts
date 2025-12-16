// src/firebase/config.ts - PRODUCTION READY
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
  
  // PRODUCTION: Only check GDPR consent, no localhost bypass
  return gdprConsent === 'accepted';
};

export const initializeFirebase = () => {
  // Don't reinitialize
  if (app) {
    return { app, firestore, analytics, auth, performance };
  }

  // PRODUCTION: Strict config check
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.error('Firebase configuration missing for production');
    return { app: null, firestore: null, analytics: null, auth: null, performance: null };
  }

  try {
    console.log('Initializing Firebase for production...');
    
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized');

    const hasConsent = checkGDPRConsent();

    // Initialize Firestore
    try {
      firestore = getFirestore(app);
      console.log('✅ Firestore initialized');
      
      // Enable offline persistence for better UX
      if (typeof window !== 'undefined' && hasConsent) {
        enableIndexedDbPersistence(firestore)
          .then(() => console.log('📱 Firestore persistence enabled'))
          .catch((err: any) => {
            if (err.code === 'failed-precondition') {
              console.warn('Multiple tabs open, persistence enabled in one tab only');
            } else if (err.code === 'unimplemented') {
              console.warn('Browser doesn\'t support persistence');
            } else {
              console.warn('Firestore persistence error:', err.code);
            }
          });
      }
    } catch (firestoreError) {
      console.error('Firestore initialization failed:', firestoreError);
    }

    // Initialize Analytics (only with consent)
    if (typeof window !== 'undefined' && app && hasConsent) {
      isSupported().then((supported) => {
        if (supported && app) {
          try {
            analytics = getAnalytics(app);
            console.log('✅ Analytics initialized');
            
            const userId = localStorage.getItem('firebase_user_id');
            if (userId && analytics) {
              setUserId(analytics, userId);
            }
            
            // Set production user properties
            setUserProperties(analytics, {
              environment: import.meta.env.VITE_ENV || 'production',
              app_version: '1.0.0',
              platform: 'web',
              domain: window.location.hostname
            });
          } catch (analyticsError) {
            console.error('Analytics initialization failed:', analyticsError);
          }
        }
      }).catch(() => {
        console.warn('Analytics not supported in this environment');
      });
      
      // Initialize Performance
      try {
        if (app) {
          performance = getPerformance(app);
          console.log('✅ Performance initialized');
        }
      } catch (perfError) {
        console.error('Performance initialization failed:', perfError);
      }
    } else if (typeof window !== 'undefined' && !hasConsent) {
      console.log('Analytics disabled - awaiting GDPR consent');
    }

    // Initialize Auth
    try {
      if (app) {
        auth = getAuth(app);
        console.log('✅ Auth initialized');
      }
    } catch (authError) {
      console.error('Auth initialization failed:', authError);
    }

    // Log Firebase status
    console.group('🔥 Firebase Status');
    console.log('App:', app ? '✅' : '❌');
    console.log('Firestore:', firestore ? '✅' : '❌');
    console.log('Analytics:', analytics ? '✅' : '❌');
    console.log('Auth:', auth ? '✅' : '❌');
    console.log('Performance:', performance ? '✅' : '❌');
    console.log('GDPR Consent:', hasConsent ? '✅ Accepted' : '❌ Not accepted');
    console.log('Environment:', import.meta.env.VITE_ENV || 'production');
    console.groupEnd();

  } catch (error) {
    console.error('Firebase initialization error:', error);
  }

  return { app, firestore, analytics, auth, performance };
};

// Get service instances
export const getFirestoreInstance = (): Firestore | null => {
  if (!firestore && app) {
    try {
      firestore = getFirestore(app);
    } catch (error) {
      console.error('Failed to get Firestore instance:', error);
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
      console.error('Failed to get Auth instance:', error);
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
      
      // Production logging - minimal
      if (import.meta.env.VITE_ENV === 'development') {
        console.log(`📈 Analytics event: ${eventName}`, params);
      }
    } catch (error) {
      console.error(`Failed to log analytics event ${eventName}:`, error);
    }
  } else {
    // Store in localStorage as fallback
    const fallbackKey = `firebase_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(fallbackKey, JSON.stringify({
      eventName,
      params,
      timestamp: new Date().toISOString(),
      isFallback: true
    }));
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

    console.log(`Syncing ${fallbackKeys.length} fallback events...`);
    
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
        console.warn(`Failed to sync event ${key}:`, error);
      }
    }
    
    console.log(`Synced ${successCount} events to Firestore`);
    return successCount;
  } catch (error) {
    console.error('Sync failed:', error);
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
    configPresent: !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined'),
    projectId: firebaseConfig.projectId,
    environment: import.meta.env.VITE_ENV || 'production',
    measurementId: firebaseConfig.measurementId
  };
};

// Reinitialize with consent (for GDPR consent changes)
export const reinitializeFirebaseWithConsent = () => {
  console.log('Reinitializing Firebase with GDPR consent...');
  
  // Don't reset app, just analytics
  analytics = null;
  
  if (app) {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.log('Analytics reinitialized after consent');
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

// Initialize on import (optional, but recommended)
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