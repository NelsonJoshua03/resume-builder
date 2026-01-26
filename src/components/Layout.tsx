// src/components/Layout.tsx - UPDATED: Removed Government Exams
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Simple navigation handler
  const handleNavigation = (path: string) => {
    // Close dropdown if open
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
    
    // Use navigate for programmatic navigation
    navigate(path);
  };

  return (
    <>
      <Helmet>
        <title>CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform</title>
        <meta name="title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta name="description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume builder with ATS templates." />
        <meta name="keywords" content="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India, walk-in drives, experienced jobs India, senior jobs" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="CareerCraft India" />
        <link rel="canonical" href="https://careercraft.in/" />
        
        {/* Google Analytics - CORRECT MEASUREMENT ID */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SW5M9YN8L5"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SW5M9YN8L5');
          `}
        </script>

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/" />
        <meta property="og:title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta property="og:description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings across India. Free resume builder with ATS templates." />
        <meta property="og:image" content="https://careercraft.in/og/careercraft-homepage-preview.jpg" />
        <meta property="og:site_name" content="CareerCraft.in" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://careercraft.in/" />
        <meta property="twitter:title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta property="twitter:description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings across India." />
        <meta property="twitter:image" content="https://careercraft.in/og/careercraft-homepage-preview.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CareerCraft India",
            "url": "https://careercraft.in/",
            "description": "India's premier career platform - Free ATS-friendly resume builder and job portal for Indian job seekers. Find jobs in IT, engineering, marketing and more.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "permissions": "browser",
            "areaServed": "IN",
            "countryOfOrigin": "India",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
          <div className="container mx-auto px-3 md:px-4 py-3 w-full max-w-7xl">
            <nav className="flex justify-between items-center w-full">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-xl md:text-2xl font-bold text-blue-600">
                  CareerCraft.in
                </span>
              </Link>
              
              {/* Navigation Menu - SIMPLIFIED */}
              <div className="hidden md:flex space-x-4 lg:space-x-6">
                {/* Job Disciplines */}
                <Link 
                  to="/job-disciplines" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname.includes('/job-disciplines') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Job Disciplines
                </Link>
                
                {/* Latest Job Updates (Now shows fresher jobs) */}
                <Link 
                  to="/latest-job-updates-india" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname.includes('/latest-job-updates-india') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Latest Jobs 2026
                </Link>
                
                {/* Latest Walk-in Drives */}
                <Link 
                  to="/latest-walk-in-drives-india" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname.includes('/latest-walk-in-drives-india') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Walk-in Drives
                </Link>
                
                {/* Resume Templates Dropdown */}
                <div className="relative group" ref={dropdownRef}>
                  <button 
                    className="font-medium transition-colors text-sm lg:text-base text-gray-700 hover:text-blue-600 flex items-center gap-1"
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    Resume Builder
                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
                    isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}>
                    <Link 
                      to="/free-resume-builder" 
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
                    >
                      <div className="font-medium">🚀 Free Resume Builder</div>
                      <div className="text-xs text-gray-500">Best for Indian job market</div>
                    </Link>
                    <Link 
                      to="/ats-resume-builder" 
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
                    >
                      <div className="font-medium">🤖 ATS Resume Builder</div>
                      <div className="text-xs text-gray-500">Pass through applicant tracking</div>
                    </Link>
                    <Link 
                      to="/resume-builder-for-freshers" 
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
                    >
                      <div className="font-medium">🎓 For Freshers</div>
                      <div className="text-xs text-gray-500">First job resume templates</div>
                    </Link>
                    <Link 
                      to="/edit" 
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <div className="font-medium flex items-center gap-2">
                        <span>✏️ Edit Resume</span>
                      </div>
                      <div className="text-xs text-gray-500">Update your information</div>
                    </Link>
                  </div>
                </div>

                {/* Blog */}
                <Link 
                  to="/blog" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname.includes('/blog') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Blog
                </Link>
                
                {/* About */}
                <Link 
                  to="/about" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname === '/about' 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  About
                </Link>
                
                {/* Contact */}
                <Link 
                  to="/contact" 
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    location.pathname === '/contact' 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Contact
                </Link>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => handleNavigation('/free-resume-builder')}
                  className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Build Resume
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* Footer - SIMPLIFIED */}
        <footer className="bg-gray-900 text-white py-8 md:py-12 mt-auto w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Brand Section */}
              <div>
                <div className="mb-3 md:mb-4">
                  <Link to="/">
                    <span className="text-xl md:text-2xl font-bold text-white">
                      CareerCraft.in
                    </span>
                  </Link>
                </div>
                <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                  Bright Resumes, Brighter Careers - Create ATS-friendly resumes and find your dream job.
                </p>
                <div className="flex space-x-3">
                  <a href="https://www.linkedin.com/in/career-coach-expert-2a47a0399" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/career_craft_india/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.017 0z"/>
                    </svg>
                  </a>
                  <a href="mailto:contact@careercraft.in" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Quick Links</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Home</Link></li>
                  <li><Link to="/job-disciplines" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Job Disciplines</Link></li>
                  <li><Link to="/latest-job-updates-india" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Latest Jobs 2026</Link></li>
                  <li><Link to="/latest-walk-in-drives-india" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Walk-in Drives</Link></li>
                </ul>
              </div>
              
              {/* Resume Builder */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Resume Builder</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/free-resume-builder" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Free Resume Builder</Link></li>
                  <li><Link to="/ats-resume-builder" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">ATS Resume Builder</Link></li>
                  <li><Link to="/resume-builder-for-freshers" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">For Freshers</Link></li>
                  <li><Link to="/resume-builder-for-engineers" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">For Engineers</Link></li>
                  <li><Link to="/edit" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Edit Resume</Link></li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Resources</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Blog</Link></li>
                  <li><Link to="/fresh-graduate-guide" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Fresh Graduate Guide</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">About Us</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Contact</Link></li>
                </ul>
              </div>
              
              {/* Legal */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Legal</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Footer Bottom */}
            <div className="border-t border-gray-800 pt-6 md:pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm md:text-base text-center md:text-left mb-4 md:mb-0">
                  &copy; 2024 CareerCraft.in - Bright Resumes, Brighter Careers. All rights reserved.
                </p>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:contact@careercraft.in" className="hover:text-white transition-colors">
                      contact@careercraft.in
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <a href="https://www.linkedin.com/in/career-coach-expert-2a47a0399" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.017 0z"/>
                    </svg>
                    <a href="https://www.instagram.com/career_craft_india/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;