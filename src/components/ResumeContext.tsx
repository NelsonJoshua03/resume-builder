// ResumeContext.tsx - FIXED VERSION WITH ALL TYPE ERRORS RESOLVED
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import type { ResumeData, PersonalInfoData, Skill, SectionItem, Experience, Education, Project, Award, CustomField } from './types';

interface ResumeContextType {
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
  updateSelectedTemplate: (template: string) => void;
  updateCustomColors: (templateId: string, colors: any) => void;
  // Add tracking methods
  trackResumeUpdate: (action: string, section: string, details?: any) => void;
  getResumeCompletion: () => number;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const initialResumeData: ResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Software Developer',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    summary: [
      'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
      'Passionate about building scalable web applications with clean architecture.',
      'Strong problem-solving skills and experience in agile development environments.'
    ],
    profilePicture: ''
  },
  experiences: [
    {
      id: 1,
      title: 'Senior Developer',
      company: 'Tech Solutions Inc.',
      period: '2020 - Present',
      description: [
        'Led frontend development team and implemented new features',
        'Mentored junior developers and conducted code reviews',
        'Optimized application performance reducing load time by 40%'
      ]
    },
    {
      id: 2,
      title: 'Junior Developer',
      company: 'StartUp Co.',
      period: '2018 - 2020',
      description: [
        'Developed and maintained web applications using React',
        'Collaborated with design team to implement responsive UI',
        'Participated in agile development processes'
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: 'Bachelor of Computer Science',
      institution: 'University of Technology',
      year: '2018',
      gpa: '3.8/4.0'
    }
  ],
  projects: [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: [
        'Developed a full-stack e-commerce solution with React and Node.js',
        'Implemented payment processing with Stripe API',
        'Designed responsive UI with Tailwind CSS'
      ],
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      period: '2022',
      link: 'https://example.com/ecommerce'
    }
  ],
  awards: [
    {
      id: 1,
      title: 'Best Hackathon Project',
      issuer: 'Tech Conference 2021',
      year: '2021',
      description: 'Awarded for innovative use of AI in healthcare application'
    }
  ],
  customFields: [
    {
      id: 1,
      label: 'Languages',
      value: 'English (Native), Spanish (Intermediate)',
      type: 'text'
    }
  ],
  skills: [
    { name: 'React', proficiency: 'Advanced' },
    { name: 'Node.js', proficiency: 'Intermediate' },
    { name: 'JavaScript', proficiency: 'Advanced' },
    { name: 'HTML/CSS', proficiency: 'Expert' },
    { name: 'MongoDB', proficiency: 'Intermediate' },
    { name: 'AWS', proficiency: 'Beginner' }
  ],
  selectedTemplate: 'creative',
  customColors: {}
};

export const ResumeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : initialResumeData;
  });

  const [sectionOrder, setSectionOrder] = useState<SectionItem[]>([
    { id: 'summary', label: 'Professional Summary', enabled: true, order: 0 },
    { id: 'experience', label: 'Work Experience', enabled: true, order: 1 },
    { id: 'education', label: 'Education', enabled: true, order: 2 },
    { id: 'projects', label: 'Projects', enabled: true, order: 3 },
    { id: 'skills', label: 'Skills', enabled: true, order: 4 },
    { id: 'awards', label: 'Awards', enabled: true, order: 5 },
    { id: 'custom', label: 'Additional Sections', enabled: true, order: 6 }
  ]);

  // Helper function to safely get string length
  const getStringLength = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') return value.length;
    if (Array.isArray(value)) {
      // For arrays, join them and get length
      return value.filter(item => item != null).join('').length;
    }
    if (typeof value === 'number') return value.toString().length;
    if (typeof value === 'object') return JSON.stringify(value).length;
    return 0;
  };

  // Helper function to safely get previous value as string
  const getPreviousValueAsString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return value.filter(item => item != null).join('');
    return JSON.stringify(value);
  };

  // Track resume updates
  const trackResumeUpdate = useCallback((action: string, section: string, details?: any) => {
    const resumeId = localStorage.getItem('current_resume_id') || 'unknown';
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    const sessionId = localStorage.getItem('firebase_session_id') || 'anonymous';
    
    // Store event locally for Firebase sync
    const eventData = {
      eventName: `resume_${action}`,
      eventCategory: 'Resume Editing',
      eventLabel: section,
      userId: userId,
      sessionId: sessionId,
      resumeId: resumeId,
      section: section,
      details: details || {},
      timestamp: new Date().toISOString(),
      pagePath: window.location.pathname,
      pageTitle: document.title,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      consentGiven: localStorage.getItem('gdpr_consent') === 'accepted',
      dataProcessingLocation: 'IN' as const
    };
    
    console.log(`📝 Resume update: ${action} in ${section}`, details);
    
    // Queue for Firebase sync
    try {
      const queue = JSON.parse(localStorage.getItem('firebase_event_queue') || '[]');
      queue.push({
        ...eventData,
        type: 'resume_update',
        action: action,
        _trackedAt: Date.now()
      });
      localStorage.setItem('firebase_event_queue', JSON.stringify(queue.slice(-100)));
    } catch (error) {
      console.error('Failed to queue event:', error);
    }
    
    // Also track user flow
    const userFlowEvent = {
      eventName: 'user_flow',
      eventCategory: 'User Navigation',
      eventLabel: 'resume_editing',
      metadata: {
        from: 'resume_editing',
        to: action,
        action: section,
        resumeId: resumeId,
        userId: userId
      },
      timestamp: new Date().toISOString()
    };
    
    try {
      const flowQueue = JSON.parse(localStorage.getItem('user_flow_queue') || '[]');
      flowQueue.push(userFlowEvent);
      localStorage.setItem('user_flow_queue', JSON.stringify(flowQueue.slice(-50)));
    } catch (error) {
      console.error('Failed to queue user flow event:', error);
    }
  }, []);

  // Calculate resume completion percentage
  const getResumeCompletion = useCallback((): number => {
    let completedFields = 0;
    let totalFields = 0;

    // Personal Info (5 key fields)
    const personalFields = ['name', 'title', 'email', 'phone', 'summary'] as const;
    totalFields += personalFields.length;
    completedFields += personalFields.filter(field => {
      const value = resumeData.personalInfo[field];
      if (Array.isArray(value)) {
        return value.length > 0 && value[0] !== '';
      }
      return value && value.toString().trim() !== '';
    }).length;

    // Experience (at least one entry with title and company)
    if (resumeData.experiences.length > 0) {
      completedFields += 2;
      totalFields += 2;
    } else {
      totalFields += 2;
    }

    // Education (at least one entry)
    if (resumeData.education.length > 0) {
      completedFields += 2;
      totalFields += 2;
    } else {
      totalFields += 2;
    }

    // Skills (at least 3 skills)
    if (resumeData.skills.length >= 3) {
      completedFields += 1;
      totalFields += 1;
    } else {
      totalFields += 1;
    }

    // Projects (at least one)
    if (resumeData.projects.length > 0) {
      completedFields += 1;
      totalFields += 1;
    } else {
      totalFields += 1;
    }

    return Math.round((completedFields / totalFields) * 100);
  }, [resumeData]);

  // Save to localStorage whenever resumeData changes
  React.useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    
    // Track resume save locally (will sync to Firebase later)
    const resumeId = localStorage.getItem('current_resume_id') || 'unknown';
    const completion = getResumeCompletion();
    
    const autoSaveEvent = {
      type: 'resume_auto_saved',
      eventName: 'resume_auto_saved',
      eventCategory: 'Resume Editing',
      eventLabel: 'auto_save',
      resumeId: resumeId,
      completion_percentage: completion,
      sections_count: {
        experiences: resumeData.experiences.length,
        education: resumeData.education.length,
        skills: resumeData.skills.length,
        projects: resumeData.projects.length
      },
      timestamp: new Date().toISOString(),
      pagePath: window.location.pathname,
      pageTitle: document.title
    };
    
    console.log('💾 Resume auto-saved', { completion: `${completion}%` });
    
    // Queue for Firebase sync
    try {
      const autoSaveQueue = JSON.parse(localStorage.getItem('auto_save_queue') || '[]');
      autoSaveQueue.push(autoSaveEvent);
      localStorage.setItem('auto_save_queue', JSON.stringify(autoSaveQueue.slice(-20)));
    } catch (error) {
      console.error('Failed to queue auto-save event:', error);
    }
  }, [resumeData, getResumeCompletion]);

  // Track initial resume load
  React.useEffect(() => {
    const resumeId = localStorage.getItem('current_resume_id') || 'unknown';
    const completion = getResumeCompletion();
    
    const loadEvent = {
      type: 'resume_loaded',
      eventName: 'resume_loaded',
      eventCategory: 'Resume Context',
      eventLabel: 'resume_data_loaded',
      resumeId: resumeId,
      completion_percentage: completion,
      template: resumeData.selectedTemplate,
      source: 'resume_context_initial_load',
      timestamp: new Date().toISOString(),
      pagePath: window.location.pathname,
      pageTitle: document.title,
      isFirstLoad: !localStorage.getItem('resume_loaded_before')
    };
    
    console.log('📄 Resume loaded from context', { 
      resumeId: resumeId.substring(0, 10),
      template: resumeData.selectedTemplate,
      completion: `${completion}%` 
    });
    
    // Queue for Firebase sync
    try {
      const loadQueue = JSON.parse(localStorage.getItem('load_event_queue') || '[]');
      loadQueue.push(loadEvent);
      localStorage.setItem('load_event_queue', JSON.stringify(loadQueue.slice(-10)));
    } catch (error) {
      console.error('Failed to queue load event:', error);
    }
    
    localStorage.setItem('resume_loaded_before', 'true');
  }, []);

  const updateSelectedTemplate = (template: string) => {
    const previousTemplate = resumeData.selectedTemplate;
    
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
    
    trackResumeUpdate('template_changed', 'template', {
      from_template: previousTemplate,
      to_template: template,
      previous_template: previousTemplate,
      template_name: template,
      change_type: 'manual_selection'
    });
  };

  const updateCustomColors = (templateId: string, colors: any) => {
    setResumeData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [templateId]: colors
      }
    }));
    
    trackResumeUpdate('colors_updated', 'customization', {
      template_id: templateId,
      colors: Object.keys(colors),
      color_values: colors,
      action: 'color_customization',
      is_custom: true
    });
  };

  const updatePersonalInfo = (field: keyof PersonalInfoData, value: string | string[]) => {
    const previousValue = resumeData.personalInfo[field];
    const previousValueLength = getStringLength(previousValue);
    
    setResumeData(prev => ({
      ...prev,
      personalInfo: { 
        ...prev.personalInfo, 
        [field]: value 
      }
    }));
    
    trackResumeUpdate('personal_info_updated', 'personal_info', {
      field: field,
      value_length: getStringLength(value),
      previous_value_length: previousValueLength,
      is_array: Array.isArray(value),
      completion_percentage: getResumeCompletion(),
      field_type: field === 'summary' ? 'array' : 'string'
    });
  };

  const updateExperience = (id: number, field: string, value: any) => {
    const experience = resumeData.experiences.find(exp => exp.id === id);
    const previousValue = experience ? (experience as any)[field] : null;
    
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
    
    trackResumeUpdate('experience_updated', 'experience', {
      experience_id: id,
      field: field,
      value_length: getStringLength(value),
      previous_value_length: getStringLength(previousValue),
      total_experiences: resumeData.experiences.length,
      completion_percentage: getResumeCompletion(),
      is_description: field === 'description'
    });
  };

  const addExperience = () => {
    const newId = Date.now();
    setResumeData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: newId,
          title: '',
          company: '',
          period: '',
          description: ['']
        }
      ]
    }));
    
    trackResumeUpdate('experience_added', 'experience', {
      experience_id: newId,
      total_experiences: resumeData.experiences.length + 1,
      action: 'add_new_experience',
      completion_percentage: getResumeCompletion(),
      position: resumeData.experiences.length + 1
    });
    
    return newId;
  };

  const removeExperience = (id: number) => {
    const removedExp = resumeData.experiences.find(exp => exp.id === id);
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
    
    trackResumeUpdate('experience_removed', 'experience', {
      experience_id: id,
      experience_title: removedExp?.title || 'unknown',
      experience_company: removedExp?.company || 'unknown',
      total_experiences: resumeData.experiences.length - 1,
      action: 'remove_experience',
      completion_percentage: getResumeCompletion()
    });
  };

  const updateEducation = (id: number, field: string, value: string) => {
    const education = resumeData.education.find(edu => edu.id === id);
    const previousValue = education ? (education as any)[field] : '';
    
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
    
    trackResumeUpdate('education_updated', 'education', {
      education_id: id,
      field: field,
      value_length: value.length,
      previous_value_length: getPreviousValueAsString(previousValue).length,
      total_education: resumeData.education.length,
      completion_percentage: getResumeCompletion()
    });
  };

  const addEducation = () => {
    const newId = Date.now();
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          degree: '',
          institution: '',
          year: '',
          gpa: ''
        }
      ]
    }));
    
    trackResumeUpdate('education_added', 'education', {
      education_id: newId,
      total_education: resumeData.education.length + 1,
      action: 'add_new_education',
      completion_percentage: getResumeCompletion(),
      position: resumeData.education.length + 1
    });
    
    return newId;
  };

  const removeEducation = (id: number) => {
    const removedEdu = resumeData.education.find(edu => edu.id === id);
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    
    trackResumeUpdate('education_removed', 'education', {
      education_id: id,
      education_degree: removedEdu?.degree || 'unknown',
      education_institution: removedEdu?.institution || 'unknown',
      total_education: resumeData.education.length - 1,
      action: 'remove_education',
      completion_percentage: getResumeCompletion()
    });
  };

  const addSkill = (skill: Skill) => {
    if (skill.name && !resumeData.skills.some(s => s.name === skill.name)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      
      trackResumeUpdate('skill_added', 'skills', {
        skill_name: skill.name,
        skill_proficiency: skill.proficiency,
        total_skills: resumeData.skills.length + 1,
        completion_percentage: getResumeCompletion(),
        skill_category: getSkillCategory(skill.name)
      });
    }
  };

  const removeSkill = (index: number) => {
    const removedSkill = resumeData.skills[index];
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    
    trackResumeUpdate('skill_removed', 'skills', {
      skill_name: removedSkill?.name || 'unknown',
      skill_proficiency: removedSkill?.proficiency || 'unknown',
      total_skills: resumeData.skills.length - 1,
      completion_percentage: getResumeCompletion(),
      skill_index: index
    });
  };

  const updateSkillProficiency = (index: number, proficiency: Skill['proficiency']) => {
    const skill = resumeData.skills[index];
    const oldProficiency = skill?.proficiency;
    
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => 
        i === index ? { ...s, proficiency } : s
      )
    }));
    
    trackResumeUpdate('skill_proficiency_updated', 'skills', {
      skill_name: skill?.name || 'unknown',
      old_proficiency: oldProficiency || 'unknown',
      new_proficiency: proficiency,
      completion_percentage: getResumeCompletion(),
      proficiency_change: `${oldProficiency} → ${proficiency}`
    });
  };

  const updateProject = (id: number, field: string, value: any) => {
    const project = resumeData.projects.find(proj => proj.id === id);
    const previousValue = project ? (project as any)[field] : null;
    
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
    
    trackResumeUpdate('project_updated', 'projects', {
      project_id: id,
      field: field,
      value_length: getStringLength(value),
      previous_value_length: getStringLength(previousValue),
      total_projects: resumeData.projects.length,
      completion_percentage: getResumeCompletion(),
      is_technologies: field === 'technologies'
    });
  };

  const addProject = () => {
    const newId = Date.now();
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: newId,
          name: '',
          description: [''],
          technologies: [],
          period: '',
          link: ''
        }
      ]
    }));
    
    trackResumeUpdate('project_added', 'projects', {
      project_id: newId,
      total_projects: resumeData.projects.length + 1,
      action: 'add_new_project',
      completion_percentage: getResumeCompletion(),
      position: resumeData.projects.length + 1
    });
    
    return newId;
  };

  const removeProject = (id: number) => {
    const removedProj = resumeData.projects.find(proj => proj.id === id);
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
    
    trackResumeUpdate('project_removed', 'projects', {
      project_id: id,
      project_name: removedProj?.name || 'unknown',
      total_projects: resumeData.projects.length - 1,
      action: 'remove_project',
      completion_percentage: getResumeCompletion()
    });
  };

  const updateAward = (id: number, field: string, value: string) => {
    const award = resumeData.awards.find(award => award.id === id);
    const previousValue = award ? (award as any)[field] : '';
    
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.map(award => 
        award.id === id ? { ...award, [field]: value } : award
      )
    }));
    
    trackResumeUpdate('award_updated', 'awards', {
      award_id: id,
      field: field,
      value_length: value.length,
      previous_value_length: getPreviousValueAsString(previousValue).length,
      total_awards: resumeData.awards.length,
      completion_percentage: getResumeCompletion()
    });
  };

  const addAward = () => {
    const newId = Date.now();
    setResumeData(prev => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: newId,
          title: '',
          issuer: '',
          year: '',
          description: ''
        }
      ]
    }));
    
    trackResumeUpdate('award_added', 'awards', {
      award_id: newId,
      total_awards: resumeData.awards.length + 1,
      action: 'add_new_award',
      completion_percentage: getResumeCompletion(),
      position: resumeData.awards.length + 1
    });
    
    return newId;
  };

  const removeAward = (id: number) => {
    const removedAward = resumeData.awards.find(award => award.id === id);
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.filter(award => award.id !== id)
    }));
    
    trackResumeUpdate('award_removed', 'awards', {
      award_id: id,
      award_title: removedAward?.title || 'unknown',
      total_awards: resumeData.awards.length - 1,
      action: 'remove_award',
      completion_percentage: getResumeCompletion()
    });
  };

  const updateCustomField = (id: number, field: string, value: string) => {
    const customField = resumeData.customFields.find(cf => cf.id === id);
    const previousValue = customField ? (customField as any)[field] : '';
    
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    }));
    
    trackResumeUpdate('custom_field_updated', 'custom_fields', {
      custom_field_id: id,
      field: field,
      value_length: value.length,
      previous_value_length: getPreviousValueAsString(previousValue).length,
      total_custom_fields: resumeData.customFields.length,
      completion_percentage: getResumeCompletion()
    });
  };

  const changeCustomFieldType = (id: number, type: 'text' | 'textarea' | 'date' | 'url') => {
    const customField = resumeData.customFields.find(cf => cf.id === id);
    const previousType = customField?.type || 'text';
    
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, type } : cf
      )
    }));
    
    trackResumeUpdate('custom_field_type_changed', 'custom_fields', {
      custom_field_id: id,
      old_type: previousType,
      new_type: type,
      total_custom_fields: resumeData.customFields.length,
      completion_percentage: getResumeCompletion(),
      type_change: `${previousType} → ${type}`
    });
  };

  const addCustomField = () => {
    const newId = Date.now();
    setResumeData(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          id: newId,
          label: 'New Section',
          value: '',
          type: 'text'
        }
      ]
    }));
    
    trackResumeUpdate('custom_field_added', 'custom_fields', {
      custom_field_id: newId,
      total_custom_fields: resumeData.customFields.length + 1,
      action: 'add_new_custom_field',
      completion_percentage: getResumeCompletion(),
      position: resumeData.customFields.length + 1
    });
    
    return newId;
  };

  const removeCustomField = (id: number) => {
    const removedField = resumeData.customFields.find(cf => cf.id === id);
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(cf => cf.id !== id)
    }));
    
    trackResumeUpdate('custom_field_removed', 'custom_fields', {
      custom_field_id: id,
      custom_field_label: removedField?.label || 'unknown',
      total_custom_fields: resumeData.customFields.length - 1,
      action: 'remove_custom_field',
      completion_percentage: getResumeCompletion()
    });
  };

  const handleFileUpload = (parsedData: any) => {
    console.log('File uploaded:', parsedData);
    
    trackResumeUpdate('file_uploaded', 'import', {
      file_type: parsedData.type || 'unknown',
      data_points: Object.keys(parsedData).length,
      action: 'import_resume_data',
      completion_percentage: getResumeCompletion(),
      has_personal_info: !!parsedData.personalInfo,
      has_experience: !!parsedData.experiences && parsedData.experiences.length > 0,
      has_education: !!parsedData.education && parsedData.education.length > 0,
      has_skills: !!parsedData.skills && parsedData.skills.length > 0
    });
    
    // Track button click locally
    const buttonClickEvent = {
      type: 'button_click',
      eventName: 'button_click',
      eventCategory: 'User Interaction',
      eventLabel: 'upload_resume_file',
      button_name: 'upload_resume_file',
      section: 'resume_import',
      page: '/edit',
      timestamp: new Date().toISOString()
    };
    
    try {
      const buttonQueue = JSON.parse(localStorage.getItem('button_click_queue') || '[]');
      buttonQueue.push(buttonClickEvent);
      localStorage.setItem('button_click_queue', JSON.stringify(buttonQueue.slice(-50)));
    } catch (error) {
      console.error('Failed to queue button click event:', error);
    }
  };

  const handleSectionReorder = (reorderedSections: SectionItem[]) => {
    setSectionOrder(reorderedSections);
    
    trackResumeUpdate('sections_reordered', 'layout', {
      sections_count: reorderedSections.length,
      enabled_sections: reorderedSections.filter(s => s.enabled).length,
      order_changed: true,
      completion_percentage: getResumeCompletion(),
      new_order: reorderedSections.map(s => ({ id: s.id, order: s.order }))
    });
    
    // Track button click locally
    const buttonClickEvent = {
      type: 'button_click',
      eventName: 'button_click',
      eventCategory: 'User Interaction',
      eventLabel: 'reorder_sections',
      button_name: 'reorder_sections',
      section: 'resume_customization',
      page: '/edit',
      timestamp: new Date().toISOString()
    };
    
    try {
      const buttonQueue = JSON.parse(localStorage.getItem('button_click_queue') || '[]');
      buttonQueue.push(buttonClickEvent);
      localStorage.setItem('button_click_queue', JSON.stringify(buttonQueue.slice(-50)));
    } catch (error) {
      console.error('Failed to queue button click event:', error);
    }
  };

  const value = {
    resumeData,
    updatePersonalInfo,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    addSkill,
    removeSkill,
    updateSkillProficiency,
    updateProject,
    addProject,
    removeProject,
    updateAward,
    addAward,
    removeAward,
    updateCustomField,
    changeCustomFieldType,
    addCustomField,
    removeCustomField,
    handleFileUpload,
    sectionOrder,
    handleSectionReorder,
    updateSelectedTemplate,
    updateCustomColors,
    // Add tracking methods
    trackResumeUpdate,
    getResumeCompletion
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

// Helper function to categorize skills
const getSkillCategory = (skillName: string): string => {
  const techKeywords = ['javascript', 'react', 'node', 'python', 'java', 'c++', 'html', 'css', 'sql', 'mongodb'];
  const softKeywords = ['communication', 'leadership', 'teamwork', 'problem', 'critical', 'adapt'];
  const toolKeywords = ['git', 'docker', 'aws', 'azure', 'jenkins', 'jira'];
  
  const lowerName = skillName.toLowerCase();
  
  if (techKeywords.some(keyword => lowerName.includes(keyword))) return 'technical';
  if (softKeywords.some(keyword => lowerName.includes(keyword))) return 'soft';
  if (toolKeywords.some(keyword => lowerName.includes(keyword))) return 'tools';
  
  return 'other';
};