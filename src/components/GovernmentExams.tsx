// src/components/GovernmentExams.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface GovExam {
  id: string;
  examName: string;
  organization: string;
  posts: string;
  vacancies: string;
  eligibility: string;
  applicationStartDate: string;
  applicationEndDate: string;
  examDate: string;
  examLevel: string; // National, State, Bank, Railway, SSC, UPSC, Defense, etc.
  ageLimit: string;
  applicationFee: string;
  examMode: string; // Online, Offline, CBT
  officialWebsite: string;
  notificationLink: string;
  applyLink: string;
  syllabus?: string;
  admitCardDate?: string;
  resultDate?: string;
  featured?: boolean;
  isNew?: boolean;
  addedTimestamp?: number;
}

const GovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<GovExam[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const examsPerPage = 12;

  const { trackButtonClick, trackSearch } = useGoogleAnalytics();

  // Exam levels/categories
  const examLevels = [
    'all',
    'UPSC',
    'SSC',
    'Banking',
    'Railway',
    'Defense',
    'State PSC',
    'Teaching',
    'Police',
    'Engineering',
    'Medical'
  ];

  // Popular organizations
  const organizations = [
    'all',
    'UPSC',
    'SSC',
    'IBPS',
    'SBI',
    'RRB',
    'Indian Army',
    'Indian Navy',
    'Indian Air Force',
    'State Government',
    'GATE',
    'Others'
  ];

  // Load exams from localStorage
  useEffect(() => {
    const savedExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    setExams(savedExams);
  }, []);

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const matchesLevel = selectedLevel === 'all' || exam.examLevel === selectedLevel;
    const matchesOrg = selectedOrg === 'all' || exam.organization === selectedOrg;
    const matchesSearch = searchTerm === '' || 
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.posts.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesOrg && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + examsPerPage);

  // Featured exams
  const featuredExams = exams.filter(exam => exam.featured);

  // Check if application is open
  const isApplicationOpen = (exam: GovExam) => {
    const now = new Date();
    const startDate = new Date(exam.applicationStartDate);
    const endDate = new Date(exam.applicationEndDate);
    return now >= startDate && now <= endDate;
  };

  // Days remaining to apply
  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    trackSearch(searchTerm, filteredExams.length, 'gov_exams');
    trackButtonClick('search_gov_exams', 'search_form', 'government_exams');
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedLevel('all');
    setSelectedOrg('all');
    setSearchTerm('');
    setCurrentPage(1);
    trackButtonClick('clear_filters', 'filters', 'government_exams');
  };

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    trackButtonClick(`page_${page}`, 'pagination', 'government_exams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Government Exams 2025 - Sarkari Naukri Updates | CareerCraft.in</title>
        <meta name="description" content="Latest Government Job Exams 2025 - UPSC, SSC, Banking, Railway, Defense notifications. Get exam dates, eligibility, syllabus for all Sarkari Naukri exams in India." />
        <meta name="keywords" content="government exams 2025, sarkari exam, UPSC notification, SSC exams, banking jobs, railway recruitment, defense jobs India, govt job exam dates" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🏛️ Government Exams 2025
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Complete Guide to Sarkari Naukri Exams - UPSC, SSC, Banking, Railway, Defense & More
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search exams, posts, or organization..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {examLevels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Categories' : level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Search Exams
                </button>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <div className="bg-green-700 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{exams.length}</span>
              <span className="text-sm ml-2">Total Exams</span>
            </div>
            <div className="bg-green-700 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">
                {exams.filter(e => isApplicationOpen(e)).length}
              </span>
              <span className="text-sm ml-2">Applications Open</span>
            </div>
            <button 
              onClick={clearFilters}
              className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Category
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setCurrentPage(1);
                      trackButtonClick(`filter_category_${e.target.value}`, 'filters', 'government_exams');
                    }}
                  >
                    {examLevels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All Categories' : level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Organization Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={selectedOrg}
                    onChange={(e) => {
                      setSelectedOrg(e.target.value);
                      setCurrentPage(1);
                      trackButtonClick(`filter_org_${e.target.value}`, 'filters', 'government_exams');
                    }}
                  >
                    {organizations.map(org => (
                      <option key={org} value={org}>
                        {org === 'all' ? 'All Organizations' : org}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Quick Stats</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {filteredExams.length} exams found
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {exams.filter(e => isApplicationOpen(e)).length} accepting applications
                  </p>
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              </div>

              {/* Resume Builder CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-blue-800 mb-2">
                  📄 Prepare Your Resume
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Create ATS-friendly resume for government job applications
                </p>
                <Link 
                  to="/builder" 
                  onClick={() => trackButtonClick('build_resume_sidebar', 'sidebar_cta', 'government_exams')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                >
                  Build Resume
                </Link>
              </div>

              {/* Admin Access */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-green-800 mb-2">
                  ➕ Add New Exam
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Post new government exam notifications
                </p>
                <Link 
                  to="/admin/government-exams" 
                  onClick={() => trackButtonClick('admin_gov_exams', 'sidebar_cta', 'government_exams')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center"
                >
                  Admin Panel
                </Link>
              </div>
            </div>

            {/* Exams List */}
            <div className="lg:w-3/4">
              {/* Featured Exams */}
              {featuredExams.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    ⭐ Featured Government Exams
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredExams.map(exam => (
                      <ExamCard key={exam.id} exam={exam} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* All Exams */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  All Government Exams 2025
                  <span className="text-gray-600 text-lg ml-2">({filteredExams.length})</span>
                </h2>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
              
              {currentExams.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No exams found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentExams.map(exam => (
                      <ExamCard key={exam.id} exam={exam} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-2 rounded-lg border ${
                                currentPage === pageNum
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Exam Card Component
const ExamCard: React.FC<{ exam: GovExam; featured?: boolean }> = ({ exam, featured = false }) => {
  const { trackButtonClick } = useGoogleAnalytics();
  
  const isApplicationOpen = () => {
    const now = new Date();
    const startDate = new Date(exam.applicationStartDate);
    const endDate = new Date(exam.applicationEndDate);
    return now >= startDate && now <= endDate;
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(exam.applicationEndDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = getDaysRemaining();
  const applicationOpen = isApplicationOpen();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
      featured ? 'border-l-4 border-green-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{exam.examName}</h3>
          <p className="text-gray-600 mb-2">{exam.organization}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {exam.isNew && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              NEW
            </span>
          )}
          {featured && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          )}
          {applicationOpen && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Apply Now
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Posts:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.posts}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Vacancies:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.vacancies}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Eligibility:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.eligibility}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Age Limit:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.ageLimit}</span>
        </div>
        <div className="flex items-start">
          <span className="text-sm font-semibold text-gray-700 w-32">Application Fee:</span>
          <span className="text-sm text-gray-600 flex-1">{exam.applicationFee}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Apply Start</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.applicationStartDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Apply End</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.applicationEndDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Exam Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(exam.examDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Exam Mode</p>
          <p className="text-sm font-semibold text-gray-800">{exam.examMode}</p>
        </div>
      </div>

      {applicationOpen && daysLeft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ Only {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left to apply!
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
          {exam.examLevel}
        </span>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
          {exam.organization}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <a 
          href={exam.applyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackButtonClick('apply_gov_exam', 'exam_card', 'government_exams')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
        >
          Apply Online
        </a>
        <div className="flex gap-2">
          <a 
            href={exam.notificationLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackButtonClick('view_notification', 'exam_card', 'government_exams')}
            className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center text-sm"
          >
            Notification
          </a>
          <a 
            href={exam.officialWebsite} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackButtonClick('official_website', 'exam_card', 'government_exams')}
            className="flex-1 border border-gray-600 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center text-sm"
          >
            Official Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default GovernmentExams;