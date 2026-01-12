// src/firebase/govExamService.ts - COMPLETE UPDATED VERSION WITH AUTO-CLEANUP
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

export interface GovExamData {
  id?: string;
  examName: string;
  organization: string;
  posts: string;
  vacancies: string;
  eligibility: string;
  applicationStartDate: string;
  applicationEndDate: string;
  examDate: string;
  examLevel: string; // UPSC, SSC, Banking, Railway, etc.
  ageLimit: string;
  applicationFee: string;
  examMode: string; // Online, Offline, CBT, Hybrid
  officialWebsite: string;
  notificationLink: string;
  applyLink: string;
  syllabus?: string;
  admitCardDate?: string;
  resultDate?: string;
  
  // Status flags
  featured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  
  // Analytics fields
  views?: number;
  shares?: number;
  applications?: number;
  saves?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  addedTimestamp?: number;
  
  // Metadata
  createdBy?: string;
  lastUpdatedBy?: string;
  
  // GDPR compliance
  consentGiven?: boolean;
  dataProcessingLocation?: 'IN';
}

export type CreateGovExamInput = Omit<GovExamData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'addedTimestamp'> & {
  applicationStartDate: string;
  applicationEndDate: string;
  examDate: string;
};

export interface GovExamFilters {
  examLevel?: string;
  organization?: string;
  searchTerm?: string;
  featured?: boolean;
  isActive?: boolean;
  isNew?: boolean;
  applicationStatus?: 'open' | 'upcoming' | 'closed' | 'all';
}

export class FirebaseGovExamService {
  private collectionName = 'governmentExams';
  private AUTO_CLEANUP_DAYS = 90;
  private firestoreInitialized = false;
  private localExamsKey = 'firebase_gov_exams_cache';
  private syncInProgress = false;

  constructor() {
    this.initializeFirestore();
    setTimeout(() => {
      this.checkAndCleanupOldExams();
    }, 5000);
  }

