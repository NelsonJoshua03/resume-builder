// src/components/FreshGraduateGuide.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const FreshGraduateGuide: React.FC = () => {
  return (
    <>
      <SEO
        title="Fresh Graduate Resume Guide - Land Your First Job"
        description="Step-by-step guide for recent college graduates to create professional resumes. Learn how to highlight education, projects, and skills for your first job application."
        keywords="fresh graduate resume, college graduate CV, first job resume, entry-level resume, student resume template, no experience resume"
        canonicalUrl="https://resumecvforge.netlify.app/fresh-graduate-guide"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              From Classroom to Career: Your First Professional Resume
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just graduated? Learn how to transform your academic achievements into a compelling resume that gets noticed by employers.
            </p>
          </div>

          {/* Step-by-Step Guide */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Building Your First Resume: Step by Step</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose the Right Template</h3>
                  <p className="text-gray-600">
                    <strong>For Technical Fields (Engineering, CS):</strong> Use <strong>Modern</strong> template to highlight technical skills and projects<br/>
                    <strong>For Creative Fields (Design, Marketing):</strong> Use <strong>Creative</strong> template to showcase creativity<br/>
                    <strong>For Business/Corporate:</strong> Use <strong>Minimalist</strong> for clean, professional look
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Craft Your Professional Summary</h3>
                  <p className="text-gray-600 mb-2">
                    Focus on your education, enthusiasm, and key skills. Example:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "Recent [Your Degree] graduate from [Your University] with strong foundation in [Key Skills]. 
                      Eager to apply academic knowledge and passion for [Your Field] in a challenging entry-level position. 
                      Proven ability to [One Key Achievement]."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Highlight Your Education</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">✅ Include:</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>Degree and major</li>
                        <li>University name and location</li>
                        <li>Graduation date</li>
                        <li>GPA (if 3.0 or higher)</li>
                        <li>Relevant coursework</li>
                        <li>Academic honors/awards</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">❌ Avoid:</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>High school information</li>
                        <li>Irrelevant coursework</li>
                        <li>Personal information</li>
                        <li>Low GPA details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Showcase Projects & Academic Work</h3>
                  <p className="text-gray-600 mb-2">
                    Your projects are your professional experience! Describe them using action verbs:
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Instead of:</strong> "Worked on a school project about machine learning"<br/>
                      <strong>Write:</strong> "Developed a machine learning model that improved prediction accuracy by 25% using Python and scikit-learn"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Highlight Skills Effectively</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-semibold text-blue-700 mb-1">Technical Skills</h4>
                      <p className="text-xs text-gray-600">Programming, software, tools specific to your field</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-semibold text-green-700 mb-1">Soft Skills</h4>
                      <p className="text-xs text-gray-600">Communication, teamwork, problem-solving</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-semibold text-purple-700 mb-1">Industry Knowledge</h4>
                      <p className="text-xs text-gray-600">Concepts, methodologies, best practices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discipline-Specific Tips */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Discipline-Specific Tips</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Engineering */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Engineering Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Highlight technical projects and design experience</li>
                  <li>Include specific software/tools (AutoCAD, MATLAB, etc.)</li>
                  <li>Mention any internships or co-op experiences</li>
                  <li>Show problem-solving abilities with specific examples</li>
                  <li>Include relevant certifications or training</li>
                </ul>
              </div>

              {/* Computer Science */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Computer Science Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Create a projects section with GitHub links</li>
                  <li>List programming languages and frameworks</li>
                  <li>Include hackathons or coding competitions</li>
                  <li>Mention specific technologies and tools used</li>
                  <li>Highlight any open-source contributions</li>
                </ul>
              </div>

              {/* Business */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Business Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Focus on analytical and leadership skills</li>
                  <li>Include relevant coursework and group projects</li>
                  <li>Highlight any internships or part-time work</li>
                  <li>Show quantitative achievements (if any)</li>
                  <li>Mention relevant software (Excel, Salesforce, etc.)</li>
                </ul>
              </div>

              {/* General */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">All Disciplines</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Tailor resume to each job application</li>
                  <li>Use keywords from job descriptions</li>
                  <li>Quantify achievements where possible</li>
                  <li>Keep it to one page maximum</li>
                  <li>Proofread multiple times!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Build Your Resume?</h2>
            <p className="text-gray-600 mb-6">Use our ATS-friendly resume builder to create your professional resume in minutes</p>
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Start Building Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreshGraduateGuide;