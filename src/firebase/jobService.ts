// src/firebase/jobService.ts - COMPLETE UPDATED VERSION WITH EXPERIENCE FIELD
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

export interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate?: string;
  applyLink: string;
  featured?: boolean;
  isActive?: boolean;
  
  // NEW FIELD: Experience in years
  experience?: string;
  
  // Analytics fields
  views?: number;
  shares?: number;
  applications?: number;
  saves?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  
  // Metadata
  createdBy?: string;
  lastUpdatedBy?: string;
  isApproved?: boolean;
  
  // GDPR compliance
  consentGiven?: boolean;
  dataProcessingLocation?: 'IN';
}

export type CreateJobInput = Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'> & {
  postedDate?: string;
};

export interface JobFilters {
  sector?: string;
  type?: string;
  location?: string;
  searchTerm?: string;
  featured?: boolean;
  isActive?: boolean;
  experience?: string;
}

export class FirebaseJobService {
  private collectionName = 'jobs';
  private AUTO_CLEANUP_DAYS = 90;
  private firestoreInitialized = false;
  private localJobsKey = 'firebase_jobs_cache';
  private syncInProgress = false;

  constructor() {
    this.initializeFirestore();
    setTimeout(() => {
      this.checkAndCleanupOldJobs();
    }, 5000);
  }

  private async initializeFirestore(): Promise<void> {
    try {
      console.log('🔄 Initializing Firestore...');
      await initializeFirebase();
      this.firestoreInitialized = true;
      console.log('✅ Firestore initialized');
      
      this.syncLocalToFirebase();
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      this.firestoreInitialized = false;
    }
  }

  private getFirestore() {
    const firestore = getFirestoreInstance();
    if (!firestore) {
      console.warn('Firestore not available. Using localStorage fallback.');
      return null;
    }
    return firestore;
  }

  private async checkAndCleanupOldJobs(): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      const jobsQuery = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(jobsQuery);
      const now = new Date();
      const cutoffTimestamp = cutoffDate.getTime();
      
      const updatePromises: Promise<void>[] = [];
      
      snapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
        
        if (expiresAt && expiresAt.getTime() < cutoffTimestamp) {
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
        console.log(`Auto-cleaned ${updatePromises.length} old jobs`);
      }
    } catch (error: any) {
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log('⚠️ Index needed for auto-cleanup query. You can create it in Firebase Console.');
      } else {
        console.error('Error in auto-cleanup:', error);
      }
    }
  }

  async createJob(jobData: CreateJobInput): Promise<string> {
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const firestore = this.getFirestore();
      if (firestore) {
        try {
          await this.createJobInFirestore(jobId, jobData);
          console.log(`✅ Job ${jobId} created in Firebase`);
        } catch (firestoreError) {
          console.warn('Failed to create job in Firebase, saving locally:', firestoreError);
          await this.createJobInLocalStorage(jobId, jobData);
        }
      } else {
        await this.createJobInLocalStorage(jobId, jobData);
      }
      
      return jobId;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  private async createJobInFirestore(jobId: string, jobData: CreateJobInput): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) throw new Error('Firestore not initialized');

    const jobRef = doc(firestore, this.collectionName, jobId);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    
    const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
    
    const completeJobData = {
      ...jobData,
      postedDate,
      id: jobId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      isActive: true,
      isApproved: true,
      views: 0,
      shares: 0,
      applications: 0,
      saves: 0,
      experience: jobData.experience || '0-2 years',
      dataProcessingLocation: 'IN'
    };

    await setDoc(jobRef, completeJobData);
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'job_created',
          eventCategory: 'Job Management',
          eventLabel: jobData.title,
          eventValue: 1,
          pagePath: '/admin/job-posting',
          pageTitle: 'Admin Job Posting',
          metadata: {
            jobId,
            company: jobData.company,
            sector: jobData.sector,
            type: jobData.type,
            experience: jobData.experience
          },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track job creation event:', error);
      }
    }
  }

  private async createJobInLocalStorage(jobId: string, jobData: CreateJobInput): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    
    const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
    
    const completeJobData: JobData = {
      ...jobData,
      id: jobId,
      postedDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt,
      isActive: true,
      isApproved: true,
      views: 0,
      shares: 0,
      applications: 0,
      saves: 0,
      experience: jobData.experience || '0-2 years',
      dataProcessingLocation: 'IN'
    };

    const cacheData = localStorage.getItem(this.localJobsKey);
    let cachedJobs: any[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
      } catch (e) {
        console.warn('Error parsing cached jobs:', e);
      }
    }
    
    cachedJobs.unshift(completeJobData);
    
    localStorage.setItem(this.localJobsKey, JSON.stringify({
      jobs: cachedJobs,
      timestamp: Date.now()
    }));
    
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    manualJobs.unshift(completeJobData);
    localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
    
    console.log(`✅ Job created in localStorage: ${jobId}`);
  }

  async getJob(jobId: string): Promise<JobData | null> {
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const jobData: JobData = {
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate()
          } as JobData;

          await this.incrementViewCount(jobId);
          return jobData;
        }
      } catch (firestoreError) {
        console.warn('Failed to get job from Firebase:', firestoreError);
      }
    }
    
    return this.getJobFromLocalStorage(jobId);
  }

  private async getJobFromLocalStorage(jobId: string): Promise<JobData | null> {
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        const cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        const cachedJob = cachedJobs.find((job: JobData) => job.id === jobId);
        if (cachedJob) {
          cachedJob.views = (cachedJob.views || 0) + 1;
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
          return cachedJob;
        }
      } catch (e) {
        console.warn('Error parsing cached jobs:', e);
      }
    }
    
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const manualJob = manualJobs.find((j: JobData) => j.id === jobId);
    if (manualJob) {
      manualJob.views = (manualJob.views || 0) + 1;
      localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
      return manualJob;
    }

    return null;
  }

  async getJobs(filters?: JobFilters, page: number = 1, limitPerPage: number = 10): Promise<{ jobs: JobData[], total: number }> {
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        console.log('🔄 Fetching jobs from Firebase...');
        
        let conditions: any[] = [
          where('isActive', '==', true),
          where('isApproved', '==', true)
        ];
        
        if (filters?.sector && filters.sector !== 'all') {
          conditions.push(where('sector', '==', filters.sector));
        }
        
        if (filters?.type && filters.type !== 'all') {
          conditions.push(where('type', '==', filters.type));
        }
        
        if (filters?.location) {
          conditions.push(where('location', '==', filters.location));
        }
        
        if (filters?.featured) {
          conditions.push(where('featured', '==', true));
        }

        if (filters?.experience && filters.experience !== 'all') {
          conditions.push(where('experience', '==', filters.experience));
        }
        
        try {
          const jobsQuery = query(
            collection(firestore, this.collectionName),
            ...conditions,
            orderBy('createdAt', 'desc')
          );
          
          const snapshot = await getDocs(jobsQuery);
          const allJobs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as JobData;
          });

          let filteredJobs = allJobs;
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredJobs = allJobs.filter(job =>
              job.title.toLowerCase().includes(searchLower) ||
              job.company.toLowerCase().includes(searchLower) ||
              job.description.toLowerCase().includes(searchLower)
            );
          }

          const startIndex = (page - 1) * limitPerPage;
          const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);

          this.updateLocalCache(allJobs);

          return {
            jobs: paginatedJobs,
            total: filteredJobs.length
          };
        } catch (orderByError: any) {
          console.log('OrderBy failed, trying without ordering:', orderByError);
          
          const jobsQuery = query(
            collection(firestore, this.collectionName),
            ...conditions
          );
          
          const snapshot = await getDocs(jobsQuery);
          const allJobs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as JobData;
          });

          allJobs.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          let filteredJobs = allJobs;
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredJobs = allJobs.filter(job =>
              job.title.toLowerCase().includes(searchLower) ||
              job.company.toLowerCase().includes(searchLower) ||
              job.description.toLowerCase().includes(searchLower)
            );
          }

          const startIndex = (page - 1) * limitPerPage;
          const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);

          this.updateLocalCache(allJobs);

          return {
            jobs: paginatedJobs,
            total: filteredJobs.length
          };
        }
      } catch (firestoreError) {
        console.warn('Failed to get jobs from Firebase, using cache:', firestoreError);
      }
    }
    
    return this.getJobsFromLocalStorage(filters, page, limitPerPage);
  }

  private updateLocalCache(firebaseJobs: JobData[]): void {
    try {
      localStorage.setItem(this.localJobsKey, JSON.stringify({
        jobs: firebaseJobs,
        timestamp: Date.now()
      }));
      
      localStorage.setItem('manualJobs', JSON.stringify(firebaseJobs));
    } catch (error) {
      console.warn('Failed to update local cache:', error);
    }
  }

  private getJobsFromLocalStorage(filters?: JobFilters, page: number = 1, limitPerPage: number = 10): { jobs: JobData[], total: number } {
    const cacheData = localStorage.getItem(this.localJobsKey);
    let allJobs: JobData[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        allJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
      } catch (e) {
        console.warn('Error parsing cached jobs:', e);
      }
    }
    
    if (allJobs.length === 0) {
      allJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    }
    
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const recentJobs = allJobs.filter((job: JobData) => {
      const jobTimestamp = job.createdAt ? new Date(job.createdAt).getTime() : Date.now();
      return jobTimestamp >= ninetyDaysAgo;
    });
    
    if (recentJobs.length !== allJobs.length) {
      this.updateLocalCache(recentJobs);
      allJobs = recentJobs;
    }
    
    allJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    let filteredJobs = allJobs;
    
    if (filters?.sector && filters.sector !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.sector === filters.sector);
    }
    
    if (filters?.type && filters.type !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.featured) {
      filteredJobs = filteredJobs.filter(job => job.featured === true);
    }

    if (filters?.experience && filters.experience !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.experience === filters.experience);
    }
    
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (page - 1) * limitPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);
    
    return {
      jobs: paginatedJobs,
      total: filteredJobs.length
    };
  }

  async updateJob(jobId: string, updates: Partial<JobData>): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        await updateDoc(jobRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to update job in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        const jobIndex = cachedJobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          cachedJobs[jobIndex] = {
            ...cachedJobs[jobIndex],
            ...updates,
            updatedAt: new Date()
          };
          
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const jobIndex = manualJobs.findIndex((j: JobData) => j.id === jobId);
    if (jobIndex !== -1) {
      manualJobs[jobIndex] = {
        ...manualJobs[jobIndex],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
    }
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'job_updated',
          eventCategory: 'Job Management',
          eventLabel: updates.title || jobId,
          pagePath: '/admin/job-posting',
          pageTitle: 'Admin Job Posting',
          metadata: { jobId, ...updates },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track job update event:', error);
      }
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        await updateDoc(jobRef, {
          isActive: false,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to delete job from Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        cachedJobs = cachedJobs.filter((job: JobData) => job.id !== jobId);
        
        localStorage.setItem(this.localJobsKey, JSON.stringify({
          jobs: cachedJobs,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const updatedJobs = manualJobs.filter((job: JobData) => job.id !== jobId);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'job_deleted',
          eventCategory: 'Job Management',
          eventLabel: jobId,
          pagePath: '/admin/job-posting',
          pageTitle: 'Admin Job Posting',
          metadata: { jobId },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track job deletion event:', error);
      }
    }
  }

  async incrementViewCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentViews = data.views || 0;
          await updateDoc(jobRef, {
            views: currentViews + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment view count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        const jobIndex = cachedJobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          cachedJobs[jobIndex].views = (cachedJobs[jobIndex].views || 0) + 1;
          cachedJobs[jobIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache view count:', e);
      }
    }
  }

  async bulkCreateJobs(jobsData: CreateJobInput[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const batch = writeBatch(firestore);
        const jobIds: string[] = [];
        
        for (const jobData of jobsData) {
          try {
            const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            jobIds.push(jobId);
            
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
            
            const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
            
            const jobRef = doc(firestore, this.collectionName, jobId);
            batch.set(jobRef, {
              ...jobData,
              postedDate,
              id: jobId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              expiresAt: Timestamp.fromDate(expiresAt),
              isActive: true,
              isApproved: true,
              views: 0,
              shares: 0,
              applications: 0,
              saves: 0,
              experience: jobData.experience || '0-2 years',
              dataProcessingLocation: 'IN'
            });
            
            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Failed to prepare job: ${jobData.title} - ${error.message}`);
          }
        }
        
        if (results.success > 0) {
          await batch.commit();
          console.log(`✅ Successfully created ${results.success} jobs in Firebase`);
        }
      } catch (batchError: any) {
        console.error('Batch creation failed:', batchError);
        results.failed += results.success;
        results.success = 0;
        results.errors.push(`Batch commit failed: ${batchError.message}`);
      }
    }
    
    for (const jobData of jobsData) {
      try {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.createJobInLocalStorage(jobId, jobData);
      } catch (error: any) {
        if (!firestore) {
          results.failed++;
          results.errors.push(`Failed to create job in localStorage: ${jobData.title} - ${error.message}`);
        }
      }
    }

    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && results.success > 0) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'jobs_bulk_created',
          eventCategory: 'Job Management',
          eventLabel: 'bulk_upload',
          eventValue: results.success,
          pagePath: '/admin/job-posting',
          pageTitle: 'Admin Job Posting',
          metadata: {
            total_jobs: jobsData.length,
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
      console.log('🔄 Starting sync to Firebase...');
      
      const firestore = this.getFirestore();
      if (!firestore) {
        console.log('Firestore not available for sync');
        return { synced: 0, failed: 0 };
      }

      const cacheData = localStorage.getItem(this.localJobsKey);
      let localJobs: JobData[] = [];
      
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          localJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        } catch (e) {
          console.warn('Error parsing cached jobs:', e);
        }
      }
      
      if (localJobs.length === 0) {
        localJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      }
      
      if (localJobs.length === 0) {
        console.log('No local jobs to sync');
        return { synced: 0, failed: 0 };
      }

      console.log(`Found ${localJobs.length} local jobs to sync`);
      let synced = 0;
      let failed = 0;

      const batch = writeBatch(firestore);
      const batchSize = 500;
      let currentBatch = 0;
      
      for (const localJob of localJobs) {
        try {
          const { id, createdAt, updatedAt, expiresAt, ...jobData } = localJob;
          const jobId = id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const jobRef = doc(firestore, this.collectionName, jobId);
          
          const expiresAtDate = expiresAt ? new Date(expiresAt) : new Date();
          expiresAtDate.setDate(expiresAtDate.getDate() + this.AUTO_CLEANUP_DAYS);
          
          batch.set(jobRef, {
            ...jobData,
            id: jobId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAtDate),
            isActive: jobData.isActive !== undefined ? jobData.isActive : true,
            isApproved: jobData.isApproved !== undefined ? jobData.isApproved : true,
            views: localJob.views || 0,
            shares: localJob.shares || 0,
            applications: localJob.applications || 0,
            saves: localJob.saves || 0,
            experience: localJob.experience || '0-2 years',
            dataProcessingLocation: 'IN'
          });
          
          synced++;
          currentBatch++;
          
          if (currentBatch >= batchSize) {
            await batch.commit();
            currentBatch = 0;
            console.log(`✅ Committed batch of ${batchSize} jobs`);
          }
        } catch (error) {
          console.error(`❌ Failed to sync job: ${localJob.title}`, error);
          failed++;
        }
      }
      
      if (currentBatch > 0) {
        await batch.commit();
        console.log(`✅ Committed final batch of ${currentBatch} jobs`);
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
    setTimeout(async () => {
      try {
        const cacheData = localStorage.getItem(this.localJobsKey);
        if (!cacheData) return;
        
        const parsed = JSON.parse(cacheData);
        const localJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        if (localJobs.length === 0) return;
        
        const firestore = this.getFirestore();
        if (!firestore) return;
        
        try {
          const firebaseQuery = query(
            collection(firestore, this.collectionName),
            limit(1)
          );
          await getDocs(firebaseQuery);
        } catch (error) {
          console.log('Firebase appears empty, syncing local jobs...');
          await this.syncAllToFirebase();
        }
      } catch (error) {
      }
    }, 3000);
  }

  async getFeaturedJobs(limitCount: number = 5): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({ featured: true }, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting featured jobs:', error);
      return this.getJobsFromLocalStorage({ featured: true }, 1, limitCount).jobs;
    }
  }

  async getJobsBySector(sector: string, limitCount: number = 10): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({ sector }, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting jobs by sector:', error);
      return this.getJobsFromLocalStorage({ sector }, 1, limitCount).jobs;
    }
  }

  async getRecentJobs(limitCount: number = 10): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({}, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting recent jobs:', error);
      return this.getJobsFromLocalStorage({}, 1, limitCount).jobs;
    }
  }

  async getStats(): Promise<{
    totalJobs: number;
    totalViews: number;
    totalApplications: number;
    totalShares: number;
    jobsBySector: Record<string, number>;
    jobsByType: Record<string, number>;
    jobsByExperience: Record<string, number>;
  }> {
    try {
      const { jobs } = await this.getJobs({}, 1, 1000);
      
      const stats = {
        totalJobs: jobs.length,
        totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
        totalApplications: jobs.reduce((sum, job) => sum + (job.applications || 0), 0),
        totalShares: jobs.reduce((sum, job) => sum + (job.shares || 0), 0),
        jobsBySector: {} as Record<string, number>,
        jobsByType: {} as Record<string, number>,
        jobsByExperience: {} as Record<string, number>
      };

      jobs.forEach(job => {
        stats.jobsBySector[job.sector] = (stats.jobsBySector[job.sector] || 0) + 1;
        stats.jobsByType[job.type] = (stats.jobsByType[job.type] || 0) + 1;
        stats.jobsByExperience[job.experience || 'Not specified'] = (stats.jobsByExperience[job.experience || 'Not specified'] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting job stats:', error);
      
      const cacheData = localStorage.getItem(this.localJobsKey);
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          const jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
          
          return {
            totalJobs: jobs.length,
            totalViews: jobs.reduce((sum: number, job: JobData) => sum + (job.views || 0), 0),
            totalApplications: jobs.reduce((sum: number, job: JobData) => sum + (job.applications || 0), 0),
            totalShares: jobs.reduce((sum: number, job: JobData) => sum + (job.shares || 0), 0),
            jobsBySector: {},
            jobsByType: {},
            jobsByExperience: {}
          };
        } catch (e) {
        }
      }
      
      return {
        totalJobs: 0,
        totalViews: 0,
        totalApplications: 0,
        totalShares: 0,
        jobsBySector: {},
        jobsByType: {},
        jobsByExperience: {}
      };
    }
  }

  async incrementShareCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentShares = data.shares || 0;
          await updateDoc(jobRef, {
            shares: currentShares + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment share count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        const jobIndex = cachedJobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          cachedJobs[jobIndex].shares = (cachedJobs[jobIndex].shares || 0) + 1;
          cachedJobs[jobIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache share count:', e);
      }
    }
  }

  async incrementApplicationCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentApplications = data.applications || 0;
          await updateDoc(jobRef, {
            applications: currentApplications + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment application count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        const jobIndex = cachedJobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          cachedJobs[jobIndex].applications = (cachedJobs[jobIndex].applications || 0) + 1;
          cachedJobs[jobIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache application count:', e);
      }
    }
  }

  async incrementSaveCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentSaves = data.saves || 0;
          await updateDoc(jobRef, {
            saves: currentSaves + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment save count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localJobsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
        
        const jobIndex = cachedJobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          cachedJobs[jobIndex].saves = (cachedJobs[jobIndex].saves || 0) + 1;
          cachedJobs[jobIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localJobsKey, JSON.stringify({
            jobs: cachedJobs,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache save count:', e);
      }
    }
  }

  async clearLocalCache(): Promise<void> {
    localStorage.removeItem(this.localJobsKey);
    localStorage.removeItem('manualJobs');
    console.log('✅ Local job cache cleared');
  }

  async refreshCache(): Promise<void> {
    console.log('🔄 Refreshing job cache...');
    
    await this.clearLocalCache();
    
    const { jobs } = await this.getJobs({}, 1, 1000);
    console.log(`✅ Cache refreshed with ${jobs.length} jobs`);
  }
}

export const firebaseJobService = new FirebaseJobService();