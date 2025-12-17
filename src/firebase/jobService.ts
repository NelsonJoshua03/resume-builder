// src/firebase/jobService.ts - FIXED INTERFACE
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
  DocumentData,
  addDoc,
  Timestamp,
  limit,
  writeBatch
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';
import { firebaseAnalytics } from './analytics';

// UPDATED: Make postedDate optional in the interface
export interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string; // 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'
  sector: string; // 'IT/Software', 'Engineering', 'Data Science', 'Marketing', etc.
  salary: string;
  description: string;
  requirements: string[];
  postedDate?: string; // ISO string or 'YYYY-MM-DD' - MADE OPTIONAL
  applyLink: string;
  featured?: boolean;
  isActive?: boolean;
  
  // Analytics fields
  views?: number;
  shares?: number;
  applications?: number;
  saves?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date; // Auto-cleanup after 90 days
  
  // Admin fields
  createdBy?: string; // admin userId
  lastUpdatedBy?: string;
  isApproved?: boolean;
  
  // GDPR compliance
  consentGiven?: boolean;
  dataProcessingLocation?: 'IN';
}

// UPDATED: Update the Omit type to include postedDate as optional
export type CreateJobInput = Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'> & {
  postedDate?: string; // Make it explicitly optional
};

export interface JobFilters {
  sector?: string;
  type?: string;
  location?: string;
  searchTerm?: string;
  featured?: boolean;
  isActive?: boolean;
}

export class FirebaseJobService {
  private collectionName = 'jobs';
  private AUTO_CLEANUP_DAYS = 90; // Jobs older than 90 days are auto-cleaned

  constructor() {
    // Auto-cleanup check on initialization with delay
    setTimeout(() => {
      this.checkAndCleanupOldJobs();
    }, 3000); // Wait 3 seconds for Firebase to initialize
  }

  private getFirestore() {
    const firestore = getFirestoreInstance();
    if (!firestore) {
      console.warn('Firestore not initialized. Using localStorage fallback.');
      return null;
    }
    return firestore;
  }

