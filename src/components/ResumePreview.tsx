import { forwardRef } from 'react';
import { ResumePreviewProps } from './types';

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

  // Render different layouts based on template
  const renderTemplate = () => {
    switch(template.layout) {
      case 'two-column':
        return renderModernTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'minimalist':
        return renderMinimalistTemplate();
      default:
        return renderProfessionalTemplate();
    }
  };

  // Professional Template (Single Column)
  const renderProfessionalTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text, backgroundColor: customColors.background }}>
      {/* Header */}
      <div className="p-8 text-center relative" style={applyCustomStyles('header')}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full" style={{backgroundColor: customColors.accent}}></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full" style={{backgroundColor: customColors.accent}}></div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#fff' }}>{personalInfo.name}</h1>
        <h2 className="text-xl font-medium mb-4 opacity-90" style={{ color: '#fff' }}>{personalInfo.title}</h2>
        
        <div className="flex justify-center space-x-6 mt-6 text-sm">
          <span className="flex items-center">
            <i className="fas fa-envelope mr-2 text-white opacity-90"></i> 
            <span style={{ color: '#fff' }}>{personalInfo.email}</span>
          </span>
          <span className="flex items-center">
            <i className="fas fa-phone mr-2 text-white opacity-90"></i> 
            <span style={{ color: '#fff' }}>{personalInfo.phone}</span>
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
            <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
              Professional Summary
            </h3>
            <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
          </div>
          <div className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
            <ul className="space-y-2">
              {personalInfo.summary.map((point, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-1.5" style={{color: customColors.primary}}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Work Experience
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={index} className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <span className="text-sm px-3 py-1 rounded-md mt-1 sm:mt-0" style={applyCustomStyles('badge')}>
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-3" style={{color: customColors.secondary}}>{exp.company}</p>
                  <ul className="space-y-2">
                    {exp.description.map((point, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 mt-1.5" style={{color: customColors.primary}}>•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Education
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm font-medium mb-1" style={{color: customColors.secondary}}>{edu.institution}</p>
                  <p className="text-sm px-3 py-1 rounded-md inline-block" style={applyCustomStyles('badge')}>
                    {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Skills
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 rounded-md text-sm" style={applyCustomStyles('skill')}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Projects
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{project.name}</h4>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm px-2 py-1 rounded-md hover:underline" style={{color: customColors.primary}}>
                        <i className="fas fa-external-link-alt mr-1"></i> View
                      </a>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-2" style={{color: customColors.secondary}}>{project.period}</p>
                  <ul className="space-y-1 mb-2">
                    {project.description.map((point, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <span className="mr-2 mt-1" style={{color: customColors.primary}}>•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 rounded-md text-xs" style={{backgroundColor: customColors.accent + '30', color: customColors.secondary}}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Awards
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="space-y-4">
              {awards.map((award, index) => (
                <div key={index} className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
                  <h4 className="font-semibold">{award.title}</h4>
                  <p className="text-sm font-medium mb-1" style={{color: customColors.secondary}}>{award.issuer} • {award.year}</p>
                  <p className="text-sm">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-1 rounded-full mr-3" style={applyCustomStyles('divider')}></div>
              <h3 className="text-xl font-semibold tracking-wide" style={applyCustomStyles('accent')}>
                Additional Information
              </h3>
              <div className="flex-grow h-1 rounded-full ml-3" style={applyCustomStyles('divider')}></div>
            </div>
            
            <div className="space-y-4">
              {customFields.map((field, index) => (
                <div key={index} className="pl-4 border-l-4" style={{borderColor: customColors.primary}}>
                  <h4 className="font-semibold mb-1">{field.label}</h4>
                  <p className="text-sm">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Modern Template (Two Column) - Enhanced version
  const renderModernTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text }}>
      <div className="flex flex-col md:flex-row">
        {/* Left Column - 1/3 width */}
        <div className="md:w-2/5 p-6" style={{ backgroundColor: customColors.primary, color: '#fff' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
            <h2 className="text-lg mt-2 opacity-90">{personalInfo.title}</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 border-b border-white border-opacity-30 pb-2">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fas fa-envelope mr-2 w-5 text-center opacity-90"></i>
                <span className="text-sm">{personalInfo.email}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone mr-2 w-5 text-center opacity-90"></i>
                <span className="text-sm">{personalInfo.phone}</span>
              </div>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b border-white border-opacity-30 pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-md text-xs bg-white bg-opacity-20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b border-white border-opacity-30 pb-2">Education</h3>
              {education.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <h4 className="font-semibold text-sm">{edu.degree}</h4>
                  <p className="text-xs opacity-90">{edu.institution}</p>
                  <p className="text-xs opacity-90">{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - 3/5 width */}
        <div className="md:w-3/5 p-6" style={{ backgroundColor: customColors.background }}>
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1" style={{borderColor: customColors.primary + '40', color: customColors.primary}}>
              Professional Summary
            </h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {personalInfo.summary.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-1" style={{borderColor: customColors.primary + '40', color: customColors.primary}}>
                Work Experience
              </h3>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <span className="text-sm px-2 py-1 rounded-md" style={applyCustomStyles('badge')}>
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {exp.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-1" style={{borderColor: customColors.primary + '40', color: customColors.primary}}>
                Projects
              </h3>
              {projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{project.name}</h4>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm" style={{color: customColors.primary}}>
                        View Project
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{project.period}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {project.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 rounded-md text-xs" style={{backgroundColor: customColors.accent + '40', color: customColors.secondary}}>
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-1" style={{borderColor: customColors.primary + '40', color: customColors.primary}}>
                Awards & Achievements
              </h3>
              {awards.map((award, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-semibold">{award.title}</h4>
                  <p className="text-sm text-gray-600">{award.issuer} • {award.year}</p>
                  <p className="text-sm mt-1">{award.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && customFields.map((field, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-1" style={{borderColor: customColors.primary + '40', color: customColors.primary}}>
                {field.label}
              </h3>
              <p className="text-sm">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
          <ul className="list-disc list-inside space-y-2">
            {personalInfo.summary.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
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
                  <span className="text-xs px-2 py-1 rounded-md" style={applyCustomStyles('badge')}>
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {exp.description.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
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

        {/* Skills */}
        {skills.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              <i className="fas fa-tools mr-2"></i> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 rounded-md text-xs" style={applyCustomStyles('skill')}>
                  {skill}
                </span>
              ))}
            </div>
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
                <ul className="list-disc list-inside text-sm space-y-1">
                  {project.description.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-xs bg-gray-200 text-gray-700">
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

        {/* Custom Fields */}
        {customFields.length > 0 && customFields.map((field, index) => (
          <div key={index} className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
              {field.label}
            </h3>
            <p className="text-sm">{field.value}</p>
          </div>
        ))}
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

        <div className="border-t border-gray-300 pt-6">
          {/* Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>Summary</h3>
            <ul className="list-disc list-inside space-y-2">
              {personalInfo.summary.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                Experience
              </h3>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-5 last:mb-0">
                  <h4 className="font-semibold">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500 mb-1">{exp.period}</p>
                  <ul className="list-disc list-inside space-y-2">
                    {exp.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                Education
              </h3>
              {education.map((edu, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-md text-xs" style={applyCustomStyles('skill')}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                Projects
              </h3>
              {projects.map((project, index) => (
                <div key={index} className="mb-5 last:mb-0">
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.period}</p>
                  <ul className="list-disc list-inside space-y-2">
                    {project.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 rounded-md text-xs bg-gray-200 text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                Awards
              </h3>
              {awards.map((award, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-semibold">{award.title}</h4>
                  <p className="text-sm text-gray-600">{award.issuer}</p>
                  <p className="text-xs text-gray-500">{award.year}</p>
                  <p className="text-sm mt-1">{award.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && customFields.map((field, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                {field.label}
              </h3>
              <p className="text-sm">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="mb-6" style={{ width: '210mm', minHeight: '297mm' }}>
      {renderTemplate()}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;