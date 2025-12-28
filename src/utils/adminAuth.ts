// src/utils/adminAuth.ts - UPDATED
import { adminAuthService } from '../services/adminAuthService';

const ADMIN_TOKEN_KEY = 'careercraft_admin_token';

/**
 * Admin Authentication System that syncs with Firebase Cloud Functions backend
 */

// Login admin using backend authentication (asynchronous)
export const adminLogin = async (email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    console.log('🔐 Admin login attempt via backend:', email);
    
    // Call the backend service
    const result = await adminAuthService.login(email, password);
    
    if (result.success) {
      // Store authentication info
      localStorage.setItem(ADMIN_TOKEN_KEY, 'authenticated');
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      localStorage.setItem('admin_email', email);
      
      // Also store in sessionStorage
      sessionStorage.setItem('is_admin', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      
      console.log('✅ Admin login successful via backend');
      return { success: true, user: result.user };
    } else {
      console.log('❌ Admin login failed via backend:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error: any) {
    console.error('🚨 Admin login error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error - please check backend deployment' 
    };
  }
};

// Logout admin (asynchronous)
export const adminLogout = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Call backend service for logout
    const result = await adminAuthService.logout();
    
    if (result.success) {
      // Clear all storage
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem('is_admin');
      localStorage.removeItem('admin_login_time');
      localStorage.removeItem('admin_email');
      
      sessionStorage.removeItem('is_admin');
      sessionStorage.removeItem('admin_login_time');
      
      console.log('✅ Admin logged out via backend');
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
    
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Still clear local data even if backend fails
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_email');
    
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_login_time');
    
    return { success: false, error: error.message };
  }
};

// ✅ FIXED: Add synchronous check (for conditions)
export const isAdminSync = (): boolean => {
  const isAdminLS = localStorage.getItem('is_admin') === 'true';
  const isAdminSS = sessionStorage.getItem('is_admin') === 'true';
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  
  if (!adminToken || (!isAdminLS && !isAdminSS)) {
    return false;
  }
  
  const timestamp = localStorage.getItem('admin_login_time');
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours
    
    // Check if local session is expired
    if (Date.now() - loginTime > maxAge) {
      console.log('⚠️ Local admin session expired, auto-logout');
      // Auto-clear if expired
      clearLocalAdminSession();
      return false;
    }
    return true;
  }
  
  return false;
};

// Check if current user is admin (asynchronous - for backend verification)
export const isAdmin = async (): Promise<boolean> => {
  try {
    // First, quick synchronous check
    if (!isAdminSync()) {
      return false;
    }
    
    // Then verify with backend for accurate status
    const status = await adminAuthService.checkAdminStatus();
    
    console.log('🔍 Admin status check via backend:', {
      isAdminBackend: status.isAdmin,
      valid: status.valid,
      email: status.user?.email
    });
    
    return status.isAdmin === true;
    
  } catch (error) {
    console.error('Error checking admin status:', error);
    
    // Fallback to local storage if backend check fails
    return isAdminSync();
  }
};

// Get admin token
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

// Get admin status (for debugging)
export const getAdminStatus = async () => {
  const adminStatus = await isAdmin();
  
  return {
    isAdmin: adminStatus,
    loginTime: localStorage.getItem('admin_login_time'),
    email: localStorage.getItem('admin_email'),
    tokenExists: !!getAdminToken(),
    backendConnected: true, // Assuming backend is reachable
    localStorage: localStorage.getItem('is_admin') === 'true',
    sessionStorage: sessionStorage.getItem('is_admin') === 'true'
  };
};

// Test backend connection
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('🔍 Testing backend connection...');
    
    const response = await fetch(
      'https://us-central1-careercraft-36711.cloudfunctions.net/debugConfig',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📊 Backend debug info:', data);
    
    return {
      success: true,
      message: 'Backend is reachable',
      data: data
    };
    
  } catch (error: any) {
    console.error('❌ Backend connection test failed:', error);
    
    return {
      success: false,
      message: error.message || 'Backend unreachable - check Firebase Functions deployment',
      data: null
    };
  }
};

// Get admin user info (if logged in)
export const getAdminUser = async () => {
  try {
    const status = await adminAuthService.checkAdminStatus();
    
    if (status.isAdmin && status.user) {
      return {
        uid: status.user.uid,
        email: status.user.email,
        admin: true,
        claims: status.user.claims || {}
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
};

// Check if backend admin functions are configured
export const checkBackendConfig = async (): Promise<{
  configured: boolean;
  message: string;
  emails?: string[];
}> => {
  try {
    const response = await fetch(
      'https://us-central1-careercraft-36711.cloudfunctions.net/debugConfig',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success && data.currentConfig?.adminEmails?.length > 0) {
      return {
        configured: true,
        message: 'Backend admin configuration loaded',
        emails: data.currentConfig.adminEmails
      };
    } else {
      return {
        configured: false,
        message: 'Backend admin configuration not found or empty',
        emails: []
      };
    }
  } catch (error) {
    return {
      configured: false,
      message: 'Cannot connect to backend',
      emails: []
    };
  }
};

// Manual check for admin (without backend verification) - SYNCHRONOUS
export const checkAdminLocally = (): boolean => {
  return isAdminSync();
};

// Clear admin session (local only)
export const clearLocalAdminSession = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('is_admin');
  localStorage.removeItem('admin_login_time');
  localStorage.removeItem('admin_email');
  
  sessionStorage.removeItem('is_admin');
  sessionStorage.removeItem('admin_login_time');
  
  console.log('✅ Local admin session cleared');
};

// Initialize admin status on page load
export const initializeAdminStatus = async (): Promise<{
  isAdmin: boolean;
  email?: string;
  backendStatus: string;
}> => {
  try {
    // Check backend connection first
    const backendTest = await testBackendConnection();
    
    if (!backendTest.success) {
      return {
        isAdmin: false,
        backendStatus: 'offline'
      };
    }
    
    // Check if admin is logged in
    const adminUser = await getAdminUser();
    
    if (adminUser) {
      return {
        isAdmin: true,
        email: adminUser.email,
        backendStatus: 'connected'
      };
    }
    
    return {
      isAdmin: false,
      backendStatus: 'connected'
    };
    
  } catch (error) {
    console.error('Error initializing admin status:', error);
    
    // Fallback to local check
    const isAdminLocal = checkAdminLocally();
    
    return {
      isAdmin: isAdminLocal,
      backendStatus: 'error'
    };
  }
};

// Default export for backward compatibility
export default {
  adminLogin,
  adminLogout,
  isAdmin, // async
  isAdminSync, // sync
  getAdminToken,
  getAdminStatus,
  testBackendConnection,
  getAdminUser,
  checkBackendConfig,
  checkAdminLocally,
  clearLocalAdminSession,
  initializeAdminStatus
};