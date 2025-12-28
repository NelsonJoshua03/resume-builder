// src/services/adminAuthService.ts - SIMPLIFIED VERSION
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { initializeFirebase } from '../firebase/config';

class AdminAuthService {
  private functions: any = null;
  
  constructor() {
    // Initialize Firebase when service is created
    this.initializeFirebase();
  }
  
  private async initializeFirebase() {
    try {
      const { app } = await initializeFirebase();
      if (app) {
        // Get functions instance after Firebase is initialized
        this.functions = getFunctions(app);
        console.log('✅ Firebase initialized for AdminAuthService');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase for AdminAuthService:', error);
    }
  }
  
  private async ensureFunctions() {
    if (!this.functions) {
      await this.initializeFirebase();
    }
    return this.functions;
  }
  
  /**
   * Login admin using backend authentication
   */
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      console.log('🔐 Attempting admin login via backend...');
      
      // Call Cloud Function for admin login
      const response = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/adminLogin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        // Sign in to Firebase with the custom token if provided
        if (data.token) {
          const auth = getAuth();
          await signInWithCustomToken(auth, data.token);
        }
        
        console.log('✅ Admin login successful via backend');
        return { success: true, user: data.user };
      } else {
        console.log('❌ Admin login failed via backend:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
      
    } catch (error: any) {
      console.error('🚨 Admin login error:', error);

      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        return { 
          success: false, 
          error: 'CORS error: Backend not accessible. Please check Firebase Functions deployment.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Network error - please try again' 
      };
    }
  }
  
  /**
   * Logout admin
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // Call logout function to log the action
        try {
          const idToken = await user.getIdToken();
          await fetch(
            'https://us-central1-careercraft-36711.cloudfunctions.net/adminLogout',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: idToken }),
            }
          );
        } catch (error: any) {
          console.warn('Could not call logout function:', error);
        }
        
        // Sign out from Firebase
        await signOut(auth);
      }
      
      // Clear local storage
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_last_login');
      localStorage.removeItem('careercraft_admin_token');
      localStorage.removeItem('is_admin');
      
      console.log('✅ Admin logged out');
      return { success: true };
      
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) return false;
      
      // Get ID token to check claims
      const idTokenResult = await user.getIdTokenResult();
      
      // Check if user has admin claims
      if (idTokenResult.claims.admin === true) {
        return true;
      }
      
      // If no claims in token, verify via backend
      return await this.verifyAdminToken();
      
    } catch (error) {
      console.error('Check admin error:', error);
      return false;
    }
  }
  
  /**
   * Verify admin token with backend
   */
  private async verifyAdminToken(): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) return false;
      
      const idToken = await user.getIdToken();
      
      const response = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/verifyAdminToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        }
      );
      
      const data = await response.json();
      return data.success === true && data.user?.admin === true;
      
    } catch (error) {
      console.error('Verify token error:', error);
      return false;
    }
  }
  
  /**
   * Check admin status quickly without throwing errors
   */
  async checkAdminStatus(): Promise<{
    isAdmin: boolean;
    user?: any;
    valid?: boolean;
  }> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return { isAdmin: false };
      }
      
      const idToken = await user.getIdToken();
      
      const response = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/checkAdminStatus',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        }
      );
      
      const data = await response.json();
      return {
        isAdmin: data.isAdmin === true,
        user: data.user,
        valid: data.valid
      };
      
    } catch (error: any) {
      console.warn('Check admin status error:', error);
      return { isAdmin: false };
    }
  }
  
  /**
   * Get current admin user
   */
  async getAdminUser() {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return null;
    
    try {
      const idTokenResult = await user.getIdTokenResult();
      if (idTokenResult.claims.admin === true) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          claims: idTokenResult.claims
        };
      }
    } catch (error) {
      console.error('Get admin user error:', error);
    }
    
    return null;
  }
  
  /**
   * Create professional resume via backend
   */
  async createProfessionalResume(resumeData: any, clientInfo: any): Promise<{
    success: boolean;
    id?: string;
    error?: string;
  }> {
    try {
      // Get current user token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Ensure functions is initialized
      const functions = await this.ensureFunctions();
      if (!functions) {
        return { success: false, error: 'Firebase Functions not initialized' };
      }
      
      // Call the callable function
      const createResumeFunction = httpsCallable(functions, 'createProfessionalResume');
      const result = await createResumeFunction({
        resumeData,
        clientInfo
      });
      
      const data = result.data as any;
      
      if (data.success) {
        console.log('✅ Professional resume created:', data.id);
        return { success: true, id: data.id };
      } else {
        return { success: false, error: data.error };
      }
      
    } catch (error: any) {
      console.error('Create professional resume error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create professional resume' 
      };
    }
  }
  
  /**
   * Get professional resume via backend
   */
  async getProfessionalResume(resumeId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Get current user token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Ensure functions is initialized
      const functions = await this.ensureFunctions();
      if (!functions) {
        return { success: false, error: 'Firebase Functions not initialized' };
      }
      
      // Call the callable function
      const getResumeFunction = httpsCallable(functions, 'getProfessionalResume');
      const result = await getResumeFunction({ resumeId });
      
      const data = result.data as any;
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
      
    } catch (error: any) {
      console.error('Get professional resume error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get professional resume' 
      };
    }
  }
}

// Create singleton instance
export const adminAuthService = new AdminAuthService();