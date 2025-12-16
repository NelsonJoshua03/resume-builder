// src/firebase/jobService.ts - COMPLETE FIREBASE JOB STORAGE
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
  limit
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';
import { firebaseAnalytics } from './analytics';

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
  postedDate: string; // ISO string or 'YYYY-MM-DD'
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

export interface JobFilters {
  sector?: string;
  type?: string;
  location?: string;
  searchTerm?: string;
  featured?: boolean;
  isActive?: boolean;
}

export class FirebaseJobService {
  private firestore = getFirestoreInstance();
  private collectionName = 'jobs';
  private AUTO_CLEANUP_DAYS = 90; // Jobs older than 90 days are auto-cleaned

  constructor() {
    // Auto-cleanup check on initialization
    this.checkAndCleanupOldJobs();
  }

  private async checkAndCleanupOldJobs(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      const jobsQuery = query(
        collection(this.firestore!, this.collectionName),
        where('expiresAt', '<', cutoffDate),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(jobsQuery);
      const cleanupPromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { isActive: false })
      );

      await Promise.all(cleanupPromises);
      
      if (snapshot.docs.length > 0) {
        console.log(`Auto-cleaned ${snapshot.docs.length} old jobs`);
        
        // Track cleanup event
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
          consentGiven: true,
          dataProcessingLocation: 'IN'
        });
      }
    } catch (error) {
      console.error('Error in auto-cleanup:', error);
    }
  }

  async createJob(jobData: Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>): Promise<string> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    try {
      // Generate job ID
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const jobRef = doc(this.firestore, this.collectionName, jobId);

      // Set expiration date (90 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);

      const completeJobData: JobData = {
        ...jobData,
        id: jobId,
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

      await setDoc(jobRef, {
        ...completeJobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
      });

      // Track job creation
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
        consentGiven: true,
        dataProcessingLocation: 'IN'
      });

      return jobId;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<JobData | null> {
    if (!this.firestore) {
      // Fallback to localStorage for offline
      const localData = localStorage.getItem(`job_${jobId}`);
      return localData ? JSON.parse(localData) : null;
    }

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      const snapshot = await getDoc(jobRef);

      if (!snapshot.exists()) {
        return null;
      }

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
    } catch (error) {
      console.error('Error getting job:', error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem(`job_${jobId}`);
      return localData ? JSON.parse(localData) : null;
    }
  }

  async getJobs(filters?: JobFilters, page: number = 1, limitPerPage: number = 10): Promise<{ jobs: JobData[], total: number }> {
    if (!this.firestore) {
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

    try {
      let jobsQuery = query(
        collection(this.firestore, this.collectionName),
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
    } catch (error) {
      console.error('Error getting jobs:', error);
      
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
  }

  async updateJob(jobId: string, updates: Partial<JobData>): Promise<void> {
    if (!this.firestore) {
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
      }
      return;
    }

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      await updateDoc(jobRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update localStorage cache
      const localData = localStorage.getItem(`job_${jobId}`);
      if (localData) {
        const job = JSON.parse(localData);
        const updatedJob = {
          ...job,
          ...updates,
          updatedAt: new Date()
        };
        localStorage.setItem(`job_${jobId}`, JSON.stringify(updatedJob));
      }

      // Track update event
      firebaseAnalytics.trackEvent({
        eventName: 'job_updated',
        eventCategory: 'Job Management',
        eventLabel: updates.title || jobId,
        pagePath: '/admin/job-posting',
        pageTitle: 'Admin Job Posting',
        metadata: { jobId, ...updates },
        consentGiven: true,
        dataProcessingLocation: 'IN'
      });
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    if (!this.firestore) {
      localStorage.removeItem(`job_${jobId}`);
      return;
    }

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      await updateDoc(jobRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      // Remove from localStorage
      localStorage.removeItem(`job_${jobId}`);

      // Track deletion event
      firebaseAnalytics.trackEvent({
        eventName: 'job_deleted',
        eventCategory: 'Job Management',
        eventLabel: jobId,
        pagePath: '/admin/job-posting',
        pageTitle: 'Admin Job Posting',
        metadata: { jobId },
        consentGiven: true,
        dataProcessingLocation: 'IN'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async incrementViewCount(jobId: string): Promise<void> {
    if (!this.firestore) return;

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      const snapshot = await getDoc(jobRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentViews = data.views || 0;
        
        await updateDoc(jobRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        });

        // Update localStorage cache
        const localData = localStorage.getItem(`job_${jobId}`);
        if (localData) {
          const job = JSON.parse(localData);
          localStorage.setItem(`job_${jobId}`, JSON.stringify({
            ...job,
            views: currentViews + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async incrementShareCount(jobId: string): Promise<void> {
    if (!this.firestore) return;

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      const snapshot = await getDoc(jobRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentShares = data.shares || 0;
        
        await updateDoc(jobRef, {
          shares: currentShares + 1,
          updatedAt: serverTimestamp()
        });

        // Update localStorage cache
        const localData = localStorage.getItem(`job_${jobId}`);
        if (localData) {
          const job = JSON.parse(localData);
          localStorage.setItem(`job_${jobId}`, JSON.stringify({
            ...job,
            shares: currentShares + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  }

  async incrementApplicationCount(jobId: string): Promise<void> {
    if (!this.firestore) return;

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      const snapshot = await getDoc(jobRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentApplications = data.applications || 0;
        
        await updateDoc(jobRef, {
          applications: currentApplications + 1,
          updatedAt: serverTimestamp()
        });

        // Update localStorage cache
        const localData = localStorage.getItem(`job_${jobId}`);
        if (localData) {
          const job = JSON.parse(localData);
          localStorage.setItem(`job_${jobId}`, JSON.stringify({
            ...job,
            applications: currentApplications + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error incrementing application count:', error);
    }
  }

  async incrementSaveCount(jobId: string): Promise<void> {
    if (!this.firestore) return;

    try {
      const jobRef = doc(this.firestore, this.collectionName, jobId);
      const snapshot = await getDoc(jobRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentSaves = data.saves || 0;
        
        await updateDoc(jobRef, {
          saves: currentSaves + 1,
          updatedAt: serverTimestamp()
        });

        // Update localStorage cache
        const localData = localStorage.getItem(`job_${jobId}`);
        if (localData) {
          const job = JSON.parse(localData);
          localStorage.setItem(`job_${jobId}`, JSON.stringify({
            ...job,
            saves: currentSaves + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error incrementing save count:', error);
    }
  }

  async bulkCreateJobs(jobsData: Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>[]): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const jobData of jobsData) {
      try {
        await this.createJob(jobData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to create job: ${jobData.title} - ${error}`);
      }
    }

    // Track bulk creation
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
      consentGiven: true,
      dataProcessingLocation: 'IN'
    });

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
      const { jobs } = await this.getJobs({});
      
      const stats = {
        totalJobs: jobs.length,
        totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
        totalApplications: jobs.reduce((sum, job) => sum + (job.applications || 0), 0),
        totalShares: jobs.reduce((sum, job) => sum + (job.shares || 0), 0),
        jobsBySector: {} as Record<string, number>,
        jobsByType: {} as Record<string, number>
      };

      // Calculate sector distribution
      jobs.forEach(job => {
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

  // Helper methods for localStorage fallback
  private getLocalJobs(): JobData[] {
    try {
      const cachedJobs = localStorage.getItem('cached_jobs');
      if (cachedJobs) {
        return JSON.parse(cachedJobs);
      }
      
      // Fallback to old localStorage format
      const manualJobs = localStorage.getItem('manualJobs');
      if (manualJobs) {
        const jobs = JSON.parse(manualJobs);
        return jobs.map((job: any) => ({
          ...job,
          isActive: true,
          isApproved: true,
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

  // Migration utility: Move localStorage jobs to Firebase
  async migrateLocalStorageJobs(): Promise<{ migrated: number; failed: number }> {
    const localJobs = this.getLocalJobs();
    const result = { migrated: 0, failed: 0 };

    for (const localJob of localJobs) {
      try {
        // Remove id and timestamps from local job
        const { id, createdAt, updatedAt, expiresAt, ...jobData } = localJob;
        
        await this.createJob(jobData);
        result.migrated++;
        
        // Remove from localStorage after successful migration
        if (id) {
          localStorage.removeItem(`job_${id}`);
        }
      } catch (error) {
        console.error(`Failed to migrate job: ${localJob.title}`, error);
        result.failed++;
      }
    }

    // Clear old localStorage entries
    localStorage.removeItem('manualJobs');
    localStorage.removeItem('cached_jobs');

    console.log(`Migration complete: ${result.migrated} jobs migrated, ${result.failed} failed`);
    
    return result;
  }
}

export const firebaseJobService = new FirebaseJobService();