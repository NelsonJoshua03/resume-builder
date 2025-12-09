// src/components/AdminJobDrives.tsx - UPDATED WITH AUTO-CLEANUP
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

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
  driveType?: string;
  experience?: string;
  salary?: string;
  expectedCandidates?: number;
  isNew?: boolean;
}

const AdminJobDrives: React.FC = () => {
  const [drive, setDrive] = useState<Omit<JobDrive, 'id' | 'addedTimestamp'>>({
    title: '',
    company: '',
    location: '',
    date: '',
    time: '',
    image: '',
    description: '',
    eligibility: [],
    documents: [],
    applyLink: '',
    contact: '',
    featured: false,
    driveType: 'Walk-in Interview',
    experience: '',
    salary: '',
    expectedCandidates: undefined,
    isNew: true
  });

  const [eligibilityInput, setEligibilityInput] = useState('');
  const [documentsInput, setDocumentsInput] = useState('');
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [cleanupStats, setCleanupStats] = useState<{
    before: number;
    after: number;
    removed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackEvent } = useGoogleAnalytics();

  // Cleanup old drives (older than 3 months) and load drives
  const loadAndCleanDrives = (auto: boolean = false) => {
    const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    
    // Filter out drives older than 90 days (3 months)
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    
    const beforeCount = savedDrives.length;
    const recentDrives = savedDrives.filter((drive: JobDrive) => {
      const driveTimestamp = drive.addedTimestamp || new Date(drive.date).getTime();
      return driveTimestamp >= ninetyDaysAgo;
    });
    const afterCount = recentDrives.length;
    const removedCount = beforeCount - afterCount;
    
    // Sort by addedTimestamp (newest first)
    const sortedDrives = recentDrives.sort((a: JobDrive, b: JobDrive) => {
      const timeA = a.addedTimestamp || new Date(a.date).getTime();
      const timeB = b.addedTimestamp || new Date(b.date).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
    
    // Update localStorage with only recent drives
    if (recentDrives.length !== savedDrives.length) {
      localStorage.setItem('jobDrives', JSON.stringify(recentDrives));
    }
    
    setDrives(sortedDrives);
    
    // Save cleanup time
    const cleanupTime = new Date().toLocaleString('en-IN');
    localStorage.setItem('last_drive_cleanup', cleanupTime);
    setLastCleanup(cleanupTime);
    
    // Set cleanup stats
    setCleanupStats({
      before: beforeCount,
      after: afterCount,
      removed: removedCount
    });
    
    // Track cleanup event
    if (removedCount > 0) {
      trackEvent('drive_cleanup', {
        auto_cleanup: auto,
        drives_before: beforeCount,
        drives_after: afterCount,
        drives_removed: removedCount
      });
      
      if (!auto) {
        alert(`Cleaned up ${removedCount} drives older than 90 days.`);
      }
    }
  };

  // Load drives on component mount
  useEffect(() => {
    loadAndCleanDrives(true);
    
    // Load last cleanup time
    const savedCleanup = localStorage.getItem('last_drive_cleanup');
    if (savedCleanup) {
      setLastCleanup(savedCleanup);
    }
  }, []);

  // Manual cleanup trigger
  const handleCleanup = () => {
    if (window.confirm('Are you sure you want to remove all drives older than 90 days? This action cannot be undone.')) {
      loadAndCleanDrives(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setDrive({ ...drive, image: dataUrl });
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDrive: JobDrive = {
      ...drive,
      id: `drive-${Date.now()}`,
      addedTimestamp: Date.now(),
      eligibility: eligibilityInput.split('\n').filter(item => item.trim() !== '').map(item => item.trim()),
      documents: documentsInput.split('\n').filter(item => item.trim() !== '').map(item => item.trim()),
      isNew: true
    };

    const updatedDrives = [newDrive, ...drives]; // Add to beginning for latest first
    setDrives(updatedDrives);
    localStorage.setItem('jobDrives', JSON.stringify(updatedDrives));
    
    setShowSuccess(true);
    // Reset form
    setDrive({
      title: '',
      company: '',
      location: '',
      date: '',
      time: '',
      image: '',
      description: '',
      eligibility: [],
      documents: [],
      applyLink: '',
      contact: '',
      featured: false,
      driveType: 'Walk-in Interview',
      experience: '',
      salary: '',
      expectedCandidates: undefined,
      isNew: true
    });
    setEligibilityInput('');
    setDocumentsInput('');
    setImagePreview('');

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const deleteDrive = (driveId: string) => {
    const updatedDrives = drives.filter(drive => drive.id !== driveId);
    setDrives(updatedDrives);
    localStorage.setItem('jobDrives', JSON.stringify(updatedDrives));
  };

  const clearAllDrives = () => {
    if (window.confirm('Are you sure you want to delete all job drives? This action cannot be undone.')) {
      setDrives([]);
      localStorage.setItem('jobDrives', '[]');
    }
  };

  const popularLocations = [
    'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Delhi', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Kolkata, West Bengal', 
    'Gurgaon, Haryana', 'Noida, Uttar Pradesh', 'Ahmedabad, Gujarat'
  ];

  const driveTypes = [
    'Walk-in Interview',
    'Job Fair',
    'Campus Drive',
    'Virtual Drive',
    'Immediate Joining',
    'Pool Campus',
    'Mass Recruitment'
  ];

  return (
    <>
      <Helmet>
        <title>Admin - Latest Job Drives | CareerCraft.in</title>
        <meta name="description" content="Manage latest walk-in drives and job fairs for CareerCraft.in - India's premier career platform. Auto-cleaned every 90 days." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/job-drives" className="text-green-600 hover:text-green-800 mb-4 inline-block">
              ← Back to Latest Job Drives
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Drives - CareerCraft.in</h1>
            <p className="text-gray-600">Add latest walk-in drives and job fairs for Indian job seekers. Auto-cleaned every 90 days.</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Latest drive posted successfully on CareerCraft!
            </div>
          )}

          {/* Auto-Cleanup Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">🔄 Auto-Cleanup System Active</h3>
                <p className="text-yellow-700 text-sm">
                  Drives older than 90 days are automatically removed to keep listings fresh.
                </p>
                <p className="text-yellow-700 text-sm">
                  Latest Drives: {drives.length} • Last Cleanup: {lastCleanup || 'Never'}
                </p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={handleCleanup}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clean Old Drives
                </button>
                <button
                  onClick={() => loadAndCleanDrives(false)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </button>
              </div>
            </div>
            {cleanupStats && cleanupStats.removed > 0 && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-700 text-sm">
                  <AlertCircle size={14} className="inline mr-1" />
                  Auto-cleaned: {cleanupStats.removed} old drives removed
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add Latest Drive to CareerCraft</h2>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Shows as LATEST
                  </span>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drive Poster/Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDrive({...drive, image: ''});
                              setImagePreview('');
                            }}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              <Upload size={16} className="inline mr-2" />
                              Upload Drive Poster
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Drive Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={drive.title}
                        onChange={e => setDrive({...drive, title: e.target.value})}
                        placeholder="e.g., Walk-in Drive for Software Engineers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={drive.company}
                        onChange={e => setDrive({...drive, company: e.target.value})}
                        placeholder="e.g., Tech Solutions India"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Location and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={drive.location}
                        onChange={e => setDrive({...drive, location: e.target.value})}
                        placeholder="e.g., Bangalore, Karnataka"
                        list="locations"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <datalist id="locations">
                        {popularLocations.map(location => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={drive.date}
                          onChange={e => setDrive({...drive, date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={drive.time}
                          onChange={e => setDrive({...drive, time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drive Type and Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Drive Type
                      </label>
                      <select
                        value={drive.driveType}
                        onChange={e => setDrive({...drive, driveType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {driveTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Required
                      </label>
                      <input
                        type="text"
                        value={drive.experience}
                        onChange={e => setDrive({...drive, experience: e.target.value})}
                        placeholder="e.g., 0-2 years, Freshers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Salary and Expected Candidates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary/Stipend
                      </label>
                      <input
                        type="text"
                        value={drive.salary}
                        onChange={e => setDrive({...drive, salary: e.target.value})}
                        placeholder="e.g., ₹3,00,000 - ₹6,00,000 PA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Candidates
                      </label>
                      <input
                        type="number"
                        value={drive.expectedCandidates || ''}
                        onChange={e => setDrive({...drive, expectedCandidates: parseInt(e.target.value) || undefined})}
                        placeholder="e.g., 500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={drive.description}
                      onChange={e => setDrive({...drive, description: e.target.value})}
                      placeholder="Describe the drive, positions available, and key highlights for Indian job seekers..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Eligibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eligibility Criteria (one per line) *
                    </label>
                    <textarea
                      required
                      value={eligibilityInput}
                      onChange={e => setEligibilityInput(e.target.value)}
                      placeholder="Bachelor's degree in Computer Science...
0-2 years of experience...
Good communication skills..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documents Required (one per line)
                    </label>
                    <textarea
                      value={documentsInput}
                      onChange={e => setDocumentsInput(e.target.value)}
                      placeholder="Updated Resume...
Photo ID proof...
Educational certificates..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Contact and Apply Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Information
                      </label>
                      <input
                        type="text"
                        value={drive.contact}
                        onChange={e => setDrive({...drive, contact: e.target.value})}
                        placeholder="e.g., HR: 9876543210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apply Link/Details
                      </label>
                      <input
                        type="text"
                        value={drive.applyLink}
                        onChange={e => setDrive({...drive, applyLink: e.target.value})}
                        placeholder="e.g., https://company.com/drive-details"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={drive.featured}
                      onChange={e => setDrive({...drive, featured: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                      Mark as Featured Drive
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Plus size={20} className="inline mr-2" />
                      Add Latest Job Drive to CareerCraft
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Drive will appear as "Latest" and auto-clean after 90 days
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Auto-Cleanup Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <h4 className="font-semibold text-red-800">🔄 Auto-Cleanup System</h4>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  Drives older than 90 days are automatically removed to keep listings fresh.
                </p>
                <div className="space-y-2 text-sm text-red-700 mb-4">
                  <div className="flex justify-between">
                    <span>Last Cleanup:</span>
                    <span className="font-medium">{lastCleanup || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drives before:</span>
                    <span className="font-medium">{cleanupStats?.before || drives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drives after:</span>
                    <span className="font-medium">{cleanupStats?.after || drives.length}</span>
                  </div>
                  {cleanupStats && cleanupStats.removed > 0 && (
                    <div className="flex justify-between">
                      <span>Removed:</span>
                      <span className="font-medium bg-red-100 px-2 py-0.5 rounded">{cleanupStats.removed} old drives</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCleanup}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clean Old Drives Now
                </button>
              </div>

              {/* Existing Drives */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Latest CareerCraft Drives ({drives.length})
                  </h3>
                  {drives.length > 0 && (
                    <button
                      onClick={clearAllDrives}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Clear All
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={12} />
                  Showing newest first • Auto-cleaned every 90 days
                </div>
                {drives.length === 0 ? (
                  <p className="text-gray-500 text-sm">No latest drives added yet to CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {drives.map(driveItem => {
                      const isOld = driveItem.addedTimestamp && (Date.now() - driveItem.addedTimestamp) > 60 * 24 * 60 * 60 * 1000; // 60+ days
                      
                      return (
                        <div key={driveItem.id} className={`border rounded-lg p-3 ${isOld ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                                {driveItem.title}
                              </h4>
                              <p className="text-xs text-gray-600">{driveItem.company}</p>
                              <p className="text-xs text-gray-500">{driveItem.location}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {driveItem.isNew && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                    NEW
                                  </span>
                                )}
                                {isOld && (
                                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                                    OLD (Will auto-clean)
                                  </span>
                                )}
                                {driveItem.featured && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                    Featured
                                  </span>
                                )}
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                  {new Date(driveItem.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Added: {driveItem.addedTimestamp ? new Date(driveItem.addedTimestamp).toLocaleDateString('en-IN') : 'Recently'}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteDrive(driveItem.id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Latest Drive Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Latest Drives:</span>
                    <span className="font-bold">{drives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Featured:</span>
                    <span className="font-bold">{drives.filter(d => d.featured).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming:</span>
                    <span className="font-bold">{drives.filter(d => new Date(d.date) >= new Date()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With Images:</span>
                    <span className="font-bold">{drives.filter(d => d.image).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month:</span>
                    <span className="font-bold">{drives.filter(d => {
                      const driveDate = new Date(d.date);
                      const now = new Date();
                      return driveDate.getMonth() === now.getMonth() && driveDate.getFullYear() === now.getFullYear();
                    }).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-clean in:</span>
                    <span className="font-bold">90 days</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Tips for Latest Indian Job Drives</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use high-quality drive posters</li>
                  <li>• Include all eligibility criteria for Indian graduates</li>
                  <li>• Provide clear contact information with Indian phone numbers</li>
                  <li>• Mark important drives as featured</li>
                  <li>• Set realistic dates and times for Indian locations</li>
                  <li>• Mention specific Indian educational requirements</li>
                  <li>• Drives auto-clean after 90 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminJobDrives;