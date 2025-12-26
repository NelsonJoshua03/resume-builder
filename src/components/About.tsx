// src/components/About.tsx - UPDATED VERSION
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About CareerCraft.in - Free ATS Resume Builder & Job Portal for India</title>
        <meta 
          name="description" 
          content="Learn about CareerCraft.in's mission to help Indian job seekers create professional, ATS-friendly resumes for free. Find jobs across IT, engineering, and more sectors in India." 
        />
        <meta 
          name="keywords" 
          content="about CareerCraft India, free resume builder India, ATS resume maker, Indian job portal, engineering jobs India, IT jobs India, fresher jobs India" 
        />
        <link rel="canonical" href="https://careercraft.in/about" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About CareerCraft.in</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission for India</h2>
            <p className="text-gray-600 mb-6">
              CareerCraft.in was created to empower Indian job seekers with professional career tools. 
              We believe that every candidate in India deserves access to ATS-optimized resume building 
              and genuine job opportunities, regardless of their background or budget.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose CareerCraft.in?</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">🚀 ATS-Optimized for India</h3>
                <p className="text-gray-600">Our templates are designed specifically for Indian job markets and ATS systems used by Indian companies.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">💯 Free Forever</h3>
                <p className="text-gray-600">Completely free resume builder and job portal for Indian job seekers - no hidden costs.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">⚡ Instant Download</h3>
                <p className="text-gray-600">Create and download your professional resume in minutes, tailored for Indian employers.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">🔒 Privacy First</h3>
                <p className="text-gray-600">Your data stays secure - no registration required, complete privacy protection.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">India-Focused Job Portal</h2>
            <p className="text-gray-600 mb-4">
              Unlike generic platforms, CareerCraft.in is built specifically for the Indian job market. 
              We feature:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Jobs across major Indian cities: Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune</li>
              <li>Sectors tailored for India: IT/Software, Engineering, Data Science, Banking, Healthcare</li>
              <li>Salary ranges in Indian Rupees (INR)</li>
              <li>Walk-in drives and job fairs across India</li>
              <li>Opportunities for freshers and experienced professionals</li>
            </ul>

            {/* Developer Credit Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Platform</h2>
              <p className="text-gray-600 mb-4">
                CareerCraft.in is developed by <span className="font-semibold">Nelson Joshua A</span> with the help of <span className="font-semibold">DeepSeek AI</span> in 2025.
                The platform is built to serve Indian job seekers with free, high-quality career tools.
              </p>
              <p className="text-gray-600">
                Today, CareerCraft.in has helped thousands of Indian professionals and freshers create professional resumes 
                that get them noticed by employers in competitive job markets across India's top cities and sectors.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                Have questions or need assistance? We're always happy to help Indian job seekers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@careercraft.in" className="text-blue-600 hover:underline">
                    contact@careercraft.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div>
              <Link to="/free-resume-builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block mx-2">
                Build Your Indian Resume
              </Link>
              <Link to="/job-applications" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 inline-block mx-2">
                Find Jobs in India
              </Link>
            </div>
            <p className="text-gray-600 text-sm">
              Join thousands of Indian job seekers who have found success with CareerCraft.in
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;