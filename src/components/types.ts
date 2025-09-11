// src/components/types.ts
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

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  selectedTemplate: string;
  customColors: Record<string, any>;
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

export interface CustomField {
  id: number;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'date' | 'url';
}

// Update ResumeData interface
export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];  // Add this
  awards: Award[];      // Add this
  customFields: CustomField[];  // Add this
  skills: string[];
  selectedTemplate: string;
  customColors: Record<string, any>;
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
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export interface PersonalInfoProps {
  data: PersonalInfo;
  onChange: (field: string, value: string) => void;
}

export interface FileUploadProps {
  onUpload: (file: File) => void;
}

export interface ResumePreviewProps {
  data: ResumeData;
  template: Template;
  customColors: any;
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
  onChangeType: (id: number, type: string) => void;
}