import { useCallback } from 'react';

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, parameters);
    }
  }, []);

  const trackPageView = useCallback((pageTitle: string, pageLocation: string, pagePath: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: pageLocation,
        page_path: pagePath,
      });
    }
  }, []);

  // Specific event tracking methods
  const trackResumeGeneration = useCallback((templateType: string, format: string, sectionCount: number) => {
    trackEvent('resume_generated', {
      template_type: templateType,
      format: format,
      section_count: sectionCount,
      event_category: 'Resume Builder'
    });
  }, [trackEvent]);

  const trackResumeDownload = useCallback((format: string, templateType: string) => {
    trackEvent('resume_downloaded', {
      format: format,
      template_type: templateType,
      event_category: 'Resume Builder'
    });
  }, [trackEvent]);

  const trackJobApplication = useCallback((jobId: string, jobTitle: string, company: string, discipline: string) => {
    trackEvent('job_applied', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      discipline: discipline,
      event_category: 'Job Applications'
    });
  }, [trackEvent]);

  const trackJobView = useCallback((jobId: string, jobTitle: string, source: string) => {
    trackEvent('job_viewed', {
      job_id: jobId,
      job_title: jobTitle,
      source: source,
      event_category: 'Job Applications'
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, section: string, page: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      section: section,
      page: page,
      event_category: 'User Interaction'
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number, searchType: string) => {
    trackEvent('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount,
      search_type: searchType,
      event_category: 'Search'
    });
  }, [trackEvent]);

  const trackTemplateChange = useCallback((templateName: string) => {
    trackEvent('template_changed', {
      template_name: templateName,
      event_category: 'Resume Builder'
    });
  }, [trackEvent]);

  const trackBlogView = useCallback((postId: string, postTitle: string, category: string) => {
    trackEvent('blog_post_viewed', {
      post_id: postId,
      post_title: postTitle,
      category: category,
      event_category: 'Blog'
    });
  }, [trackEvent]);

  const trackShare = useCallback((contentType: string, contentId: string, platform: string) => {
    trackEvent('content_shared', {
      content_type: contentType,
      content_id: contentId,
      platform: platform,
      event_category: 'Social Sharing'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackResumeGeneration,
    trackResumeDownload,
    trackJobApplication,
    trackJobView,
    trackButtonClick,
    trackSearch,
    trackTemplateChange,
    trackBlogView,
    trackShare
  };
};