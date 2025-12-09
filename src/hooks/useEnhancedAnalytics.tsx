// src/hooks/useEnhancedAnalytics.tsx - COMPLETE
import { useGoogleAnalytics } from './useGoogleAnalytics';

export const useEnhancedAnalytics = () => {
  const { trackPageView, trackEvent, trackButtonClick, trackFunnelStep } = useGoogleAnalytics();

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
    const key = `daily_page_views_${pagePath.replace(/\//g, '_').replace(/^_|_$/g, '')}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Daily unique tracking
    const dailyKey = `daily_unique_${pagePath.replace(/\//g, '_')}_${today}`;
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

  const trackJobViewEnhanced = (jobId: string, jobTitle: string, company: string, source: string = 'listing') => {
    trackEvent('job_view_enhanced', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      source: source,
      timestamp: new Date().toISOString()
    });
    
    // Track in local storage
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_job_views_${today}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Track unique job views
    const uniqueKey = `job_viewed_${jobId}`;
    if (!localStorage.getItem(uniqueKey)) {
      localStorage.setItem(uniqueKey, '1');
      
      // Send to Google Analytics
      trackEvent('unique_job_view', {
        job_id: jobId,
        job_title: jobTitle,
        date: today
      });
    }
  };

  const trackJobApplicationSubmitEnhanced = (jobId: string, jobTitle: string, company: string) => {
    trackEvent('job_application_submitted_enhanced', {
      job_id: jobId,
      job_title: jobTitle,
      company: company,
      timestamp: new Date().toISOString()
    });
    
    // Track in local storage
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_job_apps_submitted_${today}`;
    const currentSubmissions = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentSubmissions + 1).toString());
    
    // Track total submissions
    const totalKey = 'total_job_applications_submitted';
    const totalSubmissions = parseInt(localStorage.getItem(totalKey) || '0');
    localStorage.setItem(totalKey, (totalSubmissions + 1).toString());
    
    // Track conversion funnel
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackFunnelStep('job_application', 'application_submitted', 3, userId);
  };

  const trackJobSearchEnhanced = (searchTerm: string, resultsCount: number, location?: string) => {
    trackEvent('job_search_enhanced', {
      search_term: searchTerm,
      results_count: resultsCount,
      location: location || 'all',
      timestamp: new Date().toISOString()
    });
    
    // Track search terms
    const today = new Date().toISOString().split('T')[0];
    const searchKey = `daily_job_searches_${today}`;
    const searches = JSON.parse(localStorage.getItem(searchKey) || '[]');
    searches.push({
      term: searchTerm,
      location: location,
      results: resultsCount,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(searchKey, JSON.stringify(searches));
  };

  const trackJobDriveView = (driveId: string, driveTitle: string, source: string) => {
    trackEvent('job_drive_view', {
      drive_id: driveId,
      drive_title: driveTitle,
      source: source,
      timestamp: new Date().toISOString()
    });
    
    // Track drive views
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_drive_views_${today}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
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
    
    // Daily tracking
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_drive_registrations_${today}`;
    const dailyRegs = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyRegs + 1).toString());
  };

  const trackWalkinDriveRegistrationEnhanced = (driveId: string, driveTitle: string, company: string) => {
    trackEvent('walkin_drive_registration_enhanced', {
      drive_id: driveId,
      drive_title: driveTitle,
      company: company,
      timestamp: new Date().toISOString()
    });
    
    // Track in local storage
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_drive_registrations_${today}`;
    const currentRegs = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentRegs + 1).toString());
    
    // Track total registrations
    const totalKey = 'total_drive_registrations';
    const totalRegs = parseInt(localStorage.getItem(totalKey) || '0');
    localStorage.setItem(totalKey, (totalRegs + 1).toString());
    
    // Track funnel step
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackFunnelStep('drive_registration', 'registered', 2, userId);
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
    
    // Daily tracking
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_gov_exam_apps_${today}`;
    const dailyApps = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyApps + 1).toString());
  };

  const trackBlogPostReadEnhanced = (postSlug: string, postTitle: string, readDuration: number) => {
    trackEvent('blog_post_read_enhanced', {
      post_slug: postSlug,
      post_title: postTitle,
      read_duration: readDuration,
      timestamp: new Date().toISOString()
    });
    
    // Track in local storage
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_blog_reads_${today}`;
    const currentReads = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentReads + 1).toString());
    
    // Track average read time
    const avgKey = `avg_read_time_${postSlug}`;
    const existingData = JSON.parse(localStorage.getItem(avgKey) || '{"count":0,"total":0}');
    const newCount = existingData.count + 1;
    const newTotal = existingData.total + readDuration;
    const avgTime = Math.round(newTotal / newCount);
    localStorage.setItem(avgKey, JSON.stringify({ count: newCount, total: newTotal, avg: avgTime }));
    
    // Track read duration categories
    if (readDuration >= 180) {
      trackEvent('blog_post_fully_read', {
        post_slug: postSlug,
        post_title: postTitle,
        duration: readDuration
      });
    } else if (readDuration >= 60) {
      trackEvent('blog_post_partially_read', {
        post_slug: postSlug,
        post_title: postTitle,
        duration: readDuration
      });
    }
  };

  const trackJobDisciplineViewEnhanced = (disciplineName: string, pageTitle: string) => {
    trackEvent('job_discipline_view_enhanced', {
      discipline_name: disciplineName,
      page_title: pageTitle,
      timestamp: new Date().toISOString()
    });
    
    // Track category views
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_discipline_views_${disciplineName}_${today}`;
    const currentViews = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentViews + 1).toString());
    
    // Track total discipline views
    const totalKey = `total_discipline_views_${disciplineName}`;
    const totalViews = parseInt(localStorage.getItem(totalKey) || '0');
    localStorage.setItem(totalKey, (totalViews + 1).toString());
  };

  return {
    // Core tracking
    trackDailyPageView,
    trackDailyUniqueUser,
    
    // Resume Builder
    trackResumeGeneration,
    
    // Job Applications
    trackJobApplication,
    trackJobViewEnhanced,
    trackJobApplicationSubmitEnhanced,
    trackJobSearchEnhanced,
    
    // Job Drives
    trackJobDriveView,
    trackJobDriveRegistration,
    trackWalkinDriveRegistrationEnhanced,
    
    // Government Exams
    trackGovExamApplication,
    
    // Blog
    trackBlogPostReadEnhanced,
    
    // Job Disciplines
    trackJobDisciplineViewEnhanced,
    
    // User Interaction
    trackButtonClick
  };
};