// src/components/HomePage.tsx - UPDATED WITH PREMIUM TEMPLATES
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

const HomePage = () => {
  const { trackButtonClick, trackPageView } = useGoogleAnalytics();

  const handleCTAClick = (buttonName: string, section: string) => {
    trackButtonClick(buttonName, section, 'homepage');
  };

  const handleFeatureClick = (featureName: string) => {
    trackButtonClick(`view_${featureName.toLowerCase()}`, 'features_section', 'homepage');
  };

  return (
    <>
      <Helmet>
        <title>CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform</title>
        <meta 
          name="description" 
          content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume templates for freshers and experienced professionals." 
        />
        <meta 
          name="keywords" 
          content="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

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
                  onClick={() => handleCTAClick('build_resume', 'hero_section')}
                  className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <FileText size={20} />
                  Build Your Resume - Free
                </Link>
                <Link 
                  to="/job-applications" 
                  onClick={() => handleCTAClick('find_jobs', 'hero_section')}
                  className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Briefcase size={20} />
                  Find Jobs in India
                </Link>
              </div>
              
              {/* NEW: Premium Templates Quick Link */}
              <div className="mt-6 w-full flex justify-center">
                <Link 
                  to="/premium-templates" 
                  onClick={() => handleCTAClick('premium_templates', 'hero_section')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
                >
                  <Crown size={18} />
                  Explore Premium Templates
                  <Sparkles size={16} />
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

        {/* NEW: Premium Templates Section */}
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
                    to="/premium-templates?template=modernIcons"
                    onClick={() => handleCTAClick('modern_icons_template', 'premium_section')}
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
                    to="/premium-templates?template=creativePortfolio"
                    onClick={() => handleCTAClick('creative_portfolio_template', 'premium_section')}
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
                to="/premium-templates"
                onClick={() => handleCTAClick('view_all_premium', 'premium_section')}
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
              <div className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 md:mb-2">50,000+</div>
                <div className="text-gray-600 text-sm md:text-base">Resumes Created</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-1 md:mb-2">10,000+</div>
                <div className="text-gray-600 text-sm md:text-base">Jobs Listed</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600 mb-1 md:mb-2">2 New</div>
                <div className="text-gray-600 text-sm md:text-base">Premium Templates</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 p-2 md:p-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 mb-1 md:mb-2">15+</div>
                <div className="text-gray-600 text-sm md:text-base">Job Industries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Updated with Premium Option */}
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
                onClick={() => handleCTAClick('final_build_resume', 'final_cta')}
                className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                Create Your Resume
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/premium-templates" 
                onClick={() => handleCTAClick('final_premium_templates', 'final_cta')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Crown size={18} />
                Premium Templates
              </Link>
              <Link 
                to="/job-applications" 
                onClick={() => handleCTAClick('final_find_jobs', 'final_cta')}
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