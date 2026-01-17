// src/components/GovernmentExams.tsx - FIXED VERSION WITH MOUNT PROTECTION
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { firebaseGovExamService } from '../firebase/govExamService';
import type { GovExamData } from '../firebase/govExamService';
import { Clock, AlertCircle, RefreshCw, Calendar, Users, Award, Globe } from 'lucide-react';

const GovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<GovExamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [stats, setStats] = useState({
    totalExams: 0,
    totalViews: 0,
    totalApplications: 0
  });
  
  // Refs to track component lifecycle
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);
  const loadAttemptedRef = useRef(false);

  // Load exams ONCE - with proper cleanup
  useEffect(() => {
    console.log('🔵 [GovernmentExams] Component mounted');
    
    // Mark as mounted
    isMountedRef.current = true;
    
    // Only load if we haven't attempted yet
    if (!loadAttemptedRef.current) {
      loadAttemptedRef.current = true;
      loadExams();
    }
    
    // Cleanup function
    return () => {
      console.log('🔴 [GovernmentExams] Component unmounting');
      isMountedRef.current = false;
      isLoadingRef.current = false;
    };
  }, []); // Empty dependency array - run once on mount

  const loadExams = async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('⚠️ [GovernmentExams] loadExams already in progress, skipping');
      return;
    }
    
    try {
      console.log('🔄 [GovernmentExams] Starting loadExams');
      isLoadingRef.current = true;
      
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // Test Firebase connection
      console.log('🔄 [GovernmentExams] Testing Firebase connection...');
      const connectionTest = await firebaseGovExamService.testFirebaseConnection();
      console.log('✅ [GovernmentExams] Firebase connection test:', connectionTest);
      
      if (isMountedRef.current) {
        setFirebaseConnected(connectionTest.connected);
      }

      if (!connectionTest.connected) {
        console.warn('⚠️ [GovernmentExams] Firebase connection failed, using cache');
        if (isMountedRef.current) {
          loadFromCache();
        }
        return;
      }

      // Get stats first
      try {
        const statsData = await firebaseGovExamService.getStats();
        if (isMountedRef.current) {
          setStats({
            totalExams: statsData.totalExams,
            totalViews: statsData.totalViews,
            totalApplications: statsData.totalApplications
          });
        }
      } catch (statsError) {
        console.warn('⚠️ Failed to get stats:', statsError);
      }

      // Try to get exams from Firebase
      console.log('🔄 [GovernmentExams] Calling getGovExams from Firebase...');
      const { exams: loadedExams, total } = await firebaseGovExamService.getGovExams({}, 1, 1000);
      
      console.log(`✅ [GovernmentExams] Received ${loadedExams.length} exams from Firebase, total: ${total}`);

      if (!isMountedRef.current) {
        console.log('⚠️ [GovernmentExams] Component unmounted, skipping state update');
        return;
      }

      if (loadedExams.length === 0) {
        console.log('⚠️ [GovernmentExams] No exams returned from Firebase, checking cache...');
        loadFromCache();
        return;
      }

      // Process the exams
      const processedExams = loadedExams.map(exam => ({
        ...exam,
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
      
      if (isMountedRef.current) {
        setExams(processedExams);
        setLastUpdated(new Date().toLocaleString('en-IN'));
        setError(null);
        
        // Save to cache
        localStorage.setItem('government_exams_cache', JSON.stringify({
          exams: processedExams,
          timestamp: Date.now(),
          stats: {
            totalExams: processedExams.length,
            totalViews: processedExams.reduce((sum, exam) => sum + (exam.views || 0), 0),
            totalApplications: processedExams.reduce((sum, exam) => sum + (exam.applications || 0), 0)
          }
        }));
        
        console.log(`✅ [GovernmentExams] Successfully loaded ${processedExams.length} exams`);
      }
      
    } catch (err: any) {
      console.error('❌ [GovernmentExams] Error in loadExams:', err);
      
      if (isMountedRef.current) {
        setError(`Failed to load: ${err.message || 'Unknown error'}`);
        loadFromCache();
      }
    } finally {
      isLoadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const loadFromCache = () => {
    console.log('🔄 [GovernmentExams] Loading from cache...');
    
    try {
      const cacheData = localStorage.getItem('government_exams_cache');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        const cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        if (cachedExams.length > 0) {
          console.log(`✅ [GovernmentExams] Found ${cachedExams.length} exams in cache`);
          setExams(cachedExams);
          setLastUpdated(new Date(parsed.timestamp).toLocaleString('en-IN'));
          
          // Set stats from cache
          if (parsed.stats) {
            setStats(parsed.stats);
          } else {
            setStats({
              totalExams: cachedExams.length,
              totalViews: cachedExams.reduce((sum, exam) => sum + (exam.views || 0), 0),
              totalApplications: cachedExams.reduce((sum, exam) => sum + (exam.applications || 0), 0)
            });
          }
          
          setError('Using cached data. Firebase connection issue.');
        } else {
          console.log('⚠️ [GovernmentExams] Cache is empty');
          setError('No exams found in cache.');
        }
      } else {
        console.log('⚠️ [GovernmentExams] No cache found');
        setError('No government exams available.');
      }
    } catch (cacheError) {
      console.error('❌ [GovernmentExams] Cache error:', cacheError);
      setError('Failed to load from cache.');
    } finally {
      setLoading(false);
    }
  };

  const addSampleExams = () => {
    console.log('🔄 [GovernmentExams] Adding sample exams...');
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
        addedTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: 'exam_2',
        examName: 'SSC CGL 2025',
        organization: 'SSC',
        posts: 'Combined Graduate Level',
        vacancies: 'Approximately 8000',
        eligibility: "Bachelor's degree in any discipline",
        applicationStartDate: '2025-04-01',
        applicationEndDate: '2025-04-30',
        examDate: '2025-07-15',
        examLevel: 'SSC',
        ageLimit: '18-32 years',
        applicationFee: '₹100 for General, No fee for SC/ST/PH',
        examMode: 'Online (CBT)',
        officialWebsite: 'https://ssc.nic.in',
        notificationLink: 'https://ssc.nic.in/notification',
        applyLink: 'https://ssconline.nic.in',
        featured: true,
        isNew: true,
        views: 1200,
        applications: 380,
        shares: 90,
        addedTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000
      },
      {
        id: 'exam_3',
        examName: 'IBPS PO 2025',
        organization: 'IBPS',
        posts: 'Probationary Officer',
        vacancies: 'Approximately 4000',
        eligibility: "Bachelor's degree in any discipline",
        applicationStartDate: '2025-08-01',
        applicationEndDate: '2025-08-31',
        examDate: '2025-10-15',
        examLevel: 'Banking',
        ageLimit: '20-30 years',
        applicationFee: '₹850 for General, ₹175 for SC/ST/PH',
        examMode: 'Online',
        officialWebsite: 'https://ibps.in',
        notificationLink: 'https://ibps.in/notification',
        applyLink: 'https://ibpsonline.ibps.in',
        featured: false,
        isNew: true,
        views: 900,
        applications: 280,
        shares: 75,
        addedTimestamp: Date.now()
      }
    ];
    
    setExams(sampleExams);
    setLastUpdated(new Date().toLocaleString('en-IN'));
    setStats({
      totalExams: sampleExams.length,
      totalViews: sampleExams.reduce((sum, exam) => sum + (exam.views || 0), 0),
      totalApplications: sampleExams.reduce((sum, exam) => sum + (exam.applications || 0), 0)
    });
    setError(null);
    setLoading(false);
    setFirebaseConnected(false);
    
    // Save to cache
    localStorage.setItem('government_exams_cache', JSON.stringify({
      exams: sampleExams,
      timestamp: Date.now(),
      stats: {
        totalExams: sampleExams.length,
        totalViews: sampleExams.reduce((sum, exam) => sum + (exam.views || 0), 0),
        totalApplications: sampleExams.reduce((sum, exam) => sum + (exam.applications || 0), 0)
      }
    }));
    
    console.log('✅ [GovernmentExams] Sample exams loaded');
  };

  const handleRefresh = () => {
    console.log('🔄 [GovernmentExams] Manual refresh requested');
    loadAttemptedRef.current = false;
    loadExams();
  };

  // Function to get application status
  const getApplicationStatus = (exam: GovExamData) => {
    try {
      const now = new Date();
      const startDate = new Date(exam.applicationStartDate);
      const endDate = new Date(exam.applicationEndDate);
      
      if (now < startDate) {
        return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' };
      } else if (now > endDate) {
        return { status: 'closed', color: 'bg-gray-100 text-gray-800', label: 'Closed' };
      } else {
        return { status: 'open', color: 'bg-green-100 text-green-800', label: 'Open' };
      }
    } catch {
      return { status: 'unknown', color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  return (
    <>
      <Helmet>
        <title>Latest Government Exams 2025 - Sarkari Naukri Updates | CareerCraft.in</title>
        <meta name="description" content="Complete guide to latest government exams in India 2025. UPSC, SSC, Banking, Railway, Defense and other Sarkari Naukri notifications. Apply online for upcoming exams." />
        <meta name="keywords" content="government exams 2025, sarkari naukri, upsc exam, ssc cgl, banking exams, railway jobs, defense jobs, police recruitment, teaching jobs, state psc exams" />
        <link rel="canonical" href="https://careercraft.in/government-exams" />
      </Helmet>

      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏛️ Latest Government Exams 2025
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-6">
            Complete Guide to Sarkari Naukri Exams
          </p>
          
          {/* Stats Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <div className="text-3xl font-bold">{stats.totalExams}</div>
              <div className="text-sm">Latest Exams</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <div className="text-sm">Total Views</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <div className="text-3xl font-bold">{stats.totalApplications.toLocaleString()}</div>
              <div className="text-sm">Applications</div>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <div className="text-sm">
              <Clock size={14} className="inline mr-1" />
              Updated: {lastUpdated || 'Loading...'}
              {!firebaseConnected && lastUpdated && (
                <span className="text-yellow-300 ml-2">• Using cached data</span>
              )}
            </div>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw size={16} className="mr-2" />
              {loading ? 'Loading...' : 'Refresh Exams'}
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-4">
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
                        Load Sample Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading latest government exams...</p>
              <p className="text-sm text-gray-500 mt-2">
                {firebaseConnected ? 'Connecting to Firebase...' : 'Loading from cache...'}
              </p>
              <button 
                onClick={() => {
                  console.log('Cancelling load...');
                  setLoading(false);
                  loadFromCache();
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-800"
              >
                Cancel & Load from Cache
              </button>
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
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Government Exams Found</h3>
              <p className="text-gray-600 mb-4">The database is empty. Please add exams or load sample data.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={addSampleExams}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  All Latest Government Exams 2025
                  <span className="text-gray-600 text-lg ml-2">({exams.length})</span>
                </h2>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={14} />
                  Updated: {lastUpdated.split(',')[0]}
                  {!firebaseConnected && <span className="text-yellow-600">• Cached</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.slice(0, 12).map(exam => {
                  const status = getApplicationStatus(exam);
                  return (
                    <div key={exam.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                      {/* Header with Status */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                          {exam.featured && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{exam.examName}</h3>
                        <p className="text-gray-600 text-sm mt-1 flex items-center">
                          <Users size={14} className="mr-1" />
                          {exam.organization}
                        </p>
                      </div>

                      {/* Exam Details */}
                      <div className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Award size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">Level: </span>
                            <span className="text-sm font-semibold text-gray-800 ml-2">{exam.examLevel}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <div className="text-sm">
                              <span className="text-gray-700">Apply: </span>
                              <span className="font-semibold text-gray-800">
                                {new Date(exam.applicationStartDate).toLocaleDateString('en-IN')} - {new Date(exam.applicationEndDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Globe size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">Exam: </span>
                            <span className="text-sm font-semibold text-gray-800 ml-2">
                              {new Date(exam.examDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Vacancies:</span>
                              <div className="font-semibold text-gray-800">{exam.vacancies}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Fee:</span>
                              <div className="font-semibold text-gray-800">{exam.applicationFee}</div>
                            </div>
                          </div>
                        </div>

                        {/* Analytics */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>👁️ {exam.views?.toLocaleString() || 0} views</span>
                            <span>📄 {exam.applications?.toLocaleString() || 0} applications</span>
                            <span>↗️ {exam.shares?.toLocaleString() || 0} shares</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <a
                            href={exam.notificationLink || exam.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors text-center"
                          >
                            View Notification
                          </a>
                          {status.status === 'open' && (
                            <a
                              href={exam.applyLink || exam.officialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
                            >
                              Apply Now
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {exams.length > 12 && (
                <div className="mt-8 text-center">
                  <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Load More Exams ({exams.length - 12} more)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default GovernmentExams;