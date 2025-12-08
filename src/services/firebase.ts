// src/services/firebase.ts - FIXED VERSION
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  limit,
  enableIndexedDbPersistence,
  DocumentReference,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZn_ORun-6J558JMFjTaKHJGcoshwVJPU",
  authDomain: "careercraft-36711.firebaseapp.com",
  projectId: "careercraft-36711",
  storageBucket: "careercraft-36711.firebasestorage.app",
  messagingSenderId: "455791585830",
  appId: "1:455791585830:web:6fd2f3ee52efd8cf4514e7",
  measurementId: "G-WSKZJDJW77"
};

// Singleton instances
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// INITIALIZATION FLAGS - CRITICAL FIX
let isInitializing = false;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;
let initializationInProgress = false;

// Generate unique device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('careercraft_device_id');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('careercraft_device_id', deviceId);
  }
  return deviceId;
};

// Compress image function
export const compressImage = async (base64Str: string, maxWidth = 800, maxHeight = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate the new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
  });
};

// Check if string is a base64 image
export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

// Initialize Firebase App - SINGLETON PATTERN (FIXED)
export const initFirebaseApp = async (): Promise<boolean> => {
  // Return if already initialized
  if (isInitialized) {
    return true;
  }
  
  // Return if currently initializing
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }
  
  // Prevent multiple initializations
  if (initializationInProgress) {
    return false;
  }
  
  // Start initialization
  initializationInProgress = true;
  isInitializing = true;
  
  initializationPromise = new Promise(async (resolve) => {
    try {
      // Initialize Firebase regardless of online status
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      
      // Try to enable offline persistence
      try {
        if (db) {
          await enableIndexedDbPersistence(db);
        }
      } catch (err) {
        console.warn('Offline persistence failed:', err);
      }
      
      // Try anonymous sign-in with timeout
      if (auth) {
        const authPromise = signInAnonymously(auth);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        try {
          await Promise.race([authPromise, timeoutPromise]);
          isInitialized = true;
          resolve(true);
        } catch (authError) {
          console.warn('Firebase auth timed out or failed:', authError);
          // Even if auth fails, we can still proceed with Firebase
          isInitialized = true;
          resolve(true);
        }
      } else {
        isInitialized = true;
        resolve(true);
      }
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      isInitializing = false;
      isInitialized = false;
      resolve(false);
    } finally {
      initializationInProgress = false;
    }
  });
  
  return initializationPromise;
};

// Get initialized instances
export const getFirebaseInstances = () => {
  return { app, db, auth, isInitialized };
};

// JOBS FUNCTIONS

// Cache for Firebase jobs to prevent repeated calls
let cachedFirebaseJobs: any[] | null = null;
let lastJobFetchTime = 0;
const JOB_CACHE_DURATION = 60000; // 60 seconds cache

// Save job to Firebase
export const saveJobToFirebase = async (jobData: any): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    if (!db || !isInitialized) {
      // Store locally
      const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      const localId = `local-${Date.now()}`;
      const newJob = {
        ...jobData,
        id: localId,
        addedTimestamp: Date.now(),
        page: Math.floor(localJobs.length / 10) + 1
      };
      localJobs.unshift(newJob);
      localStorage.setItem('manualJobs', JSON.stringify(localJobs));
      return { success: true, id: localId };
    }
    
    const deviceId = getDeviceId();
    
    // Prepare job for Firebase
    const firebaseJob = {
      ...jobData,
      deviceId,
      addedTimestamp: Date.now(),
      firebaseCreated: new Date().toISOString(),
      isSynced: true
    };
    
    // Remove local id if exists
    delete firebaseJob.id;
    
    const docRef = await addDoc(collection(db, 'jobs'), firebaseJob);
    
    // Clear cache since we added a new job
    clearFirebaseJobCache();
    
    // Also update localStorage
    const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    localJobs.unshift({
      ...firebaseJob,
      id: `firebase_${(docRef as DocumentReference).id}`,
      page: Math.floor(localJobs.length / 10) + 1
    });
    localStorage.setItem('manualJobs', JSON.stringify(localJobs));
    
    return { success: true, id: (docRef as DocumentReference).id };
  } catch (error) {
    console.error('Error saving job to Firebase:', error);
    
    // Fallback to localStorage
    const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const localId = `local-fallback-${Date.now()}`;
    localJobs.unshift({
      ...jobData,
      id: localId,
      addedTimestamp: Date.now(),
      page: Math.floor(localJobs.length / 10) + 1
    });
    localStorage.setItem('manualJobs', JSON.stringify(localJobs));
    
    return { success: true, id: localId };
  }
};

