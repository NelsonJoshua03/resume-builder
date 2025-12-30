// src/components/AdminJobPosting.tsx - UPDATED WITH EXPERIENCE FIELD
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { getFirebaseStatus } from '../firebase/config';
import { firebaseJobService } from '../firebase/jobService';
import { Zap, Copy, Download, Upload, Trash2, Clock, AlertCircle, Database, WifiOff } from 'lucide-react';

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
  isNew?: boolean;
  views?: number;
  shares?: number;
  applications?: number;
  // NEW FIELD: Experience
  experience?: string;
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
    featured: false,
    isNew: true,
    // NEW: Default experience
    experience: '0-2 years'
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
    experiences: ['0-2 years'], // NEW: Experience options
    count: 3
  });

  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [cleanupStats, setCleanupStats] = useState<{
    before: number;
    after: number;
    removed: number;
  } | null>(null);

  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    message: string;
    synced?: number;
    failed?: number;
  }>({ syncing: false, message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackCTAClick, trackUserFlow, trackEvent } = useGoogleAnalytics();
  const { trackFirebaseEvent } = useFirebaseAnalytics();

  // Quick job templates optimized for Indian market - UPDATED WITH EXPERIENCE
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
      // NEW: Experience field
      experience: "2-5 years"
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
      // NEW: Experience field
      experience: "1-3 years"
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
      // NEW: Experience field
      experience: "1-3 years"
    },
    // NEW: Fresher template
    fresher_developer: {
      title: "Fresher Software Developer",
      company: "Startup India",
      location: "Remote",
      type: "Full-time",
      sector: "IT/Software",
      salary: "₹3,00,000 - ₹5,00,000 PA",
      description: "Exciting opportunity for fresh graduates to start their career in software development. Training will be provided.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Basic knowledge of programming concepts",
        "Good problem-solving skills",
        "Willingness to learn new technologies"
      ],
      applyLink: "mailto:careers@startup.com",
      // NEW: Experience field
      experience: "0-1 years"
    }
  };

  // Experience options for dropdown
  const experienceOptions = [
    'Fresher (0-1 years)',
    '0-2 years',
    '1-3 years',
    '2-5 years',
    '3-5 years',
    '5-8 years',
    '8+ years',
    'Not specified'
  ];

  // Load existing manual jobs and check Firebase status
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
    
    // Auto-cleanup old jobs (older than 90 days)
    const cleanupResult = cleanupOldJobs(savedJobs, true);
    setManualJobs(cleanupResult.cleanedJobs);
    setCleanupStats({
      before: cleanupResult.before,
      after: cleanupResult.after,
      removed: cleanupResult.removed
    });
    
    // Check Firebase status
    const status = getFirebaseStatus();
    setFirebaseStatus(status);
    console.log('Firebase Status:', status);
    
    // Load last cleanup time
    const savedCleanup = localStorage.getItem('last_job_cleanup');
    if (savedCleanup) {
      setLastCleanup(savedCleanup);
    }
    
    trackEvent('admin_page_view', { page: 'job_posting_admin' });
    trackFirebaseEvent('admin_page_view', 'Admin', 'job_posting_admin', { page: 'job_posting_admin' });
  }, []);

  // Cleanup old jobs function
  const cleanupOldJobs = (jobsArray: Job[] = manualJobs, auto: boolean = false) => {
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    
    const beforeCount = jobsArray.length;
    const cleanedJobs = jobsArray.filter(job => {
      const jobTimestamp = job.addedTimestamp || new Date(job.postedDate).getTime();
      return jobTimestamp >= ninetyDaysAgo;
    });
    const afterCount = cleanedJobs.length;
    const removedCount = beforeCount - afterCount;
    
    // Update localStorage
    localStorage.setItem('manualJobs', JSON.stringify(cleanedJobs));
    
    // Save cleanup time
    const cleanupTime = new Date().toLocaleString('en-IN');
    localStorage.setItem('last_job_cleanup', cleanupTime);
    setLastCleanup(cleanupTime);
    
    // Track cleanup event
    if (removedCount > 0) {
      trackEvent('job_cleanup', {
        auto_cleanup: auto,
        jobs_before: beforeCount,
        jobs_after: afterCount,
        jobs_removed: removedCount
      });
      
      trackFirebaseEvent('job_cleanup', 'System', 'auto_cleanup', {
        auto_cleanup: auto,
        jobs_before: beforeCount,
        jobs_after: afterCount,
        jobs_removed: removedCount
      });
      
      if (!auto) {
        alert(`Cleaned up ${removedCount} jobs older than 90 days.`);
      }
    }
    
    return {
      cleanedJobs,
      before: beforeCount,
      after: afterCount,
      removed: removedCount
    };
  };

  // Manual cleanup trigger
  const handleCleanup = () => {
    if (window.confirm('Are you sure you want to remove all jobs older than 90 days? This action cannot be undone.')) {
      const result = cleanupOldJobs();
      setManualJobs(result.cleanedJobs);
      setCleanupStats({
        before: result.before,
        after: result.after,
        removed: result.removed
      });
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    setSyncStatus({ syncing: true, message: 'Testing Firebase connection...' });
    
    try {
      const result = await firebaseJobService.testFirebaseConnection();
      
      if (result.connected) {
        setSyncStatus({ 
          syncing: false, 
          message: '✅ Firebase connection successful!',
          synced: 1,
          failed: 0
        });
        alert(result.message);
        
        // Refresh Firebase status
        setFirebaseStatus(getFirebaseStatus());
      } else {
        setSyncStatus({ 
          syncing: false, 
          message: '❌ Firebase connection failed',
          synced: 0,
          failed: 1
        });
        alert(result.message);
      }
    } catch (error) {
      setSyncStatus({ 
        syncing: false, 
        message: '❌ Error testing Firebase connection',
        synced: 0,
        failed: 1
      });
      alert('Error testing Firebase connection. Check console for details.');
      console.error('Connection test error:', error);
    }
  };

  const syncToFirebase = async () => {
    if (!window.confirm('This will sync all localStorage jobs to Firebase. Continue?')) {
      return;
    }
    
    setSyncStatus({ syncing: true, message: 'Syncing jobs to Firebase...' });
    
    try {
      const result = await firebaseJobService.syncAllToFirebase();
      
      setSyncStatus({ 
        syncing: false, 
        message: result.synced > 0 ? 
          `✅ Synced ${result.synced} jobs to Firebase` : 
          result.synced === 0 && result.failed === 0 ? 
            'No jobs to sync' : 'Failed to sync jobs',
        synced: result.synced,
        failed: result.failed
      });
      
      if (result.synced > 0) {
        alert(`Successfully synced ${result.synced} jobs to Firebase${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
      } else if (result.failed > 0) {
        alert('Failed to sync jobs. Please check console for errors.');
      } else {
        alert('No jobs available to sync.');
      }
      
      // Refresh Firebase status
      setFirebaseStatus(getFirebaseStatus());
    } catch (error) {
      setSyncStatus({ 
        syncing: false, 
        message: '❌ Error syncing to Firebase',
        synced: 0,
        failed: 0
      });
      alert('Error syncing to Firebase. Please check console for details.');
      console.error('Sync error:', error);
    }
  };

  // Apply quick template
  const applyTemplate = (templateKey: keyof typeof quickTemplates) => {
    const template = quickTemplates[templateKey];
    setJob({
      ...template,
      featured: false,
      isNew: true
    });
    setRequirementsInput(template.requirements.join('\n'));
    setActiveTab('single');
    trackButtonClick(`apply_template_${templateKey}`, 'quick_templates', 'admin_job_posting');
    trackFirebaseEvent(`apply_template_${templateKey}`, 'Admin', 'quick_templates');
  };

  // Single job submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newJobData = {
        ...job,
        postedDate: new Date().toISOString().split('T')[0],
        requirements: requirementsInput.split('\n')
          .filter(req => req.trim() !== '')
          .map(req => req.trim()),
      };

      // Use the job service to create job
      const jobId = await firebaseJobService.createJob(newJobData);
      
      // Create local job object for UI
      const newJob: Job = {
        ...newJobData,
        id: jobId,
        postedDate: new Date().toISOString().split('T')[0],
        addedTimestamp: Date.now(),
        page: Math.floor(manualJobs.length / 10) + 1,
        isNew: true,
        views: 0,
        shares: 0,
        applications: 0
      };

      const updatedJobs = [newJob, ...manualJobs];
      setManualJobs(updatedJobs);
      
      // Track job posting
      trackButtonClick('post_single_job', 'job_form', 'admin_job_posting');
      trackUserFlow('admin_job_posting', 'job_posted', 'job_creation');
      trackEvent('job_posted', {
        job_type: 'single',
        job_title: job.title,
        company: job.company,
        sector: job.sector,
        experience: job.experience // NEW: Track experience
      });
      
      trackFirebaseEvent('job_posted', 'Job Management', job.title, {
        job_type: 'single',
        company: job.company,
        sector: job.sector,
        experience: job.experience // NEW: Track experience
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
        featured: false,
        isNew: true,
        experience: '0-2 years' // NEW: Reset with default
      });
      setRequirementsInput('');

      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job: ' + error);
    }
  };

  // Bulk job upload from JSON
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobsData = JSON.parse(bulkJsonInput);
      trackButtonClick('bulk_upload_jobs', 'bulk_upload', 'admin_job_posting');
      trackFirebaseEvent('bulk_upload_started', 'Admin', 'bulk_upload');
      
      if (!Array.isArray(jobsData)) {
        throw new Error('JSON must be an array of job objects');
      }

      setSyncStatus({ syncing: true, message: 'Uploading jobs...' });

      // Use the job service for bulk creation
      const results = await firebaseJobService.bulkCreateJobs(jobsData);
      
      setBulkUploadResults(results);
      setSyncStatus({ 
        syncing: false, 
        message: results.success > 0 ? 
          `✅ Uploaded ${results.success} jobs` : 
          'No jobs uploaded',
        synced: results.success,
        failed: results.failed
      });

      if (results.success > 0) {
        // Refresh jobs list from localStorage
        const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
        setManualJobs(savedJobs);
        
        setBulkJsonInput('');
        
        trackUserFlow('admin_job_posting', 'bulk_jobs_uploaded', 'job_creation');
        trackEvent('bulk_jobs_uploaded', {
          total_jobs: jobsData.length,
          successful_uploads: results.success,
          failed_uploads: results.failed
        });
        
        trackFirebaseEvent('bulk_jobs_uploaded', 'Job Management', 'bulk_upload', {
          total_jobs: jobsData.length,
          successful_uploads: results.success,
          failed_uploads: results.failed
        });
        
        alert(`Successfully uploaded ${results.success} jobs${results.failed > 0 ? ` (${results.failed} failed)` : ''}`);
      }
      
    } catch (error) {
      console.error('Error in bulk upload:', error);
      trackButtonClick('bulk_upload_error', 'bulk_upload', 'admin_job_posting');
      trackFirebaseEvent('bulk_upload_error', 'Admin', 'bulk_upload_error', { error: String(error) });
      
      setBulkUploadResults({
        success: 0,
        failed: 0,
        errors: ['Invalid JSON format. Please check your JSON syntax.']
      });
      
      setSyncStatus({ 
        syncing: false, 
        message: '❌ Upload failed',
        synced: 0,
        failed: 0
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    trackButtonClick('upload_json_file', 'file_upload', 'admin_job_posting');
    trackFirebaseEvent('upload_json_file', 'Admin', 'file_upload');
    
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
    const now = Date.now();
    for (let i = 0; i < batchCreate.count; i++) {
      const company = batchCreate.companies[i % batchCreate.companies.length] || 'Tech Company';
      const location = batchCreate.locations[i % batchCreate.locations.length] || 'Bangalore, Karnataka';
      const experience = batchCreate.experiences[i % batchCreate.experiences.length] || '0-2 years';
      
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
        featured: i < 2,
        isNew: true,
        // NEW: Add experience field
        experience: experience
      });
    }
    setBulkJsonInput(JSON.stringify(jobs, null, 2));
    trackButtonClick('generate_batch_jobs', 'batch_creator', 'admin_job_posting');
    trackFirebaseEvent('generate_batch_jobs', 'Admin', 'batch_creator');
  };

  // Download template JSON - UPDATED WITH EXPERIENCE FIELD
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
        "featured": true,
        // NEW: Experience field in template
        "experience": "2-5 years"
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
        "featured": false,
        // NEW: Experience field in template
        "experience": "1-3 years"
      },
      {
        "title": "Fresher Software Engineer",
        "company": "Startup India",
        "location": "Remote",
        "type": "Full-time",
        "sector": "IT/Software",
        "salary": "₹3,00,000 - ₹5,00,000 PA",
        "description": "Great opportunity for fresh graduates to start their career...",
        "requirements": [
          "Bachelor's degree in Computer Science",
          "Basic programming knowledge",
          "Good problem-solving skills"
        ],
        "applyLink": "mailto:hr@startup.com",
        "featured": false,
        // NEW: Experience field in template
        "experience": "Fresher (0-1 years)"
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
    trackFirebaseEvent('download_template', 'Admin', 'template_download');
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
    trackFirebaseEvent('export_jobs', 'Admin', 'job_management');
  };

  const deleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updatedJobs = manualJobs.filter(job => job.id !== jobId);
      setManualJobs(updatedJobs);
      localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
      
      // Also delete from Firebase if connected
      if (firebaseStatus?.firestore) {
        firebaseJobService.deleteJob(jobId);
      }
      
      trackButtonClick('delete_job', 'job_management', 'admin_job_posting');
      trackFirebaseEvent('delete_job', 'Admin', 'job_management');
    }
  };

  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to delete all manually posted jobs? This action cannot be undone.')) {
      setManualJobs([]);
      localStorage.setItem('manualJobs', '[]');
      trackButtonClick('clear_all_jobs', 'job_management', 'admin_job_posting');
      trackFirebaseEvent('clear_all_jobs', 'Admin', 'job_management');
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
              to="/latest-jobs-for-freshers-india" 
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
              onClick={() => trackCTAClick('back_to_jobs', 'navigation', 'admin_job_posting')}
            >
              ← Back to Job Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Posting - Latest Jobs</h1>
            <p className="text-gray-600">Add new job opportunities to CareerCraft.in. Jobs auto-clean after 90 days.</p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Job posted successfully! It will now appear on the Job Applications page (showing latest first).
            </div>
          )}

          {/* Sync Status */}
          {syncStatus.syncing && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              ⏳ {syncStatus.message}
            </div>
          )}

          {syncStatus.message && !syncStatus.syncing && (
            <div className={`border px-4 py-3 rounded mb-6 ${
              syncStatus.message.includes('✅') ? 'bg-green-100 border-green-400 text-green-700' :
              syncStatus.message.includes('❌') ? 'bg-red-100 border-red-400 text-red-700' :
              'bg-blue-100 border-blue-400 text-blue-700'
            }`}>
              {syncStatus.message}
            </div>
          )}

          {/* Firebase Status */}
          <div className={`p-4 mb-6 rounded-lg border ${
            firebaseStatus?.firestore ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${firebaseStatus?.firestore ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Firebase Status: {firebaseStatus?.firestore ? 'Connected' : 'Not Connected'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {firebaseStatus?.firestore 
                      ? 'Jobs will be saved to both localStorage and Firebase' 
                      : 'Jobs will be saved to localStorage only. To use Firebase, configure your .env.local file.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={testFirebaseConnection}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <WifiOff size={16} />
                  Test Connection
                </button>
                <button
                  onClick={syncToFirebase}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Database size={16} />
                  Sync to Firebase
                </button>
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-blue-800">CareerCraft Job Portal Status</h3>
                <p className="text-blue-700 text-sm">
                  Latest Jobs: {manualJobs.length} | Pages: {Math.ceil(manualJobs.length / 10)} | 
                  Featured: {manualJobs.filter(j => j.featured).length} | 
                  New Today: {manualJobs.filter(j => j.isNew).length}
                </p>
                <p className="text-blue-700 text-sm">
                  Auto-Cleanup: Every 90 days | Last Cleanup: {lastCleanup || 'Never'}
                </p>
              </div>
              {cleanupStats && cleanupStats.removed > 0 && (
                <div className="mt-2 md:mt-0 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-red-700 text-sm">
                    <AlertCircle size={14} className="inline mr-1" />
                    Auto-cleaned: {cleanupStats.removed} old jobs removed
                  </p>
                </div>
              )}
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

                    {/* Sector, Salary and Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      {/* NEW: Experience Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience *
                        </label>
                        <select
                          required
                          value={job.experience}
                          onChange={e => setJob({...job, experience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {experienceOptions.map(exp => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
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
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Post Latest Job on CareerCraft
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Levels (one per line)</label>
                        <textarea
                          value={batchCreate.experiences.join('\n')}
                          onChange={e => setBatchCreate({...batchCreate, experiences: e.target.value.split('\n')})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="0-2 years\n2-5 years\n5+ years"
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
    "experience": "2-5 years" // NEW: Experience field
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
                      disabled={!bulkJsonInput.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Latest Jobs
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
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left flex justify-between items-center"
                  >
                    <span>💻 Software Developer</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">2-5 yrs</span>
                  </button>
                  <button 
                    onClick={() => applyTemplate('data_analyst')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left flex justify-between items-center"
                  >
                    <span>📊 Data Analyst</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">1-3 yrs</span>
                  </button>
                  <button 
                    onClick={() => applyTemplate('mechanical_engineer')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left flex justify-between items-center"
                  >
                    <span>🔧 Mechanical Engineer</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">1-3 yrs</span>
                  </button>
                  <button 
                    onClick={() => applyTemplate('fresher_developer')}
                    className="w-full bg-white text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 transition-colors text-left flex justify-between items-center"
                  >
                    <span>🎓 Fresher Developer</span>
                    <span className="text-xs bg-green-100 text-green-800 px-1 rounded">0-1 yrs</span>
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
                  Jobs older than 90 days are automatically removed to keep listings fresh.
                </p>
                <div className="space-y-2 text-sm text-red-700 mb-4">
                  <div className="flex justify-between">
                    <span>Last Cleanup:</span>
                    <span className="font-medium">{lastCleanup || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs before:</span>
                    <span className="font-medium">{cleanupStats?.before || manualJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs after:</span>
                    <span className="font-medium">{cleanupStats?.after || manualJobs.length}</span>
                  </div>
                  {cleanupStats && cleanupStats.removed > 0 && (
                    <div className="flex justify-between">
                      <span>Removed:</span>
                      <span className="font-medium bg-red-100 px-2 py-0.5 rounded">{cleanupStats.removed} old jobs</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCleanup}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clean Old Jobs Now
                </button>
              </div>

              {/* Preview and Existing Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Latest CareerCraft Jobs ({manualJobs.length})</h3>
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
                      title="Delete all jobs"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={12} />
                  Showing newest first • Auto-cleaned every 90 days
                </div>
                {manualJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No latest jobs posted yet on CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {manualJobs.map(manualJob => {
                      const isNew = manualJob.isNew || (manualJob.addedTimestamp && (Date.now() - manualJob.addedTimestamp) < 24 * 60 * 60 * 1000);
                      const isOld = manualJob.addedTimestamp && (Date.now() - manualJob.addedTimestamp) > 60 * 24 * 60 * 60 * 1000; // 60+ days
                      
                      return (
                        <div key={manualJob.id} className={`border rounded-lg p-3 ${isOld ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{manualJob.title}</h4>
                              <p className="text-xs text-gray-600">{manualJob.company}</p>
                              <p className="text-xs text-gray-500">{manualJob.location}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {isNew && (
                                  <span className="inline-block bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                    NEW
                                  </span>
                                )}
                                {isOld && (
                                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                                    OLD (Will auto-clean)
                                  </span>
                                )}
                                {manualJob.featured && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                    Featured
                                  </span>
                                )}
                                {/* NEW: Display experience badge */}
                                {manualJob.experience && (
                                  <span className="inline-block bg-amber-100 text-amber-800 text-xs px-1 py-0.5 rounded">
                                    {manualJob.experience}
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
                                {manualJob.views !== undefined && manualJob.views > 0 && (
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                    👁️ {manualJob.views}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Added: {manualJob.addedTimestamp ? new Date(manualJob.addedTimestamp).toLocaleDateString('en-IN') : 'Recently'}
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
                    <li>• Jobs appear as "Latest" for 90 days</li>
                    <li>• Use clear, descriptive job titles</li>
                    <li>• Include specific requirements for Indian market</li>
                    <li>• Provide realistic INR salary ranges</li>
                    <li>• Specify years of experience clearly</li>
                    <li>• Use Indian city names and states</li>
                    <li>• Mark high-priority roles as "Featured"</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Download the India-specific template</li>
                    <li>• JSON must be an array of job objects</li>
                    <li>• Required fields: title, company, location</li>
                    <li>• Include experience field (e.g., "2-5 years")</li>
                    <li>• Use arrays for requirements field</li>
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
                    <span>Total Latest Jobs:</span>
                    <span className="font-bold">{manualJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Featured Jobs:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.featured).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IT/Software Jobs:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.sector === 'IT/Software').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote Jobs:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.type === 'Remote').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fresher Jobs:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.experience?.includes('Fresher') || j.experience?.includes('0-1')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Today:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.isNew).length}</span>
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