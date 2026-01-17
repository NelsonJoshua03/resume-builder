// src/components/GovernmentExams.tsx - MINIMAL DEBUG VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { firebaseGovExamService } from '../firebase/govExamService';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';

const GovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  // Use refs to prevent infinite loops
  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const renderCountRef = useRef(0);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    renderCountRef.current += 1;
    addDebugLog(`Render count: ${renderCountRef.current}`);
    
    return () => {
      isMountedRef.current = false;
      addDebugLog('Component unmounting');
    };
  }, []);

  // Load exams ONCE on mount
  useEffect(() => {
    if (hasLoadedRef.current) {
      addDebugLog('Skipping load - already loaded');
      return;
    }
    
    hasLoadedRef.current = true;
    loadExams();
    
    // Cleanup
    return () => {
      addDebugLog('Load effect cleanup');
    };
  }, []); // Empty dependency array - load once

  const loadExams = async () => {
    try {
      addDebugLog('=== STARTING loadExams ===');
      setLoading(true);
      setError(null);

      // 1. Test Firebase connection
      addDebugLog('Testing Firebase connection...');
      const connectionTest = await firebaseGovExamService.testFirebaseConnection();
      setFirebaseConnected(connectionTest.connected);
      addDebugLog(`Firebase connected: ${connectionTest.connected}`);
      addDebugLog(`Connection message: ${connectionTest.message}`);

      if (!connectionTest.connected) {
        addDebugLog('Firebase not connected - loading from cache');
        loadFromCache();
        return;
      }

      // 2. Try to load from Firebase
      addDebugLog('Fetching from Firestore...');
      const { exams: loadedExams, total } = await firebaseGovExamService.getGovExams({}, 1, 1000);
      addDebugLog(`Firestore returned ${loadedExams.length} exams, total: ${total}`);

      if (!isMountedRef.current) {
        addDebugLog('Component unmounted, stopping');
        return;
      }

      if (loadedExams.length === 0) {
        addDebugLog('No exams from Firestore - loading from cache');
        loadFromCache();
        return;
      }

      // 3. Success - update state
      addDebugLog(`Setting ${loadedExams.length} exams to state`);
      setExams(loadedExams);
      
      // Save to cache
      localStorage.setItem('government_exams_cache', JSON.stringify({
        exams: loadedExams,
        timestamp: Date.now()
      }));
      
      addDebugLog('✅ Successfully loaded from Firebase');
      setError(null);

    } catch (err: any) {
      console.error('Error in loadExams:', err);
      addDebugLog(`❌ Error: ${err.message || 'Unknown error'}`);
      
      if (!isMountedRef.current) return;
      
      setError(`Failed to load: ${err.message}`);
      loadFromCache();
    } finally {
      if (isMountedRef.current) {
        addDebugLog('Setting loading to false');
        setLoading(false);
      }
    }
  };

  const loadFromCache = () => {
    addDebugLog('Loading from cache...');
    try {
      const cacheData = localStorage.getItem('government_exams_cache');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        const cachedExams = Array.isArray(parsed.exams) ? parsed.exams : [];
        
        if (cachedExams.length > 0) {
          addDebugLog(`Found ${cachedExams.length} exams in cache`);
          setExams(cachedExams);
          setError('Using cached data. Firebase connection issue.');
        } else {
          addDebugLog('Cache is empty');
          setError('No exams found in cache.');
        }
      } else {
        addDebugLog('No cache found');
        setError('No government exams available.');
      }
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
      addDebugLog(`Cache error: ${cacheError}`);
      setError('Failed to load from cache.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addSampleExams = () => {
    addDebugLog('Adding sample exams...');
    const sampleExams = [
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
        notificationLink: '#',
        applyLink: '#',
        featured: true,
        isNew: true,
        views: 1500,
        applications: 450,
        shares: 120,
        addedTimestamp: Date.now()
      }
    ];
    
    setExams(sampleExams);
    setError(null);
    setLoading(false);
    setFirebaseConnected(false);
    
    // Save to cache
    localStorage.setItem('government_exams_cache', JSON.stringify({
      exams: sampleExams,
      timestamp: Date.now()
    }));
    
    addDebugLog('✅ Sample exams loaded');
  };

  const handleRefresh = () => {
    addDebugLog('=== MANUAL REFRESH ===');
    hasLoadedRef.current = false;
    loadExams();
  };

  return (
    <>
      <Helmet>
        <title>Government Exams Debug - CareerCraft</title>
      </Helmet>

      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Government Exams - DEBUG MODE</h1>
          
          <div className="bg-black/20 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div className="text-sm font-mono space-y-1 max-h-32 overflow-y-auto">
              {debugLog.map((log, index) => (
                <div key={index} className="text-green-200">{log}</div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw size={16} className="mr-2" />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={addSampleExams}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading government exams...</p>
              <p className="text-sm text-gray-500 mt-2">
                Firebase: {firebaseConnected ? 'Connected ✅' : 'Connecting...'}
              </p>
              <button 
                onClick={() => {
                  addDebugLog('Force stopping load');
                  setLoading(false);
                  loadFromCache();
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-800"
              >
                Force Stop & Use Cache
              </button>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={addSampleExams}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Government Exams ({exams.length})
                </h2>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={14} />
                  {firebaseConnected ? 'Live Data ✅' : 'Cached Data ⚠️'}
                </div>
              </div>

              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Exams Found</h3>
                  <p className="text-gray-600 mb-4">The database is empty.</p>
                  <button
                    onClick={addSampleExams}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Load Sample Data
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exams.slice(0, 4).map((exam) => (
                    <div key={exam.id} className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.examName}</h3>
                      <p className="text-gray-600 mb-2">{exam.organization}</p>
                      <p className="text-sm text-gray-500 mb-3">{exam.posts}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="font-semibold w-32">Vacancies:</span>
                          <span>{exam.vacancies}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-32">Apply Date:</span>
                          <span>{exam.applicationStartDate} to {exam.applicationEndDate}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold w-32">Exam Date:</span>
                          <span>{exam.examDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default GovernmentExams;