// Get all jobs from Firebase
export const getJobsFromFirebase = async (forceRefresh = false): Promise<any[]> => {
  try {
    // Return cache if valid and not forced refresh
    if (!forceRefresh && cachedFirebaseJobs && Date.now() - lastJobFetchTime < JOB_CACHE_DURATION) {
      return cachedFirebaseJobs;
    }
    
    if (!db || !isInitialized) {
      const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      cachedFirebaseJobs = localJobs;
      lastJobFetchTime = Date.now();
      return localJobs;
    }
    
    // Check if online
    if (!navigator.onLine) {
      const cachedJobs = localStorage.getItem('cachedFirebaseJobs');
      if (cachedJobs) {
        cachedFirebaseJobs = JSON.parse(cachedJobs);
        return cachedFirebaseJobs || [];
      }
      return [];
    }
    
    const jobsQuery = query(collection(db, 'jobs'), orderBy('addedTimestamp', 'desc'), limit(100));
    const querySnapshot = await getDocs(jobsQuery);
    
    const jobs: any[] = [];
    const snapshot = querySnapshot as QuerySnapshot;
    snapshot.docs.forEach((docSnapshot: QueryDocumentSnapshot) => {
      const data = docSnapshot.data();
      jobs.push({ 
        id: `firebase_${docSnapshot.id}`,
        firebaseId: docSnapshot.id,
        ...data
      });
    });
    
    // Update cache
    cachedFirebaseJobs = jobs;
    lastJobFetchTime = Date.now();
    
    // Cache for offline use
    localStorage.setItem('cachedFirebaseJobs', JSON.stringify(jobs));
    localStorage.setItem('manualJobs', JSON.stringify(jobs));
    
    return jobs;
  } catch (error) {
    console.error('Error getting jobs from Firebase:', error);
    
    // Multiple fallback strategies
    const cachedJobs = localStorage.getItem('cachedFirebaseJobs');
    if (cachedJobs) {
      cachedFirebaseJobs = JSON.parse(cachedJobs);
      return cachedFirebaseJobs || [];
    }
    
    const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    cachedFirebaseJobs = localJobs;
    return localJobs;
  }
};

// Clear the job cache
export const clearFirebaseJobCache = () => {
  cachedFirebaseJobs = null;
  lastJobFetchTime = 0;
};

// Delete job from Firebase
export const deleteJobFromFirebase = async (jobId: string): Promise<boolean> => {
  try {
    if (!db || !isInitialized) {
      const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      const updatedJobs = localJobs.filter((job: any) => job.id !== jobId);
      localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
      clearFirebaseJobCache();
      return true;
    }
    
    const firebaseId = jobId.startsWith('firebase_') ? jobId.replace('firebase_', '') : jobId;
    await deleteDoc(doc(db, 'jobs', firebaseId));
    
    // Update localStorage and clear cache
    const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const updatedJobs = localJobs.filter((job: any) => job.id !== jobId);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    clearFirebaseJobCache();
    
    return true;
  } catch (error) {
    console.error('Error deleting job from Firebase:', error);
    return false;
  }
};

// DRIVES FUNCTIONS

// Cache for Firebase drives
let cachedFirebaseDrives: any[] | null = null;
let lastDriveFetchTime = 0;
const DRIVE_CACHE_DURATION = 60000; // 60 seconds cache

