// [file name]: App.tsx - UPDATED (removed debug components)
// src/App.tsx - CLEANED VERSION WITHOUT DEBUG COMPONENTS
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Firebase Components
import GDPRConsent from './components/GDPRConsent';

// Analytics Dashboard Components (Admin only)
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LocalAnalyticsDashboard from './components/LocalAnalyticsDashboard';
import AdminDashboard from './components/AdminDashboard';
import DailyAnalyticsDashboard from './components/DailyAnalyticsDashboard';
import ComprehensiveAnalyticsDashboard from './components/ComprehensiveAnalyticsDashboard';
import FirebaseAnalyticsDashboardComponent from './components/FirebaseAnalyticsDashboardComponent';

import './styles/blog.css';
// Import PDF styles globally
import './components/PDFStyles.css';

// Initialize Firebase
import { initializeFirebase } from './firebase/config';
import { firebaseSyncService } from './firebase/syncService';
import { useEffect } from 'react';

function App() {
  // Initialize Firebase on app start
  useEffect(() => {
    try {
      initializeFirebase();
      
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
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <ResumeProvider>
          <GoogleAnalytics />
          <GDPRConsent />
          <Layout>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/builder" element={<ResumeBuilder />} />
              <Route path="/job-disciplines" element={<JobDisciplines />} />
              <Route path="/job-applications" element={<JobApplications />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/edit" element={<EditResumePage />} />

              {/* Analytics & Admin Dashboards (Admin only) */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/admin/daily-analytics" element={<DailyAnalyticsDashboard />} />
              <Route path="/local-analytics" element={<LocalAnalyticsDashboard />} />
              <Route path="/admin/comprehensive-analytics" element={<ComprehensiveAnalyticsDashboard />} />
              <Route path="/admin/firebase-analytics" element={<FirebaseAnalyticsDashboardComponent />} />
              
              <Route path="/admin/job-posting" element={<AdminJobPosting />} />
              <Route path="/admin/job-drives" element={<AdminJobDrives />} />
              <Route path="/admin/government-exams" element={<AdminGovernmentExams />} />

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
              <Route path="/job-drives" element={<JobDrives />} />
              <Route path="/government-exams" element={<GovernmentExams />} />

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