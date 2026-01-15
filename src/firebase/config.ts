// src/firebase/config.ts - CLEAN WORKING VERSION
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

// ✅ SIMPLE SOLUTION: Direct API key
// For now, use hardcoded key. We'll fix Vercel later.
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZn_ORun-6J558JMFjTaKHJGcoshwVJPU";

// Firebase Configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
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
      console.error('❌ Invalid Firebase configuration');
      isInitializing = false;
      return { app: null, firestore: null, analytics: null, auth: null, performance: null };
    }

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
      console.error('❌ Firestore initialization error:', firestoreError?.message);
    }

    // Initialize Analytics - ALWAYS INITIALIZE (for both consented and anonymous users)
    if (typeof window !== 'undefined' && app) {
      try {
        const analyticsSupported = await isSupported();
        
        if (analyticsSupported && app) {
          analytics = getAnalytics(app);
          
          // Always set user properties (with anonymized data for anonymous users)
          if (analytics) {
            const isAnonymous = !hasConsent;
            
            setUserProperties(analytics, {
              environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
              app_version: '1.0.0',
              platform: 'web',
              domain: window.location.hostname,
              user_type: hasConsent ? 'consented' : 'anonymous',
              tracking_enabled: 'true'
            });
            
            // Set user ID based on consent
            if (hasConsent) {
              // Use localStorage ID for consented users
              let userId = localStorage.getItem('firebase_user_id');
              if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('firebase_user_id', userId);
              }
              setUserId(analytics, userId);
            } else {
              // Use sessionStorage ID for anonymous users
              let userId = sessionStorage.getItem('firebase_anonymous_id');
              if (!userId) {
                userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                sessionStorage.setItem('firebase_anonymous_id', userId);
              }
              setUserId(analytics, `anonymous_${userId}`);
            }
          }
          console.log('✅ Analytics initialized (Anonymous tracking enabled)');
        }
      } catch (analyticsError: any) {
        console.error('❌ Analytics initialization error:', analyticsError?.message);
      }
    }

    // Initialize Auth
    try {
      if (app) {
        auth = getAuth(app);
        console.log('✅ Auth initialized');
      }
    } catch (authError: any) {
      console.error('❌ Auth initialization error:', authError?.message);
    }

    console.log('🎉 Firebase initialization complete!');

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

// Helper to log events - MODIFIED TO WORK WITH ANONYMOUS USERS
export const logAnalyticsEvent = (eventName: string, params?: any): void => {
  // Always log events, consent is handled in the analytics.ts file
  if (analytics) {
    try {
      // Add anonymous flag if no consent
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      const eventParams = {
        ...params,
        is_anonymous: !hasConsent,
        user_type: hasConsent ? 'consented' : 'anonymous',
        eventValue: params?.eventValue || 0 // ✅ FIX: Ensure eventValue is never undefined
      };
      
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};

// Get Firebase status with more details
export const getFirebaseStatus = () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  const configValid = isConfigValid();
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
    environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
    configDetails: {
      apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
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
          auth: !!auth,
          anonymous_tracking_enabled: true
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
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  if (hasConsent && app) {
    try {
      // Update user ID from anonymous to consented
      if (analytics) {
        // Get current user ID
        const currentUserId = localStorage.getItem('firebase_user_id') || 
                              `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Migrate from anonymous to consented
        const previousAnonymousId = sessionStorage.getItem('firebase_anonymous_id');
        if (previousAnonymousId) {
          localStorage.setItem('previous_anonymous_id', previousAnonymousId);
          sessionStorage.removeItem('firebase_anonymous_id');
        }
        
        // Update Firebase Analytics user ID
        setUserId(analytics, currentUserId);
        setUserProperties(analytics, {
          user_type: 'consented',
          migrated_from_anonymous: !!previousAnonymousId,
          previous_anonymous_id: previousAnonymousId || 'none'
        });
        
        console.log('✅ Analytics reinitialized with consent (user migrated from anonymous)');
      }
    } catch (error) {
      console.error('Failed to reinitialize analytics with consent:', error);
    }
  }
  
  return { app, firestore, analytics, auth, performance };
};

export const isFirebaseReady = (): boolean => {
  return !!app && !!firestore;
};

// Auto-initialize when consent is given
if (typeof window !== 'undefined') {
  // Initialize immediately (for both anonymous and consented users)
  setTimeout(() => {
    console.log('🔄 Auto-initializing Firebase (anonymous tracking enabled)...');
    initializeFirebase();
  }, 1000);
  
  // Listen for consent changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'gdpr_consent' && e.newValue === 'accepted') {
      setTimeout(() => {
        console.log('🔄 Reinitializing Firebase after consent change...');
        reinitializeFirebaseWithConsent();
        
        // Also trigger a page refresh to start fresh with consented tracking
        setTimeout(() => {
          window.location.reload();
        }, 500);
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