// Helper function to clean data for Firebase
const cleanDataForFirebase = (data: any): any => {
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    // Remove undefined values (Firestore doesn't accept undefined)
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

// Save drive to Firebase - FIXED VERSION
export const saveDriveToFirebase = async (driveData: any): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    if (!db || !isInitialized) {
      // Store locally
      const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      const localId = `local-drive-${Date.now()}`;
      localDrives.unshift({
        ...driveData,
        id: localId,
        addedTimestamp: Date.now()
      });
      localStorage.setItem('jobDrives', JSON.stringify(localDrives));
      return { success: true, id: localId };
    }
    
    const deviceId = getDeviceId();
    
    // Compress image if it's a base64 string and too large
    let processedImage = driveData.image;
    if (isBase64Image(driveData.image) && driveData.image.length > 100000) {
      try {
        processedImage = await compressImage(driveData.image, 800, 600, 0.7);
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
      }
    }
    
    // Prepare drive for Firebase - CLEAN DATA FIRST
    const cleanedData = cleanDataForFirebase(driveData);
    
    const firebaseDrive = {
      ...cleanedData,
      image: processedImage,
      deviceId,
      addedTimestamp: Date.now(),
      firebaseCreated: new Date().toISOString(),
      isSynced: true
    };
    
    // Remove local id if exists
    delete firebaseDrive.id;
    
    const docRef = await addDoc(collection(db, 'drives'), firebaseDrive);
    
    // Clear cache since we added a new drive
    clearFirebaseDriveCache();
    
    // Also update localStorage
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    localDrives.unshift({
      ...firebaseDrive,
      id: `firebase_${(docRef as DocumentReference).id}`
    });
    localStorage.setItem('jobDrives', JSON.stringify(localDrives));
    
    return { success: true, id: (docRef as DocumentReference).id };
  } catch (error) {
    console.error('Error saving drive to Firebase:', error);
    
    // Fallback to localStorage
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    const localId = `local-fallback-${Date.now()}`;
    localDrives.unshift({
      ...driveData,
      id: localId,
      addedTimestamp: Date.now()
    });
    localStorage.setItem('jobDrives', JSON.stringify(localDrives));
    
    return { success: true, id: localId };
  }
};

// Get all drives from Firebase
export const getDrivesFromFirebase = async (forceRefresh = false): Promise<any[]> => {
  try {
    // Return cache if valid and not forced refresh
    if (!forceRefresh && cachedFirebaseDrives && Date.now() - lastDriveFetchTime < DRIVE_CACHE_DURATION) {
      return cachedFirebaseDrives;
    }
    
    if (!db || !isInitialized) {
      const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      cachedFirebaseDrives = localDrives;
      lastDriveFetchTime = Date.now();
      return localDrives;
    }
    
    // Check if online
    if (!navigator.onLine) {
      const cachedDrives = localStorage.getItem('cachedFirebaseDrives');
      if (cachedDrives) {
        cachedFirebaseDrives = JSON.parse(cachedDrives);
        return cachedFirebaseDrives || [];
      }
      return [];
    }
    
    const drivesQuery = query(collection(db, 'drives'), orderBy('addedTimestamp', 'desc'), limit(100));
    const querySnapshot = await getDocs(drivesQuery);
    
    const drives: any[] = [];
    const snapshot = querySnapshot as QuerySnapshot;
    snapshot.docs.forEach((docSnapshot: QueryDocumentSnapshot) => {
      const data = docSnapshot.data();
      drives.push({ 
        id: `firebase_${docSnapshot.id}`,
        firebaseId: docSnapshot.id,
        ...data
      });
    });
    
    // Update cache
    cachedFirebaseDrives = drives;
    lastDriveFetchTime = Date.now();
    
    // Cache for offline use
    localStorage.setItem('cachedFirebaseDrives', JSON.stringify(drives));
    localStorage.setItem('jobDrives', JSON.stringify(drives));
    
    return drives;
  } catch (error) {
    console.error('Error getting drives from Firebase:', error);
    
    // Multiple fallback strategies
    const cachedDrives = localStorage.getItem('cachedFirebaseDrives');
    if (cachedDrives) {
      cachedFirebaseDrives = JSON.parse(cachedDrives);
      return cachedFirebaseDrives || [];
    }
    
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    cachedFirebaseDrives = localDrives;
    return localDrives;
  }
};

// Clear the drive cache
export const clearFirebaseDriveCache = () => {
  cachedFirebaseDrives = null;
  lastDriveFetchTime = 0;
};

// Delete drive from Firebase
export const deleteDriveFromFirebase = async (driveId: string): Promise<boolean> => {
  try {
    if (!db || !isInitialized) {
      const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      const updatedDrives = localDrives.filter((drive: any) => drive.id !== driveId);
      localStorage.setItem('jobDrives', JSON.stringify(updatedDrives));
      clearFirebaseDriveCache();
      return true;
    }
    
    const firebaseId = driveId.startsWith('firebase_') ? driveId.replace('firebase_', '') : driveId;
    await deleteDoc(doc(db, 'drives', firebaseId));
    
    // Update localStorage and clear cache
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    const updatedDrives = localDrives.filter((drive: any) => drive.id !== driveId);
    localStorage.setItem('jobDrives', JSON.stringify(updatedDrives));
    clearFirebaseDriveCache();
    
    return true;
  } catch (error) {
    console.error('Error deleting drive from Firebase:', error);
    return false;
  }
};

