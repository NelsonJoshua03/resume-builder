// src/components/JobDrives.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  Building,
  ExternalLink
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
}

const JobDrives: React.FC = () => {
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<JobDrive | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Load drives from localStorage
  useEffect(() => {
    const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    setDrives(savedDrives);
  }, []);

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchTerm === '' || 
      drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      drive.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const featuredDrives = drives.filter(drive => drive.featured);
  const upcomingDrives = drives.filter(drive => new Date(drive.date) >= new Date());

  const handleShare = (drive: JobDrive) => {
    setSelectedDrive(drive);
    setShowShareModal(true);
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/job-drives${selectedDrive ? `?drive=${selectedDrive.id}` : ''}`
    : '';

  return (
    <>
      <Helmet>
        <title>Walk-in Drives & Job Fairs | ResumeCVForge</title>
        <meta name="description" content="Find upcoming walk-in drives, job fairs, and immediate hiring opportunities across India." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Walk-in Drives & Job Fairs</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Immediate hiring opportunities with direct company interviews
          </p>
          
          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Find Drives
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex justify-center items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{drives.length}</div>
              <div className="text-green-100">Total Drives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{upcomingDrives.length}</div>
              <div className="text-green-100">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{featuredDrives.length}</div>
              <div className="text-green-100">Featured</div>
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
                <h3 className="font-bold text-yellow-800">Admin Access</h3>
                <p className="text-yellow-700 text-sm">Add new walk-in drives and job fairs</p>
              </div>
              <Link 
                to="/admin/job-drives" 
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors mt-2 md:mt-0"
              >
                Add New Drive
              </Link>
            </div>
          </div>

          {/* Featured Drives */}
          {featuredDrives.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Drives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDrives.map(drive => (
                  <DriveCard key={drive.id} drive={drive} onShare={handleShare} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Drives */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                All Walk-in Drives ({filteredDrives.length})
              </h2>
              <div className="text-sm text-gray-600">
                Sorted by date
              </div>
            </div>

            {filteredDrives.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No drives found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or check back later</p>
                <Link 
                  to="/admin/job-drives"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add First Drive
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrives.map(drive => (
                  <DriveCard key={drive.id} drive={drive} onShare={handleShare} />
                ))}
              </div>
            )}
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
                <FacebookShareButton url={shareUrl} title={selectedDrive.title}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <LinkedinShareButton url={shareUrl} title={selectedDrive.title}>
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
                <TwitterShareButton url={shareUrl} title={selectedDrive.title}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={selectedDrive.title}>
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
const DriveCard: React.FC<{ drive: JobDrive; onShare: (drive: JobDrive) => void; featured?: boolean }> = ({ 
  drive, 
  onShare, 
  featured = false 
}) => {
  const isUpcoming = new Date(drive.date) >= new Date();

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
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Drive+Image';
          }}
        />
        {featured && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Featured
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Upcoming
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
            {new Date(drive.date).toLocaleDateString()}
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onShare(drive)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Share2 size={16} className="mr-1" />
            Share
          </button>
          <a
            href={drive.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <ExternalLink size={16} className="mr-1" />
            Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDrives;