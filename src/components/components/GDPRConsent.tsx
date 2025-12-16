import React, { useState, useEffect } from 'react';
import { initializeFirebase } from '../firebase/config';

const GDPRConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr_consent');
    if (!consent) {
      setShowConsent(true);
    } else if (consent === 'accepted') {
      // Initialize Firebase only after consent
      initializeFirebase();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr_consent', 'accepted');
    localStorage.setItem('gdpr_consent_date', new Date().toISOString());
    setShowConsent(false);
    
    // Initialize Firebase after consent
    initializeFirebase();
    
    // Send consent event
    if (window.gtag) {
      window.gtag('event', 'consent_given', {
        event_category: 'GDPR',
        event_label: 'accepted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('gdpr_consent', 'declined');
    setShowConsent(false);
    
    // Clear any previously stored analytics
    localStorage.removeItem('firebase_user_id');
    localStorage.removeItem('firebase_session_id');
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy & Cookie Consent
            </h3>
            <p className="text-sm text-gray-600">
              CareerCraft.in uses cookies and similar technologies to provide you with the best experience. 
              We only collect anonymized data for analytics to improve our services. Your data is stored in 
              India and protected under Indian data protection laws. By clicking "Accept", you consent to 
              our data processing as described in our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRConsent;