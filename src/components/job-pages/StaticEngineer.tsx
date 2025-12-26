// src/components/job-pages/StaticEngineer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const StaticEngineer: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Static Engineer Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build static engineering resume for Indian oil & gas, chemical plants. Templates for pressure vessel, piping, structural analysis roles in Indian industries." />
        <meta name="keywords" content="static engineer resume India, Indian oil & gas jobs, pressure vessel engineer CV India, piping engineer resume India, Indian static engineering jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <Link to="/job-disciplines/mechanical-engineering" className="hover:text-blue-600">Mechanical Engineering India</Link>
              <span>→</span>
              <span className="text-gray-700">Static Engineer India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Land a Static Engineer Job in Indian Industries</h1>
            <p className="text-xl text-gray-600 mb-8">Expert resume tips and career advice for static engineering professionals in Indian oil & gas, chemical, and power sectors</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Resume Highlights for Indian Static Engineers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Static Equipment</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Finite Element Analysis (FEA) software for Indian standards</li>
                    <li>Stress analysis and failure prevention for Indian conditions</li>
                    <li>ASME, API, and Indian industry standards knowledge</li>
                    <li>Pressure vessel design per Indian requirements</li>
                    <li>Piping stress analysis for Indian plants</li>
                    <li>Material selection for Indian environments</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Static Engineering Projects</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Structural integrity assessments for Indian refineries</li>
                    <li>Pressure vessel design for Indian chemical plants</li>
                    <li>Piping system stress analysis for Indian power plants</li>
                    <li>Equipment failure investigations in Indian industries</li>
                    <li>Static equipment reliability for Indian operations</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Static Engineering Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Static Analysis India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">FEA</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Stress Analysis</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Structural Integrity</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">ASME Standards</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Pressure Vessel Design</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Static Engineers</h3>
              <p className="text-gray-600 mb-4">
                Quantify your achievements with safety and cost metrics relevant to Indian industry. Instead of "Improved structural designs," 
                say "Reduced material costs by 15% while maintaining structural integrity through optimized FEA analysis for Indian refinery project, ensuring compliance with Indian safety standards."
              </p>
            </div>

            <div className="text-center">
              <Link to="/free-resume-builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Static Engineer Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaticEngineer;