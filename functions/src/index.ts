// functions/src/index.ts - COMPLETE UPDATED VERSION WITH DATA VALIDATION FIXES
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors = require('cors');

// Initialize Firebase Admin
try {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('ℹ️ Firebase admin already initialized');
}

// 🔐 ADMIN CREDENTIALS - from Firebase Functions Config
let ADMIN_PASSWORD = '';
let ADMIN_EMAILS: string[] = [];

try {
  const adminConfig = functions.config().admin || {};
  console.log('🔧 Config loaded:', {
    configExists: !!functions.config().admin,
    passwordExists: !!adminConfig.password,
    emailsExists: !!adminConfig.emails
  });
  
  ADMIN_PASSWORD = adminConfig.password || '';
  ADMIN_EMAILS = (adminConfig.emails || '')
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0);
    
  console.log('🔧 Config values:', {
    passwordLength: ADMIN_PASSWORD.length,
    emails: ADMIN_EMAILS,
    emailsCount: ADMIN_EMAILS.length
  });
  
} catch (configError: any) {
  console.error('❌ Error loading config:', configError);
  
  // Fallback to environment variables or hardcoded values
  const fallbackEmailList = process.env.ADMIN_EMAILS || '';
  
  ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
  ADMIN_EMAILS = fallbackEmailList
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0);
    
  if (!ADMIN_PASSWORD || ADMIN_EMAILS.length === 0) {
    console.error('❌ CRITICAL: Admin credentials not configured!');
    console.error('   Run: firebase functions:config:set admin.emails="email1,email2" admin.password="yourpassword"');
    console.error('   Or set ADMIN_EMAILS and ADMIN_PASSWORD environment variables');
  }
    
  console.log('⚠️ Using environment variables for config:', {
    emailsCount: ADMIN_EMAILS.length,
    hasPassword: !!ADMIN_PASSWORD
  });
}

// Configure CORS properly
const corsMiddleware = cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false,
  maxAge: 86400 // 24 hours
});

// Helper function to wrap with CORS
const runWithCors = (handler: any) => 
  functions.https.onRequest((req: any, res: any) => {
    corsMiddleware(req, res, async () => {
      try {
        await handler(req, res);
      } catch (error: unknown) {
        console.error('Handler error:', error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Internal server error' 
        });
      }
    });
  });

// ================ POSTGRESQL SYNC FUNCTIONS ================

import { Pool, PoolConfig } from 'pg';

// PostgreSQL connection pool configuration
interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Get PostgreSQL configuration from Firebase Functions Config
const getPostgresConfig = (): PostgresConfig => {
  const config = functions.config().postgres || {};
  
  return {
    host: config.host || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(config.port || process.env.POSTGRES_PORT || '5432'),
    database: config.database || process.env.POSTGRES_DATABASE || 'careercraft_analytics',
    user: config.user || process.env.POSTGRES_USER || 'analytics_user',
    password: config.password || process.env.POSTGRES_PASSWORD || '',
    ssl: config.ssl === 'true' || process.env.POSTGRES_SSL === 'true',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

// Initialize PostgreSQL connection pool
let pgPool: Pool | null = null;

const initializePostgresPool = (): Pool => {
  if (!pgPool) {
    const config = getPostgresConfig();
    console.log('🔌 Initializing PostgreSQL connection pool...');
    
    // Log config for debugging
    console.log('🔧 PostgreSQL Config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password ? '***' + config.password.slice(-3) : 'NOT SET',
      ssl: config.ssl
    });
    
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    };

    // ✅ FIXED: Correct SSL configuration
    if (config.ssl) {
      poolConfig.ssl = {
        rejectUnauthorized: false
        // Removed invalid 'require' property
      };
      console.log('🔒 SSL enabled for PostgreSQL');
    }

    pgPool = new Pool(poolConfig);

    // Test connection
    pgPool.query('SELECT NOW()')
      .then(() => console.log('✅ PostgreSQL connection established'))
      .catch((err) => console.error('❌ PostgreSQL connection failed:', err.message));
  }
  return pgPool;
};

// Helper function to convert Firestore timestamp to PostgreSQL timestamp
const firestoreTimestampToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return null;
};

