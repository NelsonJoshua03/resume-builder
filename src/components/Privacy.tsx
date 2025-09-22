// src/components/Privacy.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                ResumeCVForge is committed to protecting your privacy. We designed our service with privacy in mind:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>We do not require registration or personal accounts</li>
                <li>Your resume data is processed locally in your browser</li>
                <li>We do not store your resume information on our servers</li>
                <li>We only collect anonymous usage statistics to improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Information</h2>
              <p className="text-gray-600">
                Any information you enter into the resume builder remains on your device. 
                We use anonymous analytics to understand how users interact with our platform 
                and make improvements to the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Third-Party Services</h2>
              <p className="text-gray-600 mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Google Analytics (anonymous usage data)</li>
                <li>Netlify (hosting services)</li>
                <li>Font Awesome (icons)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, correct, or delete any personal information. 
                Since we don't store your personal data on our servers, you maintain full control 
                over your information at all times.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@resumecvforge.com" className="text-blue-600 hover:underline">
                  privacy@resumecvforge.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;