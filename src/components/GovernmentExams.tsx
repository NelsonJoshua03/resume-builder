// src/components/GovernmentExams.tsx - UPDATED WITH FIXED FIREBASE LOADING
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { firebaseGovExamService } from '../firebase/govExamService';
import type { GovExamData } from '../firebase/govExamService';
import { Clock, AlertCircle, Filter, Calendar, ExternalLink, BookOpen, Users, TrendingUp, RefreshCw, Database } from 'lucide-react';

const GovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<GovExamData[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const examsPerPage = 12;

  const { trackDailyPageView, trackGovExamApplication } = useEnhancedAnalytics();
  const { trackButtonClick } = useGoogleAnalytics();

  // Load exams with improved error handling
  const loadExams = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Starting to load exams...');
    
    try {
      console.log('🔄 [GovernmentExams] Starting loadExams...');
      
      // Test Firebase connection first
      try {
        const connection = await firebaseGovExamService.testFirebaseConnection();
        console.log('✅ [GovernmentExams] Firebase connection test:', connection);
        setFirebaseConnected(connection.connected);
        setDebugInfo(`Firebase: ${connection.connected ? 'Connected' : 'Disconnected'} - ${connection.message}`);
        
        if (!connection.connected) {
          console.warn('⚠️ Firebase connection failed, using cache');
          loadFromCache();
          return;
        }
      } catch (connError) {
        console.error('❌ [GovernmentExams] Connection test failed:', connError);
        setFirebaseConnected(false);
        setDebugInfo('Firebase connection test failed');
        loadFromCache();
        return;
      }
      
      // Try to get exams from Firebase
      try {
        console.log('🔄 [GovernmentExams] Calling getGovExams from Firebase...');
        const { exams: loadedExams, total } = await firebaseGovExamService.getGovExams({}, 1, 1000);
        
        console.log(`✅ [GovernmentExams] Received ${loadedExams.length} exams from Firebase, total: ${total}`);
        
        if (loadedExams.length === 0) {
          console.log('⚠️ [GovernmentExams] No exams returned from Firebase, checking cache...');
          loadFromCache();
          return;
        }
        
        // Process the exams with proper date handling
        const processedExams = loadedExams.map(exam => ({
          ...exam,
          // Ensure all required fields exist
          id: exam.id || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          examName: exam.examName || 'Untitled Exam',
          organization: exam.organization || 'Unknown Organization',
          posts: exam.posts || 'Various Posts',
          vacancies: exam.vacancies || 'Not specified',
          eligibility: exam.eligibility || 'Check official notification',
          applicationStartDate: exam.applicationStartDate || new Date().toISOString().split('T')[0],
          applicationEndDate: exam.applicationEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          examDate: exam.examDate || 'To be announced',
          examLevel: exam.examLevel || 'Other',
          ageLimit: exam.ageLimit || 'As per rules',
          applicationFee: exam.applicationFee || 'Check official notification',
          examMode: exam.examMode || 'Online',
          officialWebsite: exam.officialWebsite || '#',
          notificationLink: exam.notificationLink || '#',
          applyLink: exam.applyLink || '#',
          views: exam.views || 0,
          applications: exam.applications || 0,
          shares: exam.shares || 0,
          featured: exam.featured || false,
          isNew: exam.isNew !== undefined ? exam.isNew : true,
          addedTimestamp: exam.addedTimestamp || Date.now()
        }));
        
        setExams(processedExams);
        setLastUpdated(new Date().toLocaleString('en-IN'));
        setError(null);
        
        // Save to cache
        localStorage.setItem('government_exams_cache', JSON.stringify({
          exams: processedExams,
          timestamp: Date.now()
        }));
        
        // Set basic stats
        setStats({
          totalExams: processedExams.length,
          totalViews: processedExams.reduce((sum: number, exam: GovExamData) => sum + (exam.views || 0), 0),
          totalApplications: processedExams.reduce((sum: number, exam: GovExamData) => sum + (exam.applications || 0), 0),
          totalShares: processedExams.reduce((sum: number, exam: GovExamData) => sum + (exam.shares || 0), 0)
        });
        
        console.log(`✅ [GovernmentExams] Successfully loaded ${processedExams.length} exams`);
        setDebugInfo(`Successfully loaded ${processedExams.length} exams from Firebase`);
        
      } catch (firestoreError: any) {
        console.error('❌ [GovernmentExams] Firestore error:', firestoreError);
        console.error('Error code:', firestoreError.code);
        console.error('Error message:', firestoreError.message);
        
        setDebugInfo(`Firestore error: ${firestoreError.code || 'Unknown'} - ${firestoreError.message || 'No message'}`);
        loadFromCache();
      }
      
    } catch (err: any) {
      console.error('❌ [GovernmentExams] General error in loadExams:', err);
      setDebugInfo(`General error: ${err.message || 'Unknown error'}`);
      loadFromCache();
    } finally {
      setLoading(false);
    }
  };

  // Load from cache function
  const loadFromCache = () => {
    console.log('🔄 [GovernmentExams] Loading from cache...');
    setDebugInfo('Loading from cache...');
    
    try {
      const cacheData = localStorage.getItem('government_exams_cache');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        const cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        if (cachedExams.length > 0) {
          console.log(`✅ [GovernmentExams] Found ${cachedExams.length} exams in cache`);
          setExams(cachedExams);
          setLastUpdated(new Date(parsed.timestamp).toLocaleString('en-IN'));
          setError('Using cached data. Firebase connection issue.');
          setDebugInfo(`Loaded ${cachedExams.length} exams from cache (timestamp: ${new Date(parsed.timestamp).toLocaleString()})`);
          
          // Set stats from cache
          setStats({
            totalExams: cachedExams.length,
            totalViews: cachedExams.reduce((sum: number, exam: any) => sum + (exam.views || 0), 0),
            totalApplications: cachedExams.reduce((sum: number, exam: any) => sum + (exam.applications || 0), 0),
            totalShares: cachedExams.reduce((sum: number, exam: any) => sum + (exam.shares || 0), 0)
          });
        } else {
          console.log('⚠️ [GovernmentExams] Cache is empty');
          setError('No exams found. Please check your connection and try again.');
          setDebugInfo('Cache is empty');
        }
      } else {
        console.log('⚠️ [GovernmentExams] No cache found');
        setError('No government exams available. Please check back later.');
        setDebugInfo('No cache found');
      }
    } catch (cacheError) {
      console.error('❌ [GovernmentExams] Cache error:', cacheError);
      setError('Failed to load exams from cache.');
      setDebugInfo(`Cache error: ${cacheError}`);
    }
  };

  // Track daily page view on mount
  useEffect(() => {
    trackDailyPageView('Latest Government Exams', '/government-exams');
    loadExams();
  }, [trackDailyPageView]);

  // Exam levels/categories
  const examLevels = [
    'all',
    'UPSC',
    'SSC',
    'Banking',
    'Railway',
    'Defense',
    'State PSC',
    'Teaching',
    'Police',
    'Engineering',
    'Medical',
    'Judicial',
    'Other'
  ];

  // Popular organizations
  const organizations = [
    'all',
    'UPSC',
    'SSC',
    'IBPS',
    'SBI',
    'RRB',
    'Indian Army',
    'Indian Navy',
    'Indian Air Force',
    'State Government',
    'GATE',
    'UGC',
    'AIIMS',
    'Other'
  ];

  // Check if application is open
  const isApplicationOpen = (exam: GovExamData) => {
    try {
      const now = new Date();
      const startDate = new Date(exam.applicationStartDate);
      const endDate = new Date(exam.applicationEndDate);
      return now >= startDate && now <= endDate;
    } catch {
      return false;
    }
  };

  // Check if application is upcoming
  const isApplicationUpcoming = (exam: GovExamData) => {
    try {
      const now = new Date();
      const startDate = new Date(exam.applicationStartDate);
      return now < startDate;
    } catch {
      return false;
    }
  };

  // Check if application is closed
  const isApplicationClosed = (exam: GovExamData) => {
    try {
      const now = new Date();
      const endDate = new Date(exam.applicationEndDate);
      return now > endDate;
    } catch {
      return false;
    }
  };

  // Days remaining to apply
  const getDaysRemaining = (endDate: string) => {
    try {
      const now = new Date();
      const end = new Date(endDate);
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const matchesLevel = selectedLevel === 'all' || exam.examLevel === selectedLevel;
    const matchesOrg = selectedOrg === 'all' || exam.organization === selectedOrg;
    const matchesSearch = searchTerm === '' || 
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.organization && exam.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exam.posts && exam.posts.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (applicationStatusFilter === 'open') {
      matchesStatus = isApplicationOpen(exam);
    } else if (applicationStatusFilter === 'upcoming') {
      matchesStatus = isApplicationUpcoming(exam);
    } else if (applicationStatusFilter === 'closed') {
      matchesStatus = isApplicationClosed(exam);
    }
    
    return matchesLevel && matchesOrg && matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + examsPerPage);

  // Featured exams
  const featuredExams = exams.filter(exam => exam.featured).slice(0, 4);
  
  // New exams (added in last 7 days or marked as new)
  const newExams = exams.filter(exam => 
    exam.isNew || (exam.addedTimestamp && (Date.now() - exam.addedTimestamp) < 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 4);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    trackButtonClick('search_gov_exams', 'search_form', 'government_exams');
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedLevel('all');
    setSelectedOrg('all');
    setSearchTerm('');
    setApplicationStatusFilter('all');
    setCurrentPage(1);
    trackButtonClick('clear_filters', 'filters', 'government_exams');
  };

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    trackButtonClick(`page_${page}`, 'pagination', 'government_exams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle exam application click
  const handleExamApplyClick = async (exam: GovExamData) => {
    trackGovExamApplication(exam.id || '', exam.examName, exam.organization);
    trackButtonClick('apply_gov_exam', 'exam_card', 'government_exams');
    
    // Increment application count in Firebase
    if (exam.id && firebaseConnected) {
      try {
        await firebaseGovExamService.incrementApplicationCount(exam.id);
        
        // Update local state
        setExams(prevExams => 
          prevExams.map(e => 
            e.id === exam.id 
              ? { ...e, applications: (e.applications || 0) + 1 }
              : e
          )
        );
      } catch (error) {
        console.warn('Failed to increment application count:', error);
      }
    }
  };

  // Handle exam view click
  const handleExamViewClick = async (exam: GovExamData) => {
    if (exam.id && firebaseConnected) {
      try {
        await firebaseGovExamService.incrementViewCount(exam.id);
        
        // Update local state
        setExams(prevExams => 
          prevExams.map(e => 
            e.id === exam.id 
              ? { ...e, views: (e.views || 0) + 1 }
              : e
          )
        );
      } catch (error) {
        console.warn('Failed to increment view count:', error);
      }
    }
  };

  // Refresh exams
  const handleRefresh = async () => {
    setError(null);
    setDebugInfo('Refreshing...');
    await loadExams();
    trackButtonClick('refresh_exams', 'page_header', 'government_exams');
  };

  // Add some sample data for testing if needed
  const addSampleExams = () => {
    const sampleExams: GovExamData[] = [
      {
        id: 'exam_1',
        examName: 'UPSC Civil Services Preliminary Exam 2025',
        organization: 'UPSC',
        posts: 'Civil Services (IAS, IPS, IFS, etc.)',
        vacancies: 'Approximately 1000',
        eligibility: "Bachelor's degree from recognized university",
        applicationStartDate: '2025-02-01',
        applicationEndDate: '2025-03-01',
        examDate: '2025-05-28',
        examLevel: 'UPSC',
        ageLimit: '21-32 years',
        applicationFee: '₹100 for General, No fee for SC/ST/PH',
        examMode: 'Offline (OMR Based)',
        officialWebsite: 'https://upsc.gov.in',
        notificationLink: 'https://upsc.gov.in/sites/default/files/notification-csp-2025.pdf',
        applyLink: 'https://upsconline.nic.in',
        featured: true,
        isNew: true,
        views: 1500,
        applications: 450,
        shares: 120,
        addedTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
      },
      {
        id: 'exam_2',
        examName: 'SSC CGL 2025',
        organization: 'SSC',
        posts: 'Group B and Group C Gazetted/Non-Gazetted posts',
        vacancies: 'Approximately 20,000',
        eligibility: "Bachelor's degree in any discipline",
        applicationStartDate: '2025-04-01',
        applicationEndDate: '2025-05-01',
        examDate: '2025-07-15',
        examLevel: 'SSC',
        ageLimit: '18-32 years',
        applicationFee: '₹100 for General/EWS, No fee for SC/ST/PH/Women',
        examMode: 'Online (CBT)',
        officialWebsite: 'https://ssc.nic.in',
        notificationLink: 'https://ssc.nic.in/SSC-CGL-2025-Notification.pdf',
        applyLink: 'https://ssconline.nic.in',
        featured: true,
        isNew: false,
        views: 2200,
        applications: 1800,
        shares: 350,
        addedTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 // 15 days ago
      },
      {
        id: 'exam_3',
        examName: 'IBPS PO 2025',
        organization: 'IBPS',
        posts: 'Probationary Officer',
        vacancies: '4000+',
        eligibility: "Bachelor's degree in any discipline",
        applicationStartDate: '2025-08-01',
        applicationEndDate: '2025-08-31',
        examDate: '2025-10-15',
        examLevel: 'Banking',
        ageLimit: '20-30 years',
        applicationFee: '₹850 for General/OBC, ₹175 for SC/ST/PWD',
        examMode: 'Online',
        officialWebsite: 'https://ibps.in',
        notificationLink: 'https://ibps.in/notifications/ibps-po-2025.pdf',
        applyLink: 'https://ibpsonline.ibps.in',
        featured: false,
        isNew: true,
        views: 1800,
        applications: 1200,
        shares: 200,
        addedTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
      }
    ];
    
    setExams(sampleExams);
    setLastUpdated(new Date().toLocaleString('en-IN'));
    setError(null);
    setFirebaseConnected(false);
    setDebugInfo('Using sample data for testing');
    
    // Save to cache
    localStorage.setItem('government_exams_cache', JSON.stringify({
      exams: sampleExams,
      timestamp: Date.now()
    }));
    
    setStats({
      totalExams: sampleExams.length,
      totalViews: sampleExams.reduce((sum: number, exam: GovExamData) => sum + (exam.views || 0), 0),
      totalApplications: sampleExams.reduce((sum: number, exam: GovExamData) => sum + (exam.applications || 0), 0),
      totalShares: sampleExams.reduce((sum: number, exam: GovExamData) => sum + (exam.shares || 0), 0)
    });
  };

  return (
    <>
      <Helmet>
        <title>Latest Government Exams 2025 - Sarkari Naukri Updates | CareerCraft.in</title>
        <meta name="description" content="Latest Government Job Exams 2025 - UPSC, SSC, Banking, Railway, Defense notifications. Get exam dates, eligibility, syllabus for all Sarkari Naukri exams in India. Updated daily, auto-cleaned every 90 days." />
        <meta name="keywords" content="latest government exams 2025, sarkari exam updates, UPSC notification today, SSC exams latest, banking jobs 2025, railway recruitment, defense jobs India, govt job exam dates, latest sarkari naukri" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://careercraft.in/government-exams" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Latest Government Exams 2025 - Sarkari Naukri Updates | CareerCraft.in" />
        <meta property="og:description" content="Latest Government Job Exams 2025 - UPSC, SSC, Banking, Railway, Defense notifications. Get exam dates, eligibility, syllabus for all Sarkari Naukri exams in India." />
        <meta property="og:url" content="https://careercraft.in/government-exams" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest Government Exams 2025 - Sarkari Naukri Updates | CareerCraft.in" />
        <meta name="twitter:description" content="Latest Government Job Exams 2025 - UPSC, SSC, Banking, Railway, Defense notifications. Get exam dates, eligibility, syllabus for all Sarkari Naukri exams in India." />
        <meta name="twitter:image" content="https://careercraft.in/logos/careercraft-logo-square.png" />
        <meta name="twitter:site" content="@CareerCraftIN" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Latest Government Exams in India",
            "description": "Updated list of latest government job exams and notifications for Indian job seekers",
            "url": "https://careercraft.in/government-exams",
            "numberOfItems": exams.length,
            "itemListElement": exams.slice(0, 10).map((exam, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "EducationalOccupationalCredential",
                "name": exam.examName,
                "description": exam.eligibility,
                "credentialCategory": exam.examLevel,
                "recognizedBy": {
                  "@type": "Organization",
                  "name": exam.organization
                },
                "validFor": {
                  "@type": "Country",
                  "name": "India"
                },
                "url": exam.applyLink
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏛️ Latest Government Exams 2025
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Complete Guide to Sarkari Naukri Exams - UPSC, SSC, Banking, Railway, Defense & More
            <span className="block text-sm text-green-200 mt-2">
              Auto-cleaned every 90 days • Updated: {lastUpdated || 'Loading...'}
              {!firebaseConnected && (
                <span className="text-yellow-300 ml-2">• Using cached data</span>
              )}
            </span>
            {debugInfo && (
              <span className="block text-xs text-green-100 mt-1">
                Debug: {debugInfo}
              </span>
            )}
          </p>
          
          {/* Error Message Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className={`${error.includes('cached') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg p-4`}>
                <div className="flex items-center">
                  <AlertCircle className="mr-2" size={24} />
                  <div>
                    <h3 className="font-bold">{error.includes('cached') ? 'Using Cached Data' : 'Error Loading Exams'}</h3>
                    <p className="text-sm">{error}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={handleRefresh}
                        className={`${error.includes('cached') ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded transition-colors text-sm flex items-center`}
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Try Again
                      </button>
                      <button
                        onClick={addSampleExams}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm flex items-center"
                      >
                        <Database size={16} className="mr-2" />
                        Load Sample Data
                      </button>
                      <Link
                        to="/admin/government-exams"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm flex items-center"
                      >
                        Go to Admin Panel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-xl p-4 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search exams, posts, or organization..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  {examLevels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Categories' : level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Search Latest Exams'}
                </button>
              </div>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm disabled:opacity-50"
                disabled={loading}
              >
                <Filter size={16} />
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
              
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Organization</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      value={selectedOrg}
                      onChange={(e) => {
                        setSelectedOrg(e.target.value);
                        setCurrentPage(1);
                      }}
                      disabled={loading}
                    >
                      {organizations.map(org => (
                        <option key={org} value={org}>
                          {org === 'all' ? 'All Organizations' : org}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Application Status</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      value={applicationStatusFilter}
                      onChange={(e) => {
                        setApplicationStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      disabled={loading}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Currently Open</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{exams.length}</span>
              <span className="text-sm ml-2">Latest Exams</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">
                {exams.filter(e => isApplicationOpen(e)).length}
              </span>
              <span className="text-sm ml-2">Applications Open</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">
                {newExams.length}
              </span>
              <span className="text-sm ml-2">New This Week</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">
                {stats?.totalViews || 0}
              </span>
              <span className="text-sm ml-2">Total Views</span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw size={16} className="mr-2" />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={clearFilters}
              disabled={loading}
              className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading latest government exams...</p>
              <p className="text-sm text-gray-500 mt-2">
                {firebaseConnected ? 'Connecting to Firebase...' : 'Loading from cache...'}
              </p>
            </div>
          ) : error && !error.includes('cached') ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Exams</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retry Loading
                </button>
                <button
                  onClick={addSampleExams}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Database size={16} className="mr-2" />
                  Load Sample Data
                </button>
                <Link
                  to="/admin/government-exams"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  Go to Admin Panel
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Debug Info: {debugInfo}
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Government Exams Found</h3>
              <p className="text-gray-600 mb-4">The database is empty. Please add exams from the admin panel or load sample data.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={addSampleExams}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Database size={16} className="mr-2" />
                  Load Sample Data
                </button>
                <Link
                  to="/admin/government-exams"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
                >
                  Add Government Exams
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Category
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={selectedLevel}
                      onChange={(e) => {
                        setSelectedLevel(e.target.value);
                        setCurrentPage(1);
                        trackButtonClick(`filter_category_${e.target.value}`, 'filters', 'government_exams');
                      }}
                    >
                      {examLevels.map(level => (
                        <option key={level} value={level}>
                          {level === 'all' ? 'All Categories' : level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Organization Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={selectedOrg}
                      onChange={(e) => {
                        setSelectedOrg(e.target.value);
                        setCurrentPage(1);
                        trackButtonClick(`filter_org_${e.target.value}`, 'filters', 'government_exams');
                      }}
                    >
                      {organizations.map(org => (
                        <option key={org} value={org}>
                          {org === 'all' ? 'All Organizations' : org}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Application Status Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Status
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={applicationStatusFilter}
                      onChange={(e) => {
                        setApplicationStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Currently Open</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Stats */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <TrendingUp size={16} className="mr-2" />
                      Latest Exam Stats
                    </h4>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <BookOpen size={12} className="mr-1" />
                      {filteredExams.length} latest exams found
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {exams.filter(e => isApplicationOpen(e)).length} accepting applications
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <Users size={12} className="mr-1" />
                      {newExams.length} new this week
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Auto-cleaned every 90 days
                    </p>
                    <p className="text-sm text-gray-600">
                      Updated: {lastUpdated.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                </div>

                {/* Auto-Cleanup Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <h3 className="font-bold text-yellow-800 text-sm">🔄 Auto-Cleanup Active</h3>
                  </div>
                  <p className="text-yellow-700 text-xs mb-2">
                    Exams older than 90 days are automatically removed to keep listings fresh.
                  </p>
                  <p className="text-yellow-700 text-xs">
                    Showing only latest exams from last 3 months
                  </p>
                </div>

                {/* Firebase Status */}
                <div className={`mt-6 p-4 rounded-lg flex items-center ${firebaseConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${firebaseConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {firebaseConnected ? 'Live Data' : 'Cached Data'}
                      </p>
                      <p className="text-xs">
                        {firebaseConnected ? 'Connected to Firebase' : 'Using offline cache'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resume Builder CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                  <h3 className="font-bold text-blue-800 mb-2">
                    📄 Prepare Your Resume
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Create ATS-friendly resume for government job applications
                  </p>
                  <Link 
                    to="/free-resume-builder" 
                    onClick={() => trackButtonClick('build_resume_sidebar', 'sidebar_cta', 'government_exams')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                  >
                    Build Resume
                  </Link>
                </div>

                {/* Analytics Dashboard Access */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
                  <h3 className="font-bold text-purple-800 mb-2">
                    📊 View Analytics
                  </h3>
                  <p className="text-purple-700 text-sm mb-3">
                    Track exam applications and user behavior
                  </p>
                  <Link 
                    to="/admin/daily-analytics" 
                    onClick={() => trackButtonClick('view_analytics', 'sidebar_cta', 'government_exams')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors block text-center"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>

              {/* Exams List */}
              <div className="lg:w-3/4">
                {/* New Exams Section */}
                {newExams.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <span className="text-red-500 mr-2">🔥</span> New Exams This Week
                      </h2>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {newExams.length} new exams
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {newExams.map(exam => (
                        <ExamCard key={exam.id} exam={exam} newExam onViewClick={() => handleExamViewClick(exam)} onApplyClick={() => handleExamApplyClick(exam)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Exams */}
                {featuredExams.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-yellow-500 mr-2">⭐</span> Latest Featured Government Exams
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {featuredExams.map(exam => (
                        <ExamCard key={exam.id} exam={exam} featured onViewClick={() => handleExamViewClick(exam)} onApplyClick={() => handleExamApplyClick(exam)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Exams */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    All Latest Government Exams 2025
                    <span className="text-gray-600 text-lg ml-2">({filteredExams.length})</span>
                  </h2>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock size={14} />
                    Page {currentPage} of {totalPages} • Updated: {lastUpdated.split(',')[0]}
                    {!firebaseConnected && <span className="text-yellow-600">• Cached</span>}
                  </div>
                </div>
                
                {currentExams.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No exams match your filters</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                    <button 
                      onClick={clearFilters}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentExams.map(exam => (
                        <ExamCard key={exam.id} exam={exam} onViewClick={() => handleExamViewClick(exam)} onApplyClick={() => handleExamApplyClick(exam)} />
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
                          
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`px-3 py-2 rounded-lg border ${currentPage === pageNum ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
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
          )}
        </div>
      </section>
    </>
  );
};

// Exam Card Component
const ExamCard: React.FC<{ 
  exam: GovExamData; 
  featured?: boolean; 
  newExam?: boolean;
  onViewClick?: () => void;
  onApplyClick?: () => void;
}> = ({ exam, featured = false, newExam = false, onViewClick, onApplyClick }) => {
  const { trackGovExamApplication } = useEnhancedAnalytics();
  const { trackButtonClick } = useGoogleAnalytics();
  
  const isApplicationOpen = () => {
    try {
      const now = new Date();
      const startDate = new Date(exam.applicationStartDate);
      const endDate = new Date(exam.applicationEndDate);
      return now >= startDate && now <= endDate;
    } catch {
      return false;
    }
  };

  const getDaysRemaining = () => {
    try {
      const now = new Date();
      const end = new Date(exam.applicationEndDate);
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const daysLeft = getDaysRemaining();
  const applicationOpen = isApplicationOpen();
  const isRecent = exam.addedTimestamp && (Date.now() - exam.addedTimestamp) < 24 * 60 * 60 * 1000;

  const handleApplyClick = () => {
    if (onApplyClick) onApplyClick();
  };

  const handleNotificationClick = () => {
    trackButtonClick('view_notification', 'exam_card', 'government_exams');
  };

  const handleOfficialWebsiteClick = () => {
    trackButtonClick('official_website', 'exam_card', 'government_exams');
  };

  // Trigger view tracking when component mounts
  React.useEffect(() => {
    if (onViewClick) {
      onViewClick();
    }
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${featured ? 'ring-2 ring-yellow-400' : newExam ? 'ring-2 ring-red-400' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">{exam.examName}</h3>
            <div className="flex flex-col items-end gap-1">
              {isRecent && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  NEW TODAY
                </span>
              )}
              {exam.isNew && !isRecent && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
              {featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              {newExam && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  This Week
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-2">{exam.organization}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Calendar size={12} />
            <span>Added: {exam.addedTimestamp ? new Date(exam.addedTimestamp).toLocaleDateString('en-IN') : 'Recently'}</span>
            <span className="ml-auto">Views: {exam.views || 0}</span>
          </div>
        </div>
        {applicationOpen && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Apply Now
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Posts:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.posts}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Vacancies:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.vacancies}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Eligibility:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.eligibility}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Age Limit:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.ageLimit}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Application Fee:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.applicationFee}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Apply Start</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.applicationStartDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Apply End</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.applicationEndDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Exam Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.examDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Exam Mode</p>
          <p className="text-sm font-semibold text-gray-800">{exam.examMode}</p>
        </div>
      </div>

      {applicationOpen && daysLeft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
            <AlertCircle size={14} />
            Only {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left to apply!
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
          {exam.examLevel}
        </span>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
          {exam.organization}
        </span>
        {exam.admitCardDate && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            Admit Card: {new Date(exam.admitCardDate).toLocaleDateString('en-IN')}
          </span>
        )}
        {exam.syllabus && (
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
            Syllabus Available
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <a 
          href={exam.applyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-center shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <ExternalLink size={16} />
          Apply Online
        </a>
        <div className="flex gap-2">
          <a 
            href={exam.notificationLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleNotificationClick}
            className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center text-sm flex items-center justify-center gap-2"
          >
            <BookOpen size={14} />
            Notification
          </a>
          <a 
            href={exam.officialWebsite} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleOfficialWebsiteClick}
            className="flex-1 border border-gray-600 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center text-sm flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            Official Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default GovernmentExams;