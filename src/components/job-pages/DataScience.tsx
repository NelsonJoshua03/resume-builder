// src/components/job-pages/DataScience.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const DataScience: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Data Science Resume Guide for India | CareerCraft.in</title>
        <meta name="description" content="Build data science resume for Indian analytics jobs. Templates for data analyst, ML engineer, business analyst roles in Indian companies." />
        <meta name="keywords" content="data science resume India, Indian analytics jobs, machine learning CV India, data analyst resume India, Indian data science jobs" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link to="/job-disciplines" className="hover:text-blue-600">Job Disciplines</Link>
              <span>→</span>
              <span className="text-gray-700">Data Science India</span>
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Science Resume Guide for Indian Market</h1>
            <p className="text-xl text-gray-600 mb-8">Create a resume that showcases your analytics expertise for Indian tech companies and startups</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Essential Resume Sections for Indian Data Scientists</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Technical Skills for Indian Data Science</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Python, R, SQL for Indian data environments</li>
                    <li>Machine learning frameworks (scikit-learn, TensorFlow)</li>
                    <li>Data visualization (Tableau, Power BI, Matplotlib)</li>
                    <li>Big data technologies (Hadoop, Spark)</li>
                    <li>Statistical analysis and hypothesis testing</li>
                    <li>Cloud platforms used in India (AWS, Azure, GCP)</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-2">Indian Data Projects Examples</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Predictive modeling for Indian business problems</li>
                    <li>Customer segmentation for Indian markets</li>
                    <li>Sales forecasting for Indian companies</li>
                    <li>Recommendation systems for Indian e-commerce</li>
                    <li>Fraud detection for Indian financial services</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Keywords Indian Data Science Recruiters Look For</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Machine Learning</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Data Analysis</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Predictive Modeling</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Python Programming</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Business Intelligence</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Pro Tip for Indian Data Scientists</h3>
              <p className="text-gray-600 mb-4">
                Quantify your impact with business metrics relevant to Indian context. Instead of "Built ML model," 
                say "Developed customer churn prediction model that reduced churn by 20% for Indian telecom company, saving ₹50 lakh annually."
              </p>
            </div>

            <div className="text-center">
              <Link to="/free-resume-builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your Indian Data Science Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataScience;