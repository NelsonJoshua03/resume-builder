// src/components/JobDrives.tsx - LOCAL STORAGE VERSION (No Blinking)
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Share2, 
  MapPin, 
  Clock, 
  Building,
  ExternalLink,
  Filter,
  RefreshCw,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  X,
  Search,
  AlertCircle,
  Image as ImageIcon,
  
  Info,
  Calendar
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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load drives from localStorage
  const loadDrives = () => {
    try {
      setIsLoading(true);
      const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
      
      // Clean old drives (older than 30 days)
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const recentDrives = savedDrives.filter((drive: JobDrive) => {
        const driveTimestamp = drive.addedTimestamp || new Date(drive.date).getTime();
        return driveTimestamp >= thirtyDaysAgo;
      });
      
      // Sort by addedTimestamp (newest first)
      const sortedDrives = recentDrives.sort((a: JobDrive, b: JobDrive) => {
        const timeA = a.addedTimestamp || new Date(a.date).getTime();
        const timeB = b.addedTimestamp || new Date(b.date).getTime();
        return timeB - timeA;
      });
      
      setDrives(sortedDrives);
      setLastUpdated(new Date().toLocaleString('en-IN'));
      
      // Save cleaned drives back to localStorage
      if (recentDrives.length !== savedDrives.length) {
        localStorage.setItem('jobDrives', JSON.stringify(recentDrives));
      }
    } catch (error) {
      console.error('Error loading drives:', error);
      setDrives([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadDrives();
  }, []);

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

  const driveTypes = [
    'all',
    'Walk-in Interview',
    'Job Fair',
    'Campus Drive',
    'Virtual Drive',
    'Immediate Joining',
    'Pool Campus'
  ];

  const filteredDrives = useMemo(() => drives.filter(drive => {
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
  }), [drives, searchTerm, locationFilter, categoryFilter, driveTypeFilter]);

  const featuredDrives = useMemo(() => drives.filter(drive => drive.featured), [drives]);
  const upcomingDrives = useMemo(() => drives.filter(drive => new Date(drive.date) >= new Date()), [drives]);
  const todayDrives = useMemo(() => drives.filter(drive => 
    new Date(drive.date).toDateString() === new Date().toDateString()
  ), [drives]);

  const handleShare = (drive: JobDrive) => {
    setSelectedDrive(drive);
    setShowShareModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('all');
    setDriveTypeFilter('all');
    setShowFilters(false);
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/job-drives${selectedDrive ? `?drive=${selectedDrive.id}` : ''}`
    : '';

  const handleRefresh = () => {
    loadDrives();
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedDrive(null);
    setCopySuccess(false);
  };

  const copyToClipboard = () => {
    if (selectedDrive) {
      const driveUrl = `${window.location.origin}/job-drives?drive=${selectedDrive.id}`;
      navigator.clipboard.writeText(driveUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (selectedDrive && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${selectedDrive.title} - ${selectedDrive.company}`,
          text: `Check out this job drive on CareerCraft: ${selectedDrive.title} by ${selectedDrive.company} in ${selectedDrive.location} on ${new Date(selectedDrive.date).toLocaleDateString()}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const shareOnFacebook = () => {
    if (selectedDrive) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company}`;
      window.open(url, '_blank');
    }
  };

  const shareOnTwitter = () => {
    if (selectedDrive) {
      const text = `Check out this job drive: ${selectedDrive.title} at ${selectedDrive.company} in ${selectedDrive.location}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank');
    }
  };

  const shareOnLinkedIn = () => {
    if (selectedDrive) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank');
    }
  };

  const shareOnWhatsApp = () => {
    if (selectedDrive) {
      const text = `Check out this job drive on CareerCraft: ${selectedDrive.title} at ${selectedDrive.company} - ${shareUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const shareViaEmail = () => {
    if (selectedDrive) {
      const subject = `Job Drive: ${selectedDrive.title} at ${selectedDrive.company}`;
      const body = `Check out this job drive on CareerCraft:\n\nDrive: ${selectedDrive.title}\nCompany: ${selectedDrive.company}\nLocation: ${selectedDrive.location}\nDate: ${new Date(selectedDrive.date).toLocaleDateString()}\nTime: ${selectedDrive.time}\n\nView details: ${shareUrl}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Thank you! You'll receive drive alerts at ${newsletterEmail}`);
      setNewsletterEmail('');
      
      const subscribers = JSON.parse(localStorage.getItem('drive_subscribers') || '[]');
      subscribers.push({ email: newsletterEmail, date: new Date().toISOString() });
      localStorage.setItem('drive_subscribers', JSON.stringify(subscribers));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading drives...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Latest Walk-in Drives & Job Fairs in India 2025 | Fresh Updates | CareerCraft.in</title>
        <meta name="description" content="Find latest upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Updated daily. Direct company interviews for IT, engineering, and business roles." />
        <meta name="keywords" content="latest walk-in drives India 2025, fresh job fairs India, immediate hiring today, direct interview updates, IT jobs walk-in today, engineering jobs drive, campus placement India, fresher jobs India" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/job-drives" />
      </Helmet>

      {/* Mobile Search Bar */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-100 rounded-lg"
              title="Refresh drives"
            >
              <RefreshCw size={20} />
            </button>
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drives..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 p-2 rounded-lg"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Drive Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={driveTypeFilter}
                  onChange={(e) => setDriveTypeFilter(e.target.value)}
                >
                  {driveTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All' : type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City or location"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-green-100">
              <Calendar size={20} />
              <span className="text-sm">Local Storage Active</span>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
              title="Refresh latest drives"
            >
              <RefreshCw size={18} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">Latest Walk-in Drives & Job Fairs</h1>
          <p className="text-base sm:text-xl max-w-2xl mx-auto mb-6 sm:mb-8">
            Fresh immediate hiring opportunities with direct company interviews
            <span className="block text-xs sm:text-sm text-green-200 mt-1 sm:mt-2">
              Auto-cleaned every 30 days • Updated: {lastUpdated}
            </span>
          </p>
          
          {/* Desktop Search Form */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-xl p-4 shadow-2xl hidden lg:block">
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
          </form>

          {/* Stats */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold">{drives.length}</div>
              <div className="text-green-100 text-xs sm:text-sm">Latest Drives</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold">{upcomingDrives.length}</div>
              <div className="text-green-100 text-xs sm:text-sm">Upcoming</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center">
              <div className="text-lg sm:text-2xl font-bold">{featuredDrives.length}</div>
              <div className="text-green-100 text-xs sm:text-sm">Featured</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center hidden sm:block">
              <div className="text-lg sm:text-2xl font-bold">{todayDrives.length}</div>
              <div className="text-green-100 text-xs sm:text-sm">Today</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center hidden sm:block">
              <div className="text-lg sm:text-2xl font-bold">{drives.filter(d => d.image).length}</div>
              <div className="text-green-100 text-xs sm:text-sm">With Images</div>
            </div>
          </div>

          {/* 30 Days Notice */}
          <div className="mt-4 bg-yellow-100/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="text-yellow-100 text-sm">
              Drives auto-delete after 30 days • Keep listings fresh
            </span>
          </div>

          {/* Share CTA */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => {
                if (drives.length > 0) {
                  setSelectedDrive(drives[0]);
                  setShowShareModal(true);
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <Share2 size={18} />
              Share Latest Drives
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 text-base sm:text-lg mb-1 sm:mb-2">📊 Latest Drives Tracking Active</h3>
                <p className="text-yellow-700 text-xs sm:text-sm mb-1">Drive views, registrations, and shares are being tracked</p>
                <p className="text-yellow-700 text-xs sm:text-sm">Auto-cleaned every 30 days • Updated: {lastUpdated}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <Link 
                  to="/admin/job-drives" 
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all"
                >
                  Add Drive
                </Link>
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Featured Drives */}
          {featuredDrives.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span> Featured Drives
                </h2>
                <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
                  {featuredDrives.length} featured
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredDrives.slice(0, 6).map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                    featured 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today's Drives */}
          {todayDrives.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-500">🔥</span> Today's Drives
                </h2>
                <span className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
                  {todayDrives.length} drives today
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {todayDrives.map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Drives */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
                  All Latest Walk-in Drives
                  <span className="text-gray-600 text-base sm:text-lg ml-2">({filteredDrives.length})</span>
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Sorted by newest • Auto-cleaned every 30 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Page 1 of {Math.ceil(filteredDrives.length / 9)}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {filteredDrives.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No latest drives found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or add new drives</p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                  <Link 
                    to="/admin/job-drives"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Add New Drive
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredDrives.slice(0, 9).map(drive => (
                    <DriveCard 
                      key={drive.id} 
                      drive={drive} 
                      onShare={handleShare}
                    />
                  ))}
                </div>
                
                {filteredDrives.length > 9 && (
                  <div className="text-center mt-6 sm:mt-8">
                    <button
                      onClick={() => {}}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm sm:text-base"
                    >
                      Load More Drives ({filteredDrives.length - 9} more)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="font-bold text-green-800 text-base sm:text-lg mb-2">📬 Get Drive Alerts</h3>
                <p className="text-green-700 text-xs sm:text-sm">
                  We'll notify you about upcoming walk-in drives
                </p>
                <p className="text-green-700 text-xs sm:text-sm mt-1">
                  Auto-cleaned every 30 days to keep listings fresh
                </p>
              </div>
              <form 
                onSubmit={handleNewsletterSignup}
                className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded font-semibold hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
                >
                  Get Alerts
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Share Drive Opportunity</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6">
                {selectedDrive.image && (
                  <img 
                    src={selectedDrive.image} 
                    alt={selectedDrive.title}
                    className="w-full h-40 object-cover rounded mb-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/10B981/FFFFFF?text=Drive+Poster';
                    }}
                  />
                )}
                <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">{selectedDrive.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{selectedDrive.company} • {selectedDrive.location}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {new Date(selectedDrive.date).toLocaleDateString()} at {selectedDrive.time}</p>
                <p className="text-xs text-gray-500 mt-1">Share with friends who might be interested</p>
              </div>

              {typeof navigator.share === 'function' && (
                <button
                  onClick={nativeShare}
                  className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Share2 size={20} />
                  Share via Device
                </button>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  onClick={shareOnFacebook}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1877F2] text-white rounded hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook size={20} className="sm:hidden" />
                  <Facebook size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Facebook</span>
                </button>
                
                <button
                  onClick={shareOnTwitter}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  <Twitter size={20} className="sm:hidden" />
                  <Twitter size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Twitter/X</span>
                </button>
                
                <button
                  onClick={shareOnLinkedIn}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#0A66C2] text-white rounded hover:bg-[#0958b3] transition-colors"
                >
                  <Linkedin size={20} className="sm:hidden" />
                  <Linkedin size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">LinkedIn</span>
                </button>
                
                <button
                  onClick={shareOnWhatsApp}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#25D366] text-white rounded hover:bg-[#20b857] transition-colors"
                >
                  <MessageCircle size={20} className="sm:hidden" />
                  <MessageCircle size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <Mail size={20} className="sm:hidden" />
                  <Mail size={24} className="hidden sm:block" />
                  <span className="text-xs mt-1 sm:mt-2">Email</span>
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
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
                  Direct Link to Drive
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/job-drives?drive=${selectedDrive.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs sm:text-sm bg-gray-50 truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded hover:bg-gray-900 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-2 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.open(selectedDrive.registrationLink || selectedDrive.applyLink, '_blank');
                    closeShareModal();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 sm:py-2 rounded font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink size={16} />
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

// Drive Card Component
const DriveCard: React.FC<{ 
  drive: JobDrive; 
  onShare: (drive: JobDrive) => void; 
  featured?: boolean 
}> = ({ 
  drive, 
  onShare,
  featured = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };

  const handleRegister = () => {
    window.open(drive.registrationLink || drive.applyLink, '_blank');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(drive);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
      featured ? 'ring-2 ring-yellow-400' : ''
    }`}>
      
      {/* Image Section */}
      <div className="w-full">
        {drive.image ? (
          <img 
            src={drive.image} 
            alt={drive.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Drive+Poster';
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
            <ImageIcon size={48} className="text-green-400" />
          </div>
        )}
      </div>

      {/* Basic Info Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">{drive.title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
            {new Date(drive.date).toLocaleDateString('en-IN', { 
              day: 'numeric',
              month: 'short'
            })}
          </span>
        </div>
        
        <div className="flex items-center text-gray-700 mb-2">
          <Building size={16} className="mr-2 text-green-600" />
          <span className="font-semibold truncate">{drive.company}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin size={14} className="mr-2 text-blue-600" />
          <span className="truncate">{drive.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Clock size={14} className="mr-2 text-amber-600" />
          <span>{drive.time}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {featured && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
              ⭐ Featured
            </span>
          )}
          {drive.driveType && (
            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
              {drive.driveType}
            </span>
          )}
          {drive.experience && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
              Exp: {drive.experience}
            </span>
          )}
        </div>

        {/* Short Description */}
        {!showDetails && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{drive.description}</p>
        )}

        {/* Details Section */}
        {showDetails && (
          <div className="mb-4 space-y-3">
            <p className="text-sm text-gray-600">{drive.description}</p>
            
            {drive.experience && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Experience:</span>
                <span className="ml-2 text-gray-600">{drive.experience}</span>
              </div>
            )}
            
            {drive.salary && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Salary:</span>
                <span className="ml-2 text-gray-600">{drive.salary}</span>
              </div>
            )}
            
            {drive.eligibility && drive.eligibility.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Eligibility:</span>
                <ul className="list-disc list-inside mt-1 ml-2 text-gray-600">
                  {drive.eligibility.slice(0, 3).map((item, index) => (
                    <li key={index} className="text-xs">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDetailsClick}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <Info size={14} />
            {showDetails ? 'Show Less' : 'See Details'}
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-1 text-sm"
          >
            <ExternalLink size={14} />
            Register
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="w-full mt-2 text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center gap-1"
        >
          <Share2 size={14} />
          Share this Drive
        </button>
      </div>
    </div>
  );
};

export default JobDrives;