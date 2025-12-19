// src/firebase/driveService.ts - COMPLETE FIXED VERSION
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  addDoc,
  
  Timestamp,
  limit,
  writeBatch
} from 'firebase/firestore';
import { initializeFirebase, getFirestoreInstance, testFirebaseConnection } from './config';
import { firebaseAnalytics } from './analytics';

export interface JobDriveData {
  id?: string;
  title: string;
  company: string;
  location: string;
  date: string;
  time: string;
  description: string;
  eligibility: string[];
  documents: string[];
  applyLink: string;
  registrationLink?: string;
  contact: string;
  featured?: boolean;
  driveType?: string;
  experience?: string;
  salary?: string;
  expectedCandidates?: number;
  
  // Analytics fields
  views?: number;
  shares?: number;
  registrations?: number;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
  
  // GDPR compliance
  consentGiven?: boolean;
  dataProcessingLocation?: 'IN';
}

export type CreateDriveInput = Omit<JobDriveData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'& {
  registrationLink?: string;  // Add this
}

>;

export interface DriveFilters {
  location?: string;
  driveType?: string;
  featured?: boolean;
  isActive?: boolean;
  searchTerm?: string;
}

export class FirebaseDriveService {
  private collectionName = 'jobDrives';
  private AUTO_CLEANUP_DAYS = 90;
  private firestoreInitialized = false;
  private localDrivesKey = 'firebase_drives_cache';
  private syncInProgress = false;

  constructor() {
    this.initializeFirestore();
    // Check for cleanup less frequently
    setTimeout(() => {
      this.checkAndCleanupOldDrives();
    }, 5000);
  }

  private async initializeFirestore(): Promise<void> {
    try {
      console.log('🔄 Initializing Firestore for Drives...');
      await initializeFirebase();
      this.firestoreInitialized = true;
      console.log('✅ Firestore initialized for Drives');
      
      // Try to sync existing drives from localStorage to Firebase
      this.syncLocalToFirebase();
    } catch (error) {
      console.error('Failed to initialize Firestore for Drives:', error);
      this.firestoreInitialized = false;
    }
  }

  private getFirestore() {
    const firestore = getFirestoreInstance();
    if (!firestore) {
      console.warn('Firestore not available. Using localStorage fallback for drives.');
      return null;
    }
    return firestore;
  }

  private async checkAndCleanupOldDrives(): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      // Get all active drives
      const drivesQuery = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(drivesQuery);
      const now = new Date();
      const cutoffTimestamp = cutoffDate.getTime();
      
      const updatePromises: Promise<void>[] = [];
      
      snapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const driveDate = new Date(data.date);
        
        // Check if drive date has passed by 7 days (allow some buffer after event)
        const sevenDaysAfter = new Date(driveDate);
        sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
        
