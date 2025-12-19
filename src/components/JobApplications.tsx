// src/components/JobApplications.tsx - UPDATED WITH EXPANDABLE DESCRIPTIONS
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { usePageTimeTracker } from '../hooks/usePageTimeTracker';
import { firebaseJobService } from '../firebase/jobService';
import { getFirebaseStatus } from '../firebase/config';
import type { JobData } from '../firebase/jobService';
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
  Bookmark,
  Database,
  WifiOff,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Check,
  Clock,
  Award,
  GraduationCap,
  Code,
  BarChart3,
  Smartphone,
  Cloud,
  Server,
  Database as DatabaseIcon
} from 'lucide-react';

type Job = JobData & {
  addedTimestamp?: number;
  page?: number;
  isNew?: boolean;
};

// SEO Keywords for Indian job market
const SEO_KEYWORDS = {
  'IT/Software': ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'Cloud', 'AWS', 'DevOps', 'Full Stack', 'Frontend', 'Backend', 'Mobile', 'Web'],
  'Engineering': ['CAD', 'Design', 'Manufacturing', 'Mechanical', 'Electrical', 'Civil', 'Automation', 'Quality', 'Production', 'Maintenance'],
  'Data Science': ['Python', 'R', 'Machine Learning', 'AI', 'Analytics', 'SQL', 'Tableau', 'Power BI', 'Big Data', 'Statistics'],
  'Marketing': ['Digital Marketing', 'SEO', 'Social Media', 'Content', 'Branding', 'Advertising', 'Campaign', 'Analytics', 'Google Ads'],
  'HR': ['Recruitment', 'Talent Acquisition', 'Employee Relations', 'Training', 'Compensation', 'HRMS', 'Payroll', 'Onboarding'],
  'Finance': ['Accounting', 'Taxation', 'Audit', 'Financial Analysis', 'Investment', 'Banking', 'CFA', 'CA', 'MBA Finance'],
  'Healthcare': ['Medical', 'Nursing', 'Pharmacy', 'Hospital', 'Clinical', 'Healthcare Management', 'Doctor', 'Surgeon'],
  'Education': ['Teaching', 'Training', 'Curriculum', 'Academic', 'Professor', 'Lecturer', 'Education Technology', 'E-learning'],
  'Sales': ['Business Development', 'Account Management', 'Client Acquisition', 'Negotiation', 'B2B', 'B2C', 'CRM', 'Salesforce']
};

