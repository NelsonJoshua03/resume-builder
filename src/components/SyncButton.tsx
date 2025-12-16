// src/components/SyncButton.tsx
import React, { useState } from 'react';
import { firebaseSyncService } from '../firebase/syncService';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const { trackButtonClick } = useFirebaseAnalytics();

  const handleSync = async () => {
    setIsSyncing(true);
    trackButtonClick('manual_sync', 'sync_button', window.location.pathname);
    
    try {
      await firebaseSyncService.syncFallbackEvents();
      setLastSync(new Date().toLocaleTimeString());
      alert('✅ Events synced to Firebase!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('❌ Sync failed. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Only show if there are fallback events
  const hasFallbackEvents = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase_fallback') || key.includes('fb_fallback'))) {
        return true;
      }
    }
    return false;
  };

  if (!hasFallbackEvents()) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div>
          <strong>⚠️ Events in LocalStorage</strong>
          <p className="text-sm">Some events need to be synced to Firebase</p>
          {lastSync && (
            <p className="text-xs">Last sync: {lastSync}</p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
};

export default SyncButton;