        if (sevenDaysAfter.getTime() < cutoffTimestamp) {
          updatePromises.push(
            updateDoc(docSnapshot.ref, { 
              isActive: false,
              updatedAt: serverTimestamp() 
            })
          );
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`Auto-cleaned ${updatePromises.length} old drives`);
      }
    } catch (error: any) {
      // Don't log index errors as critical
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log('⚠️ Index needed for auto-cleanup query. You can create it in Firebase Console.');
      } else {
        console.error('Error in auto-cleanup:', error);
      }
    }
  }

  async createDrive(driveData: CreateDriveInput): Promise<string> {
    try {
      // Generate drive ID
      const driveId = `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create drive in Firebase first
      const firestore = this.getFirestore();
      if (firestore) {
        try {
          await this.createDriveInFirestore(driveId, driveData);
          console.log(`✅ Drive ${driveId} created in Firebase`);
        } catch (firestoreError) {
          console.warn('Failed to create drive in Firebase, saving locally:', firestoreError);
          // Fallback to localStorage if Firebase fails
          await this.createDriveInLocalStorage(driveId, driveData);
        }
      } else {
        // Only localStorage
        await this.createDriveInLocalStorage(driveId, driveData);
      }
      
      return driveId;
    } catch (error) {
      console.error('Error creating drive:', error);
      throw error;
    }
  }

  private async createDriveInFirestore(driveId: string, driveData: CreateDriveInput): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) throw new Error('Firestore not initialized');

    const driveRef = doc(firestore, this.collectionName, driveId);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    
    const completeDriveData = {
      ...driveData,
      id: driveId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      isActive: true,
      views: 0,
      shares: 0,
      registrations: 0,
      dataProcessingLocation: 'IN'
    };

    await setDoc(driveRef, completeDriveData);
    
    // Track drive creation
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'drive_created',
          eventCategory: 'Drive Management',
          eventLabel: driveData.title,
          eventValue: 1,
          pagePath: '/admin/job-drives',
          pageTitle: 'Admin Job Drives',
          metadata: {
            driveId,
            company: driveData.company,
            location: driveData.location,
            driveType: driveData.driveType
          },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track drive creation event:', error);
      }
    }
  }

  private async createDriveInLocalStorage(driveId: string, driveData: CreateDriveInput): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    
    const completeDriveData: JobDriveData = {
      ...driveData,
      id: driveId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt,
      isActive: true,
      views: 0,
      shares: 0,
      registrations: 0,
      dataProcessingLocation: 'IN'
    };

    // Get existing drives from cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    let cachedDrives: any[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
      } catch (e) {
        console.warn('Error parsing cached drives:', e);
      }
    }
    
    // Add new drive to cache
    cachedDrives.unshift(completeDriveData);
    
    // Update cache
    localStorage.setItem(this.localDrivesKey, JSON.stringify({
      drives: cachedDrives,
      timestamp: Date.now()
    }));
    
    // Also update jobDrives for backward compatibility
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    localDrives.unshift(completeDriveData);
    localStorage.setItem('jobDrives', JSON.stringify(localDrives));
    
    console.log(`✅ Drive created in localStorage: ${driveId}`);
  }

  async getDrive(driveId: string): Promise<JobDriveData | null> {
    // Try Firebase first
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        const snapshot = await getDoc(driveRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const driveData: JobDriveData = {
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate()
          } as JobDriveData;

          // Increment view count
          await this.incrementViewCount(driveId);
          return driveData;
        }
      } catch (firestoreError) {
        console.warn('Failed to get drive from Firebase:', firestoreError);
      }
    }
    
    // Fallback to localStorage
    return this.getDriveFromLocalStorage(driveId);
  }

  private async getDriveFromLocalStorage(driveId: string): Promise<JobDriveData | null> {
    // Check cache first
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        const cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        const cachedDrive = cachedDrives.find((drive: JobDriveData) => drive.id === driveId);
        if (cachedDrive) {
          // Increment view count locally
          cachedDrive.views = (cachedDrive.views || 0) + 1;
          localStorage.setItem(this.localDrivesKey, JSON.stringify({
            drives: cachedDrives,
            timestamp: Date.now()
          }));
          return cachedDrive;
        }
      } catch (e) {
        console.warn('Error parsing cached drives:', e);
      }
    }
    
    // Check jobDrives (legacy)
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    const localDrive = localDrives.find((d: JobDriveData) => d.id === driveId);
    if (localDrive) {
      localDrive.views = (localDrive.views || 0) + 1;
      localStorage.setItem('jobDrives', JSON.stringify(localDrives));
      return localDrive;
    }

    return null;
  }

  async getDrives(filters?: DriveFilters, page: number = 1, limitPerPage: number = 10): Promise<{ drives: JobDriveData[], total: number }> {
    // Try Firebase first
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        console.log('🔄 Fetching drives from Firebase...');
        
        // Build query with conditions
        let conditions: any[] = [
          where('isActive', '==', true)
        ];
        
        // Add filters
        if (filters?.location) {
          conditions.push(where('location', '==', filters.location));
        }
        
        if (filters?.driveType && filters.driveType !== 'all') {
          conditions.push(where('driveType', '==', filters.driveType));
        }
        
        if (filters?.featured) {
          conditions.push(where('featured', '==', true));
        }
        
        // Try to use orderBy, but handle potential index errors
        try {
          const drivesQuery = query(
            collection(firestore, this.collectionName),
            ...conditions,
            orderBy('date', 'desc'),
            orderBy('createdAt', 'desc')
          );
          
          const snapshot = await getDocs(drivesQuery);
          const allDrives = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as JobDriveData;
          });

          // Apply search filter if needed
          let filteredDrives = allDrives;
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredDrives = allDrives.filter(drive =>
              drive.title.toLowerCase().includes(searchLower) ||
              drive.company.toLowerCase().includes(searchLower) ||
              drive.description.toLowerCase().includes(searchLower)
            );
          }

          // Paginate
          const startIndex = (page - 1) * limitPerPage;
          const paginatedDrives = filteredDrives.slice(startIndex, startIndex + limitPerPage);

          // Update cache
          this.updateLocalCache(allDrives);

          return {
            drives: paginatedDrives,
            total: filteredDrives.length
          };
        } catch (orderByError: any) {
          // If orderBy fails, try without it
          console.log('OrderBy failed, trying without ordering:', orderByError);
          
          const drivesQuery = query(
            collection(firestore, this.collectionName),
            ...conditions
          );
          
          const snapshot = await getDocs(drivesQuery);
          const allDrives = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as JobDriveData;
          });

          // Sort manually by date then createdAt
          allDrives.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateB !== dateA) return dateB - dateA;
            
            const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return createdB - createdA;
          });

          // Apply search filter
          let filteredDrives = allDrives;
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredDrives = allDrives.filter(drive =>
              drive.title.toLowerCase().includes(searchLower) ||
              drive.company.toLowerCase().includes(searchLower) ||
              drive.description.toLowerCase().includes(searchLower)
            );
          }

          // Paginate
          const startIndex = (page - 1) * limitPerPage;
          const paginatedDrives = filteredDrives.slice(startIndex, startIndex + limitPerPage);

          // Update cache
          this.updateLocalCache(allDrives);

          return {
            drives: paginatedDrives,
            total: filteredDrives.length
          };
        }
      } catch (firestoreError) {
        console.warn('Failed to get drives from Firebase, using cache:', firestoreError);
      }
    }
    
    // Fallback to localStorage cache
    return this.getDrivesFromLocalStorage(filters, page, limitPerPage);
  }

  private updateLocalCache(firebaseDrives: JobDriveData[]): void {
    try {
      localStorage.setItem(this.localDrivesKey, JSON.stringify({
        drives: firebaseDrives,
        timestamp: Date.now()
      }));
      
      // Also update jobDrives for backward compatibility
      localStorage.setItem('jobDrives', JSON.stringify(firebaseDrives));
    } catch (error) {
      console.warn('Failed to update local cache:', error);
    }
  }

  private getDrivesFromLocalStorage(filters?: DriveFilters, page: number = 1, limitPerPage: number = 10): { drives: JobDriveData[], total: number } {
    // Try cache first
    const cacheData = localStorage.getItem(this.localDrivesKey);
    let allDrives: JobDriveData[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        allDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
      } catch (e) {
        console.warn('Error parsing cached drives:', e);
      }
    }
    
    // If cache is empty, try jobDrives
    if (allDrives.length === 0) {
      allDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    }
    
    // Clean up old drives in cache
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const recentDrives = allDrives.filter((drive: JobDriveData) => {
      const driveTimestamp = drive.createdAt ? new Date(drive.createdAt).getTime() : Date.now();
      return driveTimestamp >= ninetyDaysAgo;
    });
    
    if (recentDrives.length !== allDrives.length) {
      this.updateLocalCache(recentDrives);
      allDrives = recentDrives;
    }
    
    // Sort by date (newest first), then createdAt
    allDrives.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    });
    
    // Apply filters
    let filteredDrives = allDrives;
    
    if (filters?.location) {
      filteredDrives = filteredDrives.filter(drive => 
        drive.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.driveType && filters.driveType !== 'all') {
      filteredDrives = filteredDrives.filter(drive => 
        drive.driveType === filters.driveType
      );
    }
    
    if (filters?.featured) {
      filteredDrives = filteredDrives.filter(drive => drive.featured === true);
    }
    
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredDrives = filteredDrives.filter(drive =>
        drive.title.toLowerCase().includes(searchTerm) ||
        drive.company.toLowerCase().includes(searchTerm) ||
        drive.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Paginate
    const startIndex = (page - 1) * limitPerPage;
    const paginatedDrives = filteredDrives.slice(startIndex, startIndex + limitPerPage);
    
    return {
      drives: paginatedDrives,
      total: filteredDrives.length
    };
  }

  async updateDrive(driveId: string, updates: Partial<JobDriveData>): Promise<void> {
    // Update Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        await updateDoc(driveRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to update drive in Firebase:', firestoreError);
      }
    }
    
    // Update local cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        
        const driveIndex = cachedDrives.findIndex((d: JobDriveData) => d.id === driveId);
        if (driveIndex !== -1) {
          cachedDrives[driveIndex] = {
            ...cachedDrives[driveIndex],
            ...updates,
            updatedAt: new Date()
          };
          
          localStorage.setItem(this.localDrivesKey, JSON.stringify({
            drives: cachedDrives,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    // Also update jobDrives
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    const driveIndex = localDrives.findIndex((d: JobDriveData) => d.id === driveId);
    if (driveIndex !== -1) {
      localDrives[driveIndex] = {
        ...localDrives[driveIndex],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem('jobDrives', JSON.stringify(localDrives));
    }
    
    // Track update event
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'drive_updated',
          eventCategory: 'Drive Management',
          eventLabel: updates.title || driveId,
          pagePath: '/admin/job-drives',
          pageTitle: 'Admin Job Drives',
          metadata: { driveId, ...updates },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track drive update event:', error);
      }
    }
  }

  async deleteDrive(driveId: string): Promise<void> {
    // Delete from Firebase (soft delete)
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        await updateDoc(driveRef, {
          isActive: false,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to delete drive from Firebase:', firestoreError);
      }
    }
    
    // Remove from local cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        cachedDrives = cachedDrives.filter((drive: JobDriveData) => drive.id !== driveId);
        
        localStorage.setItem(this.localDrivesKey, JSON.stringify({
          drives: cachedDrives,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    // Remove from jobDrives
    const localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    const updatedDrives = localDrives.filter((drive: JobDriveData) => drive.id !== driveId);
    localStorage.setItem('jobDrives', JSON.stringify(updatedDrives));
    
    // Track deletion event
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'drive_deleted',
          eventCategory: 'Drive Management',
          eventLabel: driveId,
          pagePath: '/admin/job-drives',
          pageTitle: 'Admin Job Drives',
          metadata: { driveId },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track drive deletion event:', error);
      }
    }
  }

  async incrementViewCount(driveId: string): Promise<void> {
    // Update Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        const snapshot = await getDoc(driveRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentViews = data.views || 0;
          await updateDoc(driveRef, {
            views: currentViews + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment view count in Firebase:', firestoreError);
      }
    }
    
    // Update local cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        
        const driveIndex = cachedDrives.findIndex((d: JobDriveData) => d.id === driveId);
        if (driveIndex !== -1) {
          cachedDrives[driveIndex].views = (cachedDrives[driveIndex].views || 0) + 1;
          cachedDrives[driveIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localDrivesKey, JSON.stringify({
            drives: cachedDrives,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache view count:', e);
      }
    }
  }

  async incrementShareCount(driveId: string): Promise<void> {
    // Update Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        const snapshot = await getDoc(driveRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentShares = data.shares || 0;
          await updateDoc(driveRef, {
            shares: currentShares + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment share count in Firebase:', firestoreError);
      }
    }
    
    // Update local cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        
        const driveIndex = cachedDrives.findIndex((d: JobDriveData) => d.id === driveId);
        if (driveIndex !== -1) {
          cachedDrives[driveIndex].shares = (cachedDrives[driveIndex].shares || 0) + 1;
          cachedDrives[driveIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localDrivesKey, JSON.stringify({
            drives: cachedDrives,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache share count:', e);
      }
    }
  }

  async incrementRegistrationCount(driveId: string): Promise<void> {
    // Update Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const driveRef = doc(firestore, this.collectionName, driveId);
        const snapshot = await getDoc(driveRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentRegistrations = data.registrations || 0;
          await updateDoc(driveRef, {
            registrations: currentRegistrations + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment registration count in Firebase:', firestoreError);
      }
    }
    
    // Update local cache
    const cacheData = localStorage.getItem(this.localDrivesKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        
        const driveIndex = cachedDrives.findIndex((d: JobDriveData) => d.id === driveId);
        if (driveIndex !== -1) {
          cachedDrives[driveIndex].registrations = (cachedDrives[driveIndex].registrations || 0) + 1;
          cachedDrives[driveIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localDrivesKey, JSON.stringify({
            drives: cachedDrives,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache registration count:', e);
      }
    }
  }

  async bulkCreateDrives(drivesData: CreateDriveInput[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Create drives in Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const batch = writeBatch(firestore);
        const driveIds: string[] = [];
        
        for (const driveData of drivesData) {
          try {
            const driveId = `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            driveIds.push(driveId);
            
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
            
            const driveRef = doc(firestore, this.collectionName, driveId);
            batch.set(driveRef, {
              ...driveData,
              id: driveId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              expiresAt: Timestamp.fromDate(expiresAt),
              isActive: true,
              views: 0,
              shares: 0,
              registrations: 0,
              dataProcessingLocation: 'IN'
            });
            
            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Failed to prepare drive: ${driveData.title} - ${error.message}`);
          }
        }
        
        if (results.success > 0) {
          await batch.commit();
          console.log(`✅ Successfully created ${results.success} drives in Firebase`);
        }
      } catch (batchError: any) {
        console.error('Batch creation failed:', batchError);
        results.failed += results.success;
        results.success = 0;
        results.errors.push(`Batch commit failed: ${batchError.message}`);
      }
    }
    
    // Also create in localStorage as fallback
    for (const driveData of drivesData) {
      try {
        const driveId = `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.createDriveInLocalStorage(driveId, driveData);
      } catch (error: any) {
        // Already counted if Firebase failed
        if (!firestore) {
          results.failed++;
          results.errors.push(`Failed to create drive in localStorage: ${driveData.title} - ${error.message}`);
        }
      }
    }

    // Track bulk creation
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && results.success > 0) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'drives_bulk_created',
          eventCategory: 'Drive Management',
          eventLabel: 'bulk_upload',
          eventValue: results.success,
          pagePath: '/admin/job-drives',
          pageTitle: 'Admin Job Drives',
          metadata: {
            total_drives: drivesData.length,
            successful: results.success,
            failed: results.failed
          },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track bulk create event:', error);
      }
    }

    return results;
  }

  async testFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
    const result = await testFirebaseConnection();
    
    return {
      connected: result.success,
      message: result.message
    };
  }

  async syncAllToFirebase(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return { synced: 0, failed: 0 };
    }
    
    this.syncInProgress = true;
    
    try {
      console.log('🔄 Starting sync of drives to Firebase...');
      
      const firestore = this.getFirestore();
      if (!firestore) {
        console.log('Firestore not available for sync');
        return { synced: 0, failed: 0 };
      }

      // Get drives from localStorage
      const cacheData = localStorage.getItem(this.localDrivesKey);
      let localDrives: JobDriveData[] = [];
      
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          localDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        } catch (e) {
          console.warn('Error parsing cached drives:', e);
        }
      }
      
      if (localDrives.length === 0) {
        localDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      }
      
      if (localDrives.length === 0) {
        console.log('No local drives to sync');
        return { synced: 0, failed: 0 };
      }

      console.log(`Found ${localDrives.length} local drives to sync`);
      let synced = 0;
      let failed = 0;

      // Use batch for better performance
      const batch = writeBatch(firestore);
      const batchSize = 500; // Firestore batch limit
      let currentBatch = 0;
      
      for (const localDrive of localDrives) {
        try {
          const { id, createdAt, updatedAt, expiresAt, ...driveData } = localDrive;
          const driveId = id || `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const driveRef = doc(firestore, this.collectionName, driveId);
          
          const expiresAtDate = expiresAt ? new Date(expiresAt) : new Date();
          expiresAtDate.setDate(expiresAtDate.getDate() + this.AUTO_CLEANUP_DAYS);
          
          batch.set(driveRef, {
            ...driveData,
            id: driveId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAtDate),
            isActive: driveData.isActive !== undefined ? driveData.isActive : true,
            views: localDrive.views || 0,
            shares: localDrive.shares || 0,
            registrations: localDrive.registrations || 0,
            dataProcessingLocation: 'IN'
          });
          
          synced++;
          currentBatch++;
          
          // Commit batch if we reach batch size
          if (currentBatch >= batchSize) {
            await batch.commit();
            currentBatch = 0;
            console.log(`✅ Committed batch of ${batchSize} drives`);
          }
        } catch (error) {
          console.error(`❌ Failed to sync drive: ${localDrive.title}`, error);
          failed++;
        }
      }
      
      // Commit remaining drives
      if (currentBatch > 0) {
        await batch.commit();
        console.log(`✅ Committed final batch of ${currentBatch} drives`);
      }

      console.log(`🎉 Sync complete: ${synced} synced, ${failed} failed`);
      return { synced, failed };
    } catch (error) {
      console.error('Sync process failed:', error);
      return { synced: 0, failed: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncLocalToFirebase(): Promise<void> {
    // Background sync - don't wait for it
    setTimeout(async () => {
      try {
        const cacheData = localStorage.getItem(this.localDrivesKey);
        if (!cacheData) return;
        
        const parsed = JSON.parse(cacheData);
        const localDrives = Array.isArray(parsed.drives) ? parsed.drives : [];
        
        if (localDrives.length === 0) return;
        
        // Check if we have Firebase connection
        const firestore = this.getFirestore();
        if (!firestore) return;
        
        // Check if we have drives in Firebase
        try {
          const firebaseQuery = query(
            collection(firestore, this.collectionName),
            limit(1)
          );
          await getDocs(firebaseQuery);
        } catch (error) {
          // Firebase might be empty or have permission issues
          console.log('Firebase appears empty, syncing local drives...');
          await this.syncAllToFirebase();
        }
      } catch (error) {
        // Silent fail - this is background sync
      }
    }, 3000);
  }

  async getFeaturedDrives(limitCount: number = 5): Promise<JobDriveData[]> {
    try {
      const { drives } = await this.getDrives({ featured: true }, 1, limitCount);
      return drives;
    } catch (error) {
      console.error('Error getting featured drives:', error);
      return this.getDrivesFromLocalStorage({ featured: true }, 1, limitCount).drives;
    }
  }

  async getTodayDrives(limitCount: number = 10): Promise<JobDriveData[]> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { drives } = await this.getDrives({}, 1, limitCount);
      return drives.filter(drive => drive.date === today);
    } catch (error) {
      console.error('Error getting today drives:', error);
      return this.getDrivesFromLocalStorage({}, 1, limitCount).drives.filter((drive: JobDriveData) => drive.date === today);
    }
  }

  async getUpcomingDrives(limitCount: number = 10): Promise<JobDriveData[]> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { drives } = await this.getDrives({}, 1, limitCount);
      return drives.filter(drive => drive.date > today);
    } catch (error) {
      console.error('Error getting upcoming drives:', error);
      return this.getDrivesFromLocalStorage({}, 1, limitCount).drives.filter((drive: JobDriveData) => drive.date > today);
    }
  }

  async getStats(): Promise<{
    totalDrives: number;
    totalViews: number;
    totalRegistrations: number;
    totalShares: number;
    drivesByLocation: Record<string, number>;
    drivesByType: Record<string, number>;
  }> {
    try {
      const { drives } = await this.getDrives({}, 1, 1000); // Get all drives for stats
      
      const stats = {
        totalDrives: drives.length,
        totalViews: drives.reduce((sum, drive) => sum + (drive.views || 0), 0),
        totalRegistrations: drives.reduce((sum, drive) => sum + (drive.registrations || 0), 0),
        totalShares: drives.reduce((sum, drive) => sum + (drive.shares || 0), 0),
        drivesByLocation: {} as Record<string, number>,
        drivesByType: {} as Record<string, number>
      };

      drives.forEach(drive => {
        stats.drivesByLocation[drive.location] = (stats.drivesByLocation[drive.location] || 0) + 1;
        if (drive.driveType) {
          stats.drivesByType[drive.driveType] = (stats.drivesByType[drive.driveType] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting drive stats:', error);
      
      // Fallback to local cache
      const cacheData = localStorage.getItem(this.localDrivesKey);
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          const drives = Array.isArray(parsed.drives) ? parsed.drives : [];
          
          return {
            totalDrives: drives.length,
            totalViews: drives.reduce((sum: number, drive: JobDriveData) => sum + (drive.views || 0), 0),
            totalRegistrations: drives.reduce((sum: number, drive: JobDriveData) => sum + (drive.registrations || 0), 0),
            totalShares: drives.reduce((sum: number, drive: JobDriveData) => sum + (drive.shares || 0), 0),
            drivesByLocation: {},
            drivesByType: {}
          };
        } catch (e) {
          // Continue to default return
        }
      }
      
      return {
        totalDrives: 0,
        totalViews: 0,
        totalRegistrations: 0,
        totalShares: 0,
        drivesByLocation: {},
        drivesByType: {}
      };
    }
  }

  async clearLocalCache(): Promise<void> {
    localStorage.removeItem(this.localDrivesKey);
    localStorage.removeItem('jobDrives');
    console.log('✅ Local drive cache cleared');
  }

  async refreshCache(): Promise<void> {
    console.log('🔄 Refreshing drive cache...');
    
    // Clear old cache
    await this.clearLocalCache();
    
    // Force reload from Firebase
    const { drives } = await this.getDrives({}, 1, 1000);
    console.log(`✅ Cache refreshed with ${drives.length} drives`);
  }
}

export const firebaseDriveService = new FirebaseDriveService();