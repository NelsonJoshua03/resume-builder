// src/components/JobApplications.tsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
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
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react';

import {
  getJobsFromFirebase,
  initFirebaseApp,
  getDeviceId,
  clearFirebaseCache
} from '../services/firebase';

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
  firebaseId?: string;
  isSynced?: boolean;
}

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 10;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Firebase states
  const [firebaseEnabled, setFirebaseEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { 
    trackDailyPageView,
    trackJobSearch
  } = useEnhancedAnalytics();
  
  const { trackButtonClick, trackSocialShare } = useGoogleAnalytics();

  // Sample jobs to show when localStorage is empty
  const sampleJobs: Job[] = [
    {
      id: 'sample-1',
      title: "Frontend Developer",
      company: "Tech Solutions India",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      sector: "IT/Software",
      salary: "₹8,00,000 - ₹15,00,000 PA",
      description: "We are looking for a skilled Frontend Developer with experience in React.js and modern web technologies. Join our dynamic team to build innovative solutions.",
      requirements: [
        "2+ years of experience with React.js",
        "Proficiency in JavaScript, HTML5, CSS3",
        "Experience with state management (Redux)",
        "Knowledge of responsive web design",
        "Bachelor's degree in Computer Science"
      ],
      postedDate: new Date().toISOString().split('T')[0],
      applyLink: "mailto:careers@techsolutions.com",
      featured: true,
      addedTimestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
      page: 1
    },
    {
      id: 'sample-2',
      title: "Data Analyst",
      company: "Data Insights Corp",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      sector: "Data Science",
      salary: "₹5,00,000 - ₹10,00,000 PA",
      description: "Seeking a Data Analyst to interpret and analyze complex data sets. You will be responsible for data cleaning, analysis, and visualization.",
      requirements: [
        "Bachelor's degree in Statistics or related field",
        "Experience with SQL and Python",
        "Knowledge of data visualization tools",
        "Strong analytical skills"
      ],
      postedDate: new Date().toISOString().split('T')[0],
      applyLink: "mailto:hr@datainsights.com",
      featured: false,
      addedTimestamp: Date.now() - (5 * 24 * 60 * 60 * 1000),
      page: 1
    },
    {
      id: 'sample-3',
      title: "Mechanical Engineer",
      company: "Engineering Solutions Ltd",
      location: "Pune, Maharashtra",
      type: "Full-time",
      sector: "Engineering",
      salary: "₹4,00,000 - ₹8,00,000 PA",
      description: "Looking for a Mechanical Engineer with experience in design and development. Knowledge of AutoCAD and SolidWorks required.",
      requirements: [
        "Bachelor's degree in Mechanical Engineering",
        "1-3 years of experience",
        "Proficiency in AutoCAD, SolidWorks",
        "Knowledge of manufacturing processes"
      ],
      postedDate: new Date().toISOString().split('T')[0],
      applyLink: "mailto:careers@engineering.com",
      featured: true,
      addedTimestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
      page: 1
    }
  ];

  // Refs to prevent infinite loops
  const isInitialLoadRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasTrackedPageViewRef = useRef(false);

  // Popular cities for quick filtering
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  const sectors = ['all', 'IT/Software', 'Engineering', 'Data Science', 'Marketing', 'HR', 'Finance', 'Healthcare', 'Education', 'Sales'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];

  // Filtered jobs - memoized
  const filteredJobs = React.useMemo(() => jobs.filter(job => {
    const matchesSector = selectedSector === 'all' || job.sector === selectedSector;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSector && matchesType && matchesSearch && matchesLocation;
  }), [jobs, selectedSector, selectedType, searchTerm, locationFilter]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const featuredJobs = React.useMemo(() => jobs.filter(job => job.featured), [jobs]);
  const totalJobsCount = jobs.length;
  const cloudJobsCount = jobs.filter(job => job.id?.startsWith('firebase_')).length;

  // Load jobs function - FIXED
  const loadJobs = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Get device ID
      const id = getDeviceId();
      if (isMountedRef.current) {
        setDeviceId(id);
      }
      
      let jobsToDisplay: Job[] = [];
      
      if (firebaseEnabled) {
        // Try to load from Firebase
        const firebaseJobs = await getJobsFromFirebase(forceRefresh);
        
        if (firebaseJobs.length > 0) {
          jobsToDisplay = firebaseJobs;
        } else {
          // Firebase empty, try localStorage
          const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
          jobsToDisplay = savedJobs;
        }
      } else {
        // Firebase not available, use localStorage
        const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
        jobsToDisplay = savedJobs;
      }
      
      // If no jobs anywhere, show sample jobs
      if (jobsToDisplay.length === 0) {
        jobsToDisplay = sampleJobs;
        localStorage.setItem('manualJobs', JSON.stringify(sampleJobs));
      }
      
      // Auto-cleanup old jobs (older than 90 days)
      const now = Date.now();
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
      
      const recentJobs = jobsToDisplay.filter((job: Job) => {
        const jobTimestamp = job.addedTimestamp || new Date(job.postedDate).getTime();
        return jobTimestamp >= ninetyDaysAgo;
      });
      
      if (recentJobs.length !== jobsToDisplay.length) {
        localStorage.setItem('manualJobs', JSON.stringify(recentJobs));
        jobsToDisplay = recentJobs;
      }
      
      // Sort by newest first
      const sortedJobs = jobsToDisplay.sort((a: Job, b: Job) => {
        const timeA = a.addedTimestamp || new Date(a.postedDate).getTime();
        const timeB = b.addedTimestamp || new Date(b.postedDate).getTime();
        return timeB - timeA;
      });

      // Calculate pages
      const jobsWithPages = sortedJobs.map((job: Job, index: number) => ({
        ...job,
        page: job.page || Math.floor(index / jobsPerPage) + 1,
        addedTimestamp: job.addedTimestamp || Date.now()
      }));

      if (isMountedRef.current) {
        setJobs(jobsWithPages);
      }
      
      // Load shares count
      const shares = parseInt(localStorage.getItem('total_job_shares') || '0');
      if (isMountedRef.current) {
        setTotalShares(shares);
      }
      
      // Show notification banner for first visit today
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('last_job_page_visit');
      if (lastVisit !== today && isMountedRef.current) {
        setShowNotificationBanner(true);
        localStorage.setItem('last_job_page_visit', today);
      }
      
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback to localStorage
      const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      const jobsToDisplay = savedJobs.length > 0 ? savedJobs : sampleJobs;
      if (isMountedRef.current) {
        setJobs(jobsToDisplay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [firebaseEnabled]);

  // Refresh jobs from Firebase
  const refreshJobsFromCloud = useCallback(async () => {
    if (!firebaseEnabled) {
      setSyncMessage({ 
        type: 'error', 
        text: 'Cloud sync not enabled. Please check internet connection.' 
      });
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }
    
    setIsRefreshing(true);
    setSyncMessage({ type: 'success', text: '🔄 Refreshing from cloud...' });
    
    try {
      // Clear cache before refresh
      clearFirebaseCache();
      const freshJobs = await getJobsFromFirebase(true);
      setJobs(freshJobs);
      setSyncMessage({ 
        type: 'success', 
        text: `✅ Refreshed ${freshJobs.length} jobs from cloud!` 
      });
      trackButtonClick('refresh_cloud_jobs', 'sync', 'job_applications');
    } catch (error) {
      setSyncMessage({ 
        type: 'error', 
        text: 'Failed to refresh from cloud. Using cached data.' 
      });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  }, [firebaseEnabled, trackButtonClick]);

  // Load jobs on component mount - FIXED
  useEffect(() => {
    isMountedRef.current = true;
    
    const initialize = async () => {
      if (isInitialLoadRef.current) return;
      isInitialLoadRef.current = true;
      
      try {
        // Track page view once
        if (!hasTrackedPageViewRef.current) {
          trackDailyPageView('Job Applications', '/job-applications');
          hasTrackedPageViewRef.current = true;
        }
        
        // Initialize Firebase
        const firebaseInitialized = await initFirebaseApp();
        
        if (isMountedRef.current) {
          setFirebaseEnabled(firebaseInitialized);
        }
        
        // Load jobs
        await loadJobs();
        
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      isInitialLoadRef.current = false;
    };
  }, [trackDailyPageView, loadJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    trackJobSearch(searchTerm, filteredJobs.length, locationFilter || 'all');
    trackButtonClick('job_search', 'search_form', 'job_applications');
  };

  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    setCurrentPage(1);
    trackButtonClick(`filter_city_${city}`, 'city_filters', 'job_applications');
    trackJobSearch('', filteredJobs.length, city);
  };

  const clearFilters = () => {
    setSelectedSector('all');
    setSelectedType('all');
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
    trackButtonClick('clear_filters', 'filters', 'job_applications');
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    trackButtonClick(`page_${page}`, 'pagination', 'job_applications');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    setCurrentPage(1);
    trackButtonClick(`filter_sector_${sector}`, 'sector_filters', 'job_applications');
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    trackButtonClick(`filter_type_${type}`, 'type_filters', 'job_applications');
  };

  const handleShareClick = (job: Job) => {
    setSelectedJob(job);
    setShowShareModal(true);
    trackButtonClick('open_share_modal', 'job_card', 'job_applications');
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedJob(null);
    setCopySuccess(false);
  };

  const copyToClipboard = () => {
    if (selectedJob) {
      const jobUrl = `${window.location.origin}/job-applications?job=${selectedJob.id}`;
      navigator.clipboard.writeText(jobUrl);
      setCopySuccess(true);
      trackButtonClick('copy_job_link', 'share_modal', 'job_applications');
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`copy_link:job:${selectedJob.id}`);
      
      const newTotal = totalShares + 1;
      setTotalShares(newTotal);
      localStorage.setItem('total_job_shares', newTotal.toString());
      
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareOnFacebook = () => {
    if (selectedJob) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=Check out this job: ${selectedJob.title} at ${selectedJob.company}`;
      window.open(url, '_blank');
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`facebook:job:${selectedJob.id}`);
      
      trackButtonClick('share_facebook', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnTwitter = () => {
    if (selectedJob) {
      const text = `Check out this job opportunity: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`twitter:job:${selectedJob.id}`);
      
      trackButtonClick('share_twitter', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnLinkedIn = () => {
    if (selectedJob) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`linkedin:job:${selectedJob.id}`);
      
      trackButtonClick('share_linkedin', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedJob) {
      const text = `Check out this job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} - ${window.location.href}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`whatsapp:job:${selectedJob.id}`);
      
      trackButtonClick('share_whatsapp', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareViaEmail = () => {
    if (selectedJob) {
      const subject = `Job Opportunity: ${selectedJob.title} at ${selectedJob.company}`;
      const body = `Check out this job opportunity on CareerCraft:\n\nPosition: ${selectedJob.title}\nCompany: ${selectedJob.company}\nLocation: ${selectedJob.location}\n\nView details: ${window.location.href}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      
      // FIXED: trackSocialShare expects a string, not an object
      trackSocialShare(`email:job:${selectedJob.id}`);
      
      trackButtonClick('share_email', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const nativeShare = async () => {
    if (selectedJob && 'share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${selectedJob.title} at ${selectedJob.company}`,
          text: `Check out this job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`,
          url: window.location.href,
        });
        
        // FIXED: trackSocialShare expects a string, not an object
        trackSocialShare(`native:job:${selectedJob.id}`);
        
        trackButtonClick('native_share', 'share_modal', 'job_applications');
        incrementShares();
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const incrementShares = () => {
    const newTotal = totalShares + 1;
    setTotalShares(newTotal);
    localStorage.setItem('total_job_shares', newTotal.toString());
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackButtonClick('newsletter_signup_jobs', 'newsletter', 'job_applications');
      
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

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          trackButtonClick('notification_enabled', 'system', 'job_applications');
          localStorage.setItem('job_notifications', 'true');
          alert('Notifications enabled! You will receive job alerts.');
        }
      });
    } else if (Notification.permission === 'granted') {
      alert('Notifications are already enabled.');
    }
  };

  // SYNC FUNCTIONS
  const exportJobsJson = () => {
    const jobsToExport = jobs.filter(job => !job.id.startsWith('sample-'));
    const blob = new Blob([JSON.stringify(jobsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-jobs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('export_jobs_json', 'sync', 'job_applications');
    setSyncMessage({ type: 'success', text: `Exported ${jobsToExport.length} jobs to JSON file` });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const refreshJobs = useCallback(() => {
    if (firebaseEnabled) {
      refreshJobsFromCloud();
    } else {
      const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      setJobs(savedJobs);
      setSyncMessage({ type: 'success', text: 'Jobs refreshed from local storage' });
      setTimeout(() => setSyncMessage(null), 2000);
      trackButtonClick('refresh_local_jobs', 'sync', 'job_applications');
    }
  }, [firebaseEnabled, refreshJobsFromCloud, trackButtonClick]);

  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to clear all sample jobs? This will only remove sample jobs. Your imported or cloud jobs will remain.')) {
      const filteredJobs = jobs.filter(job => !job.id.startsWith('sample-'));
      localStorage.setItem('manualJobs', JSON.stringify(filteredJobs));
      setJobs(filteredJobs);
      clearFirebaseCache();
      setSyncMessage({ type: 'success', text: 'Sample jobs cleared' });
      setTimeout(() => setSyncMessage(null), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {firebaseEnabled ? 'Loading jobs from cloud...' : 'Loading local jobs...'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {firebaseEnabled ? '☁️ Cloud Sync Active' : '📱 Local Mode'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in</title>
        <meta name="description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find IT, engineering, marketing, fresher jobs across Bangalore, Mumbai, Delhi, Hyderabad and more." />
        <meta name="keywords" content="latest jobs India 2025, fresh job openings, IT jobs Bangalore today, engineering jobs Pune, fresher jobs India, remote jobs India, daily job updates, career opportunities India" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/job-applications" />
        
        <meta property="og:title" content="Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in" />
        <meta property="og:description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find IT, engineering, marketing jobs across major Indian cities." />
        <meta property="og:url" content="https://careercraft.in/job-applications" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest Job Opportunities in India 2025 | Fresh Job Openings | CareerCraft.in" />
        <meta name="twitter:description" content="Browse latest manually curated job opportunities from top Indian companies. Updated daily. Find your dream job today." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

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

      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-1 sm:mb-0">
              <Bell size={16} className="mr-2" />
              <span className="text-sm font-medium">Turn on notifications to never miss a job!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestNotificationPermission}
                className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowNotificationBanner(false)}
                className="text-white hover:text-blue-200 text-xs"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Message */}
      {syncMessage && (
        <div className={`${syncMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-4 mx-4 mt-4`}>
          <div className="flex items-center">
            {syncMessage.type === 'success' ? (
              <span className="mr-2">✅</span>
            ) : (
              <AlertCircle size={16} className="mr-2" />
            )}
            {syncMessage.text}
          </div>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="bg-gray-100 p-2 rounded-lg"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={refreshJobs}
              className="bg-gray-100 p-2 rounded-lg"
              title="Refresh jobs"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="lg:hidden bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={selectedSector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector === 'all' ? 'All' : sector}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Panel for Mobile */}
      {showSyncPanel && (
        <div className="lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mx-4 mt-4 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-blue-800">🔄 Sync Jobs Between Devices</h3>
            <button
              onClick={() => setShowSyncPanel(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={exportJobsJson}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={refreshJobs}
                className="flex-1 bg-gray-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
            {firebaseEnabled && (
              <button
                onClick={refreshJobsFromCloud}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
              >
                <Cloud size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh from Cloud'}
              </button>
            )}
            <button
              onClick={() => {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = window.location.href;
                document.body.appendChild(tempTextArea);
                tempTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextArea);
                setSyncMessage({ type: 'success', text: 'URL copied to clipboard' });
                setTimeout(() => setSyncMessage(null), 2000);
              }}
              className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium"
            >
              📋 Copy Page URL
            </button>
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> {firebaseEnabled 
                ? 'Jobs sync automatically across devices with cloud!' 
                : 'Export jobs from laptop, then import on mobile to sync'}
            </p>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">Latest Job Opportunities in India</h1>
          <p className="text-base sm:text-xl max-w-2xl mx-auto mb-6 sm:mb-8">
            Freshly updated job postings from top Indian companies. Updated daily.
            <span className="block text-xs sm:text-sm text-blue-200 mt-1 sm:mt-2">
              {firebaseEnabled ? '☁️ Auto-sync across all devices' : 'Share jobs to help friends & grow community'}
            </span>
          </p>
          
          {/* Desktop Search Form (hidden on mobile) */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg hidden lg:block">
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
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Find Latest Jobs
                </button>
              </div>
            </div>
          </form>

          {/* Popular Cities Quick Filters */}
          <div className="mt-4 sm:mt-6">
            <p className="text-blue-100 mb-2 sm:mb-3 text-sm sm:text-base">Popular Indian Cities:</p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-2xl mx-auto">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className="bg-white text-blue-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
              <span className="text-blue-100 text-xs sm:text-sm">Latest Jobs: {totalJobsCount}</span>
              <span className="text-green-300 text-xs hidden sm:inline">(Updated: {new Date().toLocaleDateString('en-IN')})</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
              <Share2 size={14} className="hidden sm:block" />
              <span className="text-blue-100 text-xs sm:text-sm">Shared: {totalShares} times</span>
            </div>
            <div className={`flex items-center gap-1 ${firebaseEnabled ? 'bg-green-100/20' : 'bg-gray-100/20'} backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg`}>
              {firebaseEnabled ? (
                <>
                  <Cloud size={14} className="text-green-300" />
                  <span className="text-green-100 text-xs sm:text-sm">Cloud: {cloudJobsCount}</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} className="text-gray-300" />
                  <span className="text-gray-100 text-xs sm:text-sm">Local Only</span>
                </>
              )}
            </div>
            <button 
              onClick={clearFilters}
              className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Sync</span>
              <span className="sm:hidden">Sync</span>
            </button>
            {firebaseEnabled && (
              <button
                onClick={refreshJobsFromCloud}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
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

                {/* Sync Panel for Desktop */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    🔄 Sync Between Devices
                    {firebaseEnabled && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        ☁️ Active
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2 mb-3">
                    <button
                      onClick={exportJobsJson}
                      className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      Export Jobs (JSON)
                    </button>
                    {firebaseEnabled && (
                      <button
                        onClick={refreshJobsFromCloud}
                        disabled={isRefreshing}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-70"
                      >
                        <Cloud size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh from Cloud'}
                      </button>
                    )}
                    <button
                      onClick={refreshJobs}
                      className="w-full bg-gray-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                    >
                      <RefreshCw size={16} />
                      Refresh Jobs
                    </button>
                    <button
                      onClick={clearAllJobs}
                      className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Clear Sample Jobs
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong>How to sync:</strong><br/>
                    {firebaseEnabled ? (
                      <>
                        1. Jobs sync automatically across devices<br/>
                        2. Post jobs from any device<br/>
                        3. All devices see the same jobs
                      </>
                    ) : (
                      <>
                        1. Export jobs from laptop<br/>
                        2. Save JSON file<br/>
                        3. Import on mobile device<br/>
                        4. Jobs will appear instantly
                      </>
                    )}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Latest Job Stats</h4>
                  <p className="text-sm text-gray-600">{filteredJobs.length} fresh jobs found</p>
                  <p className="text-sm text-gray-600">{totalJobsCount} total latest jobs</p>
                  <p className="text-sm text-gray-600">{jobs.filter(j => j.type === 'Remote').length} remote positions</p>
                  <p className="text-sm text-gray-600">{cloudJobsCount} cloud-synced jobs</p>
                  <p className="text-sm text-gray-600">Auto-cleaned: Older than 90 days</p>
                  <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                  <p className="text-sm text-gray-600 font-medium text-green-600">
                    <Share2 size={12} className="inline mr-1" />
                    {totalShares} jobs shared by community
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Status:</strong> {firebaseEnabled ? '☁️ Cloud Sync Active' : '📱 Local Mode'}
                    </p>
                    <p className="text-xs text-blue-700">
                      Device ID: {deviceId.substring(0, 10)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-blue-800 font-semibold">
                      📋 Latest CareerCraft Curated Jobs
                    </p>
                    <p className="text-blue-700 text-sm">
                      Showing {filteredJobs.length} freshly filtered jobs
                    </p>
                    <p className="text-blue-700 text-xs sm:text-sm">
                      {totalJobsCount} latest jobs • Sorted by newest first
                      {jobs.some(j => j.id.startsWith('sample-')) && ' • Showing sample jobs'}
                      {firebaseEnabled && ' • ☁️ Cloud Sync Active'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs sm:text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      Updated: {new Date().toLocaleDateString('en-IN')}
                    </div>
                    <button
                      onClick={refreshJobs}
                      className="bg-blue-600 text-white p-2 rounded-full"
                      title="Refresh jobs"
                    >
                      <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    {firebaseEnabled && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        ☁️ {cloudJobsCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">⭐ Latest Featured Opportunities</h2>
                  <div className="space-y-4">
                    {featuredJobs.map(job => (
                      <JobCard key={job.id} job={job} featured onShare={handleShareClick} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Jobs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {selectedSector === 'all' ? 'All Latest Job Opportunities' : `Latest ${selectedSector} Jobs`} 
                  <span className="text-gray-600 text-base sm:text-lg ml-2">({filteredJobs.length})</span>
                </h2>
                <div className="text-xs sm:text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Newest First
                </div>
              </div>
              
              {currentJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No latest jobs found</h3>
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
                  <div className="space-y-4 sm:space-y-6">
                    {currentJobs.map(job => (
                      <JobCard key={job.id} job={job} onShare={handleShareClick} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 sm:mt-8">
                      <nav className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Prev
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => goToPage(pageNumber)}
                              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border text-sm ${
                                currentPage === pageNumber
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {/* Sync Instructions */}
              {!firebaseEnabled && jobs.some(j => j.id.startsWith('sample-')) && (
                <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                  <h3 className="font-bold text-yellow-800 text-base sm:text-lg mb-2">📱 Want to See Your Custom Jobs on Mobile?</h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Currently showing sample jobs. To see your custom jobs on mobile:
                  </p>
                  <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                    <li>On your laptop, go to <strong>/admin/job-posting</strong> page</li>
                    <li>Click "Export" button to download jobs as JSON</li>
                    <li>Transfer JSON file to your mobile (email, WhatsApp, etc.)</li>
                    <li>On mobile, open this page and tap "Sync" button above</li>
                    <li>Select "Import" and choose the JSON file</li>
                    <li>Your custom jobs will appear instantly!</li>
                  </ol>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to="/admin/job-posting"
                      className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Go to Admin Page
                    </Link>
                    <button
                      onClick={() => setShowSyncPanel(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Show Sync Panel
                    </button>
                  </div>
                </div>
              )}

              {/* Cloud Sync Promo */}
              {!firebaseEnabled && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-bold text-green-800 text-base sm:text-lg mb-2 flex items-center gap-2">
                        <Cloud size={20} />
                        Enable Cloud Sync for Automatic Updates
                      </h3>
                      <p className="text-green-700 text-xs sm:text-sm">
                        Jobs posted on laptop will automatically appear on mobile!
                      </p>
                      <p className="text-green-700 text-xs mt-1">
                        No manual import/export needed
                      </p>
                    </div>
                    <Link
                      to="/admin/job-posting"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2 text-sm"
                    >
                      <Cloud size={16} />
                      Enable Cloud Sync
                    </Link>
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-bold text-blue-800 text-base sm:text-lg mb-2">📬 Get Daily Job Alerts</h3>
                    <p className="text-blue-700 text-xs sm:text-sm">
                      We'll send you fresh job openings matching your profile
                    </p>
                  </div>
                  <form 
                    onSubmit={handleNewsletterSignup}
                    className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
                  >
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2 text-sm"
                    >
                      <Send size={16} />
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Share Job Opportunity</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">{selectedJob.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                <p className="text-xs text-gray-500 mt-1">Share with friends who might be interested</p>
              </div>

              {'share' in navigator && typeof navigator.share === 'function' && (
                <button
                  onClick={nativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Share2 size={20} />
                  Share via Device
                </button>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={20} className="sm:hidden" />
                  <Facebook size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Facebook</span>
                </button>
                
                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={20} className="sm:hidden" />
                  <Twitter size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Twitter/X</span>
                </button>
                
                <button
                  onClick={shareOnLinkedIn}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={20} className="sm:hidden" />
                  <Linkedin size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">LinkedIn</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#25D366] text-white rounded-lg hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={20} className="sm:hidden" />
                  <MessageCircle size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail size={20} className="sm:hidden" />
                  <Mail size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Email</span>
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Copy size={20} className="sm:hidden" />
                  <Copy size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link to Job
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/job-applications?job=${selectedJob.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    trackButtonClick('apply_from_share', 'share_modal', 'job_applications');
                    window.open(selectedJob.applyLink, '_blank');
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 sm:py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink size={16} />
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

// Job Card Component - FIXED
const JobCard: React.FC<{ job: Job; featured?: boolean; onShare: (job: Job) => void }> = ({ job, featured = false, onShare }) => {
  const { trackJobApplication, trackJobView } = useEnhancedAnalytics();
  const { trackButtonClick } = useGoogleAnalytics();
  
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000;
  const isSampleJob = job.id.startsWith('sample-');
  const isCloudJob = job.id.startsWith('firebase_');
  
  // Track job view only once using ref
  const hasTrackedView = useRef(false);
  
  const handleViewJob = () => {
    if (!hasTrackedView.current) {
      trackJobView(job.id, job.title, 'job_listing');
      hasTrackedView.current = true;
    }
  };

  const handleApplyClick = () => {
    trackJobApplication(job.id, job.title, job.company);
    trackButtonClick('apply_job', 'job_card', 'job_applications');
  };

  const handleBuildResumeClick = () => {
    trackButtonClick('build_resume_from_job', 'job_card', 'job_applications');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(job);
  };

  // Call handleViewJob when component mounts
  React.useEffect(() => {
    handleViewJob();
  }, []);

  return (
    <div className={`job-card bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow ${
      featured ? 'featured-job border-l-4 border-blue-500' : ''
    } ${isSampleJob ? 'border border-yellow-300' : ''}`}>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 line-clamp-2">{job.title}</h3>
                <p className="text-base sm:text-lg text-gray-700 mb-2">{job.company} • {job.location}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <button
                  onClick={handleShareClick}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1 self-end"
                  title="Share this job"
                >
                  <Share2 size={18} />
                </button>
                <div className="flex flex-wrap gap-1 self-end">
                  {isNewJob && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  {isSampleJob && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      SAMPLE
                    </span>
                  )}
                  {isCloudJob && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      ☁️ CLOUD
                    </span>
                  )}
                  {featured && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {new Date(job.addedTimestamp || job.postedDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm">
                {job.type}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs sm:text-sm">
                {job.sector}
              </span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs sm:text-sm">
                {job.salary}
              </span>
            </div>

            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">{job.description}</p>

            <div className="mb-3 sm:mb-4">
              <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Requirements:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                {job.requirements.slice(0, 3).map((req, index) => (
                  <li key={index} className="line-clamp-1">• {req}</li>
                ))}
                {job.requirements.length > 3 && (
                  <li className="text-gray-500">+{job.requirements.length - 3} more requirements</li>
                )}
              </ul>
            </div>

            <p className="text-xs text-gray-500">
              Posted {new Date(job.postedDate).toLocaleDateString()}
              {job.addedTimestamp && ` • Updated: ${new Date(job.addedTimestamp).toLocaleDateString('en-IN')}`}
              {isCloudJob && ' • ☁️ Cloud Synced'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
          <a 
            href={job.applyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <ExternalLink size={16} className="sm:hidden" />
            <ExternalLink size={18} className="hidden sm:block" />
            Apply Now
          </a>
          <button
            onClick={handleShareClick}
            className="border border-blue-600 text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <Share2 size={16} className="sm:hidden" />
            <Share2 size={18} className="hidden sm:block" />
            Share Job
          </button>
          <Link 
            to="/builder" 
            onClick={handleBuildResumeClick}
            className="border border-green-600 text-green-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center text-sm sm:text-base"
          >
            Build Resume
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;