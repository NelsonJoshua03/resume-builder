// src/components/GoogleAnalytics.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if gtag is already initialized
    if (typeof window.gtag === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JW2bS0D8YB';
      script.async = true;
      document.head.appendChild(script);

      // Initialize gtag
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      
      // Define gtag function with proper typing
      w.gtag = function() {
        w.dataLayer.push(arguments);
      };
      
      w.gtag('js', new Date());
      w.gtag('config', 'G-JW2bS0D8YB', {
        send_page_view: false
      });
    }
  }, []);

  useEffect(() => {
    // Track page view when location changes
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
        send_to: 'G-JW2bS0D8YB'
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;