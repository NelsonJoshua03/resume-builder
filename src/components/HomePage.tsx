// src/components/HomePage.tsx - COMPLETE WITH ENHANCED TRACKING
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Download,
  Shield,
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import SEO from './SEO';

const HomePage = () => {
  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow, 
    trackExternalLink,
    trackPageView 
  } = useGoogleAnalytics();

  const { trackDailyPageView } = useEnhancedAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('CareerCraft Home Page', '/');
    trackDailyPageView('Home Page', '/');
    
    // Track unique user
    if (!localStorage.getItem('user_id')) {
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
      
      const totalUsers = parseInt(localStorage.getItem('total_users') || '0');
      localStorage.setItem('total_users', (totalUsers + 1).toString());
    }
    
    // Track funnel entry
    const userId = localStorage.getItem('user_id') || 'anonymous';
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'funnel_step', {
        funnel_name: 'website_visit',
        step: 'homepage_visited',
        step_number: 1,
        user_id: userId,
        send_to: 'G-SW5M9YN8L5'
      });

      window.gtag('event', 'funnel_step', {
        funnel_name: 'website_visit',
        step: 'homepage_visited',
        step_number: 1,
        user_id: userId,
        send_to: 'G-WSKZJDJW77'
      });
    }
    
    // Increment total visits
    const totalVisits = parseInt(localStorage.getItem('total_home_visits') || '0');
    localStorage.setItem('total_home_visits', (totalVisits + 1).toString());
  }, [trackPageView, trackDailyPageView]);

  const handleCTAClick = (buttonName: string, section: string) => {
    trackCTAClick(buttonName, section, 'homepage');
    trackButtonClick(buttonName, section, 'homepage');
    
    // Track specific funnel steps
    if (buttonName.includes('builder') || buttonName.includes('build_resume')) {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'funnel_step', {
          funnel_name: 'resume_creation',
          step: 'builder_button_clicked',
          step_number: 1,
          user_id: userId,
          send_to: 'G-SW5M9YN8L5'
        });

        window.gtag('event', 'funnel_step', {
          funnel_name: 'resume_creation',
          step: 'builder_button_clicked',
          step_number: 1,
          user_id: userId,
          send_to: 'G-WSKZJDJW77'
        });
      }
      
      // Track conversions
      const conversions = parseInt(localStorage.getItem('home_to_builder_conversions') || '0');
      localStorage.setItem('home_to_builder_conversions', (conversions + 1).toString());
    }
  };

  const handleFeatureClick = (featureName: string) => {
    trackButtonClick(`view_${featureName.toLowerCase()}`, 'features_section', 'homepage');
  };

  const handleNavigation = (from: string, to: string, action: string) => {
    trackUserFlow(from, to, action);
  };

  const handleExternalLinkClick = (linkText: string, destination: string) => {
    trackExternalLink(linkText, destination, 'homepage');
    trackButtonClick(`external_${linkText.toLowerCase()}`, 'contact_section', 'homepage');
  };

  // Get live stats from localStorage
  const getLiveStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      resumesCreated: parseInt(localStorage.getItem('resumeDownloads') || '0'),
      jobApplications: parseInt(localStorage.getItem('total_job_applications') || '0'),
      driveRegistrations: parseInt(localStorage.getItem('job_drive_registrations') || '0'),
      todayVisitors: JSON.parse(localStorage.getItem(`daily_user_${today}`) || '[]').length,
      totalUsers: parseInt(localStorage.getItem('total_users') || '0'),
      blogReads: parseInt(localStorage.getItem('blog_reads') || '0')
    };
  };

  const stats = getLiveStats();

  return (
    <>
      <SEO
        title="Free ATS Resume Builder & Job Portal for Indian Job Seekers | CareerCraft.in"
        description="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume templates for freshers and experienced professionals."
        keywords="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India"
        canonicalUrl="https://careercraft.in/"
        ogImage="https://careercraft.in/logos/careercraft-logo-square.png"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 md:py-20 w-full">
          <div className="container mx-auto px-4 text-center w-full max-w-7xl">
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-6 flex justify-center">
                <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                  🚀 {stats.todayVisitors.toLocaleString()}+ Users Today
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Build ATS-Friendly Resumes That Get You Hired
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100">
                India's #1 Free Resume Builder for Indian Job Market
              </p>
              <p className="text-base md:text-lg mb-8 md:mb-12 text-blue-200 max-w-3xl mx-auto leading-relaxed">
                Create professional resumes optimized for Indian recruiters and ATS systems. 
                Used by {stats.totalUsers.toLocaleString()}+ job seekers across India.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                <Link 
                  to="/builder" 
                  onClick={() => {
                    handleCTAClick('build_resume_hero', 'hero_section');
                    handleNavigation('homepage', 'builder', 'hero_cta');
                  }}
                  className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto max-w-sm"
                >
                  <FileText size={20} />
                  Build Free Resume
                </Link>
                
                <Link 
                  to="/edit" 
                  onClick={() => {
                    handleCTAClick('edit_resume_hero', 'hero_section');
                    handleNavigation('homepage', 'edit', 'hero_cta');
                  }}
                  className="bg-blue-500/20 text-white border-2 border-white/30 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto max-w-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit My Resume
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-blue-500">
                <div className="flex items-center text-blue-200 text-xs md:text-sm">
                  <CheckCircle size={14} className="mr-1 md:mr-2" />
                  No Sign Up Required
                </div>
                <div className="flex items-center text-blue-200 text-xs md:text-sm">
                  <Download size={14} className="mr-1 md:mr-2" />
                  Instant PDF Download
                </div>
                <div className="flex items-center text-blue-200 text-xs md:text-sm">
                  <Shield size={14} className="mr-1 md:mr-2" />
                  100% Privacy Protected
                </div>
                <div className="flex items-center text-blue-200 text-xs md:text-sm">
                  <Star size={14} className="mr-1 md:mr-2" />
                  ATS Optimized Templates
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="py-8 bg-white/50 w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="transform hover:scale-105 transition-transform duration-300 p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                  {stats.resumesCreated.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">Resumes Created</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-4">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                  {stats.jobApplications.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">Job Applications</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-4">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
                  {stats.driveRegistrations.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">Drive Registrations</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-4">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                  {stats.totalUsers.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-16 bg-white w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Why Choose CareerCraft.in?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Built specifically for the Indian job market with features that matter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
              <div 
                className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100"
                onClick={() => handleFeatureClick('ATS_Resumes')}
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">ATS Optimized</h3>
                <p className="text-gray-600">
                  Templates designed to pass through Applicant Tracking Systems used by Indian companies
                </p>
              </div>

              <div 
                className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100"
                onClick={() => handleFeatureClick('India_Jobs')}
              >
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Job Portal</h3>
                <p className="text-gray-600">
                  Curated job opportunities from top Indian companies, startups, and MNCs
                </p>
              </div>

              <div 
                className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100"
                onClick={() => handleFeatureClick('Free_Templates')}
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-purple-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Free Templates</h3>
                <p className="text-gray-600">
                  6+ professional templates completely free, no hidden costs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Create Your Resume in 3 Simple Steps
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Go to Builder</h3>
                <p className="text-gray-600">Click "Build Free Resume" button</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Edit Your Info</h3>
                <p className="text-gray-600">Fill in your details or edit existing</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Download PDF</h3>
                <p className="text-gray-600">Get your professional resume instantly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 md:py-20 text-white w-full">
          <div className="container mx-auto px-4 text-center w-full max-w-7xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Ready to Create Your Professional Resume?
            </h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-blue-100 max-w-2xl mx-auto">
              Join {stats.totalUsers.toLocaleString()}+ Indian professionals who found success with CareerCraft.in
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <Link 
                to="/builder" 
                onClick={() => {
                  handleCTAClick('final_build_resume', 'final_cta');
                  handleNavigation('homepage', 'builder', 'final_cta');
                }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Zap size={20} />
                Start Building Now - Free
                <ArrowRight size={20} />
              </Link>
              
              <Link 
                to="/job-applications" 
                onClick={() => {
                  handleCTAClick('find_jobs', 'final_cta');
                  handleNavigation('homepage', 'job-applications', 'final_cta');
                }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
              >
                Browse Jobs in India
              </Link>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-lg font-bold">100% Free</div>
                <div className="text-sm text-blue-200">No charges</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-lg font-bold">No Sign Up</div>
                <div className="text-sm text-blue-200">Start instantly</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-lg font-bold">ATS Friendly</div>
                <div className="text-sm text-blue-200">Optimized</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <div className="text-lg font-bold">Made in India</div>
                <div className="text-sm text-blue-200">For Indian Jobs</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;