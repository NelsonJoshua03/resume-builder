// src/components/job-pages/MechanicalEngineering.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from "../SEO";

const MechanicalEngineering: React.FC = () => {
  return (
    <>
      <SEO
        title="Mechanical Engineering Resume Templates & Examples 2024"
        description="Free ATS-friendly mechanical engineering resume templates. Create professional CVs for static engineer, HVAC, automotive, and manufacturing roles. Download PDF templates."
        keywords="mechanical engineering resume, static engineer CV, HVAC engineer resume, automotive engineer template, manufacturing engineer CV, mechanical designer resume"
        canonicalUrl="https://resumecvforge.netlify.app/job-disciplines/mechanical-engineering"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Mechanical Engineering</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mechanical Engineering Resume Guide</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that stands out in the competitive mechanical engineering field</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 Key Resume Sections for Mechanical Engineers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills to Feature</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>CAD Software (SolidWorks, AutoCAD, CATIA)</li>
                    <li>Finite Element Analysis (FEA)</li>
                    <li>Computational Fluid Dynamics (CFD)</li>
                    <li>GD&T and technical drawings</li>
                    <li>MATLAB, Python, or other programming</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Project Experience Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Product design and development</li>
                    <li>Thermal and stress analysis</li>
                    <li>Manufacturing process improvement</li>
                    <li>Prototype testing and validation</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">CAD Design</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">FEA Analysis</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Thermodynamics</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Mechatronics</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Product Development</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip</h3>
              <p className="text-gray-600 mb-4">
                Highlight specific projects with quantifiable results. Instead of "Designed mechanical components," 
                say "Reduced component weight by 25% through optimized design while maintaining structural integrity."
              </p>
            </div>

            <div className="text-center">
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Mechanical Engineering Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MechanicalEngineering;