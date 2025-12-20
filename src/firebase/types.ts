// src/firebase/types.ts - UPDATED VERSION
export interface UserEvent {
  id?: string;
  userId: string;
  sessionId: string;
  eventName: string;
  eventCategory: string;
  eventLabel: string;
  eventValue?: number;
  pagePath: string;
  pageTitle: string;
  timestamp: Date;
  userAgent: string;
  screenResolution: string;
  language: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  // GDPR compliance fields
  consentGiven: boolean;
  dataProcessingLocation: 'IN'; // India
  isAnonymous?: boolean; // ADD THIS
}

export interface PageViewEvent {
  id?: string;
  userId: string;
  sessionId: string;
  pagePath: string;
  pageTitle: string;
  referrer: string;
  timestamp: Date;
  duration: number; // in seconds
  scrollDepth: number; // 0-100 percentage
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isAnonymous?: boolean; // ADD THIS
}

export interface ResumeEvent {
  id?: string;
  userId: string;
  templateType: string;
  format: 'pdf' | 'doc' | 'txt';
  action: 'generate' | 'download' | 'edit' | 'save' | 'preview';
  timestamp: Date;
  fieldsCount: {
    personalInfo: number;
    experience: number;
    education: number;
    skills: number;
    projects: number;
  };
  resumeId?: string;
  metadata?: Record<string, any>;
  isAnonymous?: boolean; // ADD THIS
}

export interface JobApplicationEvent {
  id?: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  action: 'view' | 'apply' | 'save' | 'share';
  timestamp: Date;
  applicationMethod: 'direct' | 'email' | 'linkedin' | 'company_portal';
  status?: 'applied' | 'pending' | 'rejected' | 'accepted' | 'viewed' | 'saved';
  metadata?: Record<string, any>;
  isAnonymous?: boolean; // ADD THIS
}

export interface BlogEngagementEvent {
  id?: string;
  userId: string;
  postSlug: string;
  postTitle: string;
  category: string;
  action: 'view' | 'read' | 'share' | 'comment' | 'like';
  timestamp: Date;
  readDuration?: number; // in seconds
  scrollPercentage?: number;
  searchTerm?: string;
  isAnonymous?: boolean; // ADD THIS
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  photoURL?: string;
  createdAt: Date;
  lastActive: Date;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    language: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    isAnonymous?: boolean; // ADD THIS
  };
  // GDPR compliance
  consentGiven: boolean;
  consentTimestamp: Date;
  dataProcessingPreferences: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    
  };
  // Anonymous tracking ID for non-authenticated users
  anonymousId?: string;
}

export interface DailyAnalytics {
  date: string; // YYYY-MM-DD
  pageViews: number;
  uniqueVisitors: number;
  resumeGenerations: number;
  resumeDownloads: number;
  jobApplications: number;
  jobViews: number;
  blogViews: number;
  conversions: number;
  bounceRate: number;
  avgSessionDuration: number;
  isAnonymous?: boolean; // ADD THIS
  topPages: Array<{
    pagePath: string;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
}

export interface FunnelStep {
  funnelName: string;
  stepName: string;
  stepNumber: number;
  userId: string;
  timestamp: Date;
  timeToStep: number; // seconds from funnel start
  metadata?: Record<string, any>;
  isAnonymous?: boolean; // ADD THIS
}

// Collection names
export const COLLECTIONS = {
  EVENTS: 'events',
  PAGE_VIEWS: 'pageViews',
  RESUME_EVENTS: 'resumeEvents',
  JOB_EVENTS: 'jobEvents',
  BLOG_EVENTS: 'blogEvents',
  USER_PROFILES: 'userProfiles',
  DAILY_ANALYTICS: 'dailyAnalytics',
  FUNNELS: 'funnels',
  USER_SESSIONS: 'userSessions',
  ERROR_LOGS: 'errorLogs'
} as const;