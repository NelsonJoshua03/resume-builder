// src/firebase/analytics.ts - UPDATED VERSION WITH isAnonymous FIELD
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { getFirestoreInstance, getAnalyticsInstance, logAnalyticsEvent } from './config';
import type { 
  UserEvent, 
  PageViewEvent, 
  ResumeEvent, 
  JobApplicationEvent, 
  BlogEngagementEvent,
  FunnelStep
} from './types';
import { COLLECTIONS } from './types';

export interface TrackEventInput {
  eventName: string;
  eventCategory: string;
  eventLabel: string;
  eventValue?: number;
  pagePath: string;
  pageTitle: string;
  metadata?: Record<string, any>;
  consentGiven: boolean;
  dataProcessingLocation: 'IN';
}

export class FirebaseAnalyticsService {
  private sessionId: string;
  private userId: string;
  private firestore = getFirestoreInstance();
  private analytics = getAnalyticsInstance();
  private isAnonymous: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    this.isAnonymous = !this.hasConsent();
    this.initializeUser();
  }

  private hasConsent(): boolean {
    return localStorage.getItem('gdpr_consent') === 'accepted';
  }

  private generateSessionId(): string {
    let sessionId = sessionStorage.getItem('firebase_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('firebase_session_id', sessionId);
      
      // Also store in localStorage for persistence across tabs
      localStorage.setItem('firebase_session_id', sessionId);
    }
    return sessionId;
  }

  private getOrCreateUserId(): string {
    const hasConsent = this.hasConsent();
    
    if (hasConsent) {
      // For consented users, use persistent user ID
      let userId = localStorage.getItem('firebase_user_id');
      
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('firebase_user_id', userId);
        localStorage.setItem('user_created_at', new Date().toISOString());
      }
      
      return userId;
    } else {
      // For anonymous users, use session-based ID
      let anonymousId = sessionStorage.getItem('firebase_anonymous_id');
      
      if (!anonymousId) {
        anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('firebase_anonymous_id', anonymousId);
        
        // Store in localStorage as fallback
        localStorage.setItem('firebase_anonymous_id_backup', anonymousId);
        
        // Track anonymous user creation
        console.log('📊 Anonymous user created:', anonymousId);
      }
      
      return anonymousId;
    }
  }

  private initializeUser(): void {
    const hasConsent = this.hasConsent();
    
    if (this.analytics && hasConsent) {
      setUserId(this.analytics, this.userId);
      setUserProperties(this.analytics, {
        session_id: this.sessionId,
        device_type: this.getDeviceType(),
        is_anonymous: !hasConsent
      });
    }

    // Track user type
    const userType = hasConsent ? 'consented' : 'anonymous';
    console.log(`📊 User initialized: ${userType}, ID: ${this.userId.substring(0, 10)}...`);

    // Store user info for debugging
    sessionStorage.setItem('user_type', userType);
    localStorage.setItem('has_visited_before', 'true');
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  async trackEvent(eventData: TrackEventInput): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // Always track events to Firestore (both anonymous and consented)
    // We use the user's current consent status
    const isCurrentlyAnonymous = !hasConsent;
    
    // ✅ FIXED: Added isAnonymous field to match UserEvent interface
    const event: UserEvent = {
      ...eventData,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      // ✅ CRITICAL FIX: Add isAnonymous field (was missing!)
      isAnonymous: isCurrentlyAnonymous,
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN',
      metadata: {
        ...eventData.metadata,
        is_anonymous: isCurrentlyAnonymous,
        user_type: hasConsent ? 'consented' : 'anonymous'
      }
    };

    try {
      // Store in Firestore - ALWAYS for both anonymous and consented users
      if (this.firestore) {
        await addDoc(collection(this.firestore, COLLECTIONS.EVENTS), {
          ...event,
          timestamp: serverTimestamp()
        });
        
        console.log(`📊 Event tracked: ${event.eventName} (${hasConsent ? 'consented' : 'anonymous'})`);
      }

      // Send to Firebase Analytics - ONLY with consent
      if (hasConsent) {
        logAnalyticsEvent(eventData.eventName, {
          event_category: eventData.eventCategory,
          event_label: eventData.eventLabel,
          value: eventData.eventValue,
          page_path: eventData.pagePath,
          page_title: eventData.pageTitle,
          ...eventData.metadata
        });
      }

      // Send to Google Analytics (dual tracking) - ONLY with consent
      if (hasConsent && typeof window.gtag !== 'undefined') {
        window.gtag('event', eventData.eventName, {
          event_category: eventData.eventCategory,
          event_label: eventData.eventLabel,
          value: eventData.eventValue,
          send_to: ['G-SW5M9YN8L5', 'G-WSKZJDJW77'],
          ...eventData.metadata
        });
      }

      // If anonymous, also store in a special queue for possible migration later
      if (!hasConsent) {
        this.storeAnonymousEventInQueue(event);
      }

    } catch (error) {
      console.error('Error tracking event:', error);
      this.fallbackToLocalStorage(event);
    }
  }

  async trackPageView(pagePath: string, pageTitle: string): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // ✅ FIXED: Added isAnonymous field to match PageViewEvent interface
    const pageView: PageViewEvent = {
      userId: this.userId,
      sessionId: this.sessionId,
      pagePath,
      pageTitle,
      referrer: document.referrer || 'direct',
      timestamp: new Date(),
      duration: 0,
      scrollDepth: 0,
      deviceType: this.getDeviceType() as 'mobile' | 'tablet' | 'desktop',
      // ✅ CRITICAL FIX: Add isAnonymous field (was missing!)
      isAnonymous: !hasConsent
    };

    try {
      // Always store page views in Firestore
      if (this.firestore) {
        await addDoc(collection(this.firestore, COLLECTIONS.PAGE_VIEWS), {
          ...pageView,
          timestamp: serverTimestamp()
          // Note: isAnonymous is already in pageView object above
        });
        
        console.log(`📊 Page view tracked: ${pagePath} (${hasConsent ? 'consented' : 'anonymous'})`);
      }

      // Firebase Analytics - only with consent
      if (hasConsent) {
        logAnalyticsEvent('page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: pagePath,
          is_anonymous: false
        });
      }

      // Google Analytics - only with consent
      if (hasConsent && typeof window.gtag !== 'undefined') {
        window.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: ['G-SW5M9YN8L5', 'G-WSKZJDJW77'],
          is_anonymous: false
        });
      }

      // Store in session storage for tracking
      sessionStorage.setItem('last_page_view', JSON.stringify(pageView));
      
      // For anonymous users, track basic page view
      if (!hasConsent) {
        this.trackAnonymousPageView(pagePath, pageTitle);
      }

    } catch (error) {
      console.error('Error tracking page view:', error);
      this.fallbackToLocalStorage(pageView);
    }
  }

  private trackAnonymousPageView(pagePath: string, pageTitle: string): void {
    // Store anonymous page views for analytics
    const today = new Date().toISOString().split('T')[0];
    const key = `anon_pageviews_${today}`;
    
    try {
      const pageviews = JSON.parse(localStorage.getItem(key) || '[]');
      pageviews.push({
        pagePath,
        pageTitle,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        isAnonymous: true
      });
      
      localStorage.setItem(key, JSON.stringify(pageviews.slice(-100))); // Keep last 100
    } catch (error) {
      console.warn('Failed to store anonymous page view:', error);
    }
  }

  private storeAnonymousEventInQueue(event: UserEvent): void {
    try {
      const queueKey = 'anonymous_events_queue';
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      
      queue.push({
        ...event,
        storedAt: new Date().toISOString()
      });
      
      // Keep only last 50 events to avoid storage overflow
      localStorage.setItem(queueKey, JSON.stringify(queue.slice(-50)));
      
      // Also store a summary
      this.updateAnonymousEventSummary(event.eventName, event.eventCategory);
      
    } catch (error) {
      console.warn('Failed to store anonymous event in queue:', error);
    }
  }

  private updateAnonymousEventSummary(eventName: string, eventCategory: string): void {
    const today = new Date().toISOString().split('T')[0];
    const summaryKey = `anon_summary_${today}`;
    
    try {
      const summary = JSON.parse(localStorage.getItem(summaryKey) || '{}');
      
      if (!summary[eventCategory]) {
        summary[eventCategory] = {};
      }
      
      if (!summary[eventCategory][eventName]) {
        summary[eventCategory][eventName] = 0;
      }
      
      summary[eventCategory][eventName] += 1;
      summary.total = (summary.total || 0) + 1;
      summary.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(summaryKey, JSON.stringify(summary));
    } catch (error) {
      console.warn('Failed to update anonymous event summary:', error);
    }
  }

  async migrateToConsentedUser(): Promise<void> {
    console.log('🔄 Migrating anonymous user to consented...');
    
    try {
      // Get anonymous ID
      const anonymousId = this.userId;
      
      // Generate new user ID for consented user
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update stored user ID
      localStorage.setItem('firebase_user_id', newUserId);
      localStorage.setItem('user_created_at', new Date().toISOString());
      
      // Update session storage
      sessionStorage.setItem('previous_anonymous_id', anonymousId);
      sessionStorage.setItem('migrated_at', new Date().toISOString());
      
      // Process queued anonymous events
      const queueKey = 'anonymous_events_queue';
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      
      if (queue.length > 0 && this.firestore) {
        console.log(`🔄 Processing ${queue.length} queued anonymous events...`);
        
        for (const event of queue) {
          try {
            // Add events with migrated user ID
            await addDoc(collection(this.firestore, COLLECTIONS.EVENTS), {
              ...event,
              userId: newUserId,
              originalAnonymousId: anonymousId,
              migrated: true,
              migratedAt: new Date().toISOString(),
              timestamp: serverTimestamp()
            });
          } catch (error) {
            console.warn('Failed to migrate event:', error);
          }
        }
        
        // Clear the queue
        localStorage.removeItem(queueKey);
        
        // Process summaries
        this.processAnonymousSummaries(newUserId, anonymousId);
      }
      
      // Update user ID for future events
      this.userId = newUserId;
      this.isAnonymous = false;
      
      console.log('✅ User migrated successfully');
      
    } catch (error) {
      console.error('Failed to migrate user:', error);
    }
  }

  private async processAnonymousSummaries(newUserId: string, anonymousId: string): Promise<void> {
    try {
      // Get all summary keys
      const summaryKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('anon_summary_')) {
          summaryKeys.push(key);
        }
      }
      
      // Process each summary
      for (const key of summaryKeys) {
        const summary = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Store summary in Firestore
        if (this.firestore && summary.total > 0) {
          await addDoc(collection(this.firestore, 'anonymous_summaries'), {
            date: key.replace('anon_summary_', ''),
            originalAnonymousId: anonymousId,
            newUserId: newUserId,
            summary: summary,
            migratedAt: new Date().toISOString(),
            timestamp: serverTimestamp()
          });
        }
        
        // Remove from localStorage
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to process anonymous summaries:', error);
    }
  }

  async trackResumeEvent(eventData: Omit<ResumeEvent, 'userId' | 'timestamp' | 'isAnonymous'>): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // ✅ FIXED: Added isAnonymous field
    const event: ResumeEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date(),
      isAnonymous: !hasConsent
    };

    await this.trackEvent({
      eventName: `resume_${eventData.action}`,
      eventCategory: 'Resume Builder',
      eventLabel: eventData.templateType,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      metadata: {
        templateType: eventData.templateType,
        format: eventData.format,
        fieldsCount: eventData.fieldsCount,
        resumeId: eventData.resumeId,
        is_anonymous: !hasConsent
      },
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN'
    });

    if (this.firestore) {
      try {
        await addDoc(collection(this.firestore, COLLECTIONS.RESUME_EVENTS), {
          ...event,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error tracking resume event:', error);
      }
    }
  }

  async trackJobEvent(eventData: Omit<JobApplicationEvent, 'userId' | 'timestamp' | 'isAnonymous'>): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // ✅ FIXED: Added isAnonymous field
    const event: JobApplicationEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date(),
      isAnonymous: !hasConsent
    };

    await this.trackEvent({
      eventName: `job_${eventData.action}`,
      eventCategory: 'Job Applications',
      eventLabel: eventData.jobTitle,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      metadata: {
        jobId: eventData.jobId,
        company: eventData.company,
        method: eventData.applicationMethod,
        status: eventData.status,
        is_anonymous: !hasConsent
      },
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN'
    });

    if (this.firestore) {
      try {
        await addDoc(collection(this.firestore, COLLECTIONS.JOB_EVENTS), {
          ...event,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error tracking job event:', error);
      }
    }
  }

  async trackBlogEvent(eventData: Omit<BlogEngagementEvent, 'userId' | 'timestamp' | 'isAnonymous'>): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // ✅ FIXED: Added isAnonymous field
    const event: BlogEngagementEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date(),
      isAnonymous: !hasConsent
    };

    await this.trackEvent({
      eventName: `blog_${eventData.action}`,
      eventCategory: 'Blog',
      eventLabel: eventData.postTitle,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      metadata: {
        postSlug: eventData.postSlug,
        category: eventData.category,
        readDuration: eventData.readDuration,
        searchTerm: eventData.searchTerm,
        is_anonymous: !hasConsent
      },
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN'
    });

    if (this.firestore) {
      try {
        await addDoc(collection(this.firestore, COLLECTIONS.BLOG_EVENTS), {
          ...event,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error tracking blog event:', error);
      }
    }
  }

  async trackFunnelStep(funnelName: string, stepName: string, stepNumber: number, metadata?: any): Promise<void> {
    const hasConsent = this.hasConsent();
    
    // ✅ FIXED: Added isAnonymous field
    const funnelStep: FunnelStep = {
      funnelName,
      stepName,
      stepNumber,
      userId: this.userId,
      timestamp: new Date(),
      timeToStep: this.calculateTimeToStep(funnelName),
      metadata,
      isAnonymous: !hasConsent
    };

    try {
      // Always track funnel steps
      if (this.firestore) {
        await addDoc(collection(this.firestore, COLLECTIONS.FUNNELS), {
          ...funnelStep,
          timestamp: serverTimestamp()
        });
      }

      await this.trackEvent({
        eventName: 'funnel_step',
        eventCategory: 'User Funnel',
        eventLabel: `${funnelName}_${stepName}`,
        pagePath: window.location.pathname,
        pageTitle: document.title,
        metadata: {
          stepNumber,
          timeToStep: funnelStep.timeToStep,
          is_anonymous: !hasConsent,
          ...metadata
        },
        consentGiven: hasConsent,
        dataProcessingLocation: 'IN'
      });
    } catch (error) {
      console.error('Error tracking funnel step:', error);
    }
  }

  private calculateTimeToStep(funnelName: string): number {
    const startKey = `funnel_start_${funnelName}`;
    const startTime = localStorage.getItem(startKey);
    
    if (startTime) {
      const start = parseInt(startTime);
      const now = Date.now();
      return Math.round((now - start) / 1000);
    }
    
    localStorage.setItem(startKey, Date.now().toString());
    return 0;
  }

  private fallbackToLocalStorage(data: any): void {
    try {
      const key = `fb_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fallbackData = {
        ...data,
        timestamp: new Date().toISOString(),
        isFallback: true,
        is_anonymous: this.isAnonymous
      };
      
      localStorage.setItem(key, JSON.stringify(fallbackData));
      
      const queue = JSON.parse(localStorage.getItem('fb_retry_queue') || '[]');
      queue.push(fallbackData);
      localStorage.setItem('fb_retry_queue', JSON.stringify(queue.slice(-50)));
    } catch (error) {
      console.error('Fallback storage failed:', error);
    }
  }

  subscribeToAnalytics(callback: (data: any[]) => void) {
    if (!this.firestore) return () => {};

    const q = query(
      collection(this.firestore, COLLECTIONS.EVENTS),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot: any) => {
      const events = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    });
  }

  async getDailySummary(date: string): Promise<any[]> {
    if (!this.firestore) return [];

    try {
      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59');
      
      const eventsQuery = query(
        collection(this.firestore, COLLECTIONS.EVENTS),
        where('timestamp', '>=', startOfDay),
        where('timestamp', '<=', endOfDay)
      );

      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting daily summary:', error);
      return [];
    }
  }

  getUserId(): string {
    return this.userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isUserAnonymous(): boolean {
    return this.isAnonymous;
  }

  getUserType(): string {
    return this.isAnonymous ? 'anonymous' : 'consented';
  }

  // Method to get anonymous user stats
  getAnonymousStats(): {
    totalEvents: number;
    totalPageViews: number;
    sessionDuration: number;
    userId: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    const summaryKey = `anon_summary_${today}`;
    
    try {
      const summary = JSON.parse(localStorage.getItem(summaryKey) || '{}');
      
      return {
        totalEvents: summary.total || 0,
        totalPageViews: summary.Page ? summary.Page.page_view || 0 : 0,
        sessionDuration: 0, // Can be calculated from timestamps
        userId: this.userId
      };
    } catch (error) {
      return {
        totalEvents: 0,
        totalPageViews: 0,
        sessionDuration: 0,
        userId: this.userId
      };
    }
  }
}

export const firebaseAnalytics = new FirebaseAnalyticsService();