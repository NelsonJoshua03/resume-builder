// src/components/JobDisciplines.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const JobDisciplines: React.FC = () => {
  return (
    <>
      <SEO
        title="Job-Specific Resume Advice for Engineers & Developers"
        description="Get tailored resume tips for mechanical engineering, software development, cybersecurity and more. Industry-specific advice to make your CV stand out."
        keywords="engineering resume tips, software developer CV, mechanical engineering resume, cybersecurity resume, job-specific resume advice, ATS optimization by industry"
        canonicalUrl="https://resumecvforge.netlify.app/job-disciplines"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Land Your Dream Job With a Standout Resume</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Discover industry-specific resume tips and tricks that will make hiring managers take notice.
          </p>
          <Link to="#disciplines" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Explore Job Disciplines
          </Link>
        </div>
      </section>

      {/* Job Disciplines Section */}
      <section id="disciplines" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Job Disciplines & Resume Advice</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your field to get tailored resume advice that highlights what employers in your industry are looking for.
            </p>
          </div>
          
          {/* Engineering Category Content */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Engineering Disciplines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Mechanical Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-indigo-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Mechanical Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    From automotive to aerospace, learn how to showcase your technical skills and project experience.
                  </p>
                  <Link to="/job-disciplines/mechanical-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>

              {/* Fresh Graduate Section */}
<div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-lg mb-8">
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-4">🎓 Recently Graduated?</h2>
    <p className="text-xl mb-6 max-w-2xl mx-auto">
      Learn how to create a standout resume when you have little to no work experience. 
      Transform your academic achievements into professional credentials.
    </p>
    <Link 
      to="/fresh-graduate-guide" 
      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
    >
      Fresh Graduate Resume Guide
    </Link>
  </div>
</div>
              
              {/* Civil Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-cyan-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Civil Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    Highlight your infrastructure projects and technical expertise for construction and consulting roles.
                  </p>
                  <Link to="/job-disciplines/civil-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>
              
              {/* Electrical Engineering Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-green-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Electrical Engineering</h3>
                  <p className="text-gray-600 mb-4">
                    Power up your resume with the right technical keywords and project highlights.
                  </p>
                  <Link to="/job-disciplines/electrical-engineering" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Get Resume Tips →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Featured Role Highlight */}
            <div className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Featured Role: Static Engineer</h3>
              <p className="text-gray-700 mb-4">
                Static engineers specialize in analyzing stationary structures and components. To stand out in this field, your resume should highlight:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Expertise in finite element analysis (FEA) software</li>
                <li>Experience with stress analysis and failure prevention</li>
                <li>Knowledge of industry standards (ASME, API, etc.)</li>
                <li>Project examples demonstrating problem-solving skills</li>
              </ul>
              <Link to="/job-disciplines/static-engineer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                How to Land a Job as a Static Engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Create Your Standout Resume?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Use our ATS-friendly resume builder to craft the perfect resume for your target role.
          </p>
          <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Build Your Resume Now
          </Link>
        </div>
      </section>
    </>
  );
};

export default JobDisciplines;