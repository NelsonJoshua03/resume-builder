// src/components/JobCard.tsx - FIXED VERSION WITH VIEW TRACKING FIX
import React, { useEffect, useState } from 'react';
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
  TrendingUp
} from 'lucide-react';

interface JobCardProps {
  job: {
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
  };
  featured?: boolean;
  saved?: boolean;
  onShare: (job: any) => void;
  onSave: (jobId: string, jobTitle: string, company: string) => void;
  onApply: (job: any) => void;
  onTrackView: (jobId: string, jobTitle: string, company: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  featured = false,
  saved = false,
  onShare,
  onSave,
  onApply,
  onTrackView
}) => {
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track view when component mounts - FIXED: Only track once per session
  useEffect(() => {
    if (job.id && job.title && job.company && !hasTrackedView) {
      // Generate a unique tracking key for this session
      const sessionId = sessionStorage.getItem('session_id') || 'default_session';
      const viewKey = `viewed_${job.id}_${sessionId}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      // Only track if not viewed in this session OR if more than 30 minutes have passed
      if (!hasViewed) {
        onTrackView(job.id, job.title, job.company);
        setHasTrackedView(true);
        
        // Store tracking info
        sessionStorage.setItem(viewKey, 'true');
        const timestamp = Date.now();
        sessionStorage.setItem(`${viewKey}_time`, timestamp.toString());
      } else {
        // Check if more than 30 minutes have passed since last view
        const lastViewTime = parseInt(sessionStorage.getItem(`${viewKey}_time`) || '0');
        const currentTime = Date.now();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (currentTime - lastViewTime > thirtyMinutes) {
          onTrackView(job.id, job.title, job.company);
          setHasTrackedView(true);
          sessionStorage.setItem(`${viewKey}_time`, currentTime.toString());
        }
      }
    }
  }, [job.id, job.title, job.company, onTrackView, hasTrackedView]);

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

  // Handle undefined arrays safely
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const qualifications = Array.isArray(job.qualifications) ? job.qualifications : [];

  return (
    <div className={`bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 ${featured ? 'border-amber-200 border-2' : 'border-gray-200'}`}>
      {featured && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-t-xl">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={14} />
            <span className="font-semibold text-sm">⭐ Featured Opportunity</span>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2">
                {job.title}
              </h3>
              {job.isNew && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                  NEW
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span className="font-medium">{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => job.id && onSave(job.id, job.title, job.company)}
              className={`p-2 rounded-lg ${saved ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={saved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => onShare(job)}
              className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
              title="Share job"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Briefcase size={12} />
            {job.type}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Award size={12} />
            {job.experience || 'Experience not specified'}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <DollarSign size={12} />
            {job.salary || 'Salary not disclosed'}
          </span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            {formatDate(job.postedDate)}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
              <CheckCircle size={14} />
              Key Requirements:
            </h4>
            <div className="flex flex-wrap gap-2">
              {requirements.slice(0, 4).map((req, index) => (
                <span
                  key={index}
                  className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs border border-gray-200"
                >
                  {req.length > 30 ? `${req.substring(0, 30)}...` : req}
                </span>
              ))}
              {requirements.length > 4 && (
                <span className="text-gray-500 text-xs">
                  +{requirements.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Qualifications */}
        {qualifications.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
              <GraduationCap size={14} />
              Qualifications:
            </h4>
            <div className="flex flex-wrap gap-2">
              {qualifications.slice(0, 3).map((qual, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs border border-blue-200"
                >
                  {qual.length > 25 ? `${qual.substring(0, 25)}...` : qual}
                </span>
              ))}
              {qualifications.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{qualifications.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{job.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{job.applications || 0} applications</span>
          </div>
          {job.shares && job.shares > 0 && (
            <div className="flex items-center gap-1">
              <Share2 size={12} />
              <span>{job.shares} shares</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onApply(job)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Apply Now
          </button>
          <button
            onClick={() => onShare(job)}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;