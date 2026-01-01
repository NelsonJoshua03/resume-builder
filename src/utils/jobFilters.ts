// src/utils/jobFilters.ts
import { JobData } from '../firebase/jobService';

export interface JobFilters {
  sectors?: string[];  // Changed from string to string[]
  type?: string;
  locations?: string[]; // Changed from string to string[]
  searchTerm?: string;
  featured?: boolean;
  isActive?: boolean;
  experience?: string;
  jobTitle?: string;  // New field for job title filter
}

// Fresher-friendly sector mapping
export const FRESHER_SECTOR_MAPPING: Record<string, string[]> = {
  'Mechanical Engineering': [
    'Engineering', 'Manufacturing', 'Automotive', 'Aerospace', 
    'Production', 'Design', 'Maintenance', 'Quality Control'
  ],
  'Computer Science/IT': [
    'IT/Software', 'Software Development', 'Web Development', 
    'Mobile Development', 'Data Science', 'AI/ML', 'Cybersecurity'
  ],
  'Electrical/Electronics': [
    'Electronics', 'Electrical', 'Embedded Systems', 'VLSI',
    'Power Systems', 'Instrumentation'
  ],
  'Civil Engineering': [
    'Construction', 'Infrastructure', 'Real Estate', 'Urban Planning',
    'Structural Design', 'Project Management'
  ],
  'Business/MBA': [
    'Marketing', 'Finance', 'HR', 'Sales', 'Operations', 
    'Business Development', 'Consulting'
  ],
  'Biotechnology': [
    'Biotech', 'Pharmaceutical', 'Healthcare', 'Research',
    'Clinical Research', 'Medical Devices'
  ],
  'Chemical Engineering': [
    'Chemical', 'Petrochemical', 'Process Industry', 'Oil & Gas'
  ],
  'Arts & Humanities': [
    'Content Writing', 'Journalism', 'Education', 'Design',
    'Media', 'Advertising', 'Public Relations'
  ]
};

/**
 * Get fresher-friendly sector display names
 */
export const getFresherFriendlySectors = (jobs: JobData[]): string[] => {
  const uniqueSectors = getUniqueSectors(jobs);
  const fresherSectors = new Set<string>();
  
  // Map technical sectors to fresher-friendly names
  uniqueSectors.forEach(sector => {
    for (const [fresherName, technicalSectors] of Object.entries(FRESHER_SECTOR_MAPPING)) {
      if (technicalSectors.some(techSector => 
        sector.toLowerCase().includes(techSector.toLowerCase()) ||
        techSector.toLowerCase().includes(sector.toLowerCase())
      )) {
        fresherSectors.add(fresherName);
      }
    }
  });
  
  // Add any remaining sectors
  uniqueSectors.forEach(sector => {
    if (!Array.from(fresherSectors).some(fresherName => 
      FRESHER_SECTOR_MAPPING[fresherName]?.includes(sector)
    )) {
      fresherSectors.add(sector);
    }
  });
  
  return Array.from(fresherSectors).sort();
};

/**
 * Get technical sectors from fresher-friendly selection
 */
export const getTechnicalSectorsFromFresherSelection = (selectedFresherSectors: string[]): string[] => {
  const technicalSectors = new Set<string>();
  
  selectedFresherSectors.forEach(fresherSector => {
    if (FRESHER_SECTOR_MAPPING[fresherSector]) {
      FRESHER_SECTOR_MAPPING[fresherSector].forEach(techSector => {
        technicalSectors.add(techSector);
      });
    } else {
      technicalSectors.add(fresherSector);
    }
  });
  
  return Array.from(technicalSectors);
};

/**
 * Main filtering function that applies all filters to jobs
 */
