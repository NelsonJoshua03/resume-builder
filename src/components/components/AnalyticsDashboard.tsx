// src/components/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface AnalyticsData {
  date: string;
  pageViews: {
    home: number;
    builder: number;
    edit: number;
    premium: number;
  };
  resumeDownloads: number;
  totalUsers: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    date: new Date().toISOString().split('T')[0],
    pageViews: {
      home: 0,
      builder: 0,
      edit: 0,
      premium: 0
    },
    resumeDownloads: 0,
    totalUsers: 0
  });
  
  const [loading, setLoading] = useState(true);
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    trackPageView('Analytics Dashboard', '/admin/analytics');
    
    // Simulate API fetch
    setTimeout(() => {
      setAnalytics({
        date: new Date().toISOString().split('T')[0],
        pageViews: {
          home: localStorage.getItem('page_views_home') ? parseInt(localStorage.getItem('page_views_home')!) : 0,
          builder: localStorage.getItem('page_views_builder') ? parseInt(localStorage.getItem('page_views_builder')!) : 0,
          edit: localStorage.getItem('page_views_edit') ? parseInt(localStorage.getItem('page_views_edit')!) : 0,
          premium: localStorage.getItem('page_views_premium') ? parseInt(localStorage.getItem('page_views_premium')!) : 0
        },
        resumeDownloads: localStorage.getItem('resumeDownloads') ? parseInt(localStorage.getItem('resumeDownloads')!) : 0,
        totalUsers: localStorage.getItem('total_users') ? parseInt(localStorage.getItem('total_users')!) : 0
      });
      setLoading(false);
    }, 1000);
  }, [trackPageView]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-gray-600 text-center">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Analytics Dashboard - User Behavior Tracking"
        description="Track user behavior, page views, and resume generation metrics"
        keywords="analytics, user tracking, resume downloads, page views"
        canonicalUrl="https://careercraft.in/admin/analytics"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track user behavior and conversion metrics</p>
            </div>
            <div className="text-sm text-gray-500">
              Today: {analytics.date}
            </div>
          </div>
        
          {/* Page Views */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Home Page</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.pageViews.home}</p>
              <p className="text-sm text-gray-600">Visits</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.pageViews.builder}</p>
              <p className="text-sm text-gray-600">Visits</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Edit Resume</h3>
              <p className="text-3xl font-bold text-purple-600">{analytics.pageViews.edit}</p>
              <p className="text-sm text-gray-600">Visits</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Premium Templates</h3>
              <p className="text-3xl font-bold text-orange-600">{analytics.pageViews.premium}</p>
              <p className="text-sm text-gray-600">Visits</p>
            </div>
          </div>
        
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users Today</h3>
              <p className="text-4xl font-bold">{analytics.totalUsers}</p>
              <p className="text-sm opacity-90 mt-2">Unique visitors</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Resumes Generated</h3>
              <p className="text-4xl font-bold">{analytics.resumeDownloads}</p>
              <p className="text-sm opacity-90 mt-2">Total PDF downloads</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
              <p className="text-4xl font-bold">
                {analytics.pageViews.builder > 0 
                  ? ((analytics.resumeDownloads / analytics.pageViews.builder) * 100).toFixed(1) 
                  : '0'}%
              </p>
              <p className="text-sm opacity-90 mt-2">Builder to Download</p>
            </div>
          </div>
        
          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <div>
                    <h4 className="font-medium">Home → Resume Builder</h4>
                    <p className="text-sm text-gray-600">Users who clicked "Build Your Resume"</p>
                  </div>
                  <span className="text-xl font-bold">{localStorage.getItem('home_to_builder') || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <div>
                    <h4 className="font-medium">Builder → Edit</h4>
                    <p className="text-sm text-gray-600">Users who edited their resume details</p>
                  </div>
                  <span className="text-xl font-bold">{localStorage.getItem('builder_to_edit') || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <div>
                    <h4 className="font-medium">Premium → Edit</h4>
                    <p className="text-sm text-gray-600">Premium users who edited details</p>
                  </div>
                  <span className="text-xl font-bold">{localStorage.getItem('premium_to_edit') || '0'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">User Actions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-100 rounded">
                  <div>
                    <h4 className="font-medium">Resume Saves</h4>
                    <p className="text-sm text-gray-600">Times users saved changes</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">{localStorage.getItem('resume_saves') || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded">
                  <div>
                    <h4 className="font-medium">File Uploads</h4>
                    <p className="text-sm text-gray-600">Resume/CV files uploaded</p>
                  </div>
                  <span className="text-xl font-bold">{localStorage.getItem('file_uploads') || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-100 rounded">
                  <div>
                    <h4 className="font-medium">Template Usage</h4>
                    <p className="text-sm text-gray-600">Most popular: ATS Optimized</p>
                  </div>
                  <span className="text-xl font-bold">{localStorage.getItem('template_ats') || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        
          {/* Google Analytics Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Google Analytics Integration</h3>
            <p className="text-blue-700 mb-2">
              Full analytics available at: 
              <a 
                href="https://analytics.google.com/analytics/web/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Google Analytics Dashboard
              </a>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-600">
              <div>
                <strong>Property ID:</strong> G-JW2bS0D8YB
              </div>
              <div>
                <strong>Tracked Events:</strong> Page Views, Button Clicks, PDF Downloads
              </div>
              <div>
                <strong>Real-time Data:</strong> Available in Google Analytics
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-blue-800 mb-2">Local Storage vs Google Analytics:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <strong>Local Storage (This Dashboard):</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Instant access</li>
                    <li>• No API limits</li>
                    <li>• Basic metrics only</li>
                    <li>• Browser-specific data</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Google Analytics:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Complete analytics</li>
                    <li>• Real-time tracking</li>
                    <li>• User demographics</li>
                    <li>• Cross-device tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="mt-8 flex gap-4">
            <a 
              href="/local-analytics"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              View Local Analytics Dashboard
            </a>
            <a 
              href="/admin/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;