// src/components/AdminJobPosting.tsx - UPDATED WITH FIREBASE
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { firebaseJobService, type JobData } from '../firebase/jobService';
import { Zap, Copy, Download, Upload, Trash2, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface BatchCreate {
  baseTitle: string;
  companies: string[];
  locations: string[];
  count: number;
}

const AdminJobPosting: React.FC = () => {
  const [job, setJob] = useState<Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    sector: 'IT/Software',
    salary: '',
    description: '',
    requirements: [],
    postedDate: new Date().toISOString().split('T')[0],
    applyLink: '',
    featured: false,
    isActive: true,
    isApproved: true
  });

  const [requirementsInput, setRequirementsInput] = useState<string>('');
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [bulkJsonInput, setBulkJsonInput] = useState<string>('');
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  
  const [batchCreate, setBatchCreate] = useState<BatchCreate>({
    baseTitle: '',
    companies: [''],
    locations: [''],
    count: 3
  });

  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<{
    migrated: number;
    failed: number;
    inProgress: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackFirebaseEvent } = useFirebaseAnalytics();

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
      applyLink: "mailto:careers@company.com",
      featured: true
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
      applyLink: "mailto:hr@company.com",
      featured: false
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
      applyLink: "mailto:careers@engineering.com",
      featured: true
    }
  };

  // Load existing jobs on component mount
  useEffect(() => {
    loadJobs();
    
    // Load last cleanup time
    const savedCleanup = localStorage.getItem('last_job_cleanup');
    if (savedCleanup) {
      setLastCleanup(savedCleanup);
    }

    trackFirebaseEvent(
      'admin_page_view',
      'Admin',
      'job_posting_admin',
      {
        page: 'job_posting_admin',
        timestamp: new Date().toISOString()
      }
    );
  }, []);

  // Load jobs from Firebase
  const loadJobs = async () => {
    setLoading(true);
    try {
      const { jobs: loadedJobs } = await firebaseJobService.getJobs({}, 1, 100);
      setJobs(loadedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply quick template
  const applyTemplate = (templateKey: keyof typeof quickTemplates) => {
    const template = quickTemplates[templateKey];
    setJob({
      ...template,
      postedDate: new Date().toISOString().split('T')[0],
      isActive: true,
      isApproved: true
    });
    setRequirementsInput(template.requirements.join('\n'));
    setActiveTab('single');
    
    trackButtonClick(`apply_template_${templateKey}`, 'quick_templates', 'admin_job_posting');
  };

  // Single job submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newJobData = {
        ...job,
        requirements: requirementsInput.split('\n')
          .filter(req => req.trim() !== '')
          .map(req => req.trim())
      };

      const jobId = await firebaseJobService.createJob(newJobData);
      
      trackButtonClick('post_single_job', 'job_form', 'admin_job_posting');
      trackFirebaseEvent(
        'job_posted',
        'Job Management',
        job.title,
        {
          job_type: 'single',
          job_title: job.title,
          company: job.company,
          sector: job.sector
        }
      );
      
      // Reload jobs
      await loadJobs();
      
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
        postedDate: new Date().toISOString().split('T')[0],
        applyLink: '',
        featured: false,
        isActive: true,
        isApproved: true
      });
      setRequirementsInput('');
      
      // Show success message
      setBulkUploadResults({
        success: 1,
        failed: 0,
        errors: []
      });
      
    } catch (error) {
      console.error('Error creating job:', error);
      setBulkUploadResults({
        success: 0,
        failed: 1,
        errors: [`Failed to create job: ${error}`]
      });
    }
  };

  // Bulk job upload from JSON
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobsData = JSON.parse(bulkJsonInput);
      
      if (!Array.isArray(jobsData)) {
        throw new Error('JSON must be an array of job objects');
      }

      const validJobsData = jobsData.map(jobData => ({
        title: jobData.title || '',
        company: jobData.company || '',
        location: jobData.location || '',
        type: jobData.type || 'Full-time',
        sector: jobData.sector || 'IT/Software',
        salary: jobData.salary || '',
        description: jobData.description || '',
        requirements: Array.isArray(jobData.requirements) 
          ? jobData.requirements 
          : (jobData.requirements ? [jobData.requirements] : ['See job description for requirements']),
        postedDate: jobData.postedDate || new Date().toISOString().split('T')[0],
        applyLink: jobData.applyLink || '#',
        featured: jobData.featured || false,
        isActive: true,
        isApproved: true
      }));

      const results = await firebaseJobService.bulkCreateJobs(validJobsData);
      setBulkUploadResults(results);

      if (results.success > 0) {
        setBulkJsonInput('');
        await loadJobs();
      }
    } catch (error) {
      console.error('Error in bulk upload:', error);
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
        postedDate: new Date().toISOString().split('T')[0],
        applyLink: "mailto:careers@company.com",
        featured: i < 2,
        isActive: true,
        isApproved: true
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
        "postedDate": new Date().toISOString().split('T')[0],
        "applyLink": "mailto:careers@company.com",
        "featured": true,
        "isActive": true,
        "isApproved": true
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
        "postedDate": new Date().toISOString().split('T')[0],
        "applyLink": "https://company.com/careers/mechanical-engineer",
        "featured": false,
        "isActive": true,
        "isApproved": true
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
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
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

  const deleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await firebaseJobService.deleteJob(jobId);
        await loadJobs();
        
        trackButtonClick('delete_job', 'job_management', 'admin_job_posting');
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const clearAllJobs = async () => {
    if (window.confirm('Are you sure you want to deactivate all jobs? This will mark all jobs as inactive.')) {
      try {
        const deactivatePromises = jobs.map(job => 
          firebaseJobService.updateJob(job.id!, { isActive: false })
        );
        
        await Promise.all(deactivatePromises);
        await loadJobs();
        
        trackButtonClick('clear_all_jobs', 'job_management', 'admin_job_posting');
        
        alert('All jobs have been deactivated.');
      } catch (error) {
        console.error('Error clearing jobs:', error);
        alert('Failed to clear jobs. Please try again.');
      }
    }
  };

  // Migrate localStorage jobs to Firebase
  const migrateLocalStorageJobs = async () => {
    if (window.confirm('This will migrate all localStorage jobs to Firebase. Continue?')) {
      setMigrationStatus({ migrated: 0, failed: 0, inProgress: true });
      
      try {
        const result = await firebaseJobService.migrateLocalStorageJobs();
        setMigrationStatus({
          ...result,
          inProgress: false
        });
        
        await loadJobs();
        
        trackFirebaseEvent(
          'jobs_migrated',
          'System',
          'migration',
          {
            migrated: result.migrated,
            failed: result.failed,
            source: 'localStorage'
          }
        );
      } catch (error) {
        console.error('Migration error:', error);
        setMigrationStatus({
          migrated: 0,
          failed: 0,
          inProgress: false
        });
      }
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

  const activeJobs = jobs.filter(job => job.isActive);
  const featuredJobs = jobs.filter(job => job.featured);
  const recentJobs = jobs.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Admin Job Posting - Add Latest Job Opportunities | CareerCraft.in</title>
        <meta name="description" content="Post new latest job opportunities on CareerCraft.in - India's premier career platform for IT, engineering, marketing and business jobs. Auto-cleaned every 90 days." />
        <meta name="keywords" content="post latest jobs India, admin job portal, career opportunities, hire candidates India, job posting platform, auto-clean jobs" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://careercraft.in/admin/job-posting" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Admin Job Posting - CareerCraft.in" />
        <meta property="og:description" content="Post new latest job opportunities on CareerCraft.in" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Admin Job Posting - CareerCraft.in",
            "description": "Admin panel for posting latest job opportunities on CareerCraft.in",
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
              onClick={() => trackButtonClick('back_to_jobs', 'navigation', 'admin_job_posting')}
            >
              ← Back to Job Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Posting - Latest Jobs</h1>
            <p className="text-gray-600">Add new job opportunities to CareerCraft.in. Jobs auto-clean after 90 days.</p>
          </div>

          {/* Storage Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-blue-800">CareerCraft Job Portal Status</h3>
                <p className="text-blue-700 text-sm">
                  Active Jobs: {activeJobs.length} | Featured: {featuredJobs.length} | 
                  Total Views: {jobs.reduce((sum, job) => sum + (job.views || 0), 0).toLocaleString()} | 
                  Total Applications: {jobs.reduce((sum, job) => sum + (job.applications || 0), 0).toLocaleString()}
                </p>
                <p className="text-blue-700 text-sm">
                  Auto-Cleanup: Every 90 days | Last Cleanup: {lastCleanup || 'Never'}
                </p>
              </div>
              
              <button
                onClick={migrateLocalStorageJobs}
                disabled={migrationStatus?.inProgress}
                className="mt-2 md:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {migrationStatus?.inProgress ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Migrating...
                  </span>
                ) : 'Migrate localStorage Jobs'}
              </button>
            </div>
            
            {migrationStatus && !migrationStatus.inProgress && (
              <div className={`mt-3 p-2 rounded ${migrationStatus.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`text-sm ${migrationStatus.failed > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                  <CheckCircle size={14} className="inline mr-1" />
                  Migration complete: {migrationStatus.migrated} migrated, {migrationStatus.failed} failed
                </p>
              </div>
            )}
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Post Latest Job on CareerCraft</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Shows as LATEST
                    </span>
                  </div>
                  
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
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Posting Job...
                          </span>
                        ) : (
                          'Post Latest Job on CareerCraft'
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Job will appear as "Latest" and auto-clean after 90 days
                      </p>
                    </div>
                  </form>
                </div>
              ) : (
                /* Bulk Upload Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Job Upload</h2>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      All jobs marked as LATEST
                    </span>
                  </div>
                  
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
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                      Generate Latest Batch Jobs for India
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
    "description": "Latest job for Indian market...",
    "requirements": ["Requirement 1", "Requirement 2"],
    "applyLink": "mailto:careers@company.com",
    "featured": false,
    "isActive": true,
    "isApproved": true
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
                      <p>Successfully uploaded: {bulkUploadResults.success} latest jobs</p>
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
                      disabled={!bulkJsonInput.trim() || loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : (
                        <Upload size={16} className="mr-2" />
                      )}
                      {loading ? 'Uploading...' : 'Upload Latest Jobs'}
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

              {/* Auto-Cleanup Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <h4 className="font-semibold text-red-800">🔄 Auto-Cleanup System</h4>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  Jobs older than 90 days are automatically marked as inactive to keep listings fresh.
                </p>
                <div className="space-y-2 text-sm text-red-700 mb-4">
                  <div className="flex justify-between">
                    <span>Active Jobs:</span>
                    <span className="font-medium">{activeJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive Jobs:</span>
                    <span className="font-medium">{jobs.length - activeJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleanup Period:</span>
                    <span className="font-medium">90 days</span>
                  </div>
                </div>
              </div>

              {/* Preview and Existing Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Latest CareerCraft Jobs ({jobs.length})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportJobs}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Export all latest jobs"
                    >
                      Export
                    </button>
                    <button
                      onClick={clearAllJobs}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Deactivate all jobs"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={12} />
                  Showing newest first • Auto-cleaned every 90 days
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={20} />
                    <p className="text-gray-500 text-sm mt-2">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No latest jobs posted yet on CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {recentJobs.map(job => {
                      const isNew = job.createdAt && (Date.now() - new Date(job.createdAt).getTime()) < 24 * 60 * 60 * 1000;
                      const isOld = job.expiresAt && new Date(job.expiresAt) < new Date();
                      
                      return (
                        <div key={job.id} className={`border rounded-lg p-3 ${!job.isActive ? 'border-red-200 bg-red-50' : isOld ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{job.title}</h4>
                              <p className="text-xs text-gray-600">{job.company}</p>
                              <p className="text-xs text-gray-500">{job.location}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {isNew && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                    NEW
                                  </span>
                                )}
                                {!job.isActive && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                    INACTIVE
                                  </span>
                                )}
                                {isOld && job.isActive && (
                                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                                    EXPIRING SOON
                                  </span>
                                )}
                                {job.featured && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                    Featured
                                  </span>
                                )}
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                  👁️ {job.views || 0}
                                </span>
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                  📝 {job.applications || 0}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {job.createdAt ? `Posted: ${new Date(job.createdAt).toLocaleDateString('en-IN')}` : 'Recently'}
                              </p>
                            </div>
                            <button
                              onClick={() => job.id && deleteJob(job.id)}
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
                    <li>• Jobs appear as "Latest" for 90 days</li>
                    <li>• Use clear, descriptive job titles</li>
                    <li>• Include specific requirements for Indian market</li>
                    <li>• Provide realistic INR salary ranges</li>
                    <li>• Use Indian city names and states</li>
                    <li>• Mark high-priority roles as "Featured"</li>
                    <li>• Jobs auto-clean after 90 days</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Download the India-specific template</li>
                    <li>• JSON must be an array of job objects</li>
                    <li>• Required fields: title, company, location</li>
                    <li>• Use arrays for requirements field</li>
                    <li>• Validate JSON before uploading</li>
                    <li>• Include Indian salary ranges in INR</li>
                    <li>• All jobs marked as "Latest"</li>
                  </ul>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">CareerCraft Latest Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Jobs:</span>
                    <span className="font-bold">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Jobs:</span>
                    <span className="font-bold">{activeJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Featured Jobs:</span>
                    <span className="font-bold">{featuredJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IT/Software Jobs:</span>
                    <span className="font-bold">{jobs.filter(j => j.sector === 'IT/Software').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote Jobs:</span>
                    <span className="font-bold">{jobs.filter(j => j.type === 'Remote').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-clean in:</span>
                    <span className="font-bold">90 days</span>
                  </div>
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