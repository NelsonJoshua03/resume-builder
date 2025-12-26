// src/components/job-pages/SoftwareDevelopment.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SoftwareDevelopment: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Software Development Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build software development resume for Indian IT jobs. Templates for full-stack, frontend, backend developer roles in Indian tech companies and startups." />
        <meta name="keywords" content="software development resume India, Indian IT jobs, full-stack developer CV India, frontend developer resume India, Indian software jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Software Development India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Software Development Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that showcases your coding expertise for Indian tech companies, startups, and IT services</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">💻 Essential Resume Sections for Indian Software Developers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Tech Stack</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Programming languages (Java, Python, JavaScript)</li>
                    <li>Frameworks (React, Angular, Node.js, Spring Boot)</li>
                    <li>Databases (MySQL, MongoDB, PostgreSQL)</li>
                    <li>Cloud platforms (AWS, Azure, GCP) used in India</li>
                    <li>DevOps tools (Docker, Kubernetes, Jenkins)</li>
                    <li>Mobile development (Android, iOS, React Native)</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Software Projects Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Web applications for Indian businesses</li>
                    <li>Mobile apps for Indian users</li>
                    <li>E-commerce platforms for Indian market</li>
                    <li>API development for Indian services</li>
                    <li>Microservices architecture for Indian scale</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Tech Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Full-Stack Development</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">React.js</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Node.js</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">REST API</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Cloud Computing India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Agile Methodology</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Software Developers</h3>
              <p className="text-gray-600 mb-4">
                Showcase your impact with performance metrics relevant to Indian projects. Instead of "Developed web application," 
                say "Built scalable e-commerce platform serving 10,000+ Indian users daily, reducing page load time by 40% and increasing conversions by 25%."
              </p>
            </div>

            <div className="text-center">
              <Link to="/free-resume-builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Software Development Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SoftwareDevelopment;