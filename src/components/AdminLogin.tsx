// src/components/AdminLogin.tsx - COMPLETE UPDATED FOR BACKEND AUTH
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuthService';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize Firebase Analytics
  const { trackFirebaseEvent, trackPageView } = useFirebaseAnalytics();

  useEffect(() => {
    // Track page view
    trackPageView('/admin/login', 'Admin Login - CareerCraft');
    trackFirebaseEvent('page_view', 'Navigation', 'Admin Login', {
      pagePath: '/admin/login',
      pageTitle: 'Admin Login - CareerCraft'
    });

    // Check if already logged in as admin
    checkAdminStatus();
    
    // Test backend connection
    testBackendConnection();
  }, [navigate]);

  const testBackendConnection = async () => {
    try {
      setBackendStatus('Testing connection...');
      
      // Simple ping to check if backend is reachable
      const response = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/adminLogin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
        }
      );
      
      if (response.status !== 400) {
        setBackendStatus('❌ Unexpected response');
      } else {
        setBackendStatus('✅ Backend reachable');
      }
    } catch (error: any) {
      setBackendStatus('❌ Backend unreachable - Check functions deployment');
      console.error('Backend connection test failed:', error);
    }
  };

  const checkAdminStatus = async () => {
    const status = await adminAuthService.checkAdminStatus();
    setDebugInfo(status);
    
    if (status.isAdmin) {
      console.log('🔑 Already logged in as admin via backend');
      
      // Track already logged in
      trackFirebaseEvent('admin_already_logged_in', 'Admin', 'session_active', {
        email: status.user?.email || 'unknown',
        login_time: new Date().toISOString()
      });
      
      const returnUrl = getReturnUrl();
      navigate(returnUrl);
    }
  };

  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('returnUrl') || '/admin/dashboard';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Attempting secure admin login via backend...');
      
      // Track login attempt
      trackFirebaseEvent('admin_login_attempt', 'Admin', 'login_attempt', {
        email: email,
        method: 'backend',
        timestamp: new Date().toISOString()
      });
      
      // Use the backend service
      const result = await adminAuthService.login(email, password);
      
      if (result.success) {
        console.log('🔐 Admin login successful via backend');
        
        // Track successful login
        trackFirebaseEvent('admin_login_success', 'Admin', 'login_success', {
          email: email,
          method: 'backend',
          login_time: new Date().toISOString()
        });
        
        // Store login info if remember me is checked
        if (rememberMe) {
          localStorage.setItem('remembered_admin_email', email);
        } else {
          localStorage.removeItem('remembered_admin_email');
        }
        
        // Get updated status
        const status = await adminAuthService.checkAdminStatus();
        setDebugInfo(status);
        
        // Redirect
        const returnUrl = getReturnUrl();
        navigate(returnUrl);
      } else {
        setError(result.error || 'Invalid admin credentials');
        console.log('❌ Admin login failed via backend');
        
        // Track failed login
        trackFirebaseEvent('admin_login_failed', 'Admin', 'login_failed', {
          email: email,
          error: result.error,
          reason: 'invalid_credentials'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed - Check backend deployment');
      console.error('Login error:', err);
      
      // Track login exception
      trackFirebaseEvent('admin_login_exception', 'Admin', 'login_exception', {
        email: email,
        error: err.message,
        exception_type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    console.log('🧪 Quick admin test...');
    console.log('Admin status:', await adminAuthService.checkAdminStatus());
    
    // Test with placeholder credentials (show in dev only)
    if (process.env.NODE_ENV === 'development') {
      setEmail('test@careercraft.in');
      setPassword('YOUR_ADMIN_PASSWORD_HERE');
      alert('Test credentials populated. Click Login to test.');
    }
  };

  const clearAdminSession = async () => {
    await adminAuthService.logout();
    setDebugInfo(await adminAuthService.checkAdminStatus());
    alert('Admin session cleared. Please login again.');
    
    // Track manual logout
    trackFirebaseEvent('admin_manual_logout', 'Admin', 'session_cleared', {
      action: 'manual_logout',
      timestamp: new Date().toISOString()
    });
  };

  const testBackendFunctions = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        alert('Please login first');
        return;
      }
      
      const idToken = await user.getIdToken();
      
      // Test verifyAdminToken
      const verifyResponse = await fetch(
        'https://us-central1-careercraft-36711.cloudfunctions.net/verifyAdminToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        }
      );
      
      const verifyData = await verifyResponse.json();
      console.log('Verify token result:', verifyData);
      
      alert(`Backend functions test:\nVerify Token: ${verifyData.success ? '✅' : '❌'}`);
      
    } catch (error: any) {
      console.error('Backend test error:', error);
      alert('Backend test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_admin_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <span className="text-white text-3xl">🔐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CareerCraft Secure Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Backend-authenticated admin access
          </p>
          <div className="mt-2 text-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              backendStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {backendStatus}
            </span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Admin email"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Admin password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setError('');
                setEmail('test@careercraft.in');
                setPassword('YOUR_ADMIN_PASSWORD_HERE');
                alert('Test credentials populated. Click Login to test.');
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Login as Admin
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </form>

        {/* Debug Panel - Show in development */}
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
                <span className="text-gray-600">Token Valid:</span>
                <span className={debugInfo?.valid ? 'text-green-600' : 'text-gray-600'}>
                  {debugInfo?.valid ? 'Yes' : debugInfo?.valid === false ? 'No' : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backend Status:</span>
                <span className={backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {backendStatus}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-300 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleQuickTest}
                    className="bg-yellow-500 text-white text-xs py-1 px-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Quick Test
                  </button>
                  <button
                    onClick={clearAdminSession}
                    className="bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Clear Session
                  </button>
                  <button
                    onClick={testBackendFunctions}
                    className="col-span-2 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Test Backend Functions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🔒</span>
            Backend Authentication Active
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Password verified on Firebase Cloud Functions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>No passwords stored in frontend code</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Secure custom tokens with admin claims</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>All admin actions logged in Firestore</span>
            </li>
          </ul>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Function URL:</strong> https://us-central1-careercraft-36711.cloudfunctions.net/adminLogin
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Change admin password with: <code className="bg-gray-100 px-1 rounded">firebase functions:config:set admin.password="NEW_PASSWORD"</code>
            </p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Quick Access Links:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/edit?adminMode=true')}
              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors"
            >
              /edit?adminMode=true
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded transition-colors"
            >
              /admin/dashboard
            </button>
            <button
              onClick={() => window.open('https://console.firebase.google.com/project/careercraft-36711/functions/logs', '_blank')}
              className="text-xs text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded transition-colors"
            >
              View Logs
            </button>
            <button
              onClick={() => window.open('https://us-central1-careercraft-36711.cloudfunctions.net/', '_blank')}
              className="text-xs text-orange-600 hover:text-orange-800 bg-orange-50 px-2 py-1 rounded transition-colors"
            >
              Functions Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;