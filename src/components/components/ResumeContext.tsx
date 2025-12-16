// ResumeContext.tsx - UPDATED WITH FIREBASE ANALYTICS
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import type { ResumeData, PersonalInfoData, Skill, SectionItem, Experience, Education, Project, Award, CustomField } from './types';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

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

  const { trackFirebaseEvent, trackButtonClick, trackUserFlow } = useFirebaseAnalytics();

  // Track resume updates
  const trackResumeUpdate = useCallback((action: string, section: string, details?: any) => {
    const resumeId = localStorage.getItem('current_resume_id') || 'unknown';
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    
    trackFirebaseEvent(
      `resume_${action}`,
      'Resume Editing',
      section,
      {
        resume_id: resumeId,
        user_id: userId,
        section: section,
        ...details,
        timestamp: new Date().toISOString()
      }
    );
    
    // Also track as user flow
    trackUserFlow('resume_editing', action, section);
  }, [trackFirebaseEvent, trackUserFlow]);

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
    
    // Track resume save
    trackFirebaseEvent(
      'resume_auto_saved',
      'Resume Editing',
      'auto_save',
      {
        resume_id: localStorage.getItem('current_resume_id') || 'unknown',
        completion_percentage: getResumeCompletion(),
        sections_count: {
          experiences: resumeData.experiences.length,
          education: resumeData.education.length,
          skills: resumeData.skills.length,
          projects: resumeData.projects.length
        }
      }
    );
  }, [resumeData, trackFirebaseEvent, getResumeCompletion]);

  // Track initial resume load
  React.useEffect(() => {
    const resumeId = localStorage.getItem('current_resume_id') || 'unknown';
    trackFirebaseEvent(
      'resume_loaded',
      'Resume Context',
      'resume_data_loaded',
      {
        resume_id: resumeId,
        completion_percentage: getResumeCompletion(),
        template: resumeData.selectedTemplate,
        source: 'resume_context_initial_load'
      }
    );
  }, []);

  const updateSelectedTemplate = (template: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
    
    trackResumeUpdate('template_changed', 'template', {
      from_template: resumeData.selectedTemplate,
      to_template: template,
      previous_template: resumeData.selectedTemplate,
      template_name: template
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
      action: 'color_customization'
    });
  };

  const updatePersonalInfo = (field: keyof PersonalInfoData, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { 
        ...prev.personalInfo, 
        [field]: value 
      }
    }));
    
    trackResumeUpdate('personal_info_updated', 'personal_info', {
      field: field,
      value_length: typeof value === 'string' ? value.length : value.join('').length,
      is_array: Array.isArray(value),
      completion_percentage: getResumeCompletion()
    });
  };

  const updateExperience = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
    
    trackResumeUpdate('experience_updated', 'experience', {
      experience_id: id,
      field: field,
      value_length: typeof value === 'string' ? value.length : JSON.stringify(value).length,
      total_experiences: resumeData.experiences.length,
      completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
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
      total_experiences: resumeData.experiences.length - 1,
      action: 'remove_experience',
      completion_percentage: getResumeCompletion()
    });
  };

  const updateEducation = (id: number, field: string, value: string) => {
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
      completion_percentage: getResumeCompletion()
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
        completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
    });
  };

  const updateSkillProficiency = (index: number, proficiency: Skill['proficiency']) => {
    const skill = resumeData.skills[index];
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => 
        i === index ? { ...s, proficiency } : s
      )
    }));
    
    trackResumeUpdate('skill_proficiency_updated', 'skills', {
      skill_name: skill?.name || 'unknown',
      old_proficiency: skill?.proficiency || 'unknown',
      new_proficiency: proficiency,
      completion_percentage: getResumeCompletion()
    });
  };

  const updateProject = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
    
    trackResumeUpdate('project_updated', 'projects', {
      project_id: id,
      field: field,
      value_length: typeof value === 'string' ? value.length : JSON.stringify(value).length,
      total_projects: resumeData.projects.length,
      completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
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
      total_custom_fields: resumeData.customFields.length,
      completion_percentage: getResumeCompletion()
    });
  };

  const changeCustomFieldType = (id: number, type: 'text' | 'textarea' | 'date' | 'url') => {
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, type } : cf
      )
    }));
    
    trackResumeUpdate('custom_field_type_changed', 'custom_fields', {
      custom_field_id: id,
      new_type: type,
      total_custom_fields: resumeData.customFields.length,
      completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
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
      completion_percentage: getResumeCompletion()
    });
    
    trackButtonClick('upload_resume_file', 'resume_import', '/edit');
  };

  const handleSectionReorder = (reorderedSections: SectionItem[]) => {
    setSectionOrder(reorderedSections);
    
    trackResumeUpdate('sections_reordered', 'layout', {
      sections_count: reorderedSections.length,
      enabled_sections: reorderedSections.filter(s => s.enabled).length,
      order_changed: true,
      completion_percentage: getResumeCompletion()
    });
    
    trackButtonClick('reorder_sections', 'resume_customization', '/edit');
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