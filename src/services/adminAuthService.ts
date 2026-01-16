// src/services/adminAuthService.ts - UPDATED VERSION
import { getAuth, signInWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth';
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
        this.functions = getFunctions(app, 'us-central1');
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
  // In adminAuthService.ts, update the login method:

async login(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    console.log('🔐 Attempting admin login...');
    
    // First try to login with Firebase directly
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin claims
      const tokenResult = await user.getIdTokenResult();
      
      if (tokenResult.claims.admin !== true) {
        // Not an admin, sign out
        await signOut(auth);
        return { 
          success: false, 
          error: 'This account does not have admin privileges' 
        };
      }
      
      // Store session info
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_last_login', Date.now().toString());
      localStorage.setItem('careercraft_admin_token', 'authenticated');
      localStorage.setItem('is_admin', 'true');
      
      console.log('✅ Admin login successful');
      return { 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          claims: tokenResult.claims
        }
      };
      
    } catch (firebaseError: any) {
      console.log('Firebase login failed:', firebaseError.code);
      
      // If user doesn't exist, try creating via backend
      if (firebaseError.code === 'auth/user-not-found') {
        // Call backend to create admin user
        return await this.createAdminUserViaBackend(email, password);
      }
      
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(firebaseError) 
      };
    }
    
  } catch (error: any) {
    console.error('🚨 Admin login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed' 
    };
  }
}

private async createAdminUserViaBackend(email: string, password: string) {
  try {
    const response = await fetch(
      'https://us-central1-careercraft-36711.cloudfunctions.net/adminLogin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password: password 
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Now try to login with the created user
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store session info
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_last_login', Date.now().toString());
      localStorage.setItem('careercraft_admin_token', 'authenticated');
      localStorage.setItem('is_admin', 'true');
      
      return { 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          claims: { admin: true }
        }
      };
    }
    
    return { 
      success: false, 
      error: data.error || 'Backend login failed' 
    };
    
  } catch (error: any) {
    console.error('Backend user creation failed:', error);
    return { 
      success: false, 
      error: 'Failed to create admin user. Please contact administrator.' 
    };
  }
}

private getFirebaseErrorMessage(error: any): string {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/user-not-found':
      return 'User not found. Please contact administrator.';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact administrator.';
    default:
      return error.message || 'Login failed';
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
        // Try to call logout function to log the action
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
      
      // Also clear session storage
      sessionStorage.removeItem('admin_session');
      
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
      
      if (!user) {
        // Check localStorage for admin flag
        const isAdminLocal = localStorage.getItem('is_admin') === 'true';
        if (isAdminLocal) {
          console.log('⚠️ No Firebase user but localStorage says admin');
        }
        return isAdminLocal;
      }
      
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
      // Fallback to localStorage
      return localStorage.getItem('is_admin') === 'true';
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
        'https://us-central1-careercraft-36711.cloudfunctions.net/adminCheck',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        }
      );
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.success === true && data.isAdmin === true;
      
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
    error?: string;
  }> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        // Check localStorage
        const isAdminLocal = localStorage.getItem('is_admin') === 'true';
        const adminEmail = localStorage.getItem('admin_email');
        
        return { 
          isAdmin: isAdminLocal,
          user: isAdminLocal ? { email: adminEmail } : null,
          valid: false 
        };
      }
      
      // Try to get ID token
      let idToken;
      try {
        idToken = await user.getIdToken();
      } catch (tokenError) {
        console.warn('Cannot get ID token:', tokenError);
        return { 
          isAdmin: false,
          valid: false,
          error: 'Cannot get user token'
        };
      }
      
      const response = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/adminCheck',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        }
      );
      
      // Check if response is OK
      if (!response.ok) {
        console.warn('Admin check response not OK:', response.status);
        return { 
          isAdmin: false,
          valid: false,
          error: `Backend error: ${response.status}`
        };
      }
      
      const data = await response.json();
      console.log('Admin check response:', data);
      
      return {
        isAdmin: data.isAdmin === true,
        user: data.user,
        valid: data.valid,
        error: data.error
      };
      
    } catch (error: any) {
      console.warn('Check admin status error:', error);
      return { 
        isAdmin: false,
        valid: false,
        error: error.message 
      };
    }
  }
  
  /**
   * Get current admin user
   */
  async getAdminUser() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        // Check localStorage
        const adminEmail = localStorage.getItem('admin_email');
        if (adminEmail && localStorage.getItem('is_admin') === 'true') {
          return {
            uid: 'local_admin',
            email: adminEmail,
            displayName: 'Local Admin',
            claims: { admin: true }
          };
        }
        return null;
      }
      
      const idTokenResult = await user.getIdTokenResult();
      if (idTokenResult.claims.admin === true) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          claims: idTokenResult.claims
        };
      }
      
      // If no claims, verify with backend
      const isAdmin = await this.verifyAdminToken();
      if (isAdmin) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          claims: { admin: true }
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Get admin user error:', error);
      return null;
    }
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
  
  /**
   * Test backend connection
   */
  async testBackendConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('🔍 Testing backend connection...');
      
      // Test ping endpoint
      const pingResponse = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/ping',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!pingResponse.ok) {
        return {
          success: false,
          message: `Ping failed with status: ${pingResponse.status}`
        };
      }
      
      const pingData = await pingResponse.json();
      
      // Test debug config endpoint
      const debugResponse = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/debugConfig',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const debugData = await debugResponse.json();
      
      return {
        success: true,
        message: 'Backend is reachable and functioning',
        data: {
          ping: pingData,
          debug: debugData
        }
      };
      
    } catch (error: any) {
      console.error('❌ Backend connection test failed:', error);
      
      return {
        success: false,
        message: error.message || 'Backend unreachable - check Firebase Functions deployment',
        data: null
      };
    }
  }
}

// Create singleton instance
export const adminAuthService = new AdminAuthService();