  private async checkAndCleanupOldJobs(): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) {
      console.log('Firestore not available, skipping auto-cleanup');
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      // Convert to Firestore Timestamp
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);
      
      const jobsQuery = query(
        collection(firestore, this.collectionName),
        where('expiresAt', '<', cutoffTimestamp),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(jobsQuery);
      const cleanupPromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          isActive: false,
          updatedAt: serverTimestamp() 
        })
      );

      await Promise.all(cleanupPromises);
      
      if (snapshot.docs.length > 0) {
        console.log(`Auto-cleaned ${snapshot.docs.length} old jobs`);
        
        // Track cleanup event
        const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
        if (hasConsent) {
          firebaseAnalytics.trackEvent({
            eventName: 'jobs_auto_cleaned',
            eventCategory: 'System',
            eventLabel: 'auto_cleanup',
            eventValue: snapshot.docs.length,
            pagePath: '/system',
            pageTitle: 'Auto Cleanup',
            metadata: {
              days_old: this.AUTO_CLEANUP_DAYS,
              cleaned_count: snapshot.docs.length
            },
            consentGiven: hasConsent,
            dataProcessingLocation: 'IN'
          });
        }
      }
    } catch (error) {
      console.error('Error in auto-cleanup:', error);
    }
  }

  // UPDATED: Accept CreateJobInput type instead of Omit<JobData, ...>
  async createJob(jobData: CreateJobInput): Promise<string> {
    const firestore = this.getFirestore();
    
    // Always save to localStorage as primary storage
    const jobId = await this.createJobInLocalStorage(jobData);
    
    // Also try to save to Firebase if available
    if (firestore) {
      try {
        await this.syncJobToFirestore(jobId, jobData);
        console.log(`Job ${jobId} synced to Firebase`);
      } catch (firestoreError) {
        console.warn('Failed to sync job to Firebase, using localStorage only:', firestoreError);
      }
    }
    
    return jobId;
  }

  private async createJobInLocalStorage(jobData: CreateJobInput): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set expiration date (90 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    
    // Set postedDate to current date if not provided
    const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
    
    const completeJobData: JobData = {
      ...jobData,
      id: jobId,
      postedDate, // Use provided or current date
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt,
      isActive: true,
      isApproved: true,
      views: 0,
      shares: 0,
      applications: 0,
      saves: 0,
      dataProcessingLocation: 'IN'
    };

    // Store in localStorage
    localStorage.setItem(`job_${jobId}`, JSON.stringify(completeJobData));
    
    // Also add to manualJobs array for backward compatibility
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    manualJobs.unshift(completeJobData);
    localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
    
    // Update cached jobs
    this.updateLocalCache(completeJobData);
    
    console.log(`Job created in localStorage with ID: ${jobId}`);
    return jobId;
  }

  private async syncJobToFirestore(jobId: string, jobData: CreateJobInput): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) return;

    try {
      const jobRef = doc(firestore, this.collectionName, jobId);
      
      // Set expiration date (90 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
      
      // Set postedDate to current date if not provided
      const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
      
      const completeJobData = {
        ...jobData,
        postedDate, // Use provided or current date
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
        dataProcessingLocation: 'IN'
      };

      await setDoc(jobRef, completeJobData);
      
      // Track job creation
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      if (hasConsent) {
        firebaseAnalytics.trackEvent({
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
            type: jobData.type
          },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      }
    } catch (error) {
      console.error('Error syncing job to Firestore:', error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<JobData | null> {
    const firestore = this.getFirestore();
    
    // Try Firebase first if available
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        const snapshot = await getDoc(jobRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          
          // Convert Firestore timestamps to Date objects
          const jobData: JobData = {
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate()
          } as JobData;

          // Increment view count
          await this.incrementViewCount(jobId);

          // Store in localStorage as cache
          localStorage.setItem(`job_${jobId}`, JSON.stringify(jobData));

          return jobData;
        }
      } catch (firestoreError) {
        console.warn('Failed to get job from Firebase, falling back to localStorage:', firestoreError);
      }
    }
    
    // Fallback to localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      // Update view count
      job.views = (job.views || 0) + 1;
      localStorage.setItem(`job_${jobId}`, JSON.stringify(job));
      return job;
    }
    
    // Also check manualJobs
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const manualJob = manualJobs.find((j: JobData) => j.id === jobId);
    if (manualJob) {
      manualJob.views = (manualJob.views || 0) + 1;
      localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
      localStorage.setItem(`job_${jobId}`, JSON.stringify(manualJob));
      return manualJob;
    }

    return null;
  }

  async getJobs(filters?: JobFilters, page: number = 1, limitPerPage: number = 10): Promise<{ jobs: JobData[], total: number }> {
    const firestore = this.getFirestore();
    
    // Try Firebase first if available
    if (firestore) {
      try {
        let jobsQuery = query(
          collection(firestore, this.collectionName),
          where('isActive', '==', true),
          where('isApproved', '==', true),
          orderBy('createdAt', 'desc')
        );

        // Apply filters
        if (filters?.sector && filters.sector !== 'all') {
          jobsQuery = query(jobsQuery, where('sector', '==', filters.sector));
        }

        if (filters?.type && filters.type !== 'all') {
          jobsQuery = query(jobsQuery, where('type', '==', filters.type));
        }

        if (filters?.location) {
          jobsQuery = query(jobsQuery, where('location', '==', filters.location));
        }

        if (filters?.featured) {
          jobsQuery = query(jobsQuery, where('featured', '==', true));
        }

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

        // Apply search filter if provided
        let filteredJobs = allJobs;
        if (filters?.searchTerm) {
          filteredJobs = allJobs.filter(job =>
            job.title.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
            job.company.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
            job.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * limitPerPage;
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);

        // Cache in localStorage
        localStorage.setItem('cached_jobs', JSON.stringify(filteredJobs));

        return {
          jobs: paginatedJobs,
          total: filteredJobs.length
        };
      } catch (firestoreError) {
        console.warn('Failed to get jobs from Firebase, falling back to localStorage:', firestoreError);
      }
    }
    
    // Fallback to localStorage
    const allJobs = this.getLocalJobs();
    const filteredJobs = this.applyFilters(allJobs, filters);
    const startIndex = (page - 1) * limitPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);
    
    return {
      jobs: paginatedJobs,
      total: filteredJobs.length
    };
  }

  async updateJob(jobId: string, updates: Partial<JobData>): Promise<void> {
    // Update localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      const updatedJob = {
        ...job,
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem(`job_${jobId}`, JSON.stringify(updatedJob));
      
      // Update manualJobs array
      const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      const jobIndex = manualJobs.findIndex((j: JobData) => j.id === jobId);
      if (jobIndex !== -1) {
        manualJobs[jobIndex] = updatedJob;
        localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
      }
    }
    
    // Also try to update Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        await updateDoc(jobRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

        // Track update event
        const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
        if (hasConsent) {
          firebaseAnalytics.trackEvent({
            eventName: 'job_updated',
            eventCategory: 'Job Management',
            eventLabel: updates.title || jobId,
            pagePath: '/admin/job-posting',
            pageTitle: 'Admin Job Posting',
            metadata: { jobId, ...updates },
            consentGiven: hasConsent,
            dataProcessingLocation: 'IN'
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to update job in Firebase:', firestoreError);
      }
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    // Remove from localStorage
    localStorage.removeItem(`job_${jobId}`);
    
    // Remove from manualJobs array
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const updatedJobs = manualJobs.filter((job: JobData) => job.id !== jobId);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Also try to delete from Firebase
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const jobRef = doc(firestore, this.collectionName, jobId);
        await updateDoc(jobRef, {
          isActive: false,
          updatedAt: serverTimestamp()
        });

        // Track deletion event
        const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
        if (hasConsent) {
          firebaseAnalytics.trackEvent({
            eventName: 'job_deleted',
            eventCategory: 'Job Management',
            eventLabel: jobId,
            pagePath: '/admin/job-posting',
            pageTitle: 'Admin Job Posting',
            metadata: { jobId },
            consentGiven: hasConsent,
            dataProcessingLocation: 'IN'
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to delete job from Firebase:', firestoreError);
      }
    }
  }

  async incrementViewCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    
    // Update localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      job.views = (job.views || 0) + 1;
      localStorage.setItem(`job_${jobId}`, JSON.stringify(job));
    }
    
    // Update manualJobs array
    const manualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const jobIndex = manualJobs.findIndex((j: JobData) => j.id === jobId);
    if (jobIndex !== -1) {
      manualJobs[jobIndex].views = (manualJobs[jobIndex].views || 0) + 1;
      localStorage.setItem('manualJobs', JSON.stringify(manualJobs));
    }
    
    // Also update Firebase if available
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
  }

  async incrementShareCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    
    // Update localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      job.shares = (job.shares || 0) + 1;
      localStorage.setItem(`job_${jobId}`, JSON.stringify(job));
    }
    
    // Also update Firebase if available
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
  }

  async incrementApplicationCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    
    // Update localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      job.applications = (job.applications || 0) + 1;
      localStorage.setItem(`job_${jobId}`, JSON.stringify(job));
    }
    
    // Also update Firebase if available
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
  }

  async incrementSaveCount(jobId: string): Promise<void> {
    const firestore = this.getFirestore();
    
    // Update localStorage
    const localData = localStorage.getItem(`job_${jobId}`);
    if (localData) {
      const job = JSON.parse(localData);
      job.saves = (job.saves || 0) + 1;
      localStorage.setItem(`job_${jobId}`, JSON.stringify(job));
    }
    
    // Also update Firebase if available
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
  }

  // UPDATED: Accept CreateJobInput for bulk create
  async bulkCreateJobs(jobsData: CreateJobInput[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // First, create all jobs in localStorage
    for (const jobData of jobsData) {
      try {
        await this.createJobInLocalStorage(jobData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to create job: ${jobData.title} - ${error}`);
      }
    }

    // Then try to sync to Firebase in background
    const firestore = this.getFirestore();
    if (firestore) {
      setTimeout(async () => {
        try {
          console.log('Attempting to sync bulk jobs to Firebase...');
          // We'll sync them one by one to avoid batch errors
          for (const jobData of jobsData) {
            try {
              const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              await this.syncJobToFirestore(jobId, jobData);
              console.log(`Synced job to Firebase: ${jobData.title}`);
            } catch (syncError) {
              console.warn(`Failed to sync job to Firebase: ${jobData.title}`, syncError);
            }
          }
        } catch (batchError) {
          console.error('Batch sync to Firebase failed:', batchError);
        }
      }, 1000);
    }

    // Track bulk creation
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      firebaseAnalytics.trackEvent({
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
    }

    return results;
  }

  async getFeaturedJobs(limitCount: number = 5): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({ featured: true }, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting featured jobs:', error);
      return [];
    }
  }

  async getJobsBySector(sector: string, limitCount: number = 10): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({ sector }, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting jobs by sector:', error);
      return [];
    }
  }

  async getRecentJobs(limitCount: number = 10): Promise<JobData[]> {
    try {
      const { jobs } = await this.getJobs({}, 1, limitCount);
      return jobs;
    } catch (error) {
      console.error('Error getting recent jobs:', error);
      return [];
    }
  }

  async getStats(): Promise<{
    totalJobs: number;
    totalViews: number;
    totalApplications: number;
    totalShares: number;
    jobsBySector: Record<string, number>;
    jobsByType: Record<string, number>;
  }> {
    try {
      const allJobs = this.getLocalJobs();
      
      const stats = {
        totalJobs: allJobs.length,
        totalViews: allJobs.reduce((sum, job) => sum + (job.views || 0), 0),
        totalApplications: allJobs.reduce((sum, job) => sum + (job.applications || 0), 0),
        totalShares: allJobs.reduce((sum, job) => sum + (job.shares || 0), 0),
        jobsBySector: {} as Record<string, number>,
        jobsByType: {} as Record<string, number>
      };

      // Calculate sector distribution
      allJobs.forEach(job => {
        stats.jobsBySector[job.sector] = (stats.jobsBySector[job.sector] || 0) + 1;
        stats.jobsByType[job.type] = (stats.jobsByType[job.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting job stats:', error);
      return {
        totalJobs: 0,
        totalViews: 0,
        totalApplications: 0,
        totalShares: 0,
        jobsBySector: {},
        jobsByType: {}
      };
    }
  }

  // Helper methods for localStorage
  private getLocalJobs(): JobData[] {
    try {
      // First try manualJobs (for backward compatibility)
      const manualJobs = localStorage.getItem('manualJobs');
      if (manualJobs) {
        const jobs = JSON.parse(manualJobs);
        // Ensure all jobs have required fields
        return jobs.map((job: any) => ({
          ...job,
          isActive: job.isActive !== undefined ? job.isActive : true,
          isApproved: job.isApproved !== undefined ? job.isApproved : true,
          views: job.views || 0,
          shares: job.shares || 0,
          applications: job.applications || 0,
          saves: job.saves || 0
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error reading local jobs:', error);
      return [];
    }
  }

  private updateLocalCache(job: JobData) {
    try {
      const cachedJobs = JSON.parse(localStorage.getItem('cached_jobs') || '[]');
      const existingIndex = cachedJobs.findIndex((j: JobData) => j.id === job.id);
      
      if (existingIndex >= 0) {
        cachedJobs[existingIndex] = job;
      } else {
        cachedJobs.unshift(job);
      }
      
      localStorage.setItem('cached_jobs', JSON.stringify(cachedJobs));
    } catch (error) {
      console.error('Error updating local cache:', error);
    }
  }

  private applyFilters(jobs: JobData[], filters?: JobFilters): JobData[] {
    let filteredJobs = [...jobs];

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

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    return filteredJobs;
  }

  // Test Firebase connection
  async testFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
    const firestore = this.getFirestore();
    
    if (!firestore) {
      return {
        connected: false,
        message: 'Firestore not initialized. Check Firebase configuration.'
      };
    }

    try {
      // Try a simple query to test connection
      const testQuery = query(
        collection(firestore, this.collectionName),
        limit(1)
      );
      
      await getDocs(testQuery);
      
      return {
        connected: true,
        message: 'Firebase connection successful!'
      };
    } catch (error) {
      return {
        connected: false,
        message: `Firebase connection failed: ${error}`
      };
    }
  }

  // Sync all localStorage jobs to Firebase
  async syncAllToFirebase(): Promise<{ synced: number; failed: number }> {
    const firestore = this.getFirestore();
    if (!firestore) {
      return { synced: 0, failed: 0 };
    }

    const localJobs = this.getLocalJobs();
    let synced = 0;
    let failed = 0;

    console.log(`Syncing ${localJobs.length} jobs to Firebase...`);

    for (const localJob of localJobs) {
      try {
        // Remove id and timestamps for Firebase
        const { id, createdAt, updatedAt, expiresAt, ...jobData } = localJob;
        
        const jobId = id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const jobRef = doc(firestore, this.collectionName, jobId);
        
        const expiresAtDate = expiresAt ? new Date(expiresAt) : new Date();
        expiresAtDate.setDate(expiresAtDate.getDate() + this.AUTO_CLEANUP_DAYS);
        
        await setDoc(jobRef, {
          ...jobData,
          id: jobId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAtDate),
          isActive: true,
          isApproved: true,
          views: localJob.views || 0,
          shares: localJob.shares || 0,
          applications: localJob.applications || 0,
          saves: localJob.saves || 0,
          dataProcessingLocation: 'IN'
        });
        
        synced++;
      } catch (error) {
        console.error(`Failed to sync job: ${localJob.title}`, error);
        failed++;
      }
    }

    console.log(`Sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }
}

export const firebaseJobService = new FirebaseJobService();