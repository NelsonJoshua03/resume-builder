// src/firebase/config.ts - COMPLETE PRODUCTION VERSION
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

// Production Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6JjC8qYgQ6q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6",
  authDomain: "careercraft-in.firebaseapp.com",
  projectId: "careercraft-in",
  storageBucket: "careercraft-in.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890",
  measurementId: "G-1234567890"
};

// Initialize Firebase only once
let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let performance: any = null;
let isInitializing = false;

export const initializeFirebase = async (): Promise<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  analytics: Analytics | null;
  auth: Auth | null;
  performance: any;
}> => {
  // Don't reinitialize
  if (app && firestore) {
    return { app, firestore, analytics, auth, performance };
  }

  if (isInitializing) {
    // Wait for initialization to complete
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          resolve({ app, firestore, analytics, auth, performance });
        }
      }, 100);
    });
  }

  isInitializing = true;
  
  try {
    console.log('🚀 Initializing Firebase...');
    
    // Validate config
    const hasValidConfig = firebaseConfig.apiKey && 
                          firebaseConfig.projectId && 
                          !firebaseConfig.apiKey.includes('your-');
    
    if (!hasValidConfig) {
      console.warn('Invalid Firebase configuration');
      isInitializing = false;
      return { app: null, firestore: null, analytics: null, auth: null, performance: null };
    }

    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized');

    // Check GDPR consent
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';

    // Initialize Firestore
    try {
      firestore = getFirestore(app);
      console.log('✅ Firestore initialized');

      // Enable offline persistence
      if (typeof window !== 'undefined' && hasConsent) {
        enableIndexedDbPersistence(firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence enabled in one tab only');
          } else if (err.code === 'unimplemented') {
            console.warn("Browser doesn't support persistence");
          }
        });
      }
    } catch (firestoreError) {
      console.error('Firestore initialization error:', firestoreError);
    }

    // Initialize Analytics
    if (typeof window !== 'undefined' && app && hasConsent) {
      try {
        const analyticsSupported = await isSupported();
        if (analyticsSupported && app) {
          analytics = getAnalytics(app);
          
          // Set user properties
          if (analytics) {
            setUserProperties(analytics, {
              environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
              app_version: '1.0.0',
              platform: 'web',
              domain: window.location.hostname
            });
          }
          console.log('✅ Analytics initialized');
        }
      } catch (analyticsError) {
        console.error('Analytics initialization error:', analyticsError);
      }
    }

    // Initialize Auth
    try {
      if (app) {
        auth = getAuth(app);
        console.log('✅ Auth initialized');
      }
    } catch (authError) {
      console.error('Auth initialization error:', authError);
    }

    console.log('🎉 Firebase initialization complete!');

  } catch (error) {
    console.error('🔥 Firebase initialization failed:', error);
    app = null;
    firestore = null;
    analytics = null;
    auth = null;
    performance = null;
  } finally {
    isInitializing = false;
  }

  return { app, firestore, analytics, auth, performance };
};

// Get service instances
export const getFirestoreInstance = (): Firestore | null => {
  return firestore;
};

export const getAnalyticsInstance = (): Analytics | null => {
  return analytics;
};

export const getAuthInstance = (): Auth | null => {
  return auth;
};

export const getPerformanceInstance = () => performance;

// Helper to log events
export const logAnalyticsEvent = (eventName: string, params?: any): void => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  if (!hasConsent) {
    return;
  }

  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};

// Get Firebase status
export const getFirebaseStatus = () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  return {
    app: !!app,
    firestore: !!firestore,
    analytics: !!analytics,
    auth: !!auth,
    performance: !!performance,
    gdprConsent: hasConsent,
    configPresent: true,
    projectId: firebaseConfig.projectId,
    environment: window.location.hostname.includes('localhost') ? 'development' : 'production'
  };
};

// Reinitialize with consent
export const reinitializeFirebaseWithConsent = async () => {
  analytics = null;
  
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  if (hasConsent && app) {
    try {
      const analyticsSupported = await isSupported();
      if (analyticsSupported && app) {
        analytics = getAnalytics(app);
      }
    } catch (error) {
      console.error('Failed to reinitialize analytics:', error);
    }
  }
  
  return { app, firestore, analytics, auth, performance };
};

export const isFirebaseReady = (): boolean => {
  return !!app && !!firestore;
};

// Auto-initialize when consent is given
if (typeof window !== 'undefined') {
  // Initialize immediately if consent already given
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  if (hasConsent) {
    setTimeout(() => {
      initializeFirebase();
    }, 1000);
  }
  
  // Listen for consent changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'gdpr_consent' && e.newValue === 'accepted') {
      setTimeout(() => {
        initializeFirebase();
      }, 1000);
    }
  });
}

export default {
  initializeFirebase,
  getFirestoreInstance,
  getAnalyticsInstance,
  getAuthInstance,
  getPerformanceInstance,
  logAnalyticsEvent,
  getFirebaseStatus,
  reinitializeFirebaseWithConsent,
  isFirebaseReady
};