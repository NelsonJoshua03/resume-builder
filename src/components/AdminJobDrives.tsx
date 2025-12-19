// src/components/AdminJobDrives.tsx - UPDATED WITH FIREBASE INTEGRATION
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { getFirebaseStatus } from '../firebase/config';
import { firebaseDriveService } from '../firebase/driveService';
import type { JobDriveData, CreateDriveInput } from '../firebase/driveService';
import { 
  Plus, 
  Trash2, 
  Upload, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Download,
  Upload as UploadIcon,
  Database,
  CheckCircle,
  XCircle,
  WifiOff,
  Zap,
  Copy,
  Briefcase,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  Users,
  DollarSign,
  Mail,
  ExternalLink
} from 'lucide-react';

const AdminJobDrives: React.FC = () => {
  const [drive, setDrive] = useState<CreateDriveInput>({
    title: '',
    company: '',
    location: '',
    date: '',
    time: '',
    description: '',
    eligibility: [],
    documents: [],
    applyLink: '',
    contact: '',
    featured: false,
    driveType: 'Walk-in Interview',
    experience: '',
    salary: '',
    expectedCandidates: undefined,
  });

  const [eligibilityInput, setEligibilityInput] = useState('');
  const [documentsInput, setDocumentsInput] = useState('');
  const [drives, setDrives] = useState<JobDriveData[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [cleanupStats, setCleanupStats] = useState<{
    before: number;
    after: number;
    removed: number;
  } | null>(null);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [exportMessage, setExportMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
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

  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    message: string;
    synced?: number;
    failed?: number;
  }>({ syncing: false, message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { trackButtonClick, trackEvent, trackCTAClick, trackUserFlow } = useGoogleAnalytics();
  const { trackFirebaseEvent } = useFirebaseAnalytics();

  // Quick drive templates
  const quickTemplates = {
    walkin_interview: {
      title: "Walk-in Interview for Software Engineers",
      company: "Tech Solutions India",
      location: "Bangalore, Karnataka",
      date: new Date().toISOString().split('T')[0],
      time: "10:00 AM - 4:00 PM",
      description: "Immediate hiring for software engineers through walk-in interviews. Bring your updated resume and relevant documents.",
      eligibility: [
        "Bachelor's degree in Computer Science or related field",
        "0-3 years of experience",
        "Good programming skills",
        "Good communication skills"
      ],
      documents: [
        "Updated Resume",
        "Photo ID Proof",
        "Educational Certificates (All semesters)",
        "Experience Letters (if any)"
      ],
      applyLink: "mailto:careers@company.com",
      contact: "HR: 9876543210",
      driveType: "Walk-in Interview",
      experience: "0-3 years",
      salary: "₹4,00,000 - ₹8,00,000 PA",
      expectedCandidates: 100
    },
    campus_drive: {
      title: "Campus Placement Drive",
      company: "MNC Corporation",
      location: "Delhi University Campus, Delhi",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "9:00 AM - 5:00 PM",
      description: "Campus placement drive for final year students. Multiple positions available across departments.",
      eligibility: [
        "Final year students (B.Tech/B.E/MCA)",
        "Minimum 60% aggregate",
        "No active backlogs",
        "Good academic record"
      ],
      documents: [
        "Resume",
        "College ID Card",
        "All semester mark sheets",
        "Photo ID Proof"
      ],
      applyLink: "https://company.com/campus-drive",
      contact: "Campus Coordinator: 8765432109",
      driveType: "Campus Drive",
      experience: "Freshers",
      salary: "₹3,50,000 - ₹6,00,000 PA",
      expectedCandidates: 200
    },
    job_fair: {
      title: "Job Fair 2025 - Multiple Companies",
      company: "Career Expo India",
      location: "Mumbai, Maharashtra",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "10:00 AM - 6:00 PM",
      description: "Annual job fair with participation from 50+ companies across IT, Banking, Manufacturing sectors.",
      eligibility: [
        "Any graduate/post-graduate",
        "0-5 years experience",
        "Good communication skills",
        "Relevant domain knowledge"
      ],
      documents: [
        "Multiple copies of Resume",
        "Photo ID Proof",
        "Educational Certificates",
        "Passport size photographs"
      ],
      applyLink: "https://careerexpo.in/register",
      contact: "Organizer: 7654321098",
      driveType: "Job Fair",
      experience: "0-5 years",
      salary: "Varies by company",
      expectedCandidates: 1000
    }
  };

  // Load drives and check Firebase status
  useEffect(() => {
    loadDrives();
    
    // Check Firebase status
    const status = getFirebaseStatus();
    setFirebaseStatus(status);
    
    // Load last cleanup time
    const savedCleanup = localStorage.getItem('last_drive_cleanup');
    if (savedCleanup) {
      setLastCleanup(savedCleanup);
    }
    
    trackEvent('admin_page_view', { page: 'drive_posting_admin' });
    trackFirebaseEvent('admin_page_view', 'Admin', 'drive_posting_admin', { page: 'drive_posting_admin' });
  }, []);

  // Load drives from Firebase
  const loadDrives = async () => {
    try {
      const result = await firebaseDriveService.getDrives({}, 1, 1000);
      setDrives(result.drives);
      
      // Calculate cleanup stats
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const oldDrives = result.drives.filter(drive => {
        const driveDate = new Date(drive.date);
        return driveDate < ninetyDaysAgo;
      });
      
      setCleanupStats({
        before: result.drives.length + oldDrives.length,
        after: result.drives.length,
        removed: oldDrives.length
      });
    } catch (error) {
      console.error('Error loading drives:', error);
    }
  };

  // Manual cleanup trigger
  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to remove all drives older than 90 days? This action cannot be undone.')) {
      try {
        // Get all drives
        const allDrives = drives;
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        // Mark old drives as inactive
        const updatePromises = allDrives
          .filter(drive => {
            const driveDate = new Date(drive.date);
            return driveDate < ninetyDaysAgo;
          })
          .map(drive => {
            if (drive.id) {
              return firebaseDriveService.updateDrive(drive.id, { isActive: false });
            }
            return Promise.resolve();
          });
        
        await Promise.all(updatePromises);
        
        // Reload drives
        await loadDrives();
        
        // Save cleanup time
        const cleanupTime = new Date().toLocaleString('en-IN');
        localStorage.setItem('last_drive_cleanup', cleanupTime);
        setLastCleanup(cleanupTime);
        
        alert('Old drives cleaned up successfully!');
        
        trackEvent('drive_cleanup', {
          drives_removed: updatePromises.length
        });
        
        trackFirebaseEvent('drive_cleanup', 'System', 'manual_cleanup', {
          drives_removed: updatePromises.length
        });
      } catch (error) {
        console.error('Error cleaning up drives:', error);
        alert('Error cleaning up drives');
      }
    }
  };

  // Apply quick template
  const applyTemplate = (templateKey: keyof typeof quickTemplates) => {
    const template = quickTemplates[templateKey];
    setDrive(template);
    setEligibilityInput(template.eligibility.join('\n'));
    setDocumentsInput(template.documents.join('\n'));
    setActiveTab('single');
    
    trackButtonClick(`apply_template_${templateKey}`, 'quick_templates', 'admin_drive_posting');
    trackFirebaseEvent(`apply_template_${templateKey}`, 'Admin', 'quick_templates');
  };

  // Single drive submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newDriveData: CreateDriveInput = {
        ...drive,
        eligibility: eligibilityInput.split('\n')
          .filter(item => item.trim() !== '')
          .map(item => item.trim()),
        documents: documentsInput.split('\n')
          .filter(item => item.trim() !== '')
          .map(item => item.trim()),
      };

      // Use the drive service to create drive
      const driveId = await firebaseDriveService.createDrive(newDriveData);
      
      setShowSuccess(true);
      
      // Reset form
      setDrive({
        title: '',
        company: '',
        location: '',
        date: '',
        time: '',
        description: '',
        eligibility: [],
        documents: [],
        applyLink: '',
        contact: '',
        featured: false,
        driveType: 'Walk-in Interview',
        experience: '',
        salary: '',
        expectedCandidates: undefined,
      });
      setEligibilityInput('');
      setDocumentsInput('');

      // Reload drives
      await loadDrives();
      
      // Track drive posting
      trackButtonClick('post_single_drive', 'drive_form', 'admin_drive_posting');
      trackUserFlow('admin_drive_posting', 'drive_posted', 'drive_creation');
      trackEvent('drive_posted', {
        drive_type: 'single',
        drive_title: drive.title,
        company: drive.company,
        driveType: drive.driveType
      });
      
      trackFirebaseEvent('drive_posted', 'Drive Management', drive.title, {
        drive_type: 'single',
        company: drive.company,
        driveType: drive.driveType
      });

      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create drive: ' + error);
    }
  };

  // Bulk drive upload from JSON
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const drivesData = JSON.parse(bulkJsonInput);
      
      if (!Array.isArray(drivesData)) {
        throw new Error('JSON must be an array of drive objects');
      }

      setSyncStatus({ syncing: true, message: 'Uploading drives...' });

      // Use the drive service for bulk creation
      const results = await firebaseDriveService.bulkCreateDrives(drivesData);
      
      setBulkUploadResults(results);
      setSyncStatus({ 
        syncing: false, 
        message: results.success > 0 ? 
          `✅ Uploaded ${results.success} drives` : 
          'No drives uploaded',
        synced: results.success,
        failed: results.failed
      });

      if (results.success > 0) {
        // Reload drives
        await loadDrives();
        
        setBulkJsonInput('');
        
        trackUserFlow('admin_drive_posting', 'bulk_drives_uploaded', 'drive_creation');
        trackEvent('bulk_drives_uploaded', {
          total_drives: drivesData.length,
          successful_uploads: results.success,
          failed_uploads: results.failed
        });
        
        trackFirebaseEvent('bulk_drives_uploaded', 'Drive Management', 'bulk_upload', {
          total_drives: drivesData.length,
          successful_uploads: results.success,
          failed_uploads: results.failed
        });
        
        alert(`Successfully uploaded ${results.success} drives${results.failed > 0 ? ` (${results.failed} failed)` : ''}`);
      }
      
    } catch (error) {
      console.error('Error in bulk upload:', error);
      trackButtonClick('bulk_upload_error', 'bulk_upload', 'admin_drive_posting');
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

    trackButtonClick('upload_json_file', 'file_upload', 'admin_drive_posting');
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

  // Generate batch drives
  const generateBatchDrives = () => {
    const drives = [];
    const today = new Date();
    
    for (let i = 0; i < batchCreate.count; i++) {
      const company = batchCreate.companies[i % batchCreate.companies.length] || 'Tech Company';
      const location = batchCreate.locations[i % batchCreate.locations.length] || 'Bangalore, Karnataka';
      const driveDate = new Date(today);
      driveDate.setDate(driveDate.getDate() + i);
      
      drives.push({
        title: `${batchCreate.baseTitle} ${i + 1}`,
        company: company,
        location: location,
        date: driveDate.toISOString().split('T')[0],
        time: "10:00 AM - 4:00 PM",
        description: `Walk-in drive for ${batchCreate.baseTitle} positions at ${company} in ${location}.`,
        eligibility: ["Bachelor's degree required", "Good communication skills", "Relevant experience preferred"],
        documents: ["Updated Resume", "Photo ID proof", "Educational certificates"],
        applyLink: "mailto:careers@company.com",
        contact: "HR Department",
        featured: i < 2,
        driveType: "Walk-in Interview",
        experience: "0-3 years",
        salary: "₹3,00,000 - ₹6,00,000 PA",
        expectedCandidates: 50 + i * 10
      });
    }
    
    setBulkJsonInput(JSON.stringify(drives, null, 2));
    trackButtonClick('generate_batch_drives', 'batch_creator', 'admin_drive_posting');
    trackFirebaseEvent('generate_batch_drives', 'Admin', 'batch_creator');
  };

  // Download template JSON
  const downloadTemplate = () => {
    const template = [
      {
        "title": "Walk-in Drive for Software Engineers",
        "company": "Tech Solutions India",
        "location": "Bangalore, Karnataka",
        "date": new Date().toISOString().split('T')[0],
        "time": "10:00 AM - 4:00 PM",
        "description": "Immediate hiring for software engineers with good programming skills.",
        "eligibility": [
          "Bachelor's degree in Computer Science",
          "0-2 years experience",
          "Good problem solving skills"
        ],
        "documents": [
          "Updated Resume",
          "Photo ID proof",
          "Educational certificates"
        ],
        "applyLink": "mailto:careers@company.com",
        "contact": "HR: 9876543210",
        "featured": true,
        "driveType": "Walk-in Interview",
        "experience": "0-2 years",
        "salary": "₹3,00,000 - ₹6,00,000 PA",
        "expectedCandidates": 100
      }
    ];
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = 'careercraft-drives-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackEvent('download_template', { type: 'drives_template' });
    trackFirebaseEvent('download_template', 'Admin', 'template_download');
  };

  // Export current drives
  const exportDrives = () => {
    const blob = new Blob([JSON.stringify(drives, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-drives-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    trackButtonClick('export_drives', 'drive_management', 'admin_drive_posting');
    trackFirebaseEvent('export_drives', 'Admin', 'drive_management');
  };

  const deleteDrive = async (driveId: string) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        await firebaseDriveService.deleteDrive(driveId);
        // Reload drives
        await loadDrives();
        
        trackButtonClick('delete_drive', 'drive_management', 'admin_drive_posting');
        trackFirebaseEvent('delete_drive', 'Admin', 'drive_management');
      } catch (error) {
        console.error('Error deleting drive:', error);
        alert('Error deleting drive');
      }
    }
  };

  const clearAllDrives = () => {
    if (window.confirm('Are you sure you want to delete all drives? This action cannot be undone.')) {
      // This would need to be implemented in the drive service
      alert('Bulk delete functionality would be implemented here');
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    setSyncStatus({ syncing: true, message: 'Testing Firebase connection...' });
    
    try {
      const result = await firebaseDriveService.testFirebaseConnection();
      
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

  // Sync with Firebase manually
  const syncWithFirebase = async () => {
    if (!window.confirm('This will sync all localStorage drives to Firebase. Continue?')) {
      return;
    }
    
    setSyncStatus({ syncing: true, message: 'Syncing drives to Firebase...' });
    
    try {
      const result = await firebaseDriveService.syncAllToFirebase();
      
      setSyncStatus({ 
        syncing: false, 
        message: result.synced > 0 ? 
          `✅ Synced ${result.synced} drives to Firebase` : 
          result.synced === 0 && result.failed === 0 ? 
            'No drives to sync' : 'Failed to sync drives',
        synced: result.synced,
        failed: result.failed
      });
      
      if (result.synced > 0) {
        alert(`Successfully synced ${result.synced} drives to Firebase${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
        // Reload drives
        await loadDrives();
      } else if (result.failed > 0) {
        alert('Failed to sync drives. Please check console for errors.');
      } else {
        alert('No drives available to sync.');
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

  const driveTypes = [
    'Walk-in Interview',
    'Job Fair',
    'Campus Drive',
    'Virtual Drive',
    'Immediate Joining',
    'Pool Campus',
    'Mass Recruitment'
  ];

  const popularLocations = [
    'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Delhi', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Kolkata, West Bengal', 
    'Gurgaon, Haryana', 'Noida, Uttar Pradesh', 'Ahmedabad, Gujarat'
  ];

  return (
    <>
      <Helmet>
        <title>Admin - Latest Job Drives | CareerCraft.in</title>
        <meta name="description" content="Manage latest walk-in drives and job fairs for CareerCraft.in - India's premier career platform. Auto-cleaned every 90 days." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/job-drives" 
              className="text-green-600 hover:text-green-800 mb-4 inline-block"
              onClick={() => trackCTAClick('back_to_drives', 'navigation', 'admin_drive_posting')}
            >
              ← Back to Latest Job Drives
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Job Drives - CareerCraft.in</h1>
            <p className="text-gray-600">Add latest walk-in drives and job fairs for Indian job seekers. Auto-cleaned every 90 days.</p>
          </div>

          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Latest drive posted successfully on CareerCraft!
            </div>
          )}

          {/* Import/Export Messages */}
          {importMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${importMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              {importMessage.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
              {importMessage.text}
            </div>
          )}

          {exportMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${exportMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              {exportMessage.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
              {exportMessage.text}
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
                      ? 'Drives will be saved to both localStorage and Firebase' 
                      : 'Drives will be saved to localStorage only. To use Firebase, check your configuration.'}
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
                  onClick={syncWithFirebase}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Database size={16} />
                  Sync to Firebase
                </button>
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-green-800">CareerCraft Drive Portal Status</h3>
                <p className="text-green-700 text-sm">
                  Latest Drives: {drives.length} | Featured: {drives.filter(d => d.featured).length} | 
                  Today: {drives.filter(d => new Date(d.date).toDateString() === new Date().toDateString()).length}
                </p>
                <p className="text-green-700 text-sm">
                  Auto-Cleanup: Every 90 days | Last Cleanup: {lastCleanup || 'Never'}
                </p>
              </div>
              {cleanupStats && cleanupStats.removed > 0 && (
                <div className="mt-2 md:mt-0 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-red-700 text-sm">
                    <AlertCircle size={14} className="inline mr-1" />
                    Auto-cleaned: {cleanupStats.removed} old drives removed
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
                    trackButtonClick('switch_tab_single', 'tab_navigation', 'admin_drive_posting');
                  }}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'single'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Single Drive Posting
                </button>
                <button
                  onClick={() => {
                    setActiveTab('bulk');
                    trackButtonClick('switch_tab_bulk', 'tab_navigation', 'admin_drive_posting');
                  }}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'bulk'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bulk Drive Upload
                </button>
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'single' ? (
                /* Single Drive Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Post Latest Drive on CareerCraft</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Shows as LATEST
                    </span>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Drive Type and Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Drive Type
                        </label>
                        <select
                          value={drive.driveType}
                          onChange={e => setDrive({...drive, driveType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {driveTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience Required
                        </label>
                        <input
                          type="text"
                          value={drive.experience}
                          onChange={e => setDrive({...drive, experience: e.target.value})}
                          placeholder="e.g., 0-2 years, Freshers"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Salary and Expected Candidates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Salary/Stipend
                        </label>
                        <input
                          type="text"
                          value={drive.salary}
                          onChange={e => setDrive({...drive, salary: e.target.value})}
                          placeholder="e.g., ₹3,00,000 - ₹6,00,000 PA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Candidates
                        </label>
                        <input
                          type="number"
                          value={drive.expectedCandidates || ''}
                          onChange={e => setDrive({...drive, expectedCandidates: parseInt(e.target.value) || undefined})}
                          placeholder="e.g., 500"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
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
                          placeholder="e.g., https://company.com/drive-details or mailto:careers@company.com"
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
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Plus size={20} className="inline mr-2" />
                        Add Latest Job Drive to CareerCraft
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Drive will appear as "Latest" and auto-clean after 90 days
                      </p>
                    </div>
                  </form>
                </div>
              ) : (
                /* Bulk Upload Form */
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Drive Upload</h2>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      All drives marked as LATEST
                    </span>
                  </div>
                  
                  {/* Batch Drive Creator */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Zap className="mr-2" size={20} />
                      Quick Batch Creator for Indian Market
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Drive Title</label>
                        <input
                          type="text"
                          value={batchCreate.baseTitle}
                          onChange={e => setBatchCreate({...batchCreate, baseTitle: e.target.value})}
                          placeholder="e.g., Walk-in Drive for Engineers"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Drives</label>
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
                      onClick={generateBatchDrives}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                      Generate Latest Batch Drives for India
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a JSON file containing an array of drive objects
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
    "title": "Walk-in Drive for Software Engineers",
    "company": "Tech Company India",
    "location": "Bangalore, Karnataka",
    "date": "${new Date().toISOString().split('T')[0]}",
    "time": "10:00 AM - 4:00 PM",
    "description": "Latest drive for Indian market...",
    "eligibility": ["Requirement 1", "Requirement 2"],
    "documents": ["Document 1", "Document 2"],
    "applyLink": "mailto:careers@company.com",
    "contact": "HR: 9876543210",
    "featured": false,
    "driveType": "Walk-in Interview",
    "experience": "0-2 years",
    "salary": "₹3,00,000 - ₹6,00,000 PA",
    "expectedCandidates": 100
  }
]`}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
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
                      <p>Successfully uploaded: {bulkUploadResults.success} latest drives</p>
                      <p>Failed: {bulkUploadResults.failed} drives</p>
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
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Latest Drives
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
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4">
                <h4 className="font-semibold mb-3">🚀 Quick Templates (India)</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => applyTemplate('walkin_interview')}
                    className="w-full bg-white text-green-600 py-2 px-3 rounded text-sm font-medium hover:bg-green-50 transition-colors text-left flex items-center"
                  >
                    <Briefcase size={14} className="mr-2" />
                    Walk-in Interview
                  </button>
                  <button 
                    onClick={() => applyTemplate('campus_drive')}
                    className="w-full bg-white text-green-600 py-2 px-3 rounded text-sm font-medium hover:bg-green-50 transition-colors text-left flex items-center"
                  >
                    <Users size={14} className="mr-2" />
                    Campus Drive
                  </button>
                  <button 
                    onClick={() => applyTemplate('job_fair')}
                    className="w-full bg-white text-green-600 py-2 px-3 rounded text-sm font-medium hover:bg-green-50 transition-colors text-left flex items-center"
                  >
                    <MapPin size={14} className="mr-2" />
                    Job Fair
                  </button>
                </div>
              </div>

              {/* JSON Import/Export Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database size={20} className="text-purple-600" />
                  <h4 className="font-semibold text-purple-800">📁 JSON Backup & Restore</h4>
                </div>
                <p className="text-purple-700 text-sm mb-4">
                  Export drives for backup or import from other devices/mobile.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={exportDrives}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Download size={16} className="mr-2" />
                    Export Drives to JSON
                  </button>
                  
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center"
                  >
                    <UploadIcon size={16} className="mr-2" />
                    Import Drives from JSON
                  </button>
                  <input
                    type="file"
                    ref={importInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  
                  <button
                    onClick={downloadTemplate}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-colors flex items-center justify-center text-sm"
                  >
                    Download JSON Template
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
                  Drives older than 90 days are automatically removed to keep listings fresh.
                </p>
                <div className="space-y-2 text-sm text-red-700 mb-4">
                  <div className="flex justify-between">
                    <span>Last Cleanup:</span>
                    <span className="font-medium">{lastCleanup || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drives before:</span>
                    <span className="font-medium">{cleanupStats?.before || drives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drives after:</span>
                    <span className="font-medium">{cleanupStats?.after || drives.length}</span>
                  </div>
                  {cleanupStats && cleanupStats.removed > 0 && (
                    <div className="flex justify-between">
                      <span>Removed:</span>
                      <span className="font-medium bg-red-100 px-2 py-0.5 rounded">{cleanupStats.removed} old drives</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCleanup}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clean Old Drives Now
                </button>
              </div>

              {/* Existing Drives */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Latest CareerCraft Drives ({drives.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportDrives}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                      title="Export all latest drives"
                    >
                      Export
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={12} />
                  Showing newest first • Auto-cleaned every 90 days
                </div>
                {drives.length === 0 ? (
                  <p className="text-gray-500 text-sm">No latest drives added yet to CareerCraft</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {drives.slice(0, 10).map(driveItem => {
                      const isOld = new Date(driveItem.date) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60+ days
                      
                      return (
                        <div key={driveItem.id} className={`border rounded-lg p-3 ${isOld ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                                {driveItem.title}
                              </h4>
                              <p className="text-xs text-gray-600">{driveItem.company}</p>
                              <p className="text-xs text-gray-500">{driveItem.location}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {isOld && (
                                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                                    OLD (Will auto-clean)
                                  </span>
                                )}
                                {driveItem.featured && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                    Featured
                                  </span>
                                )}
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                  {new Date(driveItem.date).toLocaleDateString()}
                                </span>
                                {driveItem.views && (
                                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                    👁️ {driveItem.views}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Added: {driveItem.createdAt ? new Date(driveItem.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteDrive(driveItem.id || '')}
                              className="text-red-600 hover:text-red-800 ml-2"
                              title="Delete drive"
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

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Latest Drive Stats</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Latest Drives:</span>
                    <span className="font-bold">{drives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Featured:</span>
                    <span className="font-bold">{drives.filter(d => d.featured).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today:</span>
                    <span className="font-bold">{drives.filter(d => new Date(d.date).toDateString() === new Date().toDateString()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming:</span>
                    <span className="font-bold">{drives.filter(d => new Date(d.date) > new Date()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Views:</span>
                    <span className="font-bold">{drives.reduce((sum, d) => sum + (d.views || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-clean in:</span>
                    <span className="font-bold">90 days</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Tips for Latest Indian Job Drives</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Include all eligibility criteria for Indian graduates</li>
                  <li>• Provide clear contact information with Indian phone numbers</li>
                  <li>• Mark important drives as featured</li>
                  <li>• Set realistic dates and times for Indian locations</li>
                  <li>• Mention specific Indian educational requirements</li>
                  <li>• Drives auto-clean after 90 days</li>
                  <li>• Export JSON backups regularly</li>
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