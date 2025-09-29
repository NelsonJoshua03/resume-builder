// src/components/AdminJobPosting.tsx
import React, { useState, useEffect, useRef } from 'react';
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

const AdminJobPosting: React.FC = () => {
  const [job, setJob] = useState<Omit<Job, 'id' | 'postedDate'>>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    sector: 'IT/Software',
    salary: '',
    description: '',
    requirements: [],
    applyLink: '',
    featured: false
  });

  const [requirementsInput, setRequirementsInput] = useState<string>('');
  const [manualJobs, setManualJobs] = useState<Job[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [bulkJsonInput, setBulkJsonInput] = useState<string>('');
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing manual jobs on component mount
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    setManualJobs(savedJobs);
  }, []);

  // Single job submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: Job = {
      ...job,
      id: `manual-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      requirements: requirementsInput.split('\n')
        .filter(req => req.trim() !== '')
        .map(req => req.trim())
    };

    const updatedJobs = [...manualJobs, newJob];
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    setShowSuccess(true);
    // Reset form
    setJob({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      sector: 'IT/Software',
      salary: '',
      description: '',
      requirements: [],
      applyLink: '',
      featured: false
    });
    setRequirementsInput('');

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Bulk job upload from JSON
  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobsData = JSON.parse(bulkJsonInput);
      
      if (!Array.isArray(jobsData)) {
        throw new Error('JSON must be an array of job objects');
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      const newJobs: Job[] = jobsData.map((jobData, index) => {
        try {
          // Validate required fields
          if (!jobData.title || !jobData.company || !jobData.location) {
            throw new Error(`Job ${index + 1}: Missing required fields (title, company, location)`);
          }

          const newJob: Job = {
            id: `manual-bulk-${Date.now()}-${index}`,
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            type: jobData.type || 'Full-time',
            sector: jobData.sector || 'IT/Software',
            salary: jobData.salary || '',
            description: jobData.description || '',
            requirements: Array.isArray(jobData.requirements) 
              ? jobData.requirements 
              : (jobData.requirements ? [jobData.requirements] : ['See job description for requirements']),
            applyLink: jobData.applyLink || '#',
            featured: jobData.featured || false,
            postedDate: new Date().toISOString().split('T')[0]
          };

          successCount++;
          return newJob;
        } catch (error) {
          failedCount++;
          errors.push(error instanceof Error ? error.message : `Job ${index + 1}: Invalid format`);
          return null;
        }
      }).filter((job): job is Job => job !== null);

      if (newJobs.length > 0) {
        const updatedJobs = [...manualJobs, ...newJobs];
        setManualJobs(updatedJobs);
        localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
      }

      setBulkUploadResults({
        success: successCount,
        failed: failedCount,
        errors
      });

      if (successCount > 0) {
        setBulkJsonInput(''); // Clear input on successful upload
      }
    } catch (error) {
      setBulkUploadResults({
        success: 0,
        failed: 0,
        errors: ['Invalid JSON format. Please check your JSON syntax.']
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setBulkJsonInput(content);
        
        // Auto-validate the JSON
        JSON.parse(content);
        setBulkUploadResults(null); // Clear previous results
      } catch (error) {
        setBulkUploadResults({
          success: 0,
          failed: 0,
          errors: ['Invalid JSON file. Please check the file format.']
        });
      }
    };
    reader.readAsText(file);
  };

  // Download template JSON
  const downloadTemplate = () => {
    const template = [
      {
        "title": "Frontend Developer",
        "company": "Tech Solutions India",
        "location": "Bangalore, Karnataka",
        "type": "Full-time",
        "sector": "IT/Software",
        "salary": "₹8,00,000 - ₹15,00,000 PA",
        "description": "We are looking for a skilled Frontend Developer with experience in React.js...",
        "requirements": [
          "2+ years of experience with React.js",
          "Proficiency in JavaScript and modern frameworks",
          "Experience with responsive web design"
        ],
        "applyLink": "mailto:careers@company.com",
        "featured": true
      },
      {
        "title": "Data Analyst",
        "company": "Data Insights Corp",
        "location": "Hyderabad, Telangana",
        "type": "Full-time",
        "sector": "Data Science",
        "salary": "₹6,00,000 - ₹12,00,000 PA",
        "description": "Seeking a Data Analyst to interpret and analyze complex data sets...",
        "requirements": [
          "Bachelor's degree in Statistics or related field",
          "Experience with SQL and Python",
          "Knowledge of data visualization tools"
        ],
        "applyLink": "https://company.com/careers/data-analyst",
        "featured": false
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job-postings-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export current jobs
  const exportJobs = () => {
    const blob = new Blob([JSON.stringify(manualJobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumecvforge-jobs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteJob = (jobId: string) => {
    const updatedJobs = manualJobs.filter(job => job.id !== jobId);
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
  };

  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to delete all manually posted jobs? This action cannot be undone.')) {
      setManualJobs([]);
      localStorage.setItem('manualJobs', '[]');
    }
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];
  const sectors = [
    'IT/Software', 'Engineering', 'Data Science', 'Marketing', 
    'HR', 'Finance', 'Healthcare', 'Education', 'Sales', 'Design'
  ];

  const popularLocations = [
    'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Delhi', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Kolkata, West Bengal', 
    'Ahmedabad, Gujarat', 'Remote', 'Gurgaon, Haryana', 'Noida, Uttar Pradesh'
  ];

  return (
    <>
      <Helmet>
        <title>Admin Job Posting | ResumeCVForge</title>
        <meta name="description" content="Post new job opportunities on ResumeCVForge" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/job-applications" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Job Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Posting</h1>
            <p className="text-gray-600">Add new job opportunities to the website</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Job posted successfully! It will now appear on the Job Applications page.
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'single'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Single Job Posting
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'bulk'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bulk Job Upload
                </button>
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'single' ? (
                /* Single Job Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Post New Job</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={job.title}
                          onChange={e => setJob({...job, title: e.target.value})}
                          placeholder="e.g., Frontend Developer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={job.company}
                          onChange={e => setJob({...job, company: e.target.value})}
                          placeholder="e.g., Tech Solutions India"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Location and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          required
                          value={job.location}
                          onChange={e => setJob({...job, location: e.target.value})}
                          placeholder="e.g., Bangalore, Karnataka"
                          list="locations"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <datalist id="locations">
                          {popularLocations.map(location => (
                            <option key={location} value={location} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Type *
                        </label>
                        <select
                          required
                          value={job.type}
                          onChange={e => setJob({...job, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {jobTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sector and Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sector/Industry *
                        </label>
                        <select
                          required
                          value={job.sector}
                          onChange={e => setJob({...job, sector: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Salary Range
                        </label>
                        <input
                          type="text"
                          value={job.salary}
                          onChange={e => setJob({...job, salary: e.target.value})}
                          placeholder="e.g., ₹8,00,000 - ₹15,00,000 PA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Description *
                      </label>
                      <textarea
                        required
                        value={job.description}
                        onChange={e => setJob({...job, description: e.target.value})}
                        placeholder="Describe the job role, responsibilities, and what you're looking for in a candidate..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements (one per line) *
                      </label>
                      <textarea
                        required
                        value={requirementsInput}
                        onChange={e => setRequirementsInput(e.target.value)}
                        placeholder="2+ years of experience with React...
Proficiency in JavaScript...
Bachelor's degree in Computer Science..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter each requirement on a new line. These will be displayed as bullet points.
                      </p>
                    </div>

                    {/* Apply Link and Featured */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apply Link/Email *
                        </label>
                        <input
                          type="text"
                          required
                          value={job.applyLink}
                          onChange={e => setJob({...job, applyLink: e.target.value})}
                          placeholder="e.g., mailto:careers@company.com or https://company.com/careers"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={job.featured}
                          onChange={e => setJob({...job, featured: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                          Mark as Featured Job
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Post Job Opportunity
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Bulk Upload Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Job Upload</h2>
                  
                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload JSON File
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a JSON file containing an array of job objects
                    </p>
                  </div>

                  {/* JSON Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or paste JSON directly
                    </label>
                    <textarea
                      value={bulkJsonInput}
                      onChange={e => setBulkJsonInput(e.target.value)}
                      placeholder={`[
  {
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, State",
    "type": "Full-time",
    "sector": "IT/Software",
    "salary": "₹X,00,000 - ₹Y,00,000 PA",
    "description": "Job description...",
    "requirements": ["Requirement 1", "Requirement 2"],
    "applyLink": "mailto:careers@company.com",
    "featured": false
  }
]`}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  {/* Upload Results */}
                  {bulkUploadResults && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      bulkUploadResults.success > 0 && bulkUploadResults.failed === 0
                        ? 'bg-green-100 border border-green-400 text-green-700'
                        : bulkUploadResults.failed > 0
                        ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                        : 'bg-red-100 border border-red-400 text-red-700'
                    }`}>
                      <h4 className="font-semibold mb-2">Upload Results:</h4>
                      <p>Successfully uploaded: {bulkUploadResults.success} jobs</p>
                      <p>Failed: {bulkUploadResults.failed} jobs</p>
                      {bulkUploadResults.errors.length > 0 && (
                        <div className="mt-2">
                          <h5 className="font-medium">Errors:</h5>
                          <ul className="list-disc list-inside text-sm">
                            {bulkUploadResults.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={downloadTemplate}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Download Template
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={!bulkJsonInput.trim()}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Upload Jobs
                    </button>
                    <button
                      onClick={() => setBulkJsonInput('')}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview and Existing Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Posted Jobs ({manualJobs.length})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportJobs}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Export all jobs"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button
                      onClick={clearAllJobs}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Delete all jobs"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                {manualJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No jobs posted yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {manualJobs.map(manualJob => (
                      <div key={manualJob.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{manualJob.title}</h4>
                            <p className="text-sm text-gray-600">{manualJob.company}</p>
                            <p className="text-xs text-gray-500">{manualJob.location}</p>
                            <div className="flex gap-1 mt-1">
                              {manualJob.featured && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                  Featured
                                </span>
                              )}
                              {manualJob.id.startsWith('manual-bulk-') && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                  Bulk
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteJob(manualJob.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Delete job"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  {activeTab === 'single' ? 'Tips for Posting' : 'Bulk Upload Instructions'}
                </h4>
                {activeTab === 'single' ? (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use clear, descriptive job titles</li>
                    <li>• Include specific requirements</li>
                    <li>• Provide realistic salary ranges</li>
                    <li>• Use "mailto:" links for email applications</li>
                    <li>• Mark high-priority roles as "Featured"</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Download the template to get started</li>
                    <li>• JSON must be an array of job objects</li>
                    <li>• Required fields: title, company, location</li>
                    <li>• Use arrays for requirements field</li>
                    <li>• Validate JSON before uploading</li>
                  </ul>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Quick Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Total Jobs: {manualJobs.length}</p>
                  <p>• Featured Jobs: {manualJobs.filter(j => j.featured).length}</p>
                  <p>• Bulk Uploaded: {manualJobs.filter(j => j.id.startsWith('manual-bulk-')).length}</p>
                  <p>• Single Posted: {manualJobs.filter(j => !j.id.startsWith('manual-bulk-')).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminJobPosting;