// src/components/ProfessionalResumeDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  listProfessionalResumes, 
  searchProfessionalResumes,
  deleteProfessionalResume,
  type ProfessionalResume 
} from '../firebase/professionalResumes';
import { isAdmin } from '../utils/adminAuth';

const ProfessionalResumeDashboard: React.FC = () => {
  const [resumes, setResumes] = useState<ProfessionalResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<ProfessionalResume[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'search'>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    uniqueClients: 0
  });

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/admin/login';
      return;
    }
    
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const result = await listProfessionalResumes(100);
      if (result.success && result.data) {
        setResumes(result.data);
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
    setLoading(false);
  };

  const calculateStats = (data: ProfessionalResume[]) => {
    const uniqueEmails = new Set(data.map(r => r.clientInfo.email));
    const activeCount = data.filter(r => r.metadata?.isActive !== false).length;
    
    setStats({
      total: data.length,
      active: activeCount,
      uniqueClients: uniqueEmails.size
    });
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setActiveTab('all');
      return;
    }
    
    setLoading(true);
    try {
      const result = await searchProfessionalResumes(searchEmail);
      if (result.success && result.data) {
        setSearchResults(result.data);
        setActiveTab('search');
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const handleDeleteResume = async (resumeId: string, clientEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete the resume for ${clientEmail}? This cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteProfessionalResume(resumeId);
      if (result.success) {
        alert('✅ Resume deleted successfully');
        loadResumes();
        if (activeTab === 'search') {
          setSearchResults(prev => prev.filter(r => r.id !== resumeId));
        }
      } else {
        alert(`❌ Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('❌ Error deleting resume');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const displayedResumes = activeTab === 'search' ? searchResults : resumes;

  return (
    <>
      <Helmet>
        <title>Professional Resume Dashboard | CareerCraft Admin</title>
        <meta name="description" content="Manage professionally created resumes for email clients" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">👑 Professional Resume Dashboard</h1>
                <p className="text-blue-100 text-sm md:text-base mt-1">
                  Manage resumes created for email clients
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link
                  to="/edit?adminMode=true"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>+</span>
                  Create New Resume
                </Link>
                <Link
                  to="/admin/dashboard"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 md:px-6 py-2 rounded-lg transition-colors"
                >
                  Main Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📄</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-gray-600 text-sm">Total Resumes</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">👥</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.uniqueClients}</div>
                  <div className="text-gray-600 text-sm">Unique Clients</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">✅</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.active}</div>
                  <div className="text-gray-600 text-sm">Active Resumes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Client Resumes</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter client email to search..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <p className="text-xs text-gray-500 mt-1">Search by exact email address</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchEmail('');
                    setActiveTab('all');
                    loadResumes();
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              All Resumes ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 font-medium ${activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Search Results ({searchResults.length})
            </button>
          </div>

          {/* Resumes List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading professional resumes...</p>
            </div>
          ) : displayedResumes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Resumes Found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'search' 
                  ? 'No resumes found for the search criteria.' 
                  : 'No professional resumes have been created yet.'}
              </p>
              <Link
                to="/edit?adminMode=true"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Professional Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayedResumes.map((resume) => (
                <div key={resume.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {resume.clientInfo.name || 'Unnamed Client'}
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                          <span className="text-blue-600 text-sm">📧 {resume.clientInfo.email}</span>
                          {resume.clientInfo.phone && (
                            <span className="text-gray-600 text-sm">📱 {resume.clientInfo.phone}</span>
                          )}
                        </div>
                        {resume.clientInfo.company && (
                          <div className="text-gray-700 text-sm mt-1">
                            🏢 {resume.clientInfo.company}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/edit?adminMode=true&resumeId=${resume.id}&clientEmail=${encodeURIComponent(resume.clientInfo.email)}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit Resume
                        </Link>
                        <Link
                          to={`/builder?resumeId=${resume.id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Generate PDF
                        </Link>
                        <button
                          onClick={() => handleDeleteResume(resume.id!, resume.clientInfo.email)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Resume Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-500">Resume ID</div>
                        <div className="font-mono text-xs truncate" title={resume.id}>
                          {resume.id?.substring(0, 16)}...
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created</div>
                        <div>{formatDate(resume.metadata?.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Updated</div>
                        <div>{formatDate(resume.metadata?.updatedAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${resume.metadata?.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {resume.metadata?.isActive !== false ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Client Notes */}
                    {resume.clientInfo.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-sm font-medium text-yellow-800 mb-1">📝 Client Notes</div>
                        <div className="text-sm text-yellow-700">{resume.clientInfo.notes}</div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {resume.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {resume.jobType && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {resume.jobType}
                        </span>
                      )}
                      {resume.experienceLevel && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {resume.experienceLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions Panel */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 How Professional Resumes Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">For Email Clients</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Client emails you their information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>You create their resume using the editor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Save to professional database (not localStorage)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Generate PDF and send to client</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Future Updates</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Search by client email to find their resume</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Edit and generate updated PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>No stored PDFs - generated fresh each time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Only structured data stored (no files)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalResumeDashboard;