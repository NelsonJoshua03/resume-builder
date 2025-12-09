// src/components/DailyAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import SEO from './SEO';

const DailyAnalyticsDashboard = () => {
  const [dailyData, setDailyData] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = () => {
    const data: any = {
      date: selectedDate,
      pageViews: {
        home: localStorage.getItem(`daily_home_${selectedDate}`) || '0',
        builder: localStorage.getItem(`daily_builder_${selectedDate}`) || '0',
        edit: localStorage.getItem(`daily_edit_${selectedDate}`) || '0',
        premium: localStorage.getItem(`daily_premium_${selectedDate}`) || '0',
        jobApplications: localStorage.getItem(`daily_job_apps_${selectedDate}`) || '0',
      },
      uniqueUsers: {
        home: getUniqueUserCount('home'),
        builder: getUniqueUserCount('builder'),
        edit: getUniqueUserCount('edit'),
      },
      resumeDownloads: localStorage.getItem(`daily_resumes_${selectedDate}`) || '0',
      jobApplications: localStorage.getItem(`daily_job_apps_${selectedDate}`) || '0',
    };
    
    setDailyData(data);
  };

  const getUniqueUserCount = (page: string) => {
    const key = `daily_user_${selectedDate}_/${page}`;
    const users = JSON.parse(localStorage.getItem(key) || '[]');
    return users.length;
  };

  const getPreviousDays = (days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <>
      <SEO
        title="Daily Analytics Dashboard - CareerCraft"
        description="View daily user analytics, page views, and conversion metrics"
        keywords="daily analytics, user tracking, page views, conversion metrics"
        canonicalUrl="https://careercraft.in/admin/daily-analytics"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Daily Analytics Dashboard</h1>
        
        <div className="mb-6">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Daily Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
            <p className="text-3xl font-bold text-blue-600">{dailyData.pageViews?.builder || 0}</p>
            <p className="text-sm text-gray-600">Page Views</p>
            <p className="text-lg mt-2">Unique Users: {dailyData.uniqueUsers?.builder || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Edit Resume</h3>
            <p className="text-3xl font-bold text-green-600">{dailyData.pageViews?.edit || 0}</p>
            <p className="text-sm text-gray-600">Page Views</p>
            <p className="text-lg mt-2">Unique Users: {dailyData.uniqueUsers?.edit || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Resume Downloads</h3>
            <p className="text-3xl font-bold text-purple-600">{dailyData.resumeDownloads || 0}</p>
            <p className="text-sm text-gray-600">Generated Today</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-bold mb-4">Daily Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
              <div>
                <h4 className="font-semibold">Resume Builder Visits</h4>
                <p className="text-sm text-gray-600">Users who visited /builder</p>
              </div>
              <span className="text-xl font-bold">{dailyData.pageViews?.builder || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded">
              <div>
                <h4 className="font-semibold">Edit Resume Visits</h4>
                <p className="text-sm text-gray-600">Users who proceeded to /edit</p>
              </div>
              <span className="text-xl font-bold">{dailyData.pageViews?.edit || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded">
              <div>
                <h4 className="font-semibold">Resume Downloads</h4>
                <p className="text-sm text-gray-600">PDFs generated</p>
              </div>
              <span className="text-xl font-bold">{dailyData.resumeDownloads || 0}</span>
            </div>
          </div>
        </div>

        {/* Google Analytics Integration */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Google Analytics Data</h3>
          <p className="text-blue-700 mb-4">
            Full analytics available at: 
            <a 
              href="https://analytics.google.com/analytics/web/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              Google Analytics Dashboard
            </a>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">View in Google Analytics:</h4>
              <ul className="list-disc pl-5 text-blue-700">
                <li>Audience → Overview (for daily users)</li>
                <li>Behavior → Site Content → All Pages</li>
                <li>Behavior → Events → Overview</li>
                <li>Conversions → Goals → Overview</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Recommended Goals to Set:</h4>
              <ul className="list-disc pl-5 text-blue-700">
                <li>Resume Builder page view</li>
                <li>Edit Resume page view</li>
                <li>Resume Download (PDF generation)</li>
                <li>Job Application submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyAnalyticsDashboard;