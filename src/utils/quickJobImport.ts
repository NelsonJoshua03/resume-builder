// src/utils/quickJobImport.ts
export interface QuickJobTemplate {
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  requirements: string[];
  applyLink: string;
}

export const quickJobTemplates: { [key: string]: QuickJobTemplate } = {
  software_developer: {
    title: "Software Developer",
    company: "Tech Company",
    location: "Bangalore, Karnataka",
    type: "Full-time",
    sector: "IT/Software",
    salary: "₹6,00,000 - ₹12,00,000 PA",
    description: "We are looking for a skilled Software Developer to join our team...",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "2+ years of experience in software development",
      "Proficiency in JavaScript/TypeScript",
      "Experience with React/Node.js"
    ],
    applyLink: "mailto:careers@company.com"
  },
  data_analyst: {
    title: "Data Analyst",
    company: "Analytics Firm",
    location: "Hyderabad, Telangana",
    type: "Full-time",
    sector: "Data Science",
    salary: "₹5,00,000 - ₹10,00,000 PA",
    description: "Seeking a Data Analyst to interpret and analyze complex data sets...",
    requirements: [
      "Bachelor's degree in Statistics, Mathematics, or related field",
      "Experience with SQL and Python",
      "Knowledge of data visualization tools",
      "Strong analytical skills"
    ],
    applyLink: "mailto:hr@company.com"
  }
  // Add more templates as needed
};

export const generateQuickJobs = (count: number, template: QuickJobTemplate): any[] => {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    jobs.push({
      ...template,
      id: `quick-${Date.now()}-${i}`,
      postedDate: new Date().toISOString().split('T')[0],
      addedTimestamp: Date.now()
    });
  }
  return jobs;
};