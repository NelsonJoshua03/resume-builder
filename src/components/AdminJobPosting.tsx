// src/components/AdminJobPosting.tsx - FIXED VERSION (No Infinite Loop)
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { 
  Zap, Copy, Download, Upload, Trash2, Clock, AlertCircle, RefreshCw, 
  QrCode, Smartphone, Link as LinkIcon, Cloud, CloudOff, Save
} from 'lucide-react';
import {
  saveJobToFirebase,
  getJobsFromFirebase,
  deleteJobFromFirebase,
  syncLocalJobsToFirebase,
  initFirebaseApp,
  checkFirebaseConnection,
  getDeviceId,
  clearFirebaseCache
} from '../services/firebase';

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
    isNew: true
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

  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [cleanupStats, setCleanupStats] = useState<{
    before: number;
    after: number;
    removed: number;
  } | null>(null);

  // Sync states
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [syncJsonInput, setSyncJsonInput] = useState<string>('');
  const [generatedQRCode, setGeneratedQRCode] = useState<string>('');
  const [pageLink, setPageLink] = useState<string>('');

  // Firebase states
  const [firebaseEnabled, setFirebaseEnabled] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const syncFileInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackCTAClick, trackUserFlow, trackEvent } = useGoogleAnalytics();

  // Refs to prevent infinite loops
  const isInitialLoadRef = useRef(false);
  const isMountedRef = useRef(true);

  // Quick job templates
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

  // Cleanup old jobs function
  const cleanupOldJobs = (jobsArray: Job[] = manualJobs, auto: boolean = false) => {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
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
      const result = cleanupOldJobs(manualJobs);
      setManualJobs(result.cleanedJobs);
      setCleanupStats({
        before: result.before,
        after: result.after,
        removed: result.removed
      });
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
  };

  // Single job submission WITH FIREBASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: Job = {
      ...job,
      id: `local-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      addedTimestamp: Date.now(),
      requirements: requirementsInput.split('\n')
        .filter(req => req.trim() !== '')
        .map(req => req.trim()),
      page: Math.floor(manualJobs.length / 10) + 1,
      isNew: true
    };

    // Save to Firebase if enabled
    let firebaseJobId = '';
    if (firebaseEnabled) {
      const result = await saveJobToFirebase(newJob);
      if (result.success && result.id) {
        firebaseJobId = result.id;
        newJob.id = `firebase_${result.id}`;
      }
    }
    
    // Update local state
    const updatedJobs = [newJob, ...manualJobs];
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Track job posting
    trackButtonClick('post_single_job', 'job_form', 'admin_job_posting');
    trackUserFlow('admin_job_posting', 'job_posted', 'job_creation');
    trackEvent('job_posted', {
      job_type: 'single',
      job_title: job.title,
      company: job.company,
      sector: job.sector,
      firebase_saved: firebaseEnabled,
      firebase_id: firebaseJobId || 'none'
    });
    
    // Show success message
    setShowSuccess(true);
    setSyncMessage({ 
      type: 'success', 
      text: `Job posted successfully! ${firebaseEnabled ? 'Synced to cloud.' : 'Saved locally.'}` 
    });
    
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
      isNew: true
    });
    setRequirementsInput('');

    setTimeout(() => {
      setShowSuccess(false);
      setSyncMessage(null);
    }, 3000);
  };

  // Bulk job upload with Firebase
  const handleBulkUpload = async (e: React.FormEvent) => {
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

      const newJobs: Job[] = [];
      
      for (const jobData of jobsData) {
        try {
          if (!jobData.title || !jobData.company || !jobData.location) {
            throw new Error(`Missing required fields (title, company, location)`);
          }

          const newJob: Job = {
            id: `local-bulk-${Date.now()}-${successCount}`,
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
            page: Math.floor((manualJobs.length + successCount) / 10) + 1,
            isNew: true
          };

          // Save to Firebase if enabled
          if (firebaseEnabled) {
            const result = await saveJobToFirebase(newJob);
            if (result.success && result.id) {
              newJob.id = `firebase_${result.id}`;
            }
          }
          
          newJobs.push(newJob);
          successCount++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          failedCount++;
          errors.push(error instanceof Error ? error.message : 'Invalid job format');
        }
      }

      if (newJobs.length > 0) {
        const updatedJobs = [...newJobs, ...manualJobs];
        setManualJobs(updatedJobs);
        localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
        
        trackUserFlow('admin_job_posting', 'bulk_jobs_uploaded', 'job_creation');
        trackEvent('bulk_jobs_uploaded', {
          total_jobs: jobsData.length,
          successful_uploads: successCount,
          failed_uploads: failedCount,
          firebase_saved: firebaseEnabled
        });
      }

      setBulkUploadResults({
        success: successCount,
        failed: failedCount,
        errors
      });

      if (successCount > 0) {
        setBulkJsonInput('');
        setSyncMessage({ 
          type: 'success', 
          text: `Uploaded ${successCount} jobs${firebaseEnabled ? ' to cloud' : ' locally'}!` 
        });
        setTimeout(() => setSyncMessage(null), 3000);
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
        featured: i < 2,
        isNew: true
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
    const jobsToExport = manualJobs.filter(job => !job.id.startsWith('sample-'));
    const blob = new Blob([JSON.stringify(jobsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-jobs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('export_jobs', 'job_management', 'admin_job_posting');
    setSyncMessage({ type: 'success', text: `Exported ${jobsToExport.length} jobs to JSON file` });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Delete job with Firebase
  const deleteJob = async (jobId: string) => {
    const updatedJobs = manualJobs.filter(job => job.id !== jobId);
    setManualJobs(updatedJobs);
    localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
    
    // Delete from Firebase if it's a Firebase job
    if (jobId.startsWith('firebase_')) {
      const firebaseId = jobId.replace('firebase_', '');
      await deleteJobFromFirebase(firebaseId);
    }
    
    trackButtonClick('delete_job', 'job_management', 'admin_job_posting');
  };

  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to delete all manually posted jobs? This action cannot be undone.')) {
      setManualJobs([]);
      localStorage.setItem('manualJobs', '[]');
      clearFirebaseCache();
      trackButtonClick('clear_all_jobs', 'job_management', 'admin_job_posting');
    }
  };

  // SYNC FUNCTIONS WITH FIREBASE
  const exportSyncJobs = () => {
    const jobsToExport = manualJobs.filter(job => !job.id.startsWith('sample-'));
    if (jobsToExport.length === 0) {
      setSyncMessage({ type: 'error', text: 'No custom jobs to export. Add jobs first.' });
      return;
    }
    
    const blob = new Blob([JSON.stringify(jobsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-jobs-sync-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('export_sync_jobs', 'sync', 'admin_job_posting');
    setSyncMessage({ type: 'success', text: `Exported ${jobsToExport.length} jobs for mobile sync` });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const importSyncJobs = () => {
    try {
      const jobsData = JSON.parse(syncJsonInput);
      
      if (!Array.isArray(jobsData)) {
        throw new Error('JSON must be an array of job objects');
      }

      const existingJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
      const newJobs = jobsData.map((jobData, index) => ({
        ...jobData,
        id: `imported-${Date.now()}-${index}`,
        addedTimestamp: jobData.addedTimestamp || Date.now(),
        postedDate: jobData.postedDate || new Date().toISOString().split('T')[0],
        page: Math.floor((existingJobs.length + index) / 10) + 1
      }));

      const updatedJobs = [...newJobs, ...existingJobs];
      localStorage.setItem('manualJobs', JSON.stringify(updatedJobs));
      setManualJobs(updatedJobs);
      
      setSyncMessage({ type: 'success', text: `Successfully imported ${newJobs.length} jobs` });
      setSyncJsonInput('');
      trackButtonClick('import_sync_jobs', 'sync', 'admin_job_posting');
      
      setTimeout(() => {
        setSyncMessage(null);
        setShowSyncPanel(false);
      }, 3000);
    } catch (error) {
      setSyncMessage({ type: 'error', text: 'Invalid JSON format. Please check your JSON syntax.' });
      trackButtonClick('import_sync_error', 'sync', 'admin_job_posting');
    }
  };

  const handleSyncFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setSyncJsonInput(content);
        JSON.parse(content);
        setSyncMessage(null);
      } catch (error) {
        setSyncMessage({ type: 'error', text: 'Invalid JSON file. Please check the file format.' });
      }
    };
    reader.readAsText(file);
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageLink)}`;
    setGeneratedQRCode(qrUrl);
    trackButtonClick('generate_qr_code', 'sync', 'admin_job_posting');
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(pageLink);
    setSyncMessage({ type: 'success', text: 'Page link copied to clipboard!' });
    trackButtonClick('copy_page_link', 'sync', 'admin_job_posting');
    setTimeout(() => setSyncMessage(null), 2000);
  };

  // Firebase sync function
  const syncWithFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus('🔄 Syncing with Firebase...');
    
    try {
      // Check connection first
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        setSyncStatus('❌ No internet connection');
        setTimeout(() => setSyncStatus(''), 3000);
        setIsSyncing(false);
        return;
      }
      
      // Sync local jobs to Firebase
      await syncLocalJobsToFirebase();
      
      // Clear cache and load fresh jobs from Firebase
      clearFirebaseCache();
      const freshJobs = await getJobsFromFirebase(true);
      setManualJobs(freshJobs);
      
      setSyncStatus(`✅ Synced ${freshJobs.length} jobs with Firebase!`);
      setFirebaseEnabled(true);
      
      setTimeout(() => {
        setSyncStatus('');
        setSyncMessage({ type: 'success', text: 'Firebase sync completed!' });
      }, 3000);
      
    } catch (error) {
      setSyncStatus('❌ Sync failed. Check Firebase configuration.');
      console.error('Firebase sync error:', error);
      
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Refresh jobs from Firebase
  const refreshFromFirebase = async () => {
    if (!firebaseEnabled) {
      setSyncMessage({ type: 'error', text: 'Firebase not connected. Enable cloud sync first.' });
      return;
    }
    
    setIsSyncing(true);
    setSyncStatus('🔄 Refreshing from Firebase...');
    
    try {
      clearFirebaseCache();
      const freshJobs = await getJobsFromFirebase(true);
      setManualJobs(freshJobs);
      
      setSyncStatus(`✅ Refreshed ${freshJobs.length} jobs`);
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      setSyncStatus('❌ Refresh failed');
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      setIsSyncing(false);
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

  // Initialize component
  useEffect(() => {
    isMountedRef.current = true;
    
    const initialize = async () => {
      if (isInitialLoadRef.current) return;
      
      isInitialLoadRef.current = true;
      
      try {
        // Initialize Firebase
        const firebaseInitialized = await initFirebaseApp();
        
        if (isMountedRef.current) {
          setFirebaseEnabled(firebaseInitialized);
        }
        
        // Get device ID
        const id = getDeviceId();
        if (isMountedRef.current) {
          setDeviceId(id);
        }
        
        // Load jobs from Firebase if connected
        let loadedJobs: Job[] = [];
        
        if (firebaseInitialized) {
          const firebaseJobs = await getJobsFromFirebase();
          loadedJobs = firebaseJobs;
          
          if (firebaseJobs.length > 0 && isMountedRef.current) {
            setManualJobs(firebaseJobs);
            setSyncMessage({ type: 'success', text: `Loaded ${firebaseJobs.length} jobs from cloud` });
            setTimeout(() => {
              if (isMountedRef.current) {
                setSyncMessage(null);
              }
            }, 3000);
          }
        }
        
        // If no firebase jobs, fallback to localStorage
        if (loadedJobs.length === 0) {
          const savedJobs = JSON.parse(localStorage.getItem('manualJobs') || '[]');
          loadedJobs = savedJobs;
          
          if (isMountedRef.current) {
            setManualJobs(savedJobs);
          }
        }
        
        // Auto-cleanup old jobs
        if (loadedJobs.length > 0 && isMountedRef.current) {
          const cleanupResult = cleanupOldJobs(loadedJobs, true);
          setManualJobs(cleanupResult.cleanedJobs);
          setCleanupStats({
            before: cleanupResult.before,
            after: cleanupResult.after,
            removed: cleanupResult.removed
          });
          setLastCleanup(new Date().toLocaleString('en-IN'));
        }
        
        // Load last cleanup time
        const savedCleanup = localStorage.getItem('last_job_cleanup');
        if (savedCleanup && isMountedRef.current) {
          setLastCleanup(savedCleanup);
        }
        
        if (isMountedRef.current) {
          trackEvent('admin_page_view', { page: 'job_posting_admin' });
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    initialize();
    
    // Set page link
    if (isMountedRef.current) {
      setPageLink(`${window.location.origin}/job-applications`);
    }
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      isInitialLoadRef.current = false;
    };
  }, [trackEvent]);

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
              onClick={() => trackCTAClick('back_to_jobs', 'navigation', 'admin_job_posting')}
            >
              ← Back to Job Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Posting - Latest Jobs</h1>
            <p className="text-gray-600">Add new job opportunities to CareerCraft.in. Jobs auto-clean after 90 days.</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Job posted successfully! It will now appear on the Job Applications page (showing latest first).
            </div>
          )}

          {/* Firebase Connection Status */}
          <div className={`mb-6 rounded-lg p-4 ${firebaseEnabled 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
            : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${firebaseEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {firebaseEnabled ? <Cloud size={24} className="text-green-600" /> : <CloudOff size={24} className="text-yellow-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {firebaseEnabled ? '☁️ Cloud Sync Active' : '📱 Local Mode'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {firebaseEnabled 
                      ? 'Jobs sync automatically across all devices' 
                      : 'Working offline - jobs saved locally only'}
                  </p>
                  <p className="text-xs text-gray-500">Device ID: {deviceId.substring(0, 15)}...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={syncWithFirebase}
                  disabled={isSyncing}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    firebaseEnabled 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Syncing...
                    </>
                  ) : firebaseEnabled ? (
                    <>
                      <RefreshCw size={16} />
                      Sync Now
                    </>
                  ) : (
                    <>
                      <Cloud size={16} />
                      Enable Cloud
                    </>
                  )}
                </button>
                <button
                  onClick={refreshFromFirebase}
                  disabled={!firebaseEnabled || isSyncing}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    firebaseEnabled 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            {syncStatus && (
              <div className="mt-3 text-sm font-medium">
                {syncStatus}
              </div>
            )}
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`${syncMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-6`}>
              <div className="flex items-center">
                {syncMessage.type === 'success' ? (
                  <span className="mr-2">✅</span>
                ) : (
                  <AlertCircle size={16} className="mr-2" />
                )}
                {syncMessage.text}
              </div>
            </div>
          )}

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
                  Auto-Cleanup: Every 90 days | Last Cleanup: {lastCleanup || 'Never'} |
                  {firebaseEnabled ? ' ☁️ Cloud Sync' : ' 📱 Local Only'}
                </p>
              </div>
              <div className="mt-2 md:mt-0 flex gap-2">
                <button
                  onClick={() => setShowSyncPanel(!showSyncPanel)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                >
                  <Smartphone size={16} />
                  Mobile Import/Export
                </button>
                {cleanupStats && cleanupStats.removed > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-red-700 text-sm">
                      <AlertCircle size={14} className="inline mr-1" />
                      Auto-cleaned: {cleanupStats.removed} old jobs removed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sync Panel */}
          {showSyncPanel && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <Smartphone size={24} />
                  Import/Export for Mobile
                </h3>
                <button
                  onClick={() => setShowSyncPanel(false)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Download size={20} />
                    Step 1: Export from Laptop
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download your jobs as JSON file to transfer to mobile
                  </p>
                  <button
                    onClick={exportSyncJobs}
                    className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    <Download size={16} />
                    Export Jobs for Mobile (JSON)
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    File will be downloaded: <code>careercraft-jobs-sync-[date].json</code>
                  </p>
                </div>

                {/* Import Section */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Upload size={20} />
                    Step 2: Import on Mobile
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste JSON or Upload File
                      </label>
                      <textarea
                        value={syncJsonInput}
                        onChange={e => setSyncJsonInput(e.target.value)}
                        placeholder="Paste JSON exported from laptop here..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => syncFileInputRef.current?.click()}
                          className="flex-1 bg-gray-600 text-white py-2 rounded text-sm font-medium"
                        >
                          Upload File
                        </button>
                        <button
                          onClick={importSyncJobs}
                          disabled={!syncJsonInput.trim()}
                          className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium disabled:bg-gray-400"
                        >
                          Import Jobs
                        </button>
                        <input
                          type="file"
                          ref={syncFileInputRef}
                          onChange={handleSyncFileUpload}
                          accept=".json"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access Section */}
              <div className="mt-6 pt-6 border-t border-purple-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <LinkIcon size={20} />
                  Quick Mobile Access
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Job Applications Page</p>
                        <p className="text-xs text-gray-500 truncate">{pageLink}</p>
                      </div>
                      <button
                        onClick={copyPageLink}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">QR Code Access</p>
                        <p className="text-xs text-gray-500">Scan to open on mobile</p>
                      </div>
                      <button
                        onClick={generateQRCode}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded text-sm hover:from-blue-700 hover:to-indigo-700 flex items-center gap-1"
                      >
                        <QrCode size={16} />
                        Generate QR
                      </button>
                    </div>
                    {generatedQRCode && (
                      <div className="mt-3 text-center">
                        <img src={generatedQRCode} alt="QR Code" className="mx-auto w-32 h-32" />
                        <p className="text-xs text-gray-500 mt-2">Scan this QR code with mobile camera</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">📱 How to Sync Between Laptop & Mobile</h4>
                <ol className="text-sm text-gray-600 space-y-2 ml-4 list-decimal">
                  <li>On this laptop, click "Export Jobs for Mobile"</li>
                  <li>Save the JSON file to your computer</li>
                  <li>Transfer file to mobile (email, WhatsApp, cloud storage)</li>
                  <li>On mobile, open the Job Applications page</li>
                  <li>Tap "Sync" button and select "Import"</li>
                  <li>Choose the JSON file you transferred</li>
                  <li>Your jobs will appear instantly on mobile!</li>
                </ol>
                <div className="mt-4 flex gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Tip</span>
                  <span className="text-sm text-gray-600">
                    {firebaseEnabled 
                      ? 'With Firebase enabled, jobs sync automatically across devices!' 
                      : 'Enable Firebase above for automatic cloud sync'}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Shows as LATEST
                      </span>
                      {firebaseEnabled && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <Cloud size={10} className="mr-1" /> Cloud
                        </span>
                      )}
                    </div>
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
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        {firebaseEnabled ? (
                          <>
                            <Cloud size={18} />
                            Post & Sync to Cloud
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Post Job Locally
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {firebaseEnabled 
                          ? 'Job will sync automatically across all devices' 
                          : 'Job saved locally. Enable cloud sync for cross-device access'}
                      </p>
                    </div>
                  </form>
                </div>
              ) : (
                /* Bulk Upload Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Job Upload</h2>
                    <div className="flex gap-2">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                        All jobs marked as LATEST
                      </span>
                      {firebaseEnabled && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          ☁️ Cloud
                        </span>
                      )}
                    </div>
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
    "isNew": true
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
                      {firebaseEnabled && (
                        <p className="text-sm mt-1">✅ All successful jobs saved to cloud</p>
                      )}
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
                      {firebaseEnabled ? 'Upload & Sync' : 'Upload Jobs'}
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

              {/* Firebase Sync Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={18} className="text-green-600" />
                  <h4 className="font-semibold text-green-800">☁️ Cloud Sync Status</h4>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  {firebaseEnabled 
                    ? 'Jobs sync automatically across all devices' 
                    : 'Enable cloud sync for automatic cross-device access'}
                </p>
                <button
                  onClick={syncWithFirebase}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  {firebaseEnabled ? <RefreshCw size={16} /> : <Cloud size={16} />}
                  {firebaseEnabled ? 'Sync Now' : 'Enable Cloud Sync'}
                </button>
                <p className="text-xs text-green-600 mt-2 text-center">
                  {manualJobs.length} jobs {firebaseEnabled ? 'in cloud' : 'locally'}
                </p>
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
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">No latest jobs posted yet</p>
                    <button
                      onClick={applyTemplate.bind(null, 'software_developer')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Try a quick template →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {manualJobs.map(manualJob => {
                      const isNew = manualJob.isNew || (manualJob.addedTimestamp && (Date.now() - manualJob.addedTimestamp) < 24 * 60 * 60 * 1000);
                      const isOld = manualJob.addedTimestamp && (Date.now() - manualJob.addedTimestamp) > 60 * 24 * 60 * 60 * 1000; // 60+ days
                      const isFirebase = manualJob.id?.startsWith('firebase_');
                      
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
                                {isFirebase && (
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                    ☁️ Cloud
                                  </span>
                                )}
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                  Page {manualJob.page || 1}
                                </span>
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
                    <li>• Use Indian city names and states</li>
                    <li>• Mark high-priority roles as "Featured"</li>
                    <li>• Jobs auto-clean after 90 days</li>
                    <li>• {firebaseEnabled ? '☁️ Jobs sync across devices' : '📱 Enable cloud for cross-device sync'}</li>
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
                    <li>• {firebaseEnabled ? '☁️ Bulk uploads sync to cloud' : '📱 Enable cloud for automatic sync'}</li>
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
                    <span>New Today:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.isNew).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloud Jobs:</span>
                    <span className="font-bold">{manualJobs.filter(j => j.id?.startsWith('firebase_')).length}</span>
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