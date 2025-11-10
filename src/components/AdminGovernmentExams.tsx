// src/components/AdminGovernmentExams.tsx
import React, { useState, useEffect } from 'react';
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
  examLevel: string;
  ageLimit: string;
  applicationFee: string;
  examMode: string;
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

const AdminGovernmentExams: React.FC = () => {
  const [exams, setExams] = useState<GovExam[]>([]);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkForm, setShowBulkForm] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { trackButtonClick } = useGoogleAnalytics();

  // Single exam form state
  const [singleExam, setSingleExam] = useState<GovExam>({
    id: '',
    examName: '',
    organization: '',
    posts: '',
    vacancies: '',
    eligibility: '',
    applicationStartDate: '',
    applicationEndDate: '',
    examDate: '',
    examLevel: 'UPSC',
    ageLimit: '',
    applicationFee: '',
    examMode: 'Online',
    officialWebsite: '',
    notificationLink: '',
    applyLink: '',
    syllabus: '',
    admitCardDate: '',
    resultDate: '',
    featured: false,
    isNew: true,
    addedTimestamp: Date.now()
  });

  // Load exams from localStorage
  useEffect(() => {
    const savedExams = JSON.parse(localStorage.getItem('governmentExams') || '[]');
    setExams(savedExams);
  }, []);

  // Save exams to localStorage
  const saveExams = (updatedExams: GovExam[]) => {
    localStorage.setItem('governmentExams', JSON.stringify(updatedExams));
    setExams(updatedExams);
  };

  // Handle single exam submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExam: GovExam = {
      ...singleExam,
      id: `exam-${Date.now()}`,
      addedTimestamp: Date.now()
    };

    const updatedExams = [newExam, ...exams];
    saveExams(updatedExams);
    
    setMessage({ type: 'success', text: 'Government exam added successfully!' });
    trackButtonClick('add_single_gov_exam', 'single_form', 'admin_gov_exams');
    
    // Reset form
    setSingleExam({
      id: '',
      examName: '',
      organization: '',
      posts: '',
      vacancies: '',
      eligibility: '',
      applicationStartDate: '',
      applicationEndDate: '',
      examDate: '',
      examLevel: 'UPSC',
      ageLimit: '',
      applicationFee: '',
      examMode: 'Online',
      officialWebsite: '',
      notificationLink: '',
      applyLink: '',
      syllabus: '',
      admitCardDate: '',
      resultDate: '',
      featured: false,
      isNew: true,
      addedTimestamp: Date.now()
    });

    setTimeout(() => setMessage(null), 5000);
  };

  // Handle bulk submission
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const examData = JSON.parse(bulkInput);
      
      if (!Array.isArray(examData)) {
        setMessage({ type: 'error', text: 'Invalid format. Please provide an array of exams.' });
        return;
      }

      const newExams = examData.map((exam, index) => ({
        ...exam,
        id: exam.id || `exam-${Date.now()}-${index}`,
        addedTimestamp: exam.addedTimestamp || Date.now(),
        isNew: exam.isNew !== undefined ? exam.isNew : true
      }));

      const updatedExams = [...newExams, ...exams];
      saveExams(updatedExams);
      
      setMessage({ type: 'success', text: `Successfully added ${newExams.length} government exams!` });
      trackButtonClick('add_bulk_gov_exams', 'bulk_form', 'admin_gov_exams');
      setBulkInput('');
      setShowBulkForm(false);
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid JSON format. Please check your input.' });
    }
  };

  // Delete exam
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const updatedExams = exams.filter(exam => exam.id !== id);
      saveExams(updatedExams);
      setMessage({ type: 'success', text: 'Exam deleted successfully!' });
      trackButtonClick('delete_gov_exam', 'exam_list', 'admin_gov_exams');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Toggle featured status
  const toggleFeatured = (id: string) => {
    const updatedExams = exams.map(exam =>
      exam.id === id ? { ...exam, featured: !exam.featured } : exam
    );
    saveExams(updatedExams);
    trackButtonClick('toggle_featured', 'exam_list', 'admin_gov_exams');
  };

  // Sample bulk data template
  const sampleBulkData = `[
  {
    "examName": "UPSC Civil Services Examination 2025",
    "organization": "UPSC",
    "posts": "IAS, IPS, IFS and other Civil Services",
    "vacancies": "1000+",
    "eligibility": "Graduate degree from a recognized university",
    "applicationStartDate": "2025-02-15",
    "applicationEndDate": "2025-03-15",
    "examDate": "2025-06-01",
    "examLevel": "UPSC",
    "ageLimit": "21-32 years",
    "applicationFee": "₹100 (General/OBC), Nil (SC/ST/PwD/Women)",
    "examMode": "Offline",
    "officialWebsite": "https://upsc.gov.in",
    "notificationLink": "https://upsc.gov.in/notifications",
    "applyLink": "https://upsconline.nic.in",
    "featured": true
  },
  {
    "examName": "SSC CGL 2025",
    "organization": "SSC",
    "posts": "Combined Graduate Level Posts",
    "vacancies": "15000+",
    "eligibility": "Bachelor's Degree",
    "applicationStartDate": "2025-03-01",
    "applicationEndDate": "2025-03-31",
    "examDate": "2025-06-15",
    "examLevel": "SSC",
    "ageLimit": "18-32 years",
    "applicationFee": "₹100 (General), Nil (Women/SC/ST/PwD)",
    "examMode": "CBT",
    "officialWebsite": "https://ssc.nic.in",
    "notificationLink": "https://ssc.nic.in/notifications",
    "applyLink": "https://ssc.nic.in/apply",
    "featured": true
  }
]`;

  return (
    <>
      <Helmet>
        <title>Admin - Government Exams Management | CareerCraft.in</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Government Exams Admin Panel
            </h1>
            <p className="text-gray-600">
              Add and manage government job exam notifications
            </p>
          </header>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setShowBulkForm(false);
                trackButtonClick('show_single_form', 'form_toggle', 'admin_gov_exams');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                !showBulkForm
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Single Exam Form
            </button>
            <button
              onClick={() => {
                setShowBulkForm(true);
                trackButtonClick('show_bulk_form', 'form_toggle', 'admin_gov_exams');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showBulkForm
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Bulk Upload (JSON)
            </button>
          </div>

          {/* Single Exam Form */}
          {!showBulkForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Single Exam</h2>
              <form onSubmit={handleSingleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examName}
                      onChange={(e) => setSingleExam({...singleExam, examName: e.target.value})}
                      placeholder="e.g., UPSC Civil Services Examination 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.organization}
                      onChange={(e) => setSingleExam({...singleExam, organization: e.target.value})}
                      placeholder="e.g., UPSC, SSC, IBPS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posts/Positions *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.posts}
                      onChange={(e) => setSingleExam({...singleExam, posts: e.target.value})}
                      placeholder="e.g., IAS, IPS, IFS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Vacancies *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.vacancies}
                      onChange={(e) => setSingleExam({...singleExam, vacancies: e.target.value})}
                      placeholder="e.g., 1000+, 500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eligibility Criteria *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.eligibility}
                      onChange={(e) => setSingleExam({...singleExam, eligibility: e.target.value})}
                      placeholder="e.g., Bachelor's degree from a recognized university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Limit *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.ageLimit}
                      onChange={(e) => setSingleExam({...singleExam, ageLimit: e.target.value})}
                      placeholder="e.g., 21-32 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Fee *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationFee}
                      onChange={(e) => setSingleExam({...singleExam, applicationFee: e.target.value})}
                      placeholder="e.g., ₹100 (General), Nil (SC/ST)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationStartDate}
                      onChange={(e) => setSingleExam({...singleExam, applicationStartDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application End Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applicationEndDate}
                      onChange={(e) => setSingleExam({...singleExam, applicationEndDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examDate}
                      onChange={(e) => setSingleExam({...singleExam, examDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Category *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examLevel}
                      onChange={(e) => setSingleExam({...singleExam, examLevel: e.target.value})}
                    >
                      <option value="UPSC">UPSC</option>
                      <option value="SSC">SSC</option>
                      <option value="Banking">Banking</option>
                      <option value="Railway">Railway</option>
                      <option value="Defense">Defense</option>
                      <option value="State PSC">State PSC</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Police">Police</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Mode *
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.examMode}
                      onChange={(e) => setSingleExam({...singleExam, examMode: e.target.value})}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="CBT">CBT (Computer Based Test)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Official Website *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.officialWebsite}
                      onChange={(e) => setSingleExam({...singleExam, officialWebsite: e.target.value})}
                      placeholder="https://example.gov.in"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Link *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.notificationLink}
                      onChange={(e) => setSingleExam({...singleExam, notificationLink: e.target.value})}
                      placeholder="https://example.gov.in/notification.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply Link *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.applyLink}
                      onChange={(e) => setSingleExam({...singleExam, applyLink: e.target.value})}
                      placeholder="https://example.gov.in/apply"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admit Card Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.admitCardDate || ''}
                      onChange={(e) => setSingleExam({...singleExam, admitCardDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={singleExam.resultDate || ''}
                      onChange={(e) => setSingleExam({...singleExam, resultDate: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4"
                        checked={singleExam.featured}
                        onChange={(e) => setSingleExam({...singleExam, featured: e.target.checked})}
                      />
                      <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Add Government Exam
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Upload Form */}
          {showBulkForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk Upload (JSON)</h2>
              <p className="text-gray-600 mb-4">
                Paste your JSON array of government exams below. Each exam should have all required fields.
              </p>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setBulkInput(sampleBulkData);
                    trackButtonClick('load_sample_data', 'bulk_form', 'admin_gov_exams');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load Sample Data
                </button>
              </div>

              <form onSubmit={handleBulkSubmit}>
                <div className="mb-4">
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    rows={20}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Paste JSON array here..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Upload Exams
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkInput('')}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Required Fields:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• examName, organization, posts, vacancies, eligibility</li>
                  <li>• applicationStartDate, applicationEndDate, examDate</li>
                  <li>• examLevel, ageLimit, applicationFee, examMode</li>
                  <li>• officialWebsite, notificationLink, applyLink</li>
                </ul>
              </div>
            </div>
          )}

          {/* Existing Exams List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Existing Exams ({exams.length})
            </h2>
            
            {exams.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No government exams added yet. Add your first exam using the form above.
              </p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{exam.examName}</h3>
                          {exam.featured && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Organization:</strong> {exam.organization} | 
                          <strong> Category:</strong> {exam.examLevel} | 
                          <strong> Vacancies:</strong> {exam.vacancies}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Apply:</strong> {new Date(exam.applicationStartDate).toLocaleDateString()} - {new Date(exam.applicationEndDate).toLocaleDateString()} | 
                          <strong> Exam:</strong> {new Date(exam.examDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added: {new Date(exam.addedTimestamp || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleFeatured(exam.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {exam.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminGovernmentExams;