// src/components/JobDrives.tsx - FIXED NAVIGATION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
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
  ArrowRight
} from 'lucide-react';

interface JobDrive {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  time: string;
  image: string;
  description: string;
  eligibility: string[];
  documents: string[];
  applyLink: string;
  contact: string;
  featured?: boolean;
  addedTimestamp?: number;
  expectedCandidates?: number;
  registrationLink?: string;
  driveType?: string;
  experience?: string;
  salary?: string;
}

const JobDrives: React.FC = () => {
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<JobDrive | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [driveTypeFilter, setDriveTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNewsletterSignup, setShowNewsletterSignup] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const { 
    trackDailyPageView,
    trackJobDriveView,
    trackJobDriveRegistration 
  } = useEnhancedAnalytics();
  
  const { 
    trackButtonClick, 
    trackSocialShare, 
    trackCTAClick,
    trackExternalLink 
  } = useGoogleAnalytics();

  // Clean up old drives (older than 3 months) and load drives
  const loadAndCleanDrives = () => {
    // Load drives from localStorage
    const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    
    // Filter out drives older than 90 days (3 months)
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    
    const recentDrives = savedDrives.filter((drive: JobDrive) => {
      const driveTimestamp = drive.addedTimestamp || new Date(drive.date).getTime();
      return driveTimestamp >= ninetyDaysAgo;
    });
    
    // Update localStorage with only recent drives
    if (recentDrives.length !== savedDrives.length) {
      localStorage.setItem('jobDrives', JSON.stringify(recentDrives));
      console.log(`Auto-cleaned ${savedDrives.length - recentDrives.length} old drives (older than 90 days)`);
    }
    
    // Sort by addedTimestamp (newest first)
    const sortedDrives = recentDrives.sort((a: JobDrive, b: JobDrive) => {
      const timeA = a.addedTimestamp || new Date(a.date).getTime();
      const timeB = b.addedTimestamp || new Date(b.date).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
    
    setDrives(sortedDrives);
    setLastUpdated(new Date().toLocaleString('en-IN'));
    
    // Track cleanup if needed
    if (recentDrives.length !== savedDrives.length) {
      trackButtonClick('auto_clean_drives', 'system', 'job_drives');
    }
  };

  // Load drives on component mount
  useEffect(() => {
    trackDailyPageView('Job Drives', '/job-drives');
    loadAndCleanDrives();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [trackDailyPageView]);

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
    
    return matchesSearch && matchesLocation && matchesCategory && matchesDriveType;
  });

  const featuredDrives = drives.filter(drive => drive.featured);
  const upcomingDrives = drives.filter(drive => new Date(drive.date) >= new Date());
  const todayDrives = drives.filter(drive => 
    new Date(drive.date).toDateString() === new Date().toDateString()
  );
  const recentDrives = drives.filter(drive => {
    const driveDate = new Date(drive.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return driveDate >= weekAgo && driveDate <= new Date();
  });

  const handleShare = (drive: JobDrive) => {
    setSelectedDrive(drive);
    setShowShareModal(true);
    trackButtonClick('share_drive', 'drive_card', 'job_drives');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackButtonClick('search_drives', 'search_form', 'job_drives');
  };

  const handleRegisterClick = (drive: JobDrive) => {
    trackJobDriveRegistration(drive.id, drive.title, drive.company);
    trackButtonClick('register_drive', 'drive_card', 'job_drives');
    
    // Handle external links properly
    if (drive.registrationLink || drive.applyLink) {
      const url = drive.registrationLink || drive.applyLink;
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
        trackExternalLink('Drive Registration', url, 'job_drives');
      } else {
        // If it's not a proper URL, don't navigate
        console.warn('Invalid URL for drive:', drive.title, url);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('all');
    setDriveTypeFilter('all');
    trackButtonClick('clear_filters', 'filters', 'job_drives');
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/job-drives${selectedDrive ? `?drive=${selectedDrive.id}` : ''}`
    : '';

  const handleSocialShare = (platform: string) => {
    if (selectedDrive) {
      trackSocialShare(platform, 'job_drive', selectedDrive.id);
    }
  };

  const handleRefresh = () => {
    loadAndCleanDrives();
    trackButtonClick('refresh_drives', 'refresh', 'job_drives');
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
      trackButtonClick('copy_drive_link', 'share_modal', 'job_drives');
      trackSocialShare('copy_link', 'job_drive', selectedDrive.id);
      
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
        trackSocialShare('native', 'job_drive', selectedDrive.id);
        trackButtonClick('native_share', 'share_modal', 'job_drives');
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to custom share modal
      setShowShareModal(true);
    }
  };

  // Platform-specific sharing functions - FIXED URL encoding
  const shareOnFacebook = () => {
    if (selectedDrive) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      trackSocialShare('facebook', 'job_drive', selectedDrive.id);
      trackButtonClick('share_facebook', 'share_modal', 'job_drives');
    }
  };

  const shareOnTwitter = () => {
    if (selectedDrive) {
      const text = `Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company} in ${selectedDrive.location}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      trackSocialShare('twitter', 'job_drive', selectedDrive.id);
      trackButtonClick('share_twitter', 'share_modal', 'job_drives');
    }
  };

  const shareOnLinkedIn = () => {
    if (selectedDrive) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      trackSocialShare('linkedin', 'job_drive', selectedDrive.id);
      trackButtonClick('share_linkedin', 'share_modal', 'job_drives');
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedDrive) {
      const text = `Check out this job drive on CareerCraft: ${selectedDrive.title} at ${selectedDrive.company} - ${shareUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      trackSocialShare('whatsapp', 'job_drive', selectedDrive.id);
      trackButtonClick('share_whatsapp', 'share_modal', 'job_drives');
    }
  };

  const shareViaEmail = () => {
    if (selectedDrive) {
      const subject = `Job Drive: ${selectedDrive.title} at ${selectedDrive.company}`;
      const body = `Check out this job drive on CareerCraft:\n\nDrive: ${selectedDrive.title}\nCompany: ${selectedDrive.company}\nLocation: ${selectedDrive.location}\nDate: ${new Date(selectedDrive.date).toLocaleDateString()}\nTime: ${selectedDrive.time}\n\nView details: ${shareUrl}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
      trackSocialShare('email', 'job_drive', selectedDrive.id);
      trackButtonClick('share_email', 'share_modal', 'job_drives');
    }
  };

  // Newsletter signup
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackButtonClick('newsletter_signup_drives', 'newsletter', 'job_drives');
      alert(`Thank you! You'll receive drive alerts at ${newsletterEmail}`);
      setNewsletterEmail('');
      setShowNewsletterSignup(false);
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('drive_subscribers') || '[]');
      subscribers.push({ email: newsletterEmail, date: new Date().toISOString() });
      localStorage.setItem('drive_subscribers', JSON.stringify(subscribers));
    }
  };

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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-green-100 hover:text-white"
            >
              <ArrowRight className="rotate-180" size={18} />
              Back to Home
            </Link>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
              title="Refresh latest drives"
            >
              <RefreshCw size={18} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Walk-in Drives & Job Fairs in India</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Fresh immediate hiring opportunities with direct company interviews across India
            <span className="block text-sm text-green-200 mt-2">Auto-cleaned every 90 days • Updated: {lastUpdated}</span>
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-xl p-4 shadow-2xl">
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
                  Find Latest Drives
                </button>
              </div>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm"
              >
                <Filter size={16} />
                {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{drives.length}</div>
              <div className="text-green-100 text-xs md:text-sm">Latest Drives</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{upcomingDrives.length}</div>
              <div className="text-green-100 text-xs md:text-sm">Upcoming</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{featuredDrives.length}</div>
              <div className="text-green-100 text-xs md:text-sm">Featured</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{todayDrives.length}</div>
              <div className="text-green-100 text-xs md:text-sm">Today</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{recentDrives.length}</div>
              <div className="text-green-100 text-xs md:text-sm">This Week</div>
            </div>
          </div>

          {/* Share CTA */}
          <div className="mt-6">
            <button
              onClick={() => {
                if (drives.length > 0) {
                  setSelectedDrive(drives[0]);
                  setShowShareModal(true);
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <Share2 size={20} />
              Share Latest Drives with Friends
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Link 
              to="/job-applications"
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <ArrowRight size={16} />
              View Job Applications
            </Link>
            <Link 
              to="/government-exams"
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <ArrowRight size={16} />
              View Government Exams
            </Link>
            <Link 
              to="/blog"
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <ArrowRight size={16} />
              View Career Blog
            </Link>
          </div>

          {/* Quick Admin Access */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 text-lg mb-2">📊 Latest Drives Tracking Active</h3>
                <p className="text-yellow-700 text-sm mb-1">Drive views, registrations, and shares are being tracked in real-time</p>
                <p className="text-yellow-700 text-sm mb-1">Auto-cleaned every 90 days • Updated: {lastUpdated}</p>
                <p className="text-yellow-700 text-sm">Showing only drives from last 3 months</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
                <Link 
                  to="/admin/job-drives" 
                  onClick={() => {
                    trackCTAClick('admin_job_drives', 'admin_access', 'job_drives');
                    trackButtonClick('admin_panel', 'admin_cta', 'job_drives');
                  }}
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
                >
                  Add New Drive
                </Link>
                <Link 
                  to="/admin/daily-analytics" 
                  onClick={() => trackButtonClick('view_drive_analytics', 'analytics_cta', 'job_drives')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Drives */}
          {featuredDrives.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span> Latest Featured Drives
                </h2>
                <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-4 py-1 rounded-full font-semibold">
                  {featuredDrives.length} featured • Newest first
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDrives.slice(0, 6).map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                    onRegister={handleRegisterClick}
                    featured 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today's Drives */}
          {todayDrives.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-500">🔥</span> Today's Drives ({new Date().toLocaleDateString('en-IN')})
                </h2>
                <span className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-4 py-1 rounded-full font-semibold">
                  {todayDrives.length} drives today
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayDrives.map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                    onRegister={handleRegisterClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Drives */}
          {upcomingDrives.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-blue-500">📅</span> Latest Upcoming Drives
                </h2>
                <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-4 py-1 rounded-full font-semibold">
                  {upcomingDrives.length} upcoming
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingDrives.slice(0, 6).map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                    onRegister={handleRegisterClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Drives */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  All Latest Walk-in Drives in India
                  <span className="text-gray-600 text-lg ml-2">({filteredDrives.length})</span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Sorted by newest • Auto-cleaned every 90 days • Updated: {lastUpdated}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Page 1 of {Math.ceil(filteredDrives.length / 9)}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {filteredDrives.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No latest drives found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or check back later for new Indian job drives</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <Link 
                    to="/admin/job-drives"
                    onClick={() => trackCTAClick('add_first_drive', 'empty_state', 'job_drives')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Add First Drive
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDrives.slice(0, 9).map(drive => (
                    <DriveCard 
                      key={drive.id} 
                      drive={drive} 
                      onShare={handleShare}
                      onRegister={handleRegisterClick}
                    />
                  ))}
                </div>
                
                {/* Load More Button */}
                {filteredDrives.length > 9 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => trackButtonClick('load_more_drives', 'pagination', 'job_drives')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Load More Drives ({filteredDrives.length - 9} more)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-green-800 text-lg mb-2">📬 Get Drive Alerts</h3>
                <p className="text-green-700 text-sm">
                  We'll notify you about upcoming walk-in drives in your city
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
                  className="flex-1 px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Get Alerts
                </button>
              </form>
            </div>
          </div>

          {/* Navigation to other sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/job-applications"
              className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-bold text-blue-800 mb-2">📄 Latest Job Applications</h3>
              <p className="text-blue-700 text-sm">Browse fresh job postings from top Indian companies</p>
            </Link>
            <Link 
              to="/government-exams"
              className="bg-green-50 border border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors"
            >
              <h3 className="font-bold text-green-800 mb-2">🏛️ Government Exams</h3>
              <p className="text-green-700 text-sm">Latest Sarkari Naukri exams and notifications</p>
            </Link>
            <Link 
              to="/blog"
              className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-bold text-purple-800 mb-2">📝 Career Blog</h3>
              <p className="text-purple-700 text-sm">Resume tips and career advice for Indian job market</p>
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
                <h3 className="text-xl font-bold text-gray-800">Share Drive Opportunity</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">{selectedDrive.title}</h4>
                <p className="text-sm text-gray-600">{selectedDrive.company} • {selectedDrive.location}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {new Date(selectedDrive.date).toLocaleDateString()} at {selectedDrive.time}</p>
                <p className="text-xs text-gray-500 mt-1">Share with friends who might be interested</p>
              </div>

              {/* Native Share Button */}
              {typeof navigator.share === 'function' && (
                <button
                  onClick={nativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
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
                  Direct Link to Drive
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/job-drives?drive=${selectedDrive.id}`}
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
                    trackButtonClick('register_from_share', 'share_modal', 'job_drives');
                    if (selectedDrive.registrationLink || selectedDrive.applyLink) {
                      const url = selectedDrive.registrationLink || selectedDrive.applyLink;
                      if (url.startsWith('http')) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Drive Card Component - UPDATED WITH LARGER IMAGES
const DriveCard: React.FC<{ 
  drive: JobDrive; 
  onShare: (drive: JobDrive) => void; 
  onRegister: (drive: JobDrive) => void;
  featured?: boolean 
}> = ({ 
  drive, 
  onShare, 
  onRegister,
  featured = false 
}) => {
  const { trackJobDriveView } = useEnhancedAnalytics();
  const { trackButtonClick, trackExternalLink } = useGoogleAnalytics();
  
  const isUpcoming = new Date(drive.date) >= new Date();
  const isToday = new Date(drive.date).toDateString() === new Date().toDateString();
  const isRecent = drive.addedTimestamp && (Date.now() - drive.addedTimestamp) < 24 * 60 * 60 * 1000;

  const handleDetailsClick = () => {
    trackButtonClick('view_drive_details', 'drive_card', 'job_drives');
    if (drive.applyLink.startsWith('http')) {
      trackExternalLink('Drive Details', drive.applyLink, 'job_drives');
    }
  };

  const handleRegister = () => {
    onRegister(drive);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default behavior
    onShare(drive);
  };

  // Track drive view on mount
  useEffect(() => {
    trackJobDriveView(drive.id, drive.title, 'drive_listing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      featured ? 'ring-2 ring-yellow-400' : ''
    }`}>
      {/* Drive Image - LARGER SIZE */}
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img 
          src={drive.image} 
          alt={drive.title}
          className="w-full h-full object-contain p-3"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x300/10B981/FFFFFF?text=CareerCraft.in+Drive';
          }}
          style={{ 
            maxHeight: '100%', 
            maxWidth: '100%',
            objectPosition: 'center'
          }}
        />
        <div className="absolute top-0 left-0 right-0 flex justify-between p-3">
          <div className="flex flex-col gap-1">
            {featured && (
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                ⭐ Featured Drive
              </span>
            )}
            {isRecent && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                🔥 NEW TODAY
              </span>
            )}
          </div>
          <button
            onClick={handleShareClick}
            className="bg-white/95 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all"
            title="Share this drive"
          >
            <Share2 size={18} />
          </button>
        </div>
        
        {drive.expectedCandidates && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center">
            <Users size={14} className="mr-1.5" />
            {drive.expectedCandidates}+ expected
          </div>
        )}
      </div>

      {/* Drive Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{drive.title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
            {new Date(drive.addedTimestamp || drive.date).toLocaleDateString('en-IN')}
          </span>
        </div>
        
        <div className="flex items-center text-gray-700 mb-4">
          <Building size={18} className="mr-2 text-green-600" />
          <span className="font-semibold text-base">{drive.company}</span>
        </div>
        
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-blue-600" />
            {drive.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-purple-600" />
            {new Date(drive.date).toLocaleDateString('en-IN', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-amber-600" />
            {drive.time}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{drive.description}</p>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {drive.experience && (
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded text-xs">
              Exp: {drive.experience}
            </span>
          )}
          {drive.salary && (
            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded text-xs">
              {drive.salary}
            </span>
          )}
          {drive.driveType && (
            <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded text-xs">
              {drive.driveType}
            </span>
          )}
        </div>

        {/* Quick Eligibility Preview */}
        {drive.eligibility && drive.eligibility.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-800 mb-1.5">Eligibility:</h4>
            <div className="flex flex-wrap gap-1">
              {drive.eligibility.slice(0, 2).map((item, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                  {item.length > 20 ? item.substring(0, 20) + '...' : item}
                </span>
              ))}
              {drive.eligibility.length > 2 && (
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                  +{drive.eligibility.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleShareClick}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
          >
            <Share2 size={16} className="mr-1.5" />
            Share
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center text-sm shadow-md hover:shadow-lg"
          >
            <ExternalLink size={16} className="mr-1.5" />
            Register Now
          </button>
        </div>
        
        {/* Contact Info */}
        {drive.contact && (
          <div className="mt-3.5 pt-3.5 border-t border-gray-200">
            <p className="text-xs text-gray-600">📞 Contact: {drive.contact}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;