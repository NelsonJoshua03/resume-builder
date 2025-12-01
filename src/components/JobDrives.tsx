// src/components/JobDrives.tsx - UPDATED WITH ENHANCED ANALYTICS
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
  Users
} from 'lucide-react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';

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
}

const JobDrives: React.FC = () => {
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<JobDrive | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  // Track daily page view on mount
  useEffect(() => {
    trackDailyPageView('Job Drives', '/job-drives');
    
    // Load drives from localStorage
    const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    setDrives(savedDrives);
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

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchTerm === '' || 
      drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      drive.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      drive.title.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      drive.company.toLowerCase().includes(categoryFilter.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const featuredDrives = drives.filter(drive => drive.featured);
  const upcomingDrives = drives.filter(drive => new Date(drive.date) >= new Date());
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
    // Use trackButtonClick instead of trackJobSearch
    trackButtonClick('search_drives', 'search_form', 'job_drives');
  };

  const handleRegisterClick = (drive: JobDrive) => {
    trackJobDriveRegistration(drive.id, drive.title, drive.company);
    trackButtonClick('register_drive', 'drive_card', 'job_drives');
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/job-drives${selectedDrive ? `?drive=${selectedDrive.id}` : ''}`
    : '';

  const handleSocialShare = (platform: string) => {
    if (selectedDrive) {
      trackSocialShare(platform, 'job_drive', selectedDrive.id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Walk-in Drives & Job Fairs in India 2025 | CareerCraft.in</title>
        <meta name="description" content="Find upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Direct company interviews for IT, engineering, and business roles." />
        <meta name="keywords" content="walk-in drives India 2025, job fairs India, immediate hiring, direct interview, IT jobs walk-in, engineering jobs drive, campus placement India, fresher jobs India" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/job-drives" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Walk-in Drives & Job Fairs in India 2025 | CareerCraft.in" />
        <meta property="og:description" content="Find upcoming walk-in drives, job fairs, and immediate hiring opportunities across India. Direct company interviews for IT, engineering roles." />
        <meta property="og:url" content="https://careercraft.in/job-drives" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Walk-in Drives & Job Fairs in India 2025 | CareerCraft.in" />
        <meta name="twitter:description" content="Find upcoming walk-in drives, job fairs, and immediate hiring opportunities across India." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Walk-in Drives & Job Fairs in India</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Immediate hiring opportunities with direct company interviews across India
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
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
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Find Drives
                </button>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-green-700/80 px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{drives.length}</div>
              <div className="text-green-100 text-sm">Total Drives</div>
            </div>
            <div className="bg-green-700/80 px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{upcomingDrives.length}</div>
              <div className="text-green-100 text-sm">Upcoming</div>
            </div>
            <div className="bg-green-700/80 px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{featuredDrives.length}</div>
              <div className="text-green-100 text-sm">Featured</div>
            </div>
            <div className="bg-green-700/80 px-4 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{recentDrives.length}</div>
              <div className="text-green-100 text-sm">This Week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Quick Admin Access */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="font-bold text-yellow-800">📊 Analytics Tracking Active</h3>
                <p className="text-yellow-700 text-sm">Drive views, registrations, and shares are being tracked in real-time</p>
              </div>
              <div className="flex gap-3 mt-2 md:mt-0">
                <Link 
                  to="/admin/job-drives" 
                  onClick={() => {
                    trackCTAClick('admin_job_drives', 'admin_access', 'job_drives');
                    trackButtonClick('admin_panel', 'admin_cta', 'job_drives');
                  }}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Add New Drive
                </Link>
                <Link 
                  to="/admin/daily-analytics" 
                  onClick={() => trackButtonClick('view_drive_analytics', 'analytics_cta', 'job_drives')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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
                <h2 className="text-3xl font-bold text-gray-800">⭐ Featured Drives</h2>
                <span className="text-green-600 font-semibold">{featuredDrives.length} featured</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDrives.map(drive => (
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

          {/* Upcoming Drives */}
          {upcomingDrives.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">📅 Upcoming Drives</h2>
                <span className="text-blue-600 font-semibold">{upcomingDrives.length} upcoming</span>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                All Walk-in Drives in India
                <span className="text-gray-600 text-lg ml-2">({filteredDrives.length})</span>
              </h2>
              <div className="text-sm text-gray-600">
                Sorted by date • Tracking active
              </div>
            </div>

            {filteredDrives.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No drives found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or check back later for new Indian job drives</p>
                <Link 
                  to="/admin/job-drives"
                  onClick={() => trackCTAClick('add_first_drive', 'empty_state', 'job_drives')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add First Drive
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrives.map(drive => (
                  <DriveCard 
                    key={drive.id} 
                    drive={drive} 
                    onShare={handleShare}
                    onRegister={handleRegisterClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Analytics Info */}
          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-800 mb-3 text-lg">📊 Drive Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded border">
                <div className="font-semibold text-gray-700 mb-1">Drive Views Today</div>
                <div className="text-2xl font-bold text-green-600">
                  {localStorage.getItem(`daily_page_views_job-drives`) || '0'}
                </div>
              </div>
              <div className="bg-white p-4 rounded border">
                <div className="font-semibold text-gray-700 mb-1">Total Registrations</div>
                <div className="text-2xl font-bold text-blue-600">
                  {localStorage.getItem('job_drive_registrations') || '0'}
                </div>
              </div>
              <div className="bg-white p-4 rounded border">
                <div className="font-semibold text-gray-700 mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-purple-600">
                  {parseInt(localStorage.getItem(`daily_page_views_job-drives`) || '1') > 0 
                    ? ((parseInt(localStorage.getItem('job_drive_registrations') || '0') / parseInt(localStorage.getItem(`daily_page_views_job-drives`) || '1')) * 100).toFixed(1) 
                    : '0'}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && selectedDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Share this Drive</h3>
              <p className="text-gray-600 mb-2">{selectedDrive.title}</p>
              <p className="text-sm text-gray-500 mb-6">{selectedDrive.company} • {selectedDrive.location}</p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <FacebookShareButton 
                  url={shareUrl} 
                  title={`${selectedDrive.title} - CareerCraft.in`}
                  onClick={() => handleSocialShare('facebook')}
                >
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <LinkedinShareButton 
                  url={shareUrl} 
                  title={`${selectedDrive.title} - CareerCraft.in`}
                  onClick={() => handleSocialShare('linkedin')}
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
                <TwitterShareButton 
                  url={shareUrl} 
                  title={`${selectedDrive.title} - CareerCraft.in`}
                  onClick={() => handleSocialShare('twitter')}
                >
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <WhatsappShareButton 
                  url={shareUrl} 
                  title={`${selectedDrive.title} - CareerCraft.in`}
                  onClick={() => handleSocialShare('whatsapp')}
                >
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    trackButtonClick('copy_drive_link', 'share_modal', 'job_drives');
                    alert('Link copied to clipboard!');
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Copy Link
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

  const handleDetailsClick = () => {
    trackButtonClick('view_drive_details', 'drive_card', 'job_drives');
    trackExternalLink('Drive Details', drive.applyLink, 'job_drives');
  };

  const handleRegister = () => {
    onRegister(drive);
    window.open(drive.registrationLink || drive.applyLink, '_blank');
  };

  // Track drive view on mount
  useEffect(() => {
    trackJobDriveView(drive.id, drive.title, 'drive_listing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
      featured ? 'ring-2 ring-green-500' : ''
    }`}>
      {/* Drive Image */}
      <div className="relative">
        <img 
          src={drive.image} 
          alt={drive.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=CareerCraft.in+Drive';
          }}
        />
        {featured && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Featured
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {isToday ? 'Today' : 'Upcoming'}
          </div>
        )}
        {drive.expectedCandidates && (
          <div className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-semibold flex items-center">
            <Users size={12} className="mr-1" />
            {drive.expectedCandidates}+ expected
          </div>
        )}
      </div>

      {/* Drive Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{drive.title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <Building size={16} className="mr-2" />
          <span className="font-semibold">{drive.company}</span>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-2" />
            {drive.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-2" />
            {new Date(drive.date).toLocaleDateString('en-IN', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={14} className="mr-2" />
            {drive.time}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{drive.description}</p>

        {/* Quick Eligibility Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Eligibility:</h4>
          <div className="flex flex-wrap gap-1">
            {drive.eligibility.slice(0, 2).map((item, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {item}
              </span>
            ))}
            {drive.eligibility.length > 2 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                +{drive.eligibility.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Documents Required */}
        {drive.documents && drive.documents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Documents:</h4>
            <p className="text-xs text-gray-600">{drive.documents.slice(0, 3).join(', ')}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onShare(drive)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
          >
            <Share2 size={14} className="mr-1" />
            Share
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
          >
            <ExternalLink size={14} className="mr-1" />
            Register Now
          </button>
        </div>
        
        {/* Contact Info */}
        {drive.contact && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">Contact: {drive.contact}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;