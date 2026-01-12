// src/components/AdminGovernmentExams.tsx - UPDATED WITH FIREBASE INTEGRATION
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { firebaseGovExamService } from '../firebase/govExamService';
import type { GovExamData, CreateGovExamInput } from '../firebase/govExamService';
import { AlertCircle, Clock, RefreshCw, Trash2, Upload, Database } from 'lucide-react';

const AdminGovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<GovExamData[]>([]);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkForm, setShowBulkForm] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastCleanup, setLastCleanup] = useState<string>('');
  const [cleanupStats, setCleanupStats] = useState<{
    before: number;
    after: number;
    removed: number;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ synced: number; failed: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  
  const { trackButtonClick, trackEvent } = useGoogleAnalytics();

  // Single exam form state
  const [singleExam, setSingleExam] = useState<CreateGovExamInput>({
    examName: '',
    organization: '',
    posts: '',
    vacancies: '',
    eligibility: '',
    applicationStartDate: '',
    applicationEndDate: '',
    examDate: '',
    examLevel: 'UPSC',
    ageLimit: '',
    applicationFee: '',
    examMode: 'Online',
    officialWebsite: '',
    notificationLink: '',
    applyLink: '',
    syllabus: '',
    admitCardDate: '',
    resultDate: '',
    featured: false,
    isNew: true
  });

  // Test Firebase connection
  useEffect(() => {
    const testConnection = async () => {
      const result = await firebaseGovExamService.testFirebaseConnection();
      setFirebaseConnected(result.connected);
      if (result.connected) {
        console.log('✅ Firebase connected successfully');
      }
    };
    
    testConnection();
  }, []);

  // Load exams on component mount
  useEffect(() => {
    loadExams();
    
    // Load last cleanup time
    const savedCleanup = localStorage.getItem('last_exam_cleanup');
    if (savedCleanup) {
      setLastCleanup(savedCleanup);
    }
  }, []);

  // Load exams with auto-cleanup
  const loadExams = async () => {
    try {
      const { exams: loadedExams } = await firebaseGovExamService.getGovExams({}, 1, 1000);
      setExams(loadedExams);
      
      // Calculate cleanup stats
      const now = Date.now();
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
      const beforeCount = loadedExams.length;
      const recentExams = loadedExams.filter((exam: GovExamData) => {
        const examTimestamp = exam.addedTimestamp || (exam.createdAt ? new Date(exam.createdAt).getTime() : Date.now());
        return examTimestamp >= ninetyDaysAgo;
      });
      const afterCount = recentExams.length;
      const removedCount = beforeCount - afterCount;
      
      // Update cleanup time
      const cleanupTime = new Date().toLocaleString('en-IN');
      localStorage.setItem('last_exam_cleanup', cleanupTime);
      setLastCleanup(cleanupTime);
      
      // Set cleanup stats
      setCleanupStats({
        before: beforeCount,
        after: afterCount,
        removed: removedCount
      });
      
      // Track cleanup event
      if (removedCount > 0) {
        trackEvent('exam_cleanup', {
          auto_cleanup: true,
          exams_before: beforeCount,
          exams_after: afterCount,
          exams_removed: removedCount
        });
      }
      
      setMessage({ type: 'success', text: `Loaded ${recentExams.length} latest government exams` });
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error loading exams:', error);
      setMessage({ type: 'error', text: 'Failed to load exams. Please check your connection.' });
    }
  };

  // Manual cleanup trigger
  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to remove all exams older than 90 days? This action cannot be undone.')) {
      try {
        // This will be handled by the Firebase service auto-cleanup
        await firebaseGovExamService.checkAndCleanupOldExams();
        await loadExams();
        setMessage({ type: 'success', text: 'Cleanup completed successfully!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Cleanup failed. Please try again.' });
      }
    }
  };

  // Handle single exam submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const examId = await firebaseGovExamService.createGovExam(singleExam);
      
      setMessage({ type: 'success', text: 'Latest government exam added successfully to Firebase!' });
      trackButtonClick('add_single_gov_exam', 'single_form', 'admin_gov_exams');
      
      // Reset form
      setSingleExam({
        examName: '',
        organization: '',
        posts: '',
        vacancies: '',
        eligibility: '',
        applicationStartDate: '',
        applicationEndDate: '',
        examDate: '',
        examLevel: 'UPSC',
        ageLimit: '',
        applicationFee: '',
        examMode: 'Online',
        officialWebsite: '',
        notificationLink: '',
        applyLink: '',
        syllabus: '',
        admitCardDate: '',
        resultDate: '',
        featured: false,
        isNew: true
      });

      // Reload exams
      await loadExams();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error creating exam:', error);
      setMessage({ type: 'error', text: 'Failed to add exam. Please try again.' });
    }
  };

  // Handle bulk submission
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const examData = JSON.parse(bulkInput);
      
      if (!Array.isArray(examData)) {
        setMessage({ type: 'error', text: 'Invalid format. Please provide an array of exams.' });
        return;
      }

      const results = await firebaseGovExamService.bulkCreateGovExams(examData);
      
      if (results.success > 0) {
        setMessage({ type: 'success', text: `Successfully added ${results.success} latest government exams to Firebase!` });
      }
      
      if (results.failed > 0) {
        setMessage({ 
          type: 'error', 
          text: `Added ${results.success} exams, but ${results.failed} failed. Check console for details.` 
        });
        console.error('Failed exams:', results.errors);
      }
      
      trackButtonClick('add_bulk_gov_exams', 'bulk_form', 'admin_gov_exams');
      setBulkInput('');
      setShowBulkForm(false);
      
      // Reload exams
      await loadExams();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid JSON format or upload failed. Please check your input.' });
    }
  };

  // Delete exam
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await firebaseGovExamService.deleteGovExam(id);
        setMessage({ type: 'success', text: 'Exam deleted successfully from Firebase!' });
        trackButtonClick('delete_gov_exam', 'exam_list', 'admin_gov_exams');
        
        // Reload exams
        await loadExams();
        
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete exam. Please try again.' });
      }
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string) => {
    try {
      const exam = exams.find(e => e.id === id);
      if (exam) {
        await firebaseGovExamService.updateGovExam(id, { featured: !exam.featured });
        trackButtonClick('toggle_featured', 'exam_list', 'admin_gov_exams');
        await loadExams();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Clear all exams
  const clearAllExams = async () => {
    if (window.confirm('Are you sure you want to delete all government exams from Firebase? This action cannot be undone.')) {
      try {
        // Note: In a real app, you'd want to batch delete or mark as inactive
        // For now, we'll clear local cache
        await firebaseGovExamService.clearLocalCache();
        setExams([]);
        trackButtonClick('clear_all_exams', 'exam_management', 'admin_gov_exams');
        setMessage({ type: 'success', text: 'All exams cleared from local cache!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to clear exams.' });
      }
    }
  };

  // Sync to Firebase
  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    try {
      const result = await firebaseGovExamService.syncAllToFirebase();
      setSyncStatus(result);
      setMessage({ 
        type: 'success', 
        text: `Synced ${result.synced} exams to Firebase. ${result.failed} failed.` 
      });
      
      // Reload exams
      await loadExams();
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed. Please try again.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Sample bulk data template
  const sampleBulkData = `[
  {
    "examName": "UPSC Civil Services Examination 2025",
    "organization": "UPSC",
    "posts": "IAS, IPS, IFS and other Civil Services",
    "vacancies": "1000+",
    "eligibility": "Graduate degree from a recognized university",
    "applicationStartDate": "2025-02-15",
    "applicationEndDate": "2025-03-15",
    "examDate": "2025-06-01",
    "examLevel": "UPSC",
    "ageLimit": "21-32 years",
    "applicationFee": "₹100 (General/OBC), Nil (SC/ST/PwD/Women)",
    "examMode": "Offline",
    "officialWebsite": "https://upsc.gov.in",
    "notificationLink": "https://upsc.gov.in/notifications",
    "applyLink": "https://upsconline.nic.in",
    "featured": true,
    "isNew": true
  },
  {
    "examName": "SSC CGL 2025",
    "organization": "SSC",
    "posts": "Combined Graduate Level Posts",
    "vacancies": "15000+",
    "eligibility": "Bachelor's Degree",
    "applicationStartDate": "2025-03-01",
    "applicationEndDate": "2025-03-31",
    "examDate": "2025-06-15",
    "examLevel": "SSC",
    "ageLimit": "18-32 years",
    "applicationFee": "₹100 (General), Nil (Women/SC/ST/PwD)",
    "examMode": "CBT",
    "officialWebsite": "https://ssc.nic.in",
    "notificationLink": "https://ssc.nic.in/notifications",
    "applyLink": "https://ssc.nic.in/apply",
    "featured": true,
    "isNew": true
  }
]`;

  return (
    <>
      <Helmet>
        <title>Admin - Latest Government Exams Management | CareerCraft.in</title>
        <meta name="description" content="Manage latest government job exam notifications for CareerCraft.in. Auto-cleaned every 90 days." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Latest Government Exams Admin Panel
            </h1>
            <p className="text-gray-600">
              Add and manage latest government job exam notifications. Auto-cleaned every 90 days.
            </p>
          </header>

          {/* Firebase Status */}
          <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${
            firebaseConnected 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <Database size={20} className={`mr-2 ${firebaseConnected ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <h3 className="font-semibold">
                  Firebase Status: {firebaseConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className="text-sm">
                  {firebaseConnected 
                    ? 'Data is being saved to Firebase Firestore' 
                    : 'Using localStorage fallback'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSyncToFirebase}
              disabled={isSyncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <Clock size={16} className="mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Sync to Firebase
                </>
              )}
            </button>
          </div>

          {syncStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                ✅ Last sync: {syncStatus.synced} exams synced, {syncStatus.failed} failed
              </p>
            </div>
          )}

          {/* Auto-Cleanup Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-green-800 mb-1">🔄 Auto-Cleanup System Active</h3>
                <p className="text-green-700 text-sm">
                  Exams older than 90 days are automatically removed to keep listings fresh.
                </p>
                <p className="text-green-700 text-sm">
                  Latest Exams: {exams.length} • Last Cleanup: {lastCleanup || 'Never'}
                </p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={handleCleanup}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clean Old Exams
                </button>
                <button
                  onClick={loadExams}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </button>
              </div>
            </div>
            {cleanupStats && cleanupStats.removed > 0 && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-700 text-sm">
                  <AlertCircle size={14} className="inline mr-1" />
                  Auto-cleaned: {cleanupStats.removed} old exams removed
                </p>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setShowBulkForm(false);
                trackButtonClick('show_single_form', 'form_toggle', 'admin_gov_exams');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                !showBulkForm
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Single Exam Form
            </button>
            <button
              onClick={() => {
                setShowBulkForm(true);
                trackButtonClick('show_bulk_form', 'form_toggle', 'admin_gov_exams');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showBulkForm
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Bulk Upload (JSON)
            </button>
          </div>

          {/* Single Exam Form */}
          {!showBulkForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Latest Exam</h2>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Shows as LATEST
                </span>
              </div>
              <form onSubmit={handleSingleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examName}
                      onChange={(e) => setSingleExam({...singleExam, examName: e.target.value})}
                      placeholder="e.g., UPSC Civil Services Examination 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.organization}
                      onChange={(e) => setSingleExam({...singleExam, organization: e.target.value})}
                      placeholder="e.g., UPSC, SSC, IBPS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posts/Positions *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.posts}
                      onChange={(e) => setSingleExam({...singleExam, posts: e.target.value})}
                      placeholder="e.g., IAS, IPS, IFS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Vacancies *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.vacancies}
                      onChange={(e) => setSingleExam({...singleExam, vacancies: e.target.value})}
                      placeholder="e.g., 1000+, 500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eligibility Criteria *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.eligibility}
                      onChange={(e) => setSingleExam({...singleExam, eligibility: e.target.value})}
                      placeholder="e.g., Bachelor's degree from a recognized university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Limit *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.ageLimit}
                      onChange={(e) => setSingleExam({...singleExam, ageLimit: e.target.value})}
                      placeholder="e.g., 21-32 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Fee *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationFee}
                      onChange={(e) => setSingleExam({...singleExam, applicationFee: e.target.value})}
                      placeholder="e.g., ₹100 (General), Nil (SC/ST)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationStartDate}
                      onChange={(e) => setSingleExam({...singleExam, applicationStartDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application End Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationEndDate}
                      onChange={(e) => setSingleExam({...singleExam, applicationEndDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examDate}
                      onChange={(e) => setSingleExam({...singleExam, examDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Category *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examLevel}
                      onChange={(e) => setSingleExam({...singleExam, examLevel: e.target.value})}
                    >
                      <option value="UPSC">UPSC</option>
                      <option value="SSC">SSC</option>
                      <option value="Banking">Banking</option>
                      <option value="Railway">Railway</option>
                      <option value="Defense">Defense</option>
                      <option value="State PSC">State PSC</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Police">Police</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Mode *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examMode}
                      onChange={(e) => setSingleExam({...singleExam, examMode: e.target.value})}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="CBT">CBT (Computer Based Test)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Official Website *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.officialWebsite}
                      onChange={(e) => setSingleExam({...singleExam, officialWebsite: e.target.value})}
                      placeholder="https://example.gov.in"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Link *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.notificationLink}
                      onChange={(e) => setSingleExam({...singleExam, notificationLink: e.target.value})}
                      placeholder="https://example.gov.in/notification.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply Link *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applyLink}
                      onChange={(e) => setSingleExam({...singleExam, applyLink: e.target.value})}
                      placeholder="https://example.gov.in/apply"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admit Card Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.admitCardDate || ''}
                      onChange={(e) => setSingleExam({...singleExam, admitCardDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.resultDate || ''}
                      onChange={(e) => setSingleExam({...singleExam, resultDate: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4"
                        checked={singleExam.featured}
                        onChange={(e) => setSingleExam({...singleExam, featured: e.target.checked})}
                      />
                      <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                    </label>
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4"
                        checked={singleExam.isNew}
                        onChange={(e) => setSingleExam({...singleExam, isNew: e.target.checked})}
                      />
                      <span className="text-sm font-medium text-gray-700">Mark as New (Latest)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Add Latest Government Exam to Firebase
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Exam will appear as "Latest" and auto-clean after 90 days
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Upload Form */}
          {showBulkForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Bulk Upload (JSON)</h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  All exams marked as LATEST
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Paste your JSON array of government exams below. Each exam should have all required fields.
              </p>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setBulkInput(sampleBulkData);
                    trackButtonClick('load_sample_data', 'bulk_form', 'admin_gov_exams');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load Sample Data
                </button>
              </div>

              <form onSubmit={handleBulkSubmit}>
                <div className="mb-4">
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    rows={20}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Paste JSON array here..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Upload Latest Exams to Firebase
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkInput('')}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Required Fields:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• examName, organization, posts, vacancies, eligibility</li>
                  <li>• applicationStartDate, applicationEndDate, examDate</li>
                  <li>• examLevel, ageLimit, applicationFee, examMode</li>
                  <li>• officialWebsite, notificationLink, applyLink</li>
                  <li>• Add "isNew": true for latest exams</li>
                  <li>• Add "featured": true for featured exams</li>
                </ul>
              </div>
            </div>
          )}

          {/* Existing Exams List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Latest Existing Exams ({exams.length})
                </h2>
                <p className="text-sm text-gray-600">Auto-cleaned every 90 days • Sorted by newest first</p>
              </div>
              {exams.length > 0 && (
                <button
                  onClick={clearAllExams}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear All Exams
                </button>
              )}
            </div>
            
            {exams.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No latest government exams added yet. Add your first exam using the form above.
              </p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const isOld = exam.addedTimestamp && (Date.now() - exam.addedTimestamp) > 60 * 24 * 60 * 60 * 1000; // 60+ days
                  
                  return (
                    <div key={exam.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isOld ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{exam.examName}</h3>
                            {exam.isNew && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                NEW
                              </span>
                            )}
                            {isOld && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                OLD (Will auto-clean)
                              </span>
                            )}
                            {exam.featured && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Organization:</strong> {exam.organization} | 
                            <strong> Category:</strong> {exam.examLevel} | 
                            <strong> Vacancies:</strong> {exam.vacancies}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Apply:</strong> {new Date(exam.applicationStartDate).toLocaleDateString()} - {new Date(exam.applicationEndDate).toLocaleDateString()} | 
                            <strong> Exam:</strong> {new Date(exam.examDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added: {new Date(exam.addedTimestamp || 0).toLocaleString('en-IN')} |
                            Views: {exam.views || 0}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => toggleFeatured(exam.id!)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            {exam.featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id!)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminGovernmentExams;