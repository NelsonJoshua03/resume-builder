// src/components/GoogleAnalytics.tsx - FIXED FOR DUAL TRACKING
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if gtag is already initialized
    if (typeof window.gtag === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SW5M9YN8L5';
      script.async = true;
      document.head.appendChild(script);

      // Initialize gtag
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      
      // Define gtag function
      w.gtag = function() {
        w.dataLayer.push(arguments);
      };
      
      w.gtag('js', new Date());
      
      // Configure for first domain (careercraft.in)
      w.gtag('config', 'G-SW5M9YN8L5', {
        send_page_view: false, // We'll send manually
        debug_mode: process.env.NODE_ENV === 'development', // Debug in dev
        cookie_domain: 'auto',
        cookie_flags: 'SameSite=None;Secure',
        linker: {
          domains: ['careercraft.in', 'www.careercraft.in']
        }
      });
      
      // Configure for second domain (www.careercraft.in)
      w.gtag('config', 'G-WSKZJDJW77', {
        send_page_view: false, // We'll send manually
        debug_mode: process.env.NODE_ENV === 'development', // Debug in dev
        cookie_domain: 'auto',
        cookie_flags: 'SameSite=None;Secure',
        linker: {
          domains: ['careercraft.in', 'www.careercraft.in']
        }
      });
      
      console.log('Google Analytics initialized for both domains');
    }
  }, []);

  useEffect(() => {
    // Track page view for both domains when location changes
    if (typeof window.gtag !== 'undefined') {
      const pageTitle = document.title;
      const pagePath = location.pathname + location.search;
      
      // Send to both measurement IDs
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        send_to: 'G-SW5M9YN8L5'
      });
      
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        send_to: 'G-WSKZJDJW77'
      });
      
      // Enhanced tracking for specific pages
      if (location.pathname === '/') {
        trackHomePageView();
      } else if (location.pathname === '/builder') {
        trackBuilderPageView();
      } else if (location.pathname === '/edit') {
        trackEditPageView();
      }
      
      console.log('Page tracked for both domains:', pagePath);
    }
  }, [location]);

  const trackHomePageView = () => {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    const today = new Date().toISOString().split('T')[0];
    
    // Store daily unique user
    const dailyKey = `daily_user_${today}`;
    const dailyUsers = JSON.parse(localStorage.getItem(dailyKey) || '[]');
    
    if (!dailyUsers.includes(userId)) {
      dailyUsers.push(userId);
      localStorage.setItem(dailyKey, JSON.stringify(dailyUsers));
      
      // Track unique user to both GA properties
      window.gtag('event', 'unique_homepage_visitor', {
        user_id: userId,
        date: today,
        send_to: 'G-SW5M9YN8L5'
      });
      
      window.gtag('event', 'unique_homepage_visitor', {
        user_id: userId,
        date: today,
        send_to: 'G-WSKZJDJW77'
      });
    }
    
    // Send enhanced event to both
    window.gtag('event', 'homepage_view', {
      page_title: 'CareerCraft Home Page',
      unique_visitor: userId,
      send_to: 'G-SW5M9YN8L5'
    });
    
    window.gtag('event', 'homepage_view', {
      page_title: 'CareerCraft Home Page',
      unique_visitor: userId,
      send_to: 'G-WSKZJDJW77'
    });
  };

  const trackBuilderPageView = () => {
    // Track to both properties
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'builder_page_viewed',
      step_number: 2,
      send_to: 'G-SW5M9YN8L5'
    });
    
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'builder_page_viewed',
      step_number: 2,
      send_to: 'G-WSKZJDJW77'
    });
  };

  const trackEditPageView = () => {
    // Track to both properties
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'edit_page_viewed',
      step_number: 3,
      send_to: 'G-SW5M9YN8L5'
    });
    
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'edit_page_viewed',
      step_number: 3,
      send_to: 'G-WSKZJDJW77'
    });
  };

  return null;
};

export default GoogleAnalytics;