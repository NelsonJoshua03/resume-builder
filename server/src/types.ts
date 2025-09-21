export interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    summary: string[];
  };
  experiences: Array<{
    title: string;
    company: string;
    period: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
}