// src/components/AdminResumeDashboard.tsx - Admin Dashboard for Professional Resumes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  listProfessionalResumes, 
  searchProfessionalResumes,
  deleteProfessionalResume,
  type ProfessionalResume 
} from '../firebase/professionalResumes';
import { isAdmin, adminLogout } from '../utils/adminAuth';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

const AdminResumeDashboard = () => {
  const [resumes, setResumes] = useState<ProfessionalResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<ProfessionalResume[] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    last30Days: 0
  });
  
  const { trackFirebaseEvent } = useFirebaseAnalytics();

  useEffect(() => {
    // Check admin access
    if (!isAdmin()) {
      window.location.href = '/edit?showAdminLogin=true';
      return;
    }
    
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listProfessionalResumes(100);
      
      if (result.success && result.data) {
        setResumes(result.data);
        
        // Calculate stats
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const last30Days = result.data.filter(resume => {
          const createdAt = new Date(resume.metadata.createdAt?.toDate?.() || resume.metadata.createdAt);
          return createdAt >= thirtyDaysAgo;
        });
        
        setStats({
          total: result.data.length,
          active: result.data.filter(r => r.metadata.isActive).length,
          last30Days: last30Days.length
        });
        
        // Track dashboard access
        trackFirebaseEvent({
          eventName: 'admin_dashboard_accessed',
          eventCategory: 'Admin',
          eventLabel: 'dashboard_view',
          pagePath: '/admin/resumes',
          pageTitle: 'Admin Resume Dashboard',
          metadata: {
            total_resumes: result.data.length,
            session_id: Date.now().toString()
          }
        });
        
      } else {
        setError(result.error || 'Failed to load resumes');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchResults(null);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await searchProfessionalResumes(searchEmail.toLowerCase());
      
      if (result.success && result.data) {
        setSearchResults(result.data);
        
        trackFirebaseEvent({
          eventName: 'admin_resume_search',
          eventCategory: 'Admin',
          eventLabel: 'search',
          pagePath: '/admin/resumes',
          pageTitle: 'Admin Resume Dashboard',
          metadata: {
            search_query: searchEmail,
            results_count: result.data.length
          }
        });
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || 'Search error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this professional resume? This cannot be undone.')) {
      return;
    }
    
    try {
      const result = await deleteProfessionalResume(resumeId);
      
      if (result.success) {
        // Remove from local state
        setResumes(resumes.filter(r => r.id !== resumeId));
        if (searchResults) {
          setSearchResults(searchResults.filter(r => r.id !== resumeId));
        }
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
        
        trackFirebaseEvent({
          eventName: 'professional_resume_deleted',
          eventCategory: 'Admin',
          eventLabel: 'delete',
          pagePath: '/admin/resumes',
          pageTitle: 'Admin Resume Dashboard',
          metadata: {
            resume_id: resumeId,
            admin_action: 'delete'
          }
        });
        
        alert('✅ Resume deleted successfully');
      } else {
        alert(`❌ Failed to delete: ${result.error}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
    
    setShowDeleteConfirm(null);
  };

  const handleLogout = () => {
    adminLogout();
    window.location.href = '/';
  };

  const displayResumes = searchResults || resumes;

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    
    try {
      const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading professional resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                👑 Professional Resume Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage resumes created for email clients. Only you can access this dashboard.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/edit"
                className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                ➕ Create New Resume
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                👋 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Total Professional Resumes</p>
                <p className="text-3xl font-bold text-blue-800 mt-2">{stats.total}</p>
              </div>
              <div className="text-blue-500 text-3xl">📄</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">Active Resumes</p>
                <p className="text-3xl font-bold text-green-800 mt-2">{stats.active}</p>
              </div>
              <div className="text-green-500 text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Last 30 Days</p>
                <p className="text-3xl font-bold text-purple-800 mt-2">{stats.last30Days}</p>
              </div>
              <div className="text-purple-500 text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Client Email
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🔍 Search
                </button>
                {searchResults && (
                  <button
                    onClick={() => {
                      setSearchEmail('');
                      setSearchResults(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </label>
              <Link
                to="/edit?adminMode=true"
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
              >
                🎯 Start New Client Resume
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <p className="font-semibold">Error Loading Resumes</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resumes Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchResults ? 'Search Results' : 'All Professional Resumes'}
              <span className="ml-2 text-sm text-gray-500">
                ({displayResumes.length} resumes)
              </span>
            </h2>
          </div>
          
          {displayResumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchEmail ? 'No resumes found' : 'No professional resumes yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchEmail 
                  ? 'Try a different email address or create a new resume.'
                  : 'Start creating resumes for your email clients.'}
              </p>
              <Link
                to="/edit?adminMode=true"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Your First Professional Resume
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resume Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayResumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {resume.clientInfo.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {resume.clientInfo.email}
                          </div>
                          {resume.clientInfo.phone && (
                            <div className="text-sm text-gray-500">
                              📞 {resume.clientInfo.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {resume.resumeData?.personalInfo?.title || 'No Title'}
                          </div>
                          <div className="text-gray-600">
                            {resume.experienceLevel || 'Not specified'} • 
                            Version: {resume.metadata.version || 1}
                          </div>
                          {resume.clientInfo.notes && (
                            <div className="mt-1 text-xs text-gray-500 truncate max-w-xs">
                              📝 {resume.clientInfo.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(resume.metadata.createdAt)}
                        <div className="text-xs text-gray-400">
                          ID: {resume.id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            to={`/edit?resumeId=${resume.id}&clientEmail=${encodeURIComponent(resume.clientInfo.email)}&adminMode=true`}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-semibold"
                          >
                            ✏️ Edit
                          </Link>
                          <Link
                            to={`/builder?resumeId=${resume.id}&clientEmail=${encodeURIComponent(resume.clientInfo.email)}`}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-xs font-semibold"
                          >
                            📄 PDF
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(resume.id!)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Professional Resume</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this professional resume? This action cannot be undone.
                The resume data will be permanently removed from the database.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteResume(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🔐 This dashboard is accessible only to CareerCraft administrators.</p>
          <p className="mt-1">All data is stored securely in Firebase and never shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminResumeDashboard;