// src/hooks/useGoogleAnalytics.ts - COMPLETE WITH DUAL TRACKING AND ALL METHODS
import { useCallback } from 'react';

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      // Send to both Measurement IDs
      window.gtag('event', eventName, {
        ...parameters,
        send_to: 'G-SW5M9YN8L5'
      });
      
      window.gtag('event', eventName, {
        ...parameters,
        send_to: 'G-WSKZJDJW77'
      });
    }
  }, []);

  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      // Send to both Measurement IDs
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

  const trackJobView = useCallback((jobId: string, jobTitle: string, company: string, source: string = 'listing') => {
    trackEvent('job_view', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      source: source,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobApplicationSubmit = useCallback((jobId: string, jobTitle: string, company: string, method: string = 'direct') => {
    trackEvent('job_application_submitted', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      method: method,
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

  // ============ ADMIN JOB POSTING EVENTS ============
  const trackJobPostCreate = useCallback((jobId: string, jobTitle: string, category: string) => {
    trackEvent('job_post_created', {
      job_id: jobId,
      job_title: jobTitle,
      category: category,
      event_category: 'Admin Job Posting',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobPostEdit = useCallback((jobId: string, jobTitle: string, action: string = 'edit') => {
    trackEvent('job_post_edited', {
      job_id: jobId,
      job_title: jobTitle,
      action: action,
      event_category: 'Admin Job Posting',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobPostDelete = useCallback((jobId: string, jobTitle: string) => {
    trackEvent('job_post_deleted', {
      job_id: jobId,
      job_title: jobTitle,
      event_category: 'Admin Job Posting',
      event_label: jobTitle
    });
  }, [trackEvent]);

  // ============ JOB DRIVES EVENTS ============
  const trackWalkinDriveView = useCallback((driveId: string, driveTitle: string, company: string) => {
    trackEvent('walkin_drive_view', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      event_category: 'Job Drives',
      event_label: driveTitle
    });
  }, [trackEvent]);

  const trackWalkinDriveRegistration = useCallback((driveId: string, driveTitle: string, company: string) => {
    trackEvent('walkin_drive_registration', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      event_category: 'Job Drives',
      event_label: driveTitle
    });
  }, [trackEvent]);

  // Enhanced drive tracking methods
  const trackJobDriveView = useCallback((driveId: string, driveTitle: string, source: string) => {
    trackEvent('job_drive_view', {
      drive_id: driveId,
      drive_title: driveTitle,
      source: source,
      event_category: 'Job Drives',
      event_label: driveTitle
    });
  }, [trackEvent]);

  const trackJobDriveRegistration = useCallback((driveId: string, driveTitle: string, company: string) => {
    trackEvent('job_drive_registration', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      event_category: 'Job Drives',
      event_label: driveTitle
    });
  }, [trackEvent]);

  const trackWalkinDriveRegistrationEnhanced = useCallback((driveId: string, driveTitle: string, company: string) => {
    trackEvent('walkin_drive_registration_enhanced', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      event_category: 'Job Drives',
      event_label: driveTitle
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

  const trackBlogPostEngagement = useCallback((postSlug: string, postTitle: string, action: string, duration?: number) => {
    trackEvent('blog_post_engagement', {
      post_slug: postSlug,
      post_title: postTitle,
      action: action,
      duration: duration,
      event_category: 'Blog',
      event_label: postTitle
    });
  }, [trackEvent]);

  const trackBlogReadTime = useCallback((postSlug: string, postTitle: string, readTime: number) => {
    trackEvent('blog_read_time', {
      post_slug: postSlug,
      post_title: postTitle,
      read_time: readTime,
      event_category: 'Blog',
      event_label: postTitle
    });
  }, [trackEvent]);

  // ============ GOVERNMENT EXAMS EVENTS ============
  const trackGovExamView = useCallback((examId: string, examName: string, organization: string) => {
    trackEvent('gov_exam_view', {
      exam_id: examId,
      exam_name: examName,
      organization: organization,
      event_category: 'Government Exams',
      event_label: examName
    });
  }, [trackEvent]);

  const trackGovExamApplication = useCallback((examId: string, examName: string, organization: string) => {
    trackEvent('gov_exam_application', {
      exam_id: examId,
      exam_name: examName,
      organization: organization,
      event_category: 'Government Exams',
      event_label: examName
    });
  }, [trackEvent]);

  // ============ JOB DISCIPLINES EVENTS ============
  const trackJobDisciplineView = useCallback((disciplineName: string, pageTitle: string) => {
    trackEvent('job_discipline_view', {
      discipline_name: disciplineName,
      page_title: pageTitle,
      event_category: 'Job Disciplines',
      event_label: disciplineName
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

  // ============ FUNNEL TRACKING EVENTS ============
  const trackFunnelStep = useCallback((funnelName: string, step: string, stepNumber: number, userId?: string) => {
    trackEvent('funnel_step', {
      funnel_name: funnelName,
      step: step,
      step_number: stepNumber,
      user_id: userId || 'anonymous',
      event_category: 'User Funnel',
      event_label: `${funnelName}_${step}`
    });
  }, [trackEvent]);

  // ============ ENGAGEMENT EVENTS ============
  const trackTimeSpent = useCallback((pageName: string, timeSpent: number, section?: string) => {
    trackEvent('time_spent', {
      page_name: pageName,
      time_spent: timeSpent,
      section: section,
      event_category: 'Engagement',
      event_label: pageName
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

  // ============ NEW: DAILY ANALYTICS METHODS ============
  const trackDailyPageView = useCallback((pageName: string, pagePath: string) => {
    const today = new Date().toISOString().split('T')[0];
    trackEvent('daily_page_view', {
      page_name: pageName,
      page_path: pagePath,
      date: today,
      event_category: 'Daily Analytics',
      event_label: pageName
    });
  }, [trackEvent]);

  const trackJobViewEnhanced = useCallback((jobId: string, jobTitle: string, company: string, source: string = 'listing') => {
    trackEvent('job_view_enhanced', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      source: source,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobApplicationSubmitEnhanced = useCallback((jobId: string, jobTitle: string, company: string) => {
    trackEvent('job_application_submitted_enhanced', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      event_category: 'Job Applications',
      event_label: jobTitle
    });
  }, [trackEvent]);

  const trackJobSearchEnhanced = useCallback((searchTerm: string, resultsCount: number, location?: string) => {
    trackEvent('job_search_enhanced', {
      search_term: searchTerm,
      results_count: resultsCount,
      location: location || 'all',
      event_category: 'Job Search',
      event_label: searchTerm
    });
  }, [trackEvent]);

  const trackBlogPostReadEnhanced = useCallback((postSlug: string, postTitle: string, readDuration: number) => {
    trackEvent('blog_post_read_enhanced', {
      post_slug: postSlug,
      post_title: postTitle,
      read_duration: readDuration,
      event_category: 'Blog',
      event_label: postTitle
    });
  }, [trackEvent]);

  const trackJobDisciplineViewEnhanced = useCallback((disciplineName: string, pageTitle: string) => {
    trackEvent('job_discipline_view_enhanced', {
      discipline_name: disciplineName,
      page_title: pageTitle,
      event_category: 'Job Disciplines',
      event_label: disciplineName
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
    trackJobApplicationSubmit,
    trackJobSearch,
    
    // Admin Job Posting
    trackJobPostCreate,
    trackJobPostEdit,
    trackJobPostDelete,
    
    // Job Drives
    trackWalkinDriveView,
    trackWalkinDriveRegistration,
    trackJobDriveView,
    trackJobDriveRegistration,
    trackWalkinDriveRegistrationEnhanced,
    
    // Blog
    trackBlogView,
    trackBlogSearch,
    trackBlogPostEngagement,
    trackBlogReadTime,
    
    // Government Exams
    trackGovExamView,
    trackGovExamApplication,
    
    // Job Disciplines
    trackJobDisciplineView,
    
    // User Interactions
    trackButtonClick,
    trackCTAClick,
    
    // Social & Sharing
    trackSocialShare,
    trackExternalLink,
    
    // Conversions
    trackSignup,
    
    // Funnel & Engagement
    trackFunnelStep,
    trackTimeSpent,
    
    // SEO & Traffic
    trackSearchQuery,
    trackOrganicTraffic,
    
    // Errors
    trackError,
    
    // User Flow
    trackUserFlow,
    
    // Compatibility
    trackSearch,
    
    // Enhanced Analytics
    trackDailyPageView,
    trackJobViewEnhanced,
    trackJobApplicationSubmitEnhanced,
    trackJobSearchEnhanced,
    trackBlogPostReadEnhanced,
    trackJobDisciplineViewEnhanced
  };
};