  private async initializeFirestore(): Promise<void> {
    try {
      console.log('🔄 Initializing Firestore for Government Exams...');
      await initializeFirebase();
      this.firestoreInitialized = true;
      console.log('✅ Firestore initialized for Government Exams');
      
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

  // ✅ CHANGED: Made public instead of private
  async checkAndCleanupOldExams(): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      const examsQuery = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(examsQuery);
      const now = new Date();
      const cutoffTimestamp = cutoffDate.getTime();
      
      const updatePromises: Promise<void>[] = [];
      
      snapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
        const addedTimestamp = data.addedTimestamp || data.createdAt?.toDate?.()?.getTime() || Date.now();
        
        if (addedTimestamp < cutoffTimestamp) {
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
        console.log(`Auto-cleaned ${updatePromises.length} old government exams`);
      }
    } catch (error: any) {
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log('⚠️ Index needed for auto-cleanup query. You can create it in Firebase Console.');
      } else {
        console.error('Error in auto-cleanup:', error);
      }
    }
  }

  async createGovExam(examData: CreateGovExamInput): Promise<string> {
    try {
      const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const firestore = this.getFirestore();
      if (firestore) {
        try {
          await this.createGovExamInFirestore(examId, examData);
          console.log(`✅ Government Exam ${examId} created in Firebase`);
        } catch (firestoreError) {
          console.warn('Failed to create exam in Firebase, saving locally:', firestoreError);
          await this.createGovExamInLocalStorage(examId, examData);
        }
      } else {
        await this.createGovExamInLocalStorage(examId, examData);
      }
      
      return examId;
    } catch (error) {
      console.error('Error creating government exam:', error);
      throw error;
    }
  }

  private async createGovExamInFirestore(examId: string, examData: CreateGovExamInput): Promise<void> {
    const firestore = this.getFirestore();
    if (!firestore) throw new Error('Firestore not initialized');

    const examRef = doc(firestore, this.collectionName, examId);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    const now = Date.now();
    
    const completeExamData = {
      ...examData,
      id: examId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      addedTimestamp: now,
      isActive: true,
      isApproved: true,
      isNew: examData.isNew !== undefined ? examData.isNew : true,
      views: 0,
      shares: 0,
      applications: 0,
      saves: 0,
      dataProcessingLocation: 'IN'
    };

    await setDoc(examRef, completeExamData);
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'gov_exam_created',
          eventCategory: 'Government Exams Management',
          eventLabel: examData.examName,
          eventValue: 1,
          pagePath: '/admin/government-exams',
          pageTitle: 'Admin Government Exams',
          metadata: {
            examId,
            organization: examData.organization,
            examLevel: examData.examLevel,
            applicationStartDate: examData.applicationStartDate,
            applicationEndDate: examData.applicationEndDate,
            isNew: examData.isNew || true
          },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track exam creation event:', error);
      }
    }
  }

  private async createGovExamInLocalStorage(examId: string, examData: CreateGovExamInput): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
    const now = Date.now();
    
    const completeExamData: GovExamData = {
      ...examData,
      id: examId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt,
      addedTimestamp: now,
      isActive: true,
      isApproved: true,
      isNew: examData.isNew !== undefined ? examData.isNew : true,
      views: 0,
      shares: 0,
      applications: 0,
      saves: 0,
      dataProcessingLocation: 'IN'
    };

    const cacheData = localStorage.getItem(this.localExamsKey);
    let cachedExams: any[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
      } catch (e) {
        console.warn('Error parsing cached exams:', e);
      }
    }
    
    cachedExams.unshift(completeExamData);
    
    localStorage.setItem(this.localExamsKey, JSON.stringify({
      exams: cachedExams,
      timestamp: Date.now()
    }));
    
    const manualExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    manualExams.unshift(completeExamData);
    localStorage.setItem('governmentExams', JSON.stringify(manualExams));
    
    console.log(`✅ Government Exam created in localStorage: ${examId}`);
  }

  async getGovExam(examId: string): Promise<GovExamData | null> {
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        const snapshot = await getDoc(examRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const examData: GovExamData = {
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate()
          } as GovExamData;

          await this.incrementViewCount(examId);
          return examData;
        }
      } catch (firestoreError) {
        console.warn('Failed to get exam from Firebase:', firestoreError);
      }
    }
    
    return this.getGovExamFromLocalStorage(examId);
  }

  private async getGovExamFromLocalStorage(examId: string): Promise<GovExamData | null> {
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        const cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        const cachedExam = cachedExams.find((exam: GovExamData) => exam.id === examId);
        if (cachedExam) {
          cachedExam.views = (cachedExam.views || 0) + 1;
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
          return cachedExam;
        }
      } catch (e) {
        console.warn('Error parsing cached exams:', e);
      }
    }
    
    const manualExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    const manualExam = manualExams.find((e: GovExamData) => e.id === examId);
    if (manualExam) {
      manualExam.views = (manualExam.views || 0) + 1;
      localStorage.setItem('governmentExams', JSON.stringify(manualExams));
      return manualExam;
    }

    return null;
  }

  async getGovExams(filters?: GovExamFilters, page: number = 1, limitPerPage: number = 12): Promise<{ exams: GovExamData[], total: number }> {
    const firestore = this.getFirestore();
    
    if (firestore) {
      try {
        console.log('🔄 Fetching government exams from Firebase...');
        
        let conditions: any[] = [
          where('isActive', '==', true),
          where('isApproved', '==', true)
        ];
        
        if (filters?.examLevel && filters.examLevel !== 'all') {
          conditions.push(where('examLevel', '==', filters.examLevel));
        }
        
        if (filters?.organization && filters.organization !== 'all') {
          conditions.push(where('organization', '==', filters.organization));
        }
        
        if (filters?.featured) {
          conditions.push(where('featured', '==', true));
        }

        if (filters?.isNew) {
          conditions.push(where('isNew', '==', true));
        }
        
        try {
          const examsQuery = query(
            collection(firestore, this.collectionName),
            ...conditions,
            orderBy('createdAt', 'desc')
          );
          
          const snapshot = await getDocs(examsQuery);
          const allExams = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as GovExamData;
          });

          let filteredExams = allExams;
          
          if (filters?.applicationStatus && filters.applicationStatus !== 'all') {
            filteredExams = allExams.filter(exam => {
              const now = new Date();
              const startDate = new Date(exam.applicationStartDate);
              const endDate = new Date(exam.applicationEndDate);
              
              if (filters.applicationStatus === 'open') {
                return now >= startDate && now <= endDate;
              } else if (filters.applicationStatus === 'upcoming') {
                return now < startDate;
              } else if (filters.applicationStatus === 'closed') {
                return now > endDate;
              }
              return true;
            });
          }
          
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredExams = allExams.filter(exam =>
              exam.examName.toLowerCase().includes(searchLower) ||
              exam.organization.toLowerCase().includes(searchLower) ||
              exam.posts.toLowerCase().includes(searchLower)
            );
          }

          filteredExams.sort((a, b) => {
            const timeA = a.addedTimestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.addedTimestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });

          const startIndex = (page - 1) * limitPerPage;
          const paginatedExams = filteredExams.slice(startIndex, startIndex + limitPerPage);

          this.updateLocalCache(allExams);

          return {
            exams: paginatedExams,
            total: filteredExams.length
          };
        } catch (orderByError: any) {
          console.log('OrderBy failed, trying without ordering:', orderByError);
          
          const examsQuery = query(
            collection(firestore, this.collectionName),
            ...conditions
          );
          
          const snapshot = await getDocs(examsQuery);
          const allExams = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              expiresAt: data.expiresAt?.toDate()
            } as GovExamData;
          });

          allExams.sort((a, b) => {
            const timeA = a.addedTimestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.addedTimestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });

          let filteredExams = allExams;
          
          if (filters?.applicationStatus && filters.applicationStatus !== 'all') {
            filteredExams = allExams.filter(exam => {
              const now = new Date();
              const startDate = new Date(exam.applicationStartDate);
              const endDate = new Date(exam.applicationEndDate);
              
              if (filters.applicationStatus === 'open') {
                return now >= startDate && now <= endDate;
              } else if (filters.applicationStatus === 'upcoming') {
                return now < startDate;
              } else if (filters.applicationStatus === 'closed') {
                return now > endDate;
              }
              return true;
            });
          }
          
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredExams = allExams.filter(exam =>
              exam.examName.toLowerCase().includes(searchLower) ||
              exam.organization.toLowerCase().includes(searchLower) ||
              exam.posts.toLowerCase().includes(searchLower)
            );
          }

          const startIndex = (page - 1) * limitPerPage;
          const paginatedExams = filteredExams.slice(startIndex, startIndex + limitPerPage);

          this.updateLocalCache(allExams);

          return {
            exams: paginatedExams,
            total: filteredExams.length
          };
        }
      } catch (firestoreError) {
        console.warn('Failed to get exams from Firebase, using cache:', firestoreError);
      }
    }
    
    return this.getGovExamsFromLocalStorage(filters, page, limitPerPage);
  }

  private updateLocalCache(firebaseExams: GovExamData[]): void {
    try {
      localStorage.setItem(this.localExamsKey, JSON.stringify({
        exams: firebaseExams,
        timestamp: Date.now()
      }));
      
      localStorage.setItem('governmentExams', JSON.stringify(firebaseExams));
    } catch (error) {
      console.warn('Failed to update local cache:', error);
    }
  }

  private getGovExamsFromLocalStorage(filters?: GovExamFilters, page: number = 1, limitPerPage: number = 12): { exams: GovExamData[], total: number } {
    const cacheData = localStorage.getItem(this.localExamsKey);
    let allExams: GovExamData[] = [];
    
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        allExams = Array.isArray(parsed.exams) ? parsed.exams : [];
      } catch (e) {
        console.warn('Error parsing cached exams:', e);
      }
    }
    
    if (allExams.length === 0) {
      allExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    }
    
    // Auto-cleanup: Remove exams older than 90 days
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const recentExams = allExams.filter((exam: GovExamData) => {
      const examTimestamp = exam.addedTimestamp || (exam.createdAt ? new Date(exam.createdAt).getTime() : Date.now());
      return examTimestamp >= ninetyDaysAgo;
    });
    
    if (recentExams.length !== allExams.length) {
      this.updateLocalCache(recentExams);
      allExams = recentExams;
    }
    
    allExams.sort((a, b) => {
      const timeA = a.addedTimestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.addedTimestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });
    
    let filteredExams = allExams;
    
    if (filters?.examLevel && filters.examLevel !== 'all') {
      filteredExams = filteredExams.filter(exam => exam.examLevel === filters.examLevel);
    }
    
    if (filters?.organization && filters.organization !== 'all') {
      filteredExams = filteredExams.filter(exam => exam.organization === filters.organization);
    }
    
    if (filters?.featured) {
      filteredExams = filteredExams.filter(exam => exam.featured === true);
    }

    if (filters?.isNew) {
      filteredExams = filteredExams.filter(exam => exam.isNew === true);
    }
    
    if (filters?.applicationStatus && filters.applicationStatus !== 'all') {
      filteredExams = filteredExams.filter(exam => {
        const now = new Date();
        const startDate = new Date(exam.applicationStartDate);
        const endDate = new Date(exam.applicationEndDate);
        
        if (filters.applicationStatus === 'open') {
          return now >= startDate && now <= endDate;
        } else if (filters.applicationStatus === 'upcoming') {
          return now < startDate;
        } else if (filters.applicationStatus === 'closed') {
          return now > endDate;
        }
        return true;
      });
    }
    
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredExams = filteredExams.filter(exam =>
        exam.examName.toLowerCase().includes(searchTerm) ||
        exam.organization.toLowerCase().includes(searchTerm) ||
        exam.posts.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (page - 1) * limitPerPage;
    const paginatedExams = filteredExams.slice(startIndex, startIndex + limitPerPage);
    
    return {
      exams: paginatedExams,
      total: filteredExams.length
    };
  }

  async updateGovExam(examId: string, updates: Partial<GovExamData>): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        await updateDoc(examRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to update exam in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        const examIndex = cachedExams.findIndex((e: GovExamData) => e.id === examId);
        if (examIndex !== -1) {
          cachedExams[examIndex] = {
            ...cachedExams[examIndex],
            ...updates,
            updatedAt: new Date()
          };
          
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    const manualExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    const examIndex = manualExams.findIndex((e: GovExamData) => e.id === examId);
    if (examIndex !== -1) {
      manualExams[examIndex] = {
        ...manualExams[examIndex],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem('governmentExams', JSON.stringify(manualExams));
    }
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'gov_exam_updated',
          eventCategory: 'Government Exams Management',
          eventLabel: updates.examName || examId,
          pagePath: '/admin/government-exams',
          pageTitle: 'Admin Government Exams',
          metadata: { examId, ...updates },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track exam update event:', error);
      }
    }
  }

  async deleteGovExam(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        await updateDoc(examRef, {
          isActive: false,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to delete exam from Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        cachedExams = cachedExams.filter((exam: GovExamData) => exam.id !== examId);
        
        localStorage.setItem(this.localExamsKey, JSON.stringify({
          exams: cachedExams,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Error updating local cache:', e);
      }
    }
    
    const manualExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    const updatedExams = manualExams.filter((exam: GovExamData) => exam.id !== examId);
    localStorage.setItem('governmentExams', JSON.stringify(updatedExams));
    
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'gov_exam_deleted',
          eventCategory: 'Government Exams Management',
          eventLabel: examId,
          pagePath: '/admin/government-exams',
          pageTitle: 'Admin Government Exams',
          metadata: { examId },
          consentGiven: hasConsent,
          dataProcessingLocation: 'IN'
        });
      } catch (error) {
        console.warn('Failed to track exam deletion event:', error);
      }
    }
  }

  async incrementViewCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        const snapshot = await getDoc(examRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentViews = data.views || 0;
          await updateDoc(examRef, {
            views: currentViews + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment view count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        const examIndex = cachedExams.findIndex((e: GovExamData) => e.id === examId);
        if (examIndex !== -1) {
          cachedExams[examIndex].views = (cachedExams[examIndex].views || 0) + 1;
          cachedExams[examIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache view count:', e);
      }
    }
  }

  async bulkCreateGovExams(examsData: CreateGovExamInput[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const batch = writeBatch(firestore);
        const examIds: string[] = [];
        
        for (const examData of examsData) {
          try {
            const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            examIds.push(examId);
            
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.AUTO_CLEANUP_DAYS);
            const now = Date.now();
            
            const examRef = doc(firestore, this.collectionName, examId);
            batch.set(examRef, {
              ...examData,
              id: examId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              expiresAt: Timestamp.fromDate(expiresAt),
              addedTimestamp: now,
              isActive: true,
              isApproved: true,
              isNew: examData.isNew !== undefined ? examData.isNew : true,
              views: 0,
              shares: 0,
              applications: 0,
              saves: 0,
              dataProcessingLocation: 'IN'
            });
            
            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Failed to prepare exam: ${examData.examName} - ${error.message}`);
          }
        }
        
        if (results.success > 0) {
          await batch.commit();
          console.log(`✅ Successfully created ${results.success} government exams in Firebase`);
        }
      } catch (batchError: any) {
        console.error('Batch creation failed:', batchError);
        results.failed += results.success;
        results.success = 0;
        results.errors.push(`Batch commit failed: ${batchError.message}`);
      }
    }
    
    for (const examData of examsData) {
      try {
        const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.createGovExamInLocalStorage(examId, examData);
      } catch (error: any) {
        if (!firestore) {
          results.failed++;
          results.errors.push(`Failed to create exam in localStorage: ${examData.examName} - ${error.message}`);
        }
      }
    }

    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (hasConsent && results.success > 0) {
      try {
        await firebaseAnalytics.trackEvent({
          eventName: 'gov_exams_bulk_created',
          eventCategory: 'Government Exams Management',
          eventLabel: 'bulk_upload',
          eventValue: results.success,
          pagePath: '/admin/government-exams',
          pageTitle: 'Admin Government Exams',
          metadata: {
            total_exams: examsData.length,
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
      console.log('🔄 Starting sync of government exams to Firebase...');
      
      const firestore = this.getFirestore();
      if (!firestore) {
        console.log('Firestore not available for sync');
        return { synced: 0, failed: 0 };
      }

      const cacheData = localStorage.getItem(this.localExamsKey);
      let localExams: GovExamData[] = [];
      
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          localExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        } catch (e) {
          console.warn('Error parsing cached exams:', e);
        }
      }
      
      if (localExams.length === 0) {
        localExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
      }
      
      if (localExams.length === 0) {
        console.log('No local exams to sync');
        return { synced: 0, failed: 0 };
      }

      console.log(`Found ${localExams.length} local exams to sync`);
      let synced = 0;
      let failed = 0;

      const batch = writeBatch(firestore);
      const batchSize = 500;
      let currentBatch = 0;
      
      for (const localExam of localExams) {
        try {
          const { id, createdAt, updatedAt, expiresAt, addedTimestamp, ...examData } = localExam;
          const examId = id || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const examRef = doc(firestore, this.collectionName, examId);
          
          const expiresAtDate = expiresAt ? new Date(expiresAt) : new Date();
          expiresAtDate.setDate(expiresAtDate.getDate() + this.AUTO_CLEANUP_DAYS);
          
          batch.set(examRef, {
            ...examData,
            id: examId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAtDate),
            addedTimestamp: addedTimestamp || Date.now(),
            isActive: examData.isActive !== undefined ? examData.isActive : true,
            isApproved: examData.isApproved !== undefined ? examData.isApproved : true,
            isNew: examData.isNew !== undefined ? examData.isNew : true,
            views: localExam.views || 0,
            shares: localExam.shares || 0,
            applications: localExam.applications || 0,
            saves: localExam.saves || 0,
            dataProcessingLocation: 'IN'
          });
          
          synced++;
          currentBatch++;
          
          if (currentBatch >= batchSize) {
            await batch.commit();
            currentBatch = 0;
            console.log(`✅ Committed batch of ${batchSize} exams`);
          }
        } catch (error) {
          console.error(`❌ Failed to sync exam: ${localExam.examName}`, error);
          failed++;
        }
      }
      
      if (currentBatch > 0) {
        await batch.commit();
        console.log(`✅ Committed final batch of ${currentBatch} exams`);
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
        const cacheData = localStorage.getItem(this.localExamsKey);
        if (!cacheData) return;
        
        const parsed = JSON.parse(cacheData);
        const localExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        if (localExams.length === 0) return;
        
        const firestore = this.getFirestore();
        if (!firestore) return;
        
        try {
          const firebaseQuery = query(
            collection(firestore, this.collectionName),
            limit(1)
          );
          await getDocs(firebaseQuery);
        } catch (error) {
          console.log('Firebase appears empty, syncing local exams...');
          await this.syncAllToFirebase();
        }
      } catch (error) {
        // Silent error for background sync
      }
    }, 3000);
  }

  async getFeaturedGovExams(limitCount: number = 5): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ featured: true }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('Error getting featured exams:', error);
      return this.getGovExamsFromLocalStorage({ featured: true }, 1, limitCount).exams;
    }
  }

  async getGovExamsByLevel(level: string, limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ examLevel: level }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('Error getting exams by level:', error);
      return this.getGovExamsFromLocalStorage({ examLevel: level }, 1, limitCount).exams;
    }
  }

  async getNewGovExams(limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ isNew: true }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('Error getting new exams:', error);
      return this.getGovExamsFromLocalStorage({ isNew: true }, 1, limitCount).exams;
    }
  }

  async getRecentGovExams(limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({}, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('Error getting recent exams:', error);
      return this.getGovExamsFromLocalStorage({}, 1, limitCount).exams;
    }
  }

  async getStats(): Promise<{
    totalExams: number;
    totalViews: number;
    totalApplications: number;
    totalShares: number;
    examsByLevel: Record<string, number>;
    examsByOrganization: Record<string, number>;
    applicationStatus: {
      open: number;
      upcoming: number;
      closed: number;
    };
  }> {
    try {
      const { exams } = await this.getGovExams({}, 1, 1000);
      
      const stats = {
        totalExams: exams.length,
        totalViews: exams.reduce((sum, exam) => sum + (exam.views || 0), 0),
        totalApplications: exams.reduce((sum, exam) => sum + (exam.applications || 0), 0),
        totalShares: exams.reduce((sum, exam) => sum + (exam.shares || 0), 0),
        examsByLevel: {} as Record<string, number>,
        examsByOrganization: {} as Record<string, number>,
        applicationStatus: {
          open: 0,
          upcoming: 0,
          closed: 0
        }
      };

      const now = new Date();
      
      exams.forEach(exam => {
        stats.examsByLevel[exam.examLevel] = (stats.examsByLevel[exam.examLevel] || 0) + 1;
        stats.examsByOrganization[exam.organization] = (stats.examsByOrganization[exam.organization] || 0) + 1;
        
        const startDate = new Date(exam.applicationStartDate);
        const endDate = new Date(exam.applicationEndDate);
        
        if (now >= startDate && now <= endDate) {
          stats.applicationStatus.open++;
        } else if (now < startDate) {
          stats.applicationStatus.upcoming++;
        } else {
          stats.applicationStatus.closed++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting exam stats:', error);
      
      const cacheData = localStorage.getItem(this.localExamsKey);
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          const exams = Array.isArray(parsed.exams) ? parsed.exams : [];
          
          return {
            totalExams: exams.length,
            totalViews: exams.reduce((sum: number, exam: GovExamData) => sum + (exam.views || 0), 0),
            totalApplications: exams.reduce((sum: number, exam: GovExamData) => sum + (exam.applications || 0), 0),
            totalShares: exams.reduce((sum: number, exam: GovExamData) => sum + (exam.shares || 0), 0),
            examsByLevel: {},
            examsByOrganization: {},
            applicationStatus: {
              open: 0,
              upcoming: 0,
              closed: 0
            }
          };
        } catch (e) {
          // Fall through to default return
        }
      }
      
      return {
        totalExams: 0,
        totalViews: 0,
        totalApplications: 0,
        totalShares: 0,
        examsByLevel: {},
        examsByOrganization: {},
        applicationStatus: {
          open: 0,
          upcoming: 0,
          closed: 0
        }
      };
    }
  }

  async incrementShareCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        const snapshot = await getDoc(examRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentShares = data.shares || 0;
          await updateDoc(examRef, {
            shares: currentShares + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment share count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        const examIndex = cachedExams.findIndex((e: GovExamData) => e.id === examId);
        if (examIndex !== -1) {
          cachedExams[examIndex].shares = (cachedExams[examIndex].shares || 0) + 1;
          cachedExams[examIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache share count:', e);
      }
    }
  }

  async incrementApplicationCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        const snapshot = await getDoc(examRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentApplications = data.applications || 0;
          await updateDoc(examRef, {
            applications: currentApplications + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment application count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        const examIndex = cachedExams.findIndex((e: GovExamData) => e.id === examId);
        if (examIndex !== -1) {
          cachedExams[examIndex].applications = (cachedExams[examIndex].applications || 0) + 1;
          cachedExams[examIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache application count:', e);
      }
    }
  }

  async incrementSaveCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    if (firestore) {
      try {
        const examRef = doc(firestore, this.collectionName, examId);
        const snapshot = await getDoc(examRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const currentSaves = data.saves || 0;
          await updateDoc(examRef, {
            saves: currentSaves + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.warn('Failed to increment save count in Firebase:', firestoreError);
      }
    }
    
    const cacheData = localStorage.getItem(this.localExamsKey);
    if (cacheData) {
      try {
        const parsed = JSON.parse(cacheData);
        let cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        const examIndex = cachedExams.findIndex((e: GovExamData) => e.id === examId);
        if (examIndex !== -1) {
          cachedExams[examIndex].saves = (cachedExams[examIndex].saves || 0) + 1;
          cachedExams[examIndex].updatedAt = new Date();
          
          localStorage.setItem(this.localExamsKey, JSON.stringify({
            exams: cachedExams,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Error updating local cache save count:', e);
      }
    }
  }

  async clearLocalCache(): Promise<void> {
    localStorage.removeItem(this.localExamsKey);
    console.log('✅ Local government exam cache cleared');
  }

  async refreshCache(): Promise<void> {
    console.log('🔄 Refreshing government exam cache...');
    
    await this.clearLocalCache();
    
    const { exams } = await this.getGovExams({}, 1, 1000);
    console.log(`✅ Cache refreshed with ${exams.length} exams`);
  }

  // Helper method to check if application is open
  isApplicationOpen(exam: GovExamData): boolean {
    const now = new Date();
    const startDate = new Date(exam.applicationStartDate);
    const endDate = new Date(exam.applicationEndDate);
    return now >= startDate && now <= endDate;
  }

  // Helper method to get days remaining
  getDaysRemaining(exam: GovExamData): number {
    const now = new Date();
    const endDate = new Date(exam.applicationEndDate);
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  // Get popular exam levels
  getPopularExamLevels(): string[] {
    return [
      'UPSC',
      'SSC',
      'Banking',
      'Railway',
      'Defense',
      'State PSC',
      'Teaching',
      'Police',
      'Engineering',
      'Medical',
      'Judicial',
      'Other'
    ];
  }

  // Get popular organizations
  getPopularOrganizations(): string[] {
    return [
      'UPSC',
      'SSC',
      'IBPS',
      'SBI',
      'RRB',
      'Indian Army',
      'Indian Navy',
      'Indian Air Force',
      'State Government',
      'GATE',
      'UGC',
      'AIIMS',
      'Other'
    ];
  }
}

export const firebaseGovExamService = new FirebaseGovExamService();