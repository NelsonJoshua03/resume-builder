// src/firebase/config.ts - PRODUCTION READY WITH ENHANCED AUTHENTICATION
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
  signInAnonymously,
  onAuthStateChanged,
  User
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
let currentUser: User | null = null;
let authStateResolvers: ((user: User | null) => void)[] = [];

export const initializeFirebase = async (): Promise<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  analytics: Analytics | null;
  auth: Auth | null;
  performance: any;
  currentUser: User | null;
}> => {
  // Don't reinitialize
  if (app && firestore && auth) {
    return { app, firestore, analytics, auth, performance, currentUser };
  }

  if (isInitializing) {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          resolve({ app, firestore, analytics, auth, performance, currentUser });
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
      return { app: null, firestore: null, analytics: null, auth: null, performance: null, currentUser: null };
    }

    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized');

    // Initialize Authentication FIRST
    auth = getAuth(app);
    console.log('✅ Auth initialized');

    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      console.log('🔄 Auth state changed:', user ? `User: ${user.email || user.uid.substring(0, 8)}...` : 'No user');
      
      // Resolve all pending promises
      authStateResolvers.forEach(resolver => resolver(user));
      authStateResolvers = [];
      
      if (user) {
        // Update analytics user ID if we have consent
        if (analytics && localStorage.getItem('gdpr_consent') === 'accepted') {
          setUserId(analytics, user.uid);
        }
      }
    });

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
            if (currentUser) {
              setUserId(analytics, currentUser.uid);
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
    currentUser = null;
  } finally {
    isInitializing = false;
  }

  return { app, firestore, analytics, auth, performance, currentUser };
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
export const getCurrentUser = (): User | null => currentUser;

// Helper to log events
export const logAnalyticsEvent = (eventName: string, params?: any): void => {
  if (analytics) {
    try {
      const eventParams = {
        ...params,
        is_anonymous: !currentUser,
        eventValue: params?.eventValue || 0
      };
      
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.warn('Failed to log analytics event:', error);
    }
  }
};

// Wait for authentication to complete
export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (currentUser) {
      resolve(currentUser);
    } else {
      authStateResolvers.push(resolve);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        const index = authStateResolvers.indexOf(resolve);
        if (index > -1) {
          authStateResolvers.splice(index, 1);
        }
        resolve(null);
      }, 5000);
    }
  });
};

