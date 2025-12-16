// src/components/QuickJobFinder.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Zap, Clock, Building, MapPin, Plus, ExternalLink } from 'lucide-react';

const QuickJobFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');

  const quickSearches = [
    { title: 'Software Developer', location: 'Bangalore' },
    { title: 'Data Analyst', location: 'Hyderabad' },
    { title: 'Frontend Developer', location: 'Pune' },
    { title: 'DevOps Engineer', location: 'Gurgaon' },
    { title: 'Product Manager', location: 'Mumbai' },
    { title: 'UI/UX Designer', location: 'Chennai' }
  ];

  const jobPlatforms = [
    { id: 'linkedin', name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/' },
    { id: 'indeed', name: 'Indeed', url: 'https://www.indeed.co.in/' },
    { id: 'naukri', name: 'Naukri.com', url: 'https://www.naukri.com/' },
    { id: 'shine', name: 'Shine.com', url: 'https://www.shine.com/' },
    { id: 'monster', name: 'Monster India', url: 'https://www.monsterindia.com/' },
    { id: 'glassdoor', name: 'Glassdoor', url: 'https://www.glassdoor.co.in/' }
  ];

  const popularCompanies = [
    { name: 'Google', url: 'https://careers.google.com/jobs/results/' },
    { name: 'Microsoft', url: 'https://careers.microsoft.com/us/en' },
    { name: 'Amazon', url: 'https://www.amazon.jobs/en/' },
    { name: 'Flipkart', url: 'https://www.flipkartcareers.com/' },
    { name: 'Infosys', url: 'https://www.infosys.com/careers.html' },
    { name: 'TCS', url: 'https://www.tcs.com/careers' },
    { name: 'Wipro', url: 'https://careers.wipro.com/' },
    { name: 'Accenture', url: 'https://www.accenture.com/in-en/careers' }
  ];

  const generateSearchUrl = () => {
    const baseUrls = {
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`,
      indeed: `https://www.indeed.co.in/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}`,
      naukri: `https://www.naukri.com/${encodeURIComponent(searchQuery.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(location.replace(/\s+/g, '-'))}`,
      shine: `https://www.shine.com/job-search/${encodeURIComponent(searchQuery.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(location.replace(/\s+/g, '-'))}`,
      monster: `https://www.monsterindia.com/search/${encodeURIComponent(searchQuery.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(location.replace(/\s+/g, '-'))}`,
      glassdoor: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchQuery)}&locT=C&locId=115&locKeyword=${encodeURIComponent(location)}`
    };
    return baseUrls[selectedPlatform as keyof typeof baseUrls];
  };

  const applyQuickSearch = (search: { title: string; location: string }) => {
    setSearchQuery(search.title);
    setLocation(search.location);
  };

  const openJobSearch = () => {
    const url = generateSearchUrl();
    window.open(url, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Quick Job Finder | ResumeCVForge</title>
        <meta name="description" content="Find latest job openings across multiple platforms" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Quick Job Finder
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover latest job openings across top platforms and add them to your site instantly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Search Section */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Search className="mr-3 text-blue-600" />
                  Find Latest Jobs
                </h2>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search Platform
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {jobPlatforms.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedPlatform === platform.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{platform.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., Software Developer, Data Analyst..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Bangalore, Hyderabad..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={openJobSearch}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Zap className="mr-2" size={20} />
                  Search on {jobPlatforms.find(p => p.id === selectedPlatform)?.name}
                </button>
              </div>

              {/* Direct Company Careers */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Building className="mr-2 text-purple-600" />
                  Direct Company Career Pages
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularCompanies.map(company => (
                    <a
                      key={company.name}
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center group"
                    >
                      <div className="font-medium text-sm mb-1">{company.name}</div>
                      <ExternalLink size={14} className="mx-auto text-purple-600 group-hover:text-purple-700" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Searches */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="mr-2 text-green-600" />
                  Popular Quick Searches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => applyQuickSearch(search)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-semibold text-gray-800">{search.title}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {search.location}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Add Template */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Plus className="mr-2 text-green-600" />
                  Quick Add Jobs
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/admin/job-posting"
                    className="block bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Add Single Job
                  </Link>
                  <Link
                    to="/admin/job-posting?tab=bulk"
                    className="block bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                  >
                    Bulk Upload Jobs
                  </Link>
                  <Link
                    to="/admin/job-drives"
                    className="block bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                  >
                    Add Walk-in Drive
                  </Link>
                </div>
              </div>

              {/* Job Templates */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Templates</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setSearchQuery('Software Developer');
                      setLocation('Bangalore');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg text-left transition-colors"
                  >
                    <div className="font-semibold">💻 Software Developer</div>
                    <div className="text-sm text-gray-600">IT/Software • Full-time</div>
                  </button>
                  <button 
                    onClick={() => {
                      setSearchQuery('Data Analyst');
                      setLocation('Hyderabad');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg text-left transition-colors"
                  >
                    <div className="font-semibold">📊 Data Analyst</div>
                    <div className="text-sm text-gray-600">Data Science • Full-time</div>
                  </button>
                  <button 
                    onClick={() => {
                      setSearchQuery('UI/UX Designer');
                      setLocation('Pune');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg text-left transition-colors"
                  >
                    <div className="font-semibold">🎨 UI/UX Designer</div>
                    <div className="text-sm text-gray-600">Design • Full-time</div>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Search on multiple platforms for comprehensive results</li>
                  <li>• Use specific job titles for better matches</li>
                  <li>• Check company career pages directly</li>
                  <li>• Set up job alerts on platforms</li>
                  <li>• Use boolean search for advanced filtering</li>
                  <li>• Bookmark this page for quick access</li>
                </ul>
              </div>

              {/* Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📈 Job Market</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Bangalore: 45% IT jobs</p>
                  <p>• Hyderabad: Growing tech hub</p>
                  <p>• Remote jobs: +300% since 2020</p>
                  <p>• Average salary: ₹8-15 LPA</p>
                  <p>• Top sectors: IT, Healthcare, E-commerce</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">⚡ Quick Actions</h4>
                <div className="space-y-2">
                  <Link
                    to="/quick-job-finder"
                    className="block bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors text-center"
                  >
                    Refresh Job Search
                  </Link>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocation('');
                    }}
                    className="w-full bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickJobFinder;