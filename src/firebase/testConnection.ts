// src/firebase/testConnection.ts - COMPLETE UPDATED VERSION
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp,
  writeBatch,
  doc,
  setDoc,
  getDoc,
  deleteDoc 
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';

export interface TestResult {
  success: boolean;
  writeId?: string;
  readCount?: number;
  error?: string;
  code?: string;
  timestamp: Date;
  details?: {
    writeTime?: number;
    readTime?: number;
    totalTime?: number;
  };
}

export interface ConnectionStatus {
  connected: boolean;
  lastTest: Date | null;
  lastError: string | null;
  testHistory: TestResult[];
  firestoreAvailable: boolean;
  canWrite: boolean;
  canRead: boolean;
}

class FirebaseTestConnection {
  private static instance: FirebaseTestConnection;
  private status: ConnectionStatus = {
    connected: false,
    lastTest: null,
    lastError: null,
    testHistory: [],
    firestoreAvailable: false,
    canWrite: false,
    canRead: false
  };

  private constructor() {}

  static getInstance(): FirebaseTestConnection {
    if (!FirebaseTestConnection.instance) {
      FirebaseTestConnection.instance = new FirebaseTestConnection();
    }
    return FirebaseTestConnection.instance;
  }

  async runCompleteTest(): Promise<TestResult> {
    const startTime = Date.now();
    const firestore = getFirestoreInstance();
    
    if (!firestore) {
      return this.createTestResult(false, null, 0, 'Firestore not initialized', 'NO_FIRESTORE', startTime);
    }

    try {
      // Test 1: Write operation
      const writeStart = Date.now();
      const testDoc = await addDoc(collection(firestore, '_test_connection'), {
        test: true,
        timestamp: Timestamp.now(),
        message: 'Firestore connection test',
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 100),
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`
      });
      const writeTime = Date.now() - writeStart;

      console.log('✅ Firestore write test successful:', testDoc.id);

      // Test 2: Read operation
      const readStart = Date.now();
      const snapshot = await getDocs(collection(firestore, '_test_connection'));
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Convert Firestore timestamps to Date objects for display
        timestamp: doc.data().timestamp instanceof Timestamp ? 
          doc.data().timestamp.toDate() : 
          doc.data().timestamp
      }));
      const readTime = Date.now() - readStart;

      console.log('✅ Firestore read test successful:', docs.length, 'docs found');

      // Test 3: Batch operations (optional, but good test)
      const batchStart = Date.now();
      const batch = writeBatch(firestore);
      const batchDocRef = doc(collection(firestore, '_test_batch'));
      batch.set(batchDocRef, {
        test: 'batch',
        timestamp: Timestamp.now()
      });
      await batch.commit();
      const batchTime = Date.now() - batchStart;

      // Test 4: Get document (single read)
      const getDocStart = Date.now();
      const docSnap = await getDoc(doc(firestore, '_test_connection', testDoc.id));
      const getDocTime = Date.now() - getDocStart;

      // Test 5: Update document
      const updateStart = Date.now();
      await setDoc(doc(firestore, '_test_connection', testDoc.id), {
        ...docSnap.data(),
        updated: Timestamp.now(),
        testPhase: 'complete'
      }, { merge: true });
      const updateTime = Date.now() - updateStart;

      // Cleanup: Delete test documents (optional)
      setTimeout(async () => {
        try {
          await deleteDoc(doc(firestore, '_test_connection', testDoc.id));
          await deleteDoc(batchDocRef);
          console.log('🧹 Cleaned up test documents');
        } catch (cleanupError) {
          console.log('Note: Test documents will remain for debugging');
        }
      }, 30000); // Clean up after 30 seconds

      const totalTime = Date.now() - startTime;

      // Update status
      this.status = {
        connected: true,
        lastTest: new Date(),
        lastError: null,
        testHistory: [...this.status.testHistory.slice(-9), this.createTestResult(
          true, 
          testDoc.id, 
          docs.length, 
          undefined, 
          undefined, 
          startTime,
          { writeTime, readTime, totalTime }
        )],
        firestoreAvailable: true,
        canWrite: true,
        canRead: true
      };

      return this.createTestResult(
        true, 
        testDoc.id, 
        docs.length, 
        undefined, 
        undefined, 
        startTime,
        { 
          writeTime, 
          readTime, 
          totalTime,
          batchTime,
          getDocTime,
          updateTime 
        }
      );

    } catch (error: any) {
      console.error('❌ Firestore test failed:', error);
      
      const errorResult = this.createTestResult(
        false, 
        undefined, 
        0, 
        error.message, 
        error.code, 
        startTime
      );

      // Update status with error
      this.status = {
        ...this.status,
        connected: false,
        lastTest: new Date(),
        lastError: error.message,
        testHistory: [...this.status.testHistory.slice(-9), errorResult],
        canWrite: false,
        canRead: false
      };

      // Provide detailed error guidance
      this.provideErrorGuidance(error);

      return errorResult;
    }
  }

  async runQuickTest(): Promise<TestResult> {
    const startTime = Date.now();
    const firestore = getFirestoreInstance();
    
    if (!firestore) {
      return this.createTestResult(false, null, 0, 'Firestore not initialized', 'NO_FIRESTORE', startTime);
    }

    try {
      // Quick write test only
      const testDoc = await addDoc(collection(firestore, '_test_quick'), {
        test: 'quick',
        timestamp: Timestamp.now(),
        quick: true
      });

      return this.createTestResult(
        true, 
        testDoc.id, 
        1, 
        undefined, 
        undefined, 
        startTime,
        { totalTime: Date.now() - startTime }
      );

    } catch (error: any) {
      return this.createTestResult(
        false, 
        undefined, 
        0, 
        error.message, 
        error.code, 
        startTime
      );
    }
  }

  async testPermissions(): Promise<{
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canCreateCollection: boolean;
  }> {
    const firestore = getFirestoreInstance();
    const result = {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canCreateCollection: false
    };

    if (!firestore) return result;

    try {
      // Test write permission
      const writeDoc = await addDoc(collection(firestore, '_test_permissions'), {
        test: 'write',
        timestamp: Timestamp.now()
      });
      result.canWrite = true;
      result.canCreateCollection = true;

      // Test read permission
      const snapshot = await getDocs(collection(firestore, '_test_permissions'));
      result.canRead = snapshot.docs.length > 0;

      // Test delete permission
      await deleteDoc(doc(firestore, '_test_permissions', writeDoc.id));
      result.canDelete = true;

      return result;
    } catch (error) {
      console.log('Permission test results:', result);
      return result;
    }
  }

  async diagnoseConnection(): Promise<{
    firestoreAvailable: boolean;
    firebaseConfig: boolean;
    gdprConsent: boolean;
    localStorageAvailable: boolean;
    networkOnline: boolean;
    environment: string;
    suggestedActions: string[];
  }> {
    const firestore = getFirestoreInstance();
    const suggestions: string[] = [];

    // Check Firebase config
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const hasConfig = !!(apiKey && apiKey !== 'undefined');
    
    if (!hasConfig) {
      suggestions.push('Add Firebase configuration to .env.local file');
      suggestions.push('Set VITE_FIREBASE_API_KEY environment variable');
    }

    // Check GDPR consent
    const gdprConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (!gdprConsent) {
      suggestions.push('Ensure GDPR consent is given (visit site and accept consent banner)');
    }

    // Check network
    const networkOnline = navigator.onLine;
    if (!networkOnline) {
      suggestions.push('Check your internet connection');
    }

    // Check localStorage
    let localStorageAvailable = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageAvailable = true;
    } catch {
      suggestions.push('LocalStorage is disabled. Enable cookies/localStorage in browser settings');
    }

    // Check environment
    const environment = window.location.hostname === 'localhost' ? 'development' : 
                       window.location.hostname.includes('127.0.0.1') ? 'development' : 
                       'production';

    if (environment === 'production' && !hasConfig) {
      suggestions.push('Deploy Firebase config to production environment');
    }

    return {
      firestoreAvailable: !!firestore,
      firebaseConfig: hasConfig,
      gdprConsent,
      localStorageAvailable,
      networkOnline,
      environment,
      suggestedActions: suggestions
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  clearHistory(): void {
    this.status.testHistory = [];
    console.log('🧹 Cleared test history');
  }

  async cleanupTestData(): Promise<{ deleted: number; errors: number }> {
    const firestore = getFirestoreInstance();
    if (!firestore) return { deleted: 0, errors: 0 };

    let deleted = 0;
    let errors = 0;

    try {
      // Delete test collections
      const collections = ['_test_connection', '_test_quick', '_test_batch', '_test_permissions'];
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(firestore, collectionName));
          const batch = writeBatch(firestore);
          
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          deleted += snapshot.docs.length;
          console.log(`🧹 Deleted ${snapshot.docs.length} documents from ${collectionName}`);
        } catch (error) {
          console.log(`⚠️ Could not delete ${collectionName}:`, error);
          errors++;
        }
      }

      // Clear localStorage test data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('test') || 
          key.includes('firebase_') || 
          key.includes('fb_') ||
          key.startsWith('_test_')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        deleted++;
      });

      console.log(`🧹 Cleanup complete: ${deleted} items deleted, ${errors} errors`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      errors++;
    }

    return { deleted, errors };
  }

  private createTestResult(
    success: boolean,
    writeId: string | undefined,
    readCount: number | undefined,
    error: string | undefined,
    code: string | undefined,
    startTime: number,
    details?: any
  ): TestResult {
    return {
      success,
      writeId,
      readCount,
      error,
      code,
      timestamp: new Date(),
      details: {
        ...details,
        totalTime: Date.now() - startTime
      }
    };
  }

  private provideErrorGuidance(error: any): void {
    console.group('🔍 Firestore Error Diagnosis');
    
    if (error.code === 'permission-denied') {
      console.error('🔒 PERMISSION DENIED - Firestore Rules Issue');
      console.error('📋 Go to: Firebase Console → Firestore → Rules');
      console.error('📋 Use these temporary rules for testing:');
      console.error(`
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow ALL reads and writes for development
            match /{document=**} {
              allow read, write: if true;
            }
            
            // More secure rules for production:
            // match /events/{eventId} {
            //   allow read, write: if request.auth != null;
            // }
            // match /_test/{document=**} {
            //   allow read, write: if true;
            // }
          }
        }
      `);
      console.error('🚀 Deploy rules with: firebase deploy --only firestore:rules');
    }
    
    else if (error.code === 'failed-precondition') {
      console.error('⚠️ FAILED PRECONDITION - Multiple tabs open or persistence issue');
      console.error('📋 Solution: Close other tabs or disable persistence in config.ts');
    }
    
    else if (error.code === 'unavailable') {
      console.error('🌐 NETWORK UNAVAILABLE - Check internet connection');
      console.error('📋 Solution: Ensure you are online and firewall allows Firebase');
    }
    
    else if (error.code === 'invalid-api-key') {
      console.error('🔑 INVALID API KEY - Check Firebase configuration');
      console.error('📋 Solution: Verify .env.local file has correct Firebase config');
    }
    
    else {
      console.error('❌ UNKNOWN ERROR - Check browser console for details');
      console.error('📋 Error code:', error.code);
      console.error('📋 Error message:', error.message);
    }
    
    console.groupEnd();
  }

  // Generate test data for development
  async generateTestEvents(count: number = 10): Promise<{ success: boolean; created: number }> {
    const firestore = getFirestoreInstance();
    if (!firestore) return { success: false, created: 0 };

    try {
      const events = [
        'page_view',
        'resume_generated',
        'resume_downloaded',
        'job_viewed',
        'job_applied',
        'blog_viewed',
        'button_click',
        'cta_click',
        'signup_initiated',
        'funnel_step'
      ];

      const categories = [
        'Page Views',
        'Resume Builder',
        'Job Portal',
        'Blog',
        'User Interaction',
        'Conversion',
        'Errors'
      ];

      const pages = [
        '/',
        '/builder',
        '/edit',
        '/job-applications',
        '/blog',
        '/about',
        '/contact'
      ];

      let created = 0;
      const batch = writeBatch(firestore);

      for (let i = 0; i < count; i++) {
        const eventName = events[Math.floor(Math.random() * events.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const pagePath = pages[Math.floor(Math.random() * pages.length)];
        
        const docRef = doc(collection(firestore, 'events'));
        batch.set(docRef, {
          eventName,
          eventCategory: category,
          eventLabel: `test_event_${i}`,
          pagePath,
          pageTitle: `Test Page ${i}`,
          userId: `test_user_${Math.floor(Math.random() * 5)}`,
          sessionId: `test_session_${Math.floor(Math.random() * 3)}`,
          timestamp: Timestamp.now(),
          userAgent: 'Mozilla/5.0 (Test) Chrome/120.0.0.0',
          screenResolution: '1920x1080',
          language: 'en-US',
          consentGiven: true,
          dataProcessingLocation: 'IN',
          isTestData: true,
          testIndex: i
        });

        created++;
        
        // Commit in batches of 50 to avoid overload
        if (created % 50 === 0) {
          await batch.commit();
          console.log(`✅ Generated ${created} test events...`);
        }
      }

      // Commit any remaining documents
      if (created % 50 !== 0) {
        await batch.commit();
      }

      console.log(`✅ Successfully generated ${created} test events`);
      return { success: true, created };
    } catch (error) {
      console.error('Failed to generate test events:', error);
      return { success: false, created: 0 };
    }
  }
}

export const firebaseTestConnection = FirebaseTestConnection.getInstance();

// Helper function for quick testing
export const testFirestoreConnection = async (): Promise<TestResult> => {
  return await firebaseTestConnection.runCompleteTest();
};

// Export individual functions for convenience
export const runQuickTest = () => firebaseTestConnection.runQuickTest();
export const getConnectionStatus = () => firebaseTestConnection.getStatus();
export const diagnoseConnection = () => firebaseTestConnection.diagnoseConnection();
export const cleanupTestData = () => firebaseTestConnection.cleanupTestData();
export const generateTestEvents = (count: number) => firebaseTestConnection.generateTestEvents(count);
export const testPermissions = () => firebaseTestConnection.testPermissions();