// src/hooks/useGoogleAnalytics.ts
import { useCallback } from 'react';

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        ...parameters,
        send_to: 'G-JW2bS0D8YB' // Consistent property ID
      });
    }
  }, []);

  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        send_to: 'G-JW2bS0D8YB'
      });
    }
  }, []);

  // ============ RESUME BUILDER EVENTS ============
  const trackResumeGeneration = useCallback((templateType: string, format: string = 'pdf', status: string = 'started') => {
    trackEvent('resume_generation', {
      template_type: templateType,
      format: format,
      status: status,
      event_category: 'Resume Builder',
      event_label: `${templateType}_${format}_${status}`
    });
  }, [trackEvent]);

  const trackResumeDownload = useCallback((templateType: string, format: string = 'pdf') => {
    trackEvent('resume_downloaded', {
      template_type: templateType,
      format: format,
      event_category: 'Resume Builder',
      event_label: `${templateType}_download`
    });
  }, [trackEvent]);

  const trackTemplateChange = useCallback((templateName: string, source: string = 'selector') => {
    trackEvent('template_changed', {
      template_name: templateName,
      source: source,
      event_category: 'Resume Builder',
      event_label: templateName
    });
  }, [trackEvent]);

  // ============ JOB PORTAL EVENTS ============
  const trackJobApplication = useCallback((jobId: string, jobTitle: string, company: string) => {
    trackEvent('job_applied', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobView = useCallback((jobId: string, jobTitle: string, source: string) => {
    trackEvent('job_viewed', {
      job_id: jobId,
      job_title: jobTitle,
      source: source,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobSearch = useCallback((query: string, resultsCount: number, location: string = '') => {
    trackEvent('job_search', {
      search_query: query,
      results_count: resultsCount,
      location: location,
      event_category: 'Job Search',
      event_label: query
    });
  }, [trackEvent]);

  // ============ USER INTERACTION EVENTS ============
  const trackButtonClick = useCallback((buttonName: string, section: string, page: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      section: section,
      page: page,
      event_category: 'User Interaction',
      event_label: `${page}_${section}_${buttonName}`
    });
  }, [trackEvent]);

  const trackCTAClick = useCallback((ctaName: string, location: string, page: string) => {
    trackEvent('cta_click', {
      cta_name: ctaName,
      location: location,
      page: page,
      event_category: 'Conversion',
      event_label: ctaName
    });
  }, [trackEvent]);

  // ============ BLOG EVENTS ============
  const trackBlogView = useCallback((postSlug: string, postTitle: string, category: string, readTime: number = 0) => {
    trackEvent('blog_post_viewed', {
      post_slug: postSlug,
      post_title: postTitle,
      category: category,
      read_time: readTime,
      event_category: 'Blog',
      event_label: postTitle
    });
  }, [trackEvent]);

  const trackBlogSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent('blog_search', {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: 'Blog',
      event_label: searchTerm
    });
  }, [trackEvent]);

  // ============ SOCIAL & SHARING EVENTS ============
  const trackSocialShare = useCallback((platform: string, contentType: string, contentId: string) => {
    trackEvent('social_share', {
      platform: platform,
      content_type: contentType,
      content_id: contentId,
      event_category: 'Social Sharing',
      event_label: `${platform}_${contentType}`
    });
  }, [trackEvent]);

  const trackExternalLink = useCallback((linkText: string, destination: string, page: string) => {
    trackEvent('external_link_click', {
      link_text: linkText,
      destination: destination,
      page: page,
      event_category: 'Outbound Links',
      event_label: destination
    });
  }, [trackEvent]);

  // ============ CONVERSION EVENTS ============
  const trackSignup = useCallback((method: string, source: string) => {
    trackEvent('signup', {
      method: method,
      source: source,
      event_category: 'Conversions',
      event_label: `${method}_signup`
    });
  }, [trackEvent]);

  const trackPremiumTemplateView = useCallback((templateName: string, source: string) => {
    trackEvent('premium_template_view', {
      template_name: templateName,
      source: source,
      event_category: 'Premium Features',
      event_label: templateName
    });
  }, [trackEvent]);

  // ============ SEO & TRAFFIC EVENTS ============
  const trackSearchQuery = useCallback((searchTerm: string, resultsCount: number, source: string = 'internal') => {
    trackEvent('search_query', {
      search_term: searchTerm,
      results_count: resultsCount,
      source: source,
      event_category: 'SEO',
      event_label: searchTerm
    });
  }, [trackEvent]);

  const trackOrganicTraffic = useCallback((keyword: string, source: string, medium: string) => {
    trackEvent('organic_traffic', {
      keyword: keyword,
      source: source,
      medium: medium,
      event_category: 'SEO',
      event_label: keyword
    });
  }, [trackEvent]);

  // ============ ERROR TRACKING ============
  const trackError = useCallback((errorType: string, errorMessage: string, page: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page: page,
      event_category: 'Errors',
      event_label: errorType
    });
  }, [trackEvent]);

  // ============ USER FLOW TRACKING ============
  const trackUserFlow = useCallback((from: string, to: string, action: string) => {
    trackEvent('user_flow', {
      from_page: from,
      to_page: to,
      action: action,
      event_category: 'User Navigation',
      event_label: `${from}_to_${to}`
    });
  }, [trackEvent]);

  // ============ SEARCH TRACKING (for compatibility) ============
  const trackSearch = useCallback((searchTerm: string, resultsCount: number, location: string = '') => {
    trackEvent('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount,
      location: location,
      event_category: 'Search',
      event_label: searchTerm
    });
  }, [trackEvent]);

  return {
    // Core tracking
    trackEvent,
    trackPageView,
    
    // Resume Builder
    trackResumeGeneration,
    trackResumeDownload,
    trackTemplateChange,
    
    // Job Portal
    trackJobApplication,
    trackJobView,
    trackJobSearch,
    
    // User Interactions
    trackButtonClick,
    trackCTAClick,
    
    // Blog
    trackBlogView,
    trackBlogSearch,
    
    // Social & Sharing
    trackSocialShare,
    trackExternalLink,
    
    // Conversions
    trackSignup,
    trackPremiumTemplateView,
    
    // SEO & Traffic
    trackSearchQuery,
    trackOrganicTraffic,
    
    // Errors
    trackError,
    
    // User Flow
    trackUserFlow,
    
    // Compatibility
    trackSearch
  };
};