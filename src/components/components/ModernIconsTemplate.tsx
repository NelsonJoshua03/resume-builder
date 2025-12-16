import React from 'react';

interface ModernIconsTemplateProps {
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

const ModernIconsTemplate: React.FC<ModernIconsTemplateProps> = ({
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
          <Section title="Professional Summary" icon="👤">
            <div className="space-y-3">
              {personalInfo.summary.map((point, index) => (
                <p key={index} className="text-gray-700 leading-relaxed text-sm">{point}</p>
              ))}
            </div>
          </Section>
        ) : null;

      case 'experience':
        return experiences && experiences.length > 0 ? (
          <Section title="Work Experience" icon="💼">
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{exp.title}</h4>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-600 mt-2 sm:mt-0">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {exp.description && exp.description.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start text-gray-700">
                        <span className="text-green-500 mr-3 text-lg">•</span>
                        <span className="leading-relaxed text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <Section title="Education" icon="🎓">
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 text-lg">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <div className="flex justify-between text-sm text-gray-500 mt-3">
                    <span>{edu.year}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <Section title="Skills" icon="🛠️">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <ul className="space-y-2">
                {skills.map((skill, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="text-blue-500 mr-3 text-lg">•</span>
                    <span className="leading-relaxed text-sm">
                      <strong>{skill.name}</strong>
                      {skill.proficiency && ` - ${skill.proficiency}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        ) : null;

      case 'projects':
        return projects && projects.length > 0 ? (
          <Section title="Projects" icon="🚀">
            <div className="space-y-6">
              {projects.map((project, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <h4 className="font-semibold text-gray-800 text-lg">{project.name}</h4>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="text-sm text-gray-600">
                        {project.period}
                      </span>
                      {project.link && (
                        <a href={project.link} className="text-blue-500 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    {project.description && project.description.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-3 text-lg">✓</span>
                        <span className="leading-relaxed text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.technologies.map((tech: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case 'awards':
        return awards && awards.length > 0 && awards[0] && awards[0].title ? (
          <Section title="Awards & Achievements" icon="🏆">
            <div className="space-y-4">
              {awards.map((award, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">🏆</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{award.title}</h4>
                    <p className="text-gray-600 text-sm">{award.issuer} • {award.year}</p>
                    <p className="text-gray-700 mt-1 text-sm">{award.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case 'custom':
        return customFields && customFields.length > 0 && customFields[0] && customFields[0].value ? (
          <Section title="Additional Information" icon="📋">
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{field.label}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{field.value}</p>
                </div>
              ))}
            </div>
          </Section>
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
        { id: 'experience', enabled: true, order: 1 },
        { id: 'education', enabled: true, order: 2 },
        { id: 'skills', enabled: true, order: 3 },
        { id: 'projects', enabled: true, order: 4 },
        { id: 'awards', enabled: true, order: 5 },
        { id: 'custom', enabled: true, order: 6 }
      ];

  return (
    <div className="w-full bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="w-full bg-white">
        {/* Header with Brighter Gradient and Profile Picture */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              {personalInfo.profilePicture ? (
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
                  <img 
                    src={personalInfo.profilePicture} 
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white font-bold">
                    {personalInfo.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
                <h2 className="text-xl opacity-90">{personalInfo.title}</h2>
              </div>
            </div>
            <div className="text-center md:text-right mt-4 md:mt-0">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center md:justify-end">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>{personalInfo.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>{personalInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Dynamic Sections */}
        <div className="p-8 space-y-8">
          {enabledSections.map(section => (
            <div key={section.id}>
              {renderSection(section.id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Section Component
const Section: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center mb-4">
      <span className="text-2xl mr-3">{icon}</span>
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

export default ModernIconsTemplate;