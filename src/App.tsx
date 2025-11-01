// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from "./components/Layout";
import ResumeBuilder from "./components/ResumeBuilder";
import HomePage from "./components/HomePage";
import JobDisciplines from "./components/JobDisciplines";
import JobApplications from "./components/JobApplications"; // Add this import
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

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/job-disciplines" element={<JobDisciplines />} />
            <Route path="/job-applications" element={<JobApplications />} /> {/* Add this route */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin/job-posting" element={<AdminJobPosting />} />
            

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
            <Route path="/fresh-graduate-guide" element={<FreshGraduateGuide />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/job-drives" element={<JobDrives />} />
<Route path="/admin/job-drives" element={<AdminJobDrives />} />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;