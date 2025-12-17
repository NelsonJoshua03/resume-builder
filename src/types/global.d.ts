// src/types/global.d.ts - UPDATED
export {};

declare global {
  // Google Analytics
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    pageLoadStart?: number;
    
    // Firebase initialization flag
    firebaseInitialized?: boolean;
    
    // Environment variables
    _env_?: Record<string, string>;
  }

  // Environment variables (for TypeScript)
  const __APP_ENV__: string;
  const __APP_VERSION__: string;
  const __BUILD_TIME__: string;
  
  // Resume data types
  interface ResumeExperience {
    title: string;
    company: string;
    period: string;
    description: string[];
  }

  interface ResumeEducation {
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }

  interface ResumeSkill {
    name: string;
    category?: string;
    proficiency?: number;
  }

  interface ResumeProject {
    name: string;
    period: string;
    description: string[];
    technologies?: string[];
  }

  interface ResumeAward {
    title: string;
    issuer: string;
    year: string;
    description?: string;
  }

  interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
    profilePicture?: string;
  }

  // Template types
  interface TemplateColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }

  interface TemplateStyle {
    sectionBg: string;
    headerColor: string;
    borderColor: string;
    accentColor: string;
  }

  interface Template {
    id: string;
    name: string;
    background: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    buttonColor: string;
    headerBg: string;
    headerText: string;
    sectionBg: string;
    description: string;
    layout: string;
    colors: TemplateColors;
    formStyle?: TemplateStyle;
  }

  type TemplatesMap = Record<string, Template>;
}