import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PersonalInfo from './PersonalInfo';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import TemplateSelector from './TemplateSelector';
import FileUpload from './FileUpload';
import ResumePreview from './ResumePreview';
import ColorCustomizer from './ColorCustomizer';
import { ResumeData, Template, PersonalInfoData, Skill } from './types';
import Projects from './Projects';
import Awards from './Awards';
import CustomFields from './CustomFields';

// Enhanced template configuration with color customization
const TEMPLATES: Record<string, Template> = {
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
        year: '2018'
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
  });

  const resumeRef = useRef<HTMLDivElement>(null);
  
  const downloadPDF = () => {
    const input = resumeRef.current;
    if (!input) return;
    
    // Store original styles
    const originalWidth = input.style.width;
    const originalHeight = input.style.height;
    
    // Set fixed size for PDF generation
    input.style.width = '794px'; // A4 width in pixels at 96 DPI
    input.style.height = 'auto';
    
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      windowWidth: 794,
      onclone: (clonedDoc: Document) => {
        // Ensure all images are loaded before capture
        const images = clonedDoc.querySelectorAll('img');
        let loadedImages = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const imageLoaded = () => {
            loadedImages++;
            if (loadedImages === totalImages) resolve();
          };
          
          images.forEach((img: HTMLImageElement) => {
            if (img.complete) {
              imageLoaded();
            } else {
              img.addEventListener('load', imageLoaded);
              img.addEventListener('error', imageLoaded);
            }
          });
        });
      }
    } as any).then((canvas) => {
      // Restore original styles
      input.style.width = originalWidth;
      input.style.height = originalHeight;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resumeData.personalInfo.name}_Resume.pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      // Restore original styles even if there's an error
      input.style.width = originalWidth;
      input.style.height = originalHeight;
    });
  };

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
    setResumeData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: Date.now(),
          title: '',
          company: '',
          period: '',
          description: ['']
        }
      ]
    }));
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
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          year: ''
        }
      ]
    }));
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
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now(),
          name: '',
          description: [''],
          technologies: [],
          period: '',
          link: ''
        }
      ]
    }));
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
    setResumeData(prev => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: Date.now(),
          title: '',
          issuer: '',
          year: '',
          description: ''
        }
      ]
    }));
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
    setResumeData(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          id: Date.now(),
          label: 'New Section',
          value: '',
          type: 'text'
        }
      ]
    }));
  };

  const removeCustomField = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(cf => cf.id !== id)
    }));
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file);
  };

  // Get the current template configuration
  const currentTemplate = TEMPLATES[resumeData.selectedTemplate] || TEMPLATES.creative;
  
  // Get custom colors for the current template if they exist
  const customColors = resumeData.customColors[resumeData.selectedTemplate] || currentTemplate.colors;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Resume Builder</h1>
        <p className="text-xl text-gray-600">Create professional resumes in minutes</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/5">
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
            <FileUpload onUpload={handleFileUpload} />
          </div>
        </div>

        <div className="w-full lg:w-3/5">
          <ResumePreview 
            ref={resumeRef} 
            data={resumeData} 
            template={currentTemplate}
            customColors={customColors}
          />
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={downloadPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center transition-colors shadow-md"
            >
              <i className="fas fa-download mr-2"></i> Download PDF
            </button>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;