// src/components/FreshGraduateGuide.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FreshGraduateGuide: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Fresh Graduate Resume Guide for India - Land Your First Job</title>
        <meta name="description" content="Step-by-step guide for Indian college graduates to create professional resumes. Learn how to highlight education, projects, and skills for Indian job market." />
        <meta name="keywords" content="fresh graduate resume India, Indian college graduate CV, first job resume India, entry-level resume India, student resume template India" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              From Indian Classroom to Career: Your First Professional Resume
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just graduated from Indian college? Learn how to transform your academic achievements into a compelling resume that gets noticed by Indian employers.
            </p>
          </div>

          {/* Step-by-Step Guide */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Building Your First Indian Resume: Step by Step</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose the Right Template for Indian Market</h3>
                  <p className="text-gray-600">
                    <strong>For IT/Software Fields:</strong> Use <strong>Modern</strong> template to highlight technical skills and projects<br/>
                    <strong>For Engineering Fields:</strong> Use <strong>Professional</strong> template for technical roles<br/>
                    <strong>For Business/Management:</strong> Use <strong>Minimalist</strong> for clean, corporate look
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Craft Your Professional Summary for Indian Recruiters</h3>
                  <p className="text-gray-600 mb-2">
                    Focus on your Indian education, enthusiasm, and key skills. Example:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "Recent [Your Degree] graduate from [Your Indian University] with strong foundation in [Key Skills]. 
                      Eager to apply academic knowledge and passion for [Your Field] in a challenging entry-level position at Indian company. 
                      Proven ability to [One Key Achievement from projects/internships]."
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Highlight Your Indian Education</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">✅ Include for Indian Market:</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>Degree and major/specialization</li>
                        <li>Indian University name and location</li>
                        <li>Graduation year and month</li>
                        <li>CGPA/Percentage (if 7.0+ CGPA or 70%+)</li>
                        <li>Relevant coursework for Indian jobs</li>
                        <li>Academic honors/awards</li>
                        <li>University projects and internships</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">❌ Avoid in Indian Resume:</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>School/10th/12th marks (unless exceptional)</li>
                        <li>Irrelevant personal information</li>
                        <li>Photographs (unless specifically requested)</li>
                        <li>Low academic scores</li>
                        <li>Hobbies unrelated to job</li>
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Showcase Indian Projects & Internships</h3>
                  <p className="text-gray-600 mb-2">
                    Your academic projects and Indian internships are your professional experience! Describe them using action verbs:
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Instead of:</strong> "Worked on a college project about web development"<br/>
                      <strong>Write:</strong> "Developed a responsive e-commerce website using React and Node.js that improved user engagement by 40% during college project"
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Highlight Skills for Indian Job Market</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-semibold text-blue-700 mb-1">Technical Skills</h4>
                      <p className="text-xs text-gray-600">Programming, software, tools demanded by Indian companies</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-semibold text-green-700 mb-1">Soft Skills</h4>
                      <p className="text-xs text-gray-600">Communication, teamwork, problem-solving valued in Indian workplace</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-semibold text-purple-700 mb-1">Industry Knowledge</h4>
                      <p className="text-xs text-gray-600">Concepts, methodologies relevant to Indian industry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indian Market Specific Tips */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Indian Industry-Specific Tips</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* IT/Software */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">IT/Software Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Create a projects section with GitHub links</li>
                  <li>List programming languages and frameworks used in Indian IT companies</li>
                  <li>Include hackathons, coding competitions participated in India</li>
                  <li>Mention specific Indian technologies and tools experience</li>
                  <li>Highlight any internships at Indian startups/companies</li>
                </ul>
              </div>

              {/* Engineering */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Engineering Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Highlight technical projects and design experience</li>
                  <li>Include software/tools used in Indian engineering firms</li>
                  <li>Mention any Indian industry internships or training</li>
                  <li>Show problem-solving abilities with Indian context examples</li>
                  <li>Include relevant Indian certifications or training</li>
                </ul>
              </div>

              {/* Business/Management */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Business Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Focus on analytical and leadership skills for Indian businesses</li>
                  <li>Include relevant coursework and group projects</li>
                  <li>Highlight any internships at Indian companies</li>
                  <li>Show quantitative achievements with Indian market context</li>
                  <li>Mention software used in Indian corporate environment</li>
                </ul>
              </div>

              {/* General Indian Tips */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">All Indian Graduates</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Tailor resume to each Indian company's requirements</li>
                  <li>Use keywords from Indian job descriptions</li>
                  <li>Quantify achievements where possible</li>
                  <li>Keep it to one page maximum for Indian recruiters</li>
                  <li>Include Indian contact information properly</li>
                  <li>Proofread multiple times for Indian English standards</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Build Your Indian Resume?</h2>
            <p className="text-gray-600 mb-6">Use our ATS-friendly resume builder optimized for Indian job market to create your professional resume in minutes</p>
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Start Building Indian Resume Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreshGraduateGuide;