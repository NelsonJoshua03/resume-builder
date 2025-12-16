// src/components/types.ts

// Personal Info Types
export interface PersonalInfoData {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string[];
  profilePicture?: string;
}

export interface TemplateConfig {
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
  formStyle: {
    sectionBg: string;
    headerColor: string;
    borderColor: string;
    accentColor: string;
  };
}

export interface TemplatesMap {
  [key: string]: TemplateConfig;
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string[];
  profilePicture?: string;
}

// Template Types
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
  formStyle?: {
    sectionBg: string;
    headerColor: string;
    borderColor: string;
    accentColor: string;
  };
}

// Form Component Base Props
export interface FormComponentProps {
  template?: Template;
}

// Data Structure Types
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
  description?: string;
}

export interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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

export interface ResumeData {
  personalInfo: PersonalInfoData;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  awards: Award[];
  customFields: CustomField[];
  skills: Skill[];
  selectedTemplate: string;
  customColors: {
    [templateId: string]: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
}

// Section Order Types
export interface SectionItem {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface SectionOrderCustomizerProps {
  sections: SectionItem[];
  onReorder: (sections: SectionItem[]) => void;
}

// Component Props Types

// Color Customizer
export interface ColorCustomizerProps {
  template: Template;
  colors: any;
  onUpdate: (colors: any) => void;
}

// Template Selector
export interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (template: string) => void;
  templates: Record<string, Template>;
}

// File Upload
export interface FileUploadProps {
  onUpload: (parsedData: ParsedResumeData) => void;
}

// Resume Preview
export interface ResumePreviewProps {
  data: ResumeData;
  template: Template;
  customColors: any;
  sectionOrder?: SectionItem[];
}

// Form Components with Template Support

// Personal Info
export interface PersonalInfoProps extends FormComponentProps {
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string | string[]) => void;
}

// Experience
export interface ExperienceProps extends FormComponentProps {
  experiences: Experience[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
}

// Education
export interface EducationProps extends FormComponentProps {
  education: Education[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
}

// Projects
export interface ProjectsProps extends FormComponentProps {
  projects: Project[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
}

// Awards
export interface AwardsProps extends FormComponentProps {
  awards: Award[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
}

// Skills
export interface SkillsProps extends FormComponentProps {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (index: number) => void;
  onUpdateProficiency: (index: number, proficiency: Skill['proficiency']) => void;
}

// Custom Fields
export interface CustomFieldsProps extends FormComponentProps {
  customFields: CustomField[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onChangeType: (id: number, type: CustomFieldType) => void;
}

// Parsed Resume Data
export interface ParsedResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
    profilePicture?: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

// Mobile PDF Generator Props
export interface MobilePDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: PersonalInfoData;
  resumeData: ResumeData;
  template: Template;
  sectionOrder?: SectionItem[];
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

// Social Sharing Props
export interface SocialSharingProps {
  resumeTitle: string;
}

// SEO Props
export interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
}

// Template Props
export interface ModernIconsTemplateProps {
  personalInfo: PersonalInfoData;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  customFields: CustomField[];
  customColors: any;
  sectionOrder?: SectionItem[];
}

export interface CreativePortfolioTemplateProps {
  personalInfo: PersonalInfoData;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  customFields: CustomField[];
  customColors: any;
  sectionOrder?: SectionItem[];
}

export interface ProfessionalExecutiveTemplateProps {
  personalInfo: PersonalInfoData;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  customFields: CustomField[];
  customColors: any;
  sectionOrder?: SectionItem[];
}

// Add this for the new templates page
export interface NewTemplatesPageProps {}

// Add for section ordering in premium templates
export interface TemplateWithSectionOrder {
  id: string;
  name: string;
  layout: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

// Google Analytics Hook Types
export interface GoogleAnalyticsHook {
  trackResumeDownload: (format: string, templateName: string) => void;
  trackButtonClick: (action: string, category: string, label: string) => void;
  trackTemplateChange: (templateName: string) => void;
  trackResumeGeneration: () => void;
}

// Resume Context Types
export interface ResumeContextType {
  resumeData: ResumeData;
  updatePersonalInfo: (field: keyof PersonalInfoData, value: string | string[]) => void;
  updateExperience: (id: number, field: string, value: any) => void;
  addExperience: () => number;
  removeExperience: (id: number) => void;
  updateEducation: (id: number, field: string, value: string) => void;
  addEducation: () => number;
  removeEducation: (id: number) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (index: number) => void;
  updateSkillProficiency: (index: number, proficiency: Skill['proficiency']) => void;
  updateProject: (id: number, field: string, value: any) => void;
  addProject: () => number;
  removeProject: (id: number) => void;
  updateAward: (id: number, field: string, value: string) => void;
  addAward: () => number;
  removeAward: (id: number) => void;
  updateCustomField: (id: number, field: string, value: string) => void;
  changeCustomFieldType: (id: number, type: 'text' | 'textarea' | 'date' | 'url') => void;
  addCustomField: () => number;
  removeCustomField: (id: number) => void;
  handleFileUpload: (parsedData: any) => void;
  sectionOrder: SectionItem[];
  handleSectionReorder: (reorderedSections: SectionItem[]) => void;
  // NEW: Template selection and color customization functions
  updateSelectedTemplate: (template: string) => void;
  updateCustomColors: (templateId: string, colors: any) => void;
}

// Color Types for Customization
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface CustomColors {
  [templateId: string]: ColorPalette;
}

// Template Layout Types
export type TemplateLayout = 
  | 'modern' 
  | 'creative' 
  | 'professional' 
  | 'executive' 
  | 'tech' 
  | 'ats' 
  | 'twoColumn';

// Resume Builder Page Props
export interface ResumeBuilderPageProps {
  // Props for the resume builder page if needed
}

// Premium Templates Page Props
export interface PremiumTemplatesPageProps {
  // Props for premium templates page
}

// Navigation Types
export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
}

// Form Field Types
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'date' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export/Import Types
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt';
  includeContact: boolean;
  includeSummary: boolean;
  includeExperience: boolean;
  includeEducation: boolean;
  includeSkills: boolean;
  includeProjects: boolean;
  includeAwards: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: ResumeData;
  errors?: string[];
  warnings?: string[];
}

// Analytics Event Types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

// User Preferences Types
export interface UserPreferences {
  autoSave: boolean;
  defaultTemplate: string;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: boolean;
  highContrast: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Drag and Drop Types
export interface DragItem {
  type: string;
  id: string;
  index: number;
}

// Responsive Breakpoints
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Session Types
export interface UserSession {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  expiresAt?: number;
}

// Payment Types
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

// Error Boundary Types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// File Types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

// Search and Filter Types
export interface FilterOptions {
  templates: string[];
  categories: string[];
  colors: string[];
  layouts: string[];
}

export interface SearchParams {
  query: string;
  filters: FilterOptions;
  sortBy: 'name' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

// Undo/Redo History Types
export interface HistoryState {
  past: ResumeData[];
  present: ResumeData;
  future: ResumeData[];
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  participants: string[];
  owner: string;
  createdAt: number;
  expiresAt: number;
}

// Template Category Types
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: string[];
}

// ATS Score Types
export interface ATSScore {
  overall: number;
  sections: {
    contact: number;
    experience: number;
    education: number;
    skills: number;
    keywords: number;
    format: number;
  };
  suggestions: string[];
}

// Resume Analysis Types
export interface ResumeAnalysis {
  score: ATSScore;
  readability: number;
  keywordDensity: number;
  sectionCompleteness: {
    [section: string]: number;
  };
  improvements: string[];
  warnings: string[];
}

export interface PersonalInfoProps extends FormComponentProps {
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string | string[]) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface ExperienceProps extends FormComponentProps {
  experiences: Experience[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface EducationProps extends FormComponentProps {
  education: Education[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface ProjectsProps extends FormComponentProps {
  projects: Project[];
  onUpdate: (id: number, field: string, value: any) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface AwardsProps extends FormComponentProps {
  awards: Award[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface SkillsProps extends FormComponentProps {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (index: number) => void;
  onUpdateProficiency: (index: number, proficiency: Skill['proficiency']) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}

export interface CustomFieldsProps extends FormComponentProps {
  customFields: CustomField[];
  onUpdate: (id: number, field: string, value: string) => void;
  onAdd: () => number;
  onRemove: (id: number) => void;
  onChangeType: (id: number, type: CustomFieldType) => void;
  onFieldInteraction?: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
}