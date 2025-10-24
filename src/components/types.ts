// src/components/types.ts
export interface PersonalInfoData {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string[];
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string[];
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Template {
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
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description: string[];
  technologies: string[];
  period: string;
  link?: string;
}

export interface Award {
  id: number;
  title: string;
  issuer: string;
  year: string;
  description: string;
}

export type CustomFieldType = 'text' | 'textarea' | 'date' | 'url';

export interface CustomField {
  id: number;
  label: string;
  value: string;
  type: CustomFieldType;
}

// Update ResumeData interface
export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  awards: Award[];
  customFields: CustomField[];
  skills: Skill[];
  selectedTemplate: string;
  customColors: Record<string, any>;
}

export interface SectionOrderCustomizerProps {
  sections: SectionItem[];
  onReorder: (sections: SectionItem[]) => void;
}

export interface SectionItem {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface ParsedResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
  };
  experiences: Array<{
    id: number;
    title: string;
    company: string;
    period: string;
    description: string[];
  }>;
  education: Array<{
    id: number;
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: Array<{
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  projects: Array<{
    id: number;
    name: string;
    description: string[];
    technologies: string[];
    period: string;
    link?: string;
  }>;
}

export interface ColorCustomizerProps {
  template: Template;
  colors: any;
  onUpdate: (colors: any) => void;
}

export interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (template: string) => void;
  templates: Record<string, Template>;
}

export interface ExperienceProps {
  experiences: Experience[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export interface EducationProps {
  education: Education[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export interface SkillsProps {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (index: number) => void;
  onUpdateProficiency: (index: number, proficiency: Skill['proficiency']) => void;
}

export interface PersonalInfoProps {
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string | string[]) => void;
}

export interface ResumePreviewProps {
  data: ResumeData;
  template: Template;
  customColors: any;
  sectionOrder?: SectionItem[];
}

export interface ProjectsProps {
  projects: Project[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export interface AwardsProps {
  awards: Award[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export interface CustomFieldsProps {
  customFields: CustomField[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChangeType: (id: number, type: CustomFieldType) => void;
}

export interface FileUploadProps {
  onUpload: (data: ParsedResumeData) => void;
}

// MobilePDFGenerator props
export interface MobilePDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: PersonalInfo;
}

// SEO props
export interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
}

// Resume Parser types
export interface ResumeParserInterface {
  parse(): ParsedResumeData;
}

// Color customization types
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Template layout types
export type TemplateLayout = 'creative' | 'minimalist' | 'modern';

// Skill proficiency types
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// File upload status
export interface FileUploadStatus {
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Form field types
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'url' | 'date';
  required: boolean;
  placeholder?: string;
  validation?: (value: string) => ValidationResult;
}

// Section configuration
export interface SectionConfig {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  enabled: boolean;
  order: number;
}

// Resume template configuration
export interface TemplateConfig {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: string;
  colors: ColorScheme;
  layout: TemplateLayout;
  features: string[];
}

// Export data for download/import
export interface ExportData {
  version: string;
  timestamp: string;
  resumeData: ResumeData;
  template: Template;
  sectionOrder: SectionItem[];
}

// PDF generation options
export interface PDFOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  quality: number;
}

// Analytics events
export interface AnalyticsEvent {
  event: string;
  category: string;
  label: string;
  value?: number;
  metadata?: Record<string, any>;
}

// User preferences
export interface UserPreferences {
  autoSave: boolean;
  spellCheck: boolean;
  wordCount: boolean;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// Resume statistics
export interface ResumeStats {
  wordCount: number;
  sectionCount: number;
  experienceCount: number;
  skillCount: number;
  lastUpdated: string;
  completeness: number;
}

// ATS (Applicant Tracking System) feedback
export interface ATSFeedback {
  score: number;
  suggestions: string[];
  keywords: string[];
  missingSections: string[];
  optimizationTips: string[];
}

// Job matching criteria
export interface JobMatchCriteria {
  title: string;
  skills: string[];
  experience: number;
  education: string[];
  location: string;
  industry: string;
}

// Import/export formats
export type ExportFormat = 'pdf' | 'docx' | 'json' | 'txt';
export type ImportFormat = 'pdf' | 'docx' | 'json' | 'txt' | 'image';

// Resume sharing options
export interface SharingOptions {
  public: boolean;
  allowDownload: boolean;
  expiration: string | null;
  password: string | null;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Undo/redo history
export interface HistoryState {
  past: ResumeData[];
  present: ResumeData;
  future: ResumeData[];
}

// Drag and drop types
export interface DragItem {
  type: string;
  id: string;
  index: number;
}

// Search and filter types
export interface FilterOptions {
  section: string;
  query: string;
  dateRange: {
    from: string;
    to: string;
  };
  tags: string[];
}

// Bulk operations
export interface BulkOperation {
  type: 'delete' | 'duplicate' | 'move' | 'update';
  items: string[];
  data?: any;
}

// Template customization
export interface TemplateCustomization {
  colors: ColorScheme;
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    section: number;
    item: number;
  };
  borders: {
    enabled: boolean;
    radius: number;
  };
}

// Resume analysis results
export interface ResumeAnalysis {
  readability: number;
  atsCompatibility: number;
  keywordDensity: Record<string, number>;
  sectionCompleteness: Record<string, number>;
  recommendations: string[];
}

// Education level types
export type EducationLevel = 
  | 'high_school' 
  | 'associate' 
  | 'bachelor' 
  | 'master' 
  | 'phd' 
  | 'certificate' 
  | 'diploma';

// Experience level types
export type ExperienceLevel = 
  | 'internship' 
  | 'entry' 
  | 'mid' 
  | 'senior' 
  | 'lead' 
  | 'executive';

// Industry types
export type Industry = 
  | 'technology' 
  | 'healthcare' 
  | 'finance' 
  | 'education' 
  | 'manufacturing' 
  | 'retail' 
  | 'other';

// Job type
export type JobType = 
  | 'full_time' 
  | 'part_time' 
  | 'contract' 
  | 'freelance' 
  | 'internship' 
  | 'temporary';

// Language proficiency
export type LanguageProficiency = 
  | 'native' 
  | 'fluent' 
  | 'professional' 
  | 'limited' 
  | 'basic';

// Reference types
export interface Reference {
  id: number;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

// Certification types
export interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  expiration?: string;
  credentialId?: string;
  url?: string;
}

// Publication types
export interface Publication {
  id: number;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description: string;
}

// Volunteer experience
export interface VolunteerExperience {
  id: number;
  organization: string;
  role: string;
  period: string;
  description: string[];
  cause: string;
}

// Language skills
export interface LanguageSkill {
  id: number;
  language: string;
  proficiency: LanguageProficiency;
}

// Social media links
export interface SocialMedia {
  id: number;
  platform: string;
  url: string;
  username: string;
}

// Contact information extension
export interface ContactInfo extends PersonalInfo {
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  socialMedia: SocialMedia[];
}

// Resume metadata
export interface ResumeMetadata {
  id: string;
  title: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  tags: string[];
  jobTarget: string;
  notes: string;
}

// Complete resume with metadata
export interface CompleteResume {
  metadata: ResumeMetadata;
  data: ResumeData;
  analysis: ResumeAnalysis;
  stats: ResumeStats;
}

export interface FileUploadProps {
  onUpload: (data: ParsedResumeData) => void;
}