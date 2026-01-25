// src/firebase/lazyFirebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "careercraft-36711.firebaseapp.com",
  projectId: "careercraft-36711",
  storageBucket: "careercraft-36711.firebasestorage.app",
  messagingSenderId: "455791585830",
  appId: "1:455791585830:web:6fd2f3ee52efd8cf4514e7",
  measurementId: "G-WSKZJDJW77"
};

let app: FirebaseApp | null = null;
let firestorePromise: Promise<any> | null = null;
let authPromise: Promise<any> | null = null;
let analyticsPromise: Promise<any> | null = null;

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
  if (!app) {
    const { initializeApp } = await import('firebase/app');
    app = initializeApp(firebaseConfig);
  }
  return app;
};

// Lazy load Firestore (critical - load immediately)
export const getFirestore = async () => {
  if (!firestorePromise) {
    firestorePromise = (async () => {
      const { getFirestore } = await import('firebase/firestore');
      const app = await getFirebaseApp();
      return getFirestore(app);
    })();
  }
  return firestorePromise;
};

// Lazy load Auth (only when needed)
export const getAuth = async () => {
  if (!authPromise) {
    authPromise = (async () => {
      const { getAuth } = await import('firebase/auth');
      const app = await getFirebaseApp();
      return getAuth(app);
    })();
  }
  return authPromise;
};

// Lazy load Analytics (only for non-GDPR users)
export const getAnalytics = async () => {
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      if (!hasConsent) return null;
      
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      const app = await getFirebaseApp();
      
      if (await isSupported()) {
        return getAnalytics(app);
      }
      return null;
    })();
  }
  return analyticsPromise;
};

// Initialize only critical Firebase modules
export const initCriticalFirebase = async () => {
  try {
    const app = await getFirebaseApp();
    const firestore = await getFirestore();
    
    console.log('✅ Firebase critical services loaded');
    return { app, firestore };
  } catch (error) {
    console.error('Firebase critical init failed:', error);
    throw error;
  }
};

// Lazy load non-critical modules
export const initNonCriticalFirebase = async () => {
  try {
    const [auth, analytics] = await Promise.all([
      getAuth(),
      getAnalytics()
    ]);
    
    console.log('✅ Firebase non-critical services loaded');
    return { auth, analytics };
  } catch (error) {
    console.warn('Non-critical Firebase modules failed:', error);
    return { auth: null, analytics: null };
  }
};

// Initialize everything (for backward compatibility)
export const initializeFirebase = async () => {
  const [critical, nonCritical] = await Promise.all([
    initCriticalFirebase(),
    initNonCriticalFirebase()
  ]);
  
  return { ...critical, ...nonCritical };
};