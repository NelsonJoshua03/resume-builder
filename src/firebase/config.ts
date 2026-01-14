// src/firebase/config.ts - WORKING VERSION
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

// 🔥 CRITICAL FIX: Use window-based environment detection
const getFirebaseApiKey = (): string => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return ""; // Server-side, return empty
  }
  
  // For Vercel: Use window.__env__ or process.env on client
  // Try multiple ways to get the environment variable
  const possibleKeys = [
    (window as any).__env__?.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    import.meta.env?.VITE_FIREBASE_API_KEY, // For Vite
    // Fallback for development
    window.location.hostname === 'localhost' 
      ? "AIzaSyBZn_ORun-6J558JMFjTaKHJGcoshwVJPU" 
      : ""
  ];
  
  // Find the first valid key
  const validKey = possibleKeys.find(key => 
    key && typeof key === 'string' && key.length > 20 && key.startsWith('AIza')
  );
  
  if (!validKey) {
    console.error('❌ No valid Firebase API key found!');
    console.error('Possible sources checked:', possibleKeys.map(k => 
      k ? `${k.substring(0, 6)}... (${k.length} chars)` : 'empty'
    ));
    return "";
  }
  
  return validKey;
};

// Firebase Configuration - SIMPLIFIED
const firebaseConfig = {
  apiKey: getFirebaseApiKey(),
  authDomain: "careercraft-36711.firebaseapp.com",
  projectId: "careercraft-36711",
  storageBucket: "careercraft-36711.firebasestorage.app",
  messagingSenderId: "455791585830",
  appId: "1:455791585830:web:6fd2f3ee52efd8cf4514e7",
  measurementId: "G-WSKZJDJW77"
};

// Check if config is valid
const isConfigValid = () => {
  const apiKey = firebaseConfig.apiKey;
  const hasValidKey = apiKey && apiKey.length > 20;
  
  if (!hasValidKey) {
    console.error('❌ Firebase API Key Issue - Detailed Debug:');
    console.error('Current API Key:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      type: typeof apiKey,
      value: apiKey || 'empty',
      environment: typeof window !== 'undefined' 
        ? (window.location.hostname.includes('localhost') ? 'development' : 'production')
        : 'server'
    });
    
    // Try to help debug
    if (typeof window !== 'undefined') {
      console.error('🔍 Environment Debug:');
      console.error('window.__env__:', (window as any).__env__);
      console.error('process.env.NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.error('import.meta.env:', import.meta.env);
      console.error('window.location:', window.location.href);
    }
  }
  
  return hasValidKey;
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
    console.log('🚀 Initializing Firebase...');
    
    // Validate config
    const hasValidConfig = isConfigValid();
    
    if (!hasValidConfig) {
      console.error('❌ Firebase initialization FAILED - No valid API key');
      console.error('💡 URGENT FIX REQUIRED:');
      console.error('1. For Vercel: Set environment variable NEXT_PUBLIC_FIREBASE_API_KEY');
      console.error('2. For local dev: Create .env.local with the key');
      console.error('3. Or use this temporary fix: Set apiKey directly in config.ts');
      
      // Show what we tried
      console.error('Debug - Tried to get key from:');
      console.error('- process.env.NEXT_PUBLIC_FIREBASE_API_KEY:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.error('- window.__env__:', !!(window as any).__env__);
      
      // TEMPORARY WORKAROUND: Use hardcoded key so site works
      console.warn('⚠️ Using temporary API key to keep site working...');
      const tempConfig = {
        ...firebaseConfig,
        apiKey: "AIzaSyBZn_ORun-6J558JMFjTaKHJGcoshwVJPU"
      };
      app = initializeApp(tempConfig);
      console.log('✅ Firebase App initialized (Temporary mode)');
    } else {
      // Normal initialization
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase App initialized');
    }

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

    // Initialize Analytics
    if (typeof window !== 'undefined' && app) {
      try {
        const analyticsSupported = await isSupported();
        console.log('📊 Analytics supported:', analyticsSupported);
        
        if (analyticsSupported && app) {
          analytics = getAnalytics(app);
          
          // Always set user properties
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
              let userId = localStorage.getItem('firebase_user_id');
              if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('firebase_user_id', userId);
              }
              setUserId(analytics, userId);
            } else {
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

// Helper to log events
export const logAnalyticsEvent = (eventName: string, params?: any): void => {
  if (analytics) {
    try {
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      const eventParams = {
        ...params,
        is_anonymous: !hasConsent,
        user_type: hasConsent ? 'consented' : 'anonymous'
      };
      
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};

// Get Firebase status
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
    environment: window.location.hostname.includes('localhost') ? 'development' : 'production'
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
        details: status
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
    
    // Try a simple operation
    try {
      const testCollection = 'connection_test';
      const testDocRef = doc(firestore, testCollection, 'test_doc');
      
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date().toISOString(),
        project: firebaseConfig.projectId
      });
      
      console.log('✅ Test document written successfully');
      
      await deleteDoc(testDocRef);
      console.log('✅ Test document deleted successfully');
      
      return {
        success: true,
        message: '✅ Firebase connection successful!',
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
          message: '❌ Permission denied. Check Firestore security rules.',
          details: { error: error.message, code: error.code }
        };
      }
      
      return {
        success: false,
        message: `❌ Firestore operation failed: ${error.message}`,
        details: { error: error.message, code: error.code }
      };
    }
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    
    return {
      success: false,
      message: `Firebase connection failed: ${error.message}`,
      details: { error: error.message, code: error.code }
    };
  }
};

// Reinitialize with consent
export const reinitializeFirebaseWithConsent = async () => {
  const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
  
  if (hasConsent && app) {
    try {
      if (analytics) {
        const currentUserId = localStorage.getItem('firebase_user_id') || 
                              `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const previousAnonymousId = sessionStorage.getItem('firebase_anonymous_id');
        if (previousAnonymousId) {
          localStorage.setItem('previous_anonymous_id', previousAnonymousId);
          sessionStorage.removeItem('firebase_anonymous_id');
        }
        
        setUserId(analytics, currentUserId);
        setUserProperties(analytics, {
          user_type: 'consented',
          migrated_from_anonymous: !!previousAnonymousId
        });
        
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

// Auto-initialize
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔄 Auto-initializing Firebase...');
    initializeFirebase();
  }, 1000);
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'gdpr_consent' && e.newValue === 'accepted') {
      setTimeout(() => {
        console.log('🔄 Reinitializing after consent change...');
        reinitializeFirebaseWithConsent();
        
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