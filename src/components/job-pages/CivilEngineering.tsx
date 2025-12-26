// src/components/job-pages/CivilEngineering.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CivilEngineering: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Civil Engineering Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build a civil engineering resume for Indian job market. Templates for infrastructure, construction, structural engineering roles in Indian companies." />
        <meta name="keywords" content="civil engineering resume India, Indian infrastructure jobs, construction engineer CV India, structural engineer resume India, Indian civil engineering jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Civil Engineering India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Civil Engineering Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Build a resume that showcases your infrastructure expertise for Indian construction and engineering companies</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏗️ Essential Resume Sections for Indian Civil Engineers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Projects</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Structural analysis software (STAAD.Pro, SAP2000, ETABS)</li>
                    <li>AutoCAD Civil 3D and Revit for Indian standards</li>
                    <li>Project management and scheduling for Indian timelines</li>
                    <li>Indian construction methods and materials knowledge</li>
                    <li>Geotechnical analysis for Indian soil conditions</li>
                    <li>Knowledge of Indian IS codes and standards</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Project Experience Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Bridge and highway design for Indian infrastructure</li>
                    <li>Building structural systems for Indian climate</li>
                    <li>Site development and grading for Indian terrain</li>
                    <li>Water resources projects for Indian needs</li>
                    <li>Smart city and urban development projects in India</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Structural Design India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Project Management</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Indian Construction</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Infrastructure Development</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Site Development India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">IS Codes</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Civil Engineers</h3>
              <p className="text-gray-600 mb-4">
                Highlight specific Indian projects with quantifiable results. Instead of "Worked on construction project," 
                say "Managed construction of residential complex in Bangalore, completing project 15 days ahead of schedule while maintaining quality standards."
              </p>
            </div>

            <div className="text-center">
              <Link to="/free-resume-builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Civil Engineering Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CivilEngineering;