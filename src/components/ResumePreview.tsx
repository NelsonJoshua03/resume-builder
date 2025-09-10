import  { forwardRef } from 'react';
import { ResumePreviewProps } from './types';

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, template, customColors }, ref) => {
  const { personalInfo, experiences, education, skills } = data;

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
        styles.backgroundColor = customColors.accent;
        break;
      case 'badge':
        styles.backgroundColor = customColors.accent;
        styles.color = customColors.primary;
        break;
      case 'skill':
        styles.backgroundColor = customColors.accent;
        styles.color = customColors.secondary;
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
        return renderTwoColumnTemplate();
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
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text }}>
      {/* Header */}
      <div className="p-6 text-center" style={applyCustomStyles('header')}>
        <h1 className="text-3xl font-bold" style={{ color: '#fff' }}>{personalInfo.name}</h1>
        <h2 className="text-xl mt-2" style={{ color: '#fff' }}>{personalInfo.title}</h2>
        <div className="flex justify-center space-x-4 mt-3 text-sm" style={{ color: '#fff' }}>
          <span><i className="fas fa-envelope mr-1"></i> {personalInfo.email}</span>
          <span><i className="fas fa-phone mr-1"></i> {personalInfo.phone}</span>
        </div>
      </div>

      <div className="p-6" style={{ backgroundColor: customColors.background }}>
        {/* Summary */}
        <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
          <h3 className="text-lg font-semibold mb-2" style={applyCustomStyles('accent')}>
            Professional Summary
          </h3>
          <p className="text-sm">{personalInfo.summary}</p>
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="p-4 rounded-lg mb-6" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3" style={applyCustomStyles('accent')}>
              Work Experience
            </h3>
            {experiences.map((exp, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{exp.title}</h4>
                  <span className="text-sm px-2 py-1 rounded" style={applyCustomStyles('badge')}>
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
            <h3 className="text-lg font-semibold mb-3" style={applyCustomStyles('accent')}>
              Education
            </h3>
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start mb-3 last:mb-0">
                <div>
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <span className="text-sm px-2 py-1 rounded" style={applyCustomStyles('badge')}>
                  {edu.year}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="p-4 rounded-lg" style={applyCustomStyles('section')}>
            <h3 className="text-lg font-semibold mb-3" style={applyCustomStyles('accent')}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-sm" style={applyCustomStyles('skill')}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Modern Template (Two Column)
  const renderTwoColumnTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text }}>
      <div className="flex flex-col md:flex-row">
        {/* Left Column - 1/3 width */}
        <div className="md:w-1/3 p-6" style={{ backgroundColor: customColors.primary, color: '#fff' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
            <h2 className="text-lg mt-2 opacity-90">{personalInfo.title}</h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 border-b border-teal-500 pb-1">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fas fa-envelope mr-2 w-5 text-center"></i>
                <span className="text-sm">{personalInfo.email}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone mr-2 w-5 text-center"></i>
                <span className="text-sm">{personalInfo.phone}</span>
              </div>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b border-teal-500 pb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs" style={applyCustomStyles('skill')}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - 2/3 width */}
        <div className="md:w-2/3 p-6" style={{ backgroundColor: customColors.background }}>
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b border-teal-200 pb-1" style={applyCustomStyles('accent')}>
              Professional Summary
            </h3>
            <p className="text-sm">{personalInfo.summary}</p>
          </div>

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b border-teal-200 pb-1" style={applyCustomStyles('accent')}>
                Work Experience
              </h3>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <span className="text-sm px-2 py-1 rounded" style={applyCustomStyles('badge')}>
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
            <div>
              <h3 className="text-lg font-semibold mb-3 border-b border-teal-200 pb-1" style={applyCustomStyles('accent')}>
                Education
              </h3>
              {education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm" style={applyCustomStyles('accent')}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Creative Template
  const renderCreativeTemplate = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${template.background}`} style={{ color: customColors.text }}>
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

      <div className="pt-16 px-6 pb-6" style={{ backgroundColor: customColors.background }}>
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
          <h2 className="text-lg" style={applyCustomStyles('accent')}>{personalInfo.title}</h2>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <span><i className="fas fa-envelope mr-1"></i> {personalInfo.email}</span>
            <span><i className="fas fa-phone mr-1"></i> {personalInfo.phone}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg mb-6 mt-4" style={applyCustomStyles('section')}>
          <h3 className="text-lg font-semibold mb-2 flex items-center" style={applyCustomStyles('accent')}>
            <i className="fas fa-star mr-2"></i> Professional Summary
          </h3>
          <p className="text-sm">{personalInfo.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience */}
          {experiences.length > 0 && (
            <div className="p-4 rounded-lg" style={applyCustomStyles('section')}>
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
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {exp.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education & Skills */}
          <div>
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

            {skills.length > 0 && (
              <div className="p-4 rounded-lg" style={applyCustomStyles('section')}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={applyCustomStyles('accent')}>
                  <i className="fas fa-tools mr-2"></i> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 rounded-full text-xs" style={applyCustomStyles('skill')}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Minimalist Template
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
            <p className="text-gray-600">{personalInfo.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Experience */}
            {experiences.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                  Experience
                </h3>
                {experiences.map((exp, index) => (
                  <div key={index} className="mb-5 last:mb-0">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mb-1">{exp.period}</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {exp.description.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education & Skills */}
            <div>
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

              {skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1" style={applyCustomStyles('accent')}>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 rounded text-xs" style={applyCustomStyles('skill')}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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