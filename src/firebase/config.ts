// src/firebase/config.ts - PRODUCTION READY VERSION
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

// Firebase Configuration - Using hardcoded values for production
const firebaseConfig = {
  apiKey: "AIzaSyBZn_ORun-6J558JMFjTaKHJGcoshwVJPU",
  authDomain: "careercraft-36711.firebaseapp.com",
  projectId: "careercraft-36711",
  storageBucket: "careercraft-36711.firebasestorage.app",
  messagingSenderId: "455791585830",
  appId: "1:455791585830:web:6fd2f3ee52efd8cf4514e7",
  measurementId: "G-WSKZJDJW77"
};

// Check if config is valid
const isConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         !firebaseConfig.apiKey.includes('your-') &&
         firebaseConfig.apiKey.length > 20;
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
      console.error('❌ Invalid Firebase configuration:', {
        apiKeyLength: firebaseConfig.apiKey?.length || 0,
        projectId: firebaseConfig.projectId,
        isValid: hasValidConfig
      });
      
      isInitializing = false;
      return { app: null, firestore: null, analytics: null, auth: null, performance: null };
    }

    console.log('✅ Firebase Config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });

    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized');

    // Check GDPR consent
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    console.log('📋 GDPR Consent:', hasConsent);

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
          } else {
            console.warn('Firestore persistence error:', err);
          }
        });
      }
    } catch (firestoreError: any) {
      console.error('❌ Firestore initialization error:', firestoreError?.code, firestoreError?.message);
    }

    // Initialize Analytics
    if (typeof window !== 'undefined' && app && hasConsent) {
      try {
        const analyticsSupported = await isSupported();
        console.log('📊 Analytics supported:', analyticsSupported);
        
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
      } catch (analyticsError: any) {
        console.error('❌ Analytics initialization error:', analyticsError?.code, analyticsError?.message);
      }
    }

    // Initialize Auth
    try {
      if (app) {
        auth = getAuth(app);
        console.log('✅ Auth initialized');
      }
    } catch (authError: any) {
      console.error('❌ Auth initialization error:', authError?.code, authError?.message);
    }

    console.log('🎉 Firebase initialization complete!');

  } catch (error: any) {
    console.error('🔥 Firebase initialization failed:', error?.code, error?.message);
    
    // More specific error messages
    if (error?.code === 'auth/invalid-api-key') {
      console.error('❌ INVALID API KEY: Please check your Firebase API key');
    } else if (error?.code === 'permission-denied') {
      console.error('❌ PERMISSION DENIED: Check Firestore security rules');
    } else if (error?.code === 'project/not-found') {
      console.error('❌ PROJECT NOT FOUND: Check your Firebase project ID');
    } else if (error?.code === 'app/duplicate-app') {
      console.error('❌ DUPLICATE APP: Firebase already initialized');
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
      console.log(`📊 Analytics Event: ${eventName}`, params);
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
      apiKey: firebaseConfig.apiKey ? `✓ Set (${firebaseConfig.apiKey.substring(0, 10)}...)` : '✗ Missing',
      projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
      authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing'
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
        message: '❌ Firebase configuration is invalid.',
        details: status.configDetails
      };
    }
    
    const { app, firestore } = await initializeFirebase();
    
    if (!app) {
      return {
        success: false,
        message: '❌ Failed to initialize Firebase app.'
      };
    }
    
    if (!firestore) {
      return {
        success: false,
        message: '❌ Failed to initialize Firestore.'
      };
    }
    
    // Try a simple read operation (no write needed)
    try {
      const testCollection = 'connection_test';
      const testDocRef = doc(firestore, testCollection, 'test_doc');
      
      // Try to set a test document
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date().toISOString(),
        project: firebaseConfig.projectId
      });
      
      console.log('✅ Test document written successfully');
      
      // Try to delete it
      await deleteDoc(testDocRef);
      console.log('✅ Test document deleted successfully');
      
      return {
        success: true,
        message: '✅ Firebase connection successful! All services are working.',
        details: {
          projectId: firebaseConfig.projectId,
          firestore: true,
          analytics: !!analytics,
          auth: !!auth
        }
      };
    } catch (error: any) {
      console.error('❌ Firestore operation failed:', error);
      
      if (error.code === 'permission-denied') {
        return {
          success: false,
          message: '❌ Permission denied. Please update Firestore security rules to allow writes.',
          details: { error: error.message, code: error.code }
        };
      }
      
      return {
        success: false,
        message: `❌ Firestore operation failed: ${error.message || 'Unknown error'}`,
        details: { error: error.message, code: error.code }
      };
    }
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    
    let errorMessage = 'Firebase connection failed. ';
    
    if (error?.code === 'auth/invalid-api-key') {
      errorMessage = '❌ Invalid API key. Please check your Firebase API key.';
    } else if (error?.code === 'project/not-found') {
      errorMessage = `❌ Project not found: ${firebaseConfig.projectId}. Check your Firebase project.`;
    } else if (error?.code === 'unavailable') {
      errorMessage = '❌ Firebase service unavailable. Check network connection.';
    } else if (error?.message) {
      errorMessage += `Error: ${error.message}`;
    } else {
      errorMessage += 'Unknown error.';
    }
    
    return {
      success: false,
      message: errorMessage,
      details: { error: error?.message, code: error?.code }
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
        console.log('✅ Analytics reinitialized with consent');
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
      console.log('🔄 Auto-initializing Firebase with consent...');
      initializeFirebase();
    }, 1000);
  }
  
  // Listen for consent changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'gdpr_consent' && e.newValue === 'accepted') {
      setTimeout(() => {
        console.log('🔄 Reinitializing Firebase after consent change...');
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