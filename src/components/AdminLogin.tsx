// src/components/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminLogin, getAdminStatus } from '../utils/adminAuth';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if already logged in
    const status = getAdminStatus();
    setDebugInfo(status);
    
    if (status.isAdmin) {
      console.log('🔑 Already logged in as admin, redirecting...');
      const returnUrl = getReturnUrl();
      navigate(returnUrl);
    }
  }, [navigate]);

  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('returnUrl') || '/admin/dashboard';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Attempting admin login...');
      console.log('Password entered length:', password.length);
      
      // Use the adminLogin function to check the password
      const success = adminLogin(password);
      
      if (success) {
        // Track admin login
        console.log('🔐 Admin login successful');
        
        // Get updated status
        const status = getAdminStatus();
        setDebugInfo(status);
        
        // Redirect to return URL or dashboard
        const returnUrl = getReturnUrl();
        console.log('Redirecting to:', returnUrl);
        navigate(returnUrl);
      } else {
        setError('Invalid admin password. Please try again.');
        console.log('❌ Admin login failed');
        
        // Update debug info
        setDebugInfo(getAdminStatus());
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = () => {
    console.log('🧪 Quick admin test...');
    console.log('Admin status:', getAdminStatus());
    
    // Try common passwords (for testing only)
    const testPasswords = [
      'YOUR_SECURE_ADMIN_PASSWORD_2025',
      'admin123',
      'password',
      'careercraft2025',
      'careercraftadmin'
    ];
    
    for (const testPwd of testPasswords) {
      const result = adminLogin(testPwd);
      if (result) {
        console.log(`✅ Success with password: ${testPwd.substring(0, 3)}...`);
        alert(`✅ Success! Redirecting to dashboard...`);
        navigate('/admin/dashboard');
        return;
      }
    }
    
    console.log('❌ No test password worked');
    alert('No test password worked. Please check the adminAuth.ts file.');
  };

  const clearAdminSession = () => {
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('careercraft_admin_token');
    
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_login_time');
    
    setDebugInfo(getAdminStatus());
    alert('Admin session cleared. Please login again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <span className="text-white text-3xl">👑</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CareerCraft Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter admin password to access professional resume management system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : 'Login as Admin'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to Home
            </button>
          </div>
        </form>

        {/* Debug Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">🛠️ Debug Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Status:</span>
                <span className={`font-medium ${debugInfo?.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo?.isAdmin ? 'Logged In' : 'Not Logged In'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Local Storage:</span>
                <span className={debugInfo?.isLocalStorage ? 'text-green-600' : 'text-gray-600'}>
                  {debugInfo?.isLocalStorage ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Storage:</span>
                <span className={debugInfo?.isSessionStorage ? 'text-green-600' : 'text-gray-600'}>
                  {debugInfo?.isSessionStorage ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Exists:</span>
                <span className={debugInfo?.tokenExists ? 'text-green-600' : 'text-gray-600'}>
                  {debugInfo?.tokenExists ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Login Time:</span>
                <span className="text-gray-600">
                  {debugInfo?.loginTime ? new Date(parseInt(debugInfo.loginTime)).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-300 mt-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleQuickTest}
                    className="flex-1 bg-yellow-500 text-white text-xs py-1 px-2 rounded hover:bg-yellow-600"
                  >
                    Quick Test
                  </button>
                  <button
                    onClick={clearAdminSession}
                    className="flex-1 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                  >
                    Clear Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🔒</span>
            Admin Access Information
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>For creating professional resumes for email clients</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Access to professional resume database</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Client management and search functionality</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Generate and update client resumes</span>
            </li>
          </ul>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Default Password:</strong> YOUR_SECURE_ADMIN_PASSWORD_2025
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Change this password in <code>src/utils/adminAuth.ts</code> for production
            </p>
          </div>
        </div>
        
        {/* Alternative Login Methods */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Quick Access Links:</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => navigate('/edit?adminMode=true')}
              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
            >
              /edit?adminMode=true
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded"
            >
              /admin/dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;