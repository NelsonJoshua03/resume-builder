// src/components/JobApplications.tsx - COMPLETE WITH ENHANCED TRACKING
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { usePageTimeTracker } from '../hooks/usePageTimeTracker'; // NEW
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
  Search
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
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);

  // Initialize user ID if not exists
  useEffect(() => {
    if (!localStorage.getItem('user_id')) {
      const userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
  }, []);

  // Track page time
  usePageTimeTracker('Job Applications Page');

  // Use BOTH enhanced analytics and Google Analytics
  const { 
    trackDailyPageView,
    trackJobViewEnhanced,
    trackJobApplicationSubmitEnhanced,
    trackJobSearchEnhanced,
    trackButtonClick: trackEnhancedButtonClick
  } = useEnhancedAnalytics();
  
  const { 
    trackButtonClick, 
    trackSocialShare, 
    trackCTAClick,
    trackExternalLink,
    trackFunnelStep,
    trackJobApplicationSubmit,
    trackJobApplication: trackJobApply,
    trackJobSearch
  } = useGoogleAnalytics();

  // Clean up old jobs (older than 3 months) and load jobs
  useEffect(() => {
    // Track page view
    trackDailyPageView('Job Applications', '/job-applications');
    
    // Track funnel step
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackFunnelStep('job_search', 'viewed_jobs_listing', 1, userId);
    
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
      addedTimestamp: job.addedTimestamp || Date.now()
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
      trackButtonClick('notification_shown_jobs', 'system', 'job_applications');
    }
  }, [trackDailyPageView, trackFunnelStep, trackButtonClick]);

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Track search with both systems
    trackJobSearch(searchTerm, filteredJobs.length, locationFilter || 'all');
    trackJobSearchEnhanced(searchTerm, filteredJobs.length, locationFilter || 'all');
    trackButtonClick('job_search', 'search_form', 'job_applications');
    
    // Track funnel step for search
    const userId = localStorage.getItem('user_id') || 'anonymous';
    if (searchTerm || locationFilter) {
      trackFunnelStep('job_search', 'searched_jobs', 1.5, userId);
    }
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    setCurrentPage(1);
    
    // Track filter clicks
    trackButtonClick(`filter_city_${city}`, 'city_filters', 'job_applications');
    trackJobSearch('', filteredJobs.length, city);
    trackJobSearchEnhanced('', filteredJobs.length, city);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSector('all');
    setSelectedType('all');
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
    trackButtonClick('clear_filters', 'filters', 'job_applications');
    trackEnhancedButtonClick('clear_filters', 'filters', 'job_applications');
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

  // Share functionality
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
      
      // Update total shares
      const newTotal = totalShares + 1;
      setTotalShares(newTotal);
      localStorage.setItem('total_job_shares', newTotal.toString());
      
      // Track sharing
      trackButtonClick('copy_job_link', 'share_modal', 'job_applications');
      trackSocialShare('copy_link', 'job', selectedJob.id);
      
      // Track daily shares
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `daily_shares_${today}`;
      const dailyShares = JSON.parse(localStorage.getItem(dailyKey) || '[]');
      dailyShares.push({
        type: 'job',
        id: selectedJob.id,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(dailyKey, JSON.stringify(dailyShares));
      
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareOnFacebook = () => {
    if (selectedJob) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=Check out this job: ${selectedJob.title} at ${selectedJob.company}`;
      window.open(url, '_blank');
      trackSocialShare('facebook', 'job', selectedJob.id);
      trackButtonClick('share_facebook', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnTwitter = () => {
    if (selectedJob) {
      const text = `Check out this job opportunity: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
      trackSocialShare('twitter', 'job', selectedJob.id);
      trackButtonClick('share_twitter', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnLinkedIn = () => {
    if (selectedJob) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
      trackSocialShare('linkedin', 'job', selectedJob.id);
      trackButtonClick('share_linkedin', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedJob) {
      const text = `Check out this job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} - ${window.location.href}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      trackSocialShare('whatsapp', 'job', selectedJob.id);
      trackButtonClick('share_whatsapp', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  const shareViaEmail = () => {
    if (selectedJob) {
      const subject = `Job Opportunity: ${selectedJob.title} at ${selectedJob.company}`;
      const body = `Check out this job opportunity on CareerCraft:\n\nPosition: ${selectedJob.title}\nCompany: ${selectedJob.company}\nLocation: ${selectedJob.location}\n\nView details: ${window.location.href}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      trackSocialShare('email', 'job', selectedJob.id);
      trackButtonClick('share_email', 'share_modal', 'job_applications');
      incrementShares();
    }
  };

  // Fixed: Native Web Share API with proper type checking
  const nativeShare = async () => {
    if (selectedJob && 'share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${selectedJob.title} at ${selectedJob.company}`,
          text: `Check out this job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`,
          url: window.location.href,
        });
        trackSocialShare('native', 'job', selectedJob.id);
        trackButtonClick('native_share', 'share_modal', 'job_applications');
        incrementShares();
      } catch (error) {
        // User cancelled the share or error occurred
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Show the share modal instead
      setShowShareModal(true);
    }
  };

  // Helper function to increment shares
  const incrementShares = () => {
    const newTotal = totalShares + 1;
    setTotalShares(newTotal);
    localStorage.setItem('total_job_shares', newTotal.toString());
  };

  // Newsletter signup
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackButtonClick('newsletter_signup_jobs', 'newsletter', 'job_applications');
      
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
          trackButtonClick('notification_enabled', 'system', 'job_applications');
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
      ['Title', 'Company', 'Location', 'Type', 'Sector', 'Salary', 'Posted Date', 'Apply Link'],
      ...jobs.map(job => [
        `"${job.title}"`,
        `"${job.company}"`,
        `"${job.location}"`,
        `"${job.type}"`,
        `"${job.sector}"`,
        `"${job.salary}"`,
        `"${job.postedDate}"`,
        `"${job.applyLink}"`
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
    
    trackButtonClick('download_jobs_csv', 'export', 'job_applications');
  };

  // View analytics dashboard
  const viewAnalyticsDashboard = () => {
    trackButtonClick('view_analytics_dashboard', 'analytics_cta', 'job_applications');
    trackCTAClick('analytics_dashboard', 'page_header', 'job_applications');
  };

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
                  trackButtonClick('notification_dismissed', 'notification', 'job_applications');
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Job Opportunities in India</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Freshly updated job postings from top Indian companies. Updated daily.
            <span className="block text-sm text-blue-200 mt-2">Share jobs to help friends & grow community</span>
          </p>
          
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
                  onClick={() => trackButtonClick('search_jobs_button', 'search_form', 'job_applications')}
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
              <span className="text-green-300 text-sm">(Updated: {new Date().toLocaleDateString('en-IN')})</span>
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
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Sector Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
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

                {/* Real-time Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📊 Live Job Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Views Today</span>
                      <span className="font-bold">{totalViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Applications Today</span>
                      <span className="font-bold text-green-600">{totalApplications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-bold">
                        {totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Jobs Today</span>
                      <span className="font-bold">{todayJobsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-cleaned</span>
                      <span className="font-bold">90 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 font-medium text-green-600">
                        <Share2 size={12} className="inline mr-1" />
                        {totalShares} jobs shared by community
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-blue-800 mb-2">Build Your Indian Resume</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create an ATS-friendly resume optimized for Indian job market.
                </p>
                <Link 
                  to="/builder" 
                  onClick={() => trackButtonClick('build_resume_sidebar', 'sidebar_cta', 'job_applications')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>

              {/* Analytics Dashboard Access */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-purple-800 mb-2">📊 View Analytics</h3>
                <p className="text-purple-700 text-sm mb-3">
                  Track job applications and user behavior
                </p>
                <Link 
                  to="/admin/comprehensive-analytics" 
                  onClick={() => {
                    trackButtonClick('view_analytics', 'sidebar_cta', 'job_applications');
                    trackCTAClick('analytics_dashboard', 'sidebar', 'job_applications');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors block text-center"
                >
                  View Analytics
                </Link>
              </div>

              {/* Export Jobs */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-green-800 mb-2">📥 Export Jobs</h3>
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
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold">
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
                        onShare={handleShareClick}
                        onTrackView={trackJobViewEnhanced}
                        onTrackApply={trackJobApplicationSubmitEnhanced}
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
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Newest First
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
                        onShare={handleShareClick}
                        onTrackView={trackJobViewEnhanced}
                        onTrackApply={trackJobApplicationSubmitEnhanced}
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
                    <h3 className="font-bold text-blue-800 text-lg mb-2">📬 Get Daily Job Alerts</h3>
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

              {/* Native Share Button - FIXED CONDITION */}
              {'share' in navigator && typeof navigator.share === 'function' && (
                <button
                  onClick={nativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share via Device
                </button>
              )}

              {/* Social Sharing Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center justify-center p-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={24} />
                  <span className="text-xs mt-2">Facebook</span>
                </button>
                
                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center justify-center p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={24} />
                  <span className="text-xs mt-2">Twitter/X</span>
                </button>
                
                <button
                  onClick={shareOnLinkedIn}
                  className="flex flex-col items-center justify-center p-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={24} />
                  <span className="text-xs mt-2">LinkedIn</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
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
                    trackButtonClick('apply_from_share', 'share_modal', 'job_applications');
                    trackFunnelStep('job_search', 'application_started_from_share', 2, localStorage.getItem('user_id') || 'anonymous');
                    window.open(selectedJob.applyLink, '_blank');
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
const JobCard: React.FC<{ 
  job: Job; 
  featured?: boolean; 
  onShare: (job: Job) => void;
  onTrackView: (jobId: string, jobTitle: string, company: string, source: string) => void;
  onTrackApply: (jobId: string, jobTitle: string, company: string) => void;
}> = ({ 
  job, 
  featured = false, 
  onShare,
  onTrackView,
  onTrackApply
}) => {
  const { trackButtonClick, trackExternalLink, trackFunnelStep } = useGoogleAnalytics();
  
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000;
  
  const handleViewJob = () => {
    // Track job view
    onTrackView(job.id, job.title, job.company, 'job_listing');
    
    // Update total views
    const currentViews = parseInt(localStorage.getItem('total_job_views') || '0');
    localStorage.setItem('total_job_views', (currentViews + 1).toString());
    
    // Track daily views
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_job_views_${today}`;
    const dailyViews = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyViews + 1).toString());
  };

  const handleApplyClick = () => {
    // Track application with all systems
    onTrackApply(job.id, job.title, job.company);
    
    // Track funnel step
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackFunnelStep('job_search', 'application_started', 2, userId);
    
    trackButtonClick('apply_job', 'job_card', 'job_applications');
    
    // Open apply link
    window.open(job.applyLink, '_blank');
    
    // Track external link
    trackExternalLink('Apply Now', job.applyLink, 'job_applications');
  };

  const handleBuildResumeClick = () => {
    trackButtonClick('build_resume_from_job', 'job_card', 'job_applications');
    trackFunnelStep('job_search', 'build_resume_from_job', 2.5, localStorage.getItem('user_id') || 'anonymous');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(job);
  };

  // Track job view only once when component mounts
  useEffect(() => {
    handleViewJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`job-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${featured ? 'featured-job border-l-4 border-blue-500' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
              <p className="text-lg text-gray-700 mb-2">{job.company} • {job.location}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleShareClick}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Share this job"
              >
                <Share2 size={18} />
              </button>
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
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {job.type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              {job.sector}
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
              {job.salary}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{job.description}</p>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Posted {new Date(job.postedDate).toLocaleDateString()}
            {job.addedTimestamp && ` • Last Updated: ${new Date(job.addedTimestamp).toLocaleDateString('en-IN')}`}
          </p>
        </div>

        <div className="lg:ml-6 lg:text-right mt-4 lg:mt-0 flex flex-col gap-2">
          <button 
            onClick={handleApplyClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
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