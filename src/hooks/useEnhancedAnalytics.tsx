// src/hooks/useEnhancedAnalytics.tsx
import { useGoogleAnalytics } from './useGoogleAnalytics';

export const useEnhancedAnalytics = () => {
  const { trackPageView, trackEvent, trackButtonClick } = useGoogleAnalytics();

  const trackDailyPageView = (pageName: string, pagePath: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Google Analytics tracking
    trackPageView(pageName, pagePath);
    
    // Enhanced event for daily tracking
    trackEvent('daily_page_view', {
      page_name: pageName,
      page_path: pagePath,
      date: today
    });
    
    // Local storage tracking
    const key = `page_views_${pagePath.replace(/\//g, '_').replace(/^_|_$/g, '')}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Daily unique tracking
    const dailyKey = `daily_${pagePath.replace(/\//g, '_')}_${today}`;
    const dailyViews = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyViews + 1).toString());
    
    // Track daily unique user
    trackDailyUniqueUser(pagePath);
  };

  const trackDailyUniqueUser = (pagePath: string) => {
    const today = new Date().toISOString().split('T')[0];
    const userId = localStorage.getItem('user_id');
    const dailyKey = `daily_user_${today}_${pagePath}`;
    
    if (userId) {
      const dailyUsers = JSON.parse(localStorage.getItem(dailyKey) || '[]');
      if (!dailyUsers.includes(userId)) {
        dailyUsers.push(userId);
        localStorage.setItem(dailyKey, JSON.stringify(dailyUsers));
        
        // Send to Google Analytics
        trackEvent('daily_unique_user', {
          page_path: pagePath,
          date: today,
          user_id: userId
        });
      }
    }
  };

  const trackResumeGeneration = (templateName: string) => {
    trackEvent('resume_generated', {
      template: templateName,
      timestamp: new Date().toISOString()
    });
    
    // Track in local storage
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_resumes_${today}`;
    const currentCount = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (currentCount + 1).toString());
    
    // Total downloads
    const totalDownloads = parseInt(localStorage.getItem('resumeDownloads') || '0');
    localStorage.setItem('resumeDownloads', (totalDownloads + 1).toString());
  };

  const trackJobApplication = (jobId: string, jobTitle: string, company: string) => {
    trackEvent('job_application', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      timestamp: new Date().toISOString()
    });
    
    // Track daily job applications
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_job_apps_${today}`;
    const currentCount = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (currentCount + 1).toString());
    
    // Total applications
    const totalApps = parseInt(localStorage.getItem('total_job_applications') || '0');
    localStorage.setItem('total_job_applications', (totalApps + 1).toString());
  };

  const trackJobView = (jobId: string, jobTitle: string, source: string) => {
    trackEvent('job_view', {
      job_id: jobId,
      job_title: jobTitle,
      source: source,
      timestamp: new Date().toISOString()
    });
  };

  const trackJobSearch = (searchTerm: string, resultsCount: number, location?: string) => {
    trackEvent('job_search', {
      search_term: searchTerm,
      results_count: resultsCount,
      location: location || 'all',
      timestamp: new Date().toISOString()
    });
  };

  const trackJobDriveView = (driveId: string, driveTitle: string, source: string) => {
    trackEvent('job_drive_view', {
      drive_id: driveId,
      drive_title: driveTitle,
      source: source,
      timestamp: new Date().toISOString()
    });
  };

  const trackJobDriveRegistration = (driveId: string, driveTitle: string, company: string) => {
    trackEvent('job_drive_registration', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      timestamp: new Date().toISOString()
    });
    
    // Track registrations
    const registrations = parseInt(localStorage.getItem('job_drive_registrations') || '0');
    localStorage.setItem('job_drive_registrations', (registrations + 1).toString());
  };

  const trackGovExamApplication = (examId: string, examName: string, organization: string) => {
    trackEvent('gov_exam_application', {
      exam_id: examId,
      exam_name: examName,
      organization: organization,
      timestamp: new Date().toISOString()
    });
    
    // Track exam applications
    const examApps = parseInt(localStorage.getItem('gov_exam_applications') || '0');
    localStorage.setItem('gov_exam_applications', (examApps + 1).toString());
  };

  return {
    trackDailyPageView,
    trackResumeGeneration,
    trackJobApplication,
    trackJobView,
    trackJobSearch,
    trackJobDriveView,
    trackJobDriveRegistration,
    trackGovExamApplication,
    trackDailyUniqueUser,
    trackButtonClick // Pass through from Google Analytics
  };
};