import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    const w = window as any;
    
    if (typeof w.gtag === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JW2bS0D8YB';
      script.async = true;
      document.head.appendChild(script);

      w.dataLayer = w.dataLayer || [];
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
    const w = window as any;
    if (w.gtag) {
      w.gtag('event', 'page_view', {
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