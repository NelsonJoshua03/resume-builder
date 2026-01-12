// src/hooks/useFirebaseAnalytics.ts - UPDATED WITH ANONYMOUS/CONSENTED TRACKING & GOV EXAMS
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { firebaseAnalytics } from '../firebase/analytics';
import { firebaseGovExamService } from '../firebase/govExamService';

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

  // ✅ CORE TRACKING: trackEvent method for both anonymous and consented users
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
          is_anonymous: !hasConsent,
          user_type: hasConsent ? 'consented' : 'anonymous'
        },
        consentGiven: hasConsent,
        dataProcessingLocation: 'IN' as const
      };

      await firebaseAnalytics.trackEvent(completeEventData);
      
      // Log for debugging
      console.log(`📊 Firebase Event: ${eventData.eventName} (${hasConsent ? 'consented' : 'anonymous'})`, {
        category: eventData.eventCategory,
        label: eventData.eventLabel,
        anonymous: !hasConsent
      });
    } catch (error) {
      console.error('Firebase tracking error:', error);
      
      // Fallback to localStorage for anonymous users
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      if (!hasConsent) {
        storeAnonymousEventInLocalStorage(eventData);
      }
    }
  }, []);

  // ✅ HELPER: Store anonymous events in localStorage
  const storeAnonymousEventInLocalStorage = (eventData: FirebaseEventData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `anon_events_${today}`;
      const events = JSON.parse(localStorage.getItem(key) || '[]');
      
      events.push({
        ...eventData,
        timestamp: new Date().toISOString(),
        storedAt: Date.now(),
        is_anonymous: true
      });
      
      // Keep only last 50 events per day
      localStorage.setItem(key, JSON.stringify(events.slice(-50)));
    } catch (error) {
      console.warn('Failed to store anonymous event in localStorage:', error);
    }
  };

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

  // ✅ ANONYMOUS TRACKING: Track user behavior regardless of consent
  const trackAnonymousInteraction = useCallback(async (
    interactionType: string,
    elementId: string,
    elementType: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
      
      // Always track interactions, consent is handled internally
      await trackFirebaseEvent(
        'user_interaction',
        'Anonymous Tracking',
        interactionType,
        {
          elementId,
          elementType,
          is_anonymous: !hasConsent,
          ...metadata
        }
      );
    } catch (error) {
      console.error('Anonymous interaction tracking error:', error);
    }
  }, [trackFirebaseEvent]);

  // ✅ CONSENT MANAGEMENT: Handle GDPR consent changes
  const handleConsentUpdate = useCallback(async (consentGiven: boolean) => {
    try {
      if (consentGiven) {
        localStorage.setItem('gdpr_consent', 'accepted');
        
        // Migrate anonymous user to consented
        await firebaseAnalytics.migrateToConsentedUser();
        
        // Track consent event
        await trackFirebaseEvent(
          'gdpr_consent_given',
          'User Privacy',
          'consent_granted',
          {
            consent_type: 'analytics',
            timestamp: new Date().toISOString()
          }
        );
        
        console.log('✅ User gave consent, migrated to consented tracking');
      } else {
        localStorage.removeItem('gdpr_consent');
        
        // Track consent withdrawal
        await trackFirebaseEvent(
          'gdpr_consent_withdrawn',
          'User Privacy',
          'consent_withdrawn'
        );
        
        console.log('✅ User withdrew consent, switching to anonymous tracking');
      }
      
      // Reload the page to apply consent changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error handling consent update:', error);
    }
  }, [trackFirebaseEvent]);

  // ✅ ADDED: Exit Intent tracking method
  const trackExitIntent = useCallback(async (
    timeOnPage: number,
    intentType: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await trackFirebaseEvent(
        'exit_intent_detected',
        'User Behavior',
        intentType,
        {
          timeOnPage,
          intentType,
          pagePath: window.location.pathname,
          pageTitle: document.title,
          ...metadata
        }
      );
    } catch (error) {
      console.error('Firebase exit intent tracking error:', error);
    }
  }, [trackFirebaseEvent]);

  // ✅ ADDED: trackFirebaseCTAClick method
  const trackFirebaseCTAClick = useCallback(async (
    ctaName: string,
    location: string,
    page: string
  ) => {
    try {
      await trackFirebaseEvent(
        'cta_click',
        'Conversion',
        ctaName,
        { location, page }
      );
    } catch (error) {
      console.error('Firebase CTA click tracking error:', error);
    }
  }, [trackFirebaseEvent]);

  // ============ RESUME BUILDER TRACKING ============
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

  // ============ JOB PORTAL TRACKING ============
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

  // ============ GOVERNMENT EXAMS TRACKING ============
  const trackGovExamView = useCallback(async (
    examId: string,
    examName: string,
    organization: string
  ) => {
    try {
      await trackFirebaseEvent(
        'gov_exam_viewed',
        'Government Exams',
        examName,
        { examId, organization, action: 'view' }
      );
      
      // Increment view count in Firebase
      await firebaseGovExamService.incrementViewCount(examId);
    } catch (error) {
      console.error('Error tracking government exam view:', error);
    }
  }, [trackFirebaseEvent]);

  const trackGovExamApplication = useCallback(async (
    examId: string,
    examName: string,
    organization: string
  ) => {
    try {
      await trackFirebaseEvent(
        'gov_exam_applied',
        'Government Exams',
        examName,
        { examId, organization, action: 'apply' }
      );
      
      // Increment application count in Firebase
      await firebaseGovExamService.incrementApplicationCount(examId);
    } catch (error) {
      console.error('Error tracking government exam application:', error);
    }
  }, [trackFirebaseEvent]);

  const trackGovExamSave = useCallback(async (
    examId: string,
    examName: string,
    organization: string
  ) => {
    try {
      await trackFirebaseEvent(
        'gov_exam_saved',
        'Government Exams',
        examName,
        { examId, organization, action: 'save' }
      );
      
      // Increment save count in Firebase
      await firebaseGovExamService.incrementSaveCount(examId);
    } catch (error) {
      console.error('Error tracking government exam save:', error);
    }
  }, [trackFirebaseEvent]);

  const trackGovExamShare = useCallback(async (
    examId: string,
    examName: string,
    organization: string,
    platform: string
  ) => {
    try {
      await trackFirebaseEvent(
        'gov_exam_shared',
        'Government Exams',
        examName,
        { examId, organization, platform, action: 'share' }
      );
      
      // Increment share count in Firebase
      await firebaseGovExamService.incrementShareCount(examId);
    } catch (error) {
      console.error('Error tracking government exam share:', error);
    }
  }, [trackFirebaseEvent]);

  const trackGovExamSearch = useCallback(async (
    searchTerm: string,
    resultsCount: number,
    filters?: any
  ) => {
    await trackFirebaseEvent(
      'gov_exam_searched',
      'Government Exams',
      searchTerm,
      { searchTerm, resultsCount, filters, action: 'search' }
    );
  }, [trackFirebaseEvent]);

  // ============ JOB DRIVES TRACKING ============
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

  // ============ BLOG TRACKING ============
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

  // ============ USER INTERACTION TRACKING ============
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

  // CTA Click tracking (original method)
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

  // ============ ENHANCED ANALYTICS METHODS ============
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

  const trackGovExamApplicationEnhanced = useCallback(async (
    examId: string,
    examName: string,
    organization: string,
    applicationType: string = 'direct'
  ) => {
    await trackFirebaseEvent(
      'gov_exam_application_enhanced',
      'Government Exams',
      examName,
      { examId, organization, applicationType }
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

  // ============ USER SESSION TRACKING ============
  const trackSessionStart = useCallback(async () => {
    await trackFirebaseEvent(
      'session_started',
      'User Session',
      'new_session',
      {
        sessionId: firebaseAnalytics.getSessionId(),
        userId: firebaseAnalytics.getUserId(),
        isAnonymous: firebaseAnalytics.isUserAnonymous()
      }
    );
  }, [trackFirebaseEvent]);

  const trackSessionEnd = useCallback(async (duration: number) => {
    await trackFirebaseEvent(
      'session_ended',
      'User Session',
      'session_end',
      {
        sessionId: firebaseAnalytics.getSessionId(),
        duration,
        userId: firebaseAnalytics.getUserId(),
        isAnonymous: firebaseAnalytics.isUserAnonymous()
      }
    );
  }, [trackFirebaseEvent]);

  // ============ GDPR & PRIVACY METHODS ============
  const getConsentStatus = useCallback(() => {
    return localStorage.getItem('gdpr_consent') === 'accepted';
  }, []);

  const isUserAnonymous = useCallback(() => {
    return firebaseAnalytics.isUserAnonymous();
  }, []);

  const getUserTrackingInfo = useCallback(() => {
    return {
      userId: firebaseAnalytics.getUserId(),
      sessionId: firebaseAnalytics.getSessionId(),
      isAnonymous: firebaseAnalytics.isUserAnonymous(),
      hasConsent: localStorage.getItem('gdpr_consent') === 'accepted'
    };
  }, []);

  // ============ REAL-TIME ANALYTICS ============
  const subscribeToEvents = useCallback((callback: (events: any[]) => void) => {
    return firebaseAnalytics.subscribeToAnalytics(callback);
  }, []);

  // Get anonymous stats
  const getAnonymousStats = useCallback(() => {
    return firebaseAnalytics.getAnonymousStats();
  }, []);

  // ============ FIREBASE SERVICE INTEGRATION ============
  const getFirebaseStatus = useCallback(async () => {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    
    return {
      connected: true, // Assuming Firebase is initialized
      analytics: !!firebaseAnalytics,
      userId: firebaseAnalytics.getUserId(),
      sessionId: firebaseAnalytics.getSessionId(),
      isAnonymous: !hasConsent,
      hasConsent,
      userType: hasConsent ? 'consented' : 'anonymous'
    };
  }, []);

  // Initialize session tracking
  useEffect(() => {
    // Track session start on component mount
    trackSessionStart();
    
    // Track session end on page unload
    const handleBeforeUnload = () => {
      const sessionStart = performance.now();
      const sessionDuration = Math.round((performance.now() - sessionStart) / 1000);
      trackSessionEnd(sessionDuration);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackSessionStart, trackSessionEnd]);

  return {
    // ============ CORE TRACKING METHODS ============
    trackEvent,
    trackFirebaseEvent,
    trackPageView,
    trackExitIntent,
    
    // ============ ANONYMOUS & CONSENT TRACKING ============
    trackAnonymousInteraction,
    handleConsentUpdate,
    getConsentStatus,
    isUserAnonymous,
    getUserTrackingInfo,
    
    // ============ BUTTON & CTA TRACKING ============
    trackButtonClick,
    trackCTAClick,
    trackFirebaseCTAClick,
    
    // ============ RESUME BUILDER ============
    trackResumeGeneration,
    trackResumeDownload,
    trackResumePreview,
    trackResumeGenerationEnhanced,
    trackTemplateChange,
    
    // ============ JOB PORTAL ============
    trackJobView,
    trackJobApplication,
    trackJobSave,
    trackJobSearch,
    trackJobViewEnhanced,
    trackJobApplicationSubmitEnhanced,
    trackJobSearchEnhanced,
    trackJobDisciplineViewEnhanced,
    
    // ============ GOVERNMENT EXAMS ============
    trackGovExamView,
    trackGovExamApplication,
    trackGovExamSave,
    trackGovExamShare,
    trackGovExamSearch,
    trackGovExamApplicationEnhanced,
    
    // ============ JOB DRIVES ============
    trackWalkinDriveView,
    trackWalkinDriveRegistration,
    trackJobDriveView,
    trackJobDriveRegistration,
    trackWalkinDriveRegistrationEnhanced,
    
    // ============ BLOG ============
    trackBlogView,
    trackBlogSearch,
    trackBlogPostReadEnhanced,
    
    // ============ SOCIAL & SHARING ============
    trackSocialShare,
    
    // ============ USER ONBOARDING ============
    trackSignup,
    
    // ============ USER FLOW & NAVIGATION ============
    trackUserFlow,
    trackFunnelStep,
    
    // ============ ERROR TRACKING ============
    trackError,
    
    // ============ ENHANCED ANALYTICS ============
    trackDailyPageView,
    trackDailyUniqueUser,
    
    // ============ SESSION TRACKING ============
    trackSessionStart,
    trackSessionEnd,
    
    // ============ REAL-TIME ANALYTICS ============
    subscribeToEvents,
    getAnonymousStats,
    
    // ============ FIREBASE SERVICE INFO ============
    getFirebaseStatus,
    
    // ============ USER INFO ============
    getUserId: () => firebaseAnalytics.getUserId(),
    getSessionId: () => firebaseAnalytics.getSessionId(),
    getUserType: () => firebaseAnalytics.getUserType()
  };
};