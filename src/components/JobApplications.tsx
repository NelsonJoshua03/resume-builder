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
  isReal?: boolean;
  addedTimestamp?: number;
  page?: number; // For multi-page organization
}

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 10;

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // Load manual jobs from localStorage
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    
    // Add page numbers if not present (for backward compatibility)
    const jobsWithPages = savedJobs.map((job: Job, index: number) => ({
      ...job,
      page: job.page || Math.floor(index / jobsPerPage) + 1,
      addedTimestamp: job.addedTimestamp || Date.now()
    }));

    setJobs(jobsWithPages);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSector('all');
    setSelectedType('all');
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  const sectors = ['all', 'IT/Software', 'Engineering', 'Data Science', 'Marketing', 'HR', 'Finance', 'Healthcare', 'Education', 'Sales'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];

  const filteredJobs = jobs.filter(job => {
    const matchesSector = selectedSector === 'all' || job.sector === selectedSector;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSector && matchesType && matchesSearch && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const featuredJobs = jobs.filter(job => job.featured);
  const totalJobsCount = jobs.length;

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Job Opportunities | ResumeCVForge</title>
        <meta name="description" content="Browse manually posted job opportunities from various companies." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Opportunities</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Manually curated job postings from various companies.
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
                  placeholder="City or state"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Find Jobs
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

          {/* Stats */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-100">Total Jobs: {totalJobsCount}</span>
            </div>
            <button 
              onClick={clearFilters}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky-sidebar">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Sector Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Job Stats</h4>
                  <p className="text-sm text-gray-600">{filteredJobs.length} jobs found</p>
                  <p className="text-sm text-gray-600">{totalJobsCount} total jobs</p>
                  <p className="text-sm text-gray-600">{jobs.filter(j => j.type === 'Remote').length} remote positions</p>
                  <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-blue-800 mb-2">Build Your Resume</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create an ATS-friendly resume for these job opportunities.
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
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold">
                      📋 Manually Curated Jobs
                    </p>
                    <p className="text-blue-700 text-sm">
                      Showing {filteredJobs.length} filtered jobs from our database
                    </p>
                    <p className="text-blue-700 text-sm">
                      {totalJobsCount} total jobs • Sorted by newest first
                    </p>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedSector === 'all' ? 'All Job Opportunities' : `${selectedSector} Jobs`} 
                  <span className="text-gray-600 text-lg ml-2">({filteredJobs.length})</span>
                </h2>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
              
              {currentJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 rounded-lg border ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Job Card Component (unchanged)
const JobCard: React.FC<{ job: Job; featured?: boolean }> = ({ job, featured = false }) => {
  const isNewJob = job.addedTimestamp && (Date.now() - job.addedTimestamp) < 24 * 60 * 60 * 1000;
  
  return (
    <div className={`job-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
      featured ? 'featured-job border-l-4 border-blue-500' : ''
    }`}>
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