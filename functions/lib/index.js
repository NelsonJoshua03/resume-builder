"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogout = exports.getProfessionalResume = exports.createProfessionalResume = exports.setupAdminUsers = exports.adminCheck = exports.adminLogin = exports.ping = exports.debugConfig = exports.validateSync = exports.getSyncStatus = exports.healthCheck = exports.batchSyncCollection = exports.syncAdminLogs = exports.syncFunnelEvents = exports.syncBlogEvents = exports.syncJobEvents = exports.syncResumeEvents = exports.syncEvents = exports.syncPageViews = void 0;
// functions/src/index.ts - FIXED VERSION WITH PROPER POSTGRES SYNC
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors = require("cors");
// Initialize Firebase Admin
try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized successfully');
}
catch (error) {
    console.log('ℹ️ Firebase admin already initialized');
}
// 🔐 ADMIN CREDENTIALS - from Firebase Functions Config
// Try to get config, fallback to hardcoded for testing
let ADMIN_PASSWORD = '';
let ADMIN_EMAILS = [];
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
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);
    console.log('🔧 Config values:', {
        passwordLength: ADMIN_PASSWORD.length,
        emails: ADMIN_EMAILS,
        emailsCount: ADMIN_EMAILS.length
    });
}
catch (configError) {
    console.error('❌ Error loading config:', configError);
    // Fallback to environment variables or hardcoded values
    const fallbackEmails = process.env.ADMIN_EMAILS || 'nelsonjoshua03@outlook.com,contact@careercraft.in';
    const fallbackPassword = process.env.ADMIN_PASSWORD || 't9nb5qrfha@N';
    ADMIN_PASSWORD = fallbackPassword;
    ADMIN_EMAILS = fallbackEmails
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);
    console.log('⚠️ Using fallback config:', {
        emails: ADMIN_EMAILS,
        emailsCount: ADMIN_EMAILS.length
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
const runWithCors = (handler) => functions.https.onRequest((req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            await handler(req, res);
        }
        catch (error) {
            console.error('Handler error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    });
});
// ================ POSTGRESQL SYNC FUNCTIONS ================
const pg_1 = require("pg");
// Get PostgreSQL configuration from Firebase Functions Config
const getPostgresConfig = () => {
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
let pgPool = null;
const initializePostgresPool = () => {
    if (!pgPool) {
        const config = getPostgresConfig();
        console.log('🔌 Initializing PostgreSQL connection pool...');
        const poolConfig = {
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
        };
        if (config.ssl) {
            poolConfig.ssl = {
                rejectUnauthorized: false,
            };
        }
        pgPool = new pg_1.Pool(poolConfig);
        // Test connection
        pgPool.query('SELECT NOW()')
            .then(() => console.log('✅ PostgreSQL connection established'))
            .catch((err) => console.error('❌ PostgreSQL connection failed:', err.message));
    }
    return pgPool;
};
// Helper function to convert Firestore timestamp to PostgreSQL timestamp
const firestoreTimestampToDate = (timestamp) => {
    if (!timestamp)
        return null;
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
const safeToJson = (data) => {
    try {
        if (typeof data === 'object' && data !== null) {
            return JSON.parse(JSON.stringify(data));
        }
        return data;
    }
    catch (error) {
        console.warn('Failed to convert data to JSON:', error);
        return {};
    }
};
// Helper to detect device type from user agent
const getDeviceTypeFromUserAgent = (userAgent) => {
    if (!userAgent)
        return 'desktop';
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
        return 'mobile';
    }
    else if (/tablet|ipad/.test(ua)) {
        return 'tablet';
    }
    return 'desktop';
};
// Helper to extract screen resolution from metadata or use default
const getScreenResolution = (data) => {
    if (data.screenResolution)
        return data.screenResolution;
    if (data.metadata?.screen_resolution)
        return data.metadata.screen_resolution;
    if (data.metadata?.screen_width && data.metadata?.screen_height) {
        return `${data.metadata.screen_width}x${data.metadata.screen_height}`;
    }
    return 'unknown';
};
// Log sync operation
const logSyncOperation = async (pool, collectionName, operation, recordsProcessed, recordsSuccessful, recordsFailed, status, errorMessage) => {
    try {
        await pool.query(`INSERT INTO sync_logs 
       (collection_name, operation, records_processed, records_successful, records_failed, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [collectionName, operation, recordsProcessed, recordsSuccessful, recordsFailed, status, errorMessage]);
    }
    catch (error) {
        console.error('Failed to log sync operation:', error);
    }
};
// ================ REAL-TIME SYNC TRIGGERS ================
/**
 * SYNC PAGE VIEWS - Real-time sync for page views
 */
exports.syncPageViews = functions.firestore
    .document('pageViews/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing page view: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        // ✅ FIXED: Match frontend field names with proper defaults
        await pool.query(`INSERT INTO page_views 
         (user_id, session_id, page_path, page_title, referrer, timestamp, 
          duration_seconds, scroll_depth, device_type, screen_resolution,
          user_agent, language, is_anonymous, consent_given, 
          data_processing_location, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           page_title = EXCLUDED.page_title,
           duration_seconds = EXCLUDED.duration_seconds,
           scroll_depth = EXCLUDED.scroll_depth,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        // Update or create user
        await pool.query(`INSERT INTO users (user_id, is_anonymous, last_active, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           last_active = EXCLUDED.last_active,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'pageViews', 'create', 1, 1, 0, 'success');
        console.log(`✅ Page view synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync page view ${docId}:`, error.message);
        await logSyncOperation(pool, 'pageViews', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC EVENTS - Real-time sync for general events
 */
exports.syncEvents = functions.firestore
    .document('events/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing event: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        // ✅ FIXED: Match frontend field names and handle missing fields
        await pool.query(`INSERT INTO events 
         (user_id, session_id, event_name, event_category, event_label, event_value,
          page_path, page_title, timestamp, user_agent, screen_resolution,
          language, is_anonymous, consent_given, data_processing_location,
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           event_value = EXCLUDED.event_value,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'events', 'create', 1, 1, 0, 'success');
        console.log(`✅ Event synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync event ${docId}:`, error.message);
        await logSyncOperation(pool, 'events', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC RESUME EVENTS - Real-time sync for resume events
 */
exports.syncResumeEvents = functions.firestore
    .document('resumeEvents/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing resume event: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        // ✅ FIXED: Match frontend field names
        await pool.query(`INSERT INTO resume_events 
         (user_id, session_id, template_type, format, action, timestamp,
          fields_count, resume_id, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'resumeEvents', 'create', 1, 1, 0, 'success');
        console.log(`✅ Resume event synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync resume event ${docId}:`, error.message);
        await logSyncOperation(pool, 'resumeEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC JOB EVENTS - Real-time sync for job events
 */
exports.syncJobEvents = functions.firestore
    .document('jobEvents/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing job event: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        // ✅ FIXED: Match frontend field names
        await pool.query(`INSERT INTO job_events 
         (user_id, session_id, job_id, job_title, company, action, timestamp,
          application_method, status, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           status = EXCLUDED.status,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'jobEvents', 'create', 1, 1, 0, 'success');
        console.log(`✅ Job event synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync job event ${docId}:`, error.message);
        await logSyncOperation(pool, 'jobEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC BLOG EVENTS - Real-time sync for blog events
 */
exports.syncBlogEvents = functions.firestore
    .document('blogEvents/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing blog event: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        // ✅ FIXED: Match frontend field names
        await pool.query(`INSERT INTO blog_events 
         (user_id, session_id, post_slug, post_title, category, action, timestamp,
          read_duration_seconds, scroll_percentage, search_term, is_anonymous, 
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           read_duration_seconds = EXCLUDED.read_duration_seconds,
           scroll_percentage = EXCLUDED.scroll_percentage,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'blogEvents', 'create', 1, 1, 0, 'success');
        console.log(`✅ Blog event synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync blog event ${docId}:`, error.message);
        await logSyncOperation(pool, 'blogEvents', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC FUNNEL EVENTS - Real-time sync for funnel events
 */
exports.syncFunnelEvents = functions.firestore
    .document('funnels/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing funnel event: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        await pool.query(`INSERT INTO funnel_events 
         (user_id, session_id, funnel_name, step_name, step_number, timestamp,
          time_to_step_seconds, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           time_to_step_seconds = EXCLUDED.time_to_step_seconds,
           metadata = EXCLUDED.metadata`, [
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
        ]);
        await logSyncOperation(pool, 'funnels', 'create', 1, 1, 0, 'success');
        console.log(`✅ Funnel event synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync funnel event ${docId}:`, error.message);
        await logSyncOperation(pool, 'funnels', 'create', 1, 0, 1, 'failed', error.message);
    }
});
/**
 * SYNC ADMIN LOGS - Real-time sync for admin logs
 */
exports.syncAdminLogs = functions.firestore
    .document('admin_logs/{docId}')
    .onCreate(async (snap, context) => {
    const pool = initializePostgresPool();
    const docId = snap.id;
    const data = snap.data();
    console.log(`🔄 Syncing admin log: ${docId}`);
    try {
        const timestamp = firestoreTimestampToDate(data.timestamp);
        await pool.query(`INSERT INTO admin_logs 
         (admin_email, action, timestamp, ip_address, user_agent,
          success, error_message, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (firestore_doc_id) DO UPDATE SET
           error_message = EXCLUDED.error_message,
           metadata = EXCLUDED.metadata`, [
            data.email || '',
            data.action || '',
            timestamp || new Date(),
            data.ip || '',
            data.userAgent || '',
            data.success !== false,
            data.error || '',
            safeToJson({ originalData: data }),
            docId
        ]);
        await logSyncOperation(pool, 'admin_logs', 'create', 1, 1, 0, 'success');
        console.log(`✅ Admin log synced: ${docId}`);
    }
    catch (error) {
        console.error(`❌ Failed to sync admin log ${docId}:`, error.message);
        await logSyncOperation(pool, 'admin_logs', 'create', 1, 0, 1, 'failed', error.message);
    }
});
// ================ HELPER SYNC FUNCTIONS ================
// Helper function to sync a single document - FIXED VERSION
const syncDocument = async (pool, collectionName, docId, data) => {
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
            await pool.query(`INSERT INTO page_views 
         (user_id, session_id, page_path, page_title, referrer, timestamp, 
          duration_seconds, scroll_depth, device_type, screen_resolution,
          user_agent, language, is_anonymous, consent_given, 
          data_processing_location, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'events':
            await pool.query(`INSERT INTO events 
         (user_id, session_id, event_name, event_category, event_label, event_value,
          page_path, page_title, timestamp, user_agent, screen_resolution,
          language, is_anonymous, consent_given, data_processing_location,
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'resumeEvents':
            await pool.query(`INSERT INTO resume_events 
         (user_id, session_id, template_type, format, action, timestamp,
          fields_count, resume_id, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'jobEvents':
            await pool.query(`INSERT INTO job_events 
         (user_id, session_id, job_id, job_title, company, action, timestamp,
          application_method, status, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'blogEvents':
            await pool.query(`INSERT INTO blog_events 
         (user_id, session_id, post_slug, post_title, category, action, timestamp,
          read_duration_seconds, scroll_percentage, search_term, is_anonymous, 
          metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'funnels':
            await pool.query(`INSERT INTO funnel_events 
         (user_id, session_id, funnel_name, step_name, step_number, timestamp,
          time_to_step_seconds, is_anonymous, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
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
            ]);
            break;
        case 'admin_logs':
            await pool.query(`INSERT INTO admin_logs 
         (admin_email, action, timestamp, ip_address, user_agent,
          success, error_message, metadata, firestore_doc_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
                data.email || '',
                data.action || '',
                timestamp || new Date(),
                data.ip || '',
                data.userAgent || '',
                data.success !== false,
                data.error || '',
                safeToJson({ originalData: data }),
                docId
            ]);
            break;
    }
};
// ================ HTTP SYNC ENDPOINTS ================
/**
 * BATCH SYNC - Sync all historical data from Firebase to PostgreSQL
 */
exports.batchSyncCollection = runWithCors(async (req, res) => {
    try {
        const { collectionName, limit = 1000 } = req.body;
        if (!collectionName) {
            res.status(400).json({ success: false, error: 'collectionName is required' });
            return;
        }
        const pool = initializePostgresPool();
        const db = admin.firestore();
        console.log(`🔄 Starting batch sync for collection: ${collectionName}`);
        // Get all documents from the collection
        const snapshot = await db.collection(collectionName)
            .limit(limit)
            .get();
        let successCount = 0;
        let errorCount = 0;
        // Process each document
        for (const doc of snapshot.docs) {
            try {
                await syncDocument(pool, collectionName, doc.id, doc.data());
                successCount++;
            }
            catch (error) {
                errorCount++;
                console.error(`Failed to sync document ${doc.id}:`, error);
            }
        }
        await logSyncOperation(pool, collectionName, 'batch_sync', snapshot.size, successCount, errorCount, 'completed');
        res.json({
            success: true,
            message: `Batch sync completed for ${collectionName}`,
            stats: {
                total: snapshot.size,
                successful: successCount,
                failed: errorCount
            }
        });
    }
    catch (error) {
        console.error('Batch sync failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * HEALTH CHECK - Test PostgreSQL and Firebase connections
 */
exports.healthCheck = runWithCors(async (req, res) => {
    try {
        const pool = initializePostgresPool();
        // Test PostgreSQL connection
        const pgResult = await pool.query('SELECT NOW() as time, version() as version');
        // Test Firebase connection
        const db = admin.firestore();
        const firebaseResult = await db.collection('pageViews').limit(1).get();
        // Get sync statistics
        const syncStats = await pool.query(`
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
        // Get data counts
        const pageViewsCount = await pool.query('SELECT COUNT(*) as count FROM page_views');
        const eventsCount = await pool.query('SELECT COUNT(*) as count FROM events');
        const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
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
                    users: usersCount.rows[0].count
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
                    'admin_logs'
                ],
                recentOperations: syncStats.rows
            }
        });
    }
    catch (error) {
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
exports.getSyncStatus = runWithCors(async (req, res) => {
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
    `);
        res.json({
            success: true,
            syncStats: statsResult.rows,
            recentErrors: errorsResult.rows,
            dataVolumes: volumesResult.rows,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
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
exports.validateSync = runWithCors(async (req, res) => {
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
    }
    catch (error) {
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
exports.debugConfig = runWithCors(async (req, res) => {
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
exports.ping = runWithCors(async (req, res) => {
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
exports.adminLogin = runWithCors(async (req, res) => {
    try {
        // Log config status at runtime
        console.log('🔧 Runtime Config Status:', {
            hasPassword: !!ADMIN_PASSWORD,
            passwordLength: ADMIN_PASSWORD.length,
            emails: ADMIN_EMAILS,
            emailsCount: ADMIN_EMAILS.length
        });
        if (ADMIN_EMAILS.length === 0) {
            console.error('⚠️ WARNING: No admin emails configured in Firebase Config');
            res.status(500).json({
                success: false,
                error: 'Server configuration error: No admin emails configured'
            });
            return;
        }
        const { password, email } = req.body;
        console.log('🔐 Admin login attempt for:', email);
        // Input validation
        if (!password || !email) {
            res.status(400).json({
                success: false,
                error: 'Email and password required'
            });
            return;
        }
        // Check if email is allowed
        const normalizedEmail = email.toLowerCase().trim();
        if (!ADMIN_EMAILS.includes(normalizedEmail)) {
            console.log(`❌ Email ${normalizedEmail} not in allowed list`);
            console.log(`   Allowed emails: ${ADMIN_EMAILS.join(', ')}`);
            res.status(403).json({
                success: false,
                error: `Email not authorized for admin access. Allowed: ${ADMIN_EMAILS.join(', ')}`
            });
            return;
        }
        // Check password
        if (password !== ADMIN_PASSWORD) {
            console.log('❌ Invalid password attempt');
            res.status(403).json({
                success: false,
                error: 'Invalid admin password'
            });
            return;
        }
        // Get or create admin user
        let adminUser;
        try {
            adminUser = await admin.auth().getUserByEmail(normalizedEmail);
            console.log('✅ Found existing admin user:', adminUser.uid);
        }
        catch (error) {
            // Create admin user if doesn't exist
            if (error.code === 'auth/user-not-found') {
                console.log('🆕 Creating new admin user for:', normalizedEmail);
                // Use the provided password for the new user
                adminUser = await admin.auth().createUser({
                    email: normalizedEmail,
                    emailVerified: true,
                    password: password, // Use the provided password
                    displayName: 'Admin User',
                    disabled: false,
                });
                console.log('✅ Created new admin user:', adminUser.uid);
            }
            else {
                throw error;
            }
        }
        // Set custom claims (admin role)
        await admin.auth().setCustomUserClaims(adminUser.uid, {
            admin: true,
            level: 'super_admin',
            email: normalizedEmail,
            canManageResumes: true,
            canPostJobs: true,
            canManageUsers: false
        });
        console.log('✅ Admin claims set for:', normalizedEmail);
        // Log the login
        await admin.firestore().collection('admin_logs').add({
            email: normalizedEmail,
            action: 'login',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent'],
            success: true
        });
        // Return success with user info (NO TOKEN NEEDED)
        res.json({
            success: true,
            user: {
                uid: adminUser.uid,
                email: adminUser.email,
                admin: true,
                claims: { admin: true }
            },
            message: 'Admin login successful. You can now sign in with Firebase Authentication.',
            instructions: 'Use Firebase Authentication on frontend with same email/password',
            frontendAuthMethod: 'signInWithEmailAndPassword',
            note: 'The user has been created/updated in Firebase Auth with admin claims'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error('❌ Admin login error:', error);
        // Log failed login attempt
        try {
            await admin.firestore().collection('admin_logs').add({
                email: req.body?.email || 'unknown',
                action: 'login',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                ip: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent'],
                success: false,
                error: errorMessage
            });
        }
        catch (logError) {
            console.error('Failed to log login error:', logError);
        }
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});
/**
 * CHECK ADMIN STATUS FUNCTION
 * Verifies if a token is valid and has admin claims
 */
exports.adminCheck = runWithCors(async (req, res) => {
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
        }
        catch (error) {
            // Token is invalid
            res.json({
                success: true,
                isAdmin: false,
                valid: false,
                error: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
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
exports.setupAdminUsers = runWithCors(async (req, res) => {
    try {
        console.log('⚙️ Setting up admin users...');
        const results = [];
        for (const email of ADMIN_EMAILS) {
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
            }
            catch (error) {
                // Create new user if doesn't exist
                if (error.code === 'auth/user-not-found') {
                    const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
                    const newUser = await admin.auth().createUser({
                        email: email,
                        emailVerified: true,
                        password: randomPassword,
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
                        note: 'User created with random password. Use adminLogin endpoint.'
                    });
                    console.log(`✅ Created admin user: ${email} (${newUser.uid})`);
                }
                else {
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
            note: 'Users can now login via the frontend using Firebase Authentication'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error('❌ Setup error:', error);
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});
/**
 * CREATE PROFESSIONAL RESUME FUNCTION (Admin only - Callable)
 */
exports.createProfessionalResume = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
    }
    // Check admin claims
    const adminClaim = context.auth.token.admin;
    if (!adminClaim) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { resumeData, clientInfo } = data;
    if (!resumeData || !clientInfo || !clientInfo.email) {
        throw new functions.https.HttpsError('invalid-argument', 'Resume data and client email are required');
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create resume';
        console.error('❌ Create resume error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create resume: ' + errorMessage);
    }
});
/**
 * GET PROFESSIONAL RESUME FUNCTION (Admin only - Callable)
 */
exports.getProfessionalResume = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
    }
    // Check admin claims
    const adminClaim = context.auth.token.admin;
    if (!adminClaim) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { resumeId } = data;
    if (!resumeId) {
        throw new functions.https.HttpsError('invalid-argument', 'Resume ID is required');
    }
    try {
        const db = admin.firestore();
        const docRef = db.collection('professional_resumes').doc(resumeId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Resume not found');
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get resume';
        console.error('❌ Get resume error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get resume: ' + errorMessage);
    }
});
/**
 * ADMIN LOGOUT FUNCTION
 * Logs admin logout action
 */
exports.adminLogout = runWithCors(async (req, res) => {
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
                ip: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent']
            });
            console.log(`📝 Logged out: ${decodedToken.email}`);
        }
        catch (error) {
            // Don't fail if token verification fails
            console.warn('Could not verify token during logout:', error);
        }
        res.json({
            success: true,
            message: 'Logout action recorded'
        });
    }
    catch (error) {
        console.error('❌ Admin logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Helper function to determine experience level
function getExperienceLevel(resumeData) {
    const experiences = resumeData.experiences || [];
    if (experiences.length === 0)
        return 'Fresher';
    let totalYears = 0;
    experiences.forEach((exp) => {
        if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
            totalYears += years;
        }
    });
    if (totalYears < 1)
        return 'Fresher';
    if (totalYears < 3)
        return 'Junior';
    if (totalYears < 7)
        return 'Mid-level';
    if (totalYears < 15)
        return 'Senior';
    return 'Executive';
}
//# sourceMappingURL=index.js.map