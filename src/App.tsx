// src/App.tsx - UPDATED WITH LAZY LOADING AND JOB DRIVE DETAIL ROUTES
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ResumeProvider } from './components/ResumeContext';
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import About from "./components/About";
import Privacy from "./components/Privacy";
import TermsOfService from "./components/TermsOfService";
import CookiePolicy from "./components/CookiePolicy";
import Contact from "./components/Contact";
import GoogleAnalytics from './components/GoogleAnalytics';

// Lazy load heavy components
import { lazy, Suspense, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy components
const ResumeBuilder = lazy(() => import("./components/ResumeBuilder"));
const JobDisciplines = lazy(() => import("./components/JobDisciplines"));
const JobApplications = lazy(() => import("./components/JobApplications"));
const Blog = lazy(() => import("./components/Blog"));
const BlogPost = lazy(() => import("./components/BlogPost"));
const MechanicalEngineering = lazy(() => import("./components/job-pages/MechanicalEngineering"));
const StaticEngineer = lazy(() => import("./components/job-pages/StaticEngineer"));
const CivilEngineering = lazy(() => import("./components/job-pages/CivilEngineering"));
const ElectricalEngineering = lazy(() => import("./components/job-pages/ElectricalEngineering"));
const SoftwareDevelopment = lazy(() => import("./components/job-pages/SoftwareDevelopment"));
const DataScience = lazy(() => import("./components/job-pages/DataScience"));
const Cybersecurity = lazy(() => import("./components/job-pages/Cybersecurity"));
const AdminJobPosting = lazy(() => import("./components/AdminJobPosting"));
const FreshGraduateGuide = lazy(() => import('./components/FreshGraduateGuide'));
const JobDrives = lazy(() => import('./components/JobDrives'));
const AdminJobDrives = lazy(() => import('./components/AdminJobDrives'));
const GovernmentExams = lazy(() => import("./components/GovernmentExams"));
const AdminGovernmentExams = lazy(() => import("./components/AdminGovernmentExams"));
const EditResumePage = lazy(() => import('./components/EditResumePage'));
const JobDetails = lazy(() => import("./components/JobDetails"));

// SEO Pages (lazy load)
const FreeResumeBuilderPage = lazy(() => import('./components/seo-pages/FreeResumeBuilderPage'));
const ATSResumeBuilderPage = lazy(() => import('./components/seo-pages/ATSResumeBuilderPage'));
const OnlineResumeMakerPage = lazy(() => import('./components/seo-pages/OnlineResumeMakerPage'));
const CVMakerOnlinePage = lazy(() => import('./components/seo-pages/CVMakerOnlinePage'));
const ProfessionalResumeBuilderPage = lazy(() => import('./components/seo-pages/ProfessionalResumeBuilderPage'));
const ResumeBuilderForFreshersPage = lazy(() => import('./components/seo-pages/ResumeBuilderForFreshersPage'));
const ResumeBuilderForEngineersPage = lazy(() => import('./components/seo-pages/ResumeBuilderForEngineersPage'));
const ResumeBuilderForITJobsPage = lazy(() => import('./components/seo-pages/ResumeBuilderForITJobsPage'));
const ResumeBuilderForDevelopersPage = lazy(() => import('./components/seo-pages/ResumeBuilderForDevelopersPage'));
const CreateResumeOnlinePage = lazy(() => import('./components/seo-pages/CreateResumeOnlinePage'));

// Analytics Dashboard Components (Admin only - lazy load)
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));

// Professional Resume Admin Components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ProfessionalResumeDashboard = lazy(() => import('./components/ProfessionalResumeDashboard'));

// Auth Components
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminProtectedRoute = lazy(() => import('./components/AdminProtectedRoute'));

// Import PDF styles globally
import './components/PDFStyles.css';