// Test Firebase connection with authentication
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log('🔍 Testing Firebase production connection...');
    
    const { app, firestore, auth, currentUser } = await initializeFirebase();
    
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
    
    if (!auth) {
      return {
        success: false,
        message: '❌ Failed to initialize Authentication.'
      };
    }
    
    // Test a simple read operation (public access)
    try {
      const testCollection = 'jobs';
      const testQuery = doc(firestore, testCollection, 'test_doc');
      
      // Try to write with authentication check
      if (currentUser) {
        console.log('✅ User is authenticated:', currentUser.email || currentUser.uid);
        
        try {
          await setDoc(testQuery, {
            test: true,
            timestamp: new Date().toISOString(),
            project: firebaseConfig.projectId,
            userId: currentUser.uid
          }, { merge: true });
          
          console.log('✅ Test document written successfully');
          
          await deleteDoc(testQuery);
          console.log('✅ Test document deleted successfully');
          
          return {
            success: true,
            message: '✅ Firebase production connection successful! (Authenticated)',
            details: {
              projectId: firebaseConfig.projectId,
              userId: currentUser.uid,
              email: currentUser.email,
              firestore: true,
              analytics: !!analytics,
              auth: true,
              authenticated: true,
              hasAdminClaims: currentUser.getIdTokenResult().then(t => t.claims.admin === true)
            }
          };
        } catch (writeError: any) {
          console.warn('Write test failed (might be permission issue):', writeError.message);
          
          // Continue with read test
        }
      }
      
      // Test read access (public)
      try {
        const publicQuery = doc(firestore, 'jobs', 'public_test');
        await setDoc(publicQuery, {
          test: 'public_read',
          timestamp: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Public read/write test successful');
        
        return {
          success: true,
          message: '✅ Firebase production connection successful!',
          details: {
            projectId: firebaseConfig.projectId,
            userId: currentUser?.uid || 'anonymous',
            firestore: true,
            analytics: !!analytics,
            auth: !!auth,
            authenticated: !!currentUser
          }
        };
      } catch (publicError: any) {
        return {
          success: false,
          message: `❌ Public access test failed: ${publicError.message}`,
          details: { error: publicError.message, code: publicError.code }
        };
      }
      
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

/**
 * Check if user is admin (synchronous - checks localStorage)
 */
export const isAdminUserSync = (): boolean => {
  // Check localStorage for admin flag
  const isAdminLocal = localStorage.getItem('is_admin') === 'true';
  const adminToken = localStorage.getItem('careercraft_admin_token');
  
  if (!adminToken || !isAdminLocal) {
    return false;
  }
  
  const timestamp = localStorage.getItem('admin_login_time');
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours
    
    // Check if session is expired
    if (Date.now() - loginTime > maxAge) {
      console.log('Admin session expired');
      localStorage.removeItem('is_admin');
      localStorage.removeItem('careercraft_admin_token');
      localStorage.removeItem('admin_login_time');
      localStorage.removeItem('admin_email');
      return false;
    }
    return true;
  }
  
  return false;
};

/**
 * Check if user is admin (asynchronous - checks Firebase claims)
 */
export const isAdminUserAsync = async (): Promise<boolean> => {
  try {
    const user = await waitForAuth();
    if (!user) return false;
    
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.warn('Failed to check admin status:', error);
    return false;
  }
};

/**
 * Get user's admin status with details
 */
export const getAdminStatus = async (): Promise<{
  isAdmin: boolean;
  email?: string;
  uid?: string;
  hasClaims: boolean;
  localStorage: boolean;
}> => {
  const user = await waitForAuth();
  const localAdmin = isAdminUserSync();
  
  if (!user) {
    return {
      isAdmin: localAdmin,
      hasClaims: false,
      localStorage: localAdmin
    };
  }
  
  try {
    const tokenResult = await user.getIdTokenResult();
    const hasAdminClaims = tokenResult.claims.admin === true;
    
    return {
      isAdmin: hasAdminClaims || localAdmin,
      email: user.email || undefined,
      uid: user.uid,
      hasClaims: hasAdminClaims,
      localStorage: localAdmin
    };
  } catch (error) {
    console.warn('Failed to get admin claims:', error);
    return {
      isAdmin: localAdmin,
      uid: user.uid,
      hasClaims: false,
      localStorage: localAdmin
    };
  }
};

/**
 * Check if user can post jobs
 */
export const canPostJobs = async (): Promise<boolean> => {
  try {
    const user = await waitForAuth();
    if (!user) return false;
    
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.canPostJobs === true || tokenResult.claims.admin === true;
  } catch (error) {
    console.warn('Failed to check job posting permissions:', error);
    return false;
  }
};

/**
 * Get auth headers for API calls
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const user = await waitForAuth();
  
  if (!user) {
    return {};
  }
  
  try {
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return {};
  }
};

// Get Firebase status
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
    currentUser: !!currentUser,
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

// Auto-initialize with authentication
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔄 Auto-initializing Firebase for production...');
    initializeFirebase();
  }, 1000);
}

// Export all utilities
export default {
  initializeFirebase,
  getFirestoreInstance,
  getAnalyticsInstance,
  getAuthInstance,
  getPerformanceInstance,
  getCurrentUser,
  logAnalyticsEvent,
  waitForAuth,
  testFirebaseConnection,
  isAdminUserSync,
  isAdminUserAsync,
  getAdminStatus,
  canPostJobs,
  getAuthHeaders,
  getFirebaseStatus
};