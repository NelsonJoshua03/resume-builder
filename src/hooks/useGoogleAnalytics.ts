import { useCallback } from 'react';

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
  }, []);

  const trackPageView = useCallback((pageTitle: string, pageLocation: string, pagePath: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-SW5M9YN8L5', {
        page_title: pageTitle,
        page_location: pageLocation,
        page_path: pagePath,
      });
    }
  }, []);

  // Specific event tracking methods
  const trackResumeGeneration = useCallback((templateType: string, format: string) => {
    trackEvent('resume_generated', {
      template_type: templateType,
      format: format,
      event_category: 'Resume Builder'
    });
  }, [trackEvent]);

  const trackJobApplication = useCallback((jobId: string, jobTitle: string, discipline: string) => {
    trackEvent('job_applied', {
      job_id: jobId,
      job_title: jobTitle,
      discipline: discipline,
      event_category: 'Job Applications'
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, section: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      section: section,
      event_category: 'User Interaction'
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileType: string, fileName: string) => {
    trackEvent('file_download', {
      file_type: fileType,
      file_name: fileName,
      event_category: 'Downloads'
    });
  }, [trackEvent]);

  const trackOutboundLink = useCallback((url: string, linkText: string) => {
    trackEvent('outbound_click', {
      url: url,
      link_text: linkText,
      event_category: 'Outbound Links'
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: 'Search'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackResumeGeneration,
    trackJobApplication,
    trackButtonClick,
    trackDownload,
    trackOutboundLink,
    trackSearch
  };
};