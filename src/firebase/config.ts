// src/firebase/config.ts - PRODUCTION READY WITH AUTHENTICATION
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
import { 
  getAuth, 
  Auth,
  signInAnonymously
} from 'firebase/auth';
import { getPerformance } from 'firebase/performance';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "careercraft-36711.firebaseapp.com",
  projectId: "careercraft-36711",
  storageBucket: "careercraft-36711.firebasestorage.app",
  messagingSenderId: "455791585830",
  appId: "1:455791585830:web:6fd2f3ee52efd8cf4514e7",
  measurementId: "G-WSKZJDJW77"
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
    console.log('🚀 Initializing Firebase for production...');
    
    // Validate config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('❌ Invalid Firebase configuration');
      isInitializing = false;
      return { app: null, firestore: null, analytics: null, auth: null, performance: null };
    }

    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized');

    // Initialize Authentication FIRST (critical for Firestore access)
    try {
      auth = getAuth(app);
      
      // Silent authentication - don't wait for it
      signInAnonymously(auth)
        .then(() => {
          console.log('✅ Authenticated anonymously for Firestore access');
        })
        .catch((signInError: any) => {
          console.warn('⚠️ Anonymous sign-in failed:', signInError.message);
          // Continue without auth, some operations might fail
        });
      
      console.log('✅ Auth initialized (async sign-in in progress)');
    } catch (authError: any) {
      console.error('❌ Auth initialization error:', authError?.message);
    }

    // Initialize Firestore
    try {
      firestore = getFirestore(app);
      console.log('✅ Firestore initialized');

      // Enable offline persistence
      if (typeof window !== 'undefined') {
        try {
          await enableIndexedDbPersistence(firestore);
          console.log('✅ Offline persistence enabled');
        } catch (persistenceError: any) {
          if (persistenceError.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence enabled in one tab only');
          } else if (persistenceError.code === 'unimplemented') {
            console.warn("⚠️ Browser doesn't support persistence");
          }
        }
      }
    } catch (firestoreError: any) {
      console.error('❌ Firestore initialization error:', firestoreError?.message);
    }

    // Initialize Analytics
    if (typeof window !== 'undefined' && app) {
      try {
        const analyticsSupported = await isSupported();
        
        if (analyticsSupported && app) {
          analytics = getAnalytics(app);
          
          if (analytics) {
            setUserProperties(analytics, {
              environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
              app_version: '1.0.0',
              platform: 'web',
              domain: window.location.hostname,
              tracking_enabled: 'true'
            });
            
            // Set user ID if authenticated
            if (auth?.currentUser) {
              setUserId(analytics, auth.currentUser.uid);
            }
          }
          console.log('✅ Analytics initialized');
        }
      } catch (analyticsError: any) {
        console.error('❌ Analytics initialization error:', analyticsError?.message);
      }
    }

    console.log('🎉 Firebase production initialization complete!');

  } catch (error: any) {
    console.error('🔥 Firebase initialization failed:', error?.message);
    
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
  if (analytics) {
    try {
      const eventParams = {
        ...params,
        is_anonymous: !auth?.currentUser,
        eventValue: params?.eventValue || 0
      };
      
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};

// Test Firebase connection with authentication
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log('🔍 Testing Firebase production connection...');
    
    const { app, firestore, auth } = await initializeFirebase();
    
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
    
    // Test a simple read/write operation (don't require auth for test)
    try {
      const testCollection = 'connection_test';
      const testDocRef = doc(firestore, testCollection, 'test_doc');
      
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date().toISOString(),
        project: firebaseConfig.projectId,
        userId: auth?.currentUser?.uid || 'anonymous'
      });
      
      console.log('✅ Test document written successfully');
      
      await deleteDoc(testDocRef);
      console.log('✅ Test document deleted successfully');
      
      return {
        success: true,
        message: '✅ Firebase production connection successful!',
        details: {
          projectId: firebaseConfig.projectId,
          userId: auth?.currentUser?.uid || 'not-authenticated',
          firestore: true,
          analytics: !!analytics,
          auth: !!auth,
          authenticated: !!auth?.currentUser
        }
      };
    } catch (error: any) {
      console.error('❌ Firestore operation failed:', error);
      
      // Check if it's an authentication error
      if (error.code === 'permission-denied') {
        return {
          success: false,
          message: '❌ Permission denied. Please check Firestore rules or authenticate.',
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
    
    return {
      success: false,
      message: `❌ Firebase connection failed: ${error.message || 'Unknown error'}`,
      details: { error: error?.message, code: error?.code }
    };
  }
};

// Auto-initialize with authentication
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔄 Auto-initializing Firebase for production...');
    initializeFirebase();
  }, 1000);
}


// ✅ ADD THIS FUNCTION BEFORE export default
export const getFirebaseStatus = () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  const configValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
  const isAnonymous = !hasConsent;
  
  return {
    app: !!app,
    firestore: !!firestore,
    analytics: !!analytics,
    auth: !!auth,
    performance: !!performance,
    gdprConsent: hasConsent,
    isAnonymous: isAnonymous,
    configValid: configValid,
    projectId: firebaseConfig.projectId,
    environment: typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'development' : 'production',
    configDetails: {
      apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
      projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
      authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing'
    }
  };
};

// Also add it to the default export
export default {
  initializeFirebase,
  getFirestoreInstance,
  getAnalyticsInstance,
  getAuthInstance,
  getPerformanceInstance,
  logAnalyticsEvent,
  testFirebaseConnection,
  getFirebaseStatus
};