// src/App.tsx - UPDATED WITH ALL SEPARATE PAGES
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ResumeProvider } from './components/ResumeContext';
import Layout from "./components/Layout";
import ResumeBuilder from "./components/ResumeBuilder";
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
import JobDrives from './components/JobDrives';
import AdminJobDrives from './components/AdminJobDrives';
import GoogleAnalytics from './components/GoogleAnalytics';
import GovernmentExams from "./components/GovernmentExams";
import AdminGovernmentExams from "./components/AdminGovernmentExams";
import EditResumePage from './components/EditResumePage';

// SEO Pages
import FreeResumeBuilderPage from './components/seo-pages/FreeResumeBuilderPage';
import ATSResumeBuilderPage from './components/seo-pages/ATSResumeBuilderPage';
import OnlineResumeMakerPage from './components/seo-pages/OnlineResumeMakerPage';
import CVMakerOnlinePage from './components/seo-pages/CVMakerOnlinePage';
import ProfessionalResumeBuilderPage from './components/seo-pages/ProfessionalResumeBuilderPage';
import ResumeBuilderForFreshersPage from './components/seo-pages/ResumeBuilderForFreshersPage';
import ResumeBuilderForEngineersPage from './components/seo-pages/ResumeBuilderForEngineersPage';
import ResumeBuilderForITJobsPage from './components/seo-pages/ResumeBuilderForITJobsPage';
import ResumeBuilderForDevelopersPage from './components/seo-pages/ResumeBuilderForDevelopersPage';
import CreateResumeOnlinePage from './components/seo-pages/CreateResumeOnlinePage';

// Analytics Dashboard Components (Admin only)
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LocalAnalyticsDashboard from './components/LocalAnalyticsDashboard';
import DailyAnalyticsDashboard from './components/DailyAnalyticsDashboard';
import ComprehensiveAnalyticsDashboard from './components/ComprehensiveAnalyticsDashboard';
import FirebaseAnalyticsDashboardComponent from './components/FirebaseAnalyticsDashboardComponent';

// Professional Resume Admin Components
import AdminDashboard from './components/AdminDashboard';
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
              <Route path="/latest-job-updates-india" element={<JobApplications />} />
              <Route path="/builder" element={<Navigate to="/free-resume-builder" replace />} /> {/* Redirect old builder */}
              <Route path="/job-disciplines" element={<JobDisciplines />} />
              <Route path="/latest-jobs-for-freshers-india" element={<Navigate to="/latest-job-updates-india" replace />} />
              <Route path="/job-applications" element={<Navigate to="/latest-job-updates-india" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/edit" element={<EditResumePage />} />
              <Route path="/latest-walk-in-drives-india" element={<JobDrives />} />
              <Route path="/job-drives" element={<Navigate to="/latest-walk-in-drives-india" replace />} />

              {/* SEO-Optimized Resume Builder Pages (Separate Components) */}
              <Route path="/free-resume-builder" element={<FreeResumeBuilderPage />} />
              <Route path="/ats-resume-builder" element={<ATSResumeBuilderPage />} />
              <Route path="/online-resume-maker" element={<OnlineResumeMakerPage />} />
              <Route path="/cv-maker-online" element={<CVMakerOnlinePage />} />
              <Route path="/professional-resume-builder" element={<ProfessionalResumeBuilderPage />} />
              <Route path="/resume-builder-for-freshers" element={<ResumeBuilderForFreshersPage />} />
              <Route path="/resume-builder-for-engineers" element={<ResumeBuilderForEngineersPage />} />
              <Route path="/resume-builder-for-it-jobs" element={<ResumeBuilderForITJobsPage />} />
              <Route path="/resume-builder-for-developers" element={<ResumeBuilderForDevelopersPage />} />
              <Route path="/create-resume-online" element={<CreateResumeOnlinePage />} />

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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ResumeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;