// Helper function to safely convert any value to JSON
const safeToJson = (data: any): any => {
  try {
    if (typeof data === 'object' && data !== null) {
      return JSON.parse(JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.warn('Failed to convert data to JSON:', error);
    return {};
  }
};

// Helper to detect device type from user agent
const getDeviceTypeFromUserAgent = (userAgent: string): string => {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
};

// Helper to extract screen resolution from metadata or use default
const getScreenResolution = (data: any): string => {
  if (data.screenResolution) return data.screenResolution;
  if (data.metadata?.screen_resolution) return data.metadata.screen_resolution;
  if (data.metadata?.screen_width && data.metadata?.screen_height) {
    return `${data.metadata.screen_width}x${data.metadata.screen_height}`;
  }
  return 'unknown';
};

// ✅ NEW: Helper function to parse date strings with validation
const parseDateString = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  try {
    // Remove "to" ranges and get first date
    if (dateStr.includes(' to ')) {
      dateStr = dateStr.split(' to ')[0].trim();
    }
    
    // Handle special cases
    if (dateStr.includes('Ongoing') || dateStr.includes('ongoing')) {
      return new Date().toISOString().split('T')[0]; // Current date
    }
    
    if (dateStr.includes('Not specified') || dateStr.includes('Not Specified')) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Handle month day, year format (e.g., "January 31, 2026")
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const lowerDate = dateStr.toLowerCase();
    for (let i = 0; i < monthNames.length; i++) {
      if (lowerDate.includes(monthNames[i])) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If all else fails, return current date
    console.warn(`Could not parse date: "${dateStr}", using current date`);
    return new Date().toISOString().split('T')[0];
    
  } catch (error) {
    console.warn(`Failed to parse date: "${dateStr}"`, error);
    return new Date().toISOString().split('T')[0];
  }
};

// ✅ NEW: Helper function to parse time strings with validation
const parseTimeString = (timeStr: string): string | null => {
  if (!timeStr) return '09:00';
  
  try {
    // Handle special cases
    if (timeStr.includes('Not specified') || timeStr.includes('Not Specified')) {
      return '09:00';
    }
    
    // Remove timezone indicators
    timeStr = timeStr
      .replace(' IST', '')
      .replace(' ist', '')
      .replace(' AM', '')
      .replace(' PM', '')
      .replace(' am', '')
      .replace(' pm', '')
      .trim();
    
    // Extract time from range
    let timePart = timeStr;
    if (timeStr.includes('-')) {
      timePart = timeStr.split('-')[0].trim();
    } else if (timeStr.includes('to')) {
      timePart = timeStr.split('to')[0].trim();
    }
    
    // Extract hours and minutes
    const timeMatch = timePart.match(/(\d{1,2})(?::(\d{2}))?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? timeMatch[2] : '00';
      
      // Convert to 24-hour format if PM indicator was present (original string)
      const originalLower = timeStr.toLowerCase();
      if ((originalLower.includes('pm') || originalLower.includes('p.m')) && hours < 12) {
        hours += 12;
      }
      if ((originalLower.includes('am') || originalLower.includes('a.m')) && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    console.warn(`Could not parse time: "${timeStr}", using 09:00`);
    return '09:00';
    
  } catch (error) {
    console.warn(`Failed to parse time: "${timeStr}"`, error);
    return '09:00';
  }
};

// Log sync operation
const logSyncOperation = async (
  pool: Pool,
  collectionName: string,
  operation: string,
  recordsProcessed: number,
  recordsSuccessful: number,
  recordsFailed: number,
  status: string,
  errorMessage?: string
) => {
  try {
    await pool.query(
      `INSERT INTO sync_logs 
       (collection_name, operation, records_processed, records_successful, records_failed, status, error_message, start_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [collectionName, operation, recordsProcessed, recordsSuccessful, recordsFailed, status, errorMessage]
    );
  } catch (error) {
    console.error('Failed to log sync operation:', error);
  }
};

// ================ REAL-TIME SYNC TRIGGERS ================

/**
 * SYNC PAGE VIEWS - Real-time sync for page views
 */
export const syncPageViews = functions.firestore
  .document('pageViews/{docId}')
  .onCreate(async (snap, context) => {
    console.log('🔄 syncPageViews trigger called');
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for page view: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing page view: ${docId}`, { data: JSON.stringify(data) });
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      // ✅ FIXED: Match frontend field names with proper defaults
      await pool.query(
        `INSERT INTO page_views 
         (user_id, session_id, page_path, page_title, referrer, timestamp, 
          duration_seconds, scroll_depth, device_type, screen_resolution,
          user_agent, language, is_anonymous, consent_given, 
          data_processing_location, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           page_title = EXCLUDED.page_title,
           duration_seconds = EXCLUDED.duration_seconds,
           scroll_depth = EXCLUDED.scroll_depth,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.pagePath || '',
          data.pageTitle || '',
          data.referrer || '',
          timestamp || new Date(),
          data.duration || 0, // ✅ duration → duration_seconds
          data.scrollDepth || 0,
          data.deviceType || getDeviceTypeFromUserAgent(data.userAgent), // ✅ deviceType → device_type
          getScreenResolution(data),
          data.userAgent || '',
          data.language || 'en',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          data.consentGiven !== undefined ? data.consentGiven : false,
          data.dataProcessingLocation || 'IN',
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      // Update or create user
      await pool.query(
        `INSERT INTO users (user_id, is_anonymous, last_active, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           last_active = EXCLUDED.last_active,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          timestamp || new Date(),
          safeToJson({ 
            last_page: data.pagePath,
            device_type: data.deviceType || getDeviceTypeFromUserAgent(data.userAgent),
            screen_resolution: getScreenResolution(data),
            user_agent: data.userAgent,
            language: data.language || 'en'
          })
        ]
      );
      
      await logSyncOperation(pool, 'pageViews', 'create', 1, 1, 0, 'success');
      console.log(`✅ Page view synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync page view ${docId}:`, error.message);
      console.error('Error details:', error);
      await logSyncOperation(pool, 'pageViews', 'create', 1, 0, 1, 'failed', error.message);
    }
  });



/**
 * SYNC GOVERNMENT EXAMS - Real-time sync for government exams (CREATE/UPDATE/DELETE)
 */
export const syncGovernmentExams = functions.firestore
  .document('governmentExams/{docId}')
  .onWrite(async (change, context) => {
    const pool = initializePostgresPool();
    const docId = context.params.docId;
    
    if (!change.after.exists) {
      // Document was deleted
      try {
        await pool.query(
          'DELETE FROM government_exams WHERE firestore_doc_id = $1',
          [docId]
        );
        console.log(`✅ Government exam deleted from PostgreSQL: ${docId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete government exam ${docId}:`, error.message);
      }
      return;
    }
    
    const data = change.after.data();
    
    if (!data) {
      console.error(`❌ No data found for government exam: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing government exam: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.createdAt);
      const updatedAt = firestoreTimestampToDate(data.updatedAt);
      const expiresAt = firestoreTimestampToDate(data.expiresAt);
      
      // Parse dates from string format
      const applicationStartDate = parseDateString(data.applicationStartDate);
      const applicationEndDate = parseDateString(data.applicationEndDate);
      const examDate = parseDateString(data.examDate);
      const admitCardDate = data.admitCardDate ? parseDateString(data.admitCardDate) : null;
      const resultDate = data.resultDate ? parseDateString(data.resultDate) : null;
      
      await pool.query(
        `INSERT INTO government_exams 
         (firestore_doc_id, exam_id, exam_name, organization, posts, vacancies, 
          eligibility, application_start_date, application_end_date, exam_date, 
          exam_level, age_limit, application_fee, exam_mode, official_website,
          notification_link, apply_link, syllabus, admit_card_date, result_date,
          featured, is_new, is_active, is_approved, views, shares, applications,
          saves, created_at, updated_at, expires_at, created_by, last_updated_by,
          consent_given, data_processing_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           exam_name = EXCLUDED.exam_name,
           organization = EXCLUDED.organization,
           posts = EXCLUDED.posts,
           vacancies = EXCLUDED.vacancies,
           eligibility = EXCLUDED.eligibility,
           application_start_date = EXCLUDED.application_start_date,
           application_end_date = EXCLUDED.application_end_date,
           exam_date = EXCLUDED.exam_date,
           exam_level = EXCLUDED.exam_level,
           age_limit = EXCLUDED.age_limit,
           application_fee = EXCLUDED.application_fee,
           exam_mode = EXCLUDED.exam_mode,
           official_website = EXCLUDED.official_website,
           notification_link = EXCLUDED.notification_link,
           apply_link = EXCLUDED.apply_link,
           syllabus = EXCLUDED.syllabus,
           admit_card_date = EXCLUDED.admit_card_date,
           result_date = EXCLUDED.result_date,
           featured = EXCLUDED.featured,
           is_new = EXCLUDED.is_new,
           is_active = EXCLUDED.is_active,
           views = EXCLUDED.views,
           shares = EXCLUDED.shares,
           applications = EXCLUDED.applications,
           saves = EXCLUDED.saves,
           updated_at = EXCLUDED.updated_at,
           expires_at = EXCLUDED.expires_at,
           last_updated_by = EXCLUDED.last_updated_by`,
        [
          docId,
          data.id || docId,
          data.examName || '',
          data.organization || '',
          data.posts || '',
          data.vacancies || '',
          data.eligibility || '',
          applicationStartDate,
          applicationEndDate,
          examDate,
          data.examLevel || '',
          data.ageLimit || '',
          data.applicationFee || '',
          data.examMode || 'Online',
          data.officialWebsite || '',
          data.notificationLink || '',
          data.applyLink || '',
          data.syllabus || '',
          admitCardDate,
          resultDate,
          data.featured || false,
          data.isNew || false,
          data.isActive !== false,
          data.isApproved !== false,
          data.views || 0,
          data.shares || 0,
          data.applications || 0,
          data.saves || 0,
          timestamp || new Date(),
          updatedAt || new Date(),
          expiresAt,
          data.createdBy || 'system',
          data.lastUpdatedBy || 'system',
          data.consentGiven || false,
          data.dataProcessingLocation || 'IN'
        ]
      );
      
      await logSyncOperation(pool, 'governmentExams', 'upsert', 1, 1, 0, 'success');
      console.log(`✅ Government exam synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync government exam ${docId}:`, error.message);
      await logSyncOperation(pool, 'governmentExams', 'upsert', 1, 0, 1, 'failed', error.message);
    }
  });
/**
 * SYNC EVENTS - Real-time sync for general events
 */
export const syncEvents = functions.firestore
  .document('events/{docId}')
  .onCreate(async (snap, context) => {
    console.log('🔄 syncEvents trigger called');
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for event: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing event: ${docId}`, { data: JSON.stringify(data) });
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      // ✅ FIXED: Match frontend field names and handle missing fields
      await pool.query(
        `INSERT INTO events 
         (user_id, session_id, event_name, event_category, event_label, event_value,
          page_path, page_title, timestamp, user_agent, screen_resolution,
          language, is_anonymous, consent_given, data_processing_location,
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           event_value = EXCLUDED.event_value,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.eventName || '',
          data.eventCategory || '',
          data.eventLabel || '',
          data.eventValue || 0,
          data.pagePath || '',
          data.pageTitle || '',
          timestamp || new Date(),
          data.userAgent || '',
          getScreenResolution(data),
          data.language || 'en',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          data.consentGiven !== undefined ? data.consentGiven : false,
          data.dataProcessingLocation || 'IN',
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'events', 'create', 1, 1, 0, 'success');
      console.log(`✅ Event synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync event ${docId}:`, error.message);
      console.error('Error details:', error);
      await logSyncOperation(pool, 'events', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC RESUME EVENTS - Real-time sync for resume events
 */
export const syncResumeEvents = functions.firestore
  .document('resumeEvents/{docId}')
  .onCreate(async (snap, context) => {
    console.log('🔄 syncResumeEvents trigger called');
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for resume event: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing resume event: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      // ✅ FIXED: Match frontend field names
      await pool.query(
        `INSERT INTO resume_events 
         (user_id, session_id, template_type, format, action, timestamp,
          fields_count, resume_id, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.templateType || '',
          data.format || 'pdf',
          data.action || '',
          timestamp || new Date(),
          safeToJson(data.fieldsCount || {}),
          data.resumeId || '',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'resumeEvents', 'create', 1, 1, 0, 'success');
      console.log(`✅ Resume event synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync resume event ${docId}:`, error.message);
      await logSyncOperation(pool, 'resumeEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC JOB EVENTS - Real-time sync for job events
 */
export const syncJobEvents = functions.firestore
  .document('jobEvents/{docId}')
  .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for job event: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing job event: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      // ✅ FIXED: Match frontend field names
      await pool.query(
        `INSERT INTO job_events 
         (user_id, session_id, job_id, job_title, company, action, timestamp,
          application_method, status, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           status = EXCLUDED.status,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.jobId || '',
          data.jobTitle || '',
          data.company || '',
          data.action || '',
          timestamp || new Date(),
          data.applicationMethod || 'direct',
          data.status || '',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'jobEvents', 'create', 1, 1, 0, 'success');
      console.log(`✅ Job event synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync job event ${docId}:`, error.message);
      await logSyncOperation(pool, 'jobEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC BLOG EVENTS - Real-time sync for blog events
 */
export const syncBlogEvents = functions.firestore
  .document('blogEvents/{docId}')
  .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for blog event: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing blog event: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      // ✅ FIXED: Match frontend field names
      await pool.query(
        `INSERT INTO blog_events 
         (user_id, session_id, post_slug, post_title, category, action, timestamp,
          read_duration_seconds, scroll_percentage, search_term, is_anonymous, 
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           read_duration_seconds = EXCLUDED.read_duration_seconds,
           scroll_percentage = EXCLUDED.scroll_percentage,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.postSlug || '',
          data.postTitle || '',
          data.category || '',
          data.action || '',
          timestamp || new Date(),
          data.readDuration || 0,
          data.scrollPercentage || 0,
          data.searchTerm || '',
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'blogEvents', 'create', 1, 1, 0, 'success');
      console.log(`✅ Blog event synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync blog event ${docId}:`, error.message);
      await logSyncOperation(pool, 'blogEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC FUNNEL EVENTS - Real-time sync for funnel events
 */
export const syncFunnelEvents = functions.firestore
  .document('funnels/{docId}')
  .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for funnel event: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing funnel event: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      await pool.query(
        `INSERT INTO funnel_events 
         (user_id, session_id, funnel_name, step_name, step_number, timestamp,
          time_to_step_seconds, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           time_to_step_seconds = EXCLUDED.time_to_step_seconds,
           metadata = EXCLUDED.metadata`,
        [
          data.userId || 'anonymous', // ✅ userId → user_id
          data.sessionId || '', // ✅ sessionId → session_id
          data.funnelName || '',
          data.stepName || '',
          data.stepNumber || 0,
          timestamp || new Date(),
          data.timeToStep || 0,
          data.is_anonymous !== undefined ? data.is_anonymous : true,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'funnels', 'create', 1, 1, 0, 'success');
      console.log(`✅ Funnel event synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync funnel event ${docId}:`, error.message);
      await logSyncOperation(pool, 'funnels', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC ADMIN LOGS - Real-time sync for admin logs
 */
export const syncAdminLogs = functions.firestore
  .document('admin_logs/{docId}')
  .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for admin log: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing admin log: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.timestamp);
      
      await pool.query(
        `INSERT INTO admin_logs 
         (admin_email, action, timestamp, ip_address, user_agent,
          success, error_message, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           error_message = EXCLUDED.error_message,
           metadata = EXCLUDED.metadata`,
        [
          data.email || '',
          data.action || '',
          timestamp || new Date(),
          data.ip || '',
          data.userAgent || '',
          data.success !== false,
          data.error || '',
          safeToJson({ originalData: data }),
          docId
        ]
      );
      
      await logSyncOperation(pool, 'admin_logs', 'create', 1, 1, 0, 'success');
      console.log(`✅ Admin log synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync admin log ${docId}:`, error.message);
      await logSyncOperation(pool, 'admin_logs', 'create', 1, 0, 1, 'failed', error.message);
    }
  });

// ================ BUSINESS DATA SYNC TRIGGERS ================

/**
 * SYNC JOBS - Real-time sync for job postings (CREATE/UPDATE/DELETE)
 */
export const syncJobs = functions.firestore
  .document('jobs/{docId}')
  .onWrite(async (change, context) => {
    const pool = initializePostgresPool();
    const docId = context.params.docId;
    
    if (!change.after.exists) {
      // Document was deleted
      try {
        await pool.query(
          'DELETE FROM jobs WHERE firestore_doc_id = $1',
          [docId]
        );
        console.log(`✅ Job deleted from PostgreSQL: ${docId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete job ${docId}:`, error.message);
      }
      return;
    }
    
    const data = change.after.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for job: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing job: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.createdAt);
      const updatedAt = firestoreTimestampToDate(data.updatedAt);
      const expiresAt = firestoreTimestampToDate(data.expiresAt);
      
      // ✅ FIXED: Match your JobData interface - Added null checks for all data fields
      await pool.query(
        `INSERT INTO jobs 
         (firestore_doc_id, job_id, title, company, location, type, sector, salary, 
          description, requirements, posted_date, apply_link, featured, is_active,
          experience, qualifications, views, shares, applications, saves,
          created_at, updated_at, expires_at, created_by, last_updated_by,
          is_approved, consent_given, data_processing_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           title = EXCLUDED.title,
           company = EXCLUDED.company,
           location = EXCLUDED.location,
           type = EXCLUDED.type,
           salary = EXCLUDED.salary,
           description = EXCLUDED.description,
           requirements = EXCLUDED.requirements,
           posted_date = EXCLUDED.posted_date,
           apply_link = EXCLUDED.apply_link,
           featured = EXCLUDED.featured,
           is_active = EXCLUDED.is_active,
           experience = EXCLUDED.experience,
           qualifications = EXCLUDED.qualifications,
           views = EXCLUDED.views,
           shares = EXCLUDED.shares,
           applications = EXCLUDED.applications,
           saves = EXCLUDED.saves,
           updated_at = EXCLUDED.updated_at,
           expires_at = EXCLUDED.expires_at,
           last_updated_by = EXCLUDED.last_updated_by,
           is_approved = EXCLUDED.is_approved`,
        [
          docId,
          data.id || docId,
          data.title || '',
          data.company || '',
          data.location || '',
          data.type || 'full_time',
          data.sector || 'other',
          data.salary || 'Not disclosed',
          data.description || '',
          safeToJson(data.requirements || []),
          data.postedDate || new Date().toISOString().split('T')[0],
          data.applyLink || '',
          data.featured || false,
          data.isActive !== false, // Default to true
          data.experience || '0-2 years',
          safeToJson(data.qualifications || []),
          data.views || 0,
          data.shares || 0,
          data.applications || 0,
          data.saves || 0,
          timestamp || new Date(),
          updatedAt || new Date(),
          expiresAt,
          data.createdBy || 'system',
          data.lastUpdatedBy || 'system',
          data.isApproved !== false, // Default to true
          data.consentGiven || false,
          data.dataProcessingLocation || 'IN'
        ]
      );
      
      await logSyncOperation(pool, 'jobs', 'upsert', 1, 1, 0, 'success');
      console.log(`✅ Job synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync job ${docId}:`, error.message);
      await logSyncOperation(pool, 'jobs', 'upsert', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC JOB DRIVES - Real-time sync for job drives (CREATE/UPDATE/DELETE)
 */
export const syncJobDrives = functions.firestore
  .document('jobDrives/{docId}')
  .onWrite(async (change, context) => {
    const pool = initializePostgresPool();
    const docId = context.params.docId;
    
    if (!change.after.exists) {
      // Document was deleted
      try {
        await pool.query(
          'DELETE FROM job_drives WHERE firestore_doc_id = $1',
          [docId]
        );
        console.log(`✅ Job drive deleted from PostgreSQL: ${docId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete job drive ${docId}:`, error.message);
      }
      return;
    }
    
    const data = change.after.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for job drive: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing job drive: ${docId}`);
    
    try {
      const timestamp = firestoreTimestampToDate(data.createdAt);
      const updatedAt = firestoreTimestampToDate(data.updatedAt);
      const expiresAt = firestoreTimestampToDate(data.expiresAt);
      
      // ✅ FIXED: Use parsed dates and times with validation
      const parsedDate = parseDateString(data.date);
      const parsedTime = parseTimeString(data.time);
      
      // ✅ FIXED: Match your JobDriveData interface
      await pool.query(
        `INSERT INTO job_drives 
         (firestore_doc_id, drive_id, title, company, location, date, time, 
          description, eligibility, documents, apply_link, registration_link, 
          contact, featured, drive_type, experience, salary, expected_candidates,
          views, shares, registrations, created_at, updated_at, expires_at,
          is_active, consent_given, data_processing_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           title = EXCLUDED.title,
           company = EXCLUDED.company,
           location = EXCLUDED.location,
           date = EXCLUDED.date,
           time = EXCLUDED.time,
           description = EXCLUDED.description,
           eligibility = EXCLUDED.eligibility,
           documents = EXCLUDED.documents,
           apply_link = EXCLUDED.apply_link,
           registration_link = EXCLUDED.registration_link,
           contact = EXCLUDED.contact,
           featured = EXCLUDED.featured,
           drive_type = EXCLUDED.drive_type,
           experience = EXCLUDED.experience,
           salary = EXCLUDED.salary,
           expected_candidates = EXCLUDED.expected_candidates,
           views = EXCLUDED.views,
           shares = EXCLUDED.shares,
           registrations = EXCLUDED.registrations,
           updated_at = EXCLUDED.updated_at,
           expires_at = EXCLUDED.expires_at,
           is_active = EXCLUDED.is_active`,
        [
          docId,
          data.id || docId,
          data.title || '',
          data.company || '',
          data.location || '',
          parsedDate || new Date().toISOString().split('T')[0], // ✅ FIXED
          parsedTime || '09:00', // ✅ FIXED
          data.description || '',
          safeToJson(data.eligibility || []),
          safeToJson(data.documents || []),
          data.applyLink || '',
          data.registrationLink || '',
          data.contact || '',
          data.featured || false,
          data.driveType || 'walkin',
          data.experience || '0-2 years',
          data.salary || 'Not disclosed',
          data.expectedCandidates || 0,
          data.views || 0,
          data.shares || 0,
          data.registrations || 0,
          timestamp || new Date(),
          updatedAt || new Date(),
          expiresAt,
          data.isActive !== false, // Default to true
          data.consentGiven || false,
          data.dataProcessingLocation || 'IN'
        ]
      );
      
      await logSyncOperation(pool, 'jobDrives', 'upsert', 1, 1, 0, 'success');
      console.log(`✅ Job drive synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync job drive ${docId}:`, error.message);
      await logSyncOperation(pool, 'jobDrives', 'upsert', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC RESUMES - Real-time sync for user resumes (CREATE/UPDATE/DELETE)
 */
export const syncResumes = functions.firestore
  .document('resumes/{docId}')
  .onWrite(async (change, context) => {
    const pool = initializePostgresPool();
    const docId = context.params.docId;
    
    if (!change.after.exists) {
      // Document was deleted
      try {
        await pool.query(
          'DELETE FROM resumes WHERE firestore_doc_id = $1',
          [docId]
        );
        console.log(`✅ Resume deleted from PostgreSQL: ${docId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete resume ${docId}:`, error.message);
      }
      return;
    }
    
    const data = change.after.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for resume: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing resume: ${docId}`);
    
    try {
      const metadata = data.metadata || {};
      const resumeData = data.data || {};
      
      await pool.query(
        `INSERT INTO resumes 
         (firestore_doc_id, resume_id, user_id, title, template, personal_info,
          experience, education, skills, projects, certifications, languages,
          created_at, updated_at, last_accessed, download_count, share_count,
          is_public, tags, data_retention_period, consent_given)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           title = EXCLUDED.title,
           template = EXCLUDED.template,
           personal_info = EXCLUDED.personal_info,
           experience = EXCLUDED.experience,
           education = EXCLUDED.education,
           skills = EXCLUDED.skills,
           projects = EXCLUDED.projects,
           certifications = EXCLUDED.certifications,
           languages = EXCLUDED.languages,
           updated_at = EXCLUDED.updated_at,
           last_accessed = EXCLUDED.last_accessed,
           download_count = EXCLUDED.download_count,
           share_count = EXCLUDED.share_count,
           is_public = EXCLUDED.is_public,
           tags = EXCLUDED.tags`,
        [
          docId,
          data.id || docId,
          data.userId || '',
          data.title || 'Untitled Resume',
          data.template || 'basic',
          safeToJson(resumeData.personalInfo || {}),
          safeToJson(resumeData.experience || []),
          safeToJson(resumeData.education || []),
          safeToJson(resumeData.skills || []),
          safeToJson(resumeData.projects || []),
          safeToJson(resumeData.certifications || []),
          safeToJson(resumeData.languages || []),
          firestoreTimestampToDate(metadata.createdAt) || new Date(),
          firestoreTimestampToDate(metadata.updatedAt) || new Date(),
          firestoreTimestampToDate(metadata.lastAccessed) || new Date(),
          metadata.downloadCount || 0,
          metadata.shareCount || 0,
          metadata.isPublic || false,
          safeToJson(metadata.tags || []),
          data.dataRetentionPeriod || 730,
          data.consentGiven || false
        ]
      );
      
      await logSyncOperation(pool, 'resumes', 'upsert', 1, 1, 0, 'success');
      console.log(`✅ Resume synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync resume ${docId}:`, error.message);
      await logSyncOperation(pool, 'resumes', 'upsert', 1, 0, 1, 'failed', error.message);
    }
  });

/**
 * SYNC PROFESSIONAL RESUMES - Real-time sync for admin professional resumes (CREATE/UPDATE/DELETE)
 */
export const syncProfessionalResumes = functions.firestore
  .document('professional_resumes/{docId}')
  .onWrite(async (change, context) => {
    const pool = initializePostgresPool();
    const docId = context.params.docId;
    
    if (!change.after.exists) {
      // Document was deleted
      try {
        await pool.query(
          'DELETE FROM professional_resumes WHERE firestore_doc_id = $1',
          [docId]
        );
        console.log(`✅ Professional resume deleted from PostgreSQL: ${docId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete professional resume ${docId}:`, error.message);
      }
      return;
    }
    
    const data = change.after.data();
    
    // ✅ FIXED: Handle possible undefined data
    if (!data) {
      console.error(`❌ No data found for professional resume: ${docId}`);
      return;
    }
    
    console.log(`🔄 Syncing professional resume: ${docId}`);
    
    try {
      const clientInfo = data.clientInfo || {};
      const metadata = data.metadata || {};
      const resumeData = data.resumeData || {};
      
      await pool.query(
        `INSERT INTO professional_resumes 
         (firestore_doc_id, resume_id, client_name, client_email, client_phone,
          client_company, client_notes, resume_data, tags, job_type, industry,
          experience_level, created_by, created_at, updated_at, last_edited_by,
          storage_type, version, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           client_name = EXCLUDED.client_name,
           client_phone = EXCLUDED.client_phone,
           client_company = EXCLUDED.client_company,
           client_notes = EXCLUDED.client_notes,
           resume_data = EXCLUDED.resume_data,
           tags = EXCLUDED.tags,
           job_type = EXCLUDED.job_type,
           industry = EXCLUDED.industry,
           experience_level = EXCLUDED.experience_level,
           updated_at = EXCLUDED.updated_at,
           last_edited_by = EXCLUDED.last_edited_by,
           version = EXCLUDED.version,
           is_active = EXCLUDED.is_active`,
        [
          docId,
          metadata.resumeId || docId,
          clientInfo.name || '',
          clientInfo.email || '',
          clientInfo.phone || '',
          clientInfo.company || '',
          clientInfo.notes || '',
          safeToJson(resumeData),
          safeToJson(data.tags || []),
          data.jobType || '',
          data.industry || '',
          data.experienceLevel || '',
          metadata.createdBy || 'admin',
          firestoreTimestampToDate(metadata.createdAt) || new Date(),
          firestoreTimestampToDate(metadata.updatedAt) || new Date(),
          metadata.lastEditedBy || 'admin',
          metadata.storageType || 'professional_database',
          metadata.version || 1,
          metadata.isActive !== false
        ]
      );
      
      await logSyncOperation(pool, 'professional_resumes', 'upsert', 1, 1, 0, 'success');
      console.log(`✅ Professional resume synced: ${docId}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to sync professional resume ${docId}:`, error.message);
      await logSyncOperation(pool, 'professional_resumes', 'upsert', 1, 0, 1, 'failed', error.message);
    }
  });

// ================ HELPER SYNC FUNCTIONS ================

// Helper function to sync a single document - UPDATED VERSION WITH DATA VALIDATION
const syncDocument = async (pool: Pool, collectionName: string, docId: string, data: any) => {
  // ✅ FIXED: Handle possible undefined data
  if (!data) {
    console.error(`❌ No data provided for sync: ${docId}`);
    return;
  }
  
  const timestamp = firestoreTimestampToDate(data.timestamp);
  
  // Default values for missing fields
  const defaults = {
    userId: data.userId || 'anonymous',
    sessionId: data.sessionId || '',
    deviceType: data.deviceType || getDeviceTypeFromUserAgent(data.userAgent),
    screenResolution: getScreenResolution(data),
    language: data.language || 'en',
    is_anonymous: data.is_anonymous !== undefined ? data.is_anonymous : true,
    consentGiven: data.consentGiven !== undefined ? data.consentGiven : false,
    dataProcessingLocation: data.dataProcessingLocation || 'IN'
  };
  
  switch (collectionName) {
    case 'pageViews':
      await pool.query(
        `INSERT INTO page_views 
         (user_id, session_id, page_path, page_title, referrer, timestamp, 
          duration_seconds, scroll_depth, device_type, screen_resolution,
          user_agent, language, is_anonymous, consent_given, 
          data_processing_location, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.pagePath || '',
          data.pageTitle || '',
          data.referrer || '',
          timestamp || new Date(),
          data.duration || 0,
          data.scrollDepth || 0,
          defaults.deviceType,
          defaults.screenResolution,
          data.userAgent || '',
          defaults.language,
          defaults.is_anonymous,
          defaults.consentGiven,
          defaults.dataProcessingLocation,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'events':
      await pool.query(
        `INSERT INTO events 
         (user_id, session_id, event_name, event_category, event_label, event_value,
          page_path, page_title, timestamp, user_agent, screen_resolution,
          language, is_anonymous, consent_given, data_processing_location,
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.eventName || '',
          data.eventCategory || '',
          data.eventLabel || '',
          data.eventValue || 0,
          data.pagePath || '',
          data.pageTitle || '',
          timestamp || new Date(),
          data.userAgent || '',
          defaults.screenResolution,
          defaults.language,
          defaults.is_anonymous,
          defaults.consentGiven,
          defaults.dataProcessingLocation,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'resumeEvents':
      await pool.query(
        `INSERT INTO resume_events 
         (user_id, session_id, template_type, format, action, timestamp,
          fields_count, resume_id, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.templateType || '',
          data.format || 'pdf',
          data.action || '',
          timestamp || new Date(),
          safeToJson(data.fieldsCount || {}),
          data.resumeId || '',
          defaults.is_anonymous,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'jobEvents':
      await pool.query(
        `INSERT INTO job_events 
         (user_id, session_id, job_id, job_title, company, action, timestamp,
          application_method, status, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.jobId || '',
          data.jobTitle || '',
          data.company || '',
          data.action || '',
          timestamp || new Date(),
          data.applicationMethod || 'direct',
          data.status || '',
          defaults.is_anonymous,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'blogEvents':
      await pool.query(
        `INSERT INTO blog_events 
         (user_id, session_id, post_slug, post_title, category, action, timestamp,
          read_duration_seconds, scroll_percentage, search_term, is_anonymous, 
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.postSlug || '',
          data.postTitle || '',
          data.category || '',
          data.action || '',
          timestamp || new Date(),
          data.readDuration || 0,
          data.scrollPercentage || 0,
          data.searchTerm || '',
          defaults.is_anonymous,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'funnels':
      await pool.query(
        `INSERT INTO funnel_events 
         (user_id, session_id, funnel_name, step_name, step_number, timestamp,
          time_to_step_seconds, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          defaults.userId,
          defaults.sessionId,
          data.funnelName || '',
          data.stepName || '',
          data.stepNumber || 0,
          timestamp || new Date(),
          data.timeToStep || 0,
          defaults.is_anonymous,
          safeToJson(data.metadata || {}),
          docId
        ]
      );
      break;
      
    case 'admin_logs':
      await pool.query(
        `INSERT INTO admin_logs 
         (admin_email, action, timestamp, ip_address, user_agent,
          success, error_message, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          data.email || '',
          data.action || '',
          timestamp || new Date(),
          data.ip || '',
          data.userAgent || '',
          data.success !== false,
          data.error || '',
          safeToJson({ originalData: data }),
          docId
        ]
      );
      break;
      
    case 'jobs':
      const jobTimestamp = firestoreTimestampToDate(data.createdAt);
      const jobUpdatedAt = firestoreTimestampToDate(data.updatedAt);
      const jobExpiresAt = firestoreTimestampToDate(data.expiresAt);
      
      await pool.query(
        `INSERT INTO jobs 
         (firestore_doc_id, job_id, title, company, location, type, sector, salary, 
          description, requirements, posted_date, apply_link, featured, is_active,
          experience, qualifications, views, shares, applications, saves,
          created_at, updated_at, expires_at, created_by, last_updated_by,
          is_approved, consent_given, data_processing_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          docId,
          data.id || docId,
          data.title || '',
          data.company || '',
          data.location || '',
          data.type || 'full_time',
          data.sector || 'other',
          data.salary || 'Not disclosed',
          data.description || '',
          safeToJson(data.requirements || []),
          data.postedDate || new Date().toISOString().split('T')[0],
          data.applyLink || '',
          data.featured || false,
          data.isActive !== false,
          data.experience || '0-2 years',
          safeToJson(data.qualifications || []),
          data.views || 0,
          data.shares || 0,
          data.applications || 0,
          data.saves || 0,
          jobTimestamp || new Date(),
          jobUpdatedAt || new Date(),
          jobExpiresAt,
          data.createdBy || 'system',
          data.lastUpdatedBy || 'system',
          data.isApproved !== false,
          data.consentGiven || false,
          data.dataProcessingLocation || 'IN'
        ]
      );
      break;
      
    case 'jobDrives':
      const driveTimestamp = firestoreTimestampToDate(data.createdAt);
      const driveUpdatedAt = firestoreTimestampToDate(data.updatedAt);
      const driveExpiresAt = firestoreTimestampToDate(data.expiresAt);
      
      // ✅ FIXED: Use parsed dates and times with validation
      const parsedDate = parseDateString(data.date);
      const parsedTime = parseTimeString(data.time);
      
      await pool.query(
        `INSERT INTO job_drives 
         (firestore_doc_id, drive_id, title, company, location, date, time, 
          description, eligibility, documents, apply_link, registration_link, 
          contact, featured, drive_type, experience, salary, expected_candidates,
          views, shares, registrations, created_at, updated_at, expires_at,
          is_active, consent_given, data_processing_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          docId,
          data.id || docId,
          data.title || '',
          data.company || '',
          data.location || '',
          parsedDate || new Date().toISOString().split('T')[0], // ✅ FIXED
          parsedTime || '09:00', // ✅ FIXED
          data.description || '',
          safeToJson(data.eligibility || []),
          safeToJson(data.documents || []),
          data.applyLink || '',
          data.registrationLink || '',
          data.contact || '',
          data.featured || false,
          data.driveType || 'walkin',
          data.experience || '0-2 years',
          data.salary || 'Not disclosed',
          data.expectedCandidates || 0,
          data.views || 0,
          data.shares || 0,
          data.registrations || 0,
          driveTimestamp || new Date(),
          driveUpdatedAt || new Date(),
          driveExpiresAt,
          data.isActive !== false,
          data.consentGiven || false,
          data.dataProcessingLocation || 'IN'
        ]
      );
      break;
      
    case 'resumes':
      const resumeMetadata = data.metadata || {};
      const resumeData = data.data || {};
      const resumeCreatedAt = firestoreTimestampToDate(resumeMetadata.createdAt);
      const resumeUpdatedAt = firestoreTimestampToDate(resumeMetadata.updatedAt);
      const resumeLastAccessed = firestoreTimestampToDate(resumeMetadata.lastAccessed);
      
      await pool.query(
        `INSERT INTO resumes 
         (firestore_doc_id, resume_id, user_id, title, template, personal_info,
          experience, education, skills, projects, certifications, languages,
          created_at, updated_at, last_accessed, download_count, share_count,
          is_public, tags, data_retention_period, consent_given)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          docId,
          data.id || docId,
          data.userId || '',
          data.title || 'Untitled Resume',
          data.template || 'basic',
          safeToJson(resumeData.personalInfo || {}),
          safeToJson(resumeData.experience || []),
          safeToJson(resumeData.education || []),
          safeToJson(resumeData.skills || []),
          safeToJson(resumeData.projects || []),
          safeToJson(resumeData.certifications || []),
          safeToJson(resumeData.languages || []),
          resumeCreatedAt || new Date(),
          resumeUpdatedAt || new Date(),
          resumeLastAccessed || new Date(),
          resumeMetadata.downloadCount || 0,
          resumeMetadata.shareCount || 0,
          resumeMetadata.isPublic || false,
          safeToJson(resumeMetadata.tags || []),
          data.dataRetentionPeriod || 730,
          data.consentGiven || false
        ]
      );
      break;
      
    case 'professional_resumes':
      const proClientInfo = data.clientInfo || {};
      const proMetadata = data.metadata || {};
      const proResumeData = data.resumeData || {};
      const proCreatedAt = firestoreTimestampToDate(proMetadata.createdAt);
      const proUpdatedAt = firestoreTimestampToDate(proMetadata.updatedAt);
      
      await pool.query(
        `INSERT INTO professional_resumes 
         (firestore_doc_id, resume_id, client_name, client_email, client_phone,
          client_company, client_notes, resume_data, tags, job_type, industry,
          experience_level, created_by, created_at, updated_at, last_edited_by,
          storage_type, version, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (firestore_doc_id) DO NOTHING`,
        [
          docId,
          proMetadata.resumeId || docId,
          proClientInfo.name || '',
          proClientInfo.email || '',
          proClientInfo.phone || '',
          proClientInfo.company || '',
          proClientInfo.notes || '',
          safeToJson(proResumeData),
          safeToJson(data.tags || []),
          data.jobType || '',
          data.industry || '',
          data.experienceLevel || '',
          proMetadata.createdBy || 'admin',
          proCreatedAt || new Date(),
          proUpdatedAt || new Date(),
          proMetadata.lastEditedBy || 'admin',
          proMetadata.storageType || 'professional_database',
          proMetadata.version || 1,
          proMetadata.isActive !== false
        ]
      );
      break;
  }
};

// ================ DIAGNOSTIC FUNCTIONS ================

/**
 * TEST POSTGRES CONNECTION
 */
export const testPostgresConnection = runWithCors(async (req: any, res: any) => {
  try {
    console.log('🔌 Testing PostgreSQL connection...');
    
    // Log config for debugging
    const config = functions.config().postgres || {};
    console.log('🔧 Current PostgreSQL Config:', {
      host: config.host || 'NOT SET',
      port: config.port || 'NOT SET',
      database: config.database || 'NOT SET',
      user: config.user || 'NOT SET',
      password: config.password ? '***' + config.password.slice(-3) : 'NOT SET',
      ssl: config.ssl || false
    });
    
    const pool = initializePostgresPool();
    
    // Test connection with simple query
    const result = await pool.query('SELECT NOW() as time, current_database() as database, current_user as user');
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Check sync_logs table specifically
    let syncLogsExist = false;
    try {
      await pool.query('SELECT 1 FROM sync_logs LIMIT 1');
      syncLogsExist = true;
    } catch (e) {
      syncLogsExist = false;
    }
    
    // Check page_views table
    let pageViewsExist = false;
    try {
      await pool.query('SELECT 1 FROM page_views LIMIT 1');
      pageViewsExist = true;
    } catch (e) {
      pageViewsExist = false;
    }
    
    // Check professional_resumes table
    let professionalResumesExist = false;
    try {
      await pool.query('SELECT 1 FROM professional_resumes LIMIT 1');
      professionalResumesExist = true;
    } catch (e) {
      professionalResumesExist = false;
    }
    
    res.json({
      success: true,
      connection: {
        status: 'connected',
        time: result.rows[0].time,
        database: result.rows[0].database,
        user: result.rows[0].user
      },
      tables: {
        all_tables: tablesResult.rows.map((r: any) => r.table_name),
        sync_logs_exists: syncLogsExist,
        page_views_exists: pageViewsExist,
        professional_resumes_exists: professionalResumesExist,
        count: tablesResult.rows.length
      },
      config: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        ssl: config.ssl
      }
    });
    
  } catch (error: any) {
    console.error('❌ PostgreSQL connection test failed:', error.message);
    console.error('Error details:', error);
    
    // Get config for debugging
    const config = functions.config().postgres || {};
    
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        ssl: config.ssl
      },
      message: 'Check Supabase credentials and network connectivity'
    });
  }
});

/**
 * DEBUG FIRESTORE TRIGGERS
 * Creates test documents to trigger sync functions
 */
export const testFirestoreTriggers = runWithCors(async (req: any, res: any) => {
  try {
    const db = admin.firestore();
    
    console.log('🧪 Creating test Firestore documents...');
    
    // Create test page view
    const testPageView = {
      userId: 'test-user-' + Date.now(),
      sessionId: 'test-session-' + Math.random().toString(36).substr(2, 9),
      pagePath: '/test',
      pageTitle: 'Test Page',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: 'Test Agent',
      is_anonymous: false,
      consentGiven: true,
      dataProcessingLocation: 'IN',
      metadata: { test: true, created_by: 'testFirestoreTriggers' }
    };
    
    const pageViewRef = await db.collection('pageViews').add(testPageView);
    console.log(`✅ Created pageView: ${pageViewRef.id}`);
    
    // Create test event
    const testEvent = {
      userId: 'test-user-' + Date.now(),
      sessionId: 'test-session-' + Math.random().toString(36).substr(2, 9),
      eventName: 'button_click',
      eventCategory: 'engagement',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      pagePath: '/test',
      is_anonymous: false,
      consentGiven: true,
      metadata: { test: true, created_by: 'testFirestoreTriggers' }
    };
    
    const eventRef = await db.collection('events').add(testEvent);
    console.log(`✅ Created event: ${eventRef.id}`);
    
    res.json({
      success: true,
      message: 'Test documents created',
      documents: {
        pageView: {
          id: pageViewRef.id,
          data: testPageView
        },
        event: {
          id: eventRef.id,
          data: testEvent
        }
      },
      instructions: 'Check Firebase Console Logs for trigger execution'
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * CHECK FIRESTORE COLLECTIONS
 * Lists all collections and document counts
 */
export const checkFirestoreCollections = runWithCors(async (req: any, res: any) => {
  try {
    const db = admin.firestore();
    
    const collections = [
      'pageViews',
      'events',
      'resumeEvents',
      'jobEvents',
      'blogEvents',
      'funnels',
      'admin_logs',
      'jobs', // ✅ ADDED
      'jobDrives', // ✅ ADDED
      'resumes', // ✅ ADDED
      'professional_resumes',
      'governmentExams' // ✅ ADDED
    ];
    
    const results: any = {};
    
    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).limit(10).get();
        results[collection] = {
          exists: true,
          count: snapshot.size,
          sample: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
            timestamp: doc.data().timestamp
          }))
        };
      } catch (error: any) {
        results[collection] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      collections: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Check collections failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================ HTTP SYNC ENDPOINTS ================

/**
 * BATCH SYNC - Sync all historical data from Firebase to PostgreSQL (IMPROVED VERSION)
 */
export const batchSyncCollection = runWithCors(async (req: any, res: any) => {
  try {
    const { collectionName, limit = 500, offset = 0 } = req.body;
    
    if (!collectionName) {
      res.status(400).json({ success: false, error: 'collectionName is required' });
      return;
    }
    
    console.log(`🔄 Starting batch sync for collection: ${collectionName} (limit: ${limit}, offset: ${offset})`);
    
    // Send immediate response to avoid timeout
    res.json({
      success: true,
      message: `Batch sync started for ${collectionName}`,
      startedAt: new Date().toISOString(),
      collectionName,
      limit,
      offset
    });
    
    // Process in background
    setTimeout(async () => {
      try {
        const pool = initializePostgresPool();
        const db = admin.firestore();
        
        // Get documents from the collection
        const snapshot = await db.collection(collectionName)
          .limit(limit)
          .get();
        
        console.log(`📊 Found ${snapshot.size} documents in ${collectionName}`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors: any[] = [];
        
        // Process in smaller batches to avoid timeouts
        const batchSize = 50;
        const documents = snapshot.docs;
        
        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = documents.slice(i, i + batchSize);
          const batchPromises = batch.map(async (doc) => {
            try {
              await syncDocument(pool, collectionName, doc.id, doc.data());
              successCount++;
            } catch (error: any) {
              errorCount++;
              errors.push({
                id: doc.id,
                error: error.message
              });
              console.error(`Failed to sync document ${doc.id}:`, error.message);
            }
          });
          
          await Promise.all(batchPromises);
          console.log(`✅ Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(documents.length/batchSize)}`);
        }
        
        await logSyncOperation(
          pool,
          collectionName,
          'batch_sync',
          snapshot.size,
          successCount,
          errorCount,
          'completed'
        );
        
        // Log completion to Firestore for monitoring
        await db.collection('sync_completions').add({
          collectionName,
          total: snapshot.size,
          successful: successCount,
          failed: errorCount,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          errors: errors.slice(0, 5)
        });
        
        console.log(`🎉 Batch sync completed for ${collectionName}: ${successCount} successful, ${errorCount} failed`);
        
      } catch (error: any) {
        console.error('Background sync process failed:', error);
      }
    }, 100); // Small delay to ensure response is sent
    
  } catch (error: any) {
    console.error('Batch sync initialization failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * BATCH SYNC WITH PROGRESS - Enhanced version with progress tracking
 */
export const batchSyncWithProgress = runWithCors(async (req: any, res: any) => {
  try {
    const { collectionName, limit = 200, batchSize = 50 } = req.body;
    
    if (!collectionName) {
      res.status(400).json({ success: false, error: 'collectionName is required' });
      return;
    }
    
    const pool = initializePostgresPool();
    const db = admin.firestore();
    
    console.log(`🔄 Starting progressive sync for: ${collectionName}`);
    
    // Get total count
    const snapshot = await db.collection(collectionName).limit(limit).get();
    const totalDocs = snapshot.size;
    const documents = snapshot.docs;
    
    console.log(`📊 Processing ${totalDocs} documents in batches of ${batchSize}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];
    let currentBatch = 0;
    const totalBatches = Math.ceil(totalDocs / batchSize);
    
    // Process in batches
    for (let i = 0; i < documents.length; i += batchSize) {
      currentBatch++;
      const batch = documents.slice(i, i + batchSize);
      
      console.log(`🔄 Processing batch ${currentBatch}/${totalBatches} (${batch.length} docs)`);
      
      const batchPromises = batch.map(async (doc) => {
        try {
          await syncDocument(pool, collectionName, doc.id, doc.data());
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push({
            id: doc.id,
            error: error.message.substring(0, 200) // Truncate long errors
          });
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    await logSyncOperation(
      pool,
      collectionName,
      'batch_sync',
      totalDocs,
      successCount,
      errorCount,
      'completed'
    );
    
    res.json({
      success: true,
      message: `Batch sync completed for ${collectionName}`,
      stats: {
        total: totalDocs,
        successful: successCount,
        failed: errorCount,
        batches: totalBatches
      },
      errors: errors.slice(0, 10) // Only return first 10 errors
    });
    
  } catch (error: any) {
    console.error('Batch sync with progress failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * HEALTH CHECK - Test PostgreSQL and Firebase connections
 */
export const healthCheck = runWithCors(async (req: any, res: any) => {
  try {
    const pool = initializePostgresPool();
    
    // Test PostgreSQL connection
    const pgResult = await pool.query('SELECT NOW() as time, version() as version');
    
    // Test Firebase connection
    const db = admin.firestore();
    const firebaseResult = await db.collection('pageViews').limit(1).get();
    
    // Get sync statistics
    let syncStats: any = { rows: [] };
    try {
      syncStats = await pool.query(`
        SELECT 
          collection_name,
          COUNT(*) as total_operations,
          SUM(records_processed) as total_records_processed,
          SUM(records_successful) as total_records_successful,
          MAX(start_time) as last_sync_time
        FROM sync_logs
        WHERE start_time > NOW() - INTERVAL '7 days'
        GROUP BY collection_name
        ORDER BY collection_name
      `);
    } catch (error) {
      console.warn('Could not fetch sync stats:', error);
    }
    
    // Get data counts
    let pageViewsCount = { rows: [{ count: 0 }] };
    let eventsCount = { rows: [{ count: 0 }] };
    let usersCount = { rows: [{ count: 0 }] };
    let professionalResumesCount = { rows: [{ count: 0 }] };
    
    try {
      pageViewsCount = await pool.query('SELECT COUNT(*) as count FROM page_views');
      eventsCount = await pool.query('SELECT COUNT(*) as count FROM events');
      usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
      professionalResumesCount = await pool.query('SELECT COUNT(*) as count FROM professional_resumes');
    } catch (error) {
      console.warn('Could not fetch table counts:', error);
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      postgresql: {
        connected: true,
        time: pgResult.rows[0].time,
        version: pgResult.rows[0].version,
        tables: {
          page_views: pageViewsCount.rows[0].count,
          events: eventsCount.rows[0].count,
          users: usersCount.rows[0].count,
          professional_resumes: professionalResumesCount.rows[0].count
        }
      },
      firebase: {
        connected: true,
        collections: {
          pageViews: firebaseResult.size
        }
      },
      syncStats: {
        enabledCollections: [
          'pageViews',
          'events',
          'resumeEvents',
          'jobEvents',
          'blogEvents',
          'funnels',
          'admin_logs',
          'jobs',
          'jobDrives',
          'resumes',
          'professional_resumes'
        ],
        recentOperations: syncStats.rows
      }
    });
    
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET SYNC STATUS - Check sync status and statistics
 */
export const getSyncStatus = runWithCors(async (req: any, res: any) => {
  try {
    const pool = initializePostgresPool();
    
    // Get sync statistics
    const statsResult = await pool.query(`
      SELECT 
        collection_name,
        operation,
        COUNT(*) as total_operations,
        SUM(records_processed) as total_records_processed,
        SUM(records_successful) as total_records_successful,
        SUM(records_failed) as total_records_failed,
        MAX(start_time) as last_sync_time
      FROM sync_logs
      WHERE start_time > NOW() - INTERVAL '7 days'
      GROUP BY collection_name, operation
      ORDER BY collection_name, operation
    `);
    
    // Get recent errors
    const errorsResult = await pool.query(`
      SELECT 
        collection_name,
        operation,
        error_message,
        start_time
      FROM sync_logs
      WHERE status = 'failed'
        AND start_time > NOW() - INTERVAL '1 day'
      ORDER BY start_time DESC
      LIMIT 10
    `);
    
    // Get data volumes
    const volumesResult = await pool.query(`
      SELECT 
        'page_views' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM page_views
      UNION ALL
      SELECT 
        'events' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM events
      UNION ALL
      SELECT 
        'resume_events' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM resume_events
      UNION ALL
      SELECT 
        'job_events' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM job_events
      UNION ALL
      SELECT 
        'blog_events' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM blog_events
      UNION ALL
      SELECT 
        'funnel_events' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM funnel_events
      UNION ALL
      SELECT 
        'admin_logs' as table_name,
        COUNT(*) as row_count,
        MAX(timestamp) as latest_record
      FROM admin_logs
      UNION ALL
      SELECT 
        'jobs' as table_name,
        COUNT(*) as row_count,
        MAX(updated_at) as latest_record
      FROM jobs
      UNION ALL
      SELECT 
        'job_drives' as table_name,
        COUNT(*) as row_count,
        MAX(updated_at) as latest_record
      FROM job_drives
      UNION ALL
      SELECT 
        'resumes' as table_name,
        COUNT(*) as row_count,
        MAX(updated_at) as latest_record
      FROM resumes
      UNION ALL
      SELECT 
        'professional_resumes' as table_name,
        COUNT(*) as row_count,
        MAX(updated_at) as latest_record
      FROM professional_resumes
      UNION ALL
SELECT 
  'government_exams' as table_name,
  COUNT(*) as row_count,
  MAX(updated_at) as latest_record
FROM government_exams


    `);
    
    res.json({
      success: true,
      syncStats: statsResult.rows,
      recentErrors: errorsResult.rows,
      dataVolumes: volumesResult.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Failed to get sync status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================ DATA VALIDATION ENDPOINTS ================

/**
 * VALIDATE SYNC - Check if data is syncing correctly
 */
export const validateSync = runWithCors(async (req: any, res: any) => {
  try {
    const pool = initializePostgresPool();
    
    // Get sample data from each table to validate
    const validationResults = {
      page_views: await pool.query('SELECT user_id, session_id, page_path, timestamp FROM page_views ORDER BY timestamp DESC LIMIT 5'),
      events: await pool.query('SELECT user_id, event_name, event_category, timestamp FROM events ORDER BY timestamp DESC LIMIT 5'),
      resume_events: await pool.query('SELECT user_id, action, template_type FROM resume_events ORDER BY timestamp DESC LIMIT 5'),
      job_events: await pool.query('SELECT user_id, action, job_title FROM job_events ORDER BY timestamp DESC LIMIT 5'),
      blog_events: await pool.query('SELECT user_id, action, post_title FROM blog_events ORDER BY timestamp DESC LIMIT 5'),
      users: await pool.query('SELECT user_id, is_anonymous, last_active FROM users ORDER BY last_active DESC LIMIT 5'),
      jobs: await pool.query('SELECT title, company, location, type FROM jobs ORDER BY created_at DESC LIMIT 5'),
      job_drives: await pool.query('SELECT title, company, location, drive_type FROM job_drives ORDER BY created_at DESC LIMIT 5'),
      resumes: await pool.query('SELECT title, template, user_id FROM resumes ORDER BY created_at DESC LIMIT 5'),
      professional_resumes: await pool.query('SELECT client_email, job_type, experience_level FROM professional_resumes ORDER BY created_at DESC LIMIT 5'),
      field_mapping: {
        frontend_to_backend: {
          userId: 'user_id',
          sessionId: 'session_id',
          deviceType: 'device_type',
          duration: 'duration_seconds',
          scrollDepth: 'scroll_depth',
          eventName: 'event_name',
          eventCategory: 'event_category',
          eventLabel: 'event_label',
          pagePath: 'page_path',
          pageTitle: 'page_title',
          is_anonymous: 'is_anonymous',
          consentGiven: 'consent_given',
          dataProcessingLocation: 'data_processing_location'
        }
      }
    };
    
    res.json({
      success: true,
      validation: validationResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Validation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================ EXISTING FUNCTIONS ================

/**
 * DEBUG CONFIG FUNCTION
 * Shows current config status
 */
export const debugConfig = runWithCors(async (req: any, res: any) => {
  console.log('🔧 Firebase Config Status:', {
    hasPassword: !!ADMIN_PASSWORD,
    passwordLength: ADMIN_PASSWORD.length,
    emails: ADMIN_EMAILS,
    emailsCount: ADMIN_EMAILS.length
  });
  
  if (ADMIN_EMAILS.length === 0) {
    console.error('❌ No admin emails configured!');
    console.log('   Run: firebase functions:config:set admin.emails="email1,email2" admin.password="yourpassword"');
  }
  
  res.json({
    success: true,
    config: {
      hasPassword: !!ADMIN_PASSWORD,
      passwordLength: ADMIN_PASSWORD.length,
      emails: ADMIN_EMAILS,
      emailsCount: ADMIN_EMAILS.length
    }
  });
});

/**
 * PING FUNCTION
 * Simple endpoint to test if functions are working
 */
export const ping = runWithCors(async (req: any, res: any) => {
  res.json({
    success: true,
    message: 'CareerCraft Functions API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * ADMIN LOGIN FUNCTION
 */
// In your functions/index.ts, update the adminLogin function:

export const adminLogin = runWithCors(async (req: any, res: any) => {
  try {
    console.log('🔐 Admin login request received');
    
    // Set CORS headers explicitly
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
    
    // Check config
    if (!ADMIN_PASSWORD || ADMIN_EMAILS.length === 0) {
      console.error('❌ Admin credentials not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }
    
    const { password, email } = req.body;
    
    if (!password || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email is allowed
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      console.log(`❌ Unauthorized email: ${normalizedEmail}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized email address' 
      });
    }
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
      console.log('❌ Invalid password attempt');
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }
    
    // Get or create user
    let adminUser;
    try {
      adminUser = await admin.auth().getUserByEmail(normalizedEmail);
      console.log('✅ Found existing user:', adminUser.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('🆕 Creating new admin user');
        adminUser = await admin.auth().createUser({
          email: normalizedEmail,
          emailVerified: true,
          password: ADMIN_PASSWORD, // Use the configured password
          displayName: 'Admin User',
          disabled: false,
        });
        console.log('✅ Created new user:', adminUser.uid);
      } else {
        throw error;
      }
    }
    
    // Set admin claims
    await admin.auth().setCustomUserClaims(adminUser.uid, {
      admin: true,
      level: 'super_admin',
      email: normalizedEmail
    });
    
    console.log('✅ Admin claims set for:', normalizedEmail);
    
    // Return success (NO custom token needed)
    res.json({
      success: true,
      user: {
        uid: adminUser.uid,
        email: adminUser.email,
        admin: true
      },
      message: 'Admin login successful',
      note: 'User created/updated in Firebase Auth with admin claims'
    });
    
  } catch (error: any) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * CHECK ADMIN STATUS FUNCTION
 * Verifies if a token is valid and has admin claims
 */
export const adminCheck = runWithCors(async (req: any, res: any) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ 
        success: false, 
        isAdmin: false,
        valid: false,
        error: 'Token required' 
      });
      return;
    }
    
    try {
      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check if user has admin claims
      const isAdminClaim = decodedToken.admin === true;
      
      res.json({
        success: true,
        isAdmin: isAdminClaim,
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          admin: isAdminClaim,
          claims: decodedToken
        }
      });
      
    } catch (error) {
      // Token is invalid
      res.json({
        success: true,
        isAdmin: false,
        valid: false,
        error: 'Invalid or expired token'
      });
    }
    
  } catch (error: unknown) {
    console.error('Check admin status error:', error);
    res.status(500).json({ 
      success: false, 
      isAdmin: false,
      valid: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * SETUP ADMIN USERS FUNCTION
 * One-time function to create admin users in Firebase Auth
 */
export const setupAdminUsers = runWithCors(async (req: any, res: any) => {
  try {
    console.log('⚙️ Setting up admin users...');
    
    // Your UID - ADD THIS
    const YOUR_UID = 'MYM2cZssL3UNc7VY9WpgEdNVW9v1';
    
    const results: any[] = [];
    
    // FIRST - Always set claims for YOUR account
    try {
      const yourUser = await admin.auth().getUser(YOUR_UID);
      await admin.auth().setCustomUserClaims(YOUR_UID, {
        admin: true,
        level: 'super_admin',
        email: yourUser.email,
        canManageResumes: true,
        canPostJobs: true,
        canManageUsers: false
      });
      
      results.push({
        email: yourUser.email,
        uid: YOUR_UID,
        status: 'claims_set',
        claims: { admin: true }
      });
      
      console.log(`✅ Set admin claims for ${yourUser.email}`);
    } catch (yourError: any) {
      results.push({
        uid: YOUR_UID,
        status: 'error',
        error: yourError.message
      });
      console.error(`❌ Error setting claims for your account:`, yourError.message);
    }
    
    // Then continue with existing logic for other emails
    for (const email of ADMIN_EMAILS) {
      // Skip if already processed your email
      if (email === 'nelsonjoshua03@outlook.com') continue;
      
      try {
        // Try to get existing user
        const user = await admin.auth().getUserByEmail(email);
        console.log(`✅ User ${email} already exists: ${user.uid}`);
        
        // Update claims
        await admin.auth().setCustomUserClaims(user.uid, {
          admin: true,
          level: 'super_admin',
          email: email,
          canManageResumes: true,
          canPostJobs: true,
          canManageUsers: false
        });
        
        results.push({
          email,
          uid: user.uid,
          status: 'updated',
          claims: { admin: true }
        });
        
      } catch (error: any) {
        // Create new user if doesn't exist
        if (error.code === 'auth/user-not-found') {
          const adminPassword = ADMIN_PASSWORD; // Only use environment config
          const newUser = await admin.auth().createUser({
            email: email,
            emailVerified: true,
            password: adminPassword,
            displayName: 'Admin User',
            disabled: false,
          });
          
          // Set admin claims
          await admin.auth().setCustomUserClaims(newUser.uid, {
            admin: true,
            level: 'super_admin',
            email: email,
            canManageResumes: true,
            canPostJobs: true,
            canManageUsers: false
          });
          
          results.push({
            email,
            uid: newUser.uid,
            status: 'created',
            claims: { admin: true },
            note: 'User created with admin password'
          });
          
          console.log(`✅ Created admin user: ${email} (${newUser.uid})`);
        } else {
          results.push({
            email,
            status: 'error',
            error: error.message
          });
          console.error(`❌ Error with ${email}:`, error.message);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Admin users setup complete',
      results: results,
      your_account_processed: true,
      note: 'Check your account (nelsonjoshua03@outlook.com) - admin claims should be set'
    });
    
  } catch (error: any) {
    console.error('❌ Setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

/**
 * CREATE PROFESSIONAL RESUME FUNCTION (Admin only - Callable)
 */
export const createProfessionalResume = functions.https.onCall(
  async (data: { resumeData: any; clientInfo: any }, context: functions.https.CallableContext) => {
    
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in'
      );
    }
    
    // Check admin claims
    const adminClaim = context.auth.token.admin;
    if (!adminClaim) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }
    
    const { resumeData, clientInfo } = data;
    
    if (!resumeData || !clientInfo || !clientInfo.email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Resume data and client email are required'
      );
    }
    
    try {
      const db = admin.firestore();
      const resumeId = `pro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const professionalResume = {
        resumeData: {
          ...resumeData,
          id: resumeId,
          metadata: {
            ...resumeData.metadata,
            isProfessionalResume: true,
            adminCreated: true,
            createdBy: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }
        },
        clientInfo: {
          email: clientInfo.email.toLowerCase(),
          name: clientInfo.name || '',
          phone: clientInfo.phone || '',
          notes: clientInfo.notes || '',
          company: resumeData.personalInfo?.company || ''
        },
        metadata: {
          createdBy: context.auth.uid,
          createdByEmail: context.auth.token.email || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          storageType: 'professional_database',
          version: 1,
          resumeId,
          isActive: true
        },
        tags: [],
        jobType: resumeData.personalInfo?.title || '',
        industry: '',
        experienceLevel: getExperienceLevel(resumeData)
      };
      
      // Save to Firestore
      const docRef = await db.collection('professional_resumes').add(professionalResume);
      
      // Log the action
      await db.collection('admin_actions').add({
        action: 'create_resume',
        adminId: context.auth.uid,
        adminEmail: context.auth.token.email || '',
        resumeId: docRef.id,
        clientEmail: clientInfo.email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Professional resume created by ${context.auth.token.email}: ${docRef.id}`);
      
      return { 
        success: true, 
        id: docRef.id,
        resumeId 
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resume';
      console.error('❌ Create resume error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create resume: ' + errorMessage
      );
    }
  }
);

/**
 * GET PROFESSIONAL RESUME FUNCTION (Admin only - Callable)
 */
export const getProfessionalResume = functions.https.onCall(
  async (data: { resumeId: string }, context: functions.https.CallableContext) => {
    
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in'
      );
    }
    
    // Check admin claims
    const adminClaim = context.auth.token.admin;
    if (!adminClaim) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }
    
    const { resumeId } = data;
    
    if (!resumeId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Resume ID is required'
      );
    }
    
    try {
      const db = admin.firestore();
      const docRef = db.collection('professional_resumes').doc(resumeId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Resume not found'
        );
      }
      
      const resumeData = docSnap.data();
      
      // Log the access
      await db.collection('admin_actions').add({
        action: 'get_resume',
        adminId: context.auth.uid,
        adminEmail: context.auth.token.email || '',
        resumeId: resumeId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { 
        success: true, 
        data: resumeData 
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get resume';
      console.error('❌ Get resume error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get resume: ' + errorMessage
      );
    }
  }
);

export const setAdminClaimsNow = runWithCors(async (req: any, res: any) => {
  try {
    console.log('🚨 EMERGENCY: Setting admin claims now!');
    
    // Your UID
    const uid = 'vkNBhERkSbTYHwO86tKWb5D96K72';
    
    // Get user first to verify
    const user = await admin.auth().getUser(uid);
    console.log('👤 User to update:', user.email);
    
    // Set admin claims
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      level: 'super_admin',
      email: user.email,
      canManageResumes: true,
      canPostJobs: true,
      canManageUsers: false
    });
    
    console.log('✅ Admin claims SET!');
    
    // Get updated user to verify
    const updatedUser = await admin.auth().getUser(uid);
    
    res.json({
      success: true,
      message: `🚀 ADMIN CLAIMS SET FOR: ${updatedUser.email}`,
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        claims: updatedUser.customClaims
      },
      critical: 'USER MUST LOG OUT AND LOG BACK IN NOW!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('🔥 ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});


/**
 * ADMIN LOGOUT FUNCTION
 * Logs admin logout action
 */
export const adminLogout = runWithCors(async (req: any, res: any) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ success: false, error: 'Token required' });
      return;
    }
    
    try {
      // Verify the token to get user info
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Log the logout
      await admin.firestore().collection('admin_logs').add({
        email: decodedToken.email,
        action: 'logout',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.ip || req.headers['x-forwarded-for'] as string,
        userAgent: req.headers['user-agent'] as string
      });
      
      console.log(`📝 Logged out: ${decodedToken.email}`);
    } catch (error) {
      // Don't fail if token verification fails
      console.warn('Could not verify token during logout:', error);
    }
    
    res.json({
      success: true,
      message: 'Logout action recorded'
    });
    
  } catch (error: unknown) {
    console.error('❌ Admin logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Helper function to determine experience level
function getExperienceLevel(resumeData: any): string {
  const experiences = resumeData.experiences || [];
  
  if (experiences.length === 0) return 'Fresher';
  
  let totalYears = 0;
  
  experiences.forEach((exp: any) => {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    }
  });
  
  if (totalYears < 1) return 'Fresher';
  if (totalYears < 3) return 'Junior';
  if (totalYears < 7) return 'Mid-level';
  if (totalYears < 15) return 'Senior';
  return 'Executive';
}