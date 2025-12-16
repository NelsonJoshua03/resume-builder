// src/components/FirestoreStatus.tsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { 
  firebaseTestConnection, 
  getConnectionStatus,
  testFirestoreConnection,
  runQuickTest,
  diagnoseConnection,
  cleanupTestData 
} from '../firebase/testConnection';

const FirestoreStatus = () => {
  const [status, setStatus] = useState(getConnectionStatus());
  const [isTesting, setIsTesting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  const checkFirestore = async (quick: boolean = false) => {
    if (isTesting) return;
    
    setIsTesting(true);
    try {
      if (quick) {
        await runQuickTest();
      } else {
        await testFirestoreConnection();
      }
      setStatus(getConnectionStatus());
    } catch (error) {
      console.error('Firestore check failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const runDiagnosis = async () => {
    const result = await diagnoseConnection();
    setDiagnosis(result);
    console.log('Connection diagnosis:', result);
  };

  useEffect(() => {
    // Initial check
    checkFirestore(true);
    
    // Check every 60 seconds
    const interval = setInterval(() => checkFirestore(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const lastTestTime = status.lastTest 
    ? new Date(status.lastTest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div className={`fixed bottom-4 left-4 px-4 py-3 rounded-lg shadow-lg z-50 max-w-xs ${
      status.connected 
        ? 'bg-green-100 border border-green-400 text-green-700' 
        : 'bg-red-100 border border-red-400 text-red-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-2">
            {isTesting ? '🔄' : status.connected ? '✅' : '❌'}
          </span>
          <div>
            <div className="font-bold">
              Firestore: {status.connected ? 'Connected' : 'Disconnected'}
            </div>
            {status.lastError && (
              <div className="text-sm mt-1 break-words">{status.lastError}</div>
            )}
            <div className="text-xs mt-1 flex flex-wrap gap-1">
              <span className={`px-2 py-1 rounded ${status.canWrite ? 'bg-green-200' : 'bg-gray-200'}`}>
                Write: {status.canWrite ? '✓' : '✗'}
              </span>
              <span className={`px-2 py-1 rounded ${status.canRead ? 'bg-green-200' : 'bg-gray-200'}`}>
                Read: {status.canRead ? '✓' : '✗'}
              </span>
              <span className="px-2 py-1 rounded bg-gray-200">
                {lastTestTime}
              </span>
              {isTesting && (
                <span className="px-2 py-1 rounded bg-yellow-200 animate-pulse">
                  Testing...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 ml-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
            title="Close"
          >
            ×
          </button>
          <button
            onClick={() => checkFirestore(false)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
            title="Run full test"
            disabled={isTesting}
          >
            🔄
          </button>
        </div>
      </div>
      
      {!status.connected && (
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            onClick={() => checkFirestore(false)}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
            disabled={isTesting}
          >
            Retry Connection
          </button>
          <button
            onClick={runDiagnosis}
            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded"
            disabled={isTesting}
          >
            Diagnose
          </button>
          <button
            onClick={cleanupTestData}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
          >
            Cleanup
          </button>
        </div>
      )}
      
      {diagnosis && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs font-bold text-blue-800 mb-1">Diagnosis Results:</div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Firebase Config: {diagnosis.firebaseConfig ? '✅' : '❌'}</div>
            <div>• GDPR Consent: {diagnosis.gdprConsent ? '✅' : '❌'}</div>
            <div>• Network: {diagnosis.networkOnline ? '✅' : '❌'}</div>
            <div>• Environment: {diagnosis.environment}</div>
            {diagnosis.suggestedActions.length > 0 && (
              <div className="mt-1">
                <div className="font-bold">Suggestions:</div>
                {diagnosis.suggestedActions.map((action: string, index: number) => (
                  <div key={index} className="text-red-600">• {action}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirestoreStatus;