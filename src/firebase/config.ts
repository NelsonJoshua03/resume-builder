// src/firebase/config.ts - COMPLETE UPDATED VERSION
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  deleteDoc
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

// Firebase Configuration from Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Check if config is valid
const isConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         !firebaseConfig.apiKey.includes('your-') &&
         !firebaseConfig.apiKey.includes('AIzaSyA6JjC8qYgQ6q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6'); // Remove placeholder
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
    const hasValidConfig = isConfigValid();
    
    if (!hasValidConfig) {
      console.warn('Invalid Firebase configuration. Please check your .env.local file.');
      console.warn('Current config:', {
        apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
        projectId: firebaseConfig.projectId ? 'Present' : 'Missing',
        isPlaceholder: firebaseConfig.apiKey.includes('your-') || firebaseConfig.apiKey.includes('AIzaSyA6JjC8qYgQ6q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6')
      });
      
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

  } catch (error: any) {
    console.error('🔥 Firebase initialization failed:', error);
    
    // More specific error messages
    if (error.code === 'auth/invalid-api-key') {
      console.error('❌ INVALID API KEY: Please check your VITE_FIREBASE_API_KEY in .env.local');
    } else if (error.code === 'permission-denied') {
      console.error('❌ PERMISSION DENIED: Check Firestore security rules');
    } else if (error.code === 'project/not-found') {
      console.error('❌ PROJECT NOT FOUND: Check your VITE_FIREBASE_PROJECT_ID');
    }
    
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

// Get Firebase status with more details
export const getFirebaseStatus = () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  const configValid = isConfigValid();
  
  return {
    app: !!app,
    firestore: !!firestore,
    analytics: !!analytics,
    auth: !!auth,
    performance: !!performance,
    gdprConsent: hasConsent,
    configValid: configValid,
    projectId: firebaseConfig.projectId,
    environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
    configDetails: {
      apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
      projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
      isPlaceholder: firebaseConfig.apiKey.includes('your-') || firebaseConfig.apiKey.includes('AIzaSyA6JjC8qYgQ6q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6')
    }
  };
};

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    const status = getFirebaseStatus();
    
    if (!status.configValid) {
      return {
        success: false,
        message: '❌ Firebase configuration is invalid. Please check your .env.local file.',
        details: status.configDetails
      };
    }
    
    const { app, firestore } = await initializeFirebase();
    
    if (!app) {
      return {
        success: false,
        message: '❌ Failed to initialize Firebase app. Check console for errors.'
      };
    }
    
    if (!firestore) {
      return {
        success: false,
        message: '❌ Failed to initialize Firestore. Check console for errors.'
      };
    }
    
    // Try a simple operation
    try {
      const testCollection = 'connection_test';
      const testDocRef = doc(firestore, testCollection, 'test_doc');
      
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date().toISOString()
      });
      
      // Clean up
      await deleteDoc(testDocRef);
      
      return {
        success: true,
        message: '✅ Firebase connection successful! All services are working.',
        details: status
      };
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        return {
          success: false,
          message: '❌ Permission denied. Please update Firestore security rules.',
          details: { error: error.message }
        };
      }
      throw error;
    }
    
  } catch (error: any) {
    console.error('Firebase connection test failed:', error);
    
    let errorMessage = 'Firebase connection failed. ';
    
    if (error.code === 'auth/invalid-api-key') {
      errorMessage = '❌ Invalid API key. Please check VITE_FIREBASE_API_KEY in .env.local';
    } else if (error.code === 'project/not-found') {
      errorMessage = '❌ Project not found. Check VITE_FIREBASE_PROJECT_ID';
    } else if (error.code === 'unavailable') {
      errorMessage = '❌ Firebase service unavailable. Check network connection.';
    } else {
      errorMessage += `Error: ${error.message || 'Unknown error'}`;
    }
    
    return {
      success: false,
      message: errorMessage,
      details: { error: error.message, code: error.code }
    };
  }
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
  testFirebaseConnection,
  reinitializeFirebaseWithConsent,
  isFirebaseReady
};