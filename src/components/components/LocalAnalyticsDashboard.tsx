// src/components/LocalAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const LocalAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<any>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Collect all localStorage tracking data
    const data: any = {};
    
    // Page Views
    data.home = localStorage.getItem('page_views_home') || '0';
    data.builder = localStorage.getItem('page_views_builder') || '0';
    data.edit = localStorage.getItem('page_views_edit') || '0';
    data.premium = localStorage.getItem('page_views_premium') || '0';
    
    // Conversions
    data.homeToBuilder = localStorage.getItem('home_to_builder') || '0';
    data.builderToEdit = localStorage.getItem('builder_to_edit') || '0';
    data.premiumToEdit = localStorage.getItem('premium_to_edit') || '0';
    
    // Resume Stats
    data.downloads = localStorage.getItem('resumeDownloads') || '0';
    data.saves = localStorage.getItem('resume_saves') || '0';
    data.uploads = localStorage.getItem('file_uploads') || '0';
    
    // Users
    data.totalUsers = localStorage.getItem('total_users') || '0';
    data.userId = localStorage.getItem('user_id') || 'Not set';
    
    // Collect all template usage
    data.templates = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('template_') || key.startsWith('premium_template_')) {
        data.templates[key] = localStorage.getItem(key);
      }
    });
    
    // Collect daily data
    data.dailyData = {};
    const today = new Date().toISOString().split('T')[0];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('daily_')) {
        data.dailyData[key] = localStorage.getItem(key);
      }
    });
    
    setAnalytics(data);
  }, [refreshKey]);

  const resetAnalytics = () => {
    if (window.confirm('Are you sure you want to reset all local analytics data?\nThis will delete all tracking data from this browser.')) {
      // Keep only non-analytics localStorage items
      const itemsToKeep = ['user_id'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!itemsToKeep.includes(key) && 
            (key.startsWith('page_views_') || 
             key.startsWith('daily_') ||
             key.startsWith('template_') ||
             key.startsWith('premium_template_') ||
             key === 'resumeDownloads' ||
             key === 'resume_saves' ||
             key === 'file_uploads' ||
             key === 'total_users' ||
             key.includes('_to_'))) {
          localStorage.removeItem(key);
        }
      });
      setRefreshKey(prev => prev + 1);
      alert('Local analytics data has been reset!');
    }
  };

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      analytics: analytics
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Analytics data exported!');
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <SEO
        title="Local Analytics Dashboard - CareerCraft Tracking"
        description="View local analytics data for CareerCraft resume builder. Track page views, conversions, and user behavior."
        keywords="local analytics, user tracking, resume builder analytics, page views tracking"
        canonicalUrl="https://careercraft.in/local-analytics"
      />
      
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Local Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time tracking data from this browser</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export JSON
              </button>
              <button
                onClick={resetAnalytics}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-500 mb-1">Total Page Views</div>
              <div className="text-2xl font-bold text-blue-600">
                {(+analytics.home + +analytics.builder + +analytics.edit + +analytics.premium).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-500 mb-1">PDF Downloads</div>
              <div className="text-2xl font-bold text-green-600">{analytics.downloads}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-500 mb-1">Unique Users</div>
              <div className="text-2xl font-bold text-purple-600">{analytics.totalUsers}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.builder > 0 
                  ? ((analytics.downloads / analytics.builder) * 100).toFixed(1) 
                  : '0'}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Page Views Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-500">📊</span>
                Page Views
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Home Page</h3>
                    <p className="text-sm text-gray-600">Landing page views</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{analytics.home}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Resume Builder</h3>
                    <p className="text-sm text-gray-600">Template selection page</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">{analytics.builder}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Edit Resume</h3>
                    <p className="text-sm text-gray-600">Resume information editor</p>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{analytics.edit}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Premium Templates</h3>
                    <p className="text-sm text-gray-600">Premium designs page</p>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{analytics.premium}</span>
                </div>
              </div>
            </div>

            {/* User Actions Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-green-500">🚀</span>
                User Actions
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                  <div>
                    <h3 className="font-semibold">PDF Downloads</h3>
                    <p className="text-sm text-gray-600">Resumes generated</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">{analytics.downloads}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Resume Saves</h3>
                    <p className="text-sm text-gray-600">Times changes were saved</p>
                  </div>
                  <span className="text-xl font-bold">{analytics.saves}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                  <div>
                    <h3 className="font-semibold">File Uploads</h3>
                    <p className="text-sm text-gray-600">Resume/CV files uploaded</p>
                  </div>
                  <span className="text-xl font-bold">{analytics.uploads}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-100 rounded-lg">
                  <div>
                    <h3 className="font-semibold">User ID</h3>
                    <p className="text-sm text-gray-600">Your unique identifier</p>
                  </div>
                  <span className="text-sm font-mono truncate max-w-[150px]">{analytics.userId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-500">🔄</span>
              Conversion Funnel
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Home Page Visitors</h3>
                  <p className="text-sm text-gray-600">Total visits to home page</p>
                </div>
                <div className="text-xl font-bold">{analytics.home}</div>
              </div>
              
              <div className="flex items-center gap-4 ml-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">↓</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Clicked "Build Resume"</h3>
                  <p className="text-sm text-gray-600">Converted to Resume Builder</p>
                </div>
                <div className="text-xl font-bold text-green-600">{analytics.homeToBuilder}</div>
              </div>
              
              <div className="flex items-center gap-4 ml-12">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">2</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Resume Builder Visitors</h3>
                  <p className="text-sm text-gray-600">Viewed template selection</p>
                </div>
                <div className="text-xl font-bold">{analytics.builder}</div>
              </div>
              
              <div className="flex items-center gap-4 ml-6">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">↓</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Clicked "Edit Resume"</h3>
                  <p className="text-sm text-gray-600">Navigated to edit page</p>
                </div>
                <div className="text-xl font-bold text-purple-600">{analytics.builderToEdit}</div>
              </div>
              
              <div className="flex items-center gap-4 ml-12">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">3</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Edit Resume Visitors</h3>
                  <p className="text-sm text-gray-600">Filled resume information</p>
                </div>
                <div className="text-xl font-bold">{analytics.edit}</div>
              </div>
              
              <div className="flex items-center gap-4 ml-6">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">↓</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Downloaded PDF</h3>
                  <p className="text-sm text-gray-600">Generated final resume</p>
                </div>
                <div className="text-xl font-bold text-orange-600">{analytics.downloads}</div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Overall Conversion Rate</h3>
                    <p className="text-sm text-gray-600">Home → PDF Download</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.home > 0 
                      ? ((analytics.downloads / analytics.home) * 100).toFixed(2) 
                      : '0'}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Usage */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-500">🎨</span>
              Template Usage
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {analytics.templates && Object.entries(analytics.templates).length > 0 ? (
                Object.entries(analytics.templates).map(([key, value]: any) => (
                  <div key={key} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold truncate">
                      {key.replace('template_', '').replace('premium_template_', '').replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-2xl font-bold mt-2">{value}</p>
                    <p className="text-xs text-gray-500">selections</p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center p-4 text-gray-500">
                  No template usage data yet. Try selecting some templates!
                </div>
              )}
            </div>
          </div>

          {/* Daily Data */}
          {analytics.dailyData && Object.keys(analytics.dailyData).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-green-500">📅</span>
                Daily Statistics
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Visits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(analytics.dailyData)
                      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-4 py-2 text-sm">{key.replace('daily_', '')}</td>
                          <td className="px-4 py-2 text-sm font-semibold">{value as string}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Information & Links */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Tracking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Local Storage Tracking</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Data is stored in your browser only</li>
                  <li>• Will reset if you clear browser data</li>
                  <li>• Only tracks activity in this browser</li>
                  <li>• Updates in real-time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Google Analytics</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Property ID: <code className="bg-white px-1 rounded">G-JW2bS0D8YB</code></li>
                  <li>• Tracks across all devices</li>
                  <li>• Provides detailed demographics</li>
                  <li>• Real-time dashboard available</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/admin/analytics"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Analytics Dashboard
              </Link>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open Google Analytics
              </a>
              <Link
                to="/builder"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Test Resume Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalAnalyticsDashboard;