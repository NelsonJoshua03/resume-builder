// src/hooks/useGoogleAnalytics.ts - PRODUCTION VERSION (FIXED)
import { useCallback, useEffect } from 'react';

// Environment variables (Vite uses import.meta.env)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-WSKZJDJW77';
const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const ENABLE_DEBUG = import.meta.env.VITE_GA_DEBUG_MODE === 'true';
const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.NODE_ENV || 'production';

// Clean localStorage on module load
const cleanCorruptedLocalStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('daily_') || key.startsWith('page_views_') || key === 'careercraft_analytics') {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // Check if it's a number (corrupted)
            const parsed = JSON.parse(value);
            if (typeof parsed === 'number') {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (e) {
          // If parsing fails, remove the key
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    });
    
    if (cleanedCount > 0 && ENABLE_DEBUG) {
      console.log(`🧹 Cleaned ${cleanedCount} corrupted localStorage items`);
    }
    
    // Ensure business_metrics is an object
    try {
      const businessMetrics = localStorage.getItem('business_metrics');
      if (businessMetrics) {
        const parsed = JSON.parse(businessMetrics);
        if (typeof parsed !== 'object' || parsed === null) {
          localStorage.setItem('business_metrics', JSON.stringify({}));
        }
      }
    } catch (e) {
      localStorage.setItem('business_metrics', JSON.stringify({}));
    }
    
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

// Run cleanup on module load
if (typeof window !== 'undefined') {
  cleanCorruptedLocalStorage();
  console.log(`📊 Analytics: ${ENABLE_ANALYTICS ? 'ENABLED' : 'DISABLED'} | Measurement ID: ${GA_MEASUREMENT_ID} | Environment: ${APP_ENV}`);
}

export const useGoogleAnalytics = () => {
  // Helper to detect device type
  const getDeviceType = useCallback(() => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    
    // Tablet detection
    if (/iPad|Tablet|(Android(?!.*Mobile))|(Windows(?!.*Phone))|Kindle|Silk|PlayBook/i.test(userAgent)) {
      return 'tablet';
    }
    // Mobile detection
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  }, []);

  // Helper to detect browser
  const getBrowser = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'other';
  }, []);

  // Helper to track to localStorage for backup - FIXED VERSION
  const trackToLocalStorage = useCallback((eventName: string, parameters: any, device: string) => {
    const enableBackup = import.meta.env.VITE_ANALYTICS_LOCAL_STORAGE_BACKUP === 'true';
    if (!enableBackup) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`;
      
      // Store basic event - FIXED: Ensure events is always an array
      const eventsRaw = localStorage.getItem('careercraft_analytics');
      let events: any[] = [];
      
      try {
        events = eventsRaw ? JSON.parse(eventsRaw) : [];
        if (!Array.isArray(events)) {
          events = [];
        }
      } catch (e) {
        events = [];
      }
      
      events.push({
        event: eventName,
        ...parameters,
        timestamp,
        device,
        browser: getBrowser(),
        session_id: sessionId,
        page: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer || 'direct',
        env: APP_ENV
      });
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('careercraft_analytics', JSON.stringify(events));
      
      // Track daily totals - FIXED: Ensure dailyData is always an object
      const dailyKey = `daily_${today}`;
      const dailyDataRaw = localStorage.getItem(dailyKey);
      let dailyData: Record<string, any> = {};
      
      try {
        if (dailyDataRaw) {
          const parsed = JSON.parse(dailyDataRaw);
          if (typeof parsed === 'object' && parsed !== null) {
            dailyData = parsed;
          }
        }
      } catch (e) {
        dailyData = {};
      }
      
      dailyData.total_events = (dailyData.total_events || 0) + 1;
      dailyData[eventName] = (dailyData[eventName] || 0) + 1;
      dailyData[`device_${device}`] = (dailyData[`device_${device}`] || 0) + 1;
      localStorage.setItem(dailyKey, JSON.stringify(dailyData));
      
      // Log in development
      if (ENABLE_DEBUG) {
        console.log(`📈 Event tracked: ${eventName}`, { ...parameters, device, timestamp });
      }
      
    } catch (error) {
      console.error('Local storage tracking failed:', error);
    }
  }, [getBrowser]);

  // Core tracking function
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    const device = getDeviceType();
    const browser = getBrowser();
    
    // Track to localStorage first (always works)
    trackToLocalStorage(eventName, { ...parameters, browser }, device);
    
    // Send to Google Analytics if enabled
    if (ENABLE_ANALYTICS && typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      try {
        window.gtag('event', eventName, {
          ...parameters,
          device_type: device,
          browser: browser,
          environment: APP_ENV,
          send_to: GA_MEASUREMENT_ID
        });
      } catch (error) {
        console.error('GA tracking error:', error);
      }
    }
  }, [getDeviceType, getBrowser, trackToLocalStorage]);

  // Page view tracking
  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    const device = getDeviceType();
    const browser = getBrowser();
    const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`;
    
    // Initialize session if not exists
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', sessionId);
      localStorage.setItem('session_start', new Date().toISOString());
    }
    
    // Track page view to GA
    if (ENABLE_ANALYTICS && typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        device_type: device,
        browser: browser,
        session_id: sessionId,
        environment: APP_ENV,
        send_to: GA_MEASUREMENT_ID
      });
    }
    
    // Track in localStorage - FIXED: Handle corrupted data
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Increment total page views
      const totalViewsRaw = localStorage.getItem('total_page_views');
      let totalViews = 0;
      try {
        totalViews = totalViewsRaw ? parseInt(totalViewsRaw) : 0;
        if (isNaN(totalViews)) totalViews = 0;
      } catch (e) {
        totalViews = 0;
      }
      localStorage.setItem('total_page_views', (totalViews + 1).toString());
      
      // Track page-specific views
      const pageKey = `page_views_${pagePath.replace(/\//g, '_')}`;
      const pageViewsRaw = localStorage.getItem(pageKey);
      let pageViews = 0;
      try {
        pageViews = pageViewsRaw ? parseInt(pageViewsRaw) : 0;
        if (isNaN(pageViews)) pageViews = 0;
      } catch (e) {
        pageViews = 0;
      }
      localStorage.setItem(pageKey, (pageViews + 1).toString());
      
      // Track unique pages visited in session
      const sessionPagesRaw = localStorage.getItem('session_pages');
      let sessionPages: string[] = [];
      try {
        sessionPages = sessionPagesRaw ? JSON.parse(sessionPagesRaw) : [];
        if (!Array.isArray(sessionPages)) {
          sessionPages = [];
        }
      } catch (e) {
        sessionPages = [];
      }
      
      if (!sessionPages.includes(pagePath)) {
        sessionPages.push(pagePath);
        localStorage.setItem('session_pages', JSON.stringify(sessionPages));
      }
      
      // Track daily unique visitors
      const todayKey = `visitors_${today}`;
      const visitorsTodayRaw = localStorage.getItem(todayKey);
      let visitorsToday: string[] = [];
      try {
        visitorsToday = visitorsTodayRaw ? JSON.parse(visitorsTodayRaw) : [];
        if (!Array.isArray(visitorsToday)) {
          visitorsToday = [];
        }
      } catch (e) {
        visitorsToday = [];
      }
      
      if (!visitorsToday.includes(sessionId)) {
        visitorsToday.push(sessionId);
        localStorage.setItem(todayKey, JSON.stringify(visitorsToday));
      }
      
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }, [getDeviceType, getBrowser]);

  // Resume Download Tracking - Enhanced
  const trackResumeDownload = useCallback((templateType: string, format: string = 'pdf', source: string = 'unknown') => {
    const device = getDeviceType();
    const browser = getBrowser();
    
    trackEvent('resume_downloaded', {
      template_type: templateType,
      format: format,
      source_component: source,
      event_category: 'Resume Builder',
      event_label: `${templateType}_${format}_${device}`
    });
    
    // Enhanced local storage tracking for business insights
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      
      // Business metrics - FIXED: Ensure metrics is always an object
      const businessMetricsRaw = localStorage.getItem('business_metrics');
      let metrics: Record<string, any> = {};
      
      try {
        metrics = businessMetricsRaw ? JSON.parse(businessMetricsRaw) : {};
        if (typeof metrics !== 'object' || metrics === null) {
          metrics = {};
        }
      } catch (e) {
        metrics = {};
      }
      
      // Total downloads
      metrics.total_downloads = (metrics.total_downloads || 0) + 1;
      
      // Template popularity
      metrics.templates = metrics.templates || {};
      metrics.templates[templateType] = (metrics.templates[templateType] || 0) + 1;
      
      // Device distribution
      metrics.devices = metrics.devices || {};
      metrics.devices[device] = (metrics.devices[device] || 0) + 1;
      
      // Daily downloads
      metrics.daily = metrics.daily || {};
      metrics.daily[today] = (metrics.daily[today] || 0) + 1;
      
      // Download history
      const downloadsRaw = localStorage.getItem('download_history');
      let downloads: any[] = [];
      
      try {
        downloads = downloadsRaw ? JSON.parse(downloadsRaw) : [];
        if (!Array.isArray(downloads)) {
          downloads = [];
        }
      } catch (e) {
        downloads = [];
      }
      
      downloads.push({
        template: templateType,
        device,
        browser,
        timestamp,
        date: today,
        source,
        page: window.location.pathname
      });
      
      if (downloads.length > 500) {
        downloads.splice(0, downloads.length - 500);
      }
      
      localStorage.setItem('business_metrics', JSON.stringify(metrics));
      localStorage.setItem('download_history', JSON.stringify(downloads));
      
      // Log success
      if (ENABLE_DEBUG) {
        console.log(`✅ Resume downloaded: ${templateType} on ${device} from ${source}`);
      }
      
    } catch (error) {
      console.error('Resume download tracking failed:', error);
    }
  }, [trackEvent, getDeviceType, getBrowser]);

  // Job Application Tracking
  const trackJobApplication = useCallback((jobId: string, jobTitle: string, company: string) => {
    const device = getDeviceType();
    
    trackEvent('job_applied', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      device_type: device,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
    
    // Business tracking
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Track applications per day
      const dailyAppsRaw = localStorage.getItem(`daily_applications_${today}`);
      let dailyApps = 0;
      try {
        dailyApps = dailyAppsRaw ? parseInt(dailyAppsRaw) : 0;
        if (isNaN(dailyApps)) dailyApps = 0;
      } catch (e) {
        dailyApps = 0;
      }
      localStorage.setItem(`daily_applications_${today}`, (dailyApps + 1).toString());
      
      // Track per company
      const companyKey = `applications_${company.replace(/\s+/g, '_')}`;
      const companyAppsRaw = localStorage.getItem(companyKey);
      let companyApps = 0;
      try {
        companyApps = companyAppsRaw ? parseInt(companyAppsRaw) : 0;
        if (isNaN(companyApps)) companyApps = 0;
      } catch (e) {
        companyApps = 0;
      }
      localStorage.setItem(companyKey, (companyApps + 1).toString());
      
    } catch (error) {
      console.error('Job application tracking failed:', error);
    }
  }, [trackEvent, getDeviceType]);

  // Button Click Tracking
  const trackButtonClick = useCallback((buttonName: string, section: string, page: string) => {
    const device = getDeviceType();
    
    trackEvent('button_click', {
      button_name: buttonName,
      section: section,
      page: page,
      device_type: device,
      event_category: 'User Interaction',
      event_label: `${page}_${section}_${buttonName}`
    });
  }, [trackEvent, getDeviceType]);

  // Error Tracking
  const trackError = useCallback((errorType: string, errorMessage: string, page: string) => {
    const device = getDeviceType();
    
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 200), // Limit length
      page: page,
      device_type: device,
      event_category: 'Errors',
      event_label: errorType
    });
    
    // Log to console in development
    if (ENABLE_DEBUG) {
      console.error(`Error on ${page}:`, errorType, errorMessage);
    }
  }, [trackEvent, getDeviceType]);

  // User Flow Tracking
  const trackUserFlow = useCallback((from: string, to: string, action: string) => {
    const device = getDeviceType();
    
    trackEvent('user_flow', {
      from_page: from,
      to_page: to,
      action: action,
      device_type: device,
      event_category: 'User Navigation',
      event_label: `${from}_to_${to}`
    });
    
    // Track in localStorage for funnel analysis
    try {
      const flowKey = `user_flow_${from}_${to}`;
      const flowCountRaw = localStorage.getItem(flowKey);
      let flowCount = 0;
      try {
        flowCount = flowCountRaw ? parseInt(flowCountRaw) : 0;
        if (isNaN(flowCount)) flowCount = 0;
      } catch (e) {
        flowCount = 0;
      }
      localStorage.setItem(flowKey, (flowCount + 1).toString());
    } catch (error) {
      // Silent fail for flow tracking
    }
  }, [trackEvent, getDeviceType]);

  // Session Management
  const trackSessionStart = useCallback(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const device = getDeviceType();
    const browser = getBrowser();
    
    localStorage.setItem('session_id', sessionId);
    localStorage.setItem('session_start', new Date().toISOString());
    localStorage.setItem('session_device', device);
    localStorage.setItem('session_browser', browser);
    
    trackEvent('session_start', {
      session_id: sessionId,
      device_type: device,
      browser: browser,
      referrer: document.referrer || 'direct',
      landing_page: window.location.pathname,
      event_category: 'Sessions',
      event_label: 'session_started'
    });
    
    // Track unique user if exists
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', userId);
      trackEvent('new_user', { user_id: userId, device_type: device });
    }
    
    // Track returning user
    const lastVisit = localStorage.getItem('last_visit');
    if (lastVisit) {
      const daysSinceLastVisit = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
      trackEvent('returning_user', { 
        user_id: userId, 
        days_since_last_visit: daysSinceLastVisit,
        device_type: device 
      });
    }
    
    localStorage.setItem('last_visit', new Date().toISOString());
    
  }, [trackEvent, getDeviceType, getBrowser]);

  // Get Analytics Data (for admin dashboard)
  const getAnalyticsData = useCallback(() => {
    try {
      // Get business metrics with safe parsing
      let businessMetrics: any = {};
      try {
        const metricsRaw = localStorage.getItem('business_metrics');
        businessMetrics = metricsRaw ? JSON.parse(metricsRaw) : {};
        if (typeof businessMetrics !== 'object') {
          businessMetrics = {};
        }
      } catch (e) {
        businessMetrics = {};
      }
      
      return {
        // Basic metrics
        total_page_views: localStorage.getItem('total_page_views') || '0',
        total_downloads: businessMetrics.total_downloads || 0,
        total_applications: localStorage.getItem('total_job_applications') || '0',
        
        // Device distribution
        device_distribution: businessMetrics.devices || {},
        
        // Template popularity
        template_popularity: businessMetrics.templates || {},
        
        // Today's stats
        today: new Date().toISOString().split('T')[0],
        today_downloads: businessMetrics.daily?.[new Date().toISOString().split('T')[0]] || 0,
        
        // Session data
        session_id: localStorage.getItem('session_id'),
        user_id: localStorage.getItem('user_id'),
        
        // All events (limited)
        recent_events: (() => {
          try {
            const eventsRaw = localStorage.getItem('careercraft_analytics');
            const events = eventsRaw ? JSON.parse(eventsRaw) : [];
            return Array.isArray(events) ? events.slice(-10) : [];
          } catch (e) {
            return [];
          }
        })()
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return {};
    }
  }, []);

  // Reset Analytics (for testing)
  const resetAnalytics = useCallback(() => {
    if (ENABLE_DEBUG) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('session_') || key.startsWith('page_views_') || key.startsWith('downloads_') || 
            key === 'careercraft_analytics' || key === 'business_metrics' || key === 'download_history' ||
            key.startsWith('daily_') || key.startsWith('visitors_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Analytics data reset');
    }
  }, []);

  // Clean localStorage on hook mount
  useEffect(() => {
    cleanCorruptedLocalStorage();
  }, []);

  return {
    // Core tracking
    trackEvent,
    trackPageView,
    
    // Enhanced tracking
    trackResumeDownload,
    trackJobApplication,
    trackButtonClick,
    trackError,
    trackUserFlow,
    trackSessionStart,
    
    // Device info
    getDeviceType,
    getBrowser,
    
    // Data access
    getAnalyticsData,
    resetAnalytics,
    
    // Status
    isAnalyticsEnabled: ENABLE_ANALYTICS,
    
    // Compatibility methods
    trackResumeGeneration: trackResumeDownload,
    trackCTAClick: trackButtonClick,
    trackSocialShare: (platform: string) => trackEvent('social_share', { platform }),
    trackExternalLink: (url: string) => trackEvent('external_link', { url }),
    trackBlogView: (postSlug: string, postTitle: string) => trackEvent('blog_view', { post_slug: postSlug, post_title: postTitle }),
    trackPremiumTemplateView: (templateName: string) => trackEvent('premium_template_view', { template_name: templateName })
  };
};