// src/components/GoogleAnalytics.tsx - FIXED
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if gtag is already initialized
    if (typeof window.gtag === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SW5M9YN8L5'; // CORRECT ID
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
      w.gtag('config', 'G-SW5M9YN8L5', {
        send_page_view: false, // We'll send manually
        debug_mode: process.env.NODE_ENV === 'development' // Debug in dev
      });
      
      console.log('Google Analytics initialized with ID: G-SW5M9YN8L5');
    }
  }, []);

  useEffect(() => {
    // Track page view when location changes
    if (typeof window.gtag !== 'undefined') {
      const pageTitle = document.title;
      const pagePath = location.pathname + location.search;
      
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        send_to: 'G-SW5M9YN8L5'
      });
      
      // Enhanced tracking for specific pages
      if (location.pathname === '/') {
        trackHomePageView();
      } else if (location.pathname === '/builder') {
        trackBuilderPageView();
      } else if (location.pathname === '/edit') {
        trackEditPageView();
      }
      
      console.log('Page tracked:', pagePath);
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
      
      // Track unique user to GA
      window.gtag('event', 'unique_homepage_visitor', {
        user_id: userId,
        date: today,
        send_to: 'G-SW5M9YN8L5'
      });
    }
    
    // Increment daily page views
    const pageKey = `daily_page_views_home_${today}`;
    const currentViews = parseInt(localStorage.getItem(pageKey) || '0');
    localStorage.setItem(pageKey, (currentViews + 1).toString());
    
    // Send enhanced event
    window.gtag('event', 'homepage_view', {
      page_title: 'CareerCraft Home Page',
      unique_visitor: userId,
      daily_view_count: currentViews + 1,
      send_to: 'G-SW5M9YN8L5'
    });
  };

  const trackBuilderPageView = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_resume_builder_views_${today}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Get total resume builder views
    const totalViews = parseInt(localStorage.getItem('total_resume_builder_views') || '0');
    localStorage.setItem('total_resume_builder_views', (totalViews + 1).toString());
    
    // Track funnel step
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'builder_page_viewed',
      step_number: 2,
      send_to: 'G-SW5M9YN8L5'
    });
  };

  const trackEditPageView = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_edit_resume_views_${today}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Track funnel step
    window.gtag('event', 'funnel_step', {
      funnel_name: 'resume_creation',
      step: 'edit_page_viewed',
      step_number: 3,
      send_to: 'G-SW5M9YN8L5'
    });
  };

  return null;
};

export default GoogleAnalytics;