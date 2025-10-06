// src/components/About.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO
        title="About ResumeCVForge - Free Online Resume Builder"
        description="Learn about ResumeCVForge's mission to help job seekers create professional, ATS-friendly resumes for free. No sign-up required, privacy-first approach."
        keywords="about ResumeCVForge, free resume builder story, mission, privacy-focused resume tool, no registration required"
        canonicalUrl="https://resumecvforge.netlify.app/about"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About ResumeCVForge</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              ResumeCVForge was created to democratize access to professional resume building tools. 
              We believe that everyone deserves a chance to showcase their skills and experience in the best possible light, 
              regardless of their budget or technical expertise.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">🚀 ATS-Optimized</h3>
                <p className="text-gray-600">Our templates are designed to pass through Applicant Tracking Systems seamlessly.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">💯 Free Forever</h3>
                <p className="text-gray-600">No hidden costs, no premium walls - all features are completely free.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">⚡ Instant Download</h3>
                <p className="text-gray-600">Create and download your professional resume in minutes, not hours.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">🔒 Privacy First</h3>
                <p className="text-gray-600">Your data stays on your device - no registration required.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2024, ResumeCVForge emerged from the frustration of seeing qualified candidates rejected 
              due to poorly formatted resumes. Our team of HR professionals, recruiters, and developers came together 
              to create a solution that would level the playing field for job seekers worldwide.
            </p>
            <p className="text-gray-600">
              Today, we've helped thousands of users create professional resumes that get them noticed by employers 
              in competitive job markets across various industries.
            </p>
          </div>

          <div className="text-center">
            <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Start Building Your Resume
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;