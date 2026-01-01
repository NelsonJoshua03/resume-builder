// src/App.tsx - ONLY ROUTE CHANGES
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ResumeProvider } from './components/ResumeContext';
import Layout from "./components/Layout";
import ResumeBuilder from "./components/ResumeBuilder";
import SEOOptimizedResumeBuilder from "./components/SEOOptimizedResumeBuilder";
import HomePage from "./components/HomePage";
import JobDisciplines from "./components/JobDisciplines";
import JobApplications from "./components/JobApplications";
import About from "./components/About";
import Privacy from "./components/Privacy";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import MechanicalEngineering from "./components/job-pages/MechanicalEngineering";
import StaticEngineer from "./components/job-pages/StaticEngineer";
import CivilEngineering from "./components/job-pages/CivilEngineering";
import ElectricalEngineering from "./components/job-pages/ElectricalEngineering";
import SoftwareDevelopment from "./components/job-pages/SoftwareDevelopment";
import DataScience from "./components/job-pages/DataScience";
import Cybersecurity from "./components/job-pages/Cybersecurity";
import AdminJobPosting from "./components/AdminJobPosting";
import FreshGraduateGuide from './components/FreshGraduateGuide';
import TermsOfService from "./components/TermsOfService";
import CookiePolicy from "./components/CookiePolicy";
import Contact from "./components/Contact";
import JobDrives from './components/JobDrives'; // KEEP OLD COMPONENT
import AdminJobDrives from './components/AdminJobDrives';
import GoogleAnalytics from './components/GoogleAnalytics';
import GovernmentExams from "./components/GovernmentExams";
import AdminGovernmentExams from "./components/AdminGovernmentExams";
import EditResumePage from './components/EditResumePage';
import LatestJobUpdatesIndia from "./components/LatestJobUpdatesIndia";

// Analytics Dashboard Components (Admin only)
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LocalAnalyticsDashboard from './components/LocalAnalyticsDashboard';
import DailyAnalyticsDashboard from './components/DailyAnalyticsDashboard';
import ComprehensiveAnalyticsDashboard from './components/ComprehensiveAnalyticsDashboard';
import FirebaseAnalyticsDashboardComponent from './components/FirebaseAnalyticsDashboardComponent';

// Professional Resume Admin Components
import AdminDashboard from './/components/AdminDashboard';
import ProfessionalResumeDashboard from './components/ProfessionalResumeDashboard';

// Auth Components
import AdminLogin from './components/AdminLogin';
import AdminProtectedRoute from './components/AdminProtectedRoute';

import './styles/blog.css';
// Import PDF styles globally
import './components/PDFStyles.css';

// Initialize Firebase
import { initializeFirebase } from './firebase/config';
import { firebaseSyncService } from './firebase/syncService';
import { anonymousTracking } from './firebase/anonymousTracking';
import { useEffect } from 'react';
import { isAdmin } from './utils/adminAuth';

function App() {
  // Initialize Firebase on app start (no consent required)
  useEffect(() => {
    try {
      initializeFirebase();
      
      // Initialize anonymous tracking for ALL users
      anonymousTracking.initialize();
      
      // Try to sync any pending events after 2 seconds
      setTimeout(() => {
        firebaseSyncService.checkAndSync();
      }, 2000);
      
      // Check for admin mode in URL
      const urlParams = new URLSearchParams(window.location.search);
      const adminMode = urlParams.get('adminMode');
      
      if (adminMode === 'true') {
        console.log('🔐 Admin mode detected in URL');
      }
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  return (
    <HelmetProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <ResumeProvider>
          <GoogleAnalytics />
          <Layout>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/latest-job-updates-india" element={<LatestJobUpdatesIndia />} />
              <Route path="/builder" element={<ResumeBuilder />} /> {/* Keep for backward compatibility */}
              <Route path="/job-disciplines" element={<JobDisciplines />} />
              {/* UPDATED: Changed from /job-applications to /latest-jobs-for-freshers-india for better SEO */}
              <Route path="/latest-jobs-for-freshers-india" element={<JobApplications />} />
              {/* Keep old route for redirect purposes */}
              <Route path="/job-applications" element={<Navigate to="/latest-jobs-for-freshers-india" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/edit" element={<EditResumePage />} />

              {/* NEW SEO-OPTIMIZED ROUTE - SAME OLD COMPONENT */}
              <Route path="/latest-walk-in-drives-india" element={<JobDrives />} />
              {/* Keep old route for redirect purposes */}
              <Route path="/job-drives" element={<Navigate to="/latest-walk-in-drives-india" replace />} />

              {/* SEO-Optimized Resume Builder Routes */}
              <Route path="/free-resume-builder" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/ats-resume-builder" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/online-resume-maker" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/cv-maker-online" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/professional-resume-builder" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/resume-builder-for-freshers" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/resume-builder-for-engineers" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/resume-builder-for-it-jobs" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/resume-builder-for-developers" element={<SEOOptimizedResumeBuilder />} />
              <Route path="/create-resume-online" element={<SEOOptimizedResumeBuilder />} />

              {/* Admin Login Page */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Professional Resume Admin Dashboard */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              {/* Professional Resume Management */}
              <Route 
                path="/admin/professional-resumes" 
                element={
                  <AdminProtectedRoute>
                    <ProfessionalResumeDashboard />
                  </AdminProtectedRoute>
                } 
              />

              {/* Analytics & Admin Dashboards (Admin only) */}
              <Route 
                path="/admin/analytics" 
                element={
                  <AdminProtectedRoute>
                    <AnalyticsDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/daily-analytics" 
                element={
                  <AdminProtectedRoute>
                    <DailyAnalyticsDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/local-analytics" 
                element={
                  <AdminProtectedRoute>
                    <LocalAnalyticsDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/comprehensive-analytics" 
                element={
                  <AdminProtectedRoute>
                    <ComprehensiveAnalyticsDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/firebase-analytics" 
                element={
                  <AdminProtectedRoute>
                    <FirebaseAnalyticsDashboardComponent />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/job-posting" 
                element={
                  <AdminProtectedRoute>
                    <AdminJobPosting />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/job-drives" 
                element={
                  <AdminProtectedRoute>
                    <AdminJobDrives />
                  </AdminProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/government-exams" 
                element={
                  <AdminProtectedRoute>
                    <AdminGovernmentExams />
                  </AdminProtectedRoute>
                } 
              />

              {/* Job Discipline Pages - Engineering */}
              <Route path="/job-disciplines/engineering" element={<JobDisciplines />} />
              <Route path="/job-disciplines/mechanical-engineering" element={<MechanicalEngineering />} />
              <Route path="/job-disciplines/static-engineer" element={<StaticEngineer />} />
              <Route path="/job-disciplines/civil-engineering" element={<CivilEngineering />} />
              <Route path="/job-disciplines/electrical-engineering" element={<ElectricalEngineering />} />

              {/* Job Discipline Pages - Technology */}
              <Route path="/job-disciplines/software-development" element={<SoftwareDevelopment />} />
              <Route path="/job-disciplines/data-science" element={<DataScience />} />
              <Route path="/job-disciplines/cybersecurity" element={<Cybersecurity />} />

              {/* Career Resources */}
              <Route path="/fresh-graduate-guide" element={<FreshGraduateGuide />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/government-exams" element={<GovernmentExams />} />

              {/* Quick Admin Access - Redirects */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin-mode" element={<Navigate to="/edit?adminMode=true" replace />} />
              <Route path="/create-client-resume" element={<Navigate to="/edit?adminMode=true" replace />} />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
        </ResumeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;