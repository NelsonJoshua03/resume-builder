// src/components/JobDrives.tsx - UPDATED WITH FIREBASE INTEGRATION AND PROPER SORTING
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { firebaseDriveService } from '../firebase/driveService';
import type { JobDriveData } from '../firebase/driveService';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  Building,
  ExternalLink,
  Filter,
  RefreshCw,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  X,
  ArrowRight,
  Eye,
  Star,
  TrendingUp,
  CalendarDays,
  Search,
  Users,
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface DriveFilters {
  location?: string;
  driveType?: string;
  featured?: boolean;
  isActive?: boolean;
  searchTerm?: string;
}

const JobDrives: React.FC = () => {
  const [drives, setDrives] = useState<JobDriveData[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<JobDriveData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [driveTypeFilter, setDriveTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showNewsletterSignup, setShowNewsletterSignup] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedDrives, setExpandedDrives] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'featured' | 'upcoming' | 'latest'>('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayDrivesCount, setTodayDrivesCount] = useState(0);
  const [featuredDrivesCount, setFeaturedDrivesCount] = useState(0);
  const [upcomingDrivesCount, setUpcomingDrivesCount] = useState(0);
  const [latestDrivesCount, setLatestDrivesCount] = useState(0);

  // Analytics hooks
  const { 
    trackDailyPageView,
    trackJobDriveView,
    trackJobDriveRegistration 
  } = useEnhancedAnalytics();
  
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
    trackUserFlow
  } = useFirebaseAnalytics();

  // Track page view on mount
  useEffect(() => {
    // Enhanced Analytics
    trackDailyPageView('Job Drives', '/job-drives');
    
    // Firebase Analytics
    trackFirebasePageView('/job-drives', 'Job Drives');
    
    // Track funnel entry
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    trackFunnelStep('job_drives_funnel', 'page_viewed', 1, {
      user_id: userId,
      page_path: '/job-drives',
      source: document.referrer || 'direct'
    });

    // Load drives from Firebase
    loadDrivesFromFirebase();
  }, []);

  // Load drives from Firebase and sort by latest posted date
  const loadDrivesFromFirebase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading drives from Firebase...');
      const result = await firebaseDriveService.getDrives({}, 1, 1000); // Get all drives
      
      // Sort by created date (newest first) - FIXED SORTING
      const sortedDrives = result.drives.sort((a, b) => {
        // First try to use createdAt timestamp
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 
                     (a.addedTimestamp || new Date(a.date).getTime());
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 
                     (b.addedTimestamp || new Date(b.date).getTime());
        
        // If dates are the same, sort by title for consistency
        if (dateB === dateA) {
          return a.title.localeCompare(b.title);
        }
        
        return dateB - dateA; // Descending order (newest first)
      });
      
      setDrives(sortedDrives);
      
      // Calculate counts
      const today = new Date().toISOString().split('T')[0];
      const todayCount = sortedDrives.filter(d => d.date === today).length;
      const featuredCount = sortedDrives.filter(d => d.featured).length;
      const upcomingCount = sortedDrives.filter(d => new Date(d.date) > new Date() && d.date !== today).length;
      
      // Latest drives (posted in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const latestCount = sortedDrives.filter(d => {
        const driveDate = d.createdAt ? new Date(d.createdAt) : 
                         (d.addedTimestamp ? new Date(d.addedTimestamp) : new Date(d.date));
        return driveDate >= sevenDaysAgo;
      }).length;
      
      setTodayDrivesCount(todayCount);
      setFeaturedDrivesCount(featuredCount);
      setUpcomingDrivesCount(upcomingCount);
      setLatestDrivesCount(latestCount);
      
      setLastUpdated(new Date().toLocaleString('en-IN'));
      console.log(`✅ Loaded ${sortedDrives.length} drives from Firebase, sorted by latest`);
      
    } catch (error) {
      console.error('Error loading drives from Firebase:', error);
      setError('Failed to load drives. Please try again.');
      
      // Fallback to localStorage with proper sorting
      try {
        const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
        // Sort localStorage drives by addedTimestamp or date
        const sortedLocalDrives = savedDrives.sort((a: any, b: any) => {
          const dateA = a.addedTimestamp || new Date(a.date).getTime();
          const dateB = b.addedTimestamp || new Date(b.date).getTime();
          return dateB - dateA; // Descending order
        });
        setDrives(sortedLocalDrives);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh drives
  const handleRefresh = async () => {
    await loadDrivesFromFirebase();
    
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

  // Filter drives based on all criteria
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchTerm === '' || 
      drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drive.description && drive.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
    const isToday = drive.date === new Date().toISOString().split('T')[0];
    const isUpcoming = new Date(drive.date) > new Date() && !isToday;
    const isLatest = () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const driveDate = drive.createdAt ? new Date(drive.createdAt) : 
                       (drive.addedTimestamp ? new Date(drive.addedTimestamp) : new Date(drive.date));
      return driveDate >= sevenDaysAgo;
    };
    
    if (activeTab === 'today') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && isToday;
    } else if (activeTab === 'featured') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && drive.featured;
    } else if (activeTab === 'upcoming') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && isUpcoming;
    } else if (activeTab === 'latest') {
      return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured && isLatest();
    }
    
    // 'all' tab
    return matchesSearch && matchesLocation && matchesCategory && matchesDriveType && matchesFeatured;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const handleShare = (drive: JobDriveData) => {
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

  const handleRegisterClick = async (drive: JobDriveData) => {
    // Enhanced Analytics
    trackJobDriveRegistration(drive.id || 'unknown', drive.title, drive.company);
    
    // Google Analytics
    trackGoogleButtonClick('register_drive', 'drive_card', 'job_drives');
    
    // Firebase Analytics
    trackFirebaseButtonClick('register_drive', 'drive_card', '/job-drives');
    
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
    setActiveTab('latest');
    
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
      trackGoogleSocialShare(platform, 'job_drive', selectedDrive.id || 'unknown');
      
      // Firebase Analytics
      trackFirebaseSocialShare(platform, 'job_drive', selectedDrive.id || 'unknown');
      
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
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedDrive(null);
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
      setShowNewsletterSignup(false);
      
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
    filteredDrives.forEach(drive => {
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
        drive_count: filteredDrives.length,
        timestamp: new Date().toISOString()
      }
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'today' | 'featured' | 'upcoming' | 'latest') => {
    setActiveTab(tab);
    
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

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format time ago for posted date
  const getTimeAgo = (date: Date | string | number) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date.toString());
    }
  };

  return (
    <>
      {/* Enhanced SEO Implementation */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>📅 Latest Walk-in Drives & Job Fairs in India 2025 | Immediate Hiring | CareerCraft.in</title>
        <meta name="description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Updated daily. Direct company interviews for IT, engineering, and business roles. Register today!" />
        <meta name="keywords" content="latest walk-in drives India 2025, today walk-in interview, immediate hiring, job fairs Bangalore, walk-in Mumbai, walk-in Delhi, fresher drives, campus placement drive, IT jobs walk-in, engineering job fairs, government job drives 2025" />
        <link rel="canonical" href="https://careercraft.in/job-drives" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="📅 Latest Walk-in Drives & Job Fairs in India 2025 | Immediate Hiring | CareerCraft.in" />
        <meta property="og:description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Updated daily. Direct company interviews for IT, engineering, and business roles." />
        <meta property="og:url" content="https://careercraft.in/job-drives" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="📅 Latest Walk-in Drives & Job Fairs in India 2025 | Immediate Hiring | CareerCraft.in" />
        <meta name="twitter:description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="CareerCraft India" />
        <meta name="language" content="EN" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Organization Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
        
        {/* Event Structured Data for top drives */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Latest Walk-in Drives & Job Fairs in India 2025",
            "description": "Daily updated walk-in drives and job fairs from top Indian companies",
            "url": "https://careercraft.in/job-drives",
            "numberOfItems": drives.length,
            "itemListElement": drives.slice(0, 10).map((drive, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Event",
                "name": drive.title,
                "description": drive.description ? drive.description.substring(0, 150) + "..." : "Walk-in drive opportunity",
                "startDate": drive.date,
                "endDate": drive.date,
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "eventStatus": "https://schema.org/EventScheduled",
                "location": {
                  "@type": "Place",
                  "name": drive.location,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": drive.location,
                    "addressCountry": "IN"
                  }
                },
                "organizer": {
                  "@type": "Organization",
                  "name": drive.company
                },
                "offers": {
                  "@type": "Offer",
                  "url": drive.applyLink || drive.registrationLink || "https://careercraft.in/job-drives",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12">
        <div className="container mx-auto px-4 text-center max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-green-100 hover:text-white text-sm"
              onClick={() => {
                trackFirebaseButtonClick('back_to_home', 'navigation', '/job-drives');
                trackUserFlow('job_drives', 'home', 'navigation');
              }}
            >
              <ArrowRight className="rotate-180" size={16} />
              Back to Home
            </Link>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors text-sm"
              title="Refresh latest drives"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Latest Walk-in Drives in India</h1>
          <p className="text-lg max-w-3xl mx-auto mb-6">
            Fresh immediate hiring opportunities with direct company interviews
            <span className="block text-sm text-green-200 mt-2">Sorted by newest first • Updated: {lastUpdated}</span>
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-xl p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Job title, company or keyword..."
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
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                >
                  <Search size={20} className="inline mr-2" />
                  Search Drives
                </button>
              </div>
            </div>
            
            {/* Filter Toggle */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowFilters(!showFilters);
                  trackFirebaseButtonClick('toggle_filters', 'filters', '/job-drives');
                }}
                className="text-green-700 hover:text-green-800 text-sm flex items-center justify-center gap-2 mx-auto"
              >
                <Filter size={16} />
                {showFilters ? 'Hide Filters' : 'Show More Filters'}
              </button>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 text-left">Category</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
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
                    <label className="block text-sm text-gray-700 mb-1 text-left">Drive Type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      value={driveTypeFilter}
                      onChange={(e) => setDriveTypeFilter(e.target.value)}
                    >
                      {driveTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </option>
                      ))}
                    </select>
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

          {/* Stats */}
          <div className="mt-6 grid grid-cols-5 gap-2 max-w-4xl mx-auto">
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('latest')}
            >
              <div className="text-xl font-bold">{latestDrivesCount}</div>
              <div className="text-green-100 text-xs flex items-center justify-center gap-1">
                <Sparkles size={10} />
                Latest
              </div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('all')}
            >
              <div className="text-xl font-bold">{drives.length}</div>
              <div className="text-green-100 text-xs">Total</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('today')}
            >
              <div className="text-xl font-bold">{todayDrivesCount}</div>
              <div className="text-green-100 text-xs">Today</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('upcoming')}
            >
              <div className="text-xl font-bold">{upcomingDrivesCount}</div>
              <div className="text-green-100 text-xs">Upcoming</div>
            </div>
            <div 
              className="bg-white/20 backdrop-blur-sm px-2 py-2 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors" 
              onClick={() => handleTabChange('featured')}
            >
              <div className="text-xl font-bold">{featuredDrivesCount}</div>
              <div className="text-green-100 text-xs">Featured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Loading/Error State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading drives from Firebase...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <X className="text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Tabs Header */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {activeTab === 'all' && 'All Walk-in Drives'}
                      {activeTab === 'today' && "Today's Walk-in Drives"}
                      {activeTab === 'upcoming' && 'Upcoming Walk-in Drives'}
                      {activeTab === 'featured' && 'Featured Drives'}
                      {activeTab === 'latest' && 'Latest Posted Drives'}
                      <span className="text-gray-600 text-base ml-2">({filteredDrives.length})</span>
                    </h2>
                    <p className="text-gray-600 text-xs mt-1">
                      Sorted by newest first • Updated: {lastUpdated}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleExpandAll}
                      className="text-xs text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} />
                      {Object.values(expandedDrives).every(val => val) ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 mb-4">
                  <button
                    onClick={() => handleTabChange('latest')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'latest' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Sparkles size={14} />
                    Latest ({latestDrivesCount})
                  </button>
                  <button
                    onClick={() => handleTabChange('today')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'today' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <CalendarDays size={14} />
                    Today ({todayDrivesCount})
                  </button>
                  <button
                    onClick={() => handleTabChange('upcoming')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <TrendingUp size={14} />
                    Upcoming ({upcomingDrivesCount})
                  </button>
                  <button
                    onClick={() => handleTabChange('featured')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'featured' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Star size={14} />
                    Featured ({featuredDrivesCount})
                  </button>
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All ({drives.length})
                  </button>
                </div>
              </div>

              {/* Drives Grid */}
              <div>
                {filteredDrives.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No drives found</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {searchTerm || locationFilter || categoryFilter !== 'all' 
                        ? 'Try adjusting your search terms' 
                        : 'No drives available. Check back later for new job drives.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button 
                        onClick={handleClearFilters}
                        className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300 transition-colors"
                      >
                        Clear All Filters
                      </button>
                      <Link 
                        to="/admin/job-drives"
                        onClick={() => {
                          trackGoogleCTAClick('add_first_drive', 'empty_state', 'job_drives');
                          trackFirebaseCTAClick('add_first_drive', 'empty_state', '/job-drives');
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-1.5 rounded text-sm hover:from-yellow-600 hover:to-amber-600 transition-all"
                      >
                        Add New Drive
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDrives.map(drive => (
                      <DriveCard 
                        key={drive.id} 
                        drive={drive} 
                        onShare={handleShare}
                        onRegister={handleRegisterClick}
                        expandedDrives={expandedDrives}
                        toggleExpandDrive={toggleExpandDrive}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-bold text-green-800 text-sm mb-1">📬 Get Drive Alerts</h3>
                    <p className="text-green-700 text-xs">
                      We'll notify you about upcoming walk-in drives in your city
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
                      className="flex-1 px-3 py-1.5 rounded border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-green-600 text-white px-4 py-1.5 rounded font-medium hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
                    >
                      Get Alerts
                    </button>
                  </form>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link 
                  to="/job-applications"
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    trackFirebaseButtonClick('navigate_job_applications', 'bottom_nav', '/job-drives');
                    trackUserFlow('job_drives', 'job_applications', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-blue-800 mb-1 text-sm">📄 Latest Job Applications</h3>
                  <p className="text-blue-700 text-xs">Browse fresh job postings from top Indian companies</p>
                </Link>
                <Link 
                  to="/government-exams"
                  className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
                  onClick={() => {
                    trackFirebaseButtonClick('navigate_government_exams', 'bottom_nav', '/job-drives');
                    trackUserFlow('job_drives', 'government_exams', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-green-800 mb-1 text-sm">🏛️ Government Exams</h3>
                  <p className="text-green-700 text-xs">Latest Sarkari Naukri exams and notifications</p>
                </Link>
                <Link 
                  to="/blog"
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                  onClick={() => {
                    trackFirebaseButtonClick('navigate_career_blog', 'bottom_nav', '/job-drives');
                    trackUserFlow('job_drives', 'blog', 'bottom_navigation');
                  }}
                >
                  <h3 className="font-bold text-purple-800 mb-1 text-sm">📝 Career Blog</h3>
                  <p className="text-purple-700 text-xs">Resume tips and career advice for Indian job market</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Share Drive</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-1 text-sm">{selectedDrive.title}</h4>
                <p className="text-xs text-gray-600">{selectedDrive.company} • {selectedDrive.location}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {formatDate(selectedDrive.date)} at {selectedDrive.time}</p>
              </div>

              {/* Social Sharing Options */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center justify-center p-3 bg-[#1877F2] text-white rounded hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={18} />
                  <span className="text-xs mt-1">Facebook</span>
                </button>
                
                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center justify-center p-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={18} />
                  <span className="text-xs mt-1">Twitter/X</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
                  className="flex flex-col items-center justify-center p-3 bg-[#25D366] text-white rounded hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={18} />
                  <span className="text-xs mt-1">WhatsApp</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    trackGoogleButtonClick('register_from_share', 'share_modal', 'job_drives');
                    trackFirebaseButtonClick('register_from_share', 'share_modal', '/job-drives');
                    
                    if (selectedDrive.registrationLink || selectedDrive.applyLink) {
                      const url = selectedDrive.registrationLink || selectedDrive.applyLink;
                      if (url && url.startsWith('http')) {
                        handleRegisterClick(selectedDrive);
                      }
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded font-medium hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
                >
                  <ExternalLink size={14} className="inline mr-1" />
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

// Drive Card Component
const DriveCard: React.FC<{ 
  drive: JobDriveData; 
  onShare: (drive: JobDriveData) => void; 
  onRegister: (drive: JobDriveData) => void;
  expandedDrives: Record<string, boolean>;
  toggleExpandDrive: (driveId: string, e?: React.MouseEvent) => void;
}> = ({ 
  drive, 
  onShare, 
  onRegister,
  expandedDrives,
  toggleExpandDrive,
}) => {
  const { trackJobDriveView } = useEnhancedAnalytics();
  const { trackButtonClick: trackGoogleButtonClick, trackExternalLink } = useGoogleAnalytics();
  const { trackButtonClick: trackFirebaseButtonClick, trackFirebaseEvent } = useFirebaseAnalytics();
  
  const isUpcoming = new Date(drive.date) > new Date();
  const isToday = drive.date === new Date().toISOString().split('T')[0];
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

  // Track drive view on mount
  useEffect(() => {
    // Enhanced Analytics
    trackJobDriveView(drive.id || 'unknown', drive.title, 'drive_listing');
    
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
        is_today: isToday,
        is_upcoming: isUpcoming,
        user_id: userId,
        timestamp: new Date().toISOString()
      }
    );
  }, [drive.id]);

  // Format the title to show only the walk-in drive info
  const formatTitle = (title: string) => {
    const simpleTitle = title.split('|')[0].trim();
    return simpleTitle.length > 60 ? simpleTitle.substring(0, 60) + '...' : simpleTitle;
  };

  // Get simplified description (first 80 chars only)
  const getSimpleDescription = () => {
    const lines = drive.description ? drive.description.split('\n') : [];
    const firstLine = lines[0] || drive.description || 'Walk-in drive opportunity';
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Get time ago for posted date
  const getPostedTimeAgo = () => {
    if (drive.createdAt) {
      const postedDate = new Date(drive.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - postedDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return formatDate(drive.createdAt.toString());
      }
    } else if (drive.addedTimestamp) {
      const postedDate = new Date(drive.addedTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - postedDate.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      return `${diffDays}d ago`;
    }
    return '';
  };

  // Check if drive is newly posted (less than 24 hours)
  const isNewDrive = () => {
    if (drive.createdAt) {
      const postedDate = new Date(drive.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - postedDate.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      return diffHours < 24;
    }
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 relative">
      {/* NEW badge for recently posted drives */}
      {isNewDrive() && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          NEW
        </div>
      )}
      
      {/* Drive Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
              {formatTitle(drive.title)}
            </h3>
            <div className="flex items-center text-gray-700">
              <Building size={14} className="mr-1.5 text-green-600 flex-shrink-0" />
              <span className="text-xs truncate">{drive.company}</span>
            </div>
          </div>
          <button
            onClick={handleShareClick}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Share this drive"
          >
            <Share2 size={16} />
          </button>
        </div>
        
        {/* Quick Info */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>{formatDate(drive.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            {isToday && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                TODAY
              </span>
            )}
            {drive.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                FEATURED
              </span>
            )}
          </div>
        </div>
        
        {/* Posted time info */}
        {getPostedTimeAgo() && (
          <div className="mt-1 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded">Posted {getPostedTimeAgo()}</span>
          </div>
        )}
      </div>

      {/* Drive Content */}
      <div className="p-4">
        {/* Location and Time */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <MapPin size={12} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{drive.location}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Clock size={12} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{drive.time}</span>
          </div>
          {drive.experience && (
            <div className="flex items-center text-xs text-gray-600">
              <Users size={12} className="mr-1.5 flex-shrink-0" />
              <span className="truncate">{drive.experience}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        <div className="mb-3">
          <p className="text-xs text-gray-700 line-clamp-2">
            {getSimpleDescription()}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            {drive.views !== undefined && (
              <span className="flex items-center">
                <Eye size={10} className="mr-1" />
                {drive.views} views
              </span>
            )}
            {drive.registrations !== undefined && (
              <span className="flex items-center">
                <Users size={10} className="mr-1" />
                {drive.registrations} registered
              </span>
            )}
          </div>
          {drive.createdAt && (
            <span className="text-xs text-gray-400">
              {getPostedTimeAgo()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => toggleExpandDrive(drive.id || '', e)}
            className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Eye size={12} className="mr-1" />
            {isExpanded ? 'See Less' : 'See More'}
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-1.5 rounded text-xs font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center"
          >
            <ExternalLink size={12} className="mr-1" />
            Register
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Full Description */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-800 mb-1">Description:</h4>
              <p className="text-xs text-gray-700 whitespace-pre-line">{drive.description || 'No description available.'}</p>
            </div>

            {/* Eligibility */}
            {drive.eligibility && drive.eligibility.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Eligibility:</h4>
                <div className="space-y-0.5">
                  {drive.eligibility.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-600 mr-1 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-xs text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {drive.documents && drive.documents.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Documents Required:</h4>
                <div className="space-y-0.5">
                  {drive.documents.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-blue-600 mr-1 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-xs text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {drive.contact && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Contact:</h4>
                <p className="text-xs text-gray-700">{drive.contact}</p>
              </div>
            )}

            {/* Experience and Salary */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {drive.experience && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                  Exp: {drive.experience}
                </span>
              )}
              {drive.salary && (
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                  {drive.salary}
                </span>
              )}
              {drive.expectedCandidates && (
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                  Expected: {drive.expectedCandidates} candidates
                </span>
              )}
            </div>

            {/* Drive Type */}
            {drive.driveType && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Drive Type:</h4>
                <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                  {drive.driveType}
                </span>
              </div>
            )}

            {/* Additional Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleShareClick}
                className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Share2 size={12} className="mr-1" />
                Share
              </button>
              {drive.applyLink && (
                <a
                  href={drive.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDetailsClick}
                  className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  View Details
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;