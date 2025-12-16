// src/components/job-pages/MechanicalEngineering.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const MechanicalEngineering: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Mechanical Engineering Resume Templates & Examples 2024 | CareerCraft.in</title>
        <meta 
          name="description" 
          content="Free ATS-friendly mechanical engineering resume templates for Indian job market. Create professional CVs for static engineer, HVAC, automotive, and manufacturing roles in Indian companies." 
        />
        <meta 
          name="keywords" 
          content="mechanical engineering resume India, static engineer CV India, HVAC engineer resume India, automotive engineer template India, manufacturing engineer CV India, mechanical designer resume India" 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Mechanical Engineering India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mechanical Engineering Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that stands out in the competitive Indian mechanical engineering field</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 Key Resume Sections for Indian Mechanical Engineers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Industry</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>CAD Software (SolidWorks, AutoCAD, CATIA) for Indian standards</li>
                    <li>Finite Element Analysis (FEA) for Indian applications</li>
                    <li>Computational Fluid Dynamics (CFD) for Indian conditions</li>
                    <li>GD&T and technical drawings per Indian standards</li>
                    <li>MATLAB, Python for Indian engineering calculations</li>
                    <li>Knowledge of Indian manufacturing processes</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Project Experience Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Product design and development for Indian market</li>
                    <li>Thermal and stress analysis for Indian conditions</li>
                    <li>Manufacturing process improvement in Indian factories</li>
                    <li>Prototype testing and validation for Indian products</li>
                    <li>Automation projects for Indian manufacturing</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Mechanical Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">CAD Design India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">FEA Analysis</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Thermodynamics</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Mechatronics India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Product Development India</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Manufacturing</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Mechanical Engineers</h3>
              <p className="text-gray-600 mb-4">
                Highlight specific Indian projects with quantifiable results. Instead of "Designed mechanical components," 
                say "Reduced component weight by 25% through optimized design for Indian automotive application while maintaining structural integrity and reducing material costs by 15%."
              </p>
            </div>

            <div className="text-center">
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Mechanical Engineering Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MechanicalEngineering;