// Function to extract SEO keywords from description
const extractSEOKeywords = (description: string, sector: string): string[] => {
  const keywords: string[] = [];
  const sectorKeywords = SEO_KEYWORDS[sector as keyof typeof SEO_KEYWORDS] || [];
  
  // Check for common keywords
  const commonKeywords = [
    'fresher', 'experienced', 'senior', 'junior', 'lead', 'manager', 'director',
    'remote', 'work from home', 'hybrid', 'onsite',
    'urgent', 'immediate', 'hiring',
    'startup', 'MNC', 'corporate', 'multinational'
  ];
  
  // Check description for sector-specific keywords
  sectorKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });
  
  // Add common keywords
  commonKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) {
      keywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Limit to 5 keywords max
  return keywords.slice(0, 5);
};

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  
  const jobsPerPage = 10;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
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
    trackUserFlow
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

  // Check Firebase status
  useEffect(() => {
    const status = getFirebaseStatus();
    setFirebaseStatus(status);
    setFirebaseConnected(!!status.firestore);
  }, []);

  // Load jobs from Firebase and localStorage with proper error handling
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setSyncStatus('Loading jobs...');
    
    try {
      // Check Firebase status
      const status = getFirebaseStatus();
      
      if (status.firestore && status.configValid) {
        setFirebaseConnected(true);
        
        try {
          // Load from Firebase
          const firebaseResult = await firebaseJobService.getJobs({}, 1, 1000);
          
          if (firebaseResult.jobs && firebaseResult.jobs.length > 0) {
            // Convert Firebase jobs to our Job type
            const firebaseJobs: Job[] = firebaseResult.jobs.map(job => ({
              ...job,
              id: job.id || `firebase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              addedTimestamp: job.createdAt ? new Date(job.createdAt).getTime() : Date.now(),
              postedDate: job.postedDate || new Date(job.createdAt || Date.now()).toISOString().split('T')[0],
              page: 1,
              isNew: true,
              views: job.views || 0,
              shares: job.shares || 0,
              applications: job.applications || 0
            }));
            
            // Sort by featured first, then by date (newest first)
            const sortedJobs = firebaseJobs.sort((a, b) => {
              // Featured jobs first
              if (a.featured && !b.featured) return -1;
              if (!a.featured && b.featured) return 1;
              
              // Then by date (newest first)
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.addedTimestamp || 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.addedTimestamp || 0;
              return dateB - dateA;
            });
            
            setSyncStatus(`${sortedJobs.length} jobs loaded`);
            setJobs(sortedJobs);
            
            // Cache in localStorage for offline access
            localStorage.setItem('firebase_jobs_cache', JSON.stringify({
              jobs: sortedJobs,
              timestamp: Date.now()
            }));
            
            // Also update manualJobs for backward compatibility
            localStorage.setItem('manualJobs', JSON.stringify(sortedJobs));
            
            setLoading(false);
            return;
          }
        } catch (firebaseError) {
          console.error('Error loading from Firebase:', firebaseError);
          setFirebaseConnected(false);
          setSyncStatus('Using local storage');
        }
      } else {
        setFirebaseConnected(false);
      }
      
      // Fallback to localStorage
      // First check Firebase cache
      const cacheData = localStorage.getItem('firebase_jobs_cache');
      if (cacheData) {
        try {
          const { jobs: cachedJobs, timestamp } = JSON.parse(cacheData);
          const cacheAge = Date.now() - timestamp;
          const maxCacheAge = 30 * 60 * 1000; // 30 minutes
          
          if (cacheAge < maxCacheAge && cachedJobs.length > 0) {
            setJobs(cachedJobs);
            setSyncStatus(`${cachedJobs.length} cached jobs`);
            setLoading(false);
            return;
          }
        } catch (cacheError) {
          console.warn('Error parsing cache:', cacheError);
        }
      }
      
      // Then check manualJobs (legacy)
      const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      
      // Clean up old jobs (older than 90 days)
      const now = Date.now();
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
      
      const recentJobs = savedJobs.filter((job: Job) => {
        const jobTimestamp = job.addedTimestamp || new Date(job.postedDate || Date.now()).getTime();
        return jobTimestamp >= ninetyDaysAgo;
      });
      
      // Update localStorage with only recent jobs
      if (recentJobs.length !== savedJobs.length) {
        localStorage.setItem('manualJobs', JSON.stringify(recentJobs));
      }
      
      // Sort by featured first, then by date (newest first)
      const sortedJobs = recentJobs.sort((a: Job, b: Job) => {
        // Featured jobs first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by date (newest first)
        const timeA = a.addedTimestamp || new Date(a.postedDate || Date.now()).getTime();
        const timeB = b.addedTimestamp || new Date(b.postedDate || Date.now()).getTime();
        return timeB - timeA;
      });

      // Add page numbers and default values
      const jobsWithPages = sortedJobs.map((job: Job, index: number) => ({
        ...job,
        page: job.page || Math.floor(index / jobsPerPage) + 1,
        addedTimestamp: job.addedTimestamp || Date.now(),
        views: job.views || 0,
        shares: job.shares || 0,
        applications: job.applications || 0
      }));

      setJobs(jobsWithPages);
      setSyncStatus(`${jobsWithPages.length} jobs from storage`);
      
    } catch (error) {
      console.error('Error loading jobs:', error);
      setSyncStatus('Error loading jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize user ID if not exists
  useEffect(() => {
    if (!localStorage.getItem('firebase_user_id')) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('firebase_user_id', userId);
      
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
    
    // Load jobs
    loadJobs();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (firebaseConnected) {
        loadJobs();
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [loadJobs, firebaseConnected]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/job-applications', 'Job Applications');
    
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('job_search_funnel', 'viewed_jobs_listing', 1, {
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_path: '/job-applications'
    });

    // Load analytics data
    loadAnalyticsData();
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

      // Simulate hourly trends
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
    
    const resultsCount = filteredJobs.length;
    
    // Firebase
    trackJobSearch(searchTerm, resultsCount, locationFilter || 'all');
    
    // Google Analytics
    trackGoogleJobSearch(searchTerm, resultsCount, locationFilter || 'all');
    
    // Track button click
    trackGoogleButtonClick('job_search', 'search_form', 'job_applications');
    trackButtonClick('job_search', 'search_form', '/job-applications');
    
    // Track search event
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
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    setCurrentPage(1);
    
    trackGoogleButtonClick(`filter_city_${city}`, 'city_filters', 'job_applications');
    trackButtonClick(`filter_city_${city}`, 'city_filters', '/job-applications');
    
    trackJobSearch('', filteredJobs.length, city);
    
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

  const totalJobsCount = jobs.length;

  // Calculate stats
  const remoteJobsCount = jobs.filter(job => job.type === 'Remote').length;
  const todayJobsCount = jobs.filter(job => {
    const jobDate = new Date(job.postedDate || job.createdAt || Date.now());
    const today = new Date();
    return jobDate.toDateString() === today.toDateString();
  }).length;

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    
    trackGoogleButtonClick(`page_${page}`, 'pagination', 'job_applications');
    trackButtonClick(`page_${page}`, 'pagination', '/job-applications');
    
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
    
    trackFirebaseEvent(
      'job_share_modal_opened',
      'Job Sharing',
      job.id || 'unknown',
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
        
        // Update job shares in Firebase
        if (selectedJob.id) {
          await firebaseJobService.incrementShareCount(selectedJob.id);
        }
        
        // Update local state
        const updatedJobs = jobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, shares: (job.shares || 0) + 1 }
            : job
        );
        setJobs(updatedJobs);
        
        // Update total shares
        const newTotal = totalShares + 1;
        setTotalShares(newTotal);
        localStorage.setItem('total_job_shares', newTotal.toString());
        
        // Track sharing
        trackGoogleButtonClick('copy_job_link', 'share_modal', 'job_applications');
        trackButtonClick('copy_job_link', 'share_modal', '/job-applications');
        trackSocialShare('copy_link', 'job', selectedJob.id || '');
        trackGoogleSocialShare('copy_link', 'job', selectedJob.id || '');
        
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
    
    // Update job shares in Firebase
    if (selectedJob.id) {
      firebaseJobService.incrementShareCount(selectedJob.id);
    }
    
    // Update local state
    const updatedJobs = jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, shares: (job.shares || 0) + 1 }
        : job
    );
    setJobs(updatedJobs);
    
    // Update total shares
    const newTotal = totalShares + 1;
    setTotalShares(newTotal);
    localStorage.setItem('total_job_shares', newTotal.toString());
    
    // Track sharing
    trackGoogleButtonClick(`share_${platform}`, 'share_modal', 'job_applications');
    trackButtonClick(`share_${platform}`, 'share_modal', '/job-applications');
    trackSocialShare(platform, 'job', selectedJob.id || '');
    trackGoogleSocialShare(platform, 'job', selectedJob.id || '');
    
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
      
      // Update job shares in Firebase
      if (selectedJob.id) {
        firebaseJobService.incrementShareCount(selectedJob.id);
      }
      
      // Update local state
      const updatedJobs = jobs.map(job => 
        job.id === selectedJob.id 
          ? { ...job, shares: (job.shares || 0) + 1 }
          : job
      );
      setJobs(updatedJobs);
      
      // Update total shares
      const newTotal = totalShares + 1;
      setTotalShares(newTotal);
      localStorage.setItem('total_job_shares', newTotal.toString());
      
      // Track sharing
      trackGoogleButtonClick('share_email', 'share_modal', 'job_applications');
      trackButtonClick('share_email', 'share_modal', '/job-applications');
      trackSocialShare('email', 'job', selectedJob.id || '');
      trackGoogleSocialShare('email', 'job', selectedJob.id || '');
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
        `"${job.postedDate || 'Not specified'}"`,
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
  const handleApply = async (job: Job) => {
    // Track job application
    trackJobApplication(job.id || '', job.title, job.company, 'direct');
    trackJobApplicationSubmit(job.id || '', job.title, job.company, 'direct');
    
    // Update job applications count in Firebase
    if (job.id) {
      await firebaseJobService.incrementApplicationCount(job.id);
    }
    
    // Update local state
    const updatedJobs = jobs.map(j => 
      j.id === job.id 
        ? { ...j, applications: (j.applications || 0) + 1 }
        : j
    );
    setJobs(updatedJobs);
    
    // Update total applications
    const newTotal = totalApplications + 1;
    setTotalApplications(newTotal);
    localStorage.setItem('total_job_applications_submitted', newTotal.toString());
    
    // Track application event
    trackFirebaseEvent(
      'job_application_submitted',
      'Job Applications',
      job.id || '',
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

  // Sync with Firebase manually
  const syncWithFirebase = async () => {
    setSyncStatus('Syncing with Firebase...');
    try {
      const result = await firebaseJobService.syncAllToFirebase();
      if (result.synced > 0) {
        setSyncStatus(`Synced ${result.synced} jobs`);
        // Reload jobs
        loadJobs();
      } else {
        setSyncStatus('Already synced');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('Sync failed');
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    setSyncStatus('Testing Firebase...');
    try {
      const result = await firebaseJobService.testFirebaseConnection();
      if (result.connected) {
        setFirebaseConnected(true);
        setSyncStatus('Firebase connected');
        loadJobs();
      } else {
        setFirebaseConnected(false);
        setSyncStatus('Firebase not connected');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setSyncStatus('Connection test failed');
    }
  };

  // Reload jobs
  const reloadJobs = () => {
    loadJobs();
    trackGoogleButtonClick('reload_jobs', 'system', 'job_applications');
    trackButtonClick('reload_jobs', 'system', '/job-applications');
  };

  // Calculate stats on mount
  useEffect(() => {
    const totalShares = localStorage.getItem('total_job_shares') || '0';
    const totalViews = localStorage.getItem('total_job_views') || '0';
    const totalApplications = localStorage.getItem('total_job_applications_submitted') || '0';
    
    setTotalShares(parseInt(totalShares));
    setTotalViews(parseInt(totalViews));
    setTotalApplications(parseInt(totalApplications));
  }, []);

  return (
    <>
      <Helmet>
        <title>Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in</title>
        <meta name="description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find IT, engineering, marketing, fresher jobs across Bangalore, Mumbai, Delhi, Hyderabad and more." />
        <meta name="keywords" content="latest jobs India 2025, fresh job openings, IT jobs Bangalore today, engineering jobs Pune, fresher jobs India, remote jobs India, daily job updates, career opportunities India" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/job-applications" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in" />
        <meta property="og:description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find IT, engineering, marketing jobs across major Indian cities." />
        <meta property="og:url" content="https://careercraft.in/job-applications" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in" />
        <meta name="twitter:description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find your dream job today." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        {/* Structured Data */}
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
                "datePosted": job.postedDate || new Date().toISOString(),
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

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">{syncStatus}</p>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-1 md:mb-0">
              <Bell size={16} className="mr-2" />
              <span className="font-semibold text-sm">Turn on notifications to never miss a job!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestNotificationPermission}
                className="bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
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

      {/* Compact Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-blue-100 hover:text-white mb-2 md:mb-0"
              onClick={() => {
                trackButtonClick('back_to_home', 'navigation', '/job-applications');
                trackUserFlow('job_applications', 'home', 'navigation');
              }}
            >
              <Home size={16} />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${firebaseConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {firebaseConnected ? <Database size={12} /> : <WifiOff size={12} />}
                {firebaseConnected ? 'Online' : 'Offline'}
              </div>
              <span className="text-blue-100 text-xs">Updated: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Latest Job Opportunities in India</h1>
          <p className="text-center text-blue-100 mb-4">
            Fresh job postings from top Indian companies • Updated daily
          </p>
          
          {/* Minimal Firebase Status */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
            <div className="text-xs text-blue-200">
              {syncStatus}
            </div>
            <button 
              onClick={reloadJobs}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Reload
            </button>
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-full transition-colors"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug
            </button>
          </div>
          
          {/* Debug Info (Collapsible) */}
          {showDebugInfo && firebaseStatus && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 max-w-2xl mx-auto text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                <div className={`px-2 py-1 rounded ${firebaseStatus.app ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  App: {firebaseStatus.app ? '✓' : '✗'}
                </div>
                <div className={`px-2 py-1 rounded ${firebaseStatus.firestore ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  Firestore: {firebaseStatus.firestore ? '✓' : '✗'}
                </div>
                <div className={`px-2 py-1 rounded ${firebaseStatus.configValid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  Config: {firebaseStatus.configValid ? '✓' : '✗'}
                </div>
                <div className={`px-2 py-1 rounded ${firebaseStatus.gdprConsent ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  Consent: {firebaseStatus.gdprConsent ? '✓' : '⚠'}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={testFirebaseConnection} className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
                  Test Connection
                </button>
                {!firebaseConnected && (
                  <button onClick={syncWithFirebase} className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded">
                    Sync to Firebase
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
              <Briefcase size={14} />
              <span>{jobs.length} jobs</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
              <Eye size={14} />
              <span>{totalViews} views</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
              <Share2 size={14} />
              <span>{totalShares} shares</span>
            </div>
            <button 
              onClick={clearFilters}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or state"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Search size={16} />
                  Find Jobs
                </button>
              </div>
            </div>
          </form>

          {/* Popular Cities Quick Filters */}
          <div className="mt-4">
            <div className="flex flex-wrap justify-center gap-1">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-4 sticky-sidebar">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={18} />
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Insights</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-gray-600 mb-1">Top Cities</p>
                      {analytics.topCities.slice(0, 3).map((city) => (
                        <div key={city.city} className="flex justify-between items-center">
                          <span className="text-gray-700 truncate">{city.city}</span>
                          <span className="font-bold text-blue-600">{city.count}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-1">Popular Jobs</p>
                      {analytics.popularJobs.map((job, index) => (
                        <div key={index} className="p-1 bg-gray-50 rounded text-xs">
                          <p className="font-medium text-gray-800 truncate">{job.title}</p>
                          <p className="text-gray-600">{job.views} views</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-bold text-blue-800 mb-1 text-sm">Build Your Resume</h3>
                <p className="text-blue-700 text-xs mb-3">
                  Create an ATS-friendly resume for Indian job market.
                </p>
                <Link 
                  to="/builder" 
                  onClick={() => {
                    trackGoogleButtonClick('build_resume_sidebar', 'sidebar_cta', 'job_applications');
                    trackButtonClick('build_resume_sidebar', 'sidebar_cta', '/job-applications');
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold text-sm">Latest CareerCraft Jobs</p>
                    <p className="text-blue-700 text-xs">
                      Showing {filteredJobs.length} jobs • Sorted by newest first
                    </p>
                  </div>
                  <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>

              {/* Unified Jobs List */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedSector === 'all' ? 'All Job Opportunities' : `${selectedSector} Jobs`} 
                  <span className="text-gray-600 text-base ml-2">({filteredJobs.length})</span>
                </h2>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <Eye size={12} />
                  {totalViews} views
                </div>
              </div>
              
              {currentJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4 text-sm">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        saved={savedJobs.includes(job.id || '')}
                        onShare={handleShareClick}
                        onSave={handleSaveJob}
                        onApply={handleApply}
                        onTrackView={(jobId, jobTitle, company) => {
                          trackJobView(jobId, jobTitle, company);
                          // Increment view count in Firebase
                          if (jobId) {
                            firebaseJobService.incrementViewCount(jobId);
                          }
                        }}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <nav className="flex items-center space-x-1">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-2 py-1 rounded border text-sm ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {/* Newsletter Signup */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-bold text-blue-800 text-sm mb-1">Get Daily Job Alerts</h3>
                    <p className="text-blue-700 text-xs">
                      Fresh job openings matching your profile
                    </p>
                  </div>
                  <form 
                    onSubmit={handleNewsletterSignup}
                    className="flex gap-2 w-full md:w-auto"
                  >
                    <input
                      type="email"
                      placeholder="Your email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-3 py-1 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      Get Alerts
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Share Job</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-1 text-sm">{selectedJob.title}</h4>
                <p className="text-xs text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
              </div>

              {/* Social Sharing Options */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="flex flex-col items-center justify-center p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={20} />
                  <span className="text-xs mt-1">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="flex flex-col items-center justify-center p-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-xs mt-1">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('linkedin')}
                  className="flex flex-col items-center justify-center p-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={20} />
                  <span className="text-xs mt-1">LinkedIn</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedJob.applyLink && selectedJob.applyLink.startsWith('http')) {
                      handleApply(selectedJob);
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
                >
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

// Job Card Component with Expandable Description
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
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000;
  const seoKeywords = extractSEOKeywords(job.description, job.sector);
  const maxDescriptionLength = 200;
  const maxRequirementsToShow = 3;
  
  // Track job view on mount
  React.useEffect(() => {
    onTrackView(job.id || '', job.title, job.company);
  }, [job.id]);

  const handleApplyClick = () => {
    onApply(job);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare(job);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave(job.id || '', job.title, job.company);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
    trackGoogleButtonClick(
      showFullDescription ? 'collapse_description' : 'expand_description',
      'job_card',
      'job_applications'
    );
  };

  const toggleRequirements = () => {
    setShowFullRequirements(!showFullRequirements);
    trackGoogleButtonClick(
      showFullRequirements ? 'collapse_requirements' : 'expand_requirements',
      'job_card',
      'job_applications'
    );
  };

  // Get appropriate icon for sector
  const getSectorIcon = (sector: string) => {
    switch(sector) {
      case 'IT/Software': return <Code size={14} />;
      case 'Engineering': return <Briefcase size={14} />;
      case 'Data Science': return <BarChart3 size={14} />;
      case 'Marketing': return <TrendingUp size={14} />;
      case 'HR': return <Users size={14} />;
      case 'Finance': return <DollarSign size={14} />;
      case 'Healthcare': return <Award size={14} />;
      case 'Education': return <GraduationCap size={14} />;
      case 'Sales': return <TrendingUp size={14} />;
      default: return <Briefcase size={14} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow ${featured ? 'border-l-4 border-blue-500' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          {/* Job Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getSectorIcon(job.sector)}
                <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <p className="text-gray-700 text-sm font-medium">{job.company}</p>
                <span className="text-gray-500 text-xs">•</span>
                <p className="text-gray-600 text-sm">{job.location}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveClick}
                  className={`p-1 rounded-full ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title={saved ? 'Remove from saved' : 'Save job'}
                >
                  <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShareClick}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title="Share this job"
                >
                  <Share2 size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {isNewJob && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
                {featured && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    FEATURED
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Job Tags & Quick Info */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Briefcase size={11} />
              {job.type}
            </span>
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Building size={11} />
              {job.sector}
            </span>
            {job.salary && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <DollarSign size={11} />
                {job.salary}
              </span>
            )}
            {seoKeywords.length > 0 && (
              <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Tag size={11} />
                Keywords: {seoKeywords.slice(0, 2).join(', ')}
              </span>
            )}
          </div>

          {/* SEO Keywords Badges */}
          {seoKeywords.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {seoKeywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description with Read More */}
          <div className="mb-3">
            <h4 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1">
              <span>Job Description</span>
            </h4>
            <div className="text-gray-600 text-sm">
              {showFullDescription ? (
                <div className="space-y-2">
                  <p>{job.description}</p>
                  <button
                    onClick={toggleDescription}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                  >
                    <ChevronUp size={12} />
                    Show Less
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    {job.description.length > maxDescriptionLength 
                      ? `${job.description.substring(0, maxDescriptionLength)}...`
                      : job.description
                    }
                  </p>
                  {job.description.length > maxDescriptionLength && (
                    <button
                      onClick={toggleDescription}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                    >
                      <ChevronDown size={12} />
                      Read More
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Requirements with Read More */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1">
                <Check size={14} />
                Key Requirements
              </h4>
              <ul className="text-sm text-gray-600">
                {job.requirements
                  .slice(0, showFullRequirements ? job.requirements.length : maxRequirementsToShow)
                  .map((req, index) => (
                    <li key={index} className="flex items-start mb-1">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
              </ul>
              {job.requirements.length > maxRequirementsToShow && (
                <button
                  onClick={toggleRequirements}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 mt-1"
                >
                  {showFullRequirements ? (
                    <>
                      <ChevronUp size={12} />
                      Show Less Requirements
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} />
                      Show All {job.requirements.length} Requirements
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Job Stats & Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Posted {new Date(job.postedDate || job.createdAt || Date.now()).toLocaleDateString()}
            </span>
            {job.addedTimestamp && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Updated: {new Date(job.addedTimestamp).toLocaleDateString('en-IN')}
              </span>
            )}
            {(job.views || job.shares || job.applications) && (
              <div className="flex items-center gap-2">
                {job.views && job.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {job.views} views
                  </span>
                )}
                {job.applications && job.applications > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {job.applications} applications
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:ml-4 mt-3 md:mt-0 flex flex-col gap-2 min-w-[140px]">
          <button 
            onClick={handleApplyClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all text-center flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
          >
            <ExternalLink size={14} />
            Apply Now
          </button>
          <button
            onClick={handleShareClick}
            className="border border-blue-600 text-blue-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-2 text-sm"
          >
            <Share2 size={14} />
            Share Job
          </button>
          <button
            onClick={handleSaveClick}
            className={`border px-4 py-2.5 rounded-lg font-semibold transition-colors text-center flex items-center justify-center gap-2 text-sm ${
              saved
                ? 'border-red-600 text-red-600 hover:bg-red-50'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Save Job'}
          </button>
          <Link 
            to="/builder" 
            onClick={() => trackGoogleButtonClick('build_resume_from_job', 'job_card', 'job_applications')}
            className="border border-green-600 text-green-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center text-sm"
          >
            Build Resume
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;