// Clean up old drives (older than 30 days)
export const cleanupOldDrives = async (): Promise<{ removed: number; total: number }> => {
  try {
    const drives = await getDrivesFromFirebase(true);
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const oldDrives = drives.filter((drive: any) => {
      const driveTimestamp = drive.addedTimestamp || new Date(drive.date).getTime();
      return driveTimestamp < thirtyDaysAgo;
    });
    
    // Delete old drives from Firebase
    for (const drive of oldDrives) {
      if (drive.id?.startsWith('firebase_')) {
        await deleteDriveFromFirebase(drive.id);
      }
    }
    
    // Update localStorage
    const recentDrives = drives.filter((drive: any) => {
      const driveTimestamp = drive.addedTimestamp || new Date(drive.date).getTime();
      return driveTimestamp >= thirtyDaysAgo;
    });
    
    localStorage.setItem('jobDrives', JSON.stringify(recentDrives));
    clearFirebaseDriveCache();
    
    return {
      removed: oldDrives.length,
      total: recentDrives.length
    };
  } catch (error) {
    console.error('Error cleaning up old drives:', error);
    return { removed: 0, total: 0 };
  }
};

// GENERAL FUNCTIONS

// Check Firebase connection
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    return isInitialized && !!db;
  } catch (error) {
    return false;
  }
};

// Sync local jobs to Firebase
export const syncLocalJobsToFirebase = async (): Promise<{success: number, failed: number}> => {
  const results = { success: 0, failed: 0 };
  
  try {
    if (!db || !isInitialized) {
      return results;
    }
    
    const localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    
    // Filter jobs that aren't already synced
    const unsyncedJobs = localJobs.filter((job: any) => 
      !job.id?.startsWith('firebase_') && !job.isSynced
    );
    
    for (const job of unsyncedJobs) {
      try {
        const result = await saveJobToFirebase(job);
        if (result.success) {
          results.success++;
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
      }
    }
    
    clearFirebaseJobCache();
    return results;
  } catch (error) {
    return results;
  }
};

// Sync local drives to Firebase
export const syncLocalDrivesToFirebase = async (): Promise<{success: number, failed: number}> => {
  const results = { success: 0, failed: 0 };
  
  try {
    if (!db || !isInitialized) {
      return results;
    }
    
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    
    // Filter drives that aren't already synced
    const unsyncedDrives = localDrives.filter((drive: any) => 
      !drive.id?.startsWith('firebase_') && !drive.isSynced
    );
    
    for (const drive of unsyncedDrives) {
      try {
        // Clean the drive data before syncing
        const cleanedDrive = cleanDataForFirebase(drive);
        const result = await saveDriveToFirebase(cleanedDrive);
        if (result.success) {
          results.success++;
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
      }
    }
    
    clearFirebaseDriveCache();
    return results;
  } catch (error) {
    return results;
  }
};

// Clear all caches
export const clearFirebaseCache = () => {
  clearFirebaseJobCache();
  clearFirebaseDriveCache();
};

// Reset initialization (for testing)
export const resetFirebase = () => {
  isInitialized = false;
  isInitializing = false;
  initializationPromise = null;
  initializationInProgress = false;
  clearFirebaseCache();
};

export default {
  get app() { return app; },
  get db() { return db; },
  get auth() { return auth; },
  get isInitialized() { return isInitialized; },
  getFirebaseInstances,
  
  // Jobs functions
  saveJobToFirebase,
  getJobsFromFirebase,
  deleteJobFromFirebase,
  syncLocalJobsToFirebase,
  clearFirebaseJobCache,
  
  // Drives functions
  saveDriveToFirebase,
  getDrivesFromFirebase,
  deleteDriveFromFirebase,
  syncLocalDrivesToFirebase,
  clearFirebaseDriveCache,
  cleanupOldDrives,
  
  // Image functions
  compressImage,
  isBase64Image,
  
  // General functions
  initFirebaseApp,
  checkFirebaseConnection,
  getDeviceId,
  clearFirebaseCache,
  resetFirebase
};