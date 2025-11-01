// src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">ResumeCVForge</Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                to="/job-disciplines" 
                className={`font-medium transition-colors ${
                  location.pathname.includes('/job-disciplines') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Job Disciplines
              </Link>
              <Link 
                to="/job-applications" 
                className={`font-medium transition-colors ${
                  location.pathname.includes('/job-applications') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Job Applications
              </Link>
              <Link 
                to="/job-drives" 
                className={`font-medium transition-colors ${
                  location.pathname.includes('/job-drives') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Walk-in Drives
              </Link>
              <Link 
                to="/blog" 
                className={`font-medium transition-colors ${
                  location.pathname.includes('/blog') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Blog
              </Link>
              <Link 
                to="/about" 
                className={`font-medium transition-colors ${
                  location.pathname === '/about' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition-colors ${
                  location.pathname === '/contact' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
            </div>
            
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Build Resume
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ResumeCVForge</h3>
              <p className="text-gray-400">
                Create professional, ATS-friendly resumes in minutes. No sign-up required.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/job-disciplines" className="text-gray-400 hover:text-white transition-colors">Job Disciplines</Link></li>
                <li><Link to="/job-applications" className="text-gray-400 hover:text-white transition-colors">Job Applications</Link></li>
                <li><Link to="/job-drives" className="text-gray-400 hover:text-white transition-colors">Walk-in Drives</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact & Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:support@resumecvforge.com" className="hover:text-white transition-colors">
                    General Support
                  </a>
                </li>
                <li>
                  <a href="mailto:privacy@resumecvforge.com" className="hover:text-white transition-colors">
                    Privacy Concerns
                  </a>
                </li>
                <li>
                  <a href="mailto:ads@resumecvforge.com" className="hover:text-white transition-colors">
                    Advertising
                  </a>
                </li>
                <li>
                  <a href="mailto:dpo@resumecvforge.com" className="hover:text-white transition-colors">
                    Data Protection Officer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">&copy; 2024 ResumeCVForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;