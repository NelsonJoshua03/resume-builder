import React from 'react';

interface CreativePortfolioTemplateProps {
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

const CreativePortfolioTemplate: React.FC<CreativePortfolioTemplateProps> = ({
  personalInfo,
  experiences,
  education,
  projects,
  skills,
  awards,
  customFields,
  // customColors, // Remove unused parameter
  sectionOrder = []
}) => {
  // Helper function to render sections based on sectionOrder
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return personalInfo.summary && personalInfo.summary.length > 0 ? (
          <Card title="About Me" icon="💫">
            <div className="space-y-2">
              {personalInfo.summary.map((point, index) => (
                <p key={index} className="text-gray-700 leading-relaxed text-xs">{point}</p>
              ))}
            </div>
          </Card>
        ) : null;

      case 'experience':
        return experiences && experiences.length > 0 ? (
          <Card title="Work Journey" icon="🚀">
            <div className="space-y-5">
              {experiences.map((exp, index) => (
                <TimelineItem
                  key={index}
                  period={exp.period}
                  title={exp.title}
                  subtitle={exp.company}
                  items={exp.description}
                />
              ))}
            </div>
          </Card>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <Card title="Learning Path" icon="📚">
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={index} className="bg-white p-3 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 text-xs">{edu.degree}</h4>
                  <p className="text-purple-600 text-xs">{edu.institution}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{edu.year}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <Card title="Skills" icon="🛠️">
            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <span className="text-gray-500 mr-2 text-xs">•</span>
                  <span className="text-xs">
                    <strong>{skill.name}</strong>
                    {skill.proficiency && ` - ${skill.proficiency}`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : null;

      case 'projects':
        return projects && projects.length > 0 ? (
          <Card title="Creative Projects" icon="🎨">
            <div className="space-y-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={index}
                  name={project.name}
                  period={project.period}
                  description={project.description}
                  technologies={project.technologies}
                  link={project.link}
                />
              ))}
            </div>
          </Card>
        ) : null;

      case 'awards':
        return awards && awards.length > 0 && awards.some(award => award && award.title) ? (
          <Card title="Trophies" icon="🏆">
            <div className="space-y-2">
              {awards.filter(award => award && award.title).map((award, index) => (
                <div key={index} className="bg-white p-2 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 text-xs">{award.title}</h4>
                  <p className="text-gray-600 text-xs">{award.issuer} • {award.year}</p>
                  {award.description && (
                    <p className="text-gray-700 text-xs mt-1">{award.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : null;

      case 'custom':
        return customFields && customFields.length > 0 && customFields[0] && customFields[0].value ? (
          <Card title="Additional Information" icon="📋">
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-800 text-xs mb-1">{field.label}</h4>
                  <p className="text-gray-700 text-xs leading-relaxed">{field.value}</p>
                </div>
              ))}
            </div>
          </Card>
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
        { id: 'projects', enabled: true, order: 3 },
        { id: 'skills', enabled: true, order: 4 },
        { id: 'awards', enabled: true, order: 5 },
        { id: 'custom', enabled: true, order: 6 }
      ];

  return (
    <div className="w-full bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="w-full">
        {/* Hero Section with Profile Picture - Reduced Size */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-4">
          <div className="relative h-32 bg-gradient-to-r from-purple-600 to-pink-600">
            {/* Profile Picture in Header */}
            <div className="absolute -bottom-8 left-6">
              {personalInfo.profilePicture ? (
                <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
                  <img 
                    src={personalInfo.profilePicture} 
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white">
                  <span className="text-xl">👨‍💻</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-10 pb-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{personalInfo.name}</h1>
                <h2 className="text-md text-purple-600 font-semibold">{personalInfo.title}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center text-gray-600 text-xs">
                    <MailIcon />
                    <span className="ml-2">{personalInfo.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-xs">
                    <PhoneIcon />
                    <span className="ml-2">{personalInfo.phone}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold text-xs">
                  Available for Opportunities
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="space-y-4 px-6">
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

// Reusable Components
const Card: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ 
  title, 
  icon, 
  children 
}) => (
  <div className="bg-white rounded-xl shadow-lg p-4">
    <div className="flex items-center mb-3">
      <span className="text-lg mr-2">{icon}</span>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const TimelineItem: React.FC<{
  period: string;
  title: string;
  subtitle: string;
  items: string[];
}> = ({ period, title, subtitle, items }) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-3">
      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
      <div className="w-0.5 h-full bg-purple-200 mt-1"></div>
    </div>
    <div className="flex-1 pb-4">
      <div className="bg-gray-50 p-3 rounded-xl">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 text-xs">{title}</h4>
          <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
            {period}
          </span>
        </div>
        <p className="text-gray-600 text-xs mb-2">{subtitle}</p>
        <ul className="space-y-1 text-xs text-gray-700">
          {items && items.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-gray-500 mr-2 text-xs">•</span>
              <span className="text-xs">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const ProjectCard: React.FC<{
  name: string;
  period: string;
  description: string[];
  technologies?: string[];
  link?: string;
}> = ({ name, period, description, technologies, link }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-semibold text-gray-800 text-xs">{name}</h4>
      {link && (
        <a href={link} className="text-gray-500 hover:text-gray-600">
          <ExternalLinkIcon />
        </a>
      )}
    </div>
    <p className="text-gray-500 text-xs mb-2">{period}</p>
    <ul className="space-y-1 text-xs text-gray-700">
      {description && description.slice(0, 3).map((item, idx) => (
        <li key={idx} className="flex items-start">
          <span className="text-gray-500 mr-1 text-xs">▸</span>
          <span className="text-xs">{item}</span>
        </li>
      ))}
    </ul>
    {technologies && technologies.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {technologies.slice(0, 4).map((tech: string, idx: number) => (
          <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
            {tech}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Icons
const MailIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
  </svg>
);

export default CreativePortfolioTemplate;