// src/components/About.tsx
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

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2024, CareerCraft.in emerged from the need to bridge the gap between Indian job seekers 
              and quality employment opportunities. Our team of HR professionals, recruiters from top Indian companies, 
              and developers came together to create a platform that understands the unique challenges of the Indian job market.
            </p>
            <p className="text-gray-600">
              Today, we've helped thousands of Indian professionals and freshers create professional resumes 
              that get them noticed by employers in competitive job markets across India's top cities and sectors.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">For Indian Employers</h2>
            <p className="text-gray-600 mb-4">
              CareerCraft.in also serves Indian companies looking for qualified talent. Our platform offers:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-700 mb-2">📝 Easy Job Posting</h3>
                <p className="text-gray-600">Post jobs quickly with our admin panel, reach qualified Indian candidates.</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-teal-700 mb-2">🎯 Targeted Reach</h3>
                <p className="text-gray-600">Connect with candidates from specific Indian cities and sectors.</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div>
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block mx-2">
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