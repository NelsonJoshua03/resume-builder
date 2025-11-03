// src/components/job-pages/Cybersecurity.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Cybersecurity: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Cybersecurity Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build cybersecurity resume for Indian IT security jobs. Templates for security analyst, ethical hacker, network security roles in Indian companies." />
        <meta name="keywords" content="cybersecurity resume India, Indian security jobs, ethical hacker CV India, network security resume India, Indian cybersecurity jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Cybersecurity India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cybersecurity Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that showcases your security expertise for Indian IT companies and cybersecurity firms</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Essential Resume Sections for Indian Cybersecurity Professionals</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Security</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Network security and penetration testing</li>
                    <li>Vulnerability assessment and management</li>
                    <li>Security tools (Wireshark, Metasploit, Nmap)</li>
                    <li>Indian compliance standards (IT Act, GDPR equivalent)</li>
                    <li>Cloud security for Indian cloud platforms</li>
                    <li>Incident response and digital forensics</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Security Experience Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Security audits for Indian companies</li>
                    <li>Vulnerability assessments for Indian applications</li>
                    <li>Incident response for Indian security breaches</li>
                    <li>Security policy development for Indian compliance</li>
                    <li>Security training for Indian teams</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Security Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Penetration Testing</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Vulnerability Assessment</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Network Security</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Incident Response</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Security Compliance India</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Cybersecurity Professionals</h3>
              <p className="text-gray-600 mb-4">
                Highlight specific security achievements with measurable impact. Instead of "Performed security testing," 
                say "Identified and mitigated 15 critical vulnerabilities in banking application, preventing potential security breaches for Indian financial institution."
              </p>
            </div>

            <div className="text-center">
              <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Cybersecurity Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cybersecurity;