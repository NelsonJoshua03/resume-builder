// src/hooks/useFirebaseAnalytics.ts - UPDATED WITH PROPER TYPES AND ALL METHODS
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { firebaseAnalytics } from '../firebase/analytics';

// Define the event data structure
interface FirebaseEventData {
  eventName: string;
  eventCategory: string;
  eventLabel: string;
  pagePath?: string;
  pageTitle?: string;
  metadata?: Record<string, any>;
  eventValue?: number;
}

export const useFirebaseAnalytics = () => {
  const location = useLocation();

  // Auto-track page views
  useEffect(() => {
    const trackPageView = async () => {
      await firebaseAnalytics.trackPageView(
        location.pathname + location.search,
        document.title
      );
    };

    trackPageView();
  }, [location]);

  // ✅ FIXED: trackEvent method with proper typing
  // Update trackEvent method to work with anonymous users:
const trackEvent = useCallback(async (eventData: FirebaseEventData) => {
  try {
    // Get consent status
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    
    // Prepare complete event data
    const completeEventData = {
      eventName: eventData.eventName,
      eventCategory: eventData.eventCategory,
      eventLabel: eventData.eventLabel,
      pagePath: eventData.pagePath || window.location.pathname,
      pageTitle: eventData.pageTitle || document.title,
      eventValue: eventData.eventValue,
      metadata: {
        ...eventData.metadata,
        is_anonymous: !hasConsent
      },
      // These will be added by firebaseAnalytics.trackEvent
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN' as const
    };

    await firebaseAnalytics.trackEvent(completeEventData);
  } catch (error) {
    console.error('Firebase tracking error:', error);
  }
}, []);

  // ✅ FIXED: trackFirebaseEvent method (string parameters)
  const trackFirebaseEvent = useCallback(async (
    eventName: string,
    eventCategory: string,
    eventLabel: string,
    metadata?: Record<string, any>,
    eventValue?: number
  ) => {
    try {
      await trackEvent({
        eventName,
        eventCategory,
        eventLabel,
        pagePath: window.location.pathname,
        pageTitle: document.title,
        eventValue,
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Firebase tracking error:', error);
    }
  }, [trackEvent]);

  // Resume Builder tracking
  const trackResumeGeneration = useCallback(async (
    templateType: string,
    fieldsCount: any,
    format: string = 'pdf'
  ) => {
    await trackFirebaseEvent(
      'resume_generated',
      'Resume Builder',
      templateType,
      { templateType, format, fieldsCount }
    );
  }, [trackFirebaseEvent]);

  const trackResumeDownload = useCallback(async (
    templateType: string,
    fieldsCount: any,
    format: string = 'pdf'
  ) => {
    await trackFirebaseEvent(
      'resume_downloaded',
      'Resume Builder',
      templateType,
      { templateType, format, fieldsCount }
    );
  }, [trackFirebaseEvent]);

  const trackResumePreview = useCallback(async (
    templateType: string,
    fieldsCount: any
  ) => {
    await trackFirebaseEvent(
      'resume_previewed',
      'Resume Builder',
      templateType,
      { templateType, fieldsCount }
    );
  }, [trackFirebaseEvent]);

  // Button Click tracking
  const trackButtonClick = useCallback(async (
    buttonName: string,
    section: string,
    page: string
  ) => {
    await trackFirebaseEvent(
      'button_click',
      'User Interaction',
      buttonName,
      { section, page }
    );
  }, [trackFirebaseEvent]);

  // CTA Click tracking
  const trackCTAClick = useCallback(async (
    ctaName: string,
    location: string,
    page: string
  ) => {
    await trackFirebaseEvent(
      'cta_click',
      'Conversion',
      ctaName,
      { location, page }
    );
  }, [trackFirebaseEvent]);

  // Funnel Step tracking
  const trackFunnelStep = useCallback(async (
    funnelName: string,
    stepName: string,
    stepNumber: number,
    metadata?: any
  ) => {
    await firebaseAnalytics.trackFunnelStep(funnelName, stepName, stepNumber, metadata);
  }, []);

  // Social Share tracking
  const trackSocialShare = useCallback(async (
    platform: string,
    contentType: string,
    contentId: string
  ) => {
    await trackFirebaseEvent(
      'social_share',
      'Social Sharing',
      `${platform}_${contentType}`,
      { platform, contentType, contentId }
    );
  }, [trackFirebaseEvent]);

  // Signup tracking
  const trackSignup = useCallback(async (
    method: string,
    source: string
  ) => {
    await trackFirebaseEvent(
      'signup_initiated',
      'User Onboarding',
      `${method}_signup`,
      { method, source }
    );
  }, [trackFirebaseEvent]);

  // Page View tracking
  const trackPageView = useCallback(async (
    pagePath: string,
    pageTitle: string
  ) => {
    await firebaseAnalytics.trackPageView(pagePath, pageTitle);
  }, []);

  // Template Change tracking
  const trackTemplateChange = useCallback(async (
    templateName: string,
    from: string
  ) => {
    await trackFirebaseEvent(
      'template_changed',
      'Template Selection',
      templateName,
      { from }
    );
  }, [trackFirebaseEvent]);

  // User Flow tracking
  const trackUserFlow = useCallback(async (
    from: string,
    to: string,
    action: string
  ) => {
    await trackFirebaseEvent(
      'user_flow',
      'User Navigation',
      `${from}_to_${to}`,
      { action, from, to }
    );
  }, [trackFirebaseEvent]);

  // Error tracking
  const trackError = useCallback(async (
    errorType: string,
    errorMessage: string,
    page: string
  ) => {
    await trackFirebaseEvent(
      'error_occurred',
      'Errors',
      errorType,
      { errorMessage, page }
    );
  }, [trackFirebaseEvent]);

  // Job tracking methods
  const trackJobView = useCallback(async (
    jobId: string,
    jobTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'job_viewed',
      'Job Portal',
      jobTitle,
      { jobId, company, action: 'view' }
    );
  }, [trackFirebaseEvent]);

  const trackJobApplication = useCallback(async (
    jobId: string,
    jobTitle: string,
    company: string,
    method: string = 'direct'
  ) => {
    await trackFirebaseEvent(
      'job_applied',
      'Job Portal',
      jobTitle,
      { jobId, company, method, action: 'apply' }
    );
  }, [trackFirebaseEvent]);

  const trackJobSave = useCallback(async (
    jobId: string,
    jobTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'job_saved',
      'Job Portal',
      jobTitle,
      { jobId, company, action: 'save' }
    );
  }, [trackFirebaseEvent]);

  const trackJobSearch = useCallback(async (
    query: string,
    resultsCount: number,
    location?: string
  ) => {
    await trackFirebaseEvent(
      'job_searched',
      'Job Portal',
      query,
      { query, resultsCount, location }
    );
  }, [trackFirebaseEvent]);

  // Blog tracking methods
  const trackBlogView = useCallback(async (
    postSlug: string,
    postTitle: string,
    category: string,
    readDuration?: number
  ) => {
    await trackFirebaseEvent(
      'blog_viewed',
      'Blog',
      postTitle,
      { postSlug, category, readDuration, action: readDuration && readDuration > 30 ? 'read' : 'view' }
    );
  }, [trackFirebaseEvent]);

  const trackBlogSearch = useCallback(async (
    searchTerm: string,
    resultsCount: number,
    category?: string
  ) => {
    await trackFirebaseEvent(
      'blog_searched',
      'Blog',
      searchTerm,
      { searchTerm, resultsCount, category }
    );
  }, [trackFirebaseEvent]);

  // ✅ ADDED: Job Drives tracking methods
  const trackWalkinDriveView = useCallback(async (
    driveId: string,
    driveTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'walkin_drive_view',
      'Job Drives',
      driveTitle,
      { driveId, company }
    );
  }, [trackFirebaseEvent]);

  const trackWalkinDriveRegistration = useCallback(async (
    driveId: string,
    driveTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'walkin_drive_registration',
      'Job Drives',
      driveTitle,
      { driveId, company }
    );
  }, [trackFirebaseEvent]);

  const trackJobDriveView = useCallback(async (
    driveId: string,
    driveTitle: string,
    source: string
  ) => {
    await trackFirebaseEvent(
      'job_drive_view',
      'Job Drives',
      driveTitle,
      { driveId, source }
    );
  }, [trackFirebaseEvent]);

  const trackJobDriveRegistration = useCallback(async (
    driveId: string,
    driveTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'job_drive_registration',
      'Job Drives',
      driveTitle,
      { driveId, company }
    );
  }, [trackFirebaseEvent]);

  const trackWalkinDriveRegistrationEnhanced = useCallback(async (
    driveId: string,
    driveTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'walkin_drive_registration_enhanced',
      'Job Drives',
      driveTitle,
      { driveId, company }
    );
  }, [trackFirebaseEvent]);

  // Daily Analytics methods
  const trackDailyPageView = useCallback(async (
    pageName: string,
    pagePath: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    await trackFirebaseEvent(
      'daily_page_view',
      'Daily Analytics',
      pageName,
      { pagePath, date: today }
    );
  }, [trackFirebaseEvent]);

  const trackJobViewEnhanced = useCallback(async (
    jobId: string,
    jobTitle: string,
    company: string,
    source: string = 'listing'
  ) => {
    await trackFirebaseEvent(
      'job_view_enhanced',
      'Job Applications',
      jobTitle,
      { jobId, company, source }
    );
  }, [trackFirebaseEvent]);

  const trackJobApplicationSubmitEnhanced = useCallback(async (
    jobId: string,
    jobTitle: string,
    company: string
  ) => {
    await trackFirebaseEvent(
      'job_application_submitted_enhanced',
      'Job Applications',
      jobTitle,
      { jobId, company }
    );
  }, [trackFirebaseEvent]);

  const trackJobSearchEnhanced = useCallback(async (
    searchTerm: string,
    resultsCount: number,
    location?: string
  ) => {
    await trackFirebaseEvent(
      'job_search_enhanced',
      'Job Search',
      searchTerm,
      { searchTerm, resultsCount, location: location || 'all' }
    );
  }, [trackFirebaseEvent]);

  const trackBlogPostReadEnhanced = useCallback(async (
    postSlug: string,
    postTitle: string,
    readDuration: number
  ) => {
    await trackFirebaseEvent(
      'blog_post_read_enhanced',
      'Blog',
      postTitle,
      { postSlug, readDuration }
    );
  }, [trackFirebaseEvent]);

  const trackJobDisciplineViewEnhanced = useCallback(async (
    disciplineName: string,
    pageTitle: string
  ) => {
    await trackFirebaseEvent(
      'job_discipline_view_enhanced',
      'Job Disciplines',
      disciplineName,
      { pageTitle }
    );
  }, [trackFirebaseEvent]);

  const trackGovExamApplication = useCallback(async (
    examId: string,
    examName: string,
    organization: string
  ) => {
    await trackFirebaseEvent(
      'gov_exam_application',
      'Government Exams',
      examName,
      { examId, organization }
    );
  }, [trackFirebaseEvent]);

  const trackResumeGenerationEnhanced = useCallback(async (
    templateName: string
  ) => {
    await trackFirebaseEvent(
      'resume_generation_enhanced',
      'Resume Builder',
      templateName,
      { templateName }
    );
  }, [trackFirebaseEvent]);

  const trackDailyUniqueUser = useCallback(async (
    pagePath: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const userId = localStorage.getItem('user_id');
    
    if (userId) {
      await trackFirebaseEvent(
        'daily_unique_user',
        'User Analytics',
        userId,
        { pagePath, date: today, userId }
      );
    }
  }, [trackFirebaseEvent]);

  // Simplified subscribe to events
  const subscribeToEvents = useCallback((callback: (events: any[]) => void) => {
    return firebaseAnalytics.subscribeToAnalytics(callback);
  }, []);

  return {
    // Core tracking methods
    trackEvent,
    trackFirebaseEvent,
    trackPageView,
    
    // Resume Builder
    trackResumeGeneration,
    trackResumeDownload,
    trackResumePreview,
    trackResumeGenerationEnhanced,
    
    // Job Portal
    trackJobView,
    trackJobApplication,
    trackJobSave,
    trackJobSearch,
    
    // Job Drives
    trackWalkinDriveView,
    trackWalkinDriveRegistration,
    trackJobDriveView,
    trackJobDriveRegistration,
    trackWalkinDriveRegistrationEnhanced,
    
    // Blog
    trackBlogView,
    trackBlogSearch,
    trackBlogPostReadEnhanced,
    
    // Government Exams
    trackGovExamApplication,
    
    // User Interactions
    trackButtonClick,
    trackCTAClick,
    trackFunnelStep,
    trackSocialShare,
    trackSignup,
    trackTemplateChange,
    trackUserFlow,
    trackError,
    
    // Enhanced Analytics
    trackDailyPageView,
    trackDailyUniqueUser,
    trackJobViewEnhanced,
    trackJobApplicationSubmitEnhanced,
    trackJobSearchEnhanced,
    trackJobDisciplineViewEnhanced,
    
    // Real-time analytics
    subscribeToEvents,
    
    // User info
    getUserId: () => firebaseAnalytics.getUserId(),
    getSessionId: () => firebaseAnalytics.getSessionId()
  };
};