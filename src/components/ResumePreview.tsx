import { forwardRef } from 'react';
import { ResumePreviewProps, Skill } from './types';

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, template, customColors }, ref) => {
  const { personalInfo, experiences, education, projects, awards, customFields, skills } = data;

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
      case 'skill':
        styles.backgroundColor = customColors.accent + '40';
        styles.color = customColors.secondary;
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

  // Render different layouts based on template
  const renderTemplate = () => {
    switch(template.layout) {
      case 'creative':
        return renderCreativeTemplate();
      case 'minimalist':
        return renderMinimalistTemplate();
      case 'modern':
        return renderModernTemplate();
      default:
        return renderCreativeTemplate();
    }
  };

  // Creative Template (Single Column)
  const renderCreativeTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text, backgroundColor: customColors.background }}>
      {/* Decorative header */}
      <div className="relative">
        <div className="h-24" style={{ backgroundColor: customColors.primary }}></div>
        <div className="absolute top-12 left-6 w-24 h-24 bg-white rounded-full shadow-md border-4 border-white overflow-hidden">
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: customColors.accent }}>
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

        {/* Summary */}
        <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
          <h3 className="text-lg font-semibold mb-2 flex items-center" style={applyCustomStyles('accent')}>
            <i className="fas fa-star mr-2"></i> Professional Summary
          </h3>
          <BulletList items={personalInfo.summary} />
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-briefcase mr-2"></i> Work Experience
            </h3>
            {experiences.map((exp, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{exp.title}</h4>
                  <span className="text-xs px-2 py-1 rounded" style={applyCustomStyles('badge')}>
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                <BulletList items={exp.description} />
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-graduation-cap mr-2"></i> Education
            </h3>
            {education.map((edu, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-semibold">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs" style={applyCustomStyles('accent')}>{edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-code mr-2"></i> Projects
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
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-trophy mr-2"></i> Awards
            </h3>
            {awards.map((award, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-semibold">{award.title}</h4>
                <p className="text-sm text-gray-600">{award.issuer} • {award.year}</p>
                <p className="text-sm">{award.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-tools mr-2"></i> Skills
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
                  <span key={index} className="px-3 py-1 rounded-full text-xs" style={applyCustomStyles('skill')}>
                    {skill.name} ({skill.proficiency})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div>
            {customFields.map((field, index) => (
              <div key={index} className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
                  {field.label}
                </h3>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Minimalist Template (Single Column)
  const renderMinimalistTemplate = () => (
    <div className={`rounded-xl overflow-hidden ${template.background}`} style={{ color: customColors.text, backgroundColor: customColors.background }}>
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
          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Summary</h3>
            <BulletList items={personalInfo.summary} />
          </div>

          {/* Experience */}
          {experiences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Work Experience</h3>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <span className="text-xs px-2 py-1 rounded" style={applyCustomStyles('badge')}>
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                  <BulletList items={exp.description} />
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Education</h3>
              {education.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs" style={applyCustomStyles('accent')}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Projects</h3>
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
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Awards</h3>
              {awards.map((award, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <h4 className="font-semibold">{award.title}</h4>
                  <p className="text-sm text-gray-600">{award.issuer} • {award.year}</p>
                  <p className="text-sm">{award.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs" style={applyCustomStyles('skill')}>
                    {skill.name} ({skill.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div>
              {customFields.map((field, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>{field.label}</h3>
                  <p className="text-sm">{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modern Template with Circular Skill Progress Charts (Single Column)
  const renderModernTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text, backgroundColor: customColors.background }}>
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
        {/* Summary */}
        <div>
          <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
            Professional Summary
          </h3>
          <BulletList items={personalInfo.summary} />
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
              Work Experience
            </h3>
            {experiences.map((exp, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{exp.title}</h4>
                  <span className="text-xs px-2 py-1 rounded" style={applyCustomStyles('badge')}>
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                <BulletList items={exp.description} />
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
              Education
            </h3>
            {education.map((edu, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-semibold">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs" style={applyCustomStyles('accent')}>{edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
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
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
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
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
              Skills
            </h3>
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
          </div>
        )}

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div>
            {customFields.map((field, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold mb-3" style={{ color: customColors.primary }}>
                  {field.label}
                </h3>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
        )}
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