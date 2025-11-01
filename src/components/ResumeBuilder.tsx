import { useState, useRef, useEffect } from 'react';
import PersonalInfo from './PersonalInfo';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import TemplateSelector from './TemplateSelector';
import FileUpload from './FileUpload';
import ResumePreview from './ResumePreview';
import ColorCustomizer from './ColorCustomizer';
import { ResumeData, Template, PersonalInfoData, Skill, SectionItem, ParsedResumeData } from './types';
import Projects from './Projects';
import Awards from './Awards';
import CustomFields from './CustomFields';
import MobilePDFGenerator from './MobilePDFGenerator';
import SEO from './SEO';
import SectionOrderCustomizer from './SectionOrderCustomizer';

// Enhanced template configuration with color customization
const TEMPLATES: Record<string, Template> = {
  ats: {
    id: 'ats',
    name: 'ATS Optimized',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-800',
    borderColor: 'border-gray-600',
    buttonColor: 'bg-gray-800 hover:bg-gray-700',
    headerBg: 'bg-gray-800',
    headerText: 'text-white',
    sectionBg: 'bg-gray-50',
    description: 'Maximum ATS compatibility with clean, single-column layout',
    layout: 'ats',
    colors: {
      primary: '#1f2937', // gray-800
      secondary: '#374151', // gray-700
      accent: '#6b7280', // gray-500
      background: '#ffffff',
      text: '#111827'
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-900',
    borderColor: 'border-blue-900',
    buttonColor: 'bg-blue-900 hover:bg-blue-800',
    headerBg: 'bg-blue-900',
    headerText: 'text-white',
    sectionBg: 'bg-gray-50',
    description: 'Classic professional design for corporate environments',
    layout: 'professional',
    colors: {
      primary: '#1e3a8a', // blue-900
      secondary: '#1e40af', // blue-800
      accent: '#3b82f6', // blue-500
      background: '#ffffff',
      text: '#111827'
    }
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    textColor: 'text-gray-900',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    headerBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    headerText: 'text-white',
    sectionBg: 'bg-white bg-opacity-70',
    description: 'Colorful and expressive design for creative fields',
    layout: 'creative',
    colors: {
      primary: '#9333ea', // purple-600
      secondary: '#7e22ce', // purple-700
      accent: '#d8b4fe', // purple-300
      background: '#faf5ff',
      text: '#1f2937'
    }
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-700',
    borderColor: 'border-gray-400',
    buttonColor: 'bg-gray-700 hover:bg-gray-800',
    headerBg: 'bg-gray-100',
    headerText: 'text-gray-800',
    sectionBg: 'bg-gray-50',
    description: 'Simple and focused design with maximum readability',
    layout: 'minimalist',
    colors: {
      primary: '#374151', // gray-700
      secondary: '#1f2937', // gray-800
      accent: '#d1d5db', // gray-300
      background: '#ffffff',
      text: '#111827'
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    headerBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    headerText: 'text-white',
    sectionBg: 'bg-white bg-opacity-80',
    description: 'Clean modern design with skill proficiency charts',
    layout: 'modern',
    colors: {
      primary: '#2563eb', // blue-600
      secondary: '#1d4ed8', // blue-700
      accent: '#93c5fd', // blue-300
      background: '#eff6ff',
      text: '#1f2937'
    }
  }
};

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: 'John Doe',
      title: 'Software Developer',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      summary: [
        'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
        'Passionate about building scalable web applications with clean architecture.',
        'Strong problem-solving skills and experience in agile development environments.'
      ]
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
    selectedTemplate: 'ats',
    customColors: {}
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

  const [formKey, setFormKey] = useState(0); // Add this key to force re-render
  const resumeRef = useRef<HTMLDivElement>(null);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('ResumeData updated:', resumeData);
    console.log('Personal Info:', resumeData.personalInfo);
    console.log('Experiences:', resumeData.experiences);
    console.log('Education:', resumeData.education);
    console.log('Skills:', resumeData.skills);
  }, [resumeData]);

  const updatePersonalInfo = (field: keyof PersonalInfoData, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
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

  const selectTemplate = (template: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
  };

  const updateTemplateColors = (colors: any) => {
    setResumeData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [prev.selectedTemplate]: colors
      }
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

  const handleFileUpload = (parsedData: ParsedResumeData) => {
    console.log('Parsed resume data:', parsedData);
    console.log('Parsed data details:', {
      personalInfo: parsedData.personalInfo,
      experiences: parsedData.experiences,
      education: parsedData.education,
      skills: parsedData.skills,
      projects: parsedData.projects
    });
    
    // Create a completely new state with parsed data
    const newResumeData: ResumeData = {
      personalInfo: {
        name: parsedData.personalInfo.name || 'Your Name',
        title: parsedData.personalInfo.title || 'Your Title',
        email: parsedData.personalInfo.email || 'your.email@example.com',
        phone: parsedData.personalInfo.phone || '(555) 123-4567',
        summary: parsedData.personalInfo.summary.length > 0 
          ? parsedData.personalInfo.summary 
          : ['Professional summary will appear here.']
      },
      experiences: parsedData.experiences.length > 0 
        ? parsedData.experiences.map((exp, index) => ({
            ...exp,
            id: Date.now() + index,
            description: exp.description.length > 0 ? exp.description : ['']
          }))
        : [{
            id: Date.now(),
            title: '',
            company: '',
            period: '',
            description: ['']
          }],
      education: parsedData.education.length > 0 
        ? parsedData.education.map((edu, index) => ({
            ...edu,
            id: Date.now() + index,
            gpa: edu.gpa || ''
          }))
        : [{
            id: Date.now(),
            degree: '',
            institution: '',
            year: '',
            gpa: ''
          }],
      skills: parsedData.skills.length > 0 
        ? parsedData.skills 
        : [{ name: 'JavaScript', proficiency: 'Intermediate' }],
      projects: parsedData.projects.length > 0 
        ? parsedData.projects.map((proj, index) => ({
            ...proj,
            id: Date.now() + index,
            description: proj.description.length > 0 ? proj.description : [''],
            technologies: proj.technologies || []
          }))
        : [{
            id: Date.now(),
            name: '',
            description: [''],
            technologies: [],
            period: '',
            link: ''
          }],
      awards: [{
        id: Date.now(),
        title: '',
        issuer: '',
        year: '',
        description: ''
      }],
      customFields: [{
        id: Date.now(),
        label: 'Languages',
        value: '',
        type: 'text'
      }],
      selectedTemplate: 'ats',
      customColors: {}
    };

    console.log('New resume data to set:', newResumeData);
    
    setResumeData(newResumeData);
    setFormKey(prev => prev + 1); // Force re-render of form components
    
    alert('Resume information has been auto-filled! Please review and make any necessary edits.');
  };

  const handleSectionReorder = (reorderedSections: SectionItem[]) => {
    setSectionOrder(reorderedSections);
  };

  // Get the current template configuration
  const currentTemplate = TEMPLATES[resumeData.selectedTemplate] || TEMPLATES.ats;
  
  // Get custom colors for the current template if they exist
  const customColors = resumeData.customColors[resumeData.selectedTemplate] || currentTemplate.colors;

  return (
    <>
      <SEO
        title="Free Resume Builder - Create ATS-Friendly CV Online"
        description="Build professional, ATS-optimized resumes with our free online builder. 10+ templates for engineers, developers, and IT professionals. Download PDF instantly."
        keywords="free resume builder, online CV maker, ATS resume template, professional resume download, resume builder no sign up, create resume free"
        canonicalUrl="https://resumecvforge.netlify.app/builder"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Resume Builder</h1>
          <p className="text-xl text-gray-600">Create professional resumes in minutes</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/5" key={formKey}>
            {/* Fixed PersonalInfo section */}
            <PersonalInfo 
              data={resumeData.personalInfo} 
              onChange={updatePersonalInfo} 
            />
            
            {/* Static sections without drag-and-drop */}
            <div className="space-y-6">
              <Experience 
                experiences={resumeData.experiences}
                onUpdate={updateExperience}
                onAdd={addExperience}
                onRemove={removeExperience}
              />
              <Education 
                education={resumeData.education}
                onUpdate={updateEducation}
                onAdd={addEducation}
                onRemove={removeEducation}
              />
              <Projects
                projects={resumeData.projects}
                onUpdate={updateProject}
                onAdd={addProject}
                onRemove={removeProject}
              />
              <Awards
                awards={resumeData.awards}
                onUpdate={updateAward}
                onAdd={addAward}
                onRemove={removeAward}
              />
              <Skills 
                skills={resumeData.skills}
                onAdd={addSkill}
                onRemove={removeSkill}
                onUpdateProficiency={updateSkillProficiency}
              />
              <CustomFields
                customFields={resumeData.customFields}
                onUpdate={updateCustomField}
                onAdd={addCustomField}
                onRemove={removeCustomField}
                onChangeType={changeCustomFieldType}
              />
              <FileUpload 
                onUpload={handleFileUpload}
              />
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <ResumePreview 
              ref={resumeRef} 
              data={resumeData} 
              template={currentTemplate}
              customColors={customColors}
              sectionOrder={sectionOrder}
            />
            
            {/* Updated MobilePDFGenerator with new props */}
            <MobilePDFGenerator 
              resumeRef={resumeRef as React.RefObject<HTMLDivElement>}
              personalInfo={resumeData.personalInfo}
              resumeData={resumeData}
              template={currentTemplate}
            />
            
            <TemplateSelector 
              selectedTemplate={resumeData.selectedTemplate}
              onSelect={selectTemplate}
              templates={TEMPLATES}
            />
            
            <ColorCustomizer
              template={currentTemplate}
              colors={customColors}
              onUpdate={updateTemplateColors}
            />

            <SectionOrderCustomizer 
              sections={sectionOrder}
              onReorder={handleSectionReorder}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;