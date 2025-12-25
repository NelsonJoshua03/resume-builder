// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { isAdmin, adminLogout, getAdminStatus } from '../utils/adminAuth';
import { 
  listProfessionalResumes, 
  searchProfessionalResumes,
  deleteProfessionalResume,
  type ProfessionalResume 
} from '../firebase/professionalResumes';

const AdminDashboard = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [resumes, setResumes] = useState<ProfessionalResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<ProfessionalResume[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'search'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = () => {
      const adminStatus = isAdmin();
      setIsAdminMode(adminStatus);
      
      if (adminStatus) {
        loadResumes();
      } else {
        window.location.href = '/edit?adminMode=true';
      }
    };
    
    checkAdmin();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const result = await listProfessionalResumes(100);
      if (result.success && result.data) {
        setResumes(result.data);
      }
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
    setLoading(false);
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

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this professional resume?')) {
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
      return new Date(date.toDate ? date.toDate() : date).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  if (!isAdminMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in as admin to access this dashboard.</p>
          <a href="/edit?adminMode=true" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  const displayedResumes = activeTab === 'search' ? searchResults : resumes;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Professional Resume Management | CareerCraft.in</title>
        <meta name="description" content="CareerCraft Admin Dashboard - Manage professionally created resumes for email clients" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">👑 CareerCraft Admin Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">Professional Resume Management System</p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="text-sm bg-blue-700 px-3 py-1 rounded-full">
                  {resumes.length} Professional Resumes
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Logout Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-gray-600 text-sm">Total Resumes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">
                {resumes.filter(r => r.metadata?.isActive !== false).length}
              </div>
              <div className="text-gray-600 text-sm">Active Resumes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Array.from(new Set(resumes.map(r => r.clientInfo.email))).length}
              </div>
              <div className="text-gray-600 text-sm">Unique Clients</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <a
                href="/edit?adminMode=true"
                className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create New Resume
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Client Resumes</h2>
            <div className="flex gap-3">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter client email to search..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              All Resumes ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 font-medium ${activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
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
              <a
                href="/edit?adminMode=true"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Professional Resume
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayedResumes.map((resume) => (
                <div key={resume.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {resume.clientInfo.name || 'Unnamed Client'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-blue-600">📧 {resume.clientInfo.email}</span>
                          {resume.clientInfo.phone && (
                            <span className="text-gray-600">📱 {resume.clientInfo.phone}</span>
                          )}
                        </div>
                        {resume.clientInfo.company && (
                          <div className="text-gray-700 text-sm mt-1">
                            🏢 {resume.clientInfo.company}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <a
                          href={`/edit?adminMode=true&resumeId=${resume.id}&clientEmail=${encodeURIComponent(resume.clientInfo.email)}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit Resume
                        </a>
                        <a
                          href={`/builder?resumeId=${resume.id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Generate PDF
                        </a>
                        <button
                          onClick={() => handleDeleteResume(resume.id!)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-500">Resume ID</div>
                        <div className="font-mono text-xs truncate">{resume.id}</div>
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
                    
                    {resume.clientInfo.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-sm font-medium text-yellow-800 mb-1">📝 Client Notes</div>
                        <div className="text-sm text-yellow-700">{resume.clientInfo.notes}</div>
                      </div>
                    )}
                    
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
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 How to Use This Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <div className="font-medium">Create New Resume</div>
                    <div className="text-sm text-gray-600">Go to /edit?adminMode=true and enter client details</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <div className="font-medium">Edit Existing Resume</div>
                    <div className="text-sm text-gray-600">Click "Edit Resume" to load into the editor</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <div className="font-medium">Generate PDF</div>
                    <div className="text-sm text-gray-600">Click "Generate PDF" to create fresh PDF</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <div className="font-medium">Search by Email</div>
                    <div className="text-sm text-gray-600">Enter client email to find their resumes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;