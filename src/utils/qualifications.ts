// src/utils/qualifications.ts

export const getQualificationOptions = (): string[] => {
  return [
    'Any Graduate',
    'B.E/B.Tech',
    'M.E/M.Tech',
    'B.Sc',
    'M.Sc',
    'BBA',
    'MBA',
    'B.Com',
    'M.Com',
    'BCA',
    'MCA',
    'Diploma',
    'PhD',
    'Post Graduate',
    '12th Pass',
    '10th Pass',
    'UGC NET',
    'GATE',
    'ITI',
    'CA',
    'CS',
    'ICWA',
    'Medical Graduate (MBBS)',
    'B.Arch',
    'LLB',
    'LLM',
    'B.Pharm',
    'M.Pharm',
    'BDS',
    'BAMS',
    'BHMS'
  ];
};

/**
 * Get education level/experience options
 */
export const getEducationLevelOptions = (): string[] => {
  return [
    'Fresher (0-1 years)',
    '0-2 years',
    '1-3 years',
    '2-5 years',
    '3-5 years',
    '5-8 years',
    '8+ years',
    'Not specified'
  ];
};



export const INDIAN_QUALIFICATIONS = {
  ENGINEERING: [
    'B.E/B.Tech',
    'M.E/M.Tech',
    'Diploma in Engineering',
    'B.Arch',
    'M.Arch',
    'AMIE',
    'B.Sc Engineering'
  ],
  MEDICAL: [
    'MBBS',
    'BDS',
    'BAMS',
    'BHMS',
    'B.Pharm',
    'M.Pharm',
    'B.Sc Nursing',
    'GNM',
    'ANM'
  ],
  MANAGEMENT: [
    'MBA',
    'PGDM',
    'BBA',
    'BMS',
    'BBM',
    'PGP'
  ],
  SCIENCE: [
    'B.Sc',
    'M.Sc',
    'B.Sc (Hons)',
    'M.Sc (Hons)',
    'Integrated M.Sc'
  ],
  COMMERCE: [
    'B.Com',
    'M.Com',
    'B.Com (Hons)',
    'M.Com (Hons)',
    'CA',
    'CS',
    'CMA'
  ],
  ARTS: [
    'BA',
    'MA',
    'BA (Hons)',
    'MA (Hons)',
    'BFA',
    'MFA'
  ],
  COMPUTER_APPLICATIONS: [
    'BCA',
    'MCA',
    'PGDCA',
    'B.Sc IT',
    'M.Sc IT'
  ],
  LAW: [
    'LLB',
    'LLM',
    'BA LLB',
    'BBA LLB',
    'B.Com LLB'
  ],
  EDUCATION: [
    'B.Ed',
    'M.Ed',
    'D.Ed',
    'BPEd',
    'MPEd',
    'B.El.Ed'
  ],
  VOCATIONAL: [
    'ITI',
    'Polytechnic Diploma',
    'Vocational Training Certificate'
  ]
};

export const getQualificationsBySector = (sector: string): string[] => {
  const sectorMap: Record<string, string[]> = {
    'IT/Software': [...INDIAN_QUALIFICATIONS.ENGINEERING, ...INDIAN_QUALIFICATIONS.COMPUTER_APPLICATIONS],
    'Engineering': INDIAN_QUALIFICATIONS.ENGINEERING,
    'Healthcare': INDIAN_QUALIFICATIONS.MEDICAL,
    'Management': INDIAN_QUALIFICATIONS.MANAGEMENT,
    'Finance': INDIAN_QUALIFICATIONS.COMMERCE,
    'Education': INDIAN_QUALIFICATIONS.EDUCATION,
    'Design': INDIAN_QUALIFICATIONS.ARTS,
    'Legal': INDIAN_QUALIFICATIONS.LAW,
    'Science/Research': INDIAN_QUALIFICATIONS.SCIENCE,
    'Manufacturing': [...INDIAN_QUALIFICATIONS.ENGINEERING, ...INDIAN_QUALIFICATIONS.VOCATIONAL]
  };
  
  return sectorMap[sector] || [
    'Any Graduate',
    'Post Graduate',
    'Professional Degree'
  ];
};

export const getMinimumEducationOptions = () => [
  { value: '10th', label: '10th Pass (Matriculation)' },
  { value: '12th', label: '12th Pass (Intermediate)' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate (Bachelor\'s)' },
  { value: 'post_graduate', label: 'Post Graduate (Master\'s)' },
  { value: 'doctorate', label: 'Doctorate (PhD)' },
  { value: 'professional', label: 'Professional Degree' }
];

export const parseSalary = (salaryString: string): { min: number; max: number; currency: string; period: string } => {
  // Parse salary strings like "₹6,00,000 - ₹12,00,000 PA"
  const regex = /([₹$€£]?)([\d,]+)\s*[-–]\s*([₹$€£]?)([\d,]+)\s*(PA|Per Annum|LPA|per month|PM)?/i;
  const match = salaryString.match(regex);
  
  if (match) {
    const min = parseInt(match[2].replace(/,/g, ''));
    const max = parseInt(match[4].replace(/,/g, ''));
    const currency = match[1] || '₹';
    const period = (match[5] || 'PA').toUpperCase();
    
    return { min, max, currency, period };
  }
  
  return { min: 0, max: 0, currency: '₹', period: 'PA' };
};