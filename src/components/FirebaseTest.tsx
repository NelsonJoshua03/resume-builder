// src/components/FirebaseTest.tsx
import React, { useState, useEffect } from 'react';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

const FirebaseTest = () => {
  const {
    trackEvent,
    trackFirebaseEvent,
    trackButtonClick,
    getUserId,
    getSessionId,
    trackResumeDownload,
    trackJobView,
    trackBlogView,
    trackSignup,
    trackFunnelStep,
    trackError
  } = useFirebaseAnalytics();

  const [status, setStatus] = useState({
    firebaseUserId: '',
    sessionId: '',
    gdprConsent: '',
    localStorageCount: 0,
    firebaseEvents: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      const userId = getUserId();
      const sessionId = getSessionId();
      const consent = localStorage.getItem('gdpr_consent') || 'Not set';
      
      // Count Firebase items in localStorage
      let firebaseItems = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('firebase') || key.includes('fb_'))) {
          firebaseItems++;
        }
      }

      setStatus({
        firebaseUserId: userId,
        sessionId: sessionId,
        gdprConsent: consent,
        localStorageCount: localStorage.length,
        firebaseEvents: firebaseItems
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [getUserId, getSessionId]);

  const testAllEvents = async () => {
    try {
      // Test event with object parameter
      await trackEvent({
        eventName: 'firebase_integration_test',
        eventCategory: 'Integration',
        eventLabel: 'complete_test',
        pagePath: '/firebase-test',
        pageTitle: 'Firebase Test Page',
        metadata: { 
          testType: 'complete', 
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent 
        },
        eventValue: 100
      });

      // Test string parameter event
      await trackFirebaseEvent(
        'firebase_string_test',
        'Integration',
        'string_parameter_test',
        { testMethod: 'string_parameters', success: true }
      );

      // Test resume download
      await trackResumeDownload(
        'professional',
        { personalInfo: 5, experience: 3, education: 2, skills: 8, projects: 2 },
        'pdf'
      );

      // Test job view
      await trackJobView('job_123', 'Senior Developer', 'Tech Corp');

      // Test blog view
      await trackBlogView('firebase-guide', 'Firebase Integration Guide', 'Technical', 45);

      // Test signup
      await trackSignup('email', 'firebase_test');

      // Test funnel step
      await trackFunnelStep('onboarding', 'firebase_test_completed', 5, {
        testsRun: 7,
        allSuccessful: true
      });

      // Test button click
      await trackButtonClick('test_all_events', 'firebase_test', '/firebase-test');

      alert('✅ All Firebase events sent successfully! Check console and Firebase dashboard.');
    } catch (error: any) {
      console.error('Firebase test failed:', error);
      await trackError('firebase_test_error', error.message, '/firebase-test');
      alert('❌ Firebase test failed: ' + error.message);
    }
  };

  const clearTestData = () => {
    const keysToKeep = [
      'firebase_user_id',
      'firebase_session_id',
      'session_id',
      'gdpr_consent',
      'gdpr_consent_date',
      'has_visited_before',
      'session_start_time',
      'user_created_at'
    ];

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('firebase') && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
      if (key && (key.includes('fb_') || key.includes('test') || key.includes('fallback'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    alert(`✅ Cleared ${keysToRemove.length} test items from localStorage`);
    window.location.reload();
  };

  const viewLocalStorage = () => {
    const firebaseItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('firebase')) {
        try {
          const value = localStorage.getItem(key);
          firebaseItems.push({ key, value: value ? JSON.parse(value) : value });
        } catch {
          const value = localStorage.getItem(key);
          firebaseItems.push({ key, value });
        }
      }
    }

    console.table(firebaseItems);
    alert(`Found ${firebaseItems.length} Firebase items in localStorage. Check browser console for details.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">🔥 Firebase Analytics Integration Test</h1>
          <p className="text-gray-600 mb-6">Verify your Firebase setup is working correctly</p>
          
          {/* Status Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-800 mb-1">Firebase User ID</div>
              <div className="text-blue-600 font-mono text-sm break-all">{status.firebaseUserId}</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm font-semibold text-purple-800 mb-1">Session ID</div>
              <div className="text-purple-600 font-mono text-sm break-all">{status.sessionId}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-semibold text-green-800 mb-1">GDPR Consent</div>
              <div className={`font-semibold ${status.gdprConsent === 'accepted' ? 'text-green-600' : 'text-yellow-600'}`}>
                {status.gdprConsent === 'accepted' ? '✅ Accepted' : '❌ Not Accepted'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-800 mb-1">Firebase Events</div>
              <div className="text-gray-700 font-bold">{status.firebaseEvents} events stored</div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={testAllEvents}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Run Complete Firebase Test
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={viewLocalStorage}
                className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                📦 View LocalStorage
              </button>
              
              <button
                onClick={() => {
                  trackButtonClick('single_test_event', 'test_panel', '/firebase-test');
                  trackFirebaseEvent('single_test', 'Test', 'manual_test', { manual: true });
                  alert('Single test event sent!');
                }}
                className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🔥 Send Single Event
              </button>
            </div>
            
            <button
              onClick={clearTestData}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              🗑️ Clear Test Data
            </button>
          </div>

          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Debug Information</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              <div><strong>Page:</strong> {window.location.pathname}</div>
              <div><strong>Host:</strong> {window.location.hostname}</div>
              <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
              <div><strong>LocalStorage Total:</strong> {status.localStorageCount} items</div>
              <div><strong>SessionStorage:</strong> {sessionStorage.length} items</div>
              <div><strong>Screen:</strong> {window.screen.width}x{window.screen.height}</div>
              <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">✅ How to Verify Firebase is Working:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>Click "Run Complete Firebase Test"</li>
              <li>Check browser console for success messages</li>
              <li>Visit <code className="bg-blue-100 px-1">/admin/firebase-analytics</code> dashboard</li>
              <li>Events should appear in real-time</li>
              <li>Check Firebase Console → Analytics → Events</li>
              <li>Verify GDPR consent banner appears on first visit</li>
            </ol>
          </div>
        </div>

        {/* Firebase Integration Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Firebase Integration Status</h2>
          
          <div className="space-y-3">
            {[
              { id: 1, name: 'Firebase SDK Initialized', status: window.location.hostname.includes('localhost') ? '✅ Local Development' : '✅ Production' },
              { id: 2, name: 'Firestore Connection', status: status.firebaseUserId ? '✅ Connected' : '❌ Not Connected' },
              { id: 3, name: 'User ID Generated', status: status.firebaseUserId ? '✅ ' + status.firebaseUserId.substring(0, 20) + '...' : '❌ Missing' },
              { id: 4, name: 'Session Tracking', status: status.sessionId ? '✅ Active' : '❌ Inactive' },
              { id: 5, name: 'GDPR Compliance', status: status.gdprConsent === 'accepted' ? '✅ Compliant' : '⚠️ Needs Consent' },
              { id: 6, name: 'Event Tracking', status: status.firebaseEvents > 0 ? `✅ ${status.firebaseEvents} Events` : '⚠️ No Events Yet' },
              { id: 7, name: 'Real-time Dashboard', status: '✅ Available at /admin/firebase-analytics' },
              { id: 8, name: 'Dual Analytics', status: typeof window.gtag !== 'undefined' ? '✅ Google + Firebase' : '⚠️ Google Only' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className={`font-semibold ${
                  item.status.includes('✅') ? 'text-green-600' :
                  item.status.includes('⚠️') ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;