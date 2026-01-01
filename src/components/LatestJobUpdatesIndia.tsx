// src/components/LatestJobUpdatesIndia.tsx - COMPLETE VERSION FOR EXPERIENCED PROFESSIONALS
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { usePageTimeTracker } from '../hooks/usePageTimeTracker';
import { firebaseJobService, JobData } from '../firebase/jobService';
import {
  filterJobs,
  sortJobsByDate,
  getUniqueJobTitles,
  getUniqueLocations,
  paginateJobs,
  getFresherFriendlySectors,
  getTechnicalSectorsFromFresherSelection,
  getUniqueExperienceLevels
} from '../utils/jobFilters';
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
  RefreshCw,
  Database,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Check,
  ListFilter,
  XCircle,
  Sparkles,
  CheckCircle,
  X as CloseIcon,
  Plus,
  Hash,
  Code,
  Cpu,
  Building2,
  BookOpen,
  Calculator,
  TestTube,
  Palette,
  Globe,
  Music,
  GraduationCap,
  Smartphone,
  Cloud,
  Shield,
  LineChart,
  ShoppingCart,
  Users as UsersIcon,
  Zap,
  FileText,
  Target,
  Star,
  RotateCcw
} from 'lucide-react';

// Define Job interface properly extending JobData
interface Job extends JobData {
  addedTimestamp?: number;
  page?: number;
  isReal?: boolean;
  views?: number;
  shares?: number;
  applications?: number;
  saves?: number;
  experience?: string;
}

// Enhanced Filter Dialog Types
interface EnhancedFilterData {
  jobTitle: string;
  sectors: string[];
  locations: string[];
  experience: string;
  jobType: string;
}

