// src/firebase/syncService.ts
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from './config';

export class FirebaseSyncService {
  private firestore = getFirestoreInstance();

  async syncFallbackEvents() {
    if (!this.firestore) {
      console.log('Firestore not available, skipping sync');
      return;
    }

    const fallbackEvents = [];
    
    // Collect all fallback events from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase_fallback') || key.includes('fb_fallback'))) {
        try {
          const eventStr = localStorage.getItem(key);
          if (eventStr) {
            const event = JSON.parse(eventStr);
            fallbackEvents.push({ key, event });
          }
        } catch (error) {
          console.warn('Failed to parse fallback event:', key, error);
        }
      }
    }

    console.log(`🔄 Syncing ${fallbackEvents.length} fallback events to Firestore`);

    let successCount = 0;
    let errorCount = 0;

    for (const { key, event } of fallbackEvents) {
      try {
        // Upload to Firestore
        await addDoc(collection(this.firestore, 'events'), {
          ...event,
          isFallback: true,
          syncedAt: serverTimestamp(),
          originalKey: key
        });

        // Remove from localStorage
        localStorage.removeItem(key);
        successCount++;
        
      } catch (error) {
        console.error('Failed to sync event:', key, error);
        errorCount++;
      }
    }

    console.log(`✅ Synced ${successCount} events, ${errorCount} failed`);

    // Also sync retry queue
    await this.syncRetryQueue();
  }

  async syncRetryQueue() {
    const queueStr = localStorage.getItem('fb_retry_queue');
    if (!queueStr || !this.firestore) return;

    try {
      const queue = JSON.parse(queueStr);
      console.log(`🔄 Syncing ${queue.length} events from retry queue`);

      for (const event of queue) {
        try {
          await addDoc(collection(this.firestore, 'events'), {
            ...event,
            isRetryQueue: true,
            syncedAt: serverTimestamp()
          });
        } catch (error) {
          console.warn('Failed to sync retry queue event:', error);
        }
      }

      // Clear retry queue
      localStorage.removeItem('fb_retry_queue');
      console.log('✅ Retry queue synced');
    } catch (error) {
      console.error('Failed to sync retry queue:', error);
    }
  }

  async checkAndSync() {
    // Only sync if online
    if (navigator.onLine) {
      await this.syncFallbackEvents();
    }
  }
}

export const firebaseSyncService = new FirebaseSyncService();

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Back online, syncing Firebase events...');
    firebaseSyncService.checkAndSync();
  });

  // Auto-sync every 30 seconds when online
  setInterval(() => {
    if (navigator.onLine) {
      firebaseSyncService.checkAndSync();
    }
  }, 30000);
}