import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  // Initialize Google Analytics
  useEffect(() => {
    const initializeGA = () => {
      if (typeof window.gtag === 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', 'G-SW5M9YN8L5', {
          page_title: document.title,
          page_location: window.location.href,
          send_page_view: false // We'll handle page views manually
        });
      }
    };

    initializeGA();
  }, []);

  // Track page views when route changes
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalytics;