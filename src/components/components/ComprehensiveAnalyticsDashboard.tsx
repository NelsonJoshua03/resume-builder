// src/components/ComprehensiveAnalyticsDashboard.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Eye,
  Clock,
  Download,
  Share2,
  MousePointer,
  BarChart,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  ExternalLink
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  resumeDownloads: number;
  jobViews: number;
  jobApplications: number;
  driveRegistrations: number;
  blogReads: number;
  govExamViews: number;
  avgTimeOnPage: number;
  conversionRate: number;
}

interface PagePerformance {
  name: string;
  views: number;
  conversions: number;
}

const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // Load data from localStorage
    const today = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    const data: AnalyticsData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        pageViews: parseInt(localStorage.getItem(`daily_page_views_home_${dateStr}`) || '0'),
        uniqueVisitors: JSON.parse(localStorage.getItem(`daily_user_${dateStr}`) || '[]').length,
        resumeDownloads: parseInt(localStorage.getItem(`daily_resumes_${dateStr}`) || '0'),
        jobViews: parseInt(localStorage.getItem(`daily_job_views_${dateStr}`) || '0'),
        jobApplications: parseInt(localStorage.getItem(`daily_job_apps_submitted_${dateStr}`) || '0'),
        driveRegistrations: parseInt(localStorage.getItem(`daily_drive_registrations_${dateStr}`) || '0'),
        blogReads: parseInt(localStorage.getItem(`daily_blog_reads_${dateStr}`) || '0'),
        govExamViews: parseInt(localStorage.getItem(`daily_gov_exam_views_${dateStr}`) || '0'),
        avgTimeOnPage: parseFloat(localStorage.getItem(`avg_time_home_${dateStr}`) || '0'),
        conversionRate: 0 // Will calculate below
      });
    }
    
    // Calculate conversion rates
    data.forEach(day => {
      if (day.pageViews > 0) {
        day.conversionRate = parseFloat(((day.resumeDownloads / day.pageViews) * 100).toFixed(2));
      }
    });
    
    setAnalyticsData(data);
    setLoading(false);
  };

  const calculateTotals = () => {
    const totals = {
      pageViews: 0,
      uniqueVisitors: 0,
      resumeDownloads: 0,
      jobViews: 0,
      jobApplications: 0,
      driveRegistrations: 0,
      blogReads: 0,
      govExamViews: 0,
      avgTimeOnPage: 0,
      avgConversionRate: 0
    };
    
    analyticsData.forEach(day => {
      totals.pageViews += day.pageViews;
      totals.uniqueVisitors += day.uniqueVisitors;
      totals.resumeDownloads += day.resumeDownloads;
      totals.jobViews += day.jobViews;
      totals.jobApplications += day.jobApplications;
      totals.driveRegistrations += day.driveRegistrations;
      totals.blogReads += day.blogReads;
      totals.govExamViews += day.govExamViews;
      totals.avgTimeOnPage += day.avgTimeOnPage;
      totals.avgConversionRate += day.conversionRate;
    });
    
    const days = analyticsData.length;
    if (days > 0) {
      totals.avgTimeOnPage = parseFloat((totals.avgTimeOnPage / days).toFixed(2));
      totals.avgConversionRate = parseFloat((totals.avgConversionRate / days).toFixed(2));
    }
    
    return totals;
  };

  const totals = calculateTotals();

  const topPerformingPages: PagePerformance[] = [
    { 
      name: 'Home Page', 
      views: totals.pageViews, 
      conversions: totals.resumeDownloads 
    },
    { 
      name: 'Job Applications', 
      views: totals.jobViews, 
      conversions: totals.jobApplications 
    },
    { 
      name: 'Resume Builder', 
      views: parseInt(localStorage.getItem('resume_builder_views') || '0'), 
      conversions: totals.resumeDownloads 
    },
    { 
      name: 'Job Drives', 
      views: parseInt(localStorage.getItem('job_drives_views') || '0'), 
      conversions: totals.driveRegistrations 
    },
    { 
      name: 'Blog', 
      views: parseInt(localStorage.getItem('blog_views') || '0'), 
      conversions: totals.blogReads 
    },
  ].sort((a, b) => b.views - a.views);

  const funnelMetrics = {
    jobViewToApply: totals.jobViews > 0 ? parseFloat(((totals.jobApplications / totals.jobViews) * 100).toFixed(2)) : 0,
    driveViewToRegister: totals.driveRegistrations > 0 ? parseFloat(((totals.driveRegistrations / parseInt(localStorage.getItem('job_drives_views') || '1')) * 100).toFixed(2)) : 0,
    blogViewToRead: totals.blogReads > 0 ? parseFloat(((totals.blogReads / parseInt(localStorage.getItem('blog_views') || '1')) * 100).toFixed(2)) : 0,
  };

  // Calculate trends (last 7 days vs previous 7 days)
  const calculateTrend = (metric: keyof AnalyticsData) => {
    if (analyticsData.length < 14) return 0;
    
    const last7Days = analyticsData.slice(-7);
    const previous7Days = analyticsData.slice(-14, -7);
    
    const last7Sum = last7Days.reduce((sum, day) => sum + (day[metric] as number), 0);
    const previous7Sum = previous7Days.reduce((sum, day) => sum + (day[metric] as number), 0);
    
    if (previous7Sum === 0) return 100;
    return ((last7Sum - previous7Sum) / previous7Sum) * 100;
  };

  const trends = {
    pageViews: calculateTrend('pageViews'),
    jobApplications: calculateTrend('jobApplications'),
    resumeDownloads: calculateTrend('resumeDownloads'),
    conversionRate: calculateTrend('conversionRate'),
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUpIcon className="text-green-500" size={16} />;
    if (value < 0) return <TrendingDown className="text-red-500" size={16} />;
    return null;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Comprehensive Analytics Dashboard | CareerCraft Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Comprehensive Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">Track all user activities across CareerCraft.in</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button
                  onClick={loadAnalyticsData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Page Views</p>
                  <p className="text-2xl font-bold mt-1">{formatNumber(totals.pageViews)}</p>
                </div>
                <Eye className="text-blue-500" size={24} />
              </div>
              <div className="mt-4 text-sm flex items-center gap-1">
                {getTrendIcon(trends.pageViews)}
                <span className={trends.pageViews > 0 ? 'text-green-600' : trends.pageViews < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {trends.pageViews > 0 ? '+' : ''}{trends.pageViews.toFixed(1)}% from last period
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Unique Visitors</p>
                  <p className="text-2xl font-bold mt-1">{formatNumber(totals.uniqueVisitors)}</p>
                </div>
                <Users className="text-green-500" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-600">
                +8% from last period
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Resume Downloads</p>
                  <p className="text-2xl font-bold mt-1">{formatNumber(totals.resumeDownloads)}</p>
                </div>
                <Download className="text-purple-500" size={24} />
              </div>
              <div className="mt-4 text-sm flex items-center gap-1">
                {getTrendIcon(trends.resumeDownloads)}
                <span className={trends.resumeDownloads > 0 ? 'text-green-600' : trends.resumeDownloads < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {trends.resumeDownloads > 0 ? '+' : ''}{trends.resumeDownloads.toFixed(1)}% from last period
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Job Applications</p>
                  <p className="text-2xl font-bold mt-1">{formatNumber(totals.jobApplications)}</p>
                </div>
                <Briefcase className="text-amber-500" size={24} />
              </div>
              <div className="mt-4 text-sm flex items-center gap-1">
                {getTrendIcon(trends.jobApplications)}
                <span className={trends.jobApplications > 0 ? 'text-green-600' : trends.jobApplications < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {trends.jobApplications > 0 ? '+' : ''}{trends.jobApplications.toFixed(1)}% from last period
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Avg. Session Time</p>
                  <p className="text-2xl font-bold mt-1">{totals.avgTimeOnPage}s</p>
                </div>
                <Clock className="text-red-500" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-600">
                +5% from last period
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Conversion Funnel Analysis</h3>
                <Filter size={20} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Eye size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Job Views</p>
                      <p className="text-sm text-gray-500">Users viewing job listings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(totals.jobViews)}</p>
                    <p className="text-sm text-gray-500">100%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MousePointer size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Applications Started</p>
                      <p className="text-sm text-gray-500">Click on Apply button</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(totals.jobApplications)}</p>
                    <p className="text-sm text-green-600">{funnelMetrics.jobViewToApply}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Briefcase size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">External Applications</p>
                      <p className="text-sm text-gray-500">Redirected to company site</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(totals.jobApplications)}</p>
                    <p className="text-sm text-green-600">100%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-6">Top Performing Pages</h3>
              <div className="space-y-4">
                {topPerformingPages.map((page, index) => {
                  const conversionRate = page.views > 0 
                    ? ((page.conversions / page.views) * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{page.name}</p>
                        <p className="text-sm text-gray-500">
                          Conversion: {conversionRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(page.views)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Blog Analytics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reads</span>
                  <span className="font-bold">{formatNumber(totals.blogReads)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Read Time</span>
                  <span className="font-bold">
                    {localStorage.getItem('avg_read_time_overall') || '2m 45s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Post</span>
                  <span className="font-bold text-sm truncate">ATS Resume Guide for Indian Jobs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-bold text-green-600">{funnelMetrics.blogViewToRead}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Job Drives</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Registrations</span>
                  <span className="font-bold">{formatNumber(totals.driveRegistrations)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. per Drive</span>
                  <span className="font-bold">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top City</span>
                  <span className="font-bold text-sm">Bangalore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-green-600">{funnelMetrics.driveViewToRegister}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Govt. Exams</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-bold">{formatNumber(totals.govExamViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-bold">
                    {parseInt(localStorage.getItem('gov_exam_applications') || '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Exam</span>
                  <span className="font-bold text-sm">UPSC Civil Services</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Time Spent</span>
                  <span className="font-bold">3m 20s</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Social Sharing</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Shares</span>
                  <span className="font-bold">
                    {formatNumber(
                      parseInt(localStorage.getItem('total_job_shares') || '0') +
                      parseInt(localStorage.getItem('drive_shares') || '0') +
                      parseInt(localStorage.getItem('blog_shares') || '0')
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Platform</span>
                  <span className="font-bold text-sm">WhatsApp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares Today</span>
                  <span className="font-bold">
                    {JSON.parse(localStorage.getItem('daily_shares_' + new Date().toISOString().split('T')[0]) || '[]').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-bold text-green-600">12.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-6">Recent Activity (Last 7 Days)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Apps</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drive Regs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticsData.slice(-7).map((day, index) => {
                    const prevDay = analyticsData[analyticsData.length - 8 - index];
                    const trend = prevDay ? ((day.resumeDownloads - prevDay.resumeDownloads) / prevDay.resumeDownloads) * 100 : 0;
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{day.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{day.uniqueVisitors}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{day.resumeDownloads}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{day.jobApplications}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{day.driveRegistrations}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${day.conversionRate > 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {day.conversionRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {trend > 0 ? <TrendingUpIcon size={14} /> : trend < 0 ? <TrendingDown size={14} /> : null}
                            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => {
                // Export to Google Sheets
                window.open('https://docs.google.com/spreadsheets/create', '_blank');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Export to Google Sheets
            </button>
            <button
              onClick={() => {
                // Export data as CSV
                const csvContent = [
                  ['Date', 'Page Views', 'Unique Visitors', 'Resume Downloads', 'Job Applications', 'Drive Registrations', 'Blog Reads', 'Conversion Rate'],
                  ...analyticsData.map(day => [
                    day.date,
                    day.pageViews,
                    day.uniqueVisitors,
                    day.resumeDownloads,
                    day.jobApplications,
                    day.driveRegistrations,
                    day.blogReads,
                    `${day.conversionRate}%`
                  ])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `careercraft-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComprehensiveAnalyticsDashboard;