// src/pages/JobDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Share2,
  Bookmark,
  Eye,
  Users,
  Award,
  GraduationCap,
  CheckCircle,
  ExternalLink,
  Building,
  Clock,
  TrendingUp,
  ArrowLeft,
  Home,
  FileText,
  Globe,
  Mail,
  Phone,
  User,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { firebaseJobService } from '../firebase/jobService';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { usePageTimeTracker } from '../hooks/usePageTimeTracker';

interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  requirements?: string[];
  qualifications?: string[];
  postedDate?: string;
  applyLink: string;
  featured?: boolean;
  views?: number;
  shares?: number;
  applications?: number;
  saves?: number;
  experience?: string;
  isNew?: boolean;
  createdAt?: Date;
  companyWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  hiringManager?: string;
}

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  
  usePageTimeTracker('Job Details Page');
  const { trackJobView, trackButtonClick, trackJobApplication } = useFirebaseAnalytics();
  const { trackExternalLink } = useGoogleAnalytics();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError('Job ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobData = await firebaseJobService.getJob(jobId);
        
        if (jobData) {
          setJob(jobData as JobData);
          
          // Track view
          trackJobView(jobId, jobData.title, jobData.company);
          
          // Check if job is saved
          const savedJobs = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
          setSaved(savedJobs.includes(jobId));
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error loading job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, trackJobView]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  const handleSaveJob = () => {
    if (!job || !job.id) return;
    
    const savedJobs = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
    const isAlreadySaved = savedJobs.includes(job.id);
    
    if (isAlreadySaved) {
      const newSaved = savedJobs.filter((id: string) => id !== job.id);
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
      setSaved(false);
      
      // Decrement save count
      firebaseJobService.incrementSaveCount(job.id);
    } else {
      const newSaved = [...savedJobs, job.id];
      localStorage.setItem('saved_jobs', JSON.stringify(newSaved));
      setSaved(true);
      
      // Increment save count
      firebaseJobService.incrementSaveCount(job.id);
    }
    
    trackButtonClick(isAlreadySaved ? 'unsave_job' : 'save_job', 'job_details', '/job-details');
  };

  const handleShare = () => {
    if (!job) return;
    
    const shareUrl = `${window.location.origin}/job-details/${job.id}`;
    const shareText = `Check out this job: ${job.title} at ${job.company} in ${job.location}`;
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        firebaseJobService.incrementShareCount(job.id!);
      }).catch(console.error);
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Link copied to clipboard!');
        firebaseJobService.incrementShareCount(job.id!);
      });
    }
    
    trackButtonClick('share_job', 'job_details', '/job-details');
  };

  const handleApply = () => {
    if (!job) return;
    
    trackJobApplication(job.id!, job.title, job.company, 'direct');
    trackButtonClick('apply_now', 'job_details', '/job-details');
    
    if (job.applyLink && job.applyLink.startsWith('http')) {
      trackExternalLink('Apply Now', job.applyLink, 'job_details');
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
          <Link 
            to="/job-applications"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  const safeArray = (arr: any[] | undefined): any[] => {
    return Array.isArray(arr) ? arr : [];
  };
  
  const requirements = safeArray(job.requirements);
  const qualifications = safeArray(job.qualifications);

  return (
    <>
      <Helmet>
        <title>{job.title} at {job.company} - CareerCraft Job Details</title>
        <meta name="description" content={`${job.title} at ${job.company} in ${job.location}. ${job.description.substring(0, 150)}...`} />
        <meta property="og:title" content={`${job.title} at ${job.company}`} />
        <meta property="og:description" content={job.description.substring(0, 150)} />
        <meta property="og:url" content={`https://careercraft.in/job-details/${job.id}`} />
        <link rel="canonical" href={`https://careercraft.in/job-details/${job.id}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    to="/job-applications"
                    className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                    onClick={() => trackButtonClick('back_to_jobs', 'navigation', '/job-details')}
                  >
                    <ArrowLeft size={16} />
                    Back to Jobs
                  </Link>
                  <Link 
                    to="/"
                    className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors ml-4"
                    onClick={() => trackButtonClick('back_to_home', 'navigation', '/job-details')}
                  >
                    <Home size={16} />
                    Home
                  </Link>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                <p className="text-blue-100 mt-1">{job.company} • {job.location}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSaveJob}
                  className={`p-3 rounded-lg ${saved ? 'bg-amber-100 text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'} transition-colors`}
                  title={saved ? 'Remove from saved' : 'Save job'}
                >
                  <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white/20 text-white p-3 rounded-lg hover:bg-white/30 transition-colors"
                  title="Share job"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                {/* Job Header */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Briefcase size={14} />
                      {job.type}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Award size={14} />
                      {job.experience || 'Experience not specified'}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <DollarSign size={14} />
                      {job.salary || 'Salary not disclosed'}
                    </span>
                    {job.featured && (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <TrendingUp size={14} />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle size={18} />
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckSquare size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Qualifications */}
                {qualifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <GraduationCap size={18} />
                      Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckSquare size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How to Apply */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Apply</h3>
                  <p className="text-gray-700 mb-4">
                    Click the "Apply Now" button below to be redirected to the company's official application portal.
                  </p>
                  <button
                    onClick={handleApply}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Apply Now
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Note: You will be redirected to the company's official website for the application process.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{job.views || 0}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{job.applications || 0}</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Share2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{job.shares || 0}</div>
                    <div className="text-sm text-gray-600">Shares</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Bookmark className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{job.saves || 0}</div>
                    <div className="text-sm text-gray-600">Saves</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              {/* Company Info */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building size={18} />
                  Company Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Company</h4>
                    <p className="text-gray-900">{job.company}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Location</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin size={16} />
                      {job.location}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Job Type</h4>
                    <p className="text-gray-900">{job.type}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Experience Required</h4>
                    <p className="text-gray-900">{job.experience || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Salary</h4>
                    <p className="text-gray-900">{job.salary || 'Not disclosed'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Posted</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar size={16} />
                      {formatDate(job.postedDate)}
                    </div>
                  </div>
                  
                  {job.companyWebsite && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Website</h4>
                      <a 
                        href={job.companyWebsite.startsWith('http') ? job.companyWebsite : `https://${job.companyWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => trackExternalLink('Company Website', job.companyWebsite!, 'job_details')}
                      >
                        <Globe size={16} />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(job.contactEmail || job.contactPhone || job.hiringManager) && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    {job.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <a 
                            href={`mailto:${job.contactEmail}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {job.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {job.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <a 
                            href={`tel:${job.contactPhone}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {job.contactPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {job.hiringManager && (
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Hiring Manager</p>
                          <p className="text-gray-900">{job.hiringManager}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Apply Now
                  </button>
                  
                  <button
                    onClick={handleSaveJob}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${saved 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
                    {saved ? 'Remove from Saved' : 'Save Job'}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Share Job
                  </button>
                  
                  <Link
                    to="/job-applications"
                    className="block text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                    onClick={() => trackButtonClick('browse_more_jobs', 'navigation', '/job-details')}
                  >
                    Browse More Jobs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetails;