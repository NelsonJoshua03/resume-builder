// src/components/job-pages/StaticEngineer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const StaticEngineer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">ResumeCVForge</Link>
            <div className="flex space-x-6">
              <Link to="/job-disciplines" className="text-gray-700 hover:text-blue-600">Job Disciplines</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/builder" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Build Resume</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>→</span>
            <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
            <span>→</span>
            <Link to="/job-disciplines/mechanical-engineering" className="hover:text-blue-600">Mechanical Engineering</Link>
            <span>→</span>
            <span className="text-gray-700">Static Engineer</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Land a Job as a Static Engineer</h1>
          <p className="text-xl text-gray-600 mb-8">Expert resume tips and career advice for static engineering professionals</p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Resume Highlights for Static Engineers</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Technical Skills to Feature</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Finite Element Analysis (FEA) software</li>
                  <li>Stress analysis and failure prevention</li>
                  <li>ASME, API, and other industry standards</li>
                  <li>CAD software proficiency</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Project Experience Examples</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Structural integrity assessments</li>
                  <li>Pressure vessel design and analysis</li>
                  <li>Piping system stress analysis</li>
                  <li>Equipment failure investigations</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Recruiters Look For</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Static Analysis</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">FEA</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Stress Analysis</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Structural Integrity</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">ASME Standards</span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip</h3>
            <p className="text-gray-600 mb-4">
              Quantify your achievements with specific numbers. Instead of "Improved structural designs," 
              say "Reduced material costs by 15% while maintaining structural integrity through optimized FEA analysis."
            </p>
          </div>

          <div className="text-center">
            <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Create Your Static Engineer Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticEngineer;