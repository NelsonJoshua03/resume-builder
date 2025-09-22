
import React from 'react';
import { Link } from 'react-router-dom';

const Cybersecurity: React.FC = () => {
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Electrical Engineering Resume Guide</h1>
          <p className="text-xl text-gray-600 mb-8">Content coming soon...</p>
          <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
            Create Your Resume
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cybersecurity;