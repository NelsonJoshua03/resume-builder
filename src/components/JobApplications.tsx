// src/components/JobApplications.tsx - COMPLETE WITH FIREBASE ANALYTICS & ENHANCED SEO
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { usePageTimeTracker } from '../hooks/usePageTimeTracker';
import { 
  Share2, 
  ExternalLink, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Mail,
  X,
  Bell,
  Send,
  Users,
  TrendingUp,
  Eye,
  Briefcase,
  Search,
  ArrowRight,
  Home,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart,
  Heart,
  Bookmark
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applyLink: string;
  featured?: boolean;
  isReal?: boolean;
  addedTimestamp?: number;
  page?: number;
  views?: number;
  shares?: number;
  applications?: number;
}

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const jobsPerPage = 10;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [analytics, setAnalytics] = useState({
    topCities: [] as {city: string; count: number}[],
    topSectors: [] as {sector: string; count: number}[],
    popularJobs: [] as {title: string; views: number; company: string}[],
    hourlyTrends: [] as {hour: number; views: number}[]
  });

  // Track page time
  usePageTimeTracker('Job Applications Page');

  // Initialize Firebase Analytics
  const { 
    trackEvent,
    trackFirebaseEvent,
    trackPageView,
    trackJobView,
    trackJobApplication,
    trackJobSave,
    trackJobSearch,
    trackButtonClick,
    trackCTAClick,
    trackSocialShare,
    trackFunnelStep,
    trackUserFlow,
    getUserId,
    getSessionId
  } = useFirebaseAnalytics();
  
  // Initialize Google Analytics
  const { 
    trackButtonClick: trackGoogleButtonClick, 
    trackSocialShare: trackGoogleSocialShare, 
    trackCTAClick: trackGoogleCTAClick,
    trackExternalLink,
    trackFunnelStep: trackGoogleFunnelStep,
    trackJobApplicationSubmit,
    trackJobSearch: trackGoogleJobSearch
  } = useGoogleAnalytics();

  // Initialize user ID if not exists
  useEffect(() => {
    if (!localStorage.getItem('firebase_user_id')) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('firebase_user_id', userId);
      
      // Track new user registration
      trackFirebaseEvent(
        'new_user_registered',
        'User',
        'new_user',
        { source: 'job_applications_page' }
      );
    }

    // Load saved jobs
    const saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
    setSavedJobs(saved);
  }, []);

  // Track page view on mount
  useEffect(() => {
    // Track page view with both systems
    trackPageView('/job-applications', 'Job Applications');
    
    // Track funnel step
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('job_search_funnel', 'viewed_jobs_listing', 1, {
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_path: '/job-applications'
    });

    // Load analytics data
    loadAnalyticsData();
  }, []);

  // Clean up old jobs (older than 3 months) and load jobs
  useEffect(() => {
    // Load manual jobs from localStorage
    const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    
    // Filter out jobs older than 90 days (3 months)
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    
    const recentJobs = savedJobs.filter((job: Job) => {
      const jobTimestamp = job.addedTimestamp || new Date(job.postedDate).getTime();
      return jobTimestamp >= ninetyDaysAgo;
    });
    
    // Update localStorage with only recent jobs
    if (recentJobs.length !== savedJobs.length) {
      localStorage.setItem('manualJobs', JSON.stringify(recentJobs));
      console.log(`Auto-cleaned ${savedJobs.length - recentJobs.length} old jobs`);
      
      // Track cleanup event - FIXED: Use trackFirebaseEvent instead of trackEvent
      trackFirebaseEvent(
        'jobs_auto_cleaned',
        'System',
        'cleanup',
        {
          old_count: savedJobs.length,
          new_count: recentJobs.length,
          days_old: 90
        },
        savedJobs.length - recentJobs.length
      );
    }
    
    // Sort by addedTimestamp (newest first)
    const sortedJobs = recentJobs.sort((a: Job, b: Job) => {
      const timeA = a.addedTimestamp || new Date(a.postedDate).getTime();
      const timeB = b.addedTimestamp || new Date(b.postedDate).getTime();
      return timeB - timeA; // Descending order (newest first)
    });

    // Add page numbers if not present
    const jobsWithPages = sortedJobs.map((job: Job, index: number) => ({
      ...job,
      page: job.page || Math.floor(index / jobsPerPage) + 1,
      addedTimestamp: job.addedTimestamp || Date.now(),
      views: job.views || 0,
      shares: job.shares || 0,
      applications: job.applications || 0
    }));

    setJobs(jobsWithPages);
    
    // Load stats from localStorage
    const shares = parseInt(localStorage.getItem('total_job_shares') || '0');
    setTotalShares(shares);
    
    const views = parseInt(localStorage.getItem('total_job_views') || '0');
    setTotalViews(views);
    
    const applications = parseInt(localStorage.getItem('total_job_applications_submitted') || '0');
    setTotalApplications(applications);
    
    // Show notification banner if first visit today
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('last_job_page_visit');
    if (lastVisit !== today) {
      setShowNotificationBanner(true);
      localStorage.setItem('last_job_page_visit', today);
      
      // Track notification shown
      trackGoogleButtonClick('notification_shown_jobs', 'system', 'job_applications');
      trackButtonClick('notification_shown_jobs', 'system', '/job-applications');
    }
  }, []);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    try {
      // Calculate top cities
      const cityMap: Record<string, number> = {};
      jobs.forEach(job => {
        cityMap[job.location] = (cityMap[job.location] || 0) + 1;
      });
      const topCities = Object.entries(cityMap)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate top sectors
      const sectorMap: Record<string, number> = {};
      jobs.forEach(job => {
        sectorMap[job.sector] = (sectorMap[job.sector] || 0) + 1;
      });
      const topSectors = Object.entries(sectorMap)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get popular jobs by views
      const popularJobs = [...jobs]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3)
        .map(job => ({
          title: job.title,
          views: job.views || 0,
          company: job.company
        }));

      // Simulate hourly trends (in real app, fetch from Firebase)
      const hourlyTrends = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 100) + 20
      }));

      setAnalytics({
        topCities,
        topSectors,
        popularJobs,
        hourlyTrends
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }, [jobs]);

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Track search with all systems
    const resultsCount = filteredJobs.length;
    
    // Firebase
    trackJobSearch(searchTerm, resultsCount, locationFilter || 'all');
    
    // Google Analytics
    trackGoogleJobSearch(searchTerm, resultsCount, locationFilter || 'all');
    
    // Track button click
    trackGoogleButtonClick('job_search', 'search_form', 'job_applications');
    trackButtonClick('job_search', 'search_form', '/job-applications');
    
    // Track search event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_search_performed',
      'Job Search',
      searchTerm || 'no_query',
      {
        search_query: searchTerm,
        location_filter: locationFilter || 'none',
        results_count: resultsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      },
      resultsCount
    );
    
    // Track funnel step for search
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    if (searchTerm || locationFilter) {
      trackFunnelStep('job_search_funnel', 'searched_jobs', 2, {
        user_id: userId,
        search_query: searchTerm,
        location_filter: locationFilter,
        results_count: resultsCount
      });
    }
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    setCurrentPage(1);
    
    // Track filter clicks
    trackGoogleButtonClick(`filter_city_${city}`, 'city_filters', 'job_applications');
    trackButtonClick(`filter_city_${city}`, 'city_filters', '/job-applications');
    
    // Track job search with city filter
    trackJobSearch('', filteredJobs.length, city);
    
    // Track filter event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_filter_applied',
      'Job Filter',
      `city_${city}`,
      {
        filter_type: 'city',
        filter_value: city,
        results_count: filteredJobs.length,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSector('all');
    setSelectedType('all');
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
    
    trackGoogleButtonClick('clear_filters', 'filters', 'job_applications');
    trackButtonClick('clear_filters', 'filters', '/job-applications');
    
    // Track clear filters event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_filters_cleared',
      'Job Filter',
      'all_filters',
      {
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  const sectors = ['all', 'IT/Software', 'Engineering', 'Data Science', 'Marketing', 'HR', 'Finance', 'Healthcare', 'Education', 'Sales'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];

  const filteredJobs = jobs.filter(job => {
    const matchesSector = selectedSector === 'all' || job.sector === selectedSector;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSector && matchesType && matchesSearch && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const featuredJobs = jobs.filter(job => job.featured);
  const totalJobsCount = jobs.length;

  // Calculate stats
  const remoteJobsCount = jobs.filter(job => job.type === 'Remote').length;
  const todayJobsCount = jobs.filter(job => {
    const jobDate = new Date(job.postedDate);
    const today = new Date();
    return jobDate.toDateString() === today.toDateString();
  }).length;

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    
    trackGoogleButtonClick(`page_${page}`, 'pagination', 'job_applications');
    trackButtonClick(`page_${page}`, 'pagination', '/job-applications');
    
    // Track pagination event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_pagination_click',
      'Job Navigation',
      `page_${page}`,
      {
        current_page: page,
        total_pages: totalPages,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    setCurrentPage(1);
    
    trackGoogleButtonClick(`filter_sector_${sector}`, 'sector_filters', 'job_applications');
    trackButtonClick(`filter_sector_${sector}`, 'sector_filters', '/job-applications');
    
    // Track sector filter event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_filter_applied',
      'Job Filter',
      `sector_${sector}`,
      {
        filter_type: 'sector',
        filter_value: sector,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    
    trackGoogleButtonClick(`filter_type_${type}`, 'type_filters', 'job_applications');
    trackButtonClick(`filter_type_${type}`, 'type_filters', '/job-applications');
    
    // Track type filter event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_filter_applied',
      'Job Filter',
      `type_${type}`,
      {
        filter_type: 'job_type',
        filter_value: type,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  // Share functionality
  const handleShareClick = (job: Job) => {
    setSelectedJob(job);
    setShowShareModal(true);
    
    trackGoogleButtonClick('open_share_modal', 'job_card', 'job_applications');
    trackButtonClick('open_share_modal', 'job_card', '/job-applications');
    
    // Track share modal opened - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_share_modal_opened',
      'Job Sharing',
      job.id,
      {
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedJob(null);
    setCopySuccess(false);
  };

  const copyToClipboard = async () => {
    if (selectedJob) {
      const jobUrl = `${window.location.origin}/job-applications?job=${selectedJob.id}`;
      try {
        await navigator.clipboard.writeText(jobUrl);
        setCopySuccess(true);
        
        // Update job shares
        const updatedJobs = jobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, shares: (job.shares || 0) + 1 }
            : job
        );
        setJobs(updatedJobs);
        localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
        
        // Update total shares
        const newTotal = totalShares + 1;
        setTotalShares(newTotal);
        localStorage.setItem('total_job_shares', newTotal.toString());
        
        // Track sharing
        trackGoogleButtonClick('copy_job_link', 'share_modal', 'job_applications');
        trackButtonClick('copy_job_link', 'share_modal', '/job-applications');
        trackSocialShare('copy_link', 'job', selectedJob.id);
        trackGoogleSocialShare('copy_link', 'job', selectedJob.id);
        
        // Track share event - FIXED: Use trackFirebaseEvent instead of trackEvent
        trackFirebaseEvent(
          'job_shared',
          'Social Sharing',
          'copy_link',
          {
            job_id: selectedJob.id,
            job_title: selectedJob.title,
            company: selectedJob.company,
            platform: 'copy_link',
            user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
          }
        );
        
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const shareOnPlatform = (platform: string) => {
    if (!selectedJob) return;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Check out this job: ${selectedJob.title} at ${selectedJob.company}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job opportunity: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`)}&url=${encodeURIComponent(window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} - ${window.location.href}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this job: ${selectedJob.title}`)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
    
    // Update job shares
    const updatedJobs = jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, shares: (job.shares || 0) + 1 }
        : job
    );
    setJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Update total shares
    const newTotal = totalShares + 1;
    setTotalShares(newTotal);
    localStorage.setItem('total_job_shares', newTotal.toString());
    
    // Track sharing
    trackGoogleButtonClick(`share_${platform}`, 'share_modal', 'job_applications');
    trackButtonClick(`share_${platform}`, 'share_modal', '/job-applications');
    trackSocialShare(platform, 'job', selectedJob.id);
    trackGoogleSocialShare(platform, 'job', selectedJob.id);
    
    // Track share event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_shared',
      'Social Sharing',
      platform,
      {
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        company: selectedJob.company,
        platform: platform,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  const shareViaEmail = () => {
    if (selectedJob) {
      const subject = `Job Opportunity: ${selectedJob.title} at ${selectedJob.company}`;
      const body = `Check out this job opportunity on CareerCraft:\n\nPosition: ${selectedJob.title}\nCompany: ${selectedJob.company}\nLocation: ${selectedJob.location}\n\nView details: ${window.location.href}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
      
      // Update job shares
      const updatedJobs = jobs.map(job => 
        job.id === selectedJob.id 
          ? { ...job, shares: (job.shares || 0) + 1 }
          : job
      );
      setJobs(updatedJobs);
      localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
      
      // Update total shares
      const newTotal = totalShares + 1;
      setTotalShares(newTotal);
      localStorage.setItem('total_job_shares', newTotal.toString());
      
      // Track sharing
      trackGoogleButtonClick('share_email', 'share_modal', 'job_applications');
      trackButtonClick('share_email', 'share_modal', '/job-applications');
      trackSocialShare('email', 'job', selectedJob.id);
      trackGoogleSocialShare('email', 'job', selectedJob.id);
    }
  };

  // Save job functionality
  const handleSaveJob = (jobId: string, jobTitle: string, company: string) => {
    const isAlreadySaved = savedJobs.includes(jobId);
    
    if (isAlreadySaved) {
      // Remove from saved
      const newSaved = savedJobs.filter(id => id !== jobId);
      setSavedJobs(newSaved);
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
    } else {
      // Add to saved
      const newSaved = [...savedJobs, jobId];
      setSavedJobs(newSaved);
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
      
      // Track job save
      trackJobSave(jobId, jobTitle, company);
      
      // Track save event - FIXED: Use trackFirebaseEvent instead of trackEvent
      trackFirebaseEvent(
        'job_saved',
        'Job Interaction',
        jobId,
        {
          job_id: jobId,
          job_title: jobTitle,
          company: company,
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
        }
      );
    }
    
    trackGoogleButtonClick(
      isAlreadySaved ? 'unsave_job' : 'save_job', 
      'job_card', 
      'job_applications'
    );
    trackButtonClick(
      isAlreadySaved ? 'unsave_job' : 'save_job', 
      'job_card', 
      '/job-applications'
    );
  };

  // Newsletter signup
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackGoogleButtonClick('newsletter_signup_jobs', 'newsletter', 'job_applications');
      trackButtonClick('newsletter_signup_jobs', 'newsletter', '/job-applications');
      
      // Track newsletter signup - FIXED: Use trackFirebaseEvent instead of trackEvent
      trackFirebaseEvent(
        'newsletter_signup',
        'User Engagement',
        'job_alerts',
        {
          email: newsletterEmail,
          preferences: {
            sector: selectedSector !== 'all' ? selectedSector : 'all',
            location: locationFilter || 'all'
          },
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
        }
      );
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('job_subscribers') || '[]');
      subscribers.push({ 
        email: newsletterEmail, 
        date: new Date().toISOString(),
        preferences: {
          sector: selectedSector !== 'all' ? selectedSector : 'all',
          location: locationFilter || 'all'
        }
      });
      localStorage.setItem('job_subscribers', JSON.stringify(subscribers));
      
      alert(`Thank you! You'll receive job alerts at ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  // Enable notifications
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          trackGoogleButtonClick('notification_enabled', 'system', 'job_applications');
          trackButtonClick('notification_enabled', 'system', '/job-applications');
          
          // Track notification permission granted - FIXED: Use trackFirebaseEvent instead of trackEvent
          trackFirebaseEvent(
            'notification_permission_granted',
            'System',
            'job_alerts',
            {
              user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
            }
          );
          
          localStorage.setItem('job_notifications', 'true');
          alert('Notifications enabled! You will receive job alerts.');
        }
      });
    } else if (Notification.permission === 'granted') {
      alert('Notifications are already enabled.');
    }
  };

  // Download jobs as CSV
  const downloadJobsCSV = () => {
    const csvContent = [
      ['Title', 'Company', 'Location', 'Type', 'Sector', 'Salary', 'Posted Date', 'Apply Link', 'Views', 'Shares', 'Applications'],
      ...jobs.map(job => [
        `"${job.title}"`,
        `"${job.company}"`,
        `"${job.location}"`,
        `"${job.type}"`,
        `"${job.sector}"`,
        `"${job.salary}"`,
        `"${job.postedDate}"`,
        `"${job.applyLink}"`,
        job.views || 0,
        job.shares || 0,
        job.applications || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackGoogleButtonClick('download_jobs_csv', 'export', 'job_applications');
    trackButtonClick('download_jobs_csv', 'export', '/job-applications');
    
    // Track export event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'jobs_exported',
      'System',
      'csv_export',
      {
        format: 'csv',
        job_count: jobs.length,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  // View analytics dashboard
  const viewAnalyticsDashboard = () => {
    trackGoogleButtonClick('view_analytics_dashboard', 'analytics_cta', 'job_applications');
    trackButtonClick('view_analytics_dashboard', 'analytics_cta', '/job-applications');
    trackGoogleCTAClick('analytics_dashboard', 'page_header', 'job_applications');
    trackCTAClick('analytics_dashboard', 'page_header', '/job-applications');
    
    // Track analytics view event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'analytics_dashboard_accessed',
      'Analytics',
      'job_applications',
      {
        source: 'page_header',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
  };

  // Apply for job
  const handleApply = (job: Job) => {
    // Track job application
    trackJobApplication(job.id, job.title, job.company, 'direct');
    trackJobApplicationSubmit(job.id, job.title, job.company, 'direct');
    
    // Update job applications count
    const updatedJobs = jobs.map(j => 
      j.id === job.id 
        ? { ...j, applications: (j.applications || 0) + 1 }
        : j
    );
    setJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Update total applications
    const newTotal = totalApplications + 1;
    setTotalApplications(newTotal);
    localStorage.setItem('total_job_applications_submitted', newTotal.toString());
    
    // Track application event - FIXED: Use trackFirebaseEvent instead of trackEvent
    trackFirebaseEvent(
      'job_application_submitted',
      'Job Applications',
      job.id,
      {
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        application_method: 'direct',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    );
    
    // Track funnel step
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('job_search_funnel', 'application_submitted', 3, {
      user_id: userId,
      job_id: job.id,
      job_title: job.title,
      company: job.company
    });
    
    trackGoogleFunnelStep('job_search', 'application_started', 2, userId);
    
    // Open apply link
    if (job.applyLink && job.applyLink.startsWith('http')) {
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
      trackExternalLink('Apply Now', job.applyLink, 'job_applications');
    }
  };

  // Generate structured data for top 10 jobs
  const generateJobPostingStructuredData = () => {
    const topJobs = jobs.slice(0, 10);
    return topJobs.map((job, index) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.postedDate,
      "validThrough": new Date(new Date(job.postedDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "employmentType": job.type,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
        "sameAs": job.applyLink.startsWith('http') ? job.applyLink : undefined
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location.split(',')[0],
          "addressRegion": job.location.split(',')[1] || job.location,
          "addressCountry": "IN"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary.replace(/[^0-9]/g, ''),
          "unitText": "MONTH"
        }
      },
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "India"
      },
      "countryOfOrigin": "India",
      "experienceRequirements": job.requirements.join(' '),
      "inLanguage": "en-IN"
    }));
  };

  // FAQ structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How often are jobs updated on CareerCraft?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Jobs are updated daily on CareerCraft. We manually curate fresh opportunities from top Indian companies and remove expired listings after 90 days."
        }
      },
      {
        "@type": "Question",
        "name": "Are these job listings free to apply?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all job listings on CareerCraft are 100% free to apply. We partner directly with companies and never charge candidates for applications."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get job alerts for specific cities?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Use our newsletter signup form to receive daily job alerts filtered by your preferred cities, sectors, and job types."
        }
      },
      {
        "@type": "Question",
        "name": "How do I apply for jobs on CareerCraft?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click the 'Apply Now' button on any job listing. You'll be directed to the company's official application portal. Always apply through the official company website."
        }
      },
      {
        "@type": "Question",
        "name": "Do you have jobs for freshers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We have dedicated fresher job listings across IT, Engineering, Marketing, and Business roles. Filter by 'Entry Level' or 'Internship' to find suitable opportunities."
        }
      }
    ]
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://careercraft.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Job Portal",
        "item": "https://careercraft.in/job-applications"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Latest Jobs India 2025",
        "item": window.location.href
      }
    ]
  };

  // Website structured data with search action
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CareerCraft.in - India's Career Platform",
    "url": "https://careercraft.in",
    "description": "India's premier career platform offering free ATS-optimized resume builder and job portal services",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://careercraft.in/job-applications?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CareerCraft India",
      "logo": "https://careercraft.in/logos/careercraft-logo-square.png"
    }
  };

  // Organization structured data
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CareerCraft India",
    "url": "https://careercraft.in",
    "logo": "https://careercraft.in/logos/careercraft-logo-square.png",
    "description": "India's premier career platform offering free ATS-optimized resume builder and job portal services",
    "email": "contact@careercraft.in",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.linkedin.com/in/career-coach-expert-2a47a0399",
      "https://www.instagram.com/career_craft_india/"
    ],
    "founder": {
      "@type": "Person",
      "name": "CareerCraft Team"
    },
    "foundingDate": "2024",
    "areaServed": "IN",
    "knowsAbout": [
      "Resume Writing",
      "ATS Optimization",
      "Job Search India",
      "Career Counseling",
      "Interview Preparation"
    ]
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>🔥 Latest Job Opportunities in India 2025 | Fresh Openings | CareerCraft</title>
        <meta name="description" content="Daily updated job postings from top Indian companies. IT, Engineering, Marketing, Fresher jobs across Bangalore, Mumbai, Delhi, Hyderabad. Apply now!" />
        <meta name="keywords" content="latest jobs India 2025, fresh job openings, IT jobs Bangalore today, engineering jobs Pune, fresher jobs India, remote jobs India, daily job updates, career opportunities India, software jobs Hyderabad, marketing jobs Mumbai, finance jobs Delhi, government jobs India, walk-in interviews, immediate hiring" />
        <link rel="canonical" href="https://careercraft.in/job-applications" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/job-applications" />
        <meta property="og:title" content="🔥 Latest Job Opportunities in India 2025 | Fresh Openings | CareerCraft" />
        <meta property="og:description" content="Daily updated job postings from top Indian companies. IT, Engineering, Marketing, Fresher jobs across Bangalore, Mumbai, Delhi, Hyderabad. Apply now!" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CareerCraft Job Portal - Latest Jobs in India" />
        <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://careercraft.in/job-applications" />
        <meta property="twitter:title" content="🔥 Latest Job Opportunities in India 2025 | Fresh Openings | CareerCraft" />
        <meta property="twitter:description" content="Daily updated job postings from top Indian companies. IT, Engineering, Marketing, Fresher jobs across Bangalore, Mumbai, Delhi, Hyderabad. Apply now!" />
        <meta property="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="CareerCraft India" />
        <meta name="copyright" content="CareerCraft India" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        
        {/* hreflang tags */}
        <link rel="alternate" href="https://careercraft.in/job-applications" hreflang="en-in" />
        <link rel="alternate" href="https://careercraft.in/job-applications" hreflang="en" />
        <link rel="alternate" href="https://careercraft.in/job-applications" hreflang="x-default" />
        
        {/* Structured Data - Website */}
        <script type="application/ld+json">
          {JSON.stringify(websiteStructuredData)}
        </script>
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify(organizationStructuredData)}
        </script>
        
        {/* Structured Data - Job Postings (Top 10) */}
        {generateJobPostingStructuredData().map((jobData, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(jobData)}
          </script>
        ))}
        
        {/* Structured Data - FAQ Page */}
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
        
        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
        
        {/* Structured Data - ItemList for all jobs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Latest Job Opportunities in India",
            "description": "Daily updated curated job postings from top Indian companies and startups",
            "url": "https://careercraft.in/job-applications",
            "numberOfItems": jobs.length,
            "itemListElement": jobs.slice(0, 10).map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "JobPosting",
                "title": job.title,
                "description": job.description,
                "datePosted": job.postedDate,
                "hiringOrganization": {
                  "@type": "Organization",
                  "name": job.company
                },
                "jobLocation": {
                  "@type": "Place",
                  "address": job.location
                },
                "employmentType": job.type
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Notification Banner */}
      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Bell size={20} className="mr-2" />
              <span className="font-semibold">Turn on notifications to never miss a job!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestNotificationPermission}
                className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => {
                  setShowNotificationBanner(false);
                  trackGoogleButtonClick('notification_dismissed', 'notification', 'job_applications');
                  trackButtonClick('notification_dismissed', 'notification', '/job-applications');
                }}
                className="text-white hover:text-blue-200 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-blue-100 hover:text-white"
              onClick={() => {
                trackButtonClick('back_to_home', 'navigation', '/job-applications');
                trackUserFlow('job_applications', 'home', 'navigation');
              }}
            >
              <Home size={18} />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-blue-100 text-sm">Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Job Opportunities in India</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Freshly updated job postings from top Indian companies. Updated daily.
            <span className="block text-sm text-blue-200 mt-2">Share jobs to help friends & grow community</span>
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link 
              to="/job-drives"
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
              onClick={() => {
                trackButtonClick('view_job_drives', 'quick_nav', '/job-applications');
                trackUserFlow('job_applications', 'job_drives', 'navigation');
              }}
            >
              <ArrowRight size={16} />
              View Job Drives
            </Link>
            <Link 
              to="/government-exams"
              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
              onClick={() => {
                trackButtonClick('view_government_exams', 'quick_nav', '/job-applications');
                trackUserFlow('job_applications', 'government_exams', 'navigation');
              }}
            >
              <ArrowRight size={16} />
              View Government Exams
            </Link>
            <Link 
              to="/blog"
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              onClick={() => {
                trackButtonClick('view_career_blog', 'quick_nav', '/job-applications');
                trackUserFlow('job_applications', 'blog', 'navigation');
              }}
            >
              <ArrowRight size={16} />
              View Career Blog
            </Link>
          </div>
          
          {/* Real-time Stats */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <Eye size={16} />
              <span>{totalViews} views today</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <Briefcase size={16} />
              <span>{totalApplications} applications</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <Share2 size={16} />
              <span>{totalShares} shares</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <Users size={16} />
              <span>{jobs.length} jobs</span>
            </div>
            <button 
              onClick={viewAnalyticsDashboard}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} />
              View Analytics
            </button>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or state"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  Find Latest Jobs
                </button>
              </div>
            </div>
          </form>

          {/* Popular Cities Quick Filters */}
          <div className="mt-6">
            <p className="text-blue-100 mb-3">Popular Indian Cities:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-blue-100">Latest Jobs: {totalJobsCount}</span>
              <span className="text-green-300 text-sm">(Auto-cleaned every 90 days)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Share2 size={16} />
              <span className="text-blue-100">Shared: {totalShares} times</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Briefcase size={16} />
              <span className="text-blue-100">Remote: {remoteJobsCount} positions</span>
            </div>
            <button 
              onClick={clearFilters}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                if (jobs.length > 0) {
                  handleShareClick(jobs[0]);
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-amber-600 transition-colors flex items-center gap-2"
            >
              <Share2 size={16} />
              Share Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky-sidebar">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={20} />
                    Filters
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Sector Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={16} />
                    Industry
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                  >
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>
                        {sector === 'all' ? 'All Industries' : sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} />
                    Job Type
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Analytics Insights */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <BarChart size={16} />
                    Analytics Insights
                  </h4>
                  <div className="space-y-3 text-sm">
                    {/* Top Cities */}
                    <div>
                      <p className="text-gray-600 mb-1">🏙️ Top Cities</p>
                      <div className="space-y-1">
                        {analytics.topCities.map((city, index) => (
                          <div key={city.city} className="flex justify-between items-center">
                            <span className="text-gray-700">{city.city}</span>
                            <span className="font-bold text-blue-600">{city.count} jobs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Top Sectors */}
                    <div>
                      <p className="text-gray-600 mb-1">📊 Popular Sectors</p>
                      <div className="space-y-1">
                        {analytics.topSectors.map((sector, index) => (
                          <div key={sector.sector} className="flex justify-between items-center">
                            <span className="text-gray-700 truncate">{sector.sector}</span>
                            <span className="font-bold text-purple-600">{sector.count} jobs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Popular Jobs */}
                    <div>
                      <p className="text-gray-600 mb-1">🔥 Popular Jobs</p>
                      <div className="space-y-2">
                        {analytics.popularJobs.map((job, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <p className="font-medium text-gray-800 text-xs truncate">{job.title}</p>
                            <p className="text-gray-600 text-xs">{job.company}</p>
                            <p className="text-green-600 text-xs">👁️ {job.views} views</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-bold text-green-600">
                          {totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Briefcase size={18} />
                  Build Your Indian Resume
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create an ATS-friendly resume optimized for Indian job market.
                </p>
                <Link 
                  to="/builder" 
                  onClick={() => {
                    trackGoogleButtonClick('build_resume_sidebar', 'sidebar_cta', 'job_applications');
                    trackButtonClick('build_resume_sidebar', 'sidebar_cta', '/job-applications');
                    trackFunnelStep('job_search_funnel', 'build_resume_clicked', 2.5, {
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      source: 'job_applications_sidebar'
                    });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>

              {/* Analytics Dashboard Access */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <BarChart size={18} />
                  View Analytics
                </h3>
                <p className="text-purple-700 text-sm mb-3">
                  Track job applications and user behavior
                </p>
                <Link 
                  to="/admin/firebase-analytics" 
                  onClick={() => {
                    trackGoogleButtonClick('view_analytics', 'sidebar_cta', 'job_applications');
                    trackButtonClick('view_analytics', 'sidebar_cta', '/job-applications');
                    trackGoogleCTAClick('analytics_dashboard', 'sidebar', 'job_applications');
                    trackCTAClick('analytics_dashboard', 'sidebar', '/job-applications');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors block text-center"
                >
                  View Analytics
                </Link>
              </div>

              {/* Export Jobs */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <Download size={18} />
                  Export Jobs
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Download all jobs as CSV for offline reference
                </p>
                <button 
                  onClick={downloadJobsCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center w-full"
                >
                  Download CSV
                </button>
              </div>

              {/* Saved Jobs */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Bookmark size={18} />
                  Saved Jobs
                </h3>
                <p className="text-amber-700 text-sm mb-2">
                  You have {savedJobs.length} saved jobs
                </p>
                {savedJobs.length > 0 && (
                  <button 
                    onClick={() => {
                      const savedJobsList = jobs.filter(job => savedJobs.includes(job.id));
                      alert(`Saved Jobs:\n${savedJobsList.map(job => `• ${job.title} at ${job.company}`).join('\n')}`);
                    }}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    View Saved Jobs
                  </button>
                )}
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold flex items-center gap-2">
                      📋 Latest CareerCraft Curated Jobs
                    </p>
                    <p className="text-blue-700 text-sm">
                      Showing {filteredJobs.length} freshly filtered jobs from our Indian job database
                    </p>
                    <p className="text-blue-700 text-sm">
                      {totalJobsCount} latest jobs • Sorted by newest first • Auto-cleaned every 90 days
                    </p>
                  </div>
                  <div className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    Updated: {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">⭐ Latest Featured Opportunities</h2>
                  <div className="space-y-4">
                    {featuredJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        featured 
                        saved={savedJobs.includes(job.id)}
                        onShare={handleShareClick}
                        onSave={handleSaveJob}
                        onApply={handleApply}
                        onTrackView={(jobId, jobTitle, company) => {
                          trackJobView(jobId, jobTitle, company);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Jobs */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedSector === 'all' ? 'All Latest Job Opportunities in India' : `Latest ${selectedSector} Jobs in India`} 
                  <span className="text-gray-600 text-lg ml-2">({filteredJobs.length})</span>
                </h2>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Eye size={14} />
                  {totalViews} views today •
                  <Briefcase size={14} />
                  {totalApplications} applications
                </div>
              </div>
              
              {currentJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No latest jobs found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        saved={savedJobs.includes(job.id)}
                        onShare={handleShareClick}
                        onSave={handleSaveJob}
                        onApply={handleApply}
                        onTrackView={(jobId, jobTitle, company) => {
                          trackJobView(jobId, jobTitle, company);
                        }}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 rounded-lg border ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {/* Newsletter Signup */}
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-bold text-blue-800 text-lg mb-2 flex items-center gap-2">
                      <Send size={18} />
                      Get Daily Job Alerts
                    </h3>
                    <p className="text-blue-700 text-sm">
                      We'll send you fresh job openings matching your profile
                    </p>
                  </div>
                  <form 
                    onSubmit={handleNewsletterSignup}
                    className="flex gap-2 w-full md:w-auto"
                  >
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      <Send size={16} />
                      Get Alerts
                    </button>
                  </form>
                </div>
              </div>

              {/* Community Stats */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  CareerCraft Community Impact
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-green-600 text-xl">
                      {totalJobsCount}
                    </div>
                    <div className="text-gray-600">Latest Jobs</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-blue-600 text-xl">
                      {totalShares}
                    </div>
                    <div className="text-gray-600">Jobs Shared</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-purple-600 text-xl">
                      {Math.ceil(totalJobsCount / 10)}
                    </div>
                    <div className="text-gray-600">Job Pages</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-amber-600 text-xl">
                      90
                    </div>
                    <div className="text-gray-600">Days Fresh</div>
                  </div>
                </div>
                <p className="text-green-700 text-sm mt-4 text-center">
                  <Users size={14} className="inline mr-1" />
                  Every share helps a friend find their dream job. Keep sharing!
                </p>
              </div>

              {/* Navigation to Other Sections */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/job-drives"
                  className="bg-green-50 border border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors"
                  onClick={() => {
                    trackButtonClick('navigate_job_drives', 'bottom_nav', '/job-applications');
                    trackUserFlow('job_applications', 'job_drives', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-green-800 mb-2">🚀 Job Drives & Walk-ins</h3>
                  <p className="text-green-700 text-sm">Immediate hiring with direct company interviews</p>
                </Link>
                <Link 
                  to="/government-exams"
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 hover:bg-emerald-100 transition-colors"
                  onClick={() => {
                    
                    trackButtonClick('navigate_government_exams', 'bottom_nav', '/job-applications');
                    trackUserFlow('job_applications', 'government_exams', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-emerald-800 mb-2">🏛️ Government Exams</h3>
                  <p className="text-emerald-700 text-sm">Latest Sarkari Naukri exams and notifications</p>
                </Link>
                <Link 
                  to="/blog"
                  className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:bg-purple-100 transition-colors"
                  onClick={() => {
                    trackButtonClick('navigate_career_blog', 'bottom_nav', '/job-applications');
                    trackUserFlow('job_applications', 'blog', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-purple-800 mb-2">📝 Career Blog</h3>
                  <p className="text-purple-700 text-sm">Resume tips and career advice for Indian job market</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Share Job Opportunity</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">{selectedJob.title}</h4>
                <p className="text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                <p className="text-xs text-gray-500 mt-1">Share with friends who might be interested</p>
              </div>

              {/* Social Sharing Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="flex flex-col items-center justify-center p-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={24} />
                  <span className="text-xs mt-2">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="flex flex-col items-center justify-center p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={24} />
                  <span className="text-xs mt-2">Twitter/X</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('linkedin')}
                  className="flex flex-col items-center justify-center p-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={24} />
                  <span className="text-xs mt-2">LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="flex flex-col items-center justify-center p-4 bg-[#25D366] text-white rounded-lg hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={24} />
                  <span className="text-xs mt-2">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex flex-col items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail size={24} />
                  <span className="text-xs mt-2">Email</span>
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Copy size={24} />
                  <span className="text-xs mt-2">
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>

              {/* Copy Link Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link to Job
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/job-applications?job=${selectedJob.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    trackGoogleButtonClick('apply_from_share', 'share_modal', 'job_applications');
                    trackButtonClick('apply_from_share', 'share_modal', '/job-applications');
                    trackFunnelStep('job_search_funnel', 'application_started_from_share', 2.2, {
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      job_id: selectedJob.id,
                      source: 'share_modal'
                    });
                    
                    if (selectedJob.applyLink && selectedJob.applyLink.startsWith('http')) {
                      handleApply(selectedJob);
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Job Card Component with Enhanced Tracking
interface JobCardProps {
  job: Job;
  featured?: boolean;
  saved: boolean;
  onShare: (job: Job) => void;
  onSave: (jobId: string, jobTitle: string, company: string) => void;
  onApply: (job: Job) => void;
  onTrackView: (jobId: string, jobTitle: string, company: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  featured = false, 
  saved,
  onShare,
  onSave,
  onApply,
  onTrackView
}) => {
  const { trackButtonClick: trackGoogleButtonClick } = useGoogleAnalytics();
  const { trackButtonClick } = useFirebaseAnalytics();
  
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000;
  
  // Track job view on mount
  useEffect(() => {
    onTrackView(job.id, job.title, job.company);
    
    // Update job views
    const updatedJob = { ...job, views: (job.views || 0) + 1 };
    const jobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    const updatedJobs = jobs.map((j: Job) => 
      j.id === job.id ? updatedJob : j
    );
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Update total views
    const currentViews = parseInt(localStorage.getItem('total_job_views') || '0');
    localStorage.setItem('total_job_views', (currentViews + 1).toString());
  }, [job.id]);

  const handleApplyClick = () => {
    onApply(job);
  };

  const handleBuildResumeClick = () => {
    trackGoogleButtonClick('build_resume_from_job', 'job_card', 'job_applications');
    trackButtonClick('build_resume_from_job', 'job_card', '/job-applications');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare(job);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave(job.id, job.title, job.company);
  };

  return (
    <div 
      className={`job-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${featured ? 'featured-job border-l-4 border-blue-500' : ''}`}
      itemScope
      itemType="https://schema.org/JobPosting"
    >
      <meta itemProp="datePosted" content={job.postedDate} />
      <meta itemProp="employmentType" content={job.type} />
      <meta itemProp="hiringOrganization" content={job.company} />
      <meta itemProp="jobLocation" content={job.location} />
      <meta itemProp="title" content={job.title} />
      
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1" itemProp="title">{job.title}</h3>
              <p className="text-lg text-gray-700 mb-2" itemProp="hiringOrganization">{job.company} • <span itemProp="jobLocation">{job.location}</span></p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveClick}
                  className={`p-1 rounded-full ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title={saved ? 'Remove from saved' : 'Save job'}
                >
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShareClick}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title="Share this job"
                >
                  <Share2 size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {isNewJob && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    🔥 NEW TODAY
                  </span>
                )}
                {featured && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Updated: {new Date(job.addedTimestamp || job.postedDate).toLocaleDateString('en-IN')}
                </span>
                {/* Job Stats */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>👁️ {job.views || 0}</span>
                  <span>📤 {job.shares || 0}</span>
                  <span>📝 {job.applications || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
              <Briefcase size={12} />
              {job.type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1">
              <Building size={12} />
              {job.sector}
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm flex items-center gap-1" itemProp="baseSalary">
              <DollarSign size={12} />
              {job.salary}
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm flex items-center gap-1" itemProp="jobLocation">
              <MapPin size={12} />
              {job.location}
            </span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2" itemProp="description">{job.description}</p>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index} itemProp="experienceRequirements">• {req}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Posted {new Date(job.postedDate).toLocaleDateString()}
            </span>
            {job.addedTimestamp && (
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                Last Updated: {new Date(job.addedTimestamp).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="lg:ml-6 lg:text-right mt-4 lg:mt-0 flex flex-col gap-2">
          <button 
            onClick={handleApplyClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
            itemProp="url"
          >
            <ExternalLink size={18} />
            Apply Now
          </button>
          <button
            onClick={handleShareClick}
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share Job
          </button>
          <button
            onClick={handleSaveClick}
            className={`border px-6 py-3 rounded-lg font-semibold transition-colors text-center flex items-center justify-center gap-2 ${
              saved
                ? 'border-red-600 text-red-600 hover:bg-red-50'
                : 'border-gray-600 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Save Job'}
          </button>
          <Link 
            to="/builder" 
            onClick={handleBuildResumeClick}
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
          >
            Build Resume First
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;