import React from 'react';

interface ProfessionalExecutiveTemplateProps {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
    profilePicture?: string;
  };
  experiences: any[];
  education: any[];
  projects: any[];
  skills: any[];
  awards: any[];
  customFields: any[];
  customColors: any;
  sectionOrder?: any[];
}

const ProfessionalExecutiveTemplate: React.FC<ProfessionalExecutiveTemplateProps> = ({
  personalInfo,
  experiences,
  education,
  projects,
  skills,
  awards,
  customFields,
  customColors,
  sectionOrder = []
}) => {
  // Helper function to render sections based on sectionOrder
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return personalInfo.summary && personalInfo.summary.length > 0 ? (
          <ExecutiveSection title="Executive Summary" icon="💼">
            <div className="space-y-2">
              {personalInfo.summary.map((point, index) => (
                <p key={index} className="text-gray-700 leading-relaxed text-xs">{point}</p>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <ExecutiveSection title="Core Competencies" icon="🛠️">
            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <span className="text-amber-500 mr-2 text-xs">•</span>
                  <span className="text-xs">
                    <strong>{skill.name}</strong>
                    {skill.proficiency && ` - ${skill.proficiency}`}
                  </span>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <ExecutiveSection title="Education" icon="🎓">
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={index} className="border-l-2 border-amber-500 pl-2">
                  <h4 className="font-semibold text-gray-800 text-xs">{edu.degree}</h4>
                  <p className="text-gray-600 text-xs">{edu.institution}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{edu.year}</span>
                    {edu.gpa && <span className="text-amber-600">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'awards':
        return awards && awards.length > 0 && awards[0] && awards[0].title ? (
          <ExecutiveSection title="Awards & Honors" icon="🏆">
            <div className="space-y-2">
              {awards.map((award, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-xs">{award.title}</h4>
                  <p className="text-gray-600 text-xs">{award.issuer}</p>
                  <p className="text-amber-600 text-xs">{award.year}</p>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'experience':
        return experiences && experiences.length > 0 ? (
          <ExecutiveSection title="Professional Experience" icon="💼" fullWidth>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{exp.title}</h4>
                      <p className="text-amber-600 font-medium text-xs">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full mt-1 sm:mt-0">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {exp.description && exp.description.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start text-gray-700">
                        <span className="text-amber-500 mr-2 text-xs">•</span>
                        <span className="leading-relaxed text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'projects':
        return projects && projects.length > 0 ? (
          <ExecutiveSection title="Key Projects" icon="🚀" fullWidth>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((project, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 text-xs">{project.name}</h4>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {project.period}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {project.description && project.description.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-amber-500 mr-1 text-xs">▸</span>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      case 'custom':
        return customFields && customFields.length > 0 && customFields[0] && customFields[0].value ? (
          <ExecutiveSection title="Additional Information" icon="📋" fullWidth>
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-800 text-xs mb-1">{field.label}</h4>
                  <p className="text-gray-700 text-xs leading-relaxed">{field.value}</p>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        ) : null;

      default:
        return null;
    }
  };

  // Get enabled sections in order
  const enabledSections = sectionOrder
    ? sectionOrder.filter(section => section.enabled).sort((a, b) => a.order - b.order)
    : [
        { id: 'summary', enabled: true, order: 0 },
        { id: 'skills', enabled: true, order: 1 },
        { id: 'education', enabled: true, order: 2 },
        { id: 'awards', enabled: true, order: 3 },
        { id: 'experience', enabled: true, order: 4 },
        { id: 'projects', enabled: true, order: 5 },
        { id: 'custom', enabled: true, order: 6 }
      ];

  return (
    <div className="w-full bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="w-full">
        {/* Executive Header with Profile Picture */}
        <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-white p-6">
          <div className="flex items-center">
            {/* Profile Picture */}
            {personalInfo.profilePicture ? (
              <div className="mr-6">
                <img 
                  src={personalInfo.profilePicture} 
                  alt={personalInfo.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="mr-6 w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-xl text-white font-bold">
                  {personalInfo.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{personalInfo.name}</h1>
              <h2 className="text-lg text-amber-300 font-semibold mb-3">{personalInfo.title}</h2>
              
              <div className="flex flex-wrap gap-4 text-gray-300 text-xs">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>{personalInfo.email}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>{personalInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6">
          {/* Left Column - 1/4 width */}
          <div className="lg:col-span-1 space-y-5">
            {enabledSections.filter(section => 
              ['summary', 'skills', 'education', 'awards'].includes(section.id)
            ).map(section => (
              <div key={section.id}>
                {renderSection(section.id)}
              </div>
            ))}
          </div>

          {/* Right Column - 3/4 width */}
          <div className="lg:col-span-3 space-y-5">
            {enabledSections.filter(section => 
              ['experience', 'projects', 'custom'].includes(section.id)
            ).map(section => (
              <div key={section.id}>
                {renderSection(section.id)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Executive Section Component
const ExecutiveSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ title, icon, children, fullWidth = false }) => (
  <div className={fullWidth ? "w-full" : ""}>
    <div className="flex items-center mb-2">
      <span className="text-base mr-2">{icon}</span>
      <h3 className="text-sm font-bold text-gray-800 border-b-2 border-amber-500 pb-1">{title}</h3>
    </div>
    {children}
  </div>
);

export default ProfessionalExecutiveTemplate;