// src/components/AdminJobDrives.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

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
    featured: false
  });

  const [eligibilityInput, setEligibilityInput] = useState('');
  const [documentsInput, setDocumentsInput] = useState('');
  const [drives, setDrives] = useState<JobDrive[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDrives = JSON.parse(localStorage.getItem('jobDrives') || '[]');
    setDrives(savedDrives);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setDrive({ ...drive, image: dataUrl });
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDrive: JobDrive = {
      ...drive,
      id: `drive-${Date.now()}`,
      addedTimestamp: Date.now(),
      eligibility: eligibilityInput.split('\n').filter(item => item.trim() !== '').map(item => item.trim()),
      documents: documentsInput.split('\n').filter(item => item.trim() !== '').map(item => item.trim())
    };

    const updatedDrives = [...drives, newDrive];
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
      featured: false
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

  return (
    <>
      <Helmet>
        <title>Admin - Job Drives | CareerCraft.in</title>
        <meta name="description" content="Manage job drives and walk-in interviews for CareerCraft.in - India's premier career platform" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/job-drives" className="text-green-600 hover:text-green-800 mb-4 inline-block">
              ← Back to Job Drives
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Drives - CareerCraft.in</h1>
            <p className="text-gray-600">Add walk-in drives and job fairs for Indian job seekers</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Drive posted successfully on CareerCraft!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Drive to CareerCraft</h2>
                
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
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Plus size={20} className="inline mr-2" />
                      Add Job Drive to CareerCraft
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Existing Drives */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    CareerCraft Drives ({drives.length})
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
                {drives.length === 0 ? (
                  <p className="text-gray-500 text-sm">No drives added yet to CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {drives.map(driveItem => (
                      <div key={driveItem.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {driveItem.title}
                            </h4>
                            <p className="text-xs text-gray-600">{driveItem.company}</p>
                            <p className="text-xs text-gray-500">{driveItem.location}</p>
                            <div className="flex gap-1 mt-1">
                              {driveItem.featured && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                  Featured
                                </span>
                              )}
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                {new Date(driveItem.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteDrive(driveItem.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">CareerCraft Drive Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Total Drives: {drives.length}</p>
                  <p>• Featured: {drives.filter(d => d.featured).length}</p>
                  <p>• Upcoming: {drives.filter(d => new Date(d.date) >= new Date()).length}</p>
                  <p>• With Images: {drives.filter(d => d.image).length}</p>
                  <p>• This Month: {drives.filter(d => {
                    const driveDate = new Date(d.date);
                    const now = new Date();
                    return driveDate.getMonth() === now.getMonth() && driveDate.getFullYear() === now.getFullYear();
                  }).length}</p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Tips for Indian Job Drives</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use high-quality drive posters</li>
                  <li>• Include all eligibility criteria for Indian graduates</li>
                  <li>• Provide clear contact information with Indian phone numbers</li>
                  <li>• Mark important drives as featured</li>
                  <li>• Set realistic dates and times for Indian locations</li>
                  <li>• Mention specific Indian educational requirements</li>
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