export const filterJobs = (
  jobs: JobData[],
  filters: JobFilters
): JobData[] => {
  let filteredJobs = [...jobs];

  // Filter by multiple sectors
  if (filters.sectors && filters.sectors.length > 0) {
    const technicalSectors = getTechnicalSectorsFromFresherSelection(filters.sectors);
    filteredJobs = filteredJobs.filter(job =>
      technicalSectors.some(sector =>
        job.sector.toLowerCase().includes(sector.toLowerCase()) ||
        sector.toLowerCase().includes(job.sector.toLowerCase())
      )
    );
  }

  // Filter by job type
  if (filters.type && filters.type !== 'all') {
    filteredJobs = filteredJobs.filter(job =>
      job.type.toLowerCase() === filters.type!.toLowerCase()
    );
  }

  // Filter by multiple locations (case-insensitive, partial match)
  if (filters.locations && filters.locations.length > 0) {
    filteredJobs = filteredJobs.filter(job =>
      filters.locations!.some(location =>
        job.location.toLowerCase().includes(location.toLowerCase().trim()) ||
        location.toLowerCase().trim().includes(job.location.toLowerCase())
      )
    );
  }

  // Filter by specific job title
  if (filters.jobTitle && filters.jobTitle.trim() !== '') {
    filteredJobs = filteredJobs.filter(job =>
      job.title.toLowerCase().includes(filters.jobTitle!.toLowerCase().trim())
    );
  }

  // Filter by experience level
  if (filters.experience && filters.experience !== 'all') {
    filteredJobs = filteredJobs.filter(job => {
      const jobExp = job.experience || 'Not specified';
      return normalizeExperience(jobExp) === normalizeExperience(filters.experience!);
    });
  }

  // Filter by featured status
  if (filters.featured !== undefined) {
    filteredJobs = filteredJobs.filter(job =>
      job.featured === filters.featured
    );
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    filteredJobs = filteredJobs.filter(job =>
      job.isActive === filters.isActive
    );
  }

  // Search by term (title, company, or description)
  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    filteredJobs = filteredJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      (job.requirements?.some(req => req.toLowerCase().includes(searchTerm)) || false)
    );
  }

  return filteredJobs;
};

/**
 * Normalize experience strings for consistent comparison
 */
const normalizeExperience = (experience: string): string => {
  if (!experience) return 'Not specified';
  const exp = experience.toLowerCase().trim();
  
  // Map variations to standard formats
  if (exp.includes('fresher') || exp.includes('0-1') || exp.includes('entry') || exp.includes('0 to 1')) {
    return 'Fresher (0-1 years)';
  }
  if (exp.includes('0-2') || exp.includes('0 to 2') || exp.includes('0 - 2')) {
    return '0-2 years';
  }
  if (exp.includes('1-3') || exp.includes('1 to 3') || exp.includes('1 - 3')) {
    return '1-3 years';
  }
  if (exp.includes('2-5') || exp.includes('2 to 5') || exp.includes('2 - 5')) {
    return '2-5 years';
  }
  if (exp.includes('3-5') || exp.includes('3 to 5') || exp.includes('3 - 5')) {
    return '3-5 years';
  }
  if (exp.includes('5-8') || exp.includes('5 to 8') || exp.includes('5 - 8')) {
    return '5-8 years';
  }
  if (exp.includes('8+') || exp.includes('8+ years') || exp.includes('8 plus')) {
    return '8+ years';
  }
  if (exp.includes('10+') || exp.includes('10+ years') || exp.includes('senior')) {
    return '8+ years'; // Map senior roles to 8+
  }
  return experience;
};

/**
 * Sort jobs by date (newest first)
 */
export const sortJobsByDate = (jobs: JobData[]): JobData[] => {
  return [...jobs].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() :
      a.postedDate ? new Date(a.postedDate).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() :
      b.postedDate ? new Date(b.postedDate).getTime() : 0;
    return dateB - dateA; // Newest first
  });
};

/**
 * Get unique job titles from jobs array
 */
export const getUniqueJobTitles = (jobs: JobData[]): string[] => {
  const titles = new Set<string>();
  jobs.forEach(job => {
    if (job.title && job.title.trim() !== '') {
      titles.add(job.title);
    }
  });
  return Array.from(titles).sort();
};

/**
 * Get unique locations from jobs array
 */
export const getUniqueLocations = (jobs: JobData[]): string[] => {
  const locations = new Set<string>();
  jobs.forEach(job => {
    if (job.location && job.location.trim() !== '') {
      // Clean up location strings
      const cleanLocation = job.location.split(',')[0].trim();
      if (cleanLocation) {
        locations.add(cleanLocation);
      }
    }
  });
  return Array.from(locations).sort();
};

/**
 * Paginate jobs array
 */
export const paginateJobs = (
  jobs: JobData[],
  page: number,
  perPage: number
): { paginatedJobs: JobData[], totalPages: number } => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedJobs = jobs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(jobs.length / perPage);
  return { paginatedJobs, totalPages };
};

/**
 * Get all unique experience levels from jobs
 */
export const getUniqueExperienceLevels = (jobs: JobData[]): string[] => {
  const experiences = new Set<string>();
  jobs.forEach(job => {
    const exp = job.experience || 'Not specified';
    experiences.add(normalizeExperience(exp));
  });
  
  // Return in a logical order
  const orderedExperiences = [
    'Fresher (0-1 years)',
    '0-2 years',
    '1-3 years',
    '2-5 years',
    '3-5 years',
    '5-8 years',
    '8+ years',
    'Not specified'
  ].filter(exp => experiences.has(exp));
  
  return orderedExperiences;
};

/**
 * Get all unique sectors from jobs
 */
export const getUniqueSectors = (jobs: JobData[]): string[] => {
  const sectors = new Set<string>();
  jobs.forEach(job => {
    if (job.sector && job.sector.trim() !== '') {
      sectors.add(job.sector);
    }
  });
  return Array.from(sectors).sort();
};

/**
 * Get all unique job types from jobs
 */
export const getUniqueJobTypes = (jobs: JobData[]): string[] => {
  const types = new Set<string>();
  jobs.forEach(job => {
    if (job.type && job.type.trim() !== '') {
      types.add(job.type);
    }
  });
  return Array.from(types).sort();
};

/**
 * Get stats about jobs
 */
export const getJobStats = (jobs: JobData[]) => {
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.isActive !== false).length,
    remoteJobs: jobs.filter(job => job.type === 'Remote' || job.location.toLowerCase().includes('remote')).length,
    featuredJobs: jobs.filter(job => job.featured).length,
    todayJobs: jobs.filter(job => {
      const jobDate = new Date(job.postedDate || job.createdAt || new Date());
      const today = new Date();
      return jobDate.toDateString() === today.toDateString();
    }).length,
    jobsByExperience: {} as Record<string, number>,
    jobsBySector: {} as Record<string, number>,
    jobsByType: {} as Record<string, number>,
    jobsByLocation: {} as Record<string, number>,
  };

  // Count by experience
  jobs.forEach(job => {
    const exp = normalizeExperience(job.experience || 'Not specified');
    stats.jobsByExperience[exp] = (stats.jobsByExperience[exp] || 0) + 1;
  });

  // Count by sector
  jobs.forEach(job => {
    const sector = job.sector || 'Not specified';
    stats.jobsBySector[sector] = (stats.jobsBySector[sector] || 0) + 1;
  });

  // Count by type
  jobs.forEach(job => {
    const type = job.type || 'Not specified';
    stats.jobsByType[type] = (stats.jobsByType[type] || 0) + 1;
  });

  // Count by location
  jobs.forEach(job => {
    const location = job.location || 'Not specified';
    stats.jobsByLocation[location] = (stats.jobsByLocation[location] || 0) + 1;
  });

  return stats;
};

/**
 * Filter jobs by multiple criteria for advanced search
 */
export const advancedSearch = (
  jobs: JobData[],
  criteria: {
    keywords?: string[];
    minSalary?: number;
    maxSalary?: number;
    locations?: string[];
    sectors?: string[];
    types?: string[];
    experienceRanges?: string[];
    dateRange?: { start: Date; end: Date };
  }
): JobData[] => {
  let filteredJobs = [...jobs];

  // Keyword search across multiple fields
  if (criteria.keywords && criteria.keywords.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      return criteria.keywords!.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return (
          job.title.toLowerCase().includes(keywordLower) ||
          job.company.toLowerCase().includes(keywordLower) ||
          job.description.toLowerCase().includes(keywordLower) ||
          job.requirements?.some(req => req.toLowerCase().includes(keywordLower)) ||
          job.sector.toLowerCase().includes(keywordLower)
        );
      });
    });
  }

  // Salary filter
  if (criteria.minSalary !== undefined || criteria.maxSalary !== undefined) {
    filteredJobs = filteredJobs.filter(job => {
      const salaryMatch = job.salary.match(/\d+/g);
      if (!salaryMatch) return false;

      const salaryNumbers = salaryMatch.map(num => parseInt(num));
      const minSalary = Math.min(...salaryNumbers);
      const maxSalary = Math.max(...salaryNumbers);
      
      const passesMin = criteria.minSalary ? maxSalary >= criteria.minSalary : true;
      const passesMax = criteria.maxSalary ? minSalary <= criteria.maxSalary : true;
      
      return passesMin && passesMax;
    });
  }

  // Multiple locations filter
  if (criteria.locations && criteria.locations.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      return criteria.locations!.some(location =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    });
  }

  // Multiple sectors filter
  if (criteria.sectors && criteria.sectors.length > 0) {
    filteredJobs = filteredJobs.filter(job =>
      criteria.sectors!.includes(job.sector)
    );
  }

  // Multiple types filter
  if (criteria.types && criteria.types.length > 0) {
    filteredJobs = filteredJobs.filter(job =>
      criteria.types!.includes(job.type)
    );
  }

  // Experience ranges filter
  if (criteria.experienceRanges && criteria.experienceRanges.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      const jobExp = normalizeExperience(job.experience || 'Not specified');
      return criteria.experienceRanges!.some(range =>
        normalizeExperience(range) === jobExp
      );
    });
  }

  // Date range filter
  if (criteria.dateRange) {
    filteredJobs = filteredJobs.filter(job => {
      const jobDate = job.postedDate ? new Date(job.postedDate) :
        job.createdAt ? new Date(job.createdAt) : null;

      if (!jobDate) return false;
      
      return jobDate >= criteria.dateRange!.start && jobDate <= criteria.dateRange!.end;
    });
  }

  return filteredJobs;
};

/**
 * Search suggestions based on job data
 */
export const getSearchSuggestions = (
  jobs: JobData[],
  query: string,
  limit: number = 5
): Array<{ type: 'title' | 'company' | 'location' | 'sector'; value: string }> => {
  if (!query.trim()) return [];
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();
  const result: Array<{ type: 'title' | 'company' | 'location' | 'sector'; value: string }> = [];
  
  // Search in titles
  jobs.forEach(job => {
    if (job.title.toLowerCase().includes(queryLower)) {
      suggestions.add(job.title);
    }
  });
  
  // Search in companies
  jobs.forEach(job => {
    if (job.company.toLowerCase().includes(queryLower)) {
      suggestions.add(job.company);
    }
  });
  
  // Search in locations
  jobs.forEach(job => {
    if (job.location.toLowerCase().includes(queryLower)) {
      suggestions.add(job.location);
    }
  });
  
  // Search in sectors
  jobs.forEach(job => {
    if (job.sector.toLowerCase().includes(queryLower)) {
      suggestions.add(job.sector);
    }
  });
  
  // Convert to array and categorize
  Array.from(suggestions).slice(0, limit).forEach(value => {
    // Determine type
    const jobWithValue = jobs.find(job =>
      job.title === value ||
      job.company === value ||
      job.location === value ||
      job.sector === value
    );

    if (jobWithValue) {
      let type: 'title' | 'company' | 'location' | 'sector' = 'title';
      if (jobWithValue.title === value) type = 'title';
      else if (jobWithValue.company === value) type = 'company';
      else if (jobWithValue.location === value) type = 'location';
      else if (jobWithValue.sector === value) type = 'sector';
      
      result.push({ type, value });
    }
  });
  
  return result;
};

export default {
  filterJobs,
  sortJobsByDate,
  getUniqueJobTitles,
  getUniqueLocations,
  getUniqueExperienceLevels,
  getUniqueSectors,
  getUniqueJobTypes,
  paginateJobs,
  getJobStats,
  advancedSearch,
  getSearchSuggestions,
  getFresherFriendlySectors,
  getTechnicalSectorsFromFresherSelection,
};