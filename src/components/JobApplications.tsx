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
}

const JobApplications: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>('adzuna'); // 'adzuna' or 'ncs'

  // Popular Indian cities for quick filters
  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon', 'Noida'
  ];

  // Fetch jobs from Adzuna India API
  const fetchAdzunaJobs = async (what: string = '', where: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (what) params.append('what', what);
      if (where) params.append('where', where);
      params.append('results_per_page', '30');
      
      const response = await fetch(`/.netlify/functions/jobs-india?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      
      // Transform Adzuna India data to our format
      const transformedJobs: Job[] = data.results.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Company not specified',
        location: job.location?.display_name || 'Location not specified',
        type: mapContractType(job.contract_type) || 'Full-time',
        sector: job.category?.label || 'IT/Software',
        salary: formatSalary(job.salary_min, job.salary_max, 'INR'),
        description: job.description || 'No description available',
        requirements: extractRequirements(job.description),
        postedDate: job.created,
        applyLink: job.redirect_url || '#',
        featured: Math.random() > 0.85
      }));
      
      setJobs(transformedJobs);
      setApiSource('adzuna');
    } catch (err) {
      setError('Failed to load jobs from Adzuna. Trying alternative source...');
      // Fallback to mock data
      loadMockIndianJobs();
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data for Indian jobs
  const loadMockIndianJobs = () => {
    const mockIndianJobs: Job[] = [
      {
        id: '1',
        title: "Full Stack Developer",
        company: "Tech Mahindra",
        location: "Bangalore, Karnataka",
        type: "Full-time",
        sector: "IT/Software",
        salary: "₹8,00,000 - ₹15,00,000 PA",
        description: "Looking for a Full Stack Developer with experience in React, Node.js, and MongoDB. You will be responsible for developing and maintaining web applications.",
        requirements: [
          "3+ years of experience in full stack development",
          "Proficiency in React.js and Node.js",
          "Experience with MongoDB or SQL databases",
          "Knowledge of RESTful APIs and microservices"
        ],
        postedDate: "2024-01-15",
        applyLink: "#",
        featured: true
      },
      {
        id: '2',
        title: "Data Scientist",
        company: "Infosys",
        location: "Hyderabad, Telangana",
        type: "Full-time",
        sector: "Data Science",
        salary: "₹10,00,000 - ₹18,00,000 PA",
        description: "Join our data science team to work on cutting-edge AI and ML projects for enterprise clients.",
        requirements: [
          "Master's degree in Data Science or related field",
          "Experience with Python, R, and machine learning libraries",
          "Knowledge of statistical analysis and data visualization",
          "Experience with big data technologies"
        ],
        postedDate: "2024-01-14",
        applyLink: "#"
      },
      {
        id: '3',
        title: "Mechanical Design Engineer",
        company: "TATA Motors",
        location: "Pune, Maharashtra",
        type: "Full-time",
        sector: "Engineering",
        salary: "₹6,00,000 - ₹12,00,000 PA",
        description: "Design and develop mechanical components for automotive applications.",
        requirements: [
          "Bachelor's degree in Mechanical Engineering",
          "3+ years of experience in mechanical design",
          "Proficiency in CAD software (SolidWorks, CATIA)",
          "Knowledge of GD&T and manufacturing processes"
        ],
        postedDate: "2024-01-13",
        applyLink: "#"
      },
      {
        id: '4',
        title: "Digital Marketing Manager",
        company: "Flipkart",
        location: "Remote",
        type: "Remote",
        sector: "Marketing",
        salary: "₹7,00,000 - ₹14,00,000 PA",
        description: "Manage digital marketing campaigns and strategies for e-commerce platform.",
        requirements: [
          "4+ years of digital marketing experience",
          "Expertise in SEO, SEM, and social media marketing",
          "Experience with analytics tools (Google Analytics)",
          "E-commerce marketing experience preferred"
        ],
        postedDate: "2024-01-12",
        applyLink: "#"
      },
      {
        id: '5',
        title: "Civil Engineer",
        company: "Larsen & Toubro",
        location: "Mumbai, Maharashtra",
        type: "Full-time",
        sector: "Engineering",
        salary: "₹5,00,000 - ₹10,00,000 PA",
        description: "Work on infrastructure projects including buildings, roads, and bridges.",
        requirements: [
          "Bachelor's degree in Civil Engineering",
          "2+ years of site experience",
          "Knowledge of AutoCAD and project management",
          "Familiarity with Indian construction standards"
        ],
        postedDate: "2024-01-11",
        applyLink: "#"
      },
      {
        id: '6',
        title: "HR Recruiter",
        company: "Wipro",
        location: "Chennai, Tamil Nadu",
        type: "Full-time",
        sector: "HR",
        salary: "₹4,00,000 - ₹8,00,000 PA",
        description: "Handle end-to-end recruitment process for IT and non-IT positions.",
        requirements: [
          "2+ years of recruitment experience",
          "Knowledge of recruitment tools and portals",
          "Excellent communication skills",
          "Experience in bulk hiring preferred"
        ],
        postedDate: "2024-01-10",
        applyLink: "#"
      }
    ];

    setJobs(mockIndianJobs);
    setApiSource('mock');
  };

  // Helper function to format salary in Indian Rupees
  const formatSalary = (min: number, max: number, currency: string): string => {
    if (!min && !max) return 'Salary not disclosed';
    
    if (currency === 'INR') {
      const formatLakhs = (amount: number) => {
        if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(2)} LPA`;
        }
        return `₹${amount.toLocaleString()} PA`;
      };
      
      if (min && max) {
        return `${formatLakhs(min)} - ${formatLakhs(max)}`;
      }
      return min ? formatLakhs(min) : formatLakhs(max);
    }
    
    return min && max ? `₹${min.toLocaleString()} - ₹${max.toLocaleString()} PA` : 'Salary not disclosed';
  };

  // Map contract types to familiar terms
  const mapContractType = (contractType: string): string => {
    const typeMap: { [key: string]: string } = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'permanent': 'Full-time',
      'freelance': 'Freelance'
    };
    return typeMap[contractType] || contractType || 'Full-time';
  };

  // Extract requirements from job description
  const extractRequirements = (description: string): string[] => {
    if (!description) return ['Requirements not specified'];
    
    const requirements: string[] = [];
    const desc = description.toLowerCase();
    
    // Indian job market specific keywords
    if (desc.includes('bachelor') || desc.includes('b.tech') || desc.includes('degree')) {
      requirements.push('Bachelor\'s degree required');
    }
    if (desc.includes('experience') || desc.includes('years')) {
      requirements.push('Relevant experience required');
    }
    if (desc.includes('javascript') || desc.includes('python') || desc.includes('java')) {
      requirements.push('Programming skills required');
    }
    if (desc.includes('communication') || desc.includes('english')) {
      requirements.push('Good communication skills');
    }
    
    return requirements.length > 0 ? requirements : ['See job description for requirements'];
  };

  // Initial load
  useEffect(() => {
    fetchAdzunaJobs();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdzunaJobs(searchTerm, locationFilter);
  };

  // Handle city quick filter
  const handleCityFilter = (city: string) => {
    setLocationFilter(city);
    fetchAdzunaJobs(searchTerm, city);
  };

  const sectors = ['all', 'IT/Software', 'Engineering', 'Data Science', 'Marketing', 'HR', 'Finance', 'Healthcare'];
  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  const filteredJobs = jobs.filter(job => {
    const matchesSector = selectedSector === 'all' || job.sector === selectedSector;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    
    return matchesSector && matchesType;
  });

  const featuredJobs = jobs.filter(job => job.featured);

  return (
    <>
      <Helmet>
        <title>Job Opportunities in India | ResumeCVForge - Find Your Dream Job</title>
        <meta name="description" content="Browse real job opportunities from top Indian companies. Apply directly and use our resume builder to create the perfect application." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job in India</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Browse opportunities from top Indian companies and apply with your professionally crafted resume
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City or state in India"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find Jobs'}
                </button>
              </div>
            </div>
          </form>

          {/* Popular Cities Quick Filters */}
          <div className="mt-6">
            <p className="text-green-100 mb-3">Popular Locations:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityFilter(city)}
                  className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
              <button 
                onClick={() => fetchAdzunaJobs()}
                className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
              >
                Try Again
              </button>
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
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <h4 className="font-semibold text-gray-800 mb-2">Quick Stats</h4>
                  <p className="text-sm text-gray-600">{filteredJobs.length} jobs found</p>
                  <p className="text-sm text-gray-600">{jobs.filter(j => j.type === 'Remote').length} remote positions</p>
                  <p className="text-sm text-gray-600">{jobs.filter(j => j.location.includes('Bangalore')).length} in Bangalore</p>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-green-800 mb-2">Indian Resume Format</h3>
                <p className="text-green-700 text-sm mb-4">
                  Create an ATS-friendly resume optimized for Indian companies.
                </p>
                <Link 
                  to="/builder" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading Indian job opportunities...</p>
                </div>
              ) : (
                <>
                  {/* Data Source Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      Showing jobs from {apiSource === 'adzuna' ? 'real-time Indian job market' : 'our curated database'}
                    </p>
                  </div>

                  {/* Featured Jobs */}
                  {featuredJobs.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Indian Jobs</h2>
                      <div className="space-y-4">
                        {featuredJobs.map(job => (
                          <JobCard key={job.id} job={job} featured />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Jobs */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {selectedSector === 'all' ? 'All Indian Jobs' : `${selectedSector} Jobs in India`} 
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
                          fetchAdzunaJobs();
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

      {/* Newsletter Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Indian Job Alerts</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Stay updated with the latest job opportunities in Indian companies. We'll send you personalized job matches.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

// Job Card Component
const JobCard: React.FC<{ job: Job; featured?: boolean }> = ({ job, featured = false }) => {
  return (
    <div className={`job-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${featured ? 'featured-job border-l-4 border-green-500' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
              <p className="text-lg text-gray-700 mb-2">{job.company} • {job.location}</p>
            </div>
            {featured && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="job-type-badge bg-blue-100 text-blue-800">
              {job.type}
            </span>
            <span className="job-sector-badge bg-purple-100 text-purple-800">
              {job.sector}
            </span>
            <span className="salary-badge bg-orange-100 text-orange-800">
              {job.salary}
            </span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Key Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.requirements.slice(0, 3).map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Posted {new Date(job.postedDate).toLocaleDateString()}
          </p>
        </div>

        <div className="lg:ml-6 lg:text-right mt-4 lg:mt-0 flex flex-col gap-2">
          <a 
            href={job.applyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
          >
            Apply Now
          </a>
          <Link 
            to="/builder" 
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
          >
            Build Resume First
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;