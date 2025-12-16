// Firebase storage for resumes
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
  DocumentData
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';

export interface ResumeData {
  id?: string;
  userId: string;
  title: string;
  template: string;
  data: {
    personalInfo: any;
    experience: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastAccessed: Date;
    downloadCount: number;
    shareCount: number;
    isPublic: boolean;
    tags: string[];
  };
  // GDPR compliance
  dataRetentionPeriod: number; // in days (default 730 for 2 years)
  consentGiven: boolean;
}

export class ResumeStorageService {
  private firestore = getFirestoreInstance();
  private collectionName = 'resumes';

  async saveResume(resume: Omit<ResumeData, 'id' | 'metadata'>): Promise<string> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    try {
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resumeRef = doc(this.firestore, this.collectionName, resumeId);

      const resumeData: ResumeData = {
        ...resume,
        id: resumeId,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          lastAccessed: new Date(),
          downloadCount: 0,
          shareCount: 0,
          isPublic: false,
          tags: []
        }
      };

      await setDoc(resumeRef, {
        ...resumeData,
        metadata: {
          ...resumeData.metadata,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastAccessed: serverTimestamp()
        }
      });

      // Also store in localStorage as backup
      localStorage.setItem(`resume_${resumeId}`, JSON.stringify(resumeData));

      return resumeId;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  async getResume(resumeId: string, userId: string): Promise<ResumeData | null> {
    if (!this.firestore) {
      // Fallback to localStorage
      const localData = localStorage.getItem(`resume_${resumeId}`);
      return localData ? JSON.parse(localData) : null;
    }

    try {
      const resumeRef = doc(this.firestore, this.collectionName, resumeId);
      const snapshot = await getDoc(resumeRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data() as ResumeData;

      // Check user access
      if (data.userId !== userId && !data.metadata.isPublic) {
        throw new Error('Unauthorized access to resume');
      }

      // Update last accessed time
      await updateDoc(resumeRef, {
        'metadata.lastAccessed': serverTimestamp()
      });

      return {
        ...data,
        id: snapshot.id
      };
    } catch (error) {
      console.error('Error getting resume:', error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem(`resume_${resumeId}`);
      return localData ? JSON.parse(localData) : null;
    }
  }

  async getUserResumes(userId: string): Promise<ResumeData[]> {
    if (!this.firestore) {
      // Fallback to localStorage
      const resumes: ResumeData[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('resume_')) {
          const data = localStorage.getItem(key);
          if (data) {
            const resume = JSON.parse(data);
            if (resume.userId === userId) {
              resumes.push(resume);
            }
          }
        }
      }
      return resumes.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      );
    }

    try {
      const q = query(
        collection(this.firestore, this.collectionName),
        where('userId', '==', userId),
        orderBy('metadata.updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResumeData[];
    } catch (error) {
      console.error('Error getting user resumes:', error);
      return [];
    }
  }

  async updateResume(resumeId: string, updates: Partial<ResumeData>): Promise<void> {
    if (!this.firestore) {
      // Update localStorage
      const localData = localStorage.getItem(`resume_${resumeId}`);
      if (localData) {
        const resume = JSON.parse(localData);
        const updatedResume = {
          ...resume,
          ...updates,
          metadata: {
            ...resume.metadata,
            updatedAt: new Date()
          }
        };
        localStorage.setItem(`resume_${resumeId}`, JSON.stringify(updatedResume));
      }
      return;
    }

    try {
      const resumeRef = doc(this.firestore, this.collectionName, resumeId);
      await updateDoc(resumeRef, {
        ...updates,
        'metadata.updatedAt': serverTimestamp()
      });

      // Also update localStorage
      const localData = localStorage.getItem(`resume_${resumeId}`);
      if (localData) {
        const resume = JSON.parse(localData);
        const updatedResume = {
          ...resume,
          ...updates,
          metadata: {
            ...resume.metadata,
            updatedAt: new Date()
          }
        };
        localStorage.setItem(`resume_${resumeId}`, JSON.stringify(updatedResume));
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  async deleteResume(resumeId: string, userId: string): Promise<void> {
    if (!this.firestore) {
      localStorage.removeItem(`resume_${resumeId}`);
      return;
    }

    try {
      // Verify ownership
      const resume = await this.getResume(resumeId, userId);
      if (!resume || resume.userId !== userId) {
        throw new Error('Unauthorized to delete resume');
      }

      const resumeRef = doc(this.firestore, this.collectionName, resumeId);
      await deleteDoc(resumeRef);

      // Remove from localStorage
      localStorage.removeItem(`resume_${resumeId}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  async incrementDownloadCount(resumeId: string): Promise<void> {
    if (!this.firestore) return;

    try {
      const resumeRef = doc(this.firestore, this.collectionName, resumeId);
      const snapshot = await getDoc(resumeRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentCount = data.metadata?.downloadCount || 0;
        
        await updateDoc(resumeRef, {
          'metadata.downloadCount': currentCount + 1,
          'metadata.lastAccessed': serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }
}

export const resumeStorage = new ResumeStorageService();