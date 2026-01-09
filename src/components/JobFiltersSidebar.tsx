// src/components/JobFiltersSidebar.tsx
import React from 'react';
import {
  Filter,
  X,
  FolderTree,
  Briefcase,
  Award,
  MapPin,
  BarChart,
  Eye,
  Briefcase as BriefcaseIcon,
  Users,
  ArrowRight,
  Download,
  Bookmark,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobFiltersSidebarProps {
  selectedSectors: string[];
  selectedJobType: string;
  selectedExperience: string;
  selectedLocations: string[];
  sectorOptions: string[];
  jobTypes: string[];
  experienceOptions: string[];
  popularCities: string[];
  analytics: {
    topCities: Array<{city: string; count: number}>;
    topSectors: Array<{sector: string; count: number}>;
    topExperience: Array<{experience: string; count: number}>;
    popularJobs: Array<{title: string; views: number; company: string}>;
    hourlyTrends: Array<{hour: number; views: number}>;
  };
  savedJobs: string[];
  totalViews: number;
  totalApplications: number;
  currentPage: number;
  totalPages: number;
  filteredJobsCount: number;
  onClearAllFilters: () => void;
  onSectorSelection: (sector: string) => void;
  onJobTypeChange: (type: string) => void;
  onExperienceChange: (experience: string) => void;
  onCityFilter: (city: string) => void;
  onOpenEnhancedFilterDialog: () => void;
  onDownloadCSV: () => void;
  onViewAnalyticsDashboard: () => void;
}

const JobFiltersSidebar: React.FC<JobFiltersSidebarProps> = ({
  selectedSectors,
  selectedJobType,
  selectedExperience,
  selectedLocations,
  sectorOptions,
  jobTypes,
  experienceOptions,
  popularCities,
  analytics,
  savedJobs,
  totalViews,
  totalApplications,
  currentPage,
  totalPages,
  filteredJobsCount,
  onClearAllFilters,
  onSectorSelection,
  onJobTypeChange,
  onExperienceChange,
  onCityFilter,
  onOpenEnhancedFilterDialog,
  onDownloadCSV,
  onViewAnalyticsDashboard
}) => {
  return (
    <div className="hidden lg:flex lg:w-1/4 flex-col gap-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 sticky-sidebar">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} />
            Filters
          </h3>
          <button 
            onClick={onClearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <X size={14} />
            Clear All
          </button>
        </div>
        
        {/* Sectors Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FolderTree size={16} />
            Select Sectors
            {selectedSectors.length > 0 && (
              <span className="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                {selectedSectors.length} selected
              </span>
            )}
          </label>
          
          {/* Selected Sectors Chips */}
          {selectedSectors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSectors.map((sector, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  <FolderTree size={12} />
                  {sector.length > 15 ? `${sector.substring(0, 15)}...` : sector}
                  <button
                    onClick={() => onSectorSelection(sector)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Sectors Checkboxes */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {sectorOptions.slice(0, 10).map((sector, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sector)}
                  onChange={() => onSectorSelection(sector)}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <FolderTree size={14} className="text-gray-400" />
                  <span className="text-gray-700 text-sm">{sector}</span>
                </div>
              </label>
            ))}
            
            {sectorOptions.length > 10 && (
              <button
                onClick={onOpenEnhancedFilterDialog}
                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
              >
                <ArrowRight size={12} />
                View Enhanced Filters
              </button>
            )}
          </div>
        </div>

        {/* Job Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase size={16} />
            Job Type
          </label>
          <div className="space-y-2">
            {jobTypes.map(type => (
              <label
                key={type}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name="jobType"
                  checked={selectedJobType === type}
                  onChange={() => onJobTypeChange(type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">
                  {type === 'all' ? 'All Types' : type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Award size={16} />
            Years of Experience
          </label>
          <div className="space-y-2">
            {experienceOptions.map(exp => (
              <label
                key={exp}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name="experience"
                  checked={selectedExperience === exp}
                  onChange={() => onExperienceChange(exp)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700 text-sm">
                  {exp === 'all' ? 'All Experience Levels' : exp}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin size={16} />
            Select Locations
            {selectedLocations.length > 0 && (
              <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {selectedLocations.length} selected
              </span>
            )}
          </label>
          
          {/* Selected Locations Chips */}
          {selectedLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLocations.map((location, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  <MapPin size={10} />
                  {location.length > 12 ? `${location.substring(0, 12)}...` : location}
                  <button
                    onClick={() => onCityFilter(location)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Popular Cities Quick Select */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Popular Cities:</p>
            <div className="flex flex-wrap gap-1">
              {popularCities.slice(0, 6).map(city => (
                <button
                  key={city}
                  onClick={() => onCityFilter(city)}
                  className={`px-2 py-1 text-xs rounded-full ${selectedLocations.includes(city) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={onOpenEnhancedFilterDialog}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center justify-center gap-1"
          >
            <Briefcase size={12} />
            Enhanced Job Filters
          </button>
        </div>

        {/* Desktop Analytics */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart size={16} />
            Analytics Insights
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 mb-1">🏙️ Top Cities</p>
              <div className="space-y-1">
                {analytics.topCities.map((city) => (
                  <div key={city.city} className="flex justify-between items-center">
                    <span className="text-gray-700">{city.city}</span>
                    <span className="font-bold text-blue-600">{city.count} jobs</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">🏢 Popular Sectors</p>
              <div className="space-y-1">
                {analytics.topSectors.map((sector) => (
                  <div key={sector.sector} className="flex justify-between items-center">
                    <span className="text-gray-700 truncate">{sector.sector}</span>
                    <span className="font-bold text-purple-600">{sector.count} jobs</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 mb-1">🎯 Popular Experience Levels</p>
              <div className="space-y-1">
                {analytics.topExperience.map((exp) => (
                  <div key={exp.experience} className="flex justify-between items-center">
                    <span className="text-gray-700 truncate">{exp.experience}</span>
                    <span className="font-bold text-amber-600">{exp.count} jobs</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">🔥 Popular Jobs</p>
              <div className="space-y-2">
                {analytics.popularJobs.map((job, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-800 text-xs truncate">{job.title}</p>
                    <p className="text-gray-600 text-xs">{job.company}</p>
                    <p className="text-green-600 text-xs">👁️ {job.views} views</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-bold text-green-600">
                  {totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                <span className="text-gray-600">Jobs: {filteredJobsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Components */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <BriefcaseIcon size={18} />
          Build Your Indian Resume
        </h3>
        <p className="text-blue-700 text-sm mb-4">
          Create an ATS-friendly resume optimized for Indian job market.
        </p>
        <Link 
          to="/free-resume-builder" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
        >
          Build Resume
        </Link>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
          <Download size={18} />
          Export Jobs
        </h3>
        <p className="text-green-700 text-sm mb-3">
          Download all jobs as CSV for offline reference
        </p>
        <button 
          onClick={onDownloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors block text-center w-full"
        >
          Download CSV
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <Bookmark size={18} />
          Saved Jobs
        </h3>
        <p className="text-amber-700 text-sm mb-2">
          You have {savedJobs.length} saved jobs
        </p>
        {savedJobs.length > 0 && (
          <button 
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            onClick={() => alert(`You have ${savedJobs.length} saved jobs`)}
          >
            View Saved Jobs
          </button>
        )}
      </div>
    </div>
  );
};

export default JobFiltersSidebar;