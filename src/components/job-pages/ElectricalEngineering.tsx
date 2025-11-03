// src/components/job-pages/ElectricalEngineering.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ElectricalEngineering: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Electrical Engineering Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build electrical engineering resume for Indian power, electronics jobs. Templates for power systems, electronics, embedded systems roles in Indian companies." />
        <meta name="keywords" content="electrical engineering resume India, Indian power sector jobs, electronics engineer CV India, power systems resume India, Indian electrical engineering jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Electrical Engineering India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Electrical Engineering Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that showcases your electrical expertise for Indian power, electronics, and manufacturing companies</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Essential Resume Sections for Indian Electrical Engineers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Electrical Industry</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Power systems analysis and design</li>
                    <li>Circuit design and simulation tools</li>
                    <li>PLC programming and automation</li>
                    <li>Electrical CAD (AutoCAD Electrical, EPLAN)</li>
                    <li>Indian electrical standards and codes</li>
                    <li>Renewable energy systems for Indian context</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Electrical Projects Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Power distribution systems for Indian cities</li>
                    <li>Industrial automation for Indian manufacturing</li>
                    <li>Renewable energy projects in India</li>
                    <li>Electrical system design for Indian buildings</li>
                    <li>Control systems for Indian infrastructure</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Electrical Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Power Systems</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Circuit Design</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">PLC Programming</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Automation</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Renewable Energy India</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Electrical Engineers</h3>
              <p className="text-gray-600 mb-4">
                Highlight specific projects with energy efficiency or cost savings relevant to Indian market. Instead of "Designed electrical system," 
                say "Designed solar-powered electrical system for factory in Maharashtra, reducing energy costs by 40% and achieving ROI in 3 years."
              </p>
            </div>

            <div className="text-center">
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Electrical Engineering Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ElectricalEngineering;