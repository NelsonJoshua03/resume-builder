// src/firebase/analytics.ts - PRODUCTION VERSION
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

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    this.initializeUser();
  }

  private generateSessionId(): string {
    let sessionId = localStorage.getItem('firebase_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('firebase_session_id', sessionId);
    }
    return sessionId;
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('firebase_user_id');
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('firebase_user_id', userId);
      localStorage.setItem('user_created_at', new Date().toISOString());
    }

    return userId;
  }

  private initializeUser(): void {
    if (this.analytics) {
      setUserId(this.analytics, this.userId);
      setUserProperties(this.analytics, {
        session_id: this.sessionId,
        device_type: this.getDeviceType()
      });
    }

    localStorage.setItem('has_visited_before', 'true');
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  async trackEvent(eventData: TrackEventInput): Promise<void> {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (!hasConsent && !eventData.eventName.includes('consent')) {
      return;
    }

    const event: UserEvent = {
      ...eventData,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      consentGiven: hasConsent,
      dataProcessingLocation: 'IN'
    };

    try {
      // Store in Firestore
      if (this.firestore) {
        await addDoc(collection(this.firestore, COLLECTIONS.EVENTS), {
          ...event,
          timestamp: serverTimestamp()
        });
      }

      // Send to Firebase Analytics
      logAnalyticsEvent(eventData.eventName, {
        event_category: eventData.eventCategory,
        event_label: eventData.eventLabel,
        value: eventData.eventValue,
        page_path: eventData.pagePath,
        page_title: eventData.pageTitle,
        ...eventData.metadata
      });

      // Send to Google Analytics (dual tracking)
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', eventData.eventName, {
          event_category: eventData.eventCategory,
          event_label: eventData.eventLabel,
          value: eventData.eventValue,
          send_to: ['G-SW5M9YN8L5', 'G-WSKZJDJW77']
        });
      }

    } catch (error) {
      this.fallbackToLocalStorage(event);
    }
  }

  async trackPageView(pagePath: string, pageTitle: string): Promise<void> {
    const hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    if (!hasConsent) return;

    const pageView: PageViewEvent = {
      userId: this.userId,
      sessionId: this.sessionId,
      pagePath,
      pageTitle,
      referrer: document.referrer || 'direct',
      timestamp: new Date(),
      duration: 0,
      scrollDepth: 0,
      deviceType: this.getDeviceType() as 'mobile' | 'tablet' | 'desktop'
    };

    try {
      if (this.firestore) {
        await addDoc(collection(this.firestore, COLLECTIONS.PAGE_VIEWS), {
          ...pageView,
          timestamp: serverTimestamp()
        });
      }

      // Firebase Analytics
      logAnalyticsEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath
      });

      // Google Analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: ['G-SW5M9YN8L5', 'G-WSKZJDJW77']
        });
      }

      sessionStorage.setItem('last_page_view', JSON.stringify(pageView));
    } catch (error) {
      this.fallbackToLocalStorage(pageView);
    }
  }

  async trackResumeEvent(eventData: Omit<ResumeEvent, 'userId' | 'timestamp'>): Promise<void> {
    const event: ResumeEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date()
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
        resumeId: eventData.resumeId
      },
      consentGiven: localStorage.getItem('gdpr_consent') === 'accepted',
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

  async trackJobEvent(eventData: Omit<JobApplicationEvent, 'userId' | 'timestamp'>): Promise<void> {
    const event: JobApplicationEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date()
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
        status: eventData.status
      },
      consentGiven: localStorage.getItem('gdpr_consent') === 'accepted',
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

  async trackBlogEvent(eventData: Omit<BlogEngagementEvent, 'userId' | 'timestamp'>): Promise<void> {
    const event: BlogEngagementEvent = {
      ...eventData,
      userId: this.userId,
      timestamp: new Date()
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
        searchTerm: eventData.searchTerm
      },
      consentGiven: localStorage.getItem('gdpr_consent') === 'accepted',
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
    const funnelStep: FunnelStep = {
      funnelName,
      stepName,
      stepNumber,
      userId: this.userId,
      timestamp: new Date(),
      timeToStep: this.calculateTimeToStep(funnelName),
      metadata
    };

    try {
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
          ...metadata
        },
        consentGiven: localStorage.getItem('gdpr_consent') === 'accepted',
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
        isFallback: true
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
}

export const firebaseAnalytics = new FirebaseAnalyticsService();