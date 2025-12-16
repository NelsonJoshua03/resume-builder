// src/components/AdminDashboard.tsx - COMPLETE WITH GOOGLE ANALYTICS & SEO
import React, { useState, useEffect } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import SEO from './SEO';

interface DashboardMetrics {
  traffic: {
    monthlyVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  revenue: {
    adSense: number;
    premium: number;
    affiliate: number;
    jobPostings: number;
  };
  userEngagement: {
    resumesCreated: number;
    jobApplications: number;
    premiumConversions: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    traffic: {
      monthlyVisitors: 0,
      bounceRate: 0,
      avgSessionDuration: 0
    },
    revenue: {
      adSense: 0,
      premium: 0,
      affiliate: 0,
      jobPostings: 0
    },
    userEngagement: {
      resumesCreated: 0,
      jobApplications: 0,
      premiumConversions: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const { trackPageView, trackButtonClick, trackCTAClick } = useGoogleAnalytics();

  useEffect(() => {
    trackPageView('Admin Dashboard', '/admin/dashboard');
    
    // Simulate data loading
    const loadMetrics = async () => {
      try {
        // In a real app, you would fetch this from your API
        setTimeout(() => {
          setMetrics({
            traffic: {
              monthlyVisitors: 12542,
              bounceRate: 42.3,
              avgSessionDuration: 3.2
            },
            revenue: {
              adSense: 245.50,
              premium: 1200.00,
              affiliate: 350.25,
              jobPostings: 800.00
            },
            userEngagement: {
              resumesCreated: 8456,
              jobApplications: 3241,
              premiumConversions: 156
            }
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setLoading(false);
      }
    };

    loadMetrics();
  }, [trackPageView]);

  const handleRefreshMetrics = () => {
    trackButtonClick('refresh_metrics', 'admin_dashboard', 'admin');
    setLoading(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        traffic: {
          ...prev.traffic,
          monthlyVisitors: prev.traffic.monthlyVisitors + Math.floor(Math.random() * 100)
        }
      }));
      setLoading(false);
    }, 500);
  };

  const handleExportData = (type: string) => {
    trackButtonClick(`export_${type}`, 'admin_dashboard', 'admin');
    trackCTAClick(`admin_export_${type}`, 'admin_actions', 'admin');
    alert(`Exporting ${type} data...`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-gray-600 text-center">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Admin Dashboard - CareerCraft Analytics & Management"
        description="CareerCraft admin dashboard for monitoring website performance, user engagement, and revenue metrics."
        keywords="admin dashboard, analytics, website metrics, user engagement, revenue tracking"
        canonicalUrl="https://careercraft.in/admin/dashboard"
        type="website"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor your website performance and user engagement</p>
            </div>
            <button
              onClick={handleRefreshMetrics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Metrics
            </button>
          </div>

          {/* Traffic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Visitors</h3>
              <p className="text-3xl font-bold text-blue-600">{metrics.traffic.monthlyVisitors.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">+12% from last month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bounce Rate</h3>
              <p className="text-3xl font-bold text-green-600">{metrics.traffic.bounceRate}%</p>
              <p className="text-sm text-gray-600 mt-2">-2.1% improvement</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg. Session</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics.traffic.avgSessionDuration}m</p>
              <p className="text-sm text-gray-600 mt-2">+0.5m from last month</p>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AdSense Revenue</h3>
              <p className="text-2xl font-bold text-orange-600">₹{metrics.revenue.adSense.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Monthly earnings</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">₹{metrics.revenue.premium.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Monthly subscription</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Affiliate Revenue</h3>
              <p className="text-2xl font-bold text-green-600">₹{metrics.revenue.affiliate.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Partner commissions</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Postings</h3>
              <p className="text-2xl font-bold text-purple-600">₹{metrics.revenue.jobPostings.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Employer listings</p>
            </div>
          </div>

          {/* User Engagement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumes Created</h3>
              <p className="text-3xl font-bold text-indigo-600">{metrics.userEngagement.resumesCreated.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Total resumes generated</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Applications</h3>
              <p className="text-3xl font-bold text-teal-600">{metrics.userEngagement.jobApplications.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Through our platform</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Conversions</h3>
              <p className="text-3xl font-bold text-pink-600">{metrics.userEngagement.premiumConversions}</p>
              <p className="text-sm text-gray-600 mt-2">Upgraded to premium</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleExportData('traffic')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Traffic Data
              </button>
              <button
                onClick={() => handleExportData('revenue')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Revenue Data
              </button>
              <button
                onClick={() => handleExportData('users')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export User Data
              </button>
              <button
                onClick={() => trackCTAClick('admin_view_analytics', 'quick_actions', 'admin')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                View Detailed Analytics
              </button>
            </div>
          </div>

          {/* Google Analytics Integration Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Google Analytics Integration</h4>
            <p className="text-blue-700 text-sm">
              All user interactions are being tracked through Google Analytics (G-JW2bS0D8YB). 
              Visit Google Analytics dashboard for more detailed insights and real-time data.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;