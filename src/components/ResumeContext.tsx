import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ResumeData, PersonalInfoData, Skill, SectionItem, Experience, Education, Project, Award, CustomField } from './types';

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
  // NEW: Add template selection function
  updateSelectedTemplate: (template: string) => void;
  // NEW: Add color customization function
  updateCustomColors: (templateId: string, colors: any) => void;
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

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  // Save to localStorage whenever resumeData changes
  React.useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // NEW: Function to update selected template
  const updateSelectedTemplate = (template: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
  };

  // NEW: Function to update custom colors for templates
  const updateCustomColors = (templateId: string, colors: any) => {
    setResumeData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [templateId]: colors
      }
    }));
  };

  const updatePersonalInfo = (field: keyof PersonalInfoData, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { 
        ...prev.personalInfo, 
        [field]: value 
      }
    }));
  };

  const updateExperience = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
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
    return newId;
  };

  const removeExperience = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
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
    return newId;
  };

  const removeEducation = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill: Skill) => {
    if (skill.name && !resumeData.skills.some(s => s.name === skill.name)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkillProficiency = (index: number, proficiency: Skill['proficiency']) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, proficiency } : skill
      )
    }));
  };

  const updateProject = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
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
    return newId;
  };

  const removeProject = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const updateAward = (id: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.map(award => 
        award.id === id ? { ...award, [field]: value } : award
      )
    }));
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
    return newId;
  };

  const removeAward = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      awards: prev.awards.filter(award => award.id !== id)
    }));
  };

  const updateCustomField = (id: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    }));
  };

  const changeCustomFieldType = (id: number, type: 'text' | 'textarea' | 'date' | 'url') => {
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, type } : cf
      )
    }));
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
    return newId;
  };

  const removeCustomField = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(cf => cf.id !== id)
    }));
  };

  const handleFileUpload = (parsedData: any) => {
    console.log('File uploaded:', parsedData);
    // Implement file upload logic here
  };

  const handleSectionReorder = (reorderedSections: SectionItem[]) => {
    setSectionOrder(reorderedSections);
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
    // NEW: Add the new functions to context value
    updateSelectedTemplate,
    updateCustomColors
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