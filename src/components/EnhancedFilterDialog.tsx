// src/components/EnhancedFilterDialog.tsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  Briefcase,
  Award,
  X,
  Sparkles,
  Check,
  XCircle,
  RotateCcw,
  ListFilter,
  Database,
  Plus
} from 'lucide-react';

interface EnhancedFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EnhancedFilterData) => void;
  onSkip: () => void;
  availableJobTitles: string[];
  experienceOptions: string[];
  firebaseConnected: boolean;
  hasSeenDialogBefore: boolean;
}

export interface EnhancedFilterData {
  jobTitles: string[];
  experience: string;
}

const EnhancedFilterDialog: React.FC<EnhancedFilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onSkip,
  availableJobTitles,
  experienceOptions,
  firebaseConnected,
  hasSeenDialogBefore
}) => {
  const [filterData, setFilterData] = useState<EnhancedFilterData>({
    jobTitles: [],
    experience: 'all'
  });

  const [jobTitleSearch, setJobTitleSearch] = useState<string>('');

  const filteredJobTitles = useMemo(() => {
    if (!jobTitleSearch) return availableJobTitles.slice(0, 20);
    return availableJobTitles
      .filter(title => title.toLowerCase().includes(jobTitleSearch.toLowerCase()))
      .slice(0, 20);
  }, [availableJobTitles, jobTitleSearch]);

  const toggleJobTitleSelection = (title: string) => {
    setFilterData(prev => {
      if (prev.jobTitles.includes(title)) {
        return {
          ...prev,
          jobTitles: prev.jobTitles.filter(t => t !== title)
        };
      } else {
        return {
          ...prev,
          jobTitles: [...prev.jobTitles, title]
        };
      }
    });
  };

  const removeJobTitleFromFilter = (title: string) => {
    setFilterData(prev => ({
      ...prev,
      jobTitles: prev.jobTitles.filter(t => t !== title)
    }));
  };

  const resetEnhancedFilters = () => {
    setFilterData({
      jobTitles: [],
      experience: 'all'
    });
    setJobTitleSearch('');
  };

  const handleApplyFilters = () => {
    onApplyFilters(filterData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-blue-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={24} />
                Enhanced Job Filters
              </h3>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Find your perfect job with targeted filters
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Skip and browse all jobs"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 mb-8">
            {/* Job Titles Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase size={16} />
                Select Job Titles (Multiple)
                {filterData.jobTitles.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {filterData.jobTitles.length} selected
                  </span>
                )}
              </label>
              
              <div className="relative mb-2">
                <input
                  type="text"
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Search job titles..."
                  value={jobTitleSearch}
                  onChange={(e) => setJobTitleSearch(e.target.value)}
                />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Selected Job Titles Chips */}
              {filterData.jobTitles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {filterData.jobTitles.map((title, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <Briefcase size={12} />
                      {title}
                      <button
                        onClick={() => removeJobTitleFromFilter(title)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Job Titles Checkboxes */}
              <div className="max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3">
                {filteredJobTitles.length > 0 ? (
                  filteredJobTitles.map((title, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filterData.jobTitles.includes(title)}
                        onChange={() => toggleJobTitleSelection(title)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="text-gray-700">{title}</span>
                      </div>
                      {filterData.jobTitles.includes(title) && (
                        <Check className="ml-auto text-green-500" size={16} />
                      )}
                    </label>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No job titles found</div>
                )}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Award size={16} />
                Experience Level
              </label>
              <select
                className="w-full p-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                value={filterData.experience}
                onChange={(e) => setFilterData(prev => ({ ...prev, experience: e.target.value }))}
              >
                {experienceOptions.map(exp => (
                  <option key={exp} value={exp}>
                    {exp === 'all' ? 'All Experience Levels' : exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <ListFilter size={16} />
              Filter Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Job Titles:</p>
                <p className="font-medium text-gray-800">
                  {filterData.jobTitles.length > 0 
                    ? `${filterData.jobTitles.length} selected` 
                    : 'Any'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Experience:</p>
                <p className="font-medium text-gray-800">
                  {filterData.experience === 'all' ? 'All levels' : filterData.experience}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Check size={18} />
              Apply Filters
            </button>
            
            <button
              onClick={resetEnhancedFilters}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 md:py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <RotateCcw size={18} />
              Reset All
            </button>
            
            <button
              onClick={onSkip}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <XCircle size={18} />
              Skip & Browse All
            </button>
          </div>

          {/* Stats Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {availableJobTitles.length}+ job titles
                </span>
                <span className="flex items-center gap-1">
                  <Award size={12} />
                  {experienceOptions.length} experience levels
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Database size={12} />
                  Powered by Firebase
                </span>
                {firebaseConnected && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    🔥 Live Sync
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFilterDialog;