// src/utils/adminAuth.ts - Simple Admin Authentication System
const ADMIN_TOKEN_KEY = 'careercraft_admin_token';

// Get admin password from window variable or use default
const getAdminPassword = (): string => {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return 'YOUR_SECURE_ADMIN_PASSWORD_2025';
  }
  
  // Try to get from window variable (can be set in index.html)
  if ((window as any).REACT_APP_ADMIN_PASSWORD) {
    return (window as any).REACT_APP_ADMIN_PASSWORD;
  }
  
  // Fallback to hardcoded password (CHANGE THIS IN PRODUCTION)
  return 'YOUR_SECURE_ADMIN_PASSWORD_2025';
};

const ADMIN_PASSWORD = getAdminPassword();

export const adminLogin = (password: string): boolean => {
  console.log('Admin login attempt:', { 
    hasPassword: !!password, 
    passwordLength: password.length,
    expectedPassword: ADMIN_PASSWORD.substring(0, 3) + '...' // Log only first 3 chars for security
  });
  
  if (password === ADMIN_PASSWORD) {
    const adminToken = generateAdminToken();
    localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    localStorage.setItem('is_admin', 'true');
    localStorage.setItem('admin_login_time', Date.now().toString());
    
    // Also store in sessionStorage for current session
    sessionStorage.setItem('is_admin', 'true');
    sessionStorage.setItem('admin_login_time', Date.now().toString());
    
    console.log('✅ Admin login successful');
    console.log('Admin token generated:', adminToken.substring(0, 20) + '...');
    return true;
  }
  
  console.log('❌ Admin login failed - password mismatch');
  return false;
};

export const adminLogout = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('is_admin');
  localStorage.removeItem('admin_login_time');
  
  sessionStorage.removeItem('is_admin');
  sessionStorage.removeItem('admin_login_time');
  
  console.log('✅ Admin logged out');
};

export const isAdmin = (): boolean => {
  // Check both localStorage and sessionStorage
  const isAdminLS = localStorage.getItem('is_admin') === 'true';
  const isAdminSS = sessionStorage.getItem('is_admin') === 'true';
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  
  console.log('🔍 Checking admin status:', { 
    isAdminLS, 
    isAdminSS, 
    hasToken: !!adminToken,
    location: window.location.pathname 
  });
  
  // If token exists and is valid
  if (adminToken && (isAdminLS || isAdminSS)) {
    const isValid = validateAdminToken(adminToken);
    console.log('🔑 Token validation result:', isValid);
    return isValid;
  }
  
  console.log('🔒 Not an admin - no valid token or admin flag');
  return false;
};

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const getAdminStatus = () => {
  return {
    isAdmin: isAdmin(),
    loginTime: localStorage.getItem('admin_login_time') || sessionStorage.getItem('admin_login_time'),
    tokenExists: !!getAdminToken(),
    passwordSet: !!ADMIN_PASSWORD,
    isLocalStorage: localStorage.getItem('is_admin') === 'true',
    isSessionStorage: sessionStorage.getItem('is_admin') === 'true'
  };
};

// Helper functions
const generateAdminToken = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `admin_${timestamp}_${random}_careercraft`;
};

const validateAdminToken = (token: string): boolean => {
  try {
    // Basic token validation
    const parts = token.split('_');
    if (parts.length < 3) return false;
    
    const timestamp = parseInt(parts[1]);
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours (longer session for admin)
    
    // Check if token is expired
    if (Date.now() - timestamp > maxAge) {
      console.log('⚠️ Admin token expired, auto-logout');
      adminLogout(); // Auto-logout if expired
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating admin token:', error);
    return false;
  }
};

// Clear admin session on page unload (optional)
if (typeof window !== 'undefined') {
  // Clear admin session if browser is closed
  window.addEventListener('beforeunload', () => {
    // Keep localStorage, but clear sessionStorage
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_login_time');
  });
}

// Export for testing
export const ADMIN_PASSWORD_CONSTANT = ADMIN_PASSWORD;

export default {
  adminLogin,
  adminLogout,
  isAdmin,
  getAdminToken,
  getAdminStatus
};