// Initialize Firebase
import { initializeFirebase } from './firebase/config';
import { firebaseSyncService } from './firebase/syncService';
import { anonymousTracking } from './firebase/anonymousTracking';

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
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ResumeProvider>
          <GoogleAnalytics />
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/latest-job-updates-india" element={
                  <Suspense fallback={<LoadingSpinner message="Loading jobs..." />}>
                    <JobApplications />
                  </Suspense>
                } />
                <Route path="/builder" element={<Navigate to="/free-resume-builder" replace />} />
                <Route path="/job-disciplines" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobDisciplines />
                  </Suspense>
                } />
                <Route path="/latest-jobs-for-freshers-india" element={<Navigate to="/latest-job-updates-india" replace />} />
                <Route path="/job-applications" element={<Navigate to="/latest-job-updates-india" replace />} />
                
                {/* Job Details Route */}
                <Route path="/job-details/:jobId" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobDetails />
                  </Suspense>
                } />
                
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/blog" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Blog />
                  </Suspense>
                } />
                <Route path="/blog/:slug" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BlogPost />
                  </Suspense>
                } />
                <Route path="/edit" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditResumePage />
                  </Suspense>
                } />
                
                {/* Job Drives Routes - Updated with detail route */}
                <Route path="/latest-walk-in-drives-india" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobDrives />
                  </Suspense>
                } />
                <Route path="/job-drives" element={<Navigate to="/latest-walk-in-drives-india" replace />} />
                <Route path="/job-drives/:driveId" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobDrives />
                  </Suspense>
                } />
                
                {/* Government Exams route */}
                <Route path="/government-exams" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <GovernmentExams />
                  </Suspense>
                } />

                {/* SEO-Optimized Resume Builder Pages */}
                <Route path="/free-resume-builder" element={
                  <Suspense fallback={<LoadingSpinner message="Loading resume builder..." />}>
                    <FreeResumeBuilderPage />
                  </Suspense>
                } />
                <Route path="/ats-resume-builder" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ATSResumeBuilderPage />
                  </Suspense>
                } />
                <Route path="/online-resume-maker" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <OnlineResumeMakerPage />
                  </Suspense>
                } />
                <Route path="/cv-maker-online" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CVMakerOnlinePage />
                  </Suspense>
                } />
                <Route path="/professional-resume-builder" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProfessionalResumeBuilderPage />
                  </Suspense>
                } />
                <Route path="/resume-builder-for-freshers" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResumeBuilderForFreshersPage />
                  </Suspense>
                } />
                <Route path="/resume-builder-for-engineers" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResumeBuilderForEngineersPage />
                  </Suspense>
                } />
                <Route path="/resume-builder-for-it-jobs" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResumeBuilderForITJobsPage />
                  </Suspense>
                } />
                <Route path="/resume-builder-for-developers" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResumeBuilderForDevelopersPage />
                  </Suspense>
                } />
                <Route path="/create-resume-online" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateResumeOnlinePage />
                  </Suspense>
                } />

                {/* Admin Login Page */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminLogin />
                  </Suspense>
                } />
                
                {/* Professional Resume Admin Dashboard */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />
                
                {/* Professional Resume Management */}
                <Route 
                  path="/admin/professional-resumes" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <ProfessionalResumeDashboard />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />

                {/* Analytics & Admin Dashboards */}
                <Route 
                  path="/admin/analytics" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AnalyticsDashboard />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />
                
                <Route 
                  path="/admin/job-posting" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AdminJobPosting />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />
                
                <Route 
                  path="/admin/job-drives" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AdminJobDrives />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />
                
                <Route 
                  path="/admin/government-exams" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AdminGovernmentExams />
                      </AdminProtectedRoute>
                    </Suspense>
                  } 
                />

                {/* Job Discipline Pages */}
                <Route path="/job-disciplines/engineering" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobDisciplines />
                  </Suspense>
                } />
                <Route path="/job-disciplines/mechanical-engineering" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <MechanicalEngineering />
                  </Suspense>
                } />
                <Route path="/job-disciplines/static-engineer" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <StaticEngineer />
                  </Suspense>
                } />
                <Route path="/job-disciplines/civil-engineering" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CivilEngineering />
                  </Suspense>
                } />
                <Route path="/job-disciplines/electrical-engineering" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ElectricalEngineering />
                  </Suspense>
                } />
                <Route path="/job-disciplines/software-development" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SoftwareDevelopment />
                  </Suspense>
                } />
                <Route path="/job-disciplines/data-science" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <DataScience />
                  </Suspense>
                } />
                <Route path="/job-disciplines/cybersecurity" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Cybersecurity />
                  </Suspense>
                } />

                {/* Career Resources */}
                <Route path="/fresh-graduate-guide" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <FreshGraduateGuide />
                  </Suspense>
                } />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/contact" element={<Contact />} />

                {/* Quick Admin Access */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin-mode" element={<Navigate to="/edit?adminMode=true" replace />} />
                <Route path="/create-client-resume" element={<Navigate to="/edit?adminMode=true" replace />} />

                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ResumeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;