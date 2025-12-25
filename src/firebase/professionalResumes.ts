// src/firebase/professionalResumes.ts - Admin-only resume storage
import { 
  addDoc, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';
import { isAdmin } from '../utils/adminAuth';

// Collection name for professional resumes
const PROFESSIONAL_COLLECTION = 'professional_resumes';

export interface ProfessionalResume {
  id?: string;
  resumeData: any; // Complete resume structure
  clientInfo: {
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  metadata: {
    createdBy: 'careercraft_admin';
    createdAt: Date | any;
    updatedAt: Date | any;
    lastEditedBy: string;
    storageType: 'professional_database';
    version: number;
    resumeId: string;
    isActive: boolean;
  };
  tags?: string[];
  jobType?: string;
  industry?: string;
  experienceLevel?: string;
}

// Save professional resume (admin only)
export const saveProfessionalResume = async (
  resumeData: any,
  clientInfo: {
    email: string;
    name?: string;
    phone?: string;
    notes?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> => {
  
  // Check admin access
  if (!isAdmin()) {
    console.error('❌ Unauthorized: Admin access required');
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    console.error('❌ Firestore not available');
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    // Generate unique resume ID
    const resumeId = `pro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const professionalResume: ProfessionalResume = {
      resumeData: {
        ...resumeData,
        id: resumeId,
        metadata: {
          ...resumeData.metadata,
          isProfessionalResume: true,
          adminCreated: true
        }
      },
      clientInfo: {
        email: clientInfo.email,
        name: clientInfo.name || '',
        phone: clientInfo.phone || '',
        notes: clientInfo.notes || '',
        company: resumeData.personalInfo?.company || ''
      },
      metadata: {
        createdBy: 'careercraft_admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEditedBy: 'admin', // TODO: Replace with actual admin ID
        storageType: 'professional_database',
        version: 1,
        resumeId: resumeId,
        isActive: true
      },
      tags: [],
      jobType: resumeData.personalInfo?.title || '',
      industry: '',
      experienceLevel: getExperienceLevel(resumeData)
    };
    
    // Save to Firestore
    const docRef = await addDoc(
      collection(firestore, PROFESSIONAL_COLLECTION), 
      professionalResume
    );
    
    console.log(`✅ Professional resume saved for ${clientInfo.email}, ID: ${docRef.id}`);
    
    // Also store a reference in localStorage for quick access
    localStorage.setItem(`pro_ref_${clientInfo.email}`, docRef.id);
    
    return { 
      success: true, 
      id: docRef.id 
    };
    
  } catch (error: any) {
    console.error('❌ Failed to save professional resume:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
};

// Update professional resume (admin only) - FIXED: Accepts partial updates
export const updateProfessionalResume = async (
  resumeId: string,
  updates: Partial<ProfessionalResume>
): Promise<{ success: boolean; error?: string }> => {
  
  if (!isAdmin()) {
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    const docRef = doc(firestore, PROFESSIONAL_COLLECTION, resumeId);
    
    // Get current document to preserve existing metadata
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Resume not found' };
    }
    
    const currentData = docSnap.data() as ProfessionalResume;
    
    // Prepare update data
    const updateData: any = {
      ...updates,
      'metadata.updatedAt': serverTimestamp(),
      'metadata.version': (currentData.metadata?.version || 0) + 1
    };
    
    // If metadata is provided in updates, merge it with existing
    if (updates.metadata) {
      updateData.metadata = {
        ...currentData.metadata,
        ...updates.metadata,
        updatedAt: serverTimestamp(),
        version: (currentData.metadata?.version || 0) + 1
      };
    } else {
      // Add individual metadata fields to update
      updateData['metadata.updatedAt'] = serverTimestamp();
      updateData['metadata.version'] = (currentData.metadata?.version || 0) + 1;
    }
    
    await updateDoc(docRef, updateData);
    
    console.log(`✅ Professional resume updated: ${resumeId}`);
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Failed to update professional resume:', error);
    return { success: false, error: error.message };
  }
};

// Get professional resume by ID (admin only)
export const getProfessionalResume = async (
  resumeId: string
): Promise<{ success: boolean; data?: ProfessionalResume; error?: string }> => {
  
  if (!isAdmin()) {
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    const docRef = doc(firestore, PROFESSIONAL_COLLECTION, resumeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: { id: docSnap.id, ...docSnap.data() } as ProfessionalResume 
      };
    } else {
      return { success: false, error: 'Resume not found' };
    }
    
  } catch (error: any) {
    console.error('❌ Failed to get professional resume:', error);
    return { success: false, error: error.message };
  }
};

// List all professional resumes (admin only)
export const listProfessionalResumes = async (
  limitCount: number = 50
): Promise<{ success: boolean; data?: ProfessionalResume[]; error?: string }> => {
  
  if (!isAdmin()) {
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    const q = query(
      collection(firestore, PROFESSIONAL_COLLECTION),
      orderBy('metadata.createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const resumes: ProfessionalResume[] = [];
    
    querySnapshot.forEach((docSnap) => {
      resumes.push({ id: docSnap.id, ...docSnap.data() } as ProfessionalResume);
    });
    
    return { success: true, data: resumes };
    
  } catch (error: any) {
    console.error('❌ Failed to list professional resumes:', error);
    return { success: false, error: error.message };
  }
};

// Search professional resumes by client email (admin only)
export const searchProfessionalResumes = async (
  email: string
): Promise<{ success: boolean; data?: ProfessionalResume[]; error?: string }> => {
  
  if (!isAdmin()) {
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    const q = query(
      collection(firestore, PROFESSIONAL_COLLECTION),
      where('clientInfo.email', '==', email.toLowerCase()),
      orderBy('metadata.createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const resumes: ProfessionalResume[] = [];
    
    querySnapshot.forEach((docSnap) => {
      resumes.push({ id: docSnap.id, ...docSnap.data() } as ProfessionalResume);
    });
    
    return { success: true, data: resumes };
    
  } catch (error: any) {
    console.error('❌ Failed to search professional resumes:', error);
    return { success: false, error: error.message };
  }
};

// Delete professional resume (admin only)
export const deleteProfessionalResume = async (
  resumeId: string
): Promise<{ success: boolean; error?: string }> => {
  
  if (!isAdmin()) {
    return { success: false, error: 'Admin access required' };
  }
  
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return { success: false, error: 'Firestore not available' };
  }
  
  try {
    const docRef = doc(firestore, PROFESSIONAL_COLLECTION, resumeId);
    await deleteDoc(docRef);
    
    console.log(`✅ Professional resume deleted: ${resumeId}`);
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Failed to delete professional resume:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to determine experience level
const getExperienceLevel = (resumeData: any): string => {
  const experiences = resumeData.experiences || [];
  
  if (experiences.length === 0) return 'Fresher';
  
  // Calculate total years of experience
  let totalYears = 0;
  
  experiences.forEach((exp: any) => {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    }
  });
  
  if (totalYears < 1) return 'Fresher';
  if (totalYears < 3) return 'Junior';
  if (totalYears < 7) return 'Mid-level';
  if (totalYears < 15) return 'Senior';
  return 'Executive';
};

export default {
  saveProfessionalResume,
  updateProfessionalResume,
  getProfessionalResume,
  listProfessionalResumes,
  searchProfessionalResumes,
  deleteProfessionalResume
};