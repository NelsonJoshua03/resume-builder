// src/components/Layout.tsx - COMPLETE UPDATED VERSION WITHOUT DEBUG PANEL
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation fix for React Router v6 issues
  useEffect(() => {
    // Fix for navigation getting stuck
    const handleNavigationError = (e: Event) => {
      console.log('Navigation error detected');
      // Prevent default and try programmatic navigation
      if (e.type === 'popstate') {
        // Force React Router to update
        setTimeout(() => {
          navigate(location.pathname, { replace: true });
        }, 50);
      }
    };

    window.addEventListener('popstate', handleNavigationError);
    
    // Clean up scroll restoration to prevent conflicts
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleNavigationError);
    };
  }, [location.pathname, navigate]);

  // Fix for navigation links that stop working
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // If we're already on the same page, force a reload
    if (location.pathname === path) {
      e.preventDefault();
      window.location.href = path;
      return;
    }
    
    // For builder page specifically, always do fresh navigation
    if (path === '/builder' && location.pathname.includes('/blog')) {
      e.preventDefault();
      navigate(path, { replace: true });
      // Force a small delay to ensure clean state
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
    }
  };

  // Reset scroll on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Add a navigation debug log (only in console, not visible to users)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📍 Navigation: ${location.pathname}`);
    }
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform</title>
        <meta name="title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta name="description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume builder with premium templates." />
        <meta name="keywords" content="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India, government exams, walk-in drives" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="CareerCraft India" />
        <link rel="canonical" href="https://careercraft.in/" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JW2bS0D8YB"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JW2bS0D8YB');
            
            // Enhanced navigation tracking
            window.addEventListener('popstate', function() {
              gtag('event', 'page_view', {
                page_path: window.location.pathname,
                page_title: document.title
              });
            });
          `}
        </script>

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/" />
        <meta property="og:title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta property="og:description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings across India. Free resume builder with premium templates." />
        <meta property="og:image" content="https://careercraft.in/logos/careercraft-logo-main.png" />
        <meta property="og:site_name" content="CareerCraft.in" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://careercraft.in/" />
        <meta property="twitter:title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform" />
        <meta property="twitter:description" content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings across India." />
        <meta property="twitter:image" content="https://careercraft.in/logos/careercraft-logo-main.png" />

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
        {/* Header with Logo Removed */}
        <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
          <div className="container mx-auto px-3 md:px-4 py-3 w-full max-w-7xl">
            <nav className="flex justify-between items-center w-full">
              {/* Logo Removed - Only Text Brand */}
              <Link 
                to="/" 
                className="flex items-center"
                onClick={(e) => handleNavigation(e, '/')}
              >
                <span className="text-xl md:text-2xl font-bold text-blue-600">
                  CareerCraft.in
                </span>
              </Link>
              
              {/* Navigation Menu */}
              <div className="hidden md:flex space-x-4 lg:space-x-6">
                <Link 
                  to="/government-exams" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname.includes('/government-exams') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/government-exams')}
                >
                  Government Exams
                </Link>
                <Link 
                  to="/job-disciplines" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname.includes('/job-disciplines') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/job-disciplines')}
                >
                  Job Disciplines
                </Link>
                <Link 
                  to="/job-applications" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname.includes('/job-applications') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/job-applications')}
                >
                  Job Applications
                </Link>
                <Link 
                  to="/job-drives" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname.includes('/job-drives') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/job-drives')}
                >
                  Walk-in Drives
                </Link>
                
                {/* Resume Templates Dropdown */}
                <div className="relative group">
                  <button className="font-medium transition-colors text-sm lg:text-base text-gray-700 hover:text-blue-600 flex items-center gap-1">
                    Resume Templates
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link 
                      to="/builder" 
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
                      onClick={(e) => handleNavigation(e, '/builder')}
                    >
                      <div className="font-medium">ATS Templates</div>
                      <div className="text-xs text-gray-500">Free & ATS-optimized</div>
                    </Link>
                    <Link 
                      to="/premium" 
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      onClick={(e) => handleNavigation(e, '/premium')}
                    >
                      <div className="font-medium flex items-center gap-2">
                        <span>Premium Templates</span>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                      </div>
                      <div className="text-xs text-gray-500">Beautiful designs</div>
                    </Link>
                  </div>
                </div>

                <Link 
                  to="/blog" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname.includes('/blog') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/blog')}
                >
                  Blog
                </Link>
                <Link 
                  to="/about" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/about')}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`font-medium transition-colors text-sm lg:text-base ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={(e) => handleNavigation(e, '/contact')}
                >
                  Contact
                </Link>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center gap-2 md:gap-3">
                <Link 
                  to="/premium" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors hidden md:block text-sm"
                  onClick={(e) => handleNavigation(e, '/premium')}
                >
                  🎨 Premium
                </Link>
                <Link 
                  to="/builder" 
                  className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    // Force clean navigation to builder
                    if (location.pathname === '/builder') {
                      window.location.href = '/builder';
                    } else {
                      navigate('/builder', { replace: true });
                      setTimeout(() => {
                        window.scrollTo(0, 0);
                      }, 10);
                    }
                  }}
                >
                  Build Resume
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* Footer with Logo Removed */}
        <footer className="bg-gray-900 text-white py-8 md:py-12 mt-auto w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
              <div>
                {/* Footer Logo Removed - Only Text */}
                <div className="mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    CareerCraft.in
                  </span>
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
              
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Quick Links</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/')}>Home</Link></li>
                  <li><Link to="/government-exams" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/government-exams')}>Government Exams</Link></li>
                  <li><Link to="/job-disciplines" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/job-disciplines')}>Job Disciplines</Link></li>
                  <li><Link to="/job-applications" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/job-applications')}>Job Applications</Link></li>
                  <li><Link to="/job-drives" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/job-drives')}>Walk-in Drives</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Resume Tools</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/builder" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/builder')}>ATS Resume Builder</Link></li>
                  <li><Link to="/premium" className="text-purple-400 hover:text-purple-300 transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/premium')}>Premium Templates</Link></li>
                  <li><Link to="/edit" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/edit')}>Edit Resume</Link></li>
                  <li><Link to="/fresh-graduate-guide" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/fresh-graduate-guide')}>Fresh Graduate Guide</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Resources</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/blog')}>Blog</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/about')}>About Us</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/contact')}>Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Legal</h3>
                <ul className="space-y-1 md:space-y-2">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/privacy')}>Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/terms')}>Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base" onClick={(e) => handleNavigation(e, '/cookies')}>Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
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