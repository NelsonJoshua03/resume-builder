// src/firebase/govExamService.ts - UPDATED WITH SIMPLIFIED QUERIES
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
  examLevel: string;
  ageLimit: string;
  applicationFee: string;
  examMode: string;
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

  constructor() {
    this.initializeFirestore();
  }

  private async initializeFirestore(): Promise<boolean> {
    if (this.firestoreInitialized) return true;
    
    try {
      console.log('🔄 Initializing Firestore for Government Exams...');
      await initializeFirebase();
      const firestore = getFirestoreInstance();
      
      if (!firestore) {
        console.error('❌ Firestore instance is null');
        throw new Error('Firestore instance is null');
      }
      
      this.firestoreInitialized = true;
      console.log('✅ Firestore initialized for Government Exams');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Firestore:', error);
      this.firestoreInitialized = false;
      throw new Error('Firebase initialization failed. Please check your Firebase configuration.');
    }
  }

  private getFirestore() {
    const firestore = getFirestoreInstance();
    if (!firestore) {
      throw new Error('Firestore not available. Please check Firebase configuration and ensure it is properly initialized.');
    }
    return firestore;
  }

  async checkAndCleanupOldExams(): Promise<void> {
    const firestore = this.getFirestore();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUTO_CLEANUP_DAYS);
      
      // SIMPLIFIED: Get all active exams first, then filter in memory
      const examsQuery = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true)
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
        console.log(`✅ Auto-cleaned ${updatePromises.length} old government exams`);
      }
    } catch (error: any) {
      console.warn('⚠️ Auto-cleanup error:', error.message);
    }
  }

  async createGovExam(examData: CreateGovExamInput): Promise<string> {
    try {
      const firestore = this.getFirestore();
      const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.createGovExamInFirestore(examId, examData);
      console.log(`✅ Government Exam ${examId} created in Firebase`);
      
      return examId;
    } catch (error) {
      console.error('❌ Error creating government exam:', error);
      throw error;
    }
  }

  private async createGovExamInFirestore(examId: string, examData: CreateGovExamInput): Promise<void> {
    const firestore = this.getFirestore();

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
      dataProcessingLocation: 'IN',
      consentGiven: true
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
        console.warn('⚠️ Failed to track exam creation event:', error);
      }
    }
  }

  async getGovExam(examId: string): Promise<GovExamData | null> {
    const firestore = this.getFirestore();

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
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get exam from Firebase:', error);
      throw error;
    }
  }

  async getGovExams(filters?: GovExamFilters, page: number = 1, limitPerPage: number = 12): Promise<{ exams: GovExamData[], total: number }> {
    // Ensure Firestore is initialized
    if (!this.firestoreInitialized) {
      await this.initializeFirestore();
    }
    
    const firestore = this.getFirestore();
    
    try {
      console.log('🔄 Fetching government exams from Firestore...');
      
      // SIMPLIFIED: Start with basic query for active exams only
      const conditions: any[] = [
        where('isActive', '==', true)
      ];
      
      // NOTE: Removing complex queries that require indexes
      // We'll do filtering in memory instead
      
      // Create query with just the basic condition
      let q = query(
        collection(firestore, this.collectionName),
        ...conditions
      );
      
      console.log('✅ Using simplified query without ordering');
      
      const snapshot = await getDocs(q);
      console.log(`📊 Found ${snapshot.size} active exams in Firestore`);
      
      if (snapshot.empty) {
        console.log('ℹ️ No active exams found in Firestore');
        return { exams: [], total: 0 };
      }
      
      // Process all exams from snapshot
      const allExams: GovExamData[] = [];
      
      snapshot.docs.forEach(docSnapshot => {
        try {
          const data = docSnapshot.data();
          
          // Parse dates safely
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                          data.createdAt instanceof Date ? data.createdAt : 
                          new Date();
                          
          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                          data.updatedAt instanceof Date ? data.updatedAt : 
                          createdAt;
                          
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : 
                          data.expiresAt instanceof Date ? data.expiresAt : 
                          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          
          const examData: GovExamData = {
            id: docSnapshot.id,
            examName: data.examName || '',
            organization: data.organization || '',
            posts: data.posts || '',
            vacancies: data.vacancies || '',
            eligibility: data.eligibility || '',
            applicationStartDate: data.applicationStartDate || '',
            applicationEndDate: data.applicationEndDate || '',
            examDate: data.examDate || '',
            examLevel: data.examLevel || 'Other',
            ageLimit: data.ageLimit || '',
            applicationFee: data.applicationFee || '',
            examMode: data.examMode || 'Online',
            officialWebsite: data.officialWebsite || '',
            notificationLink: data.notificationLink || '',
            applyLink: data.applyLink || '',
            syllabus: data.syllabus || '',
            admitCardDate: data.admitCardDate || '',
            resultDate: data.resultDate || '',
            featured: data.featured || false,
            isNew: data.isNew !== undefined ? data.isNew : true,
            isActive: data.isActive !== false,
            isApproved: data.isApproved !== false,
            views: data.views || 0,
            shares: data.shares || 0,
            applications: data.applications || 0,
            saves: data.saves || 0,
            createdAt,
            updatedAt,
            expiresAt,
            addedTimestamp: data.addedTimestamp || createdAt.getTime(),
            createdBy: data.createdBy || 'system',
            lastUpdatedBy: data.lastUpdatedBy || 'system',
            consentGiven: data.consentGiven || false,
            dataProcessingLocation: data.dataProcessingLocation || 'IN'
          };
          
          allExams.push(examData);
        } catch (parseError) {
          console.error('❌ Failed to parse exam data:', parseError, docSnapshot.id);
        }
      });
      
      // Apply all filters in memory (to avoid complex indexes)
      let filteredExams = allExams;
      
      // Filter by exam level
      if (filters?.examLevel && filters.examLevel !== 'all') {
        filteredExams = filteredExams.filter(exam => exam.examLevel === filters.examLevel);
      }
      
      // Filter by organization
      if (filters?.organization && filters.organization !== 'all') {
        filteredExams = filteredExams.filter(exam => exam.organization === filters.organization);
      }
      
      // Filter by featured
      if (filters?.featured) {
        filteredExams = filteredExams.filter(exam => exam.featured === true);
      }
      
      // Filter by isNew
      if (filters?.isNew) {
        filteredExams = filteredExams.filter(exam => exam.isNew === true);
      }
      
      // Filter by application status
      if (filters?.applicationStatus && filters.applicationStatus !== 'all') {
        const now = new Date();
        filteredExams = filteredExams.filter(exam => {
          try {
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
          } catch {
            return false;
          }
        });
      }
      
      // Filter by search term
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredExams = filteredExams.filter(exam =>
          exam.examName.toLowerCase().includes(searchLower) ||
          exam.organization.toLowerCase().includes(searchLower) ||
          exam.posts.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by addedTimestamp (newest first)
      filteredExams.sort((a, b) => {
        const timeA = a.addedTimestamp || a.createdAt?.getTime() || 0;
        const timeB = b.addedTimestamp || b.createdAt?.getTime() || 0;
        return timeB - timeA;
      });
      
      // Pagination
      const startIndex = (page - 1) * limitPerPage;
      const paginatedExams = filteredExams.slice(startIndex, startIndex + limitPerPage);
      
      console.log(`✅ Loaded ${paginatedExams.length} exams (page ${page}, total: ${filteredExams.length})`);
      
      return {
        exams: paginatedExams,
        total: filteredExams.length
      };
      
    } catch (error: any) {
      console.error('❌ Failed to get exams from Firestore:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Return empty array to prevent UI crash
      return { exams: [], total: 0 };
    }
  }

  async updateGovExam(examId: string, updates: Partial<GovExamData>): Promise<void> {
    const firestore = this.getFirestore();
    
    const examRef = doc(firestore, this.collectionName, examId);
    await updateDoc(examRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
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
        console.warn('⚠️ Failed to track exam update event:', error);
      }
    }
  }

  async deleteGovExam(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    
    const examRef = doc(firestore, this.collectionName, examId);
    await updateDoc(examRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
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
        console.warn('⚠️ Failed to track exam deletion event:', error);
      }
    }
  }

  async incrementViewCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    
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
  }

  async bulkCreateGovExams(examsData: CreateGovExamInput[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const firestore = this.getFirestore();
    
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
            dataProcessingLocation: 'IN',
            consentGiven: true
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
          console.warn('⚠️ Failed to track bulk create event:', error);
        }
      }

      return results;
    } catch (batchError: any) {
      console.error('❌ Batch creation failed:', batchError);
      results.failed += results.success;
      results.success = 0;
      results.errors.push(`Batch commit failed: ${batchError.message}`);
      throw batchError;
    }
  }

  async testFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const result = await testFirebaseConnection();
      return {
        connected: result.success,
        message: result.message
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `Connection test failed: ${error.message}`
      };
    }
  }

  async getFeaturedGovExams(limitCount: number = 5): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ featured: true }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('❌ Error getting featured exams:', error);
      return [];
    }
  }

  async getGovExamsByLevel(level: string, limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ examLevel: level }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('❌ Error getting exams by level:', error);
      return [];
    }
  }

  async getNewGovExams(limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({ isNew: true }, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('❌ Error getting new exams:', error);
      return [];
    }
  }

  async getRecentGovExams(limitCount: number = 10): Promise<GovExamData[]> {
    try {
      const { exams } = await this.getGovExams({}, 1, limitCount);
      return exams;
    } catch (error) {
      console.error('❌ Error getting recent exams:', error);
      return [];
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
        
        try {
          const startDate = new Date(exam.applicationStartDate);
          const endDate = new Date(exam.applicationEndDate);
          
          if (now >= startDate && now <= endDate) {
            stats.applicationStatus.open++;
          } else if (now < startDate) {
            stats.applicationStatus.upcoming++;
          } else {
            stats.applicationStatus.closed++;
          }
        } catch {
          // If date parsing fails, treat as closed
          stats.applicationStatus.closed++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting exam stats:', error);
      
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
  }

  async incrementApplicationCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    
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
  }

  async incrementSaveCount(examId: string): Promise<void> {
    const firestore = this.getFirestore();
    
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
  }

  // Helper method to check if application is open
  isApplicationOpen(exam: GovExamData): boolean {
    try {
      const now = new Date();
      const startDate = new Date(exam.applicationStartDate);
      const endDate = new Date(exam.applicationEndDate);
      return now >= startDate && now <= endDate;
    } catch {
      return false;
    }
  }

  // Helper method to get days remaining
  getDaysRemaining(exam: GovExamData): number {
    try {
      const now = new Date();
      const endDate = new Date(exam.applicationEndDate);
      const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
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