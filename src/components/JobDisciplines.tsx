// src/components/JobDisciplines.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const JobDisciplines: React.FC = () => {
  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-blue-600">ResumeCVForge</Link>
            <ul className="flex space-x-8">
              <li><Link to="/job-disciplines" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Job Disciplines</Link></li>
              <li><Link to="/blog" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">About</Link></li>
              <li><Link to="/templates" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Templates</Link></li>
            </ul>
            <Link to="/builder" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Build Your Resume
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Land Your Dream Job With a Standout Resume</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Discover industry-specific resume tips and tricks that will make hiring managers take notice.
          </p>
          <Link to="#disciplines" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Explore Job Disciplines
          </Link>
        </div>
      </section>

      {/* Job Disciplines Section */}
      <section id="disciplines" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Job Disciplines & Resume Advice</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your field to get tailored resume advice that highlights what employers in your industry are looking for.
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex justify-center flex-wrap mb-8">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold m-2">Engineering</button>
            <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold m-2 hover:bg-gray-300 transition-colors">Technology</button>
            <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold m-2 hover:bg-gray-300 transition-colors">Healthcare</button>
            <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold m-2 hover:bg-gray-300 transition-colors">Business & Finance</button>
            <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold m-2 hover:bg-gray-300 transition-colors">Creative Arts</button>
          </div>
          
          {/* Engineering Category Content */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Engineering Disciplines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Mechanical Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-indigo-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Mechanical Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    From automotive to aerospace, learn how to showcase your technical skills and project experience.
                  </p>
                  <Link to="/job-disciplines/mechanical-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>
              
              {/* Civil Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-cyan-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Civil Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    Highlight your infrastructure projects and technical expertise for construction and consulting roles.
                  </p>
                  <Link to="/job-disciplines/civil-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>
              
              {/* Electrical Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-green-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Electrical Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    Power up your resume with the right technical keywords and project highlights.
                  </p>
                  <Link to="/job-disciplines/electrical-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Featured Role Highlight */}
            <div className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Featured Role: Static Engineer</h3>
              <p className="text-gray-700 mb-4">
                Static engineers specialize in analyzing stationary structures and components. To stand out in this field, your resume should highlight:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Expertise in finite element analysis (FEA) software</li>
                <li>Experience with stress analysis and failure prevention</li>
                <li>Knowledge of industry standards (ASME, API, etc.)</li>
                <li>Project examples demonstrating problem-solving skills</li>
              </ul>
              <Link to="/job-disciplines/static-engineer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                How to Land a Job as a Static Engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Create Your Standout Resume?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Use our ATS-friendly resume builder to craft the perfect resume for your target role.
          </p>
          <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Build Your Resume Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <a href="mailto:support@resumecvforge.com" className="text-gray-400 hover:text-white transition-colors">
                support@resumecvforge.com
              </a>
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

export default JobDisciplines;