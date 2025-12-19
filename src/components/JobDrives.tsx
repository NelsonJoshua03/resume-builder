// src/components/JobDrives.tsx - MOBILE OPTIMIZED & PROFESSIONAL DESIGN
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { firebaseDriveService } from '../firebase/driveService';
import { getFirebaseStatus } from '../firebase/config';
import type { JobDriveData } from '../firebase/driveService';
import { 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  Building,
  ExternalLink,
  Users,
  Filter,
  RefreshCw,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Star,
  TrendingUp,
  CalendarDays,
  Database,
  WifiOff,
  Heart,
  Check,
  Briefcase,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';

// Use the JobDriveData type from driveService
type JobDrive = JobDriveData & {
  addedTimestamp?: number;
  page?: number;
  isNew?: boolean;
};

const JobDrives: React.FC = () => {
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<JobDrive | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [driveTypeFilter, setDriveTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedDrives, setExpandedDrives] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'featured' | 'upcoming'>('all');
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [savedDrives, setSavedDrives] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [drivesPerPage] = useState<number>(3);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Analytics hooks
  const { 
    trackButtonClick: trackGoogleButtonClick, 
    trackSocialShare: trackGoogleSocialShare, 
    trackCTAClick: trackGoogleCTAClick,
    trackExternalLink 
  } = useGoogleAnalytics();

  // Firebase Analytics hook
  const {
    trackFirebaseEvent,
    trackPageView: trackFirebasePageView,
    trackButtonClick: trackFirebaseButtonClick,
    trackCTAClick: trackFirebaseCTAClick,
    trackSocialShare: trackFirebaseSocialShare,
    trackFunnelStep,
    trackUserFlow,
    trackWalkinDriveView,
    trackWalkinDriveRegistration
  } = useFirebaseAnalytics();

  // Track page view on mount
  useEffect(() => {
    // Firebase Analytics
    trackFirebasePageView('/job-drives', 'Job Drives');
    
    // Track funnel entry
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('job_drives_funnel', 'page_viewed', 1, {
      user_id: userId,
      page_path: '/job-drives',
      source: document.referrer || 'direct'
    });

    // Load saved drives
    const saved = JSON.parse(localStorage.getItem('saved_drives') || '[]');
    setSavedDrives(saved);
    
    // Check Firebase status
    const status = getFirebaseStatus();
    setFirebaseStatus(status);
    setFirebaseConnected(!!status.firestore);
    
    // Load drives
    loadDrives();
  }, []);

  // Load drives from Firebase and localStorage
  const loadDrives = async () => {
    setLoading(true);
    setSyncStatus('Loading drives...');
    
    try {
      // Check Firebase status
      const status = getFirebaseStatus();
      
      if (status.firestore && status.configValid) {
        setFirebaseConnected(true);
        
        try {
          // Load from Firebase
          const firebaseResult = await firebaseDriveService.getDrives({}, 1, 1000);
          
          if (firebaseResult.drives && firebaseResult.drives.length > 0) {
            // Convert Firebase drives to our JobDrive type
            const firebaseDrives: JobDrive[] = firebaseResult.drives.map(drive => ({
              ...drive,
              id: drive.id || `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              addedTimestamp: drive.createdAt ? new Date(drive.createdAt).getTime() : Date.now(),
              page: 1,
              isNew: true,
              views: drive.views || 0,
              shares: drive.shares || 0,
              registrations: drive.registrations || 0
            }));
            
            // Sort by date (newest first)
            const sortedDrives = firebaseDrives.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.addedTimestamp || 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.addedTimestamp || 0;
              return dateB - dateA; // Descending order (newest first)
            });
            
            // Move featured drives to top
            const finalSortedDrives = sortedDrives.sort((a, b) => {
              if (a.featured === b.featured) return 0;
              if (a.featured && !b.featured) return -1;
              return 1;
            });
            
            setSyncStatus(`${finalSortedDrives.length} drives loaded`);
            setDrives(finalSortedDrives);
            setLastUpdated(new Date().toLocaleString('en-IN'));
            
            // Cache in localStorage for offline access
            localStorage.setItem('firebase_drives_cache', JSON.stringify({
              drives: finalSortedDrives,
              timestamp: Date.now()
            }));
            
            // Also update jobDrives for backward compatibility
            localStorage.setItem('jobDrives', JSON.stringify(finalSortedDrives));
            
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
      const cacheData = localStorage.getItem('firebase_drives_cache');
      if (cacheData) {
        try {
          const { drives: cachedDrives, timestamp } = JSON.parse(cacheData);
          const cacheAge = Date.now() - timestamp;
          const maxCacheAge = 30 * 60 * 1000; // 30 minutes
          
          if (cacheAge < maxCacheAge && cachedDrives.length > 0) {
            // Sort cache by date (newest first)
            const sortedCachedDrives = cachedDrives.sort((a: JobDrive, b: JobDrive) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.addedTimestamp || 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.addedTimestamp || 0;
              return dateB - dateA;
            });
            
            setDrives(sortedCachedDrives);
            setLastUpdated(new Date(timestamp).toLocaleString('en-IN'));
            setSyncStatus(`${sortedCachedDrives.length} cached drives`);
            setLoading(false);
            return;
          }
        } catch (cacheError) {
          console.warn('Error parsing cache:', cacheError);
        }
      }
      
      // Then check jobDrives (legacy)
      const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      
      // Clean up old drives (older than 90 days)
      const now = Date.now();
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
      
      const recentDrives = savedDrives.filter((drive: JobDrive) => {
        const driveTimestamp = drive.createdAt ? new Date(drive.createdAt).getTime() : 
                               drive.addedTimestamp || new Date(drive.date).getTime();
        return driveTimestamp >= ninetyDaysAgo;
      });
      
      // Update localStorage with only recent drives
      if (recentDrives.length !== savedDrives.length) {
        localStorage.setItem('jobDrives', JSON.stringify(recentDrives));
      }
      
      // Sort by date (newest first)
      const sortedDrives = recentDrives.sort((a: JobDrive, b: JobDrive) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.addedTimestamp || new Date(a.date).getTime();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.addedTimestamp || new Date(b.date).getTime();
        return dateB - dateA;
      });

      // Add page numbers and default values
      const drivesWithPages = sortedDrives.map((drive: JobDrive, index: number) => ({
        ...drive,
        page: drive.page || Math.floor(index / 10) + 1,
        addedTimestamp: drive.addedTimestamp || Date.now(),
        views: drive.views || 0,
        shares: drive.shares || 0,
        registrations: drive.registrations || 0
      }));

      setDrives(drivesWithPages);
      setLastUpdated(new Date().toLocaleString('en-IN'));
      setSyncStatus(`${drivesWithPages.length} drives from storage`);
      
    } catch (error) {
      console.error('Error loading drives:', error);
      setSyncStatus('Error loading drives');
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload drives
  const handleRefresh = () => {
    setCurrentPage(1);
    loadDrives();
    
    // Track with both systems
    trackGoogleButtonClick('refresh_drives', 'refresh', 'job_drives');
    trackFirebaseButtonClick('refresh_drives', 'refresh', '/job-drives');
    
    // Firebase refresh event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drives_refreshed',
      'User Interaction',
      'manual_refresh',
      {
        user_id: userId,
        timestamp: new Date().toISOString(),
        drive_count: drives.length
      }
    );
  };

  // Categories for filtering
  const categories = [
    'all',
    'IT/Software',
    'Engineering',
    'Banking/Finance',
    'Marketing',
    'Healthcare',
    'Government',
    'Campus Placement',
    'Mass Recruitment'
  ];

  // Drive types for filtering
  const driveTypes = [
    'all',
    'Walk-in Interview',
    'Job Fair',
    'Campus Drive',
    'Virtual Drive',
    'Immediate Joining',
    'Pool Campus'
  ];

  // Featured options
  const featuredOptions = [
    { value: 'all', label: 'All Drives' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'non-featured', label: 'Non-Featured' }
  ];

  // Filter drives based on all criteria
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchTerm === '' || 
      drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === '' || 
      drive.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      drive.title.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      drive.company.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      (drive.driveType && drive.driveType.toLowerCase().includes(categoryFilter.toLowerCase()));
    
    const matchesDriveType = driveTypeFilter === 'all' || 
      (drive.driveType && drive.driveType === driveTypeFilter) ||
      (!drive.driveType && driveTypeFilter === 'all');
    
    const matchesFeatured = featuredFilter === 'all' || 
      (featuredFilter === 'featured' && drive.featured) ||
      (featuredFilter === 'non-featured' && !drive.featured);
    
    // Tab-specific filtering
    const isToday = new Date(drive.date).toDateString() === new Date().toDateString();
    const isUpcoming = new Date(drive.date) > new Date() && !isToday;
    
    if (activeTab === 'today') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && isToday;
    } else if (activeTab === 'featured') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && drive.featured;
    } else if (activeTab === 'upcoming') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && isUpcoming;
    }
    
    return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured;
  });

  // Get counts for tabs
  const todayDrivesCount = drives.filter(d => new Date(d.date).toDateString() === new Date().toDateString()).length;
  const featuredDrivesCount = drives.filter(d => d.featured).length;
  const upcomingDrivesCount = drives.filter(d => new Date(d.date) > new Date() && new Date(d.date).toDateString() !== new Date().toDateString()).length;
  const allDrivesCount = drives.length;

  // Pagination logic
  const indexOfLastDrive = currentPage * drivesPerPage;
  const indexOfFirstDrive = indexOfLastDrive - drivesPerPage;
  const currentDrives = filteredDrives.slice(indexOfFirstDrive, indexOfLastDrive);
  const totalPages = Math.ceil(filteredDrives.length / drivesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    
    // Track with both systems
    trackGoogleButtonClick('page_change', 'pagination', 'job_drives');
    trackFirebaseButtonClick('page_change', 'pagination', '/job-drives');
    
    // Firebase pagination event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drives_page_changed',
      'User Interaction',
      `page_${pageNumber}`,
      {
        user_id: userId,
        timestamp: new Date().toISOString(),
        page: pageNumber,
        drives_per_page: drivesPerPage
      }
    );
    
    // Scroll to top of drives section
    window.scrollTo({
      top: 500,
      behavior: 'smooth'
    });
  };

  const handleShare = (drive: JobDrive) => {
    setSelectedDrive(drive);
    setShowShareModal(true);
    
    // Track with both systems
    trackGoogleButtonClick('share_drive', 'drive_card', 'job_drives');
    trackFirebaseButtonClick('share_drive', 'drive_card', '/job-drives');
    
    // Firebase event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drive_share_opened',
      'Job Drives',
      drive.id || 'unknown',
      {
        drive_id: drive.id,
        drive_title: drive.title,
        company: drive.company,
        user_id: userId,
        timestamp: new Date().toISOString()
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setShowMobileSearch(false);
    
    // Track with both systems
    trackGoogleButtonClick('search_drives', 'search_form', 'job_drives');
    trackFirebaseButtonClick('search_drives', 'search_form', '/job-drives');
    
    // Firebase search event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drive_search_performed',
      'Job Drives',
      searchTerm || 'no_query',
      {
        search_query: searchTerm,
        location_filter: locationFilter || 'none',
        category_filter: categoryFilter,
        drive_type_filter: driveTypeFilter,
        results_count: filteredDrives.length,
        user_id: userId,
        timestamp: new Date().toISOString()
      },
      filteredDrives.length
    );
  };

  const handleRegisterClick = async (drive: JobDrive) => {
    // Google Analytics
    trackGoogleButtonClick('register_drive', 'drive_card', 'job_drives');
    
    // Firebase Analytics
    trackFirebaseButtonClick('register_drive', 'drive_card', '/job-drives');
    trackWalkinDriveRegistration(drive.id || '', drive.title, drive.company);
    
    // Firebase registration event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drive_registration_started',
      'Job Drives',
      drive.id || 'unknown',
      {
        drive_id: drive.id,
        drive_title: drive.title,
        company: drive.company,
        location: drive.location,
        date: drive.date,
        user_id: userId,
        timestamp: new Date().toISOString()
      }
    );
    
    // Track funnel step
    trackFunnelStep('job_drive_registration', 'registration_started', 2, {
      user_id: userId,
      drive_id: drive.id,
      drive_title: drive.title,
      company: drive.company
    });

    // Increment registration count in Firebase
    if (drive.id) {
      await firebaseDriveService.incrementRegistrationCount(drive.id);
    }

    // Handle external links properly
    const url = drive.registrationLink || drive.applyLink;
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      trackExternalLink('Drive Registration', url, 'job_drives');
    } else if (url && url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      console.warn('Invalid URL for drive:', drive.title, url);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('all');
    setDriveTypeFilter('all');
    setFeaturedFilter('all');
    setActiveTab('all');
    setCurrentPage(1);
    
    // Track with both systems
    trackGoogleButtonClick('clear_filters', 'filters', 'job_drives');
    trackFirebaseButtonClick('clear_filters', 'filters', '/job-drives');
    
    // Firebase clear filters event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drive_filters_cleared',
      'Job Drives',
      'all_filters',
      {
        user_id: userId,
        timestamp: new Date().toISOString()
      }
    );
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/job-drives${selectedDrive ? `?drive=${selectedDrive.id}` : ''}`
    : '';

  const handleSocialShare = (platform: string) => {
    if (selectedDrive) {
      // Google Analytics
      trackGoogleSocialShare(platform, 'job_drive', selectedDrive.id || '');
      
      // Firebase Analytics
      trackFirebaseSocialShare(platform, 'job_drive', selectedDrive.id || '');
      
      // Firebase share event
      const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
      trackFirebaseEvent(
        'job_drive_shared',
        'Social Sharing',
        platform,
        {
          drive_id: selectedDrive.id,
          drive_title: selectedDrive.title,
          company: selectedDrive.company,
          platform: platform,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      );

      // Increment share count in Firebase
      if (selectedDrive.id) {
        firebaseDriveService.incrementShareCount(selectedDrive.id);
      }
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedDrive(null);
    setCopySuccess(false);
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    if (selectedDrive) {
      const driveUrl = `${window.location.origin}/job-drives?drive=${selectedDrive.id}`;
      navigator.clipboard.writeText(driveUrl);
      setCopySuccess(true);
      
      // Track with both systems
      trackGoogleButtonClick('copy_drive_link', 'share_modal', 'job_drives');
      trackFirebaseButtonClick('copy_drive_link', 'share_modal', '/job-drives');
      
      // Social share tracking
      trackGoogleSocialShare('copy_link', 'job_drive', selectedDrive.id || '');
      trackFirebaseSocialShare('copy_link', 'job_drive', selectedDrive.id || '');
      
      // Firebase copy event
      const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
      trackFirebaseEvent(
        'job_drive_link_copied',
        'Social Sharing',
        'copy_link',
        {
          drive_id: selectedDrive.id,
          drive_title: selectedDrive.title,
          company: selectedDrive.company,
          platform: 'copy_link',
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      );
      
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Native Web Share API
  const nativeShare = async () => {
    if (selectedDrive && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${selectedDrive.title} - ${selectedDrive.company}`,
          text: `Check out this job drive on CareerCraft: ${selectedDrive.title} by ${selectedDrive.company} in ${selectedDrive.location} on ${new Date(selectedDrive.date).toLocaleDateString()} at ${selectedDrive.time}`,
          url: shareUrl,
        });
        
        // Track with both systems
        trackGoogleSocialShare('native', 'job_drive', selectedDrive.id || '');
        trackFirebaseSocialShare('native', 'job_drive', selectedDrive.id || '');
        trackGoogleButtonClick('native_share', 'share_modal', 'job_drives');
        trackFirebaseButtonClick('native_share', 'share_modal', '/job-drives');
        
        // Firebase native share event
        const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
        trackFirebaseEvent(
          'job_drive_native_shared',
          'Social Sharing',
          'native_share',
          {
            drive_id: selectedDrive.id,
            drive_title: selectedDrive.title,
            company: selectedDrive.company,
            platform: 'native_share',
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        );
        
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Platform-specific sharing functions
  const shareOnFacebook = () => {
    if (selectedDrive) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleSocialShare('facebook');
    }
  };

  const shareOnTwitter = () => {
    if (selectedDrive) {
      const text = `Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company} in ${selectedDrive.location}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleSocialShare('twitter');
    }
  };

  const shareOnLinkedIn = () => {
    if (selectedDrive) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleSocialShare('linkedin');
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedDrive) {
      const text = `Check out this job drive on CareerCraft: ${selectedDrive.title} at ${selectedDrive.company} - ${shareUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      handleSocialShare('whatsapp');
    }
  };

  const shareViaEmail = () => {
    if (selectedDrive) {
      const subject = `Job Drive: ${selectedDrive.title} at ${selectedDrive.company}`;
      const body = `Check out this job drive on CareerCraft:\n\nDrive: ${selectedDrive.title}\nCompany: ${selectedDrive.company}\nLocation: ${selectedDrive.location}\nDate: ${new Date(selectedDrive.date).toLocaleDateString()}\nTime: ${selectedDrive.time}\n\nView details: ${shareUrl}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
      handleSocialShare('email');
    }
  };

  // Newsletter signup
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      // Track with both systems
      trackGoogleButtonClick('newsletter_signup_drives', 'newsletter', 'job_drives');
      trackFirebaseButtonClick('newsletter_signup_drives', 'newsletter', '/job-drives');
      
      // Firebase newsletter signup event
      const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
      trackFirebaseEvent(
        'job_drive_newsletter_signup',
        'User Engagement',
        'newsletter_signup',
        {
          email: newsletterEmail,
          user_id: userId,
          timestamp: new Date().toISOString(),
          preferences: {
            category: categoryFilter,
            location: locationFilter,
            drive_type: driveTypeFilter
          }
        }
      );
      
      alert(`Thank you! You'll receive drive alerts at ${newsletterEmail}`);
      setNewsletterEmail('');
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('drive_subscribers') || '[]');
      subscribers.push({ email: newsletterEmail, date: new Date().toISOString() });
      localStorage.setItem('drive_subscribers', JSON.stringify(subscribers));
    }
  };

  // Toggle expanded state for a drive
  const toggleExpandDrive = (driveId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedDrives(prev => ({
      ...prev,
      [driveId]: !prev[driveId]
    }));
    
    // Track with both systems
    trackGoogleButtonClick('toggle_expand_drive', 'drive_card', 'job_drives');
    trackFirebaseButtonClick('toggle_expand_drive', 'drive_card', '/job-drives');
  };

  // Toggle expand all drives
  const toggleExpandAll = () => {
    const allExpanded = Object.values(expandedDrives).every(val => val);
    const newExpandedState: Record<string, boolean> = {};
    currentDrives.forEach(drive => {
      newExpandedState[drive.id || ''] = !allExpanded;
    });
    setExpandedDrives(newExpandedState);
    
    // Track with both systems
    trackGoogleButtonClick('toggle_all_expand', 'page_controls', 'job_drives');
    trackFirebaseButtonClick('toggle_all_expand', 'page_controls', '/job-drives');
    
    // Firebase expand all event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      allExpanded ? 'job_drives_all_collapsed' : 'job_drives_all_expanded',
      'User Interaction',
      allExpanded ? 'collapse_all' : 'expand_all',
      {
        user_id: userId,
        action: allExpanded ? 'collapse_all' : 'expand_all',
        drive_count: currentDrives.length,
        timestamp: new Date().toISOString()
      }
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'today' | 'featured' | 'upcoming') => {
    setActiveTab(tab);
    setCurrentPage(1);
    
    // Track with both systems
    trackGoogleButtonClick(`tab_${tab}`, 'tabs', 'job_drives');
    trackFirebaseButtonClick(`tab_${tab}`, 'tabs', '/job-drives');
    
    // Firebase tab change event
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drives_tab_changed',
      'Navigation',
      tab,
      {
        user_id: userId,
        from_tab: activeTab,
        to_tab: tab,
        results_count: filteredDrives.length,
        timestamp: new Date().toISOString()
      }
    );
  };

  // Save drive functionality
  const handleSaveDrive = (driveId: string, driveTitle: string, company: string) => {
    const isAlreadySaved = savedDrives.includes(driveId);
    
    if (isAlreadySaved) {
      // Remove from saved
      const newSaved = savedDrives.filter(id => id !== driveId);
      setSavedDrives(newSaved);
      localStorage.setItem('saved_drives', JSON.stringify(newSaved));
    } else {
      // Add to saved
      const newSaved = [...savedDrives, driveId];
      setSavedDrives(newSaved);
      localStorage.setItem('saved_drives', JSON.stringify(newSaved));
      
      // Firebase save event
      const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
      trackFirebaseEvent(
        'drive_saved',
        'Drive Interaction',
        driveId,
        {
          drive_id: driveId,
          drive_title: driveTitle,
          company: company,
          user_id: userId
        }
      );
    }
    
    trackGoogleButtonClick(
      isAlreadySaved ? 'unsave_drive' : 'save_drive', 
      'drive_card', 
      'job_drives'
    );
    trackFirebaseButtonClick(
      isAlreadySaved ? 'unsave_drive' : 'save_drive', 
      'drive_card', 
      '/job-drives'
    );
  };

  // Sync with Firebase manually
  const syncWithFirebase = async () => {
    setSyncStatus('Syncing with Firebase...');
    try {
      const result = await firebaseDriveService.syncAllToFirebase();
      if (result.synced > 0) {
        setSyncStatus(`Synced ${result.synced} drives`);
        // Reload drives to get updated list from Firebase
        loadDrives();
      } else {
        setSyncStatus('Already synced or no drives to sync');
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
      const result = await firebaseDriveService.testFirebaseConnection();
      if (result.connected) {
        setFirebaseConnected(true);
        setSyncStatus('Firebase connected');
        loadDrives();
      } else {
        setFirebaseConnected(false);
        setSyncStatus('Firebase not connected');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setSyncStatus('Connection test failed');
    }
  };

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  return (
    <>
      <Helmet>
        <title>Latest Walk-in Drives & Job Fairs in India 2025 | Fresh Updates | CareerCraft.in</title>
        <meta name="description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Updated daily. Direct company interviews for IT, engineering, and business roles." />
        <meta name="keywords" content="latest walk-in drives India 2025, fresh job fairs India, immediate hiring today, direct interview updates, IT jobs walk-in today, engineering jobs drive, campus placement India, fresher jobs India, walk-in interviews Bangalore, walk-in Mumbai, walk-in Delhi" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/job-drives" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Latest Walk-in Drives & Job Fairs in India 2025 | Fresh Updates | CareerCraft.in" />
        <meta property="og:description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Updated daily. Direct company interviews for IT, engineering roles." />
        <meta property="og:url" content="https://careercraft.in/job-drives" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest Walk-in Drives & Job Fairs in India 2025 | Fresh Updates | CareerCraft.in" />
        <meta name="twitter:description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta name="twitter:site" content="@CareerCraftIN" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Latest Walk-in Drives & Job Fairs in India",
            "description": "Daily updated walk-in drives and job fairs from top Indian companies",
            "url": "https://careercraft.in/job-drives",
            "numberOfItems": drives.length,
            "itemListElement": drives.slice(0, 10).map((drive, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Event",
                "name": drive.title,
                "description": drive.description,
                "startDate": drive.date,
                "endDate": drive.date,
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "eventStatus": "https://schema.org/EventScheduled",
                "location": {
                  "@type": "Place",
                  "name": drive.location,
                  "address": drive.location
                },
                "organizer": {
                  "@type": "Organization",
                  "name": drive.company
                },
                "offers": {
                  "@type": "Offer",
                  "url": drive.applyLink
                }
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">{syncStatus}</p>
          </div>
        </div>
      )}

      {/* Hero Section - MOBILE OPTIMIZED */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white pt-4 pb-8 md:py-16">
        <div className="container mx-auto px-3 md:px-4 max-w-7xl">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-green-100 hover:text-white text-sm"
              onClick={() => {
                trackFirebaseButtonClick('back_to_home', 'navigation', '/job-drives');
                trackUserFlow('job_drives', 'home', 'navigation');
              }}
            >
              <ArrowRight className="rotate-180" size={16} />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${firebaseConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {firebaseConnected ? <Database size={10} /> : <WifiOff size={10} />}
                <span className="hidden xs:inline">{firebaseConnected ? 'Online' : 'Offline'}</span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                title="Refresh latest drives"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors md:hidden"
                title="Search drives"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          
          {/* Title - Smaller on mobile */}
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Walk-in Drives & Job Fairs</h1>
            <p className="text-sm md:text-base opacity-90 max-w-3xl mx-auto">
              Immediate hiring opportunities across India
              <span className="block text-xs opacity-75 mt-1">Updated: {lastUpdated}</span>
            </p>
          </div>
          
          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="mb-4 md:hidden">
              <form onSubmit={handleSearch} className="bg-white rounded-lg p-3 shadow-lg">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Job title or company..."
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City or location"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-sm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded font-medium text-sm"
                  >
                    Search Drives
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Desktop Search Form */}
          <form onSubmit={handleSearch} className="hidden md:block max-w-6xl mx-auto bg-white rounded-xl p-4 shadow-2xl mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Job title or company..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or location"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Find Drives
                </button>
              </div>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowFilters(!showFilters);
                  trackFirebaseButtonClick('toggle_filters', 'filters', '/job-drives');
                }}
                className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm"
              >
                <Filter size={16} />
                {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Drive Type</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      value={driveTypeFilter}
                      onChange={(e) => setDriveTypeFilter(e.target.value)}
                    >
                      {driveTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Drive Types' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Featured Status</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                    >
                      {featuredOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-3 rounded-lg text-center w-full">
                      <div className="text-sm text-gray-700">Found:</div>
                      <div className="text-xl font-bold text-green-600">{filteredDrives.length}</div>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Stats - SMALLER FONTS */}
          <div className="mt-4 grid grid-cols-4 gap-2 max-w-3xl mx-auto">
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('all')}
            >
              <div className="text-lg font-bold">{allDrivesCount}</div>
              <div className="text-green-100 text-xs">Total</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('today')}
            >
              <div className="text-lg font-bold">{todayDrivesCount}</div>
              <div className="text-green-100 text-xs">Today</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('featured')}
            >
              <div className="text-lg font-bold">{featuredDrivesCount}</div>
              <div className="text-green-100 text-xs">Featured</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('upcoming')}
            >
              <div className="text-lg font-bold">{upcomingDrivesCount}</div>
              <div className="text-green-100 text-xs">Upcoming</div>
            </div>
          </div>

          {/* Debug Section - Hidden but accessible */}
          <div className="mt-3 text-center">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              {showDebugInfo ? 'Hide' : 'Show'} System Info
            </button>
            
            {/* Debug Info - Hidden by default */}
            {showDebugInfo && firebaseStatus && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-2 max-w-2xl mx-auto text-xs">
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
                <div className="mt-2 text-xs opacity-75">{syncStatus}</div>
                <div className="flex justify-center gap-2 mt-2">
                  <button 
                    onClick={testFirebaseConnection}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                  >
                    Test Connection
                  </button>
                  {!firebaseConnected && (
                    <button 
                      onClick={syncWithFirebase}
                      className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
                    >
                      Sync to Firebase
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick City Filters - Smaller */}
          <div className="mt-3">
            <div className="flex flex-wrap justify-center gap-1">
              {popularCities.slice(0, 6).map(city => (
                <button
                  key={city}
                  onClick={() => setLocationFilter(city)}
                  className="bg-white text-green-600 px-2 py-1 rounded-full text-xs hover:bg-green-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6">
        <div className="container mx-auto px-3 md:px-4 max-w-7xl">
          {/* Quick Navigation - Smaller */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link 
              to="/job-applications"
              className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
              onClick={() => {
                trackFirebaseButtonClick('view_job_applications', 'quick_nav', '/job-drives');
                trackUserFlow('job_drives', 'job_applications', 'navigation');
              }}
            >
              <ArrowRight size={14} />
              Job Applications
            </Link>
            <Link 
              to="/government-exams"
              className="bg-green-50 text-green-700 px-3 py-1.5 rounded text-sm hover:bg-green-100 transition-colors flex items-center gap-1"
              onClick={() => {
                trackFirebaseButtonClick('view_government_exams', 'quick_nav', '/job-drives');
                trackUserFlow('job_drives', 'government_exams', 'navigation');
              }}
            >
              <ArrowRight size={14} />
              Govt Exams
            </Link>
          </div>

          {/* Admin Access - Only visible on desktop */}
          <div className="hidden md:flex justify-end mb-4">
            <Link 
              to="/admin/job-drives" 
              onClick={() => {
                trackGoogleCTAClick('admin_job_drives', 'admin_access', 'job_drives');
                trackFirebaseCTAClick('admin_job_drives', 'admin_access', '/job-drives');
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Add New Drive
            </Link>
          </div>

          {/* Tabs Navigation - Compact */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {activeTab === 'all' && 'All Drives'}
                  {activeTab === 'today' && "Today's Drives"}
                  {activeTab === 'featured' && 'Featured Drives'}
                  {activeTab === 'upcoming' && 'Upcoming Drives'}
                  <span className="text-gray-600 text-sm md:text-base ml-2">({filteredDrives.length})</span>
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  Page {currentPage} of {totalPages} • Showing {currentDrives.length} of {filteredDrives.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleExpandAll}
                  className="text-xs md:text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors flex items-center gap-1"
                >
                  <Eye size={14} />
                  <span className="hidden xs:inline">{Object.values(expandedDrives).every(val => val) ? 'Collapse' : 'Expand'}</span>
                </button>
                <button
                  onClick={handleClearFilters}
                  className="text-xs md:text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Tabs - Compact */}
            <div className="flex flex-wrap gap-1 mb-4">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded text-sm transition-all ${activeTab === 'all' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All ({allDrivesCount})
              </button>
              <button
                onClick={() => handleTabChange('today')}
                className={`px-3 py-1.5 rounded text-sm transition-all flex items-center gap-1 ${activeTab === 'today' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <CalendarDays size={14} />
                Today ({todayDrivesCount})
              </button>
              <button
                onClick={() => handleTabChange('featured')}
                className={`px-3 py-1.5 rounded text-sm transition-all flex items-center gap-1 ${activeTab === 'featured' ? 'bg-yellow-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Star size={14} />
                Featured ({featuredDrivesCount})
              </button>
              <button
                onClick={() => handleTabChange('upcoming')}
                className={`px-3 py-1.5 rounded text-sm transition-all flex items-center gap-1 ${activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <TrendingUp size={14} />
                Upcoming ({upcomingDrivesCount})
              </button>
            </div>
          </div>

          {/* Drives Grid - 3 DRIVES PER PAGE */}
          <div>
            {filteredDrives.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">No drives found</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {activeTab === 'all' && "Try adjusting your search terms"}
                  {activeTab === 'today' && "No drives scheduled for today"}
                  {activeTab === 'featured' && "No featured drives available"}
                  {activeTab === 'upcoming' && "No upcoming drives scheduled"}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button 
                    onClick={() => handleTabChange('all')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded text-sm hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    View All Drives
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentDrives.map(drive => (
                    <DriveCard 
                      key={drive.id} 
                      drive={drive} 
                      onShare={handleShare}
                      onRegister={handleRegisterClick}
                      onSave={handleSaveDrive}
                      saved={savedDrives.includes(drive.id || '')}
                      expandedDrives={expandedDrives}
                      toggleExpandDrive={toggleExpandDrive}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-3">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        <ChevronLeft size={14} />
                        <span className="hidden xs:inline">Previous</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-2 py-1 rounded text-sm ${currentPage === pageNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 3 && currentPage < totalPages - 1 && (
                          <>
                            <span className="px-1">...</span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className={`px-2 py-1 rounded text-sm ${currentPage === totalPages ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        <span className="hidden xs:inline">Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Showing {indexOfFirstDrive + 1} - {Math.min(indexOfLastDrive, filteredDrives.length)} of {filteredDrives.length}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Newsletter Signup - Simplified */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-3 md:mb-0">
                <h3 className="font-bold text-green-800 text-sm md:text-base mb-1">Get Drive Alerts</h3>
                <p className="text-green-700 text-xs">
                  Notifications for upcoming drives
                </p>
              </div>
              <form 
                onSubmit={handleNewsletterSignup}
                className="flex gap-2 w-full md:w-auto"
              >
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Navigation to other sections - Simplified */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link 
              to="/job-applications"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
              onClick={() => {
                trackFirebaseButtonClick('navigate_job_applications', 'bottom_nav', '/job-drives');
                trackUserFlow('job_drives', 'job_applications', 'bottom_navigation');
              }}
            >
              <h3 className="font-bold text-blue-800 text-sm mb-1">Latest Job Applications</h3>
              <p className="text-blue-700 text-xs">Fresh job postings from top companies</p>
            </Link>
            <Link 
              to="/government-exams"
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
              onClick={() => {
                trackFirebaseButtonClick('navigate_government_exams', 'bottom_nav', '/job-drives');
                trackUserFlow('job_drives', 'government_exams', 'bottom_navigation');
              }}
            >
              <h3 className="font-bold text-green-800 text-sm mb-1">Government Exams</h3>
              <p className="text-green-700 text-xs">Latest Sarkari Naukri exams</p>
            </Link>
            <Link 
              to="/blog"
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
              onClick={() => {
                trackFirebaseButtonClick('navigate_career_blog', 'bottom_nav', '/job-drives');
                trackUserFlow('job_drives', 'blog', 'bottom_navigation');
              }}
            >
              <h3 className="font-bold text-purple-800 text-sm mb-1">Career Blog</h3>
              <p className="text-purple-700 text-xs">Resume tips and career advice</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Share Drive</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-1">{selectedDrive.title}</h4>
                <p className="text-sm text-gray-600">{selectedDrive.company} • {selectedDrive.location}</p>
              </div>

              {/* Native Share Button */}
              {typeof navigator.share === 'function' && (
                <button
                  onClick={nativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share via Device
                </button>
              )}

              {/* Social Sharing Options */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center justify-center p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={20} />
                  <span className="text-xs mt-1">Facebook</span>
                </button>
                
                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center justify-center p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={20} />
                  <span className="text-xs mt-1">Twitter</span>
                </button>
                
                <button
                  onClick={shareOnLinkedIn}
                  className="flex flex-col items-center justify-center p-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={20} />
                  <span className="text-xs mt-1">LinkedIn</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
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

              <div className="flex gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    trackGoogleButtonClick('register_from_share', 'share_modal', 'job_drives');
                    trackFirebaseButtonClick('register_from_share', 'share_modal', '/job-drives');
                    trackFunnelStep('job_drive_registration', 'registration_started_from_share', 2.2, {
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      drive_id: selectedDrive.id,
                      source: 'share_modal'
                    });
                    
                    if (selectedDrive.registrationLink || selectedDrive.applyLink) {
                      const url = selectedDrive.registrationLink || selectedDrive.applyLink;
                      if (url.startsWith('http') || url.startsWith('mailto:')) {
                        handleRegisterClick(selectedDrive);
                      }
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Drive Card Component - PROFESSIONAL DESIGN
const DriveCard: React.FC<{ 
  drive: JobDrive; 
  onShare: (drive: JobDrive) => void; 
  onRegister: (drive: JobDrive) => void;
  onSave: (driveId: string, driveTitle: string, company: string) => void;
  saved: boolean;
  expandedDrives: Record<string, boolean>;
  toggleExpandDrive: (driveId: string, e?: React.MouseEvent) => void;
}> = ({ 
  drive, 
  onShare, 
  onRegister,
  onSave,
  saved,
  expandedDrives,
  toggleExpandDrive,
}) => {
  const { trackButtonClick: trackGoogleButtonClick, trackExternalLink } = useGoogleAnalytics();
  const { trackButtonClick: trackFirebaseButtonClick, trackFirebaseEvent, trackWalkinDriveView } = useFirebaseAnalytics();
  
  const isUpcoming = new Date(drive.date) >= new Date();
  const isToday = new Date(drive.date).toDateString() === new Date().toDateString();
  const isRecent = drive.addedTimestamp && (Date.now() - drive.addedTimestamp) < 24 * 60 * 60 * 1000;
  const isExpanded = expandedDrives[drive.id || ''] || false;

  const handleDetailsClick = () => {
    trackGoogleButtonClick('view_drive_details', 'drive_card', 'job_drives');
    trackFirebaseButtonClick('view_drive_details', 'drive_card', '/job-drives');
    
    if (drive.applyLink && drive.applyLink.startsWith('http')) {
      trackExternalLink('Drive Details', drive.applyLink, 'job_drives');
    }
  };

  const handleRegister = () => {
    onRegister(drive);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare(drive);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave(drive.id || '', drive.title, drive.company);
  };

  // Track drive view on mount
  useEffect(() => {
    // Firebase Analytics - track drive view
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFirebaseEvent(
      'job_drive_viewed',
      'Job Drives',
      drive.id || 'unknown',
      {
        drive_id: drive.id,
        drive_title: drive.title,
        company: drive.company,
        location: drive.location,
        date: drive.date,
        is_featured: !!drive.featured,
        is_today: isToday,
        is_upcoming: isUpcoming,
        user_id: userId,
        timestamp: new Date().toISOString()
      }
    );

    // Track walkin drive view
    trackWalkinDriveView(drive.id || '', drive.title, drive.company);
  }, [drive.id]);

  // Check if description is long enough to need "See More"
  const descriptionLength = drive.description.length;
  const showSeeMoreDescription = descriptionLength > 80;
  const displayedDescription = isExpanded || !showSeeMoreDescription 
    ? drive.description 
    : drive.description.substring(0, 80) + '...';

  // Check if eligibility list is long enough to need "See More"
  const eligibilityLength = drive.eligibility?.length || 0;
  const showSeeMoreEligibility = eligibilityLength > 2;
  const displayedEligibility = isExpanded || !showSeeMoreEligibility 
    ? drive.eligibility 
    : drive.eligibility?.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col">
      {/* Drive Header - Simplified */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 mb-1">
              {drive.featured && (
                <span className="text-xs font-medium text-amber-600">
                  ★ Featured
                </span>
              )}
              {isToday && (
                <span className="text-xs font-medium text-green-600">
                  • Today
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleSaveClick}
              className={`p-1 ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              title={saved ? 'Remove from saved' : 'Save drive'}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShareClick}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Share this drive"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Drive Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-800 line-clamp-2">{drive.title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
            {new Date(drive.addedTimestamp || drive.date).toLocaleDateString('en-IN')}
          </span>
        </div>
        
        <div className="flex items-center text-gray-700 mb-3">
          <Building size={14} className="mr-1.5 text-green-600 flex-shrink-0" />
          <span className="font-medium text-sm truncate">{drive.company}</span>
        </div>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <MapPin size={12} className="mr-1.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{drive.location}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Calendar size={12} className="mr-1.5 text-purple-600 flex-shrink-0" />
            <span className="truncate">
              {new Date(drive.date).toLocaleDateString('en-IN', { 
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Clock size={12} className="mr-1.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">{drive.time}</span>
          </div>
        </div>

        {/* Description with See More */}
        <div className="mb-3">
          <p className="text-xs text-gray-600">
            {displayedDescription}
            {showSeeMoreDescription && (
              <button
                onClick={(e) => toggleExpandDrive(drive.id || '', e)}
                className="ml-1 text-green-600 hover:text-green-800 font-medium text-xs inline-flex items-center"
              >
                {isExpanded ? 'Less' : 'More'}
                {isExpanded ? <ChevronUp size={12} className="ml-0.5" /> : <ChevronDown size={12} className="ml-0.5" />}
              </button>
            )}
          </p>
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {drive.experience && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
              {drive.experience}
            </span>
          )}
          {drive.salary && (
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
              {drive.salary}
            </span>
          )}
        </div>

        {/* Eligibility Preview with See More */}
        {drive.eligibility && drive.eligibility.length > 0 && (
          <div className="mb-3">
            <div className="space-y-0.5">
              {displayedEligibility?.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-600 mr-1 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-xs text-gray-700 line-clamp-1">{item}</span>
                </div>
              ))}
              {showSeeMoreEligibility && !isExpanded && (
                <button
                  onClick={(e) => toggleExpandDrive(drive.id || '', e)}
                  className="text-green-600 hover:text-green-800 font-medium text-xs inline-flex items-center"
                >
                  +{eligibilityLength - 2} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Drive Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-3 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-2">
            {(drive.views || drive.views === 0) && (
              <span className="flex items-center gap-0.5">
                <Eye size={10} />
                {drive.views}
              </span>
            )}
            {(drive.registrations || drive.registrations === 0) && (
              <span className="flex items-center gap-0.5">
                <Users size={10} />
                {drive.registrations}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleShareClick}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition-colors flex items-center justify-center text-xs"
          >
            <Share2 size={14} className="mr-1" />
            Share
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center text-xs"
          >
            <ExternalLink size={14} className="mr-1" />
            Register
          </button>
        </div>
        
        {/* Contact Info */}
        {drive.contact && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 break-words">
              📞 {drive.contact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;