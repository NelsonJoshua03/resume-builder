// src/components/HomePage.tsx - UPDATED WITH FIXED TRACKING
import { useEffect } from 'react';
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
  Crown,
  Sparkles
} from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import SEO from './SEO';

const HomePage = () => {
  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow, 
    trackExternalLink,
    trackPageView 
  } = useGoogleAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('Home Page', '/');
    
    // Track daily visits in localStorage
    const today = new Date().toISOString().split('T')[0];
    const pageViews = parseInt(localStorage.getItem('page_views_home') || '0');
    localStorage.setItem('page_views_home', (pageViews + 1).toString());
    
    const dailyKey = `daily_${today}`;
    const dailyVisits = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyVisits + 1).toString());
    
    // Track unique user
    if (!localStorage.getItem('user_id')) {
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
      
      const totalUsers = parseInt(localStorage.getItem('total_users') || '0');
      localStorage.setItem('total_users', (totalUsers + 1).toString());
    }
  }, [trackPageView]);

  const handleCTAClick = (buttonName: string, section: string) => {
    trackCTAClick(buttonName, section, 'homepage');
    trackButtonClick(buttonName, section, 'homepage');
  };

  const handleFeatureClick = (featureName: string) => {
    trackButtonClick(`view_${featureName.toLowerCase()}`, 'features_section', 'homepage');
  };

  const handleNavigation = (from: string, to: string, action: string) => {
    trackUserFlow(from, to, action);
  };

  const handleExternalLinkClick = (linkText: string) => {
    // Fixed: Removed unused 'destination' parameter
    trackExternalLink(linkText);
    trackButtonClick(`external_${linkText.toLowerCase()}`, 'contact_section', 'homepage');
  };

  return (
    <>
      <SEO
        title="Free ATS Resume Builder & Job Portal for Indian Job Seekers"
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
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Your Career Journey Starts at CareerCraft.in
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100">
                Create ATS-Friendly Resumes & Find Your Dream Job in India
              </p>
              <p className="text-base md:text-lg mb-8 md:mb-12 text-blue-200 max-w-3xl mx-auto leading-relaxed">
                India's premier career platform helping job seekers create professional resumes that pass through 
                Applicant Tracking Systems and connect with top employers across India. Built for the Indian job market.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full">
                <Link 
                  to="/builder" 
                  onClick={() => {
                    handleCTAClick('build_resume', 'hero_section');
                    handleNavigation('homepage', 'builder', 'hero_cta');
                    
                    // Track conversion from home to builder
                    const conversions = parseInt(localStorage.getItem('home_to_builder') || '0');
                    localStorage.setItem('home_to_builder', (conversions + 1).toString());
                  }}
                  className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <FileText size={20} />
                  Build Your Resume - Free
                </Link>
                <Link 
                  to="/premium" 
                  onClick={() => {
                    handleCTAClick('premium_templates', 'hero_section');
                    handleNavigation('homepage', 'premium', 'hero_cta');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Crown size={20} />
                  Premium Templates
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
                className="text-center p-4 md:p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md"
                onClick={() => handleFeatureClick('ATS_Resumes')}
              >
                <div className="bg-blue-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <FileText className="text-blue-600" size={28} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">ATS-Optimized Resumes</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Templates designed to pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, Wipro
                </p>
              </div>

              <div 
                className="text-center p-4 md:p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md"
                onClick={() => handleFeatureClick('India_Jobs')}
              >
                <div className="bg-green-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Briefcase className="text-green-600" size={28} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">India-Focused Job Listings</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Curated job opportunities from top Indian companies, startups, and MNCs across all major cities
                </p>
              </div>

              <div 
                className="text-center p-4 md:p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md"
                onClick={() => handleFeatureClick('Career_Guidance')}
              >
                <div className="bg-purple-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Users className="text-purple-600" size={28} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Career Guidance for India</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Expert advice tailored for Indian job market, industry trends, and regional opportunities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Templates Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-purple-50 to-pink-50 w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1 md:py-2 rounded-full mb-3 md:mb-4">
                <Crown className="text-purple-600" size={18} />
                <span className="text-purple-600 font-semibold text-sm md:text-base">New Feature</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Premium Resume Templates
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Stand out from the crowd with beautifully designed, icon-rich templates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto w-full">
              {/* Modern Icons Template */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 w-full">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Modern Icons</h3>
                  <p className="text-blue-100 text-sm md:text-base">Beautiful icons and gradient designs</p>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 md:px-3 py-1 rounded-full">Icons</span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 md:px-3 py-1 rounded-full">Gradients</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 md:px-3 py-1 rounded-full">Modern</span>
                  </div>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                    Clean, modern design with beautiful icons and professional gradient accents. Perfect for tech and creative roles.
                  </p>
                  <Link 
                    to="/premium"
                    onClick={() => {
                      handleCTAClick('modern_icons_template', 'premium_section');
                      handleNavigation('homepage', 'premium', 'modern_icons_click');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Sparkles size={16} />
                    Try Modern Icons
                  </Link>
                </div>
              </div>

              {/* Creative Portfolio Template */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 w-full">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Creative Portfolio</h3>
                  <p className="text-purple-100 text-sm md:text-base">Timeline layout with progress bars</p>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 md:px-3 py-1 rounded-full">Timeline</span>
                    <span className="bg-pink-100 text-pink-800 text-xs px-2 md:px-3 py-1 rounded-full">Progress Bars</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 md:px-3 py-1 rounded-full">Creative</span>
                  </div>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                    Creative portfolio-style layout with timeline design and skill progress bars. Ideal for designers and creative professionals.
                  </p>
                  <Link 
                    to="/premium"
                    onClick={() => {
                      handleCTAClick('creative_portfolio_template', 'premium_section');
                      handleNavigation('homepage', 'premium', 'creative_portfolio_click');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Sparkles size={16} />
                    Try Creative Portfolio
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 md:mt-8">
              <Link 
                to="/premium"
                onClick={() => {
                  handleCTAClick('view_all_premium', 'premium_section');
                  handleNavigation('homepage', 'premium', 'view_all_templates');
                }}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm md:text-base"
              >
                View All Premium Templates
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div 
                className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4 cursor-pointer"
                onClick={() => trackButtonClick('stats_resumes', 'stats_section', 'homepage')}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 md:mb-2">50,000+</div>
                <div className="text-gray-600 text-sm md:text-base">Resumes Created</div>
              </div>
              <div 
                className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4 cursor-pointer"
                onClick={() => trackButtonClick('stats_jobs', 'stats_section', 'homepage')}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-1 md:mb-2">10,000+</div>
                <div className="text-gray-600 text-sm md:text-base">Jobs Listed</div>
              </div>
              <div 
                className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4 cursor-pointer"
                onClick={() => trackButtonClick('stats_templates', 'stats_section', 'homepage')}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600 mb-1 md:mb-2">3 New</div>
                <div className="text-gray-600 text-sm md:text-base">Premium Templates</div>
              </div>
              <div 
                className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4 cursor-pointer"
                onClick={() => trackButtonClick('stats_industries', 'stats_section', 'homepage')}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 mb-1 md:mb-2">15+</div>
                <div className="text-gray-600 text-sm md:text-base">Job Industries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-12 md:py-16 bg-gray-900 text-white w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                Get In Touch
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Have questions? We're here to help you with your career journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div 
                className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                onClick={() => trackButtonClick('contact_email', 'contact_section', 'homepage')}
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                <a 
                  href="mailto:contact@careercraft.in" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalLinkClick('contact_email');
                  }}
                >
                  contact@careercraft.in
                </a>
              </div>

              <div 
                className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                onClick={() => trackButtonClick('contact_linkedin', 'contact_section', 'homepage')}
              >
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
                <a 
                  href="https://www.linkedin.com/in/career-coach-expert-2a47a0399" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalLinkClick('contact_linkedin');
                  }}
                >
                  Connect with us
                </a>
              </div>

              <div 
                className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                onClick={() => trackButtonClick('contact_instagram', 'contact_section', 'homepage')}
              >
                <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.017 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Instagram</h3>
                <a 
                  href="https://www.instagram.com/career_craft_india/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalLinkClick('contact_instagram');
                  }}
                >
                  Follow us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-600 py-12 md:py-16 text-white w-full">
          <div className="container mx-auto px-4 text-center w-full max-w-7xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Ready to Advance Your Career in India?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of Indian professionals who found their dream jobs through CareerCraft.in
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full">
              <Link 
                to="/builder" 
                onClick={() => {
                  handleCTAClick('final_build_resume', 'final_cta');
                  handleNavigation('homepage', 'builder', 'final_cta');
                  
                  // Track final conversion
                  const finalConversions = parseInt(localStorage.getItem('final_home_to_builder') || '0');
                  localStorage.setItem('final_home_to_builder', (finalConversions + 1).toString());
                }}
                className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                Create Your Resume
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/premium" 
                onClick={() => {
                  handleCTAClick('final_premium_templates', 'final_cta');
                  handleNavigation('homepage', 'premium', 'final_cta');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Crown size={18} />
                Premium Templates
              </Link>
              <Link 
                to="/job-applications" 
                onClick={() => {
                  handleCTAClick('final_find_jobs', 'final_cta');
                  handleNavigation('homepage', 'job-applications', 'final_cta');
                }}
                className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
              >
                Browse Indian Jobs
              </Link>
            </div>
            <p className="text-blue-200 mt-4 md:mt-6 text-xs md:text-sm">
              🚀 Free • No Sign Up • Instant Download • Made for India
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;