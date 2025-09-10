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
import { ResumeData, Template } from './types';

// Enhanced template configuration with color customization
const TEMPLATES: Record<string, Template> = {
  professional: {
    id: 'professional',
    name: 'Professional',
    background: 'bg-white',
    textColor: 'text-gray-800',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    sectionBg: 'bg-blue-50',
    description: 'Clean and traditional design for corporate environments',
    layout: 'single-column',
    colors: {
      primary: '#2563eb', // blue-600
      secondary: '#1e40af', // blue-800
      accent: '#93c5fd', // blue-300
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    background: 'bg-gradient-to-br from-gray-50 to-gray-100',
    textColor: 'text-gray-900',
    accentColor: 'text-teal-600',
    borderColor: 'border-teal-300',
    buttonColor: 'bg-teal-600 hover:bg-teal-700',
    headerBg: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    headerText: 'text-white',
    sectionBg: 'bg-white bg-opacity-80',
    description: 'Sleek contemporary design with subtle gradients',
    layout: 'two-column',
    colors: {
      primary: '#0d9488', // teal-600
      secondary: '0f766e', // teal-700
      accent: '#5eead4', // teal-300
      background: '#f9fafb',
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
  }
};

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: 'John Doe',
      title: 'Software Developer',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      summary: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionable about building scalable web applications.'
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
    skills: ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'MongoDB', 'AWS'],
    selectedTemplate: 'professional',
    customColors: {}
  });

  const resumeRef = useRef<HTMLDivElement>(null);
  
  const downloadPDF = () => {
    const input = resumeRef.current;
    if (!input) return;
    
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    }as any).then((canvas) => {
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
    });
  };

  const updatePersonalInfo = (field: string, value: string) => {
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

  const addSkill = (skill: string) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
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

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file);
  };

  // Get the current template configuration
  const currentTemplate = TEMPLATES[resumeData.selectedTemplate] || TEMPLATES.professional;
  
  // Get custom colors for the current template if they exist
  const customColors = resumeData.customColors[resumeData.selectedTemplate] || currentTemplate.colors;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Resume Builder</h1>
        <p className="text-xl text-gray-600">Create professional resumes in minutes</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/5 space-y-6">
          <PersonalInfo 
            data={resumeData.personalInfo} 
            onChange={updatePersonalInfo} 
          />
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
          <Skills 
            skills={resumeData.skills}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
          <FileUpload onUpload={handleFileUpload} />
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