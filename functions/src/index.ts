// functions/src/index.ts - FIXED VERSION
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
// Try to get config, fallback to hardcoded for testing
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
  const fallbackEmails = process.env.ADMIN_EMAILS || 'nelsonjoshua03@outlook.com,contact@careercraft.in';
  const fallbackPassword = process.env.ADMIN_PASSWORD || 't9nb5qrfha@N';
  
  ADMIN_PASSWORD = fallbackPassword;
  ADMIN_EMAILS = fallbackEmails
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0);
    
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
export const adminLogin = runWithCors(async (req: any, res: any) => {
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
    } catch (error: any) {
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
      } else {
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
      ip: req.ip || req.headers['x-forwarded-for'] as string,
      userAgent: req.headers['user-agent'] as string,
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('❌ Admin login error:', error);
    
    // Log failed login attempt
    try {
      await admin.firestore().collection('admin_logs').add({
        email: req.body?.email || 'unknown',
        action: 'login',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.ip || req.headers['x-forwarded-for'] as string,
        userAgent: req.headers['user-agent'] as string,
        success: false,
        error: errorMessage
      });
    } catch (logError) {
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
    
    const results: any[] = [];
    
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
        
      } catch (error: any) {
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
      note: 'Users can now login via the frontend using Firebase Authentication'
    });
    
  } catch (error: unknown) {
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