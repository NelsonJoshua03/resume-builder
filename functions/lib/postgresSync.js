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
exports.getSyncStatus = exports.healthCheck = exports.batchSyncCollection = exports.syncAdminLogs = exports.syncBlogEvents = exports.syncJobEvents = exports.syncResumeEvents = exports.syncEvents = exports.syncPageViews = void 0;
// functions/src/postgresSync.ts - Real-time Firebase to PostgreSQL Sync
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const pg_1 = require("pg");
const cors = __importStar(require("cors"));
// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}
// CORS middleware
const corsHandler = cors({ origin: true });
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
// Log sync operation
const logSyncOperation = async (pool, collectionName, operation, recordsProcessed, recordsSuccessful, recordsFailed, status, errorMessage) => {
    try {
        await pool.query(`INSERT INTO sync_logs  (collection_name, operation, records_processed, records_successful, records_failed, status, error_message) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [collectionName, operation, recordsProcessed, recordsSuccessful, recordsFailed, status, errorMessage]);
    }
    catch (error) {
        console.error('Failed to log sync operation:', error);
    }
};
// ================ REAL-TIME SYNC FUNCTIONS ================
/**
SYNC PAGE VIEWS - Real-time sync for page views
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
        const createdAt = firestoreTimestampToDate(data.createdAt);
        const updatedAt = firestoreTimestampToDate(data.updatedAt);
        await pool.query(`INSERT INTO page_views  (user_id, session_id, page_path, page_title, referrer, timestamp,  duration_seconds, scroll_depth, device_type, screen_resolution, user_agent, language, is_anonymous, consent_given,  data_processing_location, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (firestore_doc_id) DO UPDATE SET page_title = EXCLUDED.page_title, duration_seconds = EXCLUDED.duration_seconds, scroll_depth = EXCLUDED.scroll_depth, metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.sessionId || '',
            data.pagePath || '',
            data.pageTitle || '',
            data.referrer || '',
            timestamp || new Date(),
            data.duration || 0,
            data.scrollDepth || 0,
            data.deviceType || '',
            data.screenResolution || '',
            data.userAgent || '',
            data.language || 'en',
            data.is_anonymous || true,
            data.consentGiven || false,
            data.dataProcessingLocation || 'IN',
            safeToJson(data.metadata || {}),
            docId
        ]);
        // Update or create user
        await pool.query(`INSERT INTO users (user_id, is_anonymous, last_active, metadata) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET last_active = EXCLUDED.last_active, metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.is_anonymous || true,
            timestamp || new Date(),
            safeToJson({ last_page: data.pagePath })
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
SYNC EVENTS - Real-time sync for general events
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
        await pool.query(`INSERT INTO events  (user_id, session_id, event_name, event_category, event_label, event_value, page_path, page_title, timestamp, user_agent, screen_resolution, language, is_anonymous, consent_given, data_processing_location, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (firestore_doc_id) DO UPDATE SET event_value = EXCLUDED.event_value, metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.sessionId || '',
            data.eventName || '',
            data.eventCategory || '',
            data.eventLabel || '',
            data.eventValue || 0,
            data.pagePath || '',
            data.pageTitle || '',
            timestamp || new Date(),
            data.userAgent || '',
            data.screenResolution || '',
            data.language || 'en',
            data.is_anonymous || true,
            data.consentGiven || false,
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
SYNC RESUME EVENTS - Real-time sync for resume events
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
        await pool.query(`INSERT INTO resume_events  (user_id, session_id, template_type, format, action, timestamp, fields_count, resume_id, is_anonymous, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (firestore_doc_id) DO UPDATE SET metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.sessionId || '',
            data.templateType || '',
            data.format || 'pdf',
            data.action || '',
            timestamp || new Date(),
            safeToJson(data.fieldsCount || {}),
            data.resumeId || '',
            data.is_anonymous || true,
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
SYNC JOB EVENTS - Real-time sync for job events
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
        await pool.query(`INSERT INTO job_events  (user_id, session_id, job_id, job_title, company, action, timestamp, application_method, status, is_anonymous, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (firestore_doc_id) DO UPDATE SET status = EXCLUDED.status, metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.sessionId || '',
            data.jobId || '',
            data.jobTitle || '',
            data.company || '',
            data.action || '',
            timestamp || new Date(),
            data.applicationMethod || 'direct',
            data.status || '',
            data.is_anonymous || true,
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
SYNC BLOG EVENTS - Real-time sync for blog events
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
        await pool.query(`INSERT INTO blog_events  (user_id, session_id, post_slug, post_title, category, action, timestamp, read_duration_seconds, scroll_percentage, search_term, is_anonymous,  metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (firestore_doc_id) DO UPDATE SET read_duration_seconds = EXCLUDED.read_duration_seconds, scroll_percentage = EXCLUDED.scroll_percentage, metadata = EXCLUDED.metadata`, [
            data.userId || 'anonymous',
            data.sessionId || '',
            data.postSlug || '',
            data.postTitle || '',
            data.category || '',
            data.action || '',
            timestamp || new Date(),
            data.readDuration || 0,
            data.scrollPercentage || 0,
            data.searchTerm || '',
            data.is_anonymous || true,
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
SYNC ADMIN LOGS - Real-time sync for admin logs
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
        await pool.query(`INSERT INTO admin_logs  (admin_email, action, timestamp, ip_address, user_agent, success, error_message, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (firestore_doc_id) DO UPDATE SET error_message = EXCLUDED.error_message, metadata = EXCLUDED.metadata`, [
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
// ================ BATCH SYNC FUNCTIONS ================
/**
BATCH SYNC - Sync all historical data from Firebase to PostgreSQL
*/
exports.batchSyncCollection = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    corsHandler(req, res, async () => {
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
});
// Helper function to sync a single document
const syncDocument = async (pool, collectionName, docId, data) => {
    const timestamp = firestoreTimestampToDate(data.timestamp);
    switch (collectionName) {
        case 'pageViews':
            await pool.query(`INSERT INTO page_views  (user_id, session_id, page_path, page_title, referrer, timestamp,  duration_seconds, scroll_depth, device_type, screen_resolution, user_agent, language, is_anonymous, consent_given,  data_processing_location, metadata, firestore_doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (firestore_doc_id) DO NOTHING`, [
                data.userId || 'anonymous',
                data.sessionId || '',
                data.pagePath || '',
                data.pageTitle || '',
                data.referrer || '',
                timestamp || new Date(),
                data.duration || 0,
                data.scrollDepth || 0,
                data.deviceType || '',
                data.screenResolution || '',
                data.userAgent || '',
                data.language || 'en',
                data.is_anonymous || true,
                data.consentGiven || false,
                data.dataProcessingLocation || 'IN',
                safeToJson(data.metadata || {}),
                docId
            ]);
            break;
        case 'events':
            await pool.query(`INSERT INTO events          (user_id, session_id, event_name, event_category, event_label, event_value,          page_path, page_title, timestamp, user_agent, screen_resolution,          language, is_anonymous, consent_given, data_processing_location,          metadata, firestore_doc_id)         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)         ON CONFLICT (firestore_doc_id) DO NOTHING`, [
                data.userId || 'anonymous',
                data.sessionId || '',
                data.eventName || '',
                data.eventCategory || '',
                data.eventLabel || '',
                data.eventValue || 0,
                data.pagePath || '',
                data.pageTitle || '',
                timestamp || new Date(),
                data.userAgent || '',
                data.screenResolution || '',
                data.language || 'en',
                data.is_anonymous || true,
                data.consentGiven || false,
                data.dataProcessingLocation || 'IN',
                safeToJson(data.metadata || {}),
                docId
            ]);
            break;
        // Add cases for other collections...
    }
};
// ================ HEALTH CHECK FUNCTIONS ================
/**
HEALTH CHECK - Test PostgreSQL connection
*/
exports.healthCheck = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        try {
            const pool = initializePostgresPool();
            // Test PostgreSQL connection
            const pgResult = await pool.query('SELECT NOW() as time, version() as version');
            // Test Firebase connection
            const db = admin.firestore();
            const firebaseResult = await db.collection('pageViews').limit(1).get();
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                postgresql: {
                    connected: true,
                    time: pgResult.rows[0].time,
                    version: pgResult.rows[0].version
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
                        'admin_logs'
                    ]
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
});
/**
GET SYNC STATUS - Check sync status and statistics
*/
exports.getSyncStatus = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        try {
            const pool = initializePostgresPool();
            // Get sync statistics
            const statsResult = await pool.query(`SELECT  collection_name, operation, COUNT(*) as total_operations, SUM(records_processed) as total_records_processed, SUM(records_successful) as total_records_successful, SUM(records_failed) as total_records_failed, MAX(start_time) as last_sync_time FROM sync_logs WHERE start_time > NOW() - INTERVAL '7 days' GROUP BY collection_name, operation ORDER BY collection_name, operation`);
            // Get recent errors
            const errorsResult = await pool.query(`SELECT  collection_name, operation, error_message, start_time FROM sync_logs WHERE status = 'failed' AND start_time > NOW() - INTERVAL '1 day' ORDER BY start_time DESC LIMIT 10`);
            // Get data volumes
            const volumesResult = await pool.query(`SELECT  'page_views' as table_name, COUNT(*) as row_count, MAX(timestamp) as latest_record FROM page_views UNION ALL SELECT  'events' as table_name, COUNT(*) as row_count, MAX(timestamp) as latest_record FROM events UNION ALL SELECT  'resume_events' as table_name, COUNT(*) as row_count, MAX(timestamp) as latest_record FROM resume_events UNION ALL SELECT  'job_events' as table_name, COUNT(*) as row_count, MAX(timestamp) as latest_record FROM job_events UNION ALL SELECT  'blog_events' as table_name, COUNT(*) as row_count, MAX(timestamp) as latest_record FROM blog_events`);
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
});
//# sourceMappingURL=postgresSync.js.map