const LatestJobUpdatesIndia: React.FC = () => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  // UPDATED: Default experience for experienced professionals
  const [selectedExperience, setSelectedExperience] = useState<string>('3-5 years');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const jobsPerPage = 10;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showMobileAnalytics, setShowMobileAnalytics] = useState<boolean>(false);
  
  // Enhanced Filter Dialog State
  const [showEnhancedFilterDialog, setShowEnhancedFilterDialog] = useState<boolean>(false);
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  
  // Enhanced Filter Dialog Form State
  const [filterData, setFilterData] = useState<EnhancedFilterData>({
    jobTitle: '',
    sectors: [],
    locations: [],
    // UPDATED: Default experience for experienced professionals
    experience: '3-5 years',
    jobType: 'all'
  });
  
  // Search states for filter dialog
  const [sectorSearch, setSectorSearch] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [jobTitleSearch, setJobTitleSearch] = useState<string>('');
  
  // Track if dialog has been shown before
  const [hasSeenDialogBefore, setHasSeenDialogBefore] = useState<boolean>(false);

  const [analytics, setAnalytics] = useState({
    topCities: [] as {city: string; count: number}[],
    topSectors: [] as {sector: string; count: number}[],
    topExperience: [] as {experience: string; count: number}[],
    popularJobs: [] as {title: string; views: number; company: string}[],
    hourlyTrends: [] as {hour: number; views: number}[]
  });

  usePageTimeTracker('Latest Job Updates for Experienced Professionals Page');

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
  
  const { 
    trackButtonClick: trackGoogleButtonClick, 
    trackSocialShare: trackGoogleSocialShare, 
    trackCTAClick: trackGoogleCTAClick,
    trackExternalLink,
    trackFunnelStep: trackGoogleFunnelStep,
    trackJobApplicationSubmit,
    trackJobSearch: trackGoogleJobSearch
  } = useGoogleAnalytics();

  // Initialize userId on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('firebase_user_id')) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('firebase_user_id', userId);
        
        trackFirebaseEvent(
          'new_user_registered',
          'User',
          'new_user',
          { 
            source: 'latest_job_updates_page',
            eventValue: 1 
          }
        );
      }

      const saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
      setSavedJobs(saved);
      
      // Check if user has seen the dialog before
      const hasSeen = localStorage.getItem('has_seen_enhanced_filter_dialog_experienced') === 'true';
      setHasSeenDialogBefore(hasSeen);
    }
  }, [trackFirebaseEvent]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/latest-job-updates-india', 'Latest Job Updates for Experienced Professionals');
    
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('experienced_job_search_funnel', 'viewed_experienced_jobs_listing', 1, {
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_path: '/latest-job-updates-india'
    });
  }, [trackPageView, trackFunnelStep]);

  const loadJobs = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const connectionTest = await firebaseJobService.testFirebaseConnection();
      setFirebaseConnected(connectionTest.connected);
      
      const { jobs: fetchedJobs } = await firebaseJobService.getJobs({}, 1, 1000);
      
      const formattedJobs: Job[] = fetchedJobs.map(jobData => {
        const postedDate = jobData.postedDate || new Date().toISOString().split('T')[0];
        const createdAt = jobData.createdAt ? new Date(jobData.createdAt) : new Date();
        
        return {
          ...jobData,
          postedDate,
          addedTimestamp: createdAt.getTime(),
          page: 1,
          views: jobData.views || 0,
          shares: jobData.shares || 0,
          applications: jobData.applications || 0,
          experience: jobData.experience || '3-5 years',
          isReal: true
        };
      });

      // UPDATED: Filter for experienced jobs (3+ years by default)
      const experiencedJobs = formattedJobs.filter(job => {
        const exp = job.experience || '';
        return exp.includes('3') || exp.includes('5') || exp.includes('8') || 
               exp.includes('senior') || exp.includes('lead') || 
               exp.includes('manager') || exp.includes('director') ||
               exp.includes('10') || exp.includes('12') || exp.includes('15');
      });

      const sortedJobs = experiencedJobs.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate).getTime() : a.addedTimestamp || 0;
        const dateB = b.postedDate ? new Date(b.postedDate).getTime() : b.addedTimestamp || 0;
        return dateB - dateA;
      });

      const jobsWithPages = sortedJobs.map((job, index) => ({
        ...job,
        page: Math.floor(index / jobsPerPage) + 1
      }));

      setJobs(jobsWithPages);
      
      // Extract unique data for filters
      const uniqueTitles = getUniqueJobTitles(jobsWithPages);
      setAvailableJobTitles(uniqueTitles);
      
      const uniqueLocations = getUniqueLocations(jobsWithPages);
      setAvailableLocations(uniqueLocations);
      
      // Get all sectors
      const allSectors = [...new Set(jobsWithPages.map(job => job.sector))].filter(Boolean).sort();
      setAvailableSectors(allSectors);
      
      const shares = jobsWithPages.reduce((sum, job) => sum + (job.shares || 0), 0);
      setTotalShares(shares);
      
      const views = jobsWithPages.reduce((sum, job) => sum + (job.views || 0), 0);
      setTotalViews(views);
      
      const applications = jobsWithPages.reduce((sum, job) => sum + (job.applications || 0), 0);
      setTotalApplications(applications);
      
      localStorage.setItem('total_experienced_job_shares', shares.toString());
      localStorage.setItem('total_experienced_job_views', views.toString());
      localStorage.setItem('total_experienced_job_applications_submitted', applications.toString());
      
      loadAnalyticsData(jobsWithPages);
      
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('last_experienced_job_page_visit');
      if (lastVisit !== today) {
        setShowNotificationBanner(true);
        localStorage.setItem('last_experienced_job_page_visit', today);
        
        trackGoogleButtonClick('notification_shown_experienced_jobs', 'system', 'latest_job_updates');
        trackButtonClick('notification_shown_experienced_jobs', 'system', '/latest-job-updates-india');
      }
      
      // Show enhanced filter dialog for first-time visitors
      if (!hasSeenDialogBefore && jobsWithPages.length > 0) {
        setTimeout(() => {
          setShowEnhancedFilterDialog(true);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error loading jobs:', error);
      const savedJobsData = JSON.parse(localStorage.getItem('manualJobs') || '[]') as Job[];
      
      // UPDATED: Filter for experienced jobs in local storage
      const experiencedSavedJobs = savedJobsData.filter(job => {
        const exp = job.experience || '';
        return exp.includes('3') || exp.includes('5') || exp.includes('8') || 
               exp.includes('senior') || exp.includes('lead') || 
               exp.includes('manager') || exp.includes('director') ||
               exp.includes('10') || exp.includes('12') || exp.includes('15');
      });
      
      const sortedSavedJobs = experiencedSavedJobs.sort((a: Job, b: Job) => {
        const timeA = a.addedTimestamp || (a.postedDate ? new Date(a.postedDate).getTime() : 0);
        const timeB = b.addedTimestamp || (b.postedDate ? new Date(b.postedDate).getTime() : 0);
        return timeB - timeA;
      });
      
      setJobs(sortedSavedJobs);
      
      // Extract unique data from local storage
      const uniqueTitles = getUniqueJobTitles(sortedSavedJobs);
      setAvailableJobTitles(uniqueTitles);
      
      const uniqueLocations = getUniqueLocations(sortedSavedJobs);
      setAvailableLocations(uniqueLocations);
      
      const allSectors = [...new Set(sortedSavedJobs.map(job => job.sector))].filter(Boolean).sort();
      setAvailableSectors(allSectors);
      
      const shares = parseInt(localStorage.getItem('total_experienced_job_shares') || '0');
      setTotalShares(shares);
      
      const views = parseInt(localStorage.getItem('total_experienced_job_views') || '0');
      setTotalViews(views);
      
      const applications = parseInt(localStorage.getItem('total_experienced_job_applications_submitted') || '0');
      setTotalApplications(applications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobsPerPage, trackGoogleButtonClick, trackButtonClick, hasSeenDialogBefore]);

  useEffect(() => {
    loadJobs(true);
  }, [loadJobs]);

  const loadAnalyticsData = useCallback((jobsData: Job[]) => {
    try {
      const cityMap: Record<string, number> = {};
      jobsData.forEach(job => {
        cityMap[job.location] = (cityMap[job.location] || 0) + 1;
      });
      const topCities = Object.entries(cityMap)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const sectorMap: Record<string, number> = {};
      jobsData.forEach(job => {
        sectorMap[job.sector] = (sectorMap[job.sector] || 0) + 1;
      });
      const topSectors = Object.entries(sectorMap)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const experienceMap: Record<string, number> = {};
      jobsData.forEach(job => {
        const exp = job.experience || 'Not specified';
        experienceMap[exp] = (experienceMap[exp] || 0) + 1;
      });
      const topExperience = Object.entries(experienceMap)
        .map(([experience, count]) => ({ experience, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const popularJobs = [...jobsData]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3)
        .map(job => ({
          title: job.title,
          views: job.views || 0,
          company: job.company
        }));

      const hourlyTrends = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 100) + 20
      }));

      setAnalytics({
        topCities,
        topSectors,
        topExperience,
        popularJobs,
        hourlyTrends
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }, []);

  // Enhanced Filter Dialog Functions
  const openEnhancedFilterDialog = () => {
    setShowEnhancedFilterDialog(true);
    trackGoogleButtonClick('open_enhanced_filter_dialog_experienced', 'filter_dialog', 'latest_job_updates');
    trackButtonClick('open_enhanced_filter_dialog_experienced', 'filter_dialog', '/latest-job-updates-india');
  };

  const closeEnhancedFilterDialog = () => {
    setShowEnhancedFilterDialog(false);
    localStorage.setItem('has_seen_enhanced_filter_dialog_experienced', 'true');
    setHasSeenDialogBefore(true);
  };

  const applyEnhancedFilters = () => {
    if (filterData.jobTitle) {
      setSearchTerm(filterData.jobTitle);
    }
    
    if (filterData.sectors.length > 0) {
      setSelectedSectors(filterData.sectors);
    }
    
    if (filterData.locations.length > 0) {
      setSelectedLocations(filterData.locations);
    }
    
    if (filterData.experience) {
      setSelectedExperience(filterData.experience);
    }
    
    if (filterData.jobType && filterData.jobType !== 'all') {
      setSelectedJobType(filterData.jobType);
    }
    
    setCurrentPage(1);
    closeEnhancedFilterDialog();
    
    trackGoogleButtonClick('apply_enhanced_filters_experienced', 'filter_dialog', 'latest_job_updates');
    trackButtonClick('apply_enhanced_filters_experienced', 'filter_dialog', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'enhanced_filters_applied_experienced',
      'Job Search',
      'dialog_filters_applied',
      {
        job_title: filterData.jobTitle || 'none',
        sectors_count: filterData.sectors.length,
        locations_count: filterData.locations.length,
        experience: filterData.experience,
        job_type: filterData.jobType,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const resetEnhancedFilters = () => {
    setFilterData({
      jobTitle: '',
      sectors: [],
      locations: [],
      // UPDATED: Reset to experienced professional default
      experience: '3-5 years',
      jobType: 'all'
    });
    setSectorSearch('');
    setLocationSearch('');
    setJobTitleSearch('');
  };

  const skipEnhancedFilters = () => {
    closeEnhancedFilterDialog();
    
    trackGoogleButtonClick('skip_enhanced_filters_experienced', 'filter_dialog', 'latest_job_updates');
    trackButtonClick('skip_enhanced_filters_experienced', 'filter_dialog', '/latest-job-updates-india');
  };

  const toggleSectorSelection = (sector: string) => {
    setFilterData(prev => {
      if (prev.sectors.includes(sector)) {
        return {
          ...prev,
          sectors: prev.sectors.filter(s => s !== sector)
        };
      } else {
        return {
          ...prev,
          sectors: [...prev.sectors, sector]
        };
      }
    });
  };

  const removeSectorFromFilter = (sector: string) => {
    setFilterData(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s !== sector)
    }));
    
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(prev => prev.filter(s => s !== sector));
    }
  };

  const toggleLocationSelection = (location: string) => {
    setFilterData(prev => {
      if (prev.locations.includes(location)) {
        return {
          ...prev,
          locations: prev.locations.filter(l => l !== location)
        };
      } else {
        return {
          ...prev,
          locations: [...prev.locations, location]
        };
      }
    });
  };

  const removeLocationFromFilter = (location: string) => {
    setFilterData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
    
    if (selectedLocations.includes(location)) {
      setSelectedLocations(prev => prev.filter(l => l !== location));
    }
  };

  const clearAllFilters = () => {
    setSelectedSectors([]);
    setSelectedJobType('all');
    // UPDATED: Reset to experienced professional default
    setSelectedExperience('3-5 years');
    setSearchTerm('');
    setSelectedLocations([]);
    setCurrentPage(1);
    
    trackGoogleButtonClick('clear_all_filters_experienced', 'filters', 'latest_job_updates');
    trackButtonClick('clear_all_filters_experienced', 'filters', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'job_filters_cleared_experienced',
      'Job Filter',
      'all_filters',
      {
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const filteredJobTitles = useMemo(() => {
    if (!jobTitleSearch) return availableJobTitles.slice(0, 20);
    return availableJobTitles
      .filter(title => 
        title.toLowerCase().includes(jobTitleSearch.toLowerCase())
      )
      .slice(0, 20);
  }, [availableJobTitles, jobTitleSearch]);

  const filteredSectors = useMemo(() => {
    if (!sectorSearch) return availableSectors;
    return availableSectors.filter(sector =>
      sector.toLowerCase().includes(sectorSearch.toLowerCase())
    );
  }, [availableSectors, sectorSearch]);

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return availableLocations.slice(0, 50);
    return availableLocations
      .filter(location =>
        location.toLowerCase().includes(locationSearch.toLowerCase())
      )
      .slice(0, 50);
  }, [availableLocations, locationSearch]);

  const getSectorIcon = (sector: string) => {
    const sectorIcons: Record<string, JSX.Element> = {
      'Computer Science/IT': <Code size={16} className="text-blue-500" />,
      'Mechanical Engineering': <Cpu size={16} className="text-orange-500" />,
      'Electrical/Electronics': <Zap size={16} className="text-yellow-500" />,
      'Civil Engineering': <Building2 size={16} className="text-gray-500" />,
      'Business/MBA': <LineChart size={16} className="text-green-500" />,
      'Biotechnology': <TestTube size={16} className="text-purple-500" />,
      'Chemical Engineering': <TestTube size={16} className="text-red-500" />,
      'Arts & Humanities': <Palette size={16} className="text-pink-500" />,
      'Marketing': <Target size={16} className="text-teal-500" />,
      'Finance': <Calculator size={16} className="text-emerald-500" />,
      'HR': <UsersIcon size={16} className="text-indigo-500" />,
      'Sales': <ShoppingCart size={16} className="text-amber-500" />,
      'Healthcare': <TrendingUp size={16} className="text-red-400" />,
      'Education': <GraduationCap size={16} className="text-blue-400" />,
      'Design': <Palette size={16} className="text-purple-400" />,
      'Media': <Globe size={16} className="text-cyan-500" />,
      'Content Writing': <FileText size={16} className="text-gray-600" />,
    };
    
    return sectorIcons[sector] || <Briefcase size={16} className="text-gray-400" />;
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    trackButtonClick('refresh_experienced_jobs', 'refresh_button', '/latest-job-updates-india');
    await loadJobs(false);
    
    const jobCount = jobs.length;
    trackFirebaseEvent(
      'experienced_jobs_refreshed',
      'Job Management',
      'manual_refresh',
      {
        job_count: jobCount,
        firebase_connected: firebaseConnected,
        source: 'latest_job_updates_page',
        eventValue: jobCount
      }
    );
  };

  const handleSyncToFirebase = async () => {
    setRefreshing(true);
    trackButtonClick('sync_to_firebase_experienced', 'sync_button', '/latest-job-updates-india');
    
    try {
      const result = await firebaseJobService.syncAllToFirebase();
      
      if (result.synced > 0) {
        alert(`✅ Successfully synced ${result.synced} jobs to Firebase!`);
        await loadJobs(false);
      } else if (result.failed > 0) {
        alert(`⚠️ ${result.synced} jobs synced, ${result.failed} failed. Check console for details.`);
      } else {
        alert('ℹ️ No jobs to sync or already synced.');
      }
      
      trackFirebaseEvent(
        'manual_sync_triggered_experienced',
        'Job Management',
        'sync_to_firebase',
        {
          synced: result.synced,
          failed: result.failed,
          source: 'latest_job_updates_page',
          eventValue: result.synced
        }
      );
      
    } catch (error) {
      console.error('Sync failed:', error);
      alert('❌ Failed to sync jobs. Check console for details.');
    } finally {
      setRefreshing(false);
    }
  };

  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // UPDATED: Experience options for experienced professionals
  const experienceOptions = [
    'all',
    '3-5 years',
    '5-8 years',
    '8+ years',
    '10+ years',
    '12+ years',
    '15+ years'
  ];

  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    const filteredJobs = filterJobs(jobs, {
      sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
      type: selectedJobType !== 'all' ? selectedJobType : undefined,
      experience: selectedExperience !== 'all' ? selectedExperience : undefined,
      locations: selectedLocations.length > 0 ? selectedLocations : undefined,
      searchTerm: searchTerm || undefined,
    });
    
    const resultsCount = filteredJobs.length;
    
    trackJobSearch(searchTerm, resultsCount, selectedLocations.join(', ') || 'all');
    trackGoogleJobSearch(searchTerm, resultsCount, selectedLocations.join(', ') || 'all');
    trackGoogleButtonClick('experienced_job_search', 'search_form', 'latest_job_updates');
    trackButtonClick('experienced_job_search', 'search_form', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_search_performed',
      'Job Search',
      searchTerm || 'no_query',
      {
        search_query: searchTerm,
        locations_count: selectedLocations.length,
        sectors_count: selectedSectors.length,
        experience_filter: selectedExperience,
        job_type: selectedJobType,
        results_count: resultsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: resultsCount
      }
    );
    
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    if (searchTerm || selectedLocations.length > 0 || selectedSectors.length > 0 || selectedExperience !== '3-5 years' || selectedJobType !== 'all') {
      trackFunnelStep('experienced_job_search_funnel', 'searched_experienced_jobs', 2, {
        user_id: userId,
        search_query: searchTerm,
        locations: selectedLocations,
        sectors: selectedSectors,
        experience_filter: selectedExperience,
        job_type: selectedJobType,
        results_count: resultsCount
      });
    }
  };

  const handleCityFilter = (city: string) => {
    if (selectedLocations.includes(city)) {
      setSelectedLocations(prev => prev.filter(l => l !== city));
    } else {
      setSelectedLocations(prev => [...prev, city]);
    }
    
    setCurrentPage(1);
    
    const filteredJobs = filterJobs(jobs, {
      sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
      type: selectedJobType !== 'all' ? selectedJobType : undefined,
      experience: selectedExperience !== 'all' ? selectedExperience : undefined,
      locations: [...selectedLocations, city].filter((l, i, arr) => arr.indexOf(l) === i),
      searchTerm: searchTerm || undefined,
    });
    
    const resultsCount = filteredJobs.length;
    
    const action = selectedLocations.includes(city) ? 'remove' : 'add';
    trackGoogleButtonClick(`${action}_city_${city}_experienced`, 'city_filters', 'latest_job_updates');
    trackButtonClick(`${action}_city_${city}_experienced`, 'city_filters', '/latest-job-updates-india');
    trackJobSearch('', resultsCount, city);
    
    trackFirebaseEvent(
      'experienced_job_filter_applied',
      'Job Filter',
      `city_${city}_${action}`,
      {
        filter_type: 'city',
        filter_value: city,
        action: action,
        results_count: resultsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: resultsCount
      }
    );
  };

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, {
      sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
      type: selectedJobType !== 'all' ? selectedJobType : undefined,
      experience: selectedExperience !== 'all' ? selectedExperience : undefined,
      locations: selectedLocations.length > 0 ? selectedLocations : undefined,
      searchTerm: searchTerm || undefined,
    });
  }, [jobs, selectedSectors, selectedJobType, selectedExperience, selectedLocations, searchTerm]);

  const sortedFilteredJobs = useMemo(() => {
    return sortJobsByDate(filteredJobs);
  }, [filteredJobs]);

  const filteredJobsCount = sortedFilteredJobs.length;

  const { paginatedJobs: currentJobs, totalPages } = useMemo(() => {
    return paginateJobs(
      sortedFilteredJobs,
      currentPage,
      jobsPerPage
    );
  }, [sortedFilteredJobs, currentPage, jobsPerPage]);

  const featuredJobs = useMemo(() => filterJobs(jobs, { featured: true }), [jobs]);
  const totalJobsCount = useMemo(() => jobs.length, [jobs]);
  const remoteJobsCount = useMemo(() => jobs.filter(job => job.type === 'Remote').length, [jobs]);
  const todayJobsCount = useMemo(() => jobs.filter(job => {
    const jobDate = new Date(job.postedDate || new Date().toISOString().split('T')[0]);
    const today = new Date();
    return jobDate.toDateString() === today.toDateString();
  }).length, [jobs]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    
    trackGoogleButtonClick(`page_${page}_experienced`, 'pagination', 'latest_job_updates');
    trackButtonClick(`page_${page}_experienced`, 'pagination', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_pagination_click',
      'Job Navigation',
      `page_${page}`,
      {
        current_page: page,
        total_pages: totalPages,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectorSelection = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(prev => prev.filter(s => s !== sector));
    } else {
      setSelectedSectors(prev => [...prev, sector]);
    }
    
    setCurrentPage(1);
    
    trackGoogleButtonClick(`toggle_sector_${sector}_experienced`, 'sector_filters', 'latest_job_updates');
    trackButtonClick(`toggle_sector_${sector}_experienced`, 'sector_filters', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_filter_applied',
      'Job Filter',
      `sector_${sector}_${selectedSectors.includes(sector) ? 'remove' : 'add'}`,
      {
        filter_type: 'sector',
        filter_value: sector,
        action: selectedSectors.includes(sector) ? 'remove' : 'add',
        results_count: filteredJobsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const handleJobTypeChange = (type: string) => {
    setSelectedJobType(type);
    setCurrentPage(1);
    
    trackGoogleButtonClick(`filter_type_${type}_experienced`, 'type_filters', 'latest_job_updates');
    trackButtonClick(`filter_type_${type}_experienced`, 'type_filters', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_filter_applied',
      'Job Filter',
      `type_${type}`,
      {
        filter_type: 'job_type',
        filter_value: type,
        results_count: filteredJobsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const handleExperienceChange = (experience: string) => {
    setSelectedExperience(experience);
    setCurrentPage(1);
    
    trackGoogleButtonClick(`filter_experience_${experience}_experienced`, 'experience_filters', 'latest_job_updates');
    trackButtonClick(`filter_experience_${experience}_experienced`, 'experience_filters', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_filter_applied',
      'Job Filter',
      `experience_${experience}`,
      {
        filter_type: 'experience',
        filter_value: experience,
        results_count: filteredJobsCount,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const handleShareClick = (job: Job) => {
    setSelectedJob(job);
    setShowShareModal(true);
    
    trackGoogleButtonClick('open_share_modal_experienced', 'job_card', 'latest_job_updates');
    trackButtonClick('open_share_modal_experienced', 'job_card', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_job_share_modal_opened',
      'Job Sharing',
      job.id!,
      {
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
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
      const jobUrl = `${window.location.origin}/latest-job-updates-india?job=${selectedJob.id}`;
      try {
        await navigator.clipboard.writeText(jobUrl);
        setCopySuccess(true);
        
        if (selectedJob.id) {
          await firebaseJobService.incrementShareCount(selectedJob.id);
          
          setJobs(prevJobs => 
            prevJobs.map(job => 
              job.id === selectedJob.id 
                ? { ...job, shares: (job.shares || 0) + 1 }
                : job
            )
          );
          
          setTotalShares(prev => prev + 1);
        }
        
        trackGoogleButtonClick('copy_job_link_experienced', 'share_modal', 'latest_job_updates');
        trackButtonClick('copy_job_link_experienced', 'share_modal', '/latest-job-updates-india');
        trackSocialShare('copy_link', 'job', selectedJob.id!);
        trackGoogleSocialShare('copy_link', 'job', selectedJob.id!);
        
        trackFirebaseEvent(
          'experienced_job_shared',
          'Social Sharing',
          'copy_link',
          {
            job_id: selectedJob.id,
            job_title: selectedJob.title,
            company: selectedJob.company,
            platform: 'copy_link',
            user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
            eventValue: 1
          }
        );
        
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const shareOnPlatform = async (platform: string) => {
    if (!selectedJob) return;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Check out this senior job: ${selectedJob.title} at ${selectedJob.company}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this senior job opportunity: ${selectedJob.title} at ${selectedJob.company} in ${selectedJob.location}`)}&url=${encodeURIComponent(window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this senior job opportunity on CareerCraft: ${selectedJob.title} at ${selectedJob.company} - ${window.location.href}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this senior job: ${selectedJob.title}`)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
    
    if (selectedJob.id) {
      await firebaseJobService.incrementShareCount(selectedJob.id);
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, shares: (job.shares || 0) + 1 }
            : job
        )
      );
      
      setTotalShares(prev => prev + 1);
    }
    
    trackGoogleButtonClick(`share_${platform}_experienced`, 'share_modal', 'latest_job_updates');
    trackButtonClick(`share_${platform}_experienced`, 'share_modal', '/latest-job-updates-india');
    trackSocialShare(platform, 'job', selectedJob.id!);
    trackGoogleSocialShare(platform, 'job', selectedJob.id!);
    
    trackFirebaseEvent(
      'experienced_job_shared',
      'Social Sharing',
      platform,
      {
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        company: selectedJob.company,
        platform: platform,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const shareViaEmail = async () => {
    if (selectedJob) {
      const subject = `Senior Job Opportunity: ${selectedJob.title} at ${selectedJob.company}`;
      const body = `Check out this senior job opportunity on CareerCraft:\n\nPosition: ${selectedJob.title}\nCompany: ${selectedJob.company}\nLocation: ${selectedJob.location}\nExperience: ${selectedJob.experience || 'Not specified'}\n\nView details: ${window.location.href}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
      
      if (selectedJob.id) {
        await firebaseJobService.incrementShareCount(selectedJob.id);
        
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === selectedJob.id 
              ? { ...job, shares: (job.shares || 0) + 1 }
              : job
          )
        );
        
        setTotalShares(prev => prev + 1);
      }
      
      trackGoogleButtonClick('share_email_experienced', 'share_modal', 'latest_job_updates');
      trackButtonClick('share_email_experienced', 'share_modal', '/latest-job-updates-india');
      trackSocialShare('email', 'job', selectedJob.id!);
      trackGoogleSocialShare('email', 'job', selectedJob.id!);
    }
  };

  const handleSaveJob = (jobId: string, jobTitle: string, company: string) => {
    const isAlreadySaved = savedJobs.includes(jobId);
    
    if (isAlreadySaved) {
      const newSaved = savedJobs.filter(id => id !== jobId);
      setSavedJobs(newSaved);
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
    } else {
      const newSaved = [...savedJobs, jobId];
      setSavedJobs(newSaved);
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
      
      firebaseJobService.incrementSaveCount(jobId);
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, saves: (job.saves || 0) + 1 }
            : job
        )
      );
      
      trackJobSave(jobId, jobTitle, company);
      
      trackFirebaseEvent(
        'experienced_job_saved',
        'Job Interaction',
        jobId,
        {
          job_id: jobId,
          job_title: jobTitle,
          company: company,
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
          eventValue: 1
        }
      );
    }
    
    trackGoogleButtonClick(
      isAlreadySaved ? 'unsave_job_experienced' : 'save_job_experienced', 
      'job_card', 
      'latest_job_updates'
    );
    trackButtonClick(
      isAlreadySaved ? 'unsave_job_experienced' : 'save_job_experienced', 
      'job_card', 
      '/latest-job-updates-india'
    );
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackGoogleButtonClick('newsletter_signup_experienced_jobs', 'newsletter', 'latest_job_updates');
      trackButtonClick('newsletter_signup_experienced_jobs', 'newsletter', '/latest-job-updates-india');
      
      trackFirebaseEvent(
        'experienced_newsletter_signup',
        'User Engagement',
        'job_alerts',
        {
          email: newsletterEmail,
          preferences: {
            sectors: selectedSectors.length > 0 ? selectedSectors : ['all'],
            locations: selectedLocations.length > 0 ? selectedLocations : ['all'],
            experience: selectedExperience !== 'all' ? selectedExperience : 'all'
          },
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
          eventValue: 1
        }
      );
      
      const subscribers = JSON.parse(localStorage.getItem('experienced_job_subscribers') || '[]');
      subscribers.push({ 
        email: newsletterEmail, 
        date: new Date().toISOString(),
        preferences: {
          sectors: selectedSectors.length > 0 ? selectedSectors : ['all'],
          locations: selectedLocations.length > 0 ? selectedLocations : ['all'],
          experience: selectedExperience !== 'all' ? selectedExperience : 'all'
        }
      });
      localStorage.setItem('experienced_job_subscribers', JSON.stringify(subscribers));
      
      alert(`Thank you! You'll receive senior job alerts at ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          trackGoogleButtonClick('notification_enabled_experienced', 'system', 'latest_job_updates');
          trackButtonClick('notification_enabled_experienced', 'system', '/latest-job-updates-india');
          
          trackFirebaseEvent(
            'experienced_notification_permission_granted',
            'System',
            'job_alerts',
            {
              user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
              eventValue: 1
            }
          );
          
          localStorage.setItem('experienced_job_notifications', 'true');
          alert('Notifications enabled! You will receive senior job alerts.');
        }
      });
    } else if (Notification.permission === 'granted') {
      alert('Notifications are already enabled.');
    }
  };

  const downloadJobsCSV = () => {
    const csvContent = [
      ['Title', 'Company', 'Location', 'Type', 'Sector', 'Experience', 'Salary', 'Posted Date', 'Apply Link', 'Views', 'Shares', 'Applications'],
      ...jobs.map(job => [
        `"${job.title}"`,
        `"${job.company}"`,
        `"${job.location}"`,
        `"${job.type}"`,
        `"${job.sector}"`,
        `"${job.experience || 'Not specified'}"`,
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
    link.download = `careercraft-experienced-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackGoogleButtonClick('download_experienced_jobs_csv', 'export', 'latest_job_updates');
    trackButtonClick('download_experienced_jobs_csv', 'export', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_jobs_exported',
      'System',
      'csv_export',
      {
        format: 'csv',
        job_count: jobs.length,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: jobs.length
      }
    );
  };

  const viewAnalyticsDashboard = () => {
    trackGoogleButtonClick('view_experienced_analytics_dashboard', 'analytics_cta', 'latest_job_updates');
    trackButtonClick('view_experienced_analytics_dashboard', 'analytics_cta', '/latest-job-updates-india');
    trackGoogleCTAClick('experienced_analytics_dashboard', 'page_header', 'latest_job_updates');
    trackCTAClick('experienced_analytics_dashboard', 'page_header', '/latest-job-updates-india');
    
    trackFirebaseEvent(
      'experienced_analytics_dashboard_accessed',
      'Analytics',
      'latest_job_updates',
      {
        source: 'page_header',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
  };

  const handleApply = async (job: Job) => {
    if (job.id) {
      await firebaseJobService.incrementApplicationCount(job.id);
      
      setJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id 
            ? { ...j, applications: (j.applications || 0) + 1 }
            : j
        )
      );
      
      setTotalApplications(prev => prev + 1);
    }
    
    trackJobApplication(job.id!, job.title, job.company, 'direct');
    trackJobApplicationSubmit(job.id!, job.title, job.company, 'direct');
    
    trackFirebaseEvent(
      'experienced_job_application_submitted',
      'Job Applications',
      job.id!,
      {
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        experience: job.experience || 'Not specified',
        application_method: 'direct',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        eventValue: 1
      }
    );
    
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('experienced_job_search_funnel', 'application_submitted', 3, {
      user_id: userId,
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      experience: job.experience || 'Not specified'
    });
    
    trackGoogleFunnelStep('experienced_job_search', 'application_started', 2, userId);
    
    if (job.applyLink && job.applyLink.startsWith('http')) {
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
      trackExternalLink('Apply Now', job.applyLink, 'latest_job_updates');
    }
  };

  const generateJobPostingStructuredData = () => {
    const topJobs = jobs.slice(0, 10);
    return topJobs.map((job, index) => {
      const postedDate = job.postedDate || new Date().toISOString().split('T')[0];
      const validThrough = new Date(new Date(postedDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "datePosted": postedDate,
        "validThrough": validThrough,
        "employmentType": job.type,
        "experienceRequirements": job.experience || '3-5 years',
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
        "inLanguage": "en-IN"
      };
    });
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What kind of jobs are listed for experienced professionals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We list senior-level positions for professionals with 3+ years of experience including managerial roles, technical leadership, specialized roles, and executive positions across various industries in India."
        }
      },
      {
        "@type": "Question",
        "name": "How often are experienced professional jobs updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Senior and experienced professional job listings are updated daily. We focus on quality opportunities with competitive compensation packages suitable for experienced candidates."
        }
      },
      {
        "@type": "Question",
        "name": "Can I filter jobs by specific experience levels like 5+ or 10+ years?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can filter jobs by experience levels including 3-5 years, 5-8 years, 8+ years, 10+ years, and 15+ years. Use the experience filter to find roles matching your career level."
        }
      },
      {
        "@type": "Question",
        "name": "Do you have leadership and managerial positions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we regularly update listings for Team Lead, Manager, Director, VP, and other leadership roles across IT, Engineering, Marketing, Finance, and Operations domains."
        }
      },
      {
        "@type": "Question",
        "name": "Are salary ranges mentioned for experienced roles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most experienced professional job listings include competitive salary ranges. We focus on opportunities offering ₹10+ LPA for mid-level roles and ₹20+ LPA for senior leadership positions."
        }
      }
    ]
  };

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
        "item": "https://careercraft.in/latest-job-updates-india"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Latest Job Updates for Experienced Professionals",
        "item": window.location.href
      }
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CareerCraft.in - India's Career Platform",
    "url": "https://careercraft.in",
    "description": "India's premier career platform offering free ATS-optimized resume builder and job portal services for experienced professionals",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://careercraft.in/latest-job-updates-india?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CareerCraft India",
      "logo": "https://careercraft.in/logos/careercraft-logo-square.png"
    }
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CareerCraft India",
    "url": "https://careercraft.in",
    "logo": "https://careercraft.in/logos/careercraft-logo-square.png",
    "description": "India's premier career platform for experienced professionals offering job opportunities and resume building services",
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
      "Senior Level Hiring",
      "Executive Search",
      "Career Growth",
      "Leadership Development",
      "Salary Negotiation"
    ]
  };

  return (
    <>
      <Helmet>
        <title>🔥 Latest Job Updates for Experienced Professionals in India 2025 | Senior Roles | CareerCraft</title>
        <meta name="description" content="Daily updated senior-level job postings for experienced professionals (3+ years) in India. Managerial, leadership, technical expert roles across IT, Engineering, Finance, Marketing. Apply now!" />
        <meta name="keywords" content="senior jobs India 2025, experienced professional jobs, managerial positions India, leadership roles, technical expert jobs, IT manager jobs, engineering lead, finance director, marketing head, 5+ years experience jobs, 10+ years experience, executive jobs India, senior software engineer, project manager, team lead positions" />
        <link rel="canonical" href="https://careercraft.in/latest-job-updates-india" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/latest-job-updates-india" />
        <meta property="og:title" content="🔥 Latest Job Updates for Experienced Professionals in India 2025 | Senior Roles | CareerCraft" />
        <meta property="og:description" content="Daily updated senior-level job postings for experienced professionals (3+ years) in India. Managerial, leadership, technical expert roles. Apply now!" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CareerCraft Experienced Professionals Job Portal" />
        <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
        <meta property="og:locale" content="en_IN" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://careercraft.in/latest-job-updates-india" />
        <meta property="twitter:title" content="🔥 Latest Job Updates for Experienced Professionals in India 2025 | Senior Roles | CareerCraft" />
        <meta property="twitter:description" content="Daily updated senior-level job postings for experienced professionals (3+ years) in India. Apply now!" />
        <meta property="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="CareerCraft India" />
        <meta name="copyright" content="CareerCraft India" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        
        <link rel="alternate" href="https://careercraft.in/latest-job-updates-india" hrefLang="en-in" />
        <link rel="alternate" href="https://careercraft.in/latest-job-updates-india" hrefLang="en" />
        <link rel="alternate" href="https://careercraft.in/latest-job-updates-india" hrefLang="x-default" />
        
        <script type="application/ld+json">
          {JSON.stringify(websiteStructuredData)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(organizationStructuredData)}
        </script>
        
        {generateJobPostingStructuredData().map((jobData, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(jobData)}
          </script>
        ))}
        
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Latest Job Updates for Experienced Professionals in India",
            "description": "Daily updated senior-level job postings for professionals with 3+ years experience",
            "url": "https://careercraft.in/latest-job-updates-india",
            "numberOfItems": jobs.length,
            "itemListElement": jobs.slice(0, 10).map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "JobPosting",
                "title": job.title,
                "description": job.description,
                "datePosted": job.postedDate,
                "experienceRequirements": job.experience || '3-5 years',
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

      {/* Enhanced Filter Dialog */}
      {showEnhancedFilterDialog && !loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-200">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={24} />
                    Enhanced Job Filters for Experienced Professionals
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Find senior-level roles with our advanced filtering system
                  </p>
                </div>
                <button
                  onClick={skipEnhancedFilters}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Skip and browse all jobs"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Job Title Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Briefcase size={16} />
                      Search Job Titles
                      {filterData.jobTitle && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-3 md:p-4 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        placeholder="Type to search senior job titles..."
                        value={jobTitleSearch}
                        onChange={(e) => setJobTitleSearch(e.target.value)}
                      />
                      <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {jobTitleSearch && (
                      <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                        {filteredJobTitles.length > 0 ? (
                          filteredJobTitles.map((title, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                              onClick={() => {
                                setFilterData(prev => ({ ...prev, jobTitle: title }));
                                setJobTitleSearch('');
                              }}
                            >
                              <span className="text-gray-700">{title}</span>
                              <Plus size={16} className="text-blue-500" />
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">No matching job titles found</div>
                        )}
                      </div>
                    )}
                    
                    {filterData.jobTitle && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Briefcase size={12} />
                          {filterData.jobTitle}
                          <button
                            onClick={() => setFilterData(prev => ({ ...prev, jobTitle: '' }))}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sector Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Building size={16} />
                      Select Sectors (Multiple)
                      {filterData.sectors.length > 0 && (
                        <span className="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                          {filterData.sectors.length} selected
                        </span>
                      )}
                    </label>
                    
                    <div className="relative mb-2">
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        placeholder="Search sectors..."
                        value={sectorSearch}
                        onChange={(e) => setSectorSearch(e.target.value)}
                      />
                      <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {filterData.sectors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filterData.sectors.map((sector, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {getSectorIcon(sector)}
                            {sector}
                            <button
                              onClick={() => removeSectorFromFilter(sector)}
                              className="ml-1 text-purple-600 hover:text-purple-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3">
                      {filteredSectors.length > 0 ? (
                        filteredSectors.map((sector, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filterData.sectors.includes(sector)}
                              onChange={() => toggleSectorSelection(sector)}
                              className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="flex items-center gap-2">
                              {getSectorIcon(sector)}
                              <span className="text-gray-700">{sector}</span>
                            </div>
                            {filterData.sectors.includes(sector) && (
                              <CheckCircle size={16} className="ml-auto text-green-500" />
                            )}
                          </label>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">No sectors found</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Select Locations (Multiple)
                      {filterData.locations.length > 0 && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {filterData.locations.length} selected
                        </span>
                      )}
                    </label>
                    
                    <div className="relative mb-2">
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                        placeholder="Search locations..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                      />
                      <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {filterData.locations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filterData.locations.map((location, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            <MapPin size={12} />
                            {location}
                            <button
                              onClick={() => removeLocationFromFilter(location)}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Popular Indian Cities for Senior Roles:</p>
                      <div className="flex flex-wrap gap-1">
                        {popularCities.slice(0, 8).map(city => (
                          <button
                            key={city}
                            onClick={() => toggleLocationSelection(city)}
                            className={`px-2 py-1 text-xs rounded-full ${filterData.locations.includes(city) 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filterData.locations.includes(location)}
                              onChange={() => toggleLocationSelection(location)}
                              className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                            />
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-gray-700">{location}</span>
                            {filterData.locations.includes(location) && (
                              <CheckCircle size={16} className="ml-auto text-green-500" />
                            )}
                          </label>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">No locations found</div>
                      )}
                    </div>
                  </div>

                  {/* Experience Level - UPDATED FOR EXPERIENCED PROFESSIONALS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Award size={16} />
                      Years of Experience (Senior Levels)
                    </label>
                    <select
                      className="w-full p-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                      value={filterData.experience}
                      onChange={(e) => setFilterData(prev => ({ ...prev, experience: e.target.value }))}
                    >
                      {experienceOptions.map(exp => (
                        <option key={exp} value={exp}>
                          {exp === 'all' ? 'All Experience Levels' : exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Briefcase size={16} />
                      Job Type
                    </label>
                    <select
                      className="w-full p-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      value={filterData.jobType}
                      onChange={(e) => setFilterData(prev => ({ ...prev, jobType: e.target.value }))}
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Job Types' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <ListFilter size={16} />
                  Filter Summary for Experienced Roles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Job Title:</p>
                    <p className="font-medium text-gray-800">{filterData.jobTitle || 'Senior Roles'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sectors:</p>
                    <p className="font-medium text-gray-800">
                      {filterData.sectors.length > 0 
                        ? `${filterData.sectors.length} selected` 
                        : 'All sectors'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Locations:</p>
                    <p className="font-medium text-gray-800">
                      {filterData.locations.length > 0 
                        ? `${filterData.locations.length} selected` 
                        : 'Metro cities'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Experience Level:</p>
                    <p className="font-medium text-gray-800">
                      {filterData.experience === 'all' ? 'All senior levels' : filterData.experience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <button
                  onClick={applyEnhancedFilters}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Check size={18} />
                  Apply Filters
                </button>
                
                <button
                  onClick={resetEnhancedFilters}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <RotateCcw size={18} />
                  Reset All
                </button>
                
                <button
                  onClick={skipEnhancedFilters}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <XCircle size={18} />
                  Skip & Browse All
                </button>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {availableJobTitles.length}+ senior job titles
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={12} />
                      {availableSectors.length}+ sectors
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {availableLocations.length}+ locations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Database size={12} />
                      Powered by Firebase
                    </span>
                    {firebaseConnected && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                        🔥 Live Sync
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Bell size={20} className="mr-2" />
              <span className="font-semibold">Turn on notifications for senior role alerts!</span>
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
                  trackGoogleButtonClick('notification_dismissed_experienced', 'notification', 'latest_job_updates');
                  trackButtonClick('notification_dismissed_experienced', 'notification', '/latest-job-updates-india');
                }}
                className="text-white hover:text-blue-200 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Section - UPDATED FOR EXPERIENCED PROFESSIONALS */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-indigo-100 hover:text-white text-sm md:text-base"
              onClick={() => {
                trackButtonClick('back_to_home_experienced', 'navigation', '/latest-job-updates-india');
                trackUserFlow('latest_job_updates', 'home', 'navigation');
              }}
            >
              <Home size={16} />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-indigo-100 text-xs md:text-sm">Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
              {firebaseConnected && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  🔥 Live
                </span>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Latest Job Updates for Experienced Professionals in India</h1>
          <p className="text-base md:text-xl max-w-2xl mx-auto mb-6 md:mb-8">
            Senior-level job postings for professionals with 3+ years experience. Updated daily.
            <span className="block text-xs md:text-sm text-indigo-200 mt-1 md:mt-2">
              Currently showing jobs with <span className="font-bold">{selectedExperience === 'all' ? 'all senior experience levels' : selectedExperience}+</span>
            </span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            <Link 
              to="/latest-jobs-for-freshers-india"
              className="bg-green-100 text-green-700 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              onClick={() => {
                trackButtonClick('view_fresher_jobs', 'quick_nav', '/latest-job-updates-india');
                trackUserFlow('latest_job_updates', 'fresher_jobs', 'navigation');
              }}
            >
              <ArrowRight size={12} />
              View Fresher Jobs
            </Link>
            <Link 
              to="/latest-walk-in-drives-india"
              className="bg-emerald-100 text-emerald-700 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              onClick={() => {
                trackButtonClick('view_walkin_drives', 'quick_nav', '/latest-job-updates-india');
                trackUserFlow('latest_job_updates', 'walkin_drives', 'navigation');
              }}
            >
              <ArrowRight size={12} />
              View Walk-in Drives
            </Link>
            <Link 
              to="/government-exams"
              className="bg-amber-100 text-amber-700 px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              onClick={() => {
                trackButtonClick('view_government_exams', 'quick_nav', '/latest-job-updates-india');
                trackUserFlow('latest_job_updates', 'government_exams', 'navigation');
              }}
            >
              <ArrowRight size={12} />
              View Government Exams
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Eye size={12} />
              <span>{totalViews} views</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Briefcase size={12} />
              <span>{totalApplications} applications</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Share2 size={12} />
              <span>{totalShares} shares</span>
            </div>
            <button 
              onClick={handleRefreshJobs}
              disabled={refreshing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-1 md:gap-2 disabled:opacity-50"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-3 md:p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Senior job title, skills, or company..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or state for senior roles"
                  className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm md:text-base"
                  value={selectedLocations.join(', ') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes(',')) {
                      setSelectedLocations(value.split(',').map(loc => loc.trim()).filter(Boolean));
                    } else if (!value) {
                      setSelectedLocations([]);
                    }
                  }}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                >
                  <Search size={16} />
                  Find Senior Roles
                </button>
              </div>
            </div>
          </form>

          <div className="mt-4 md:mt-6">
            <p className="text-indigo-100 mb-2 text-sm">Top Cities for Senior Roles:</p>
            <div className="flex flex-wrap justify-center gap-1 md:gap-2">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium transition-colors ${selectedLocations.includes(city)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {city} {selectedLocations.includes(city) && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center items-center gap-2 md:gap-4">
            <button 
              onClick={clearAllFilters}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-colors flex items-center gap-1 md:gap-2"
            >
              <X size={12} />
              Clear All Filters
            </button>
            <button
              onClick={openEnhancedFilterDialog}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-1 md:gap-2"
            >
              <ListFilter size={12} />
              Open Enhanced Filters
            </button>
            <button
              onClick={() => {
                if (jobs.length > 0) {
                  handleShareClick(jobs[0]);
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:from-yellow-600 hover:to-amber-600 transition-colors flex items-center gap-1 md:gap-2"
            >
              <Share2 size={12} />
              Share Senior Jobs
            </button>
          </div>

          {/* Active Filters Summary */}
          {(selectedSectors.length > 0 || selectedLocations.length > 0 || searchTerm || selectedExperience !== '3-5 years' || selectedJobType !== 'all') && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-3xl mx-auto">
              <p className="text-indigo-100 mb-2 text-sm font-medium">Active Filters for Senior Roles:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {searchTerm && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    Job: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {selectedSectors.map(sector => (
                  <span key={sector} className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {getSectorIcon(sector)}
                    {sector}
                    <button onClick={() => handleSectorSelection(sector)} className="ml-1">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {selectedLocations.map(location => (
                  <span key={location} className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <MapPin size={10} />
                    {location}
                    <button onClick={() => handleCityFilter(location)} className="ml-1">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {selectedExperience !== '3-5 years' && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Award size={10} />
                    {selectedExperience}
                    <button onClick={() => setSelectedExperience('3-5 years')} className="ml-1">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {selectedJobType !== 'all' && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Briefcase size={10} />
                    {selectedJobType}
                    <button onClick={() => setSelectedJobType('all')} className="ml-1">
                      <X size={10} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-500 mb-3 md:mb-4"></div>
              <p className="text-gray-600 text-sm md:text-base">Loading senior jobs from {firebaseConnected ? 'Firebase' : 'local storage'}...</p>
              <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">Firebase Status: {firebaseConnected ? '✅ Connected' : '⚠️ Using Local Storage'}</p>
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span className="font-medium">Filters</span>
                  </div>
                  {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                  onClick={() => setShowMobileAnalytics(!showMobileAnalytics)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BarChart size={16} />
                    <span className="font-medium">Analytics</span>
                  </div>
                  {showMobileAnalytics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-1/4 flex-col gap-6">
              {/* Filters - Desktop */}
              <div className="bg-white rounded-lg shadow-lg p-6 sticky-sidebar">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={20} />
                    Filters
                  </h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                </div>
                
                {/* Sector Selection - Multi-select checkboxes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={16} />
                    Select Sectors
                    {selectedSectors.length > 0 && (
                      <span className="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                        {selectedSectors.length} selected
                      </span>
                    )}
                  </label>
                  
                  {/* Selected Sectors Chips */}
                  {selectedSectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSectors.map((sector, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          {getSectorIcon(sector)}
                          {sector.length > 15 ? `${sector.substring(0, 15)}...` : sector}
                          <button
                            onClick={() => handleSectorSelection(sector)}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Sector Checkboxes */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableSectors.slice(0, 10).map((sector, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector)}
                          onChange={() => handleSectorSelection(sector)}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2">
                          {getSectorIcon(sector)}
                          <span className="text-gray-700 text-sm">{sector}</span>
                        </div>
                      </label>
                    ))}
                    
                    {availableSectors.length > 10 && (
                      <button
                        onClick={openEnhancedFilterDialog}
                        className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        View All {availableSectors.length} Sectors
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} />
                    Job Type
                  </label>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <label
                        key={type}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="jobType"
                          checked={selectedJobType === type}
                          onChange={() => handleJobTypeChange(type)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 text-sm">
                          {type === 'all' ? 'All Types' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter - UPDATED FOR EXPERIENCED PROFESSIONALS */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Award size={16} />
                    Years of Experience (Senior)
                  </label>
                  <div className="space-y-2">
                    {experienceOptions.map(exp => (
                      <label
                        key={exp}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="experience"
                          checked={selectedExperience === exp}
                          onChange={() => handleExperienceChange(exp)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-gray-700 text-sm">
                          {exp === 'all' ? 'All Senior Levels' : exp}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Selection - Multi-select checkboxes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Select Locations
                    {selectedLocations.length > 0 && (
                      <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {selectedLocations.length} selected
                      </span>
                    )}
                  </label>
                  
                  {/* Selected Locations Chips */}
                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedLocations.map((location, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          <MapPin size={10} />
                          {location.length > 12 ? `${location.substring(0, 12)}...` : location}
                          <button
                            onClick={() => handleCityFilter(location)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Popular Cities Quick Select */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Popular Cities for Senior Roles:</p>
                    <div className="flex flex-wrap gap-1">
                      {popularCities.slice(0, 6).map(city => (
                        <button
                          key={city}
                          onClick={() => handleCityFilter(city)}
                          className={`px-2 py-1 text-xs rounded-full ${selectedLocations.includes(city) 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={openEnhancedFilterDialog}
                    className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
                  >
                    <MapPin size={12} />
                    View All {availableLocations.length}+ Locations
                  </button>
                </div>

                {/* Desktop Analytics */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <BarChart size={16} />
                    Analytics Insights
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">🏙️ Top Cities for Senior Roles</p>
                      <div className="space-y-1">
                        {analytics.topCities.map((city, index) => (
                          <div key={city.city} className="flex justify-between items-center">
                            <span className="text-gray-700">{city.city}</span>
                            <span className="font-bold text-indigo-600">{city.count} jobs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
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

                    <div>
                      <p className="text-gray-600 mb-1">🎯 Popular Experience Levels</p>
                      <div className="space-y-1">
                        {analytics.topExperience.map((exp, index) => (
                          <div key={exp.experience} className="flex justify-between items-center">
                            <span className="text-gray-700 truncate">{exp.experience}</span>
                            <span className="font-bold text-amber-600">{exp.count} jobs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-1">🔥 Popular Senior Jobs</p>
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

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-bold text-green-600">
                          {totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                        <span className="text-gray-600">Senior Jobs: {filteredJobsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Desktop Sidebar Components */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  <Briefcase size={18} />
                  Build Professional Senior Resume
                </h3>
                <p className="text-indigo-700 text-sm mb-4">
                  Create an executive-level ATS-friendly resume for senior roles.
                </p>
                <Link 
                  to="/free-resume-builder" 
                  onClick={() => {
                    trackGoogleButtonClick('build_senior_resume_sidebar', 'sidebar_cta', 'latest_job_updates');
                    trackButtonClick('build_senior_resume_sidebar', 'sidebar_cta', '/latest-job-updates-india');
                    trackFunnelStep('experienced_job_search_funnel', 'build_resume_clicked', 2.5, {
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      source: 'experienced_jobs_sidebar'
                    });
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors block text-center"
                >
                  Build Executive Resume
                </Link>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <Download size={18} />
                  Export Senior Jobs
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Download all senior jobs as CSV for offline reference
                </p>
                <button 
                  onClick={downloadJobsCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center w-full"
                >
                  Download CSV
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Bookmark size={18} />
                  Saved Senior Jobs
                </h3>
                <p className="text-amber-700 text-sm mb-2">
                  You have {savedJobs.length} saved senior jobs
                </p>
                {savedJobs.length > 0 && (
                  <button 
                    onClick={() => {
                      const savedJobsList = jobs.filter(job => savedJobs.includes(job.id!));
                      alert(`Saved Senior Jobs:\n${savedJobsList.map(job => `• ${job.title} at ${job.company} (${job.experience || 'Not specified'})`).join('\n')}`);
                    }}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    View Saved Jobs
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {(showMobileFilters) && (
              <div className="lg:hidden mb-6 bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={18} />
                    Filters
                  </h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                </div>
                
                {/* Mobile Sector Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={14} />
                    Select Sectors
                    {selectedSectors.length > 0 && (
                      <span className="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                        {selectedSectors.length} selected
                      </span>
                    )}
                  </label>
                  
                  {/* Selected Sectors Chips - Mobile */}
                  {selectedSectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSectors.map((sector, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          {getSectorIcon(sector)}
                          {sector.length > 10 ? `${sector.substring(0, 10)}...` : sector}
                          <button
                            onClick={() => handleSectorSelection(sector)}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Sector Checkboxes - Mobile */}
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableSectors.slice(0, 8).map((sector, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector)}
                          onChange={() => handleSectorSelection(sector)}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2">
                          {getSectorIcon(sector)}
                          <span className="text-gray-700 text-sm">{sector.length > 20 ? `${sector.substring(0, 20)}...` : sector}</span>
                        </div>
                      </label>
                    ))}
                    
                    {availableSectors.length > 8 && (
                      <button
                        onClick={openEnhancedFilterDialog}
                        className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        View All Sectors
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Job Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={14} />
                    Job Type
                  </label>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <label
                        key={type}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="jobTypeMobile"
                          checked={selectedJobType === type}
                          onChange={() => handleJobTypeChange(type)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 text-sm">
                          {type === 'all' ? 'All Types' : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Experience Filter - UPDATED FOR EXPERIENCED PROFESSIONALS */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Award size={14} />
                    Years of Experience (Senior)
                  </label>
                  <div className="space-y-2">
                    {experienceOptions.map(exp => (
                      <label
                        key={exp}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="experienceMobile"
                          checked={selectedExperience === exp}
                          onChange={() => handleExperienceChange(exp)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-gray-700 text-sm">
                          {exp === 'all' ? 'All Senior Levels' : exp}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Location Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={14} />
                    Select Locations
                    {selectedLocations.length > 0 && (
                      <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {selectedLocations.length} selected
                      </span>
                    )}
                  </label>
                  
                  {/* Selected Locations Chips - Mobile */}
                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedLocations.map((location, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          <MapPin size={10} />
                          {location.length > 8 ? `${location.substring(0, 8)}...` : location}
                          <button
                            onClick={() => handleCityFilter(location)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Popular Cities - Mobile */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Popular Cities for Senior Roles:</p>
                    <div className="flex flex-wrap gap-1">
                      {popularCities.slice(0, 6).map(city => (
                        <button
                          key={city}
                          onClick={() => handleCityFilter(city)}
                          className={`px-2 py-1 text-xs rounded-full ${selectedLocations.includes(city) 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={openEnhancedFilterDialog}
                    className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
                  >
                    <MapPin size={12} />
                    View All Locations
                  </button>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <p className="text-indigo-800 font-semibold flex items-center gap-2">
                      📋 Latest CareerCraft Curated Senior Jobs
                      {firebaseConnected && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          🔥 Synced with Firebase
                        </span>
                      )}
                    </p>
                    <p className="text-indigo-700 text-sm">
                      Showing {filteredJobsCount} senior-level filtered jobs from our Indian job database
                    </p>
                    <p className="text-indigo-700 text-xs">
                      {totalJobsCount} senior jobs • Sorted by newest first • Auto-cleaned every 90 days
                    </p>
                    <p className="text-indigo-700 text-xs mt-1">
                      <span className="font-semibold">Experience Filter:</span> {selectedExperience === 'all' ? 'All senior experience levels' : selectedExperience}
                    </p>
                  </div>
                  <div className="text-xs md:text-sm text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full mt-2 md:mt-0">
                    Updated: {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {featuredJobs.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">⭐ Latest Featured Senior Opportunities</h2>
                  <div className="space-y-4">
                    {featuredJobs.slice(0, 3).map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        featured 
                        saved={savedJobs.includes(job.id!)}
                        onShare={handleShareClick}
                        onSave={handleSaveJob}
                        onApply={handleApply}
                        onTrackView={(jobId, jobTitle, company) => {
                          trackJobView(jobId, jobTitle, company);
                          firebaseJobService.incrementViewCount(jobId);
                          setJobs(prevJobs => 
                            prevJobs.map(j => 
                              j.id === jobId 
                                ? { ...j, views: (j.views || 0) + 1 }
                                : j
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {selectedSectors.length === 0 && selectedJobType === 'all' 
                    ? 'All Latest Senior Job Opportunities in India' 
                    : selectedSectors.length > 0 
                      ? `Latest ${selectedSectors.length} Sector${selectedSectors.length > 1 ? 's' : ''} Senior Jobs in India`
                      : `Latest ${selectedJobType} Senior Jobs in India`
                  } 
                  <span className="text-gray-600 text-base md:text-lg ml-2">({filteredJobsCount})</span>
                </h2>
                <div className="text-xs md:text-sm text-gray-600 flex items-center gap-2 mt-1 md:mt-0">
                  <Eye size={12} />
                  {totalViews} views •
                  <Briefcase size={12} />
                  {totalApplications} applications •
                  <Award size={12} />
                  {selectedExperience === 'all' ? 'All senior levels' : selectedExperience}
                </div>
              </div>
              
              {currentJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">No senior jobs found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms for senior roles</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button 
                      onClick={clearAllFilters}
                      className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-colors flex items-center gap-2"
                    >
                      <X size={14} />
                      Clear All Filters
                    </button>
                    <button 
                      onClick={openEnhancedFilterDialog}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center gap-2"
                    >
                      <ListFilter size={14} />
                      Open Enhanced Filters
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4 md:space-y-6">
                    {currentJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        saved={savedJobs.includes(job.id!)}
                        onShare={handleShareClick}
                        onSave={handleSaveJob}
                        onApply={handleApply}
                        onTrackView={(jobId, jobTitle, company) => {
                          trackJobView(jobId, jobTitle, company);
                          firebaseJobService.incrementViewCount(jobId);
                          setJobs(prevJobs => 
                            prevJobs.map(j => 
                              j.id === jobId 
                                ? { ...j, views: (j.views || 0) + 1 }
                                : j
                            )
                          );
                        }}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 md:mt-8">
                      <nav className="flex items-center space-x-1 md:space-x-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 md:px-3 md:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-2 py-1 md:px-3 md:py-2 rounded-lg border text-sm ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        {totalPages > 5 && (
                          <span className="px-2 py-1 text-gray-600">...</span>
                        )}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 md:px-3 md:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Analytics Dropdown (at bottom) */}
              {(showMobileAnalytics) && (
                <div className="lg:hidden mt-8 bg-white rounded-lg shadow-lg p-6">
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <BarChart size={16} />
                      Analytics Insights
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">🏙️ Top Cities for Senior Roles</p>
                        <div className="space-y-1">
                          {analytics.topCities.map((city, index) => (
                            <div key={city.city} className="flex justify-between items-center">
                              <span className="text-gray-700">{city.city}</span>
                              <span className="font-bold text-indigo-600">{city.count} jobs</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
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

                      <div>
                        <p className="text-gray-600 mb-1">🎯 Popular Experience Levels</p>
                        <div className="space-y-1">
                          {analytics.topExperience.map((exp, index) => (
                            <div key={exp.experience} className="flex justify-between items-center">
                              <span className="text-gray-700 truncate">{exp.experience}</span>
                              <span className="font-bold text-amber-600">{exp.count} jobs</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">🔥 Popular Senior Jobs</p>
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

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-bold text-green-600">
                            {totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0'}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                          <span className="text-gray-600">Senior Jobs: {filteredJobsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-bold text-indigo-800 text-base md:text-lg mb-2 flex items-center gap-2">
                      <Send size={16} />
                      Get Daily Senior Job Alerts
                    </h3>
                    <p className="text-indigo-700 text-xs md:text-sm">
                      We'll send you fresh senior job openings matching your profile
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
                      className="flex-1 px-3 py-2 md:px-4 md:py-2 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap flex items-center gap-1 md:gap-2 text-sm"
                    >
                      <Send size={14} />
                      Get Alerts
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6">
                <h3 className="font-bold text-green-800 mb-3 md:mb-4 flex items-center gap-2">
                  <TrendingUp size={16} />
                  CareerCraft Senior Community Impact
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="bg-white p-2 md:p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-green-600 text-lg md:text-xl">
                      {totalJobsCount}
                    </div>
                    <div className="text-gray-600">Senior Jobs</div>
                  </div>
                  <div className="bg-white p-2 md:p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-indigo-600 text-lg md:text-xl">
                      {totalShares}
                    </div>
                    <div className="text-gray-600">Jobs Shared</div>
                  </div>
                  <div className="bg-white p-2 md:p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-purple-600 text-lg md:text-xl">
                      {Math.ceil(totalJobsCount / 10)}
                    </div>
                    <div className="text-gray-600">Job Pages</div>
                  </div>
                  <div className="bg-white p-2 md:p-3 rounded-lg border border-green-100 text-center">
                    <div className="font-bold text-amber-600 text-lg md:text-xl">
                      {selectedExperience}
                    </div>
                    <div className="text-gray-600">Exp. Level</div>
                  </div>
                </div>
                <p className="text-green-700 text-xs md:text-sm mt-3 md:mt-4 text-center">
                  <Users size={12} className="inline mr-1" />
                  Every share helps a senior professional find their next career move. Keep sharing!
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Link 
                  to="/latest-jobs-for-freshers-india"
                  className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6 hover:bg-green-100 transition-colors"
                  onClick={() => {
                    trackButtonClick('navigate_fresher_jobs', 'bottom_nav', '/latest-job-updates-india');
                    trackUserFlow('latest_job_updates', 'fresher_jobs', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-green-800 mb-2 text-sm md:text-base">🎓 Fresher Jobs</h3>
                  <p className="text-green-700 text-xs md:text-sm">Entry-level positions for recent graduates</p>
                </Link>
                <Link 
                  to="/latest-walk-in-drives-india"
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6 hover:bg-emerald-100 transition-colors"
                  onClick={() => {
                    trackButtonClick('navigate_walkin_drives', 'bottom_nav', '/latest-job-updates-india');
                    trackUserFlow('latest_job_updates', 'walkin_drives', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-emerald-800 mb-2 text-sm md:text-base">🚀 Walk-in Drives</h3>
                  <p className="text-emerald-700 text-xs md:text-sm">Immediate hiring with direct company interviews</p>
                </Link>
                <Link 
                  to="/government-exams"
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6 hover:bg-amber-100 transition-colors"
                  onClick={() => {
                    trackButtonClick('navigate_government_exams_experienced', 'bottom_nav', '/latest-job-updates-india');
                    trackUserFlow('latest_job_updates', 'government_exams', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-amber-800 mb-2 text-sm md:text-base">🏛️ Government Exams</h3>
                  <p className="text-amber-700 text-xs md:text-sm">Latest Sarkari Naukri exams for experienced candidates</p>
                </Link>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {showShareModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Share Senior Job Opportunity</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">{selectedJob.title}</h4>
                <p className="text-sm text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                <p className="text-sm text-amber-600 mt-1">Experience: {selectedJob.experience || '3-5 years'}</p>
                <p className="text-xs text-gray-500 mt-1">Share with senior professionals who might be interested</p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="flex flex-col items-center justify-center p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={20} />
                  <span className="text-xs mt-1">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="flex flex-col items-center justify-center p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={20} />
                  <span className="text-xs mt-1">Twitter/X</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('linkedin')}
                  className="flex flex-col items-center justify-center p-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={20} />
                  <span className="text-xs mt-1">LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="flex flex-col items-center justify-center p-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-xs mt-1">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex flex-col items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail size={20} />
                  <span className="text-xs mt-1">Email</span>
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center justify-center p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Copy size={20} />
                  <span className="text-xs mt-1">
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link to Senior Job
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/latest-job-updates-india?job=${selectedJob.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    trackGoogleButtonClick('apply_from_share_experienced', 'share_modal', 'latest_job_updates');
                    trackButtonClick('apply_from_share_experienced', 'share_modal', '/latest-job-updates-india');
                    trackFunnelStep('experienced_job_search_funnel', 'application_started_from_share', 2.2, {
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      job_id: selectedJob.id,
                      source: 'share_modal'
                    });
                    
                    if (selectedJob.applyLink && selectedJob.applyLink.startsWith('http')) {
                      handleApply(selectedJob);
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
                >
                  <ExternalLink size={14} className="inline mr-1" />
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
  
  const hasTrackedView = React.useRef(false);
  
  React.useEffect(() => {
    if (!hasTrackedView.current) {
      onTrackView(job.id!, job.title, job.company);
      hasTrackedView.current = true;
    }
  }, [job.id, job.title, job.company, onTrackView]);

  const handleApplyClick = () => {
    onApply(job);
  };

  const handleBuildResumeClick = () => {
    trackGoogleButtonClick('build_senior_resume_from_job', 'job_card', 'latest_job_updates');
    trackButtonClick('build_senior_resume_from_job', 'job_card', '/latest-job-updates-india');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare(job);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave(job.id!, job.title, job.company);
  };

  return (
    <div 
      className={`job-card bg-white rounded-lg shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow ${featured ? 'featured-job border-l-4 border-indigo-500' : ''}`}
      itemScope
      itemType="https://schema.org/JobPosting"
    >
      <meta itemProp="datePosted" content={job.postedDate} />
      <meta itemProp="employmentType" content={job.type} />
      <meta itemProp="hiringOrganization" content={job.company} />
      <meta itemProp="jobLocation" content={job.location} />
      <meta itemProp="title" content={job.title} />
      <meta itemProp="experienceRequirements" content={job.experience || '3-5 years'} />
      
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1" itemProp="title">{job.title}</h3>
              <p className="text-sm md:text-lg text-gray-700 mb-2" itemProp="hiringOrganization">{job.company} • <span itemProp="jobLocation">{job.location}</span></p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveClick}
                  className={`p-1 rounded-full ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title={saved ? 'Remove from saved' : 'Save job'}
                >
                  <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShareClick}
                  className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                  title="Share this job"
                >
                  <Share2 size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {isNewJob && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-1 py-0.5 rounded-full">
                    🔥 NEW TODAY
                  </span>
                )}
                {featured && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-1 py-0.5 rounded-full">
                    ⭐ Featured Senior Role
                  </span>
                )}
                <span className="bg-green-100 text-green-800 text-xs font-medium px-1 py-0.5 rounded-full">
                  Updated: {new Date(job.addedTimestamp || (job.postedDate ? new Date(job.postedDate).getTime() : Date.now())).toLocaleDateString('en-IN')}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>👁️ {job.views || 0}</span>
                  <span>📤 {job.shares || 0}</span>
                  <span>📝 {job.applications || 0}</span>
                  {job.saves && job.saves > 0 && (
                    <span>💾 {job.saves || 0}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
            <span className="bg-indigo-100 text-indigo-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs flex items-center gap-1">
              <Briefcase size={10} />
              {job.type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs flex items-center gap-1">
              <Building size={10} />
              {job.sector}
            </span>
            {job.experience && (
              <span className="bg-amber-100 text-amber-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs flex items-center gap-1">
                <Award size={10} />
                {job.experience}
              </span>
            )}
            <span className="bg-orange-100 text-orange-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs flex items-center gap-1" itemProp="baseSalary">
              <DollarSign size={10} />
              {job.salary}
            </span>
            <span className="bg-gray-100 text-gray-800 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs flex items-center gap-1" itemProp="jobLocation">
              <MapPin size={10} />
              {job.location}
            </span>
          </div>

          <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm" itemProp="description">{job.description}</p>

          <div className="mb-3 md:mb-4">
            <h4 className="font-semibold text-gray-800 mb-1 text-sm">Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {job.requirements.slice(0, 3).map((req, index) => (
                <li key={index} itemProp="experienceRequirements">• {req}</li>
              ))}
              {job.requirements.length > 3 && (
                <li className="text-indigo-600 text-xs">+ {job.requirements.length - 3} more requirements</li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Posted {new Date(job.postedDate || new Date().toISOString().split('T')[0]).toLocaleDateString()}
            </span>
            {job.addedTimestamp && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Last Updated: {new Date(job.addedTimestamp).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="lg:ml-4 lg:text-right mt-3 lg:mt-0 flex flex-col gap-1 md:gap-2">
          <button 
            onClick={handleApplyClick}
            className="bg-indigo-600 text-white px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-1 md:gap-2 text-sm"
            itemProp="url"
          >
            <ExternalLink size={14} />
            Apply Now
          </button>
          <button
            onClick={handleShareClick}
            className="border border-indigo-600 text-indigo-600 px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-center flex items-center justify-center gap-1 md:gap-2 text-sm"
          >
            <Share2 size={14} />
            Share Job
          </button>
          <button
            onClick={handleSaveClick}
            className={`border px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors text-center flex items-center justify-center gap-1 md:gap-2 text-sm ${
              saved
                ? 'border-red-600 text-red-600 hover:bg-red-50'
                : 'border-gray-600 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Save Job'}
          </button>
          <Link 
            to="/free-resume-builder" 
            onClick={handleBuildResumeClick}
            className="border border-green-600 text-green-600 px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center text-sm"
          >
            Build Executive Resume
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestJobUpdatesIndia;