import { forwardRef } from 'react';
import { ResumePreviewProps, Skill, SectionItem } from './types';

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ 
  data, 
  template, 
  customColors,
  sectionOrder 
}, ref) => {
  const { personalInfo, experiences, education, projects, awards, customFields, skills } = data;

  // Default section order if not provided
  const defaultSectionOrder: SectionItem[] = [
    { id: 'summary', label: 'Professional Summary', enabled: true, order: 0 },
    { id: 'experience', label: 'Work Experience', enabled: true, order: 1 },
    { id: 'education', label: 'Education', enabled: true, order: 2 },
    { id: 'projects', label: 'Projects', enabled: true, order: 3 },
    { id: 'skills', label: 'Skills', enabled: true, order: 4 },
    { id: 'awards', label: 'Awards', enabled: true, order: 5 },
    { id: 'custom', label: 'Additional Sections', enabled: true, order: 6 }
  ];

  const currentSectionOrder = sectionOrder || defaultSectionOrder;

  // Helper function to apply custom colors
  const applyCustomStyles = (elementType: string) => {
    const styles: React.CSSProperties = {};
    
    switch(elementType) {
      case 'header':
        styles.backgroundColor = customColors.primary;
        break;
      case 'accent':
        styles.color = customColors.primary;
        break;
      case 'section':
        styles.backgroundColor = customColors.accent + '20'; // Add transparency
        break;
      case 'badge':
        styles.backgroundColor = customColors.accent + '40';
        styles.color = customColors.primary;
        break;
      case 'divider':
        styles.backgroundColor = customColors.primary + '40';
        break;
      default:
        break;
    }
    
    return styles;
  };

  // Helper function to convert proficiency to percentage
  const proficiencyToPercentage = (proficiency: Skill['proficiency']): number => {
    switch(proficiency) {
      case 'Beginner': return 25;
      case 'Intermediate': return 50;
      case 'Advanced': return 75;
      case 'Expert': return 100;
      default: return 0;
    }
  };

  // Circular progress component
  const CircularProgress = ({ percentage, size = 60, strokeWidth = 6 }: { percentage: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={customColors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ color: customColors.primary }}>
          {percentage}%
        </div>
      </div>
    );
  };

  // Custom bullet point component for better alignment
  const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2 mt-1.5 text-xs">•</span>
          <span className="text-sm flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );

  // Section components
  const SummarySection = () => (
    personalInfo.summary.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-2 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-star mr-2"></i>}
          Professional Summary
        </h3>
        {template.layout === 'ats' ? (
          <div className="text-sm space-y-2">
            {personalInfo.summary.map((point, index) => (
              <p key={index}>{point}</p>
            ))}
          </div>
        ) : (
          <BulletList items={personalInfo.summary} />
        )}
      </div>
    )
  );

  const ExperienceSection = () => (
    experiences.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-briefcase mr-2"></i>}
          Work Experience
        </h3>
        {experiences.map((exp, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{exp.title}</h4>
              <span className="text-xs text-gray-600">
                {exp.period}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
            <BulletList items={exp.description} />
          </div>
        ))}
      </div>
    )
  );

  const EducationSection = () => (
    education.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-graduation-cap mr-2"></i>}
          Education
        </h3>
        {education.map((edu, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <h4 className="font-semibold">{edu.degree}</h4>
            <p className="text-sm text-gray-600">{edu.institution}</p>
            <div className="flex justify-between">
              <p className="text-xs" style={applyCustomStyles('accent')}>{edu.year}</p>
              {edu.gpa && <p className="text-xs" style={applyCustomStyles('accent')}>GPA: {edu.gpa}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  );

  const ProjectsSection = () => (
    projects.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-code mr-2"></i>}
          Projects
        </h3>
        {projects.map((project, index) => (
          <div key={index} className="mb-5 last:mb-0">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{project.name}</h4>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm" style={{color: customColors.primary}}>
                  View
                </a>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{project.period}</p>
            <BulletList items={project.description} />
          </div>
        ))}
      </div>
    )
  );

  const AwardsSection = () => (
    awards.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-trophy mr-2"></i>}
          Awards
        </h3>
        {awards.map((award, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <h4 className="font-semibold">{award.title}</h4>
            <p className="text-sm text-gray-600">{award.issuer} • {award.year}</p>
            <p className="text-sm">{award.description}</p>
          </div>
        ))}
      </div>
    )
  );

  const SkillsSection = () => (
    skills.length > 0 && (
      <div className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
        <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
          {template.layout !== 'ats' && <i className="fas fa-tools mr-2"></i>}
          Skills
        </h3>
        {template.layout === 'modern' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {skills.map((skill, index) => {
              const percentage = proficiencyToPercentage(skill.proficiency);
              return (
                <div key={index} className="flex flex-col items-center">
                  <CircularProgress percentage={percentage} />
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-600">{skill.proficiency}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 text-xs" style={{ color: customColors.secondary }}>
                {skill.name} ({skill.proficiency})
              </span>
            ))}
          </div>
        )}
      </div>
    )
  );

  const CustomFieldsSection = () => (
    customFields.length > 0 && (
      <div>
        {customFields.map((field, index) => (
          <div key={index} className={`${template.layout === 'ats' ? 'mb-6' : 'p-4 rounded-lg mb-6'}`} style={template.layout !== 'ats' ? applyCustomStyles('section') : {}}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              {field.label}
            </h3>
            <p className="text-sm">{field.value}</p>
          </div>
        ))}
      </div>
    )
  );

  // Map section IDs to components
  const sectionComponents: { [key: string]: JSX.Element | null } = {
    summary: <SummarySection key="summary" />,
    experience: <ExperienceSection key="experience" />,
    education: <EducationSection key="education" />,
    projects: <ProjectsSection key="projects" />,
    awards: <AwardsSection key="awards" />,
    skills: <SkillsSection key="skills" />,
    custom: <CustomFieldsSection key="custom" />
  };

  // ATS Optimized Template (Single Column, Clean Structure)
  const renderATSTemplate = (enabledSections: SectionItem[]) => (
    <div className="bg-white p-8" style={{ color: customColors.text }}>
      {/* Simple Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: customColors.primary }}>{personalInfo.name}</h1>
        <h2 className="text-lg text-gray-700 mb-4">{personalInfo.title}</h2>
        <div className="flex justify-center space-x-4 text-sm text-gray-600">
          <span>{personalInfo.email}</span>
          <span>|</span>
          <span>{personalInfo.phone}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Render sections in custom order */}
        {enabledSections.map(section => (
          <div key={section.id}>
            {sectionComponents[section.id]}
          </div>
        ))}
      </div>
    </div>
  );

  // Render different layouts based on template
  const renderTemplate = () => {
    // Get enabled sections in correct order
    const enabledSections = currentSectionOrder
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order);

    switch(template.layout) {
      case 'ats':
        return renderATSTemplate(enabledSections);
      case 'professional':
        return renderProfessionalTemplate(enabledSections);
      case 'creative':
        return renderCreativeTemplate(enabledSections);
      case 'minimalist':
        return renderMinimalistTemplate(enabledSections);
      case 'modern':
        return renderModernTemplate(enabledSections);
      default:
        return renderATSTemplate(enabledSections);
    }
  };

  // Professional Template (Classic Corporate Style)
  const renderProfessionalTemplate = (enabledSections: SectionItem[]) => (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white" style={{ color: customColors.text }}>
      {/* Header with solid color bar */}
      <div className="p-8 border-b-4" style={{ borderBottomColor: customColors.primary }}>
        <h1 className="text-4xl font-bold mb-1" style={{ color: customColors.primary }}>{personalInfo.name}</h1>
        <h2 className="text-xl text-gray-700 mb-3">{personalInfo.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center">
            <i className="fas fa-envelope mr-2" style={{ color: customColors.primary }}></i> 
            {personalInfo.email}
          </span>
          <span className="flex items-center">
            <i className="fas fa-phone mr-2" style={{ color: customColors.primary }}></i> 
            {personalInfo.phone}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Render sections in custom order */}
        {enabledSections.map(section => (
          <div key={section.id}>
            {sectionComponents[section.id]}
          </div>
        ))}
      </div>
    </div>
  );

  // Creative Template (Single Column)
  const renderCreativeTemplate = (enabledSections: SectionItem[]) => (
    <div className="rounded-xl shadow-lg overflow-hidden bg-white" style={{ color: customColors.text }}>
      {/* Decorative header */}
      <div className="relative">
        <div className="h-24" style={{ backgroundColor: customColors.primary }}></div>
        <div 
          className="absolute top-12 left-6 w-24 h-24 bg-white shadow-md border-4 border-white overflow-hidden"
          style={{ 
            borderRadius: '50%',
            backgroundColor: customColors.accent 
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color: customColors.primary }}>
              {personalInfo.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
          <h2 className="text-lg" style={applyCustomStyles('accent')}>{personalInfo.title}</h2>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <span><i className="fas fa-envelope mr-1"></i> {personalInfo.email}</span>
            <span><i className="fas fa-phone mr-1"></i> {personalInfo.phone}</span>
          </div>
        </div>

        {/* Render sections in custom order */}
        {enabledSections.map(section => sectionComponents[section.id])}
      </div>
    </div>
  );

  // Minimalist Template (Single Column)
  const renderMinimalistTemplate = (enabledSections: SectionItem[]) => (
    <div className="rounded-xl overflow-hidden bg-white" style={{ color: customColors.text }}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light">{personalInfo.name}</h1>
          <h2 className="text-lg text-gray-600 mt-1">{personalInfo.title}</h2>
          <div className="flex justify-center space-x-4 mt-3 text-sm text-gray-500">
            <span><i className="fas fa-envelope mr-1"></i> {personalInfo.email}</span>
            <span><i className="fas fa-phone mr-1"></i> {personalInfo.phone}</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Render sections in custom order */}
          {enabledSections.map(section => sectionComponents[section.id])}
        </div>
      </div>
    </div>
  );

  // Modern Template with Circular Skill Progress Charts (Single Column)
  const renderModernTemplate = (enabledSections: SectionItem[]) => (
    <div className="rounded-xl shadow-lg overflow-hidden bg-white" style={{ color: customColors.text }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: customColors.primary }}>
        <h1 className="text-3xl font-bold text-white">{personalInfo.name}</h1>
        <h2 className="text-xl text-blue-100 mt-1">{personalInfo.title}</h2>
        <div className="flex flex-wrap gap-4 mt-3 text-blue-100">
          <span><i className="fas fa-envelope mr-1"></i> {personalInfo.email}</span>
          <span><i className="fas fa-phone mr-1"></i> {personalInfo.phone}</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Render sections in custom order */}
        {enabledSections.map(section => sectionComponents[section.id])}
      </div>
    </div>
  );

  return (
    <div ref={ref} className="mb-6">
      {renderTemplate()}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;