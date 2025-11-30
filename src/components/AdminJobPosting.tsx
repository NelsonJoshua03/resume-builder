// src/components/AdminJobPosting.tsx - UPDATED WITH SEO & ANALYTICS
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { Zap, Copy, Download, Upload } from 'lucide-react';

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
  addedTimestamp?: number;
  page?: number;
}

const AdminJobPosting: React.FC = () => {
  const [job, setJob] = useState<Omit<Job, 'id' | 'postedDate' | 'addedTimestamp' | 'page'>>({
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
  
  const [batchCreate, setBatchCreate] = useState({
    baseTitle: '',
    companies: [''],
    locations: [''],
    count: 3
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackCTAClick, trackUserFlow, trackEvent } = useGoogleAnalytics();

  // Quick job templates optimized for Indian market
  const quickTemplates = {
    software_developer: {
      title: "Software Developer",
      company: "Tech Solutions India",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      sector: "IT/Software",
      salary: "₹6,00,000 - ₹12,00,000 PA",
      description: "We are looking for a skilled Software Developer to join our dynamic team. The ideal candidate will have strong programming skills and experience in modern web technologies.",
      requirements: [
        "2+ years of experience in software development",
        "Proficiency in JavaScript/TypeScript",
        "Experience with React/Node.js",
        "Knowledge of database systems",
        "Bachelor's degree in Computer Science or related field"
      ],
      applyLink: "mailto:careers@company.com"
    },
    data_analyst: {
      title: "Data Analyst",
      company: "Data Insights Corp",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      sector: "Data Science",
      salary: "₹5,00,000 - ₹10,00,000 PA",
      description: "Seeking a Data Analyst to interpret and analyze complex data sets. You will be responsible for data cleaning, analysis, and visualization.",
      requirements: [
        "Bachelor's degree in Statistics, Mathematics, or related field",
        "Experience with SQL and Python",
        "Knowledge of data visualization tools",
        "Strong analytical and problem-solving skills"
      ],
      applyLink: "mailto:hr@company.com"
    },
    mechanical_engineer: {
      title: "Mechanical Engineer",
      company: "Engineering Solutions Ltd",
      location: "Pune, Maharashtra",
      type: "Full-time", 
      sector: "Engineering",
      salary: "₹4,00,000 - ₹8,00,000 PA",
      description: "Looking for a Mechanical Engineer with experience in design and development. Knowledge of AutoCAD and SolidWorks required.",
      requirements: [
        "Bachelor's degree in Mechanical Engineering",
        "1-3 years of experience in mechanical design",
        "Proficiency in AutoCAD, SolidWorks",
        "Knowledge of manufacturing processes",
        "Good communication skills"
      ],
      applyLink: "mailto:careers@engineering.com"
    }
  };

  // Load existing manual jobs on component mount
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    setManualJobs(savedJobs);
    trackEvent('admin_page_view', { page: 'job_posting_admin' });
  }, [trackEvent]);

  // Apply quick template
  const applyTemplate = (templateKey: keyof typeof quickTemplates) => {
    const template = quickTemplates[templateKey];
    setJob({
      ...template,
      featured: false
    });
    setRequirementsInput(template.requirements.join('\n'));
    setActiveTab('single');
    trackButtonClick(`apply_template_${templateKey}`, 'quick_templates', 'admin_job_posting');
  };

  // Single job submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: Job = {
      ...job,
      id: `manual-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      addedTimestamp: Date.now(),
      requirements: requirementsInput.split('\n')
        .filter(req => req.trim() !== '')
        .map(req => req.trim()),
      page: Math.floor(manualJobs.length / 10) + 1
    };

    const updatedJobs = [...manualJobs, newJob];
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Track job posting
    trackButtonClick('post_single_job', 'job_form', 'admin_job_posting');
    trackUserFlow('admin_job_posting', 'job_posted', 'job_creation');
    trackEvent('job_posted', {
      job_type: 'single',
      job_title: job.title,
      company: job.company,
      sector: job.sector
    });
    
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

    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Bulk job upload from JSON
  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobsData = JSON.parse(bulkJsonInput);
      trackButtonClick('bulk_upload_jobs', 'bulk_upload', 'admin_job_posting');
      
      if (!Array.isArray(jobsData)) {
        throw new Error('JSON must be an array of job objects');
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      const newJobs: Job[] = jobsData.map((jobData, index) => {
        try {
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
            postedDate: new Date().toISOString().split('T')[0],
            addedTimestamp: Date.now(),
            page: Math.floor((manualJobs.length + index) / 10) + 1
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
        trackUserFlow('admin_job_posting', 'bulk_jobs_uploaded', 'job_creation');
        trackEvent('bulk_jobs_uploaded', {
          total_jobs: jobsData.length,
          successful_uploads: successCount,
          failed_uploads: failedCount
        });
      }

      setBulkUploadResults({
        success: successCount,
        failed: failedCount,
        errors
      });

      if (successCount > 0) {
        setBulkJsonInput('');
      }
    } catch (error) {
      trackButtonClick('bulk_upload_error', 'bulk_upload', 'admin_job_posting');
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

    trackButtonClick('upload_json_file', 'file_upload', 'admin_job_posting');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setBulkJsonInput(content);
        JSON.parse(content);
        setBulkUploadResults(null);
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

  // Generate batch jobs
  const generateBatchJobs = () => {
    const jobs = [];
    for (let i = 0; i < batchCreate.count; i++) {
      const company = batchCreate.companies[i % batchCreate.companies.length] || 'Tech Company';
      const location = batchCreate.locations[i % batchCreate.locations.length] || 'Bangalore, Karnataka';
      
      jobs.push({
        title: `${batchCreate.baseTitle} ${i + 1}`,
        company: company,
        location: location,
        type: "Full-time",
        sector: "IT/Software",
        salary: "₹6,00,000 - ₹12,00,000 PA",
        description: `We are hiring a ${batchCreate.baseTitle} to join our team at ${company}.`,
        requirements: ["2+ years experience", "Relevant skills", "Good communication"],
        applyLink: "mailto:careers@company.com",
        featured: i < 2
      });
    }
    setBulkJsonInput(JSON.stringify(jobs, null, 2));
    trackButtonClick('generate_batch_jobs', 'batch_creator', 'admin_job_posting');
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
        "title": "Mechanical Engineer",
        "company": "Engineering Corp",
        "location": "Chennai, Tamil Nadu",
        "type": "Full-time",
        "sector": "Engineering",
        "salary": "₹4,50,000 - ₹9,00,000 PA",
        "description": "Seeking a Mechanical Engineer for product design and development...",
        "requirements": [
          "Bachelor's degree in Mechanical Engineering",
          "Experience with CAD software",
          "Knowledge of manufacturing processes"
        ],
        "applyLink": "https://company.com/careers/mechanical-engineer",
        "featured": false
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'careercraft-job-postings-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('download_template', 'template_download', 'admin_job_posting');
  };

  // Export current jobs
  const exportJobs = () => {
    const blob = new Blob([JSON.stringify(manualJobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-jobs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('export_jobs', 'job_management', 'admin_job_posting');
  };

  const deleteJob = (jobId: string) => {
    const updatedJobs = manualJobs.filter(job => job.id !== jobId);
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    trackButtonClick('delete_job', 'job_management', 'admin_job_posting');
  };

  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to delete all manually posted jobs? This action cannot be undone.')) {
      setManualJobs([]);
      localStorage.setItem('manualJobs', '[]');
      trackButtonClick('clear_all_jobs', 'job_management', 'admin_job_posting');
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
        <title>Admin Job Posting - Add Job Opportunities | CareerCraft.in</title>
        <meta name="description" content="Post new job opportunities on CareerCraft.in - India's premier career platform for IT, engineering, marketing and business jobs." />
        <meta name="keywords" content="post jobs India, admin job portal, career opportunities, hire candidates India, job posting platform" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://careercraft.in/admin/job-posting" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Admin Job Posting - CareerCraft.in" />
        <meta property="og:description" content="Post new job opportunities on CareerCraft.in" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Admin Job Posting - CareerCraft.in",
            "description": "Admin panel for posting job opportunities on CareerCraft.in",
            "url": "https://careercraft.in/admin/job-posting"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/job-applications" 
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
              onClick={() => trackCTAClick('back_to_jobs', 'navigation', 'admin_job_posting')}
            >
              ← Back to Job Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Posting</h1>
            <p className="text-gray-600">Add new job opportunities to CareerCraft.in</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Job posted successfully! It will now appear on the Job Applications page.
            </div>
          )}

          {/* Storage Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div>
              <h3 className="font-semibold text-blue-800">CareerCraft Job Portal Status</h3>
              <p className="text-blue-700 text-sm">
                Manual Jobs: {manualJobs.length} | Pages: {Math.ceil(manualJobs.length / 10)} | 
                Featured: {manualJobs.filter(j => j.featured).length}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => {
                    setActiveTab('single');
                    trackButtonClick('switch_tab_single', 'tab_navigation', 'admin_job_posting');
                  }}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'single'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Single Job Posting
                </button>
                <button
                  onClick={() => {
                    setActiveTab('bulk');
                    trackButtonClick('switch_tab_bulk', 'tab_navigation', 'admin_job_posting');
                  }}
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Post New Job on CareerCraft</h2>
                  
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
                          Salary Range (INR)
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
                        Post Job on CareerCraft
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Bulk Upload Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Job Upload</h2>
                  
                  {/* Batch Job Creator */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Zap className="mr-2" size={20} />
                      Quick Batch Creator for Indian Market
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Job Title</label>
                        <input
                          type="text"
                          value={batchCreate.baseTitle}
                          onChange={e => setBatchCreate({...batchCreate, baseTitle: e.target.value})}
                          placeholder="e.g., Software Engineer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Jobs</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={batchCreate.count}
                          onChange={e => setBatchCreate({...batchCreate, count: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Companies (one per line)</label>
                        <textarea
                          value={batchCreate.companies.join('\n')}
                          onChange={e => setBatchCreate({...batchCreate, companies: e.target.value.split('\n')})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Tech Corp India\nStartup Inc\nEnterprise Solutions Ltd"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indian Locations (one per line)</label>
                        <textarea
                          value={batchCreate.locations.join('\n')}
                          onChange={e => setBatchCreate({...batchCreate, locations: e.target.value.split('\n')})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Bangalore, Karnataka\nMumbai, Maharashtra\nHyderabad, Telangana"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={generateBatchJobs}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Generate Batch Jobs for India
                    </button>
                  </div>

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
    "title": "Software Developer",
    "company": "Tech Company India",
    "location": "Bangalore, Karnataka",
    "type": "Full-time",
    "sector": "IT/Software",
    "salary": "₹8,00,000 - ₹15,00,000 PA",
    "description": "Job description for Indian market...",
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
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <Download size={16} className="mr-2" />
                      Template
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={!bulkJsonInput.trim()}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Jobs
                    </button>
                    <button
                      onClick={() => setBulkJsonInput('')}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Copy size={16} className="mr-2" />
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Templates */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                <h4 className="font-semibold mb-3">🚀 Quick Templates (India)</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => applyTemplate('software_developer')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left"
                  >
                    💻 Software Developer
                  </button>
                  <button 
                    onClick={() => applyTemplate('data_analyst')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left"
                  >
                    📊 Data Analyst
                  </button>
                  <button 
                    onClick={() => applyTemplate('mechanical_engineer')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left"
                  >
                    🔧 Mechanical Engineer
                  </button>
                </div>
              </div>

              {/* Preview and Existing Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">CareerCraft Jobs ({manualJobs.length})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportJobs}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Export all jobs"
                    >
                      Export
                    </button>
                    <button
                      onClick={clearAllJobs}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Delete all jobs"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                {manualJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No jobs posted yet on CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {manualJobs.map(manualJob => {
                      const isNew = manualJob.addedTimestamp && (Date.now() - manualJob.addedTimestamp) < 24 * 60 * 60 * 1000;
                      
                      return (
                        <div key={manualJob.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{manualJob.title}</h4>
                              <p className="text-sm text-gray-600">{manualJob.company}</p>
                              <p className="text-xs text-gray-500">{manualJob.location}</p>
                              <div className="flex gap-1 mt-1">
                                {isNew && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                    NEW
                                  </span>
                                )}
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
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                  Page {manualJob.page || 1}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Added: {manualJob.addedTimestamp ? new Date(manualJob.addedTimestamp).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteJob(manualJob.id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                              title="Delete job"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  {activeTab === 'single' ? 'Tips for Indian Job Market' : 'Bulk Upload Instructions'}
                </h4>
                {activeTab === 'single' ? (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use clear, descriptive job titles</li>
                    <li>• Include specific requirements for Indian market</li>
                    <li>• Provide realistic INR salary ranges</li>
                    <li>• Use Indian city names and states</li>
                    <li>• Mark high-priority roles as "Featured"</li>
                    <li>• Jobs are automatically timestamped</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Download the India-specific template</li>
                    <li>• JSON must be an array of job objects</li>
                    <li>• Required fields: title, company, location</li>
                    <li>• Use arrays for requirements field</li>
                    <li>• Validate JSON before uploading</li>
                    <li>• Include Indian salary ranges in INR</li>
                  </ul>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">CareerCraft Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Total Jobs: {manualJobs.length}</p>
                  <p>• Featured Jobs: {manualJobs.filter(j => j.featured).length}</p>
                  <p>• Pages: {Math.ceil(manualJobs.length / 10)}</p>
                  <p>• IT/Software Jobs: {manualJobs.filter(j => j.sector === 'IT/Software').length}</p>
                  <p>• Engineering Jobs: {manualJobs.filter(j => j.sector === 'Engineering').length}</p>
                  <p>• Remote Jobs: {manualJobs.filter(j => j.type === 'Remote').length}</p>
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