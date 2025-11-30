// src/components/About.tsx - UPDATED WITH CONTACT INFO
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

            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                Have questions or need assistance? We're always happy to help Indian job seekers and employers.
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
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <a href="https://www.linkedin.com/in/career-coach-expert-2a47a0399" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-pink-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.017 0z"/>
                  </svg>
                  <a href="https://www.instagram.com/career_craft_india/?hl=en" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div>
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block mx-2">
                Build Your Indian Resume
              </Link>
              <Link to="/premium" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 inline-block mx-2">
                Premium Templates
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