// src/components/JobApplications.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applyLink: string;
  featured?: boolean;
  source?: string;
  isReal?: boolean;
  addedTimestamp?: number; // New field to track when job was added
}

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [manualJobs, setManualJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [_, setApiSource] = useState<string>('rss');

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // Load all jobs from localStorage
  const loadAllJobsFromStorage = (): Job[] => {
    try {
      const storedJobs = localStorage.getItem('allJobs');
      return storedJobs ? JSON.parse(storedJobs) : [];
    } catch (error) {
      console.error('Error loading jobs from storage:', error);
      return [];
    }
  };

  // Save all jobs to localStorage
  const saveAllJobsToStorage = (jobs: Job[]) => {
    try {
      localStorage.setItem('allJobs', JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving jobs to storage:', error);
    }
  };

  // Load manual jobs from localStorage
  useEffect(() => {
    const savedManualJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    setManualJobs(savedManualJobs);
  }, []);

  // Fetch REAL jobs from RSS feeds
  const fetchRSSJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/.netlify/functions/jobs-rss');
      
      if (!response.ok) {
        throw new Error('Failed to fetch real jobs');
      }
      
      const data = await response.json();
      
      if (data.jobs && data.jobs.length > 0) {
        // Add timestamp to RSS jobs
        const rssJobsWithTimestamp = data.jobs.map((job: Job) => ({
          ...job,
          addedTimestamp: job.addedTimestamp || Date.now(),
          isReal: true
        }));

        // Load existing jobs from storage
        const existingJobs = loadAllJobsFromStorage();
        
        // Create a map of existing jobs by ID for quick lookup
        const existingJobsMap = new Map(existingJobs.map(job => [job.id, job]));
        
        // Merge jobs: keep existing jobs, add new RSS jobs, update existing RSS jobs
        const mergedJobs = [...existingJobs];
        
        rssJobsWithTimestamp.forEach((rssJob: Job) => {
          const existingJob = existingJobsMap.get(rssJob.id);
          if (existingJob) {
            // Update existing job but preserve manual additions
            Object.assign(existingJob, {
              ...rssJob,
              // Don't overwrite manual fields if this was a manually added job
              addedTimestamp: existingJob.addedTimestamp || rssJob.addedTimestamp
            });
          } else {
            // Add new RSS job
            mergedJobs.push(rssJob);
          }
        });

        // Add manual jobs that aren't already in the list
        manualJobs.forEach(manualJob => {
          if (!existingJobsMap.has(manualJob.id)) {
            mergedJobs.push({
              ...manualJob,
              addedTimestamp: manualJob.addedTimestamp || Date.now()
            });
          }
        });

        // Sort by timestamp (newest first)
        mergedJobs.sort((a, b) => {
          const timeA = a.addedTimestamp || new Date(a.postedDate).getTime();
          const timeB = b.addedTimestamp || new Date(b.postedDate).getTime();
          return timeB - timeA;
        });

        // Save to storage
        saveAllJobsToStorage(mergedJobs);
        setJobs(mergedJobs);
        setApiSource('rss');
        console.log(`Loaded ${mergedJobs.length} jobs (${rssJobsWithTimestamp.length} from RSS)`);
      } else {
        throw new Error('No jobs found in RSS feeds');
      }
      
    } catch (err) {
      setError('Using stored jobs. Real jobs will load soon.');
      // Fallback to stored jobs or sample jobs
      loadStoredJobs();
    } finally {
      setLoading(false);
    }
  };

  // Load jobs from storage as fallback
  const loadStoredJobs = () => {
    const storedJobs = loadAllJobsFromStorage();
    
    if (storedJobs.length > 0) {
      // Sort by timestamp (newest first)
      const sortedJobs = [...storedJobs].sort((a, b) => {
        const timeA = a.addedTimestamp || new Date(a.postedDate).getTime();
        const timeB = b.addedTimestamp || new Date(b.postedDate).getTime();
        return timeB - timeA;
      });
      setJobs(sortedJobs);
      setApiSource('storage');
      console.log(`Loaded ${sortedJobs.length} jobs from storage`);
    } else {
      loadSampleJobs();
    }
  };

  // Sample jobs as fallback
  const loadSampleJobs = () => {
    const sampleJobs: Job[] = [
      {
        id: 'sample-1',
        title: "Software Developer",
        company: "Various Indian Companies",
        location: "Bangalore, Karnataka",
        type: "Full-time",
        sector: "IT/Software",
        salary: "Based on experience",
        description: "Real job opportunities from Indian companies. Positions updated regularly through RSS feeds.",
        requirements: [
          "Check specific company requirements",
          "Visit company websites for details",
          "Tailor your resume accordingly"
        ],
        postedDate: new Date().toISOString().split('T')[0],
        applyLink: "#",
        featured: true,
        source: "sample",
        isReal: false,
        addedTimestamp: Date.now()
      }
    ];

    // Combine with manual jobs and sort
    const allJobs = [...sampleJobs, ...manualJobs].map(job => ({
      ...job,
      addedTimestamp: job.addedTimestamp || Date.now()
    })).sort((a, b) => b.addedTimestamp! - a.addedTimestamp!);

    // Save to storage
    saveAllJobsToStorage(allJobs);
    setJobs(allJobs);
    setApiSource('sample');
  };

  // Initial load
  useEffect(() => {
    fetchRSSJobs();
  }, [manualJobs]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just filter existing jobs
    // In future, we can enhance to search RSS feeds
    setError('Search currently filters existing jobs. RSS search coming soon!');
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
  };

  // Refresh jobs
  const refreshJobs = () => {
    fetchRSSJobs();
  };

  // Clear all stored jobs (useful for debugging)
  const clearStoredJobs = () => {
    if (window.confirm('Are you sure you want to clear all stored jobs? This will reset to RSS feeds only.')) {
      localStorage.removeItem('allJobs');
      fetchRSSJobs();
    }
  };

  const sectors = ['all', 'IT/Software', 'Engineering', 'Data Science', 'Marketing', 'HR', 'Finance', 'Healthcare'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  const filteredJobs = jobs.filter(job => {
    const matchesSector = selectedSector === 'all' || job.sector === selectedSector;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSector && matchesType && matchesSearch && matchesLocation;
  });

  const featuredJobs = jobs.filter(job => job.featured);
  const realJobsCount = jobs.filter(job => job.isReal).length;

  return (
    <>
      <Helmet>
        <title>Real Job Opportunities in India | ResumeCVForge</title>
        <meta name="description" content="Browse real job opportunities from Indian companies. Updated daily from multiple job portals." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Indian Job Opportunities</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Live job postings from top Indian companies. Updated automatically every day.
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or state in India"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Loading Jobs...' : 'Find Jobs'}
                </button>
              </div>
            </div>
          </form>

          {/* Popular Cities Quick Filters */}
          <div className="mt-6">
            <p className="text-blue-100 mb-3">Popular Locations:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Live Status */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-blue-100">Live Job Feed Active</span>
            </div>
            <button 
              onClick={refreshJobs}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Refresh Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky-sidebar">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>
                
                {/* Sector Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>
                        {sector === 'all' ? 'All Industries' : sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Live Stats</h4>
                  <p className="text-sm text-gray-600">{filteredJobs.length} jobs showing</p>
                  <p className="text-sm text-gray-600">{realJobsCount} real-time jobs</p>
                  <p className="text-sm text-gray-600">{jobs.filter(j => j.type === 'Remote').length} remote positions</p>
                  <p className="text-sm text-gray-600">{jobs.length} total stored jobs</p>
                  <button 
                    onClick={clearStoredJobs}
                    className="text-xs text-red-600 hover:text-red-800 mt-2"
                    title="Clear all stored jobs"
                  >
                    Clear Storage
                  </button>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-blue-800 mb-2">Build Your Resume</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create an ATS-friendly resume for these real job opportunities.
                </p>
                <Link 
                  to="/builder" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>

              {/* Admin Quick Access */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-green-800 mb-2">Add More Jobs</h3>
                <p className="text-green-700 text-sm mb-3">
                  Post additional job opportunities manually.
                </p>
                <Link 
                  to="/admin/job-posting" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center"
                >
                  Post New Job
                </Link>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading real Indian job opportunities...</p>
                  <p className="text-sm text-gray-500 mt-2">Fetching from multiple job portals</p>
                </div>
              ) : (
                <>
                  {/* Data Source Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-semibold">
                          ✅ Live Job Feed Active
                        </p>
                        <p className="text-green-700 text-sm">
                          Showing {realJobsCount} real-time jobs from Indian job portals
                        </p>
                        <p className="text-green-700 text-sm">
                          {jobs.length} total jobs stored • Sorted by newest first
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-sm">Updated: {new Date().toLocaleTimeString()}</p>
                        <button 
                          onClick={refreshJobs}
                          className="text-green-700 hover:text-green-900 text-sm font-semibold"
                        >
                          Refresh Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Featured Jobs */}
                  {featuredJobs.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Opportunities</h2>
                      <div className="space-y-4">
                        {featuredJobs.map(job => (
                          <JobCard key={job.id} job={job} featured />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Jobs */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {selectedSector === 'all' ? 'All Job Opportunities' : `${selectedSector} Jobs`} 
                    <span className="text-gray-600 text-lg ml-2">({filteredJobs.length})</span>
                  </h2>
                  
                  {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                      <button 
                        onClick={() => {
                          setSelectedSector('all');
                          setSelectedType('all');
                          setSearchTerm('');
                          setLocationFilter('');
                          fetchRSSJobs();
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Filters & Reload
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Job Scraping</h3>
              <p className="text-gray-600">Automatically fetches real jobs from multiple Indian job portals every day</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Storage</h3>
              <p className="text-gray-600">Jobs are stored locally and sorted with newest opportunities first</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Applications</h3>
              <p className="text-gray-600">Apply directly to companies with your professionally built resume</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Job Card Component
const JobCard: React.FC<{ job: Job; featured?: boolean }> = ({ job, featured = false }) => {
  const isRealJob = job.isReal;
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000; // New if less than 24 hours old
  
  return (
    <div className={`job-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
      featured ? 'featured-job border-l-4 border-blue-500' : ''
    } ${isRealJob ? 'border-l-4 border-green-500' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
              <p className="text-lg text-gray-700 mb-2">{job.company} • {job.location}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {isNewJob && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
              {featured && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              {isRealJob && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Real Job
                </span>
              )}
              {job.source && (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                  {job.source}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {job.type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              {job.sector}
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
              {job.salary}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{job.description}</p>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Posted {new Date(job.postedDate).toLocaleDateString()}
            {isRealJob && ' • Live from job portals'}
            {job.addedTimestamp && ` • Added ${new Date(job.addedTimestamp).toLocaleDateString()}`}
          </p>
        </div>

        <div className="lg:ml-6 lg:text-right mt-4 lg:mt-0 flex flex-col gap-2">
          <a 
            href={job.applyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Apply Now
          </a>
          <Link 
            to="/builder" 
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
          >
            Build Resume First
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;