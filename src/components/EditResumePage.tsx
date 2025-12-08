// EditResumePage.tsx - OPTIMIZED WITH COMPLETE MOBILE NAVIGATION
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from './ResumeContext';
import PersonalInfo from './PersonalInfo';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Projects from './Projects';
import Awards from './Awards';
import CustomFields from './CustomFields';
import FileUpload from './FileUpload';
import SectionOrderCustomizer from './SectionOrderCustomizer';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { PersonalInfoData } from './types'; // Import the type

const EditResumePage = () => {
  const {
    resumeData,
    sectionOrder,
    handleSectionReorder,
    handleFileUpload,
    updatePersonalInfo,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    addSkill,
    removeSkill,
    updateSkillProficiency,
    updateProject,
    addProject,
    removeProject,
    updateAward,
    addAward,
    removeAward,
    updateCustomField,
    changeCustomFieldType,
    addCustomField,
    removeCustomField
  } = useResume();

  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow,
    trackResumeGeneration,
    trackPageView,
    trackEvent 
  } = useGoogleAnalytics();

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [showSectionPrompts, setShowSectionPrompts] = useState(false);
  const [fieldEditStartTime, setFieldEditStartTime] = useState<Record<string, number>>({});
  const [_totalEditTime, setTotalEditTime] = useState<number>(0);
  const pageEnterTime = useRef<number>(Date.now());
  const lastSectionSwitchTime = useRef<number>(Date.now());

  // Track page view on mount
  useEffect(() => {
    trackPageView('Edit Resume', '/edit');
    
    // Track entry to edit page
    trackEvent('resume_funnel', {
      step: 'edit_page_entered',
      event_category: 'Conversion Funnel',
      event_label: 'edit_page_entered'
    });
    
    // Track completion status on page entry
    const completion = calculateCompletion(resumeData);
    trackEvent('edit_session_start', {
      initial_completion: completion,
      sections_completed: getCompletedSectionsCount(resumeData),
      event_category: 'User Data Entry',
      event_label: `edit_start_${completion}%`
    });
    
    return () => {
      // Track session duration when leaving page
      const timeSpent = Math.round((Date.now() - pageEnterTime.current) / 1000);
      setTotalEditTime(timeSpent);
      
      trackEvent('edit_session_end', {
        seconds_spent: timeSpent,
        final_completion: calculateCompletion(resumeData),
        sections_edited: Object.keys(fieldEditStartTime).length,
        event_category: 'User Engagement',
        event_label: `edit_session_${timeSpent}s`
      });
    };
  }, [trackPageView, trackEvent]);

  // Track section switching
  useEffect(() => {
    const trackSectionSwitch = () => {
      const timeSpentInSection = Math.round((Date.now() - lastSectionSwitchTime.current) / 1000);
      if (timeSpentInSection > 5) { // Only track if spent more than 5 seconds
        trackEvent('section_engagement', {
          section_id: activeSection,
          time_spent_seconds: timeSpentInSection,
          completion: getSectionCompletion(activeSection),
          event_category: 'User Data Entry',
          event_label: `${activeSection}_${timeSpentInSection}s`
        });
      }
      lastSectionSwitchTime.current = Date.now();
    };

    return () => {
      trackSectionSwitch();
    };
  }, [activeSection, trackEvent]);

  // Check if personal info is filled to show section prompts
  useEffect(() => {
    const isPersonalFilled = checkPersonalInfoFilled(resumeData.personalInfo);
    setShowSectionPrompts(isPersonalFilled);
  }, [resumeData.personalInfo]);

  const handleSaveChanges = () => {
    // Track each section's completion on save
    const sectionsToTrack = ['personal', 'experience', 'education', 'skills', 'projects', 'awards', 'custom'];
    sectionsToTrack.forEach(sectionId => {
      const completion = getSectionCompletion(sectionId);
      trackSectionCompletion(sectionId, completion);
    });
    
    trackButtonClick('save_changes', 'quick_actions', 'edit_page');
    trackResumeGeneration('manual_save', 'edit', 'saved');
    
    // Track overall save event
    trackEvent('resume_saved', {
      total_completion: calculateCompletion(resumeData),
      sections_completed: getCompletedSectionsCount(resumeData),
      time_spent_seconds: Math.round((Date.now() - pageEnterTime.current) / 1000),
      event_category: 'User Data Entry',
      event_label: `resume_saved_${calculateCompletion(resumeData)}%`
    });
    
    alert('Changes saved successfully!');
  };

  const handleSectionEdit = (sectionName: string, sectionId: string) => {
    // Track completion of current section before switching
    if (activeSection !== sectionId) {
      const completion = getSectionCompletion(activeSection);
      trackSectionCompletion(activeSection, completion);
      
      // Track section switch
      trackEvent('section_switch', {
        from_section: activeSection,
        to_section: sectionId,
        from_completion: completion,
        to_completion: getSectionCompletion(sectionId),
        event_category: 'User Navigation',
        event_label: `${activeSection}_to_${sectionId}`
      });
    }
    
    setActiveSection(sectionId);
    trackButtonClick(`edit_${sectionName.toLowerCase()}`, 'form_section', 'edit_page');
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
    
    // Update last section switch time
    lastSectionSwitchTime.current = Date.now();
  };

  // Track field interactions
  const trackFieldInteraction = (fieldName: string, action: 'focus' | 'blur' | 'change', sectionId: string) => {
    if (action === 'focus') {
      setFieldEditStartTime(prev => ({ ...prev, [fieldName]: Date.now() }));
    } else if (action === 'blur' && fieldEditStartTime[fieldName]) {
      const timeSpent = Date.now() - fieldEditStartTime[fieldName];
      if (timeSpent > 1000) { // Only track if spent more than 1 second
        trackEvent('field_engagement', {
          field_name: fieldName,
          section_id: sectionId,
          time_spent_ms: timeSpent,
          event_category: 'Form Engagement',
          event_label: `${sectionId}_${fieldName}`
        });
      }
    }
    
    trackEvent('field_interaction', {
      field_name: fieldName,
      action: action,
      section_id: sectionId,
      event_category: 'Form Engagement',
      event_label: fieldName
    });
  };

  // Track section completion
  const trackSectionCompletion = (sectionId: string, completion: number) => {
    trackEvent('section_completion', {
      section_id: sectionId,
      completion_percentage: completion,
      event_category: 'User Data Entry',
      event_label: `${sectionId}_${completion}%`
    });
    
    // If section is completed (100%), track milestone
    if (completion === 100) {
      trackEvent('section_completed', {
        section_id: sectionId,
        event_category: 'Milestones',
        event_label: `${sectionId}_completed`
      });
    }
  };

  const handleFileUploadTracked = (fileData: any) => {
    handleFileUpload(fileData);
    trackButtonClick('file_upload', 'file_upload', 'edit_page');
    
    // Track file upload event
    trackEvent('resume_uploaded', {
      file_type: 'resume/cv',
      has_data: !!fileData,
      event_category: 'User Data Entry',
      event_label: 'resume_uploaded'
    });
  };

  const sectionList = [
    { id: 'personal', name: 'Personal', icon: '👤', color: 'text-blue-500', description: 'Basic information' },
    { id: 'experience', name: 'Experience', icon: '💼', color: 'text-green-500', description: 'Work history' },
    { id: 'education', name: 'Education', icon: '🎓', color: 'text-orange-500', description: 'Academic background' },
    { id: 'skills', name: 'Skills', icon: '⚡', color: 'text-red-500', description: 'Technical & soft skills' },
    { id: 'projects', name: 'Projects', icon: '📁', color: 'text-teal-500', description: 'Key projects' },
    { id: 'awards', name: 'Awards', icon: '🏆', color: 'text-yellow-500', description: 'Achievements' },
    { id: 'custom', name: 'Additional', icon: '➕', color: 'text-indigo-500', description: 'Extra sections' },
    { id: 'order', name: 'Reorder', icon: '↕️', color: 'text-purple-500', description: 'Layout order' },
    { id: 'import', name: 'Import', icon: '📥', color: 'text-pink-500', description: 'Upload resume' },
  ];

  const getSectionTitle = (sectionId: string) => {
    const section = sectionList.find(s => s.id === sectionId);
    return section ? section.name : 'Section';
  };

  // Check completion status of each section
  const getSectionCompletion = (sectionId: string) => {
    switch(sectionId) {
      case 'personal':
        const personalFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
        const filledPersonal = personalFields.filter(field => {
          const value = resumeData.personalInfo[field];
          // Handle both string and string[] types
          if (Array.isArray(value)) {
            return value.length > 0 && value[0] !== '';
          }
          return value && value.toString().trim() !== '';
        }).length;
        return Math.round((filledPersonal / personalFields.length) * 100);
      
      case 'experience':
        if (resumeData.experiences.length === 0) return 0;
        const filledExperiences = resumeData.experiences.filter(exp => 
          exp.title && exp.title.trim() !== '' && exp.company && exp.company.trim() !== ''
        ).length;
        return Math.round((filledExperiences / resumeData.experiences.length) * 100);
      
      case 'education':
        if (resumeData.education.length === 0) return 0;
        const filledEducation = resumeData.education.filter(edu => 
          edu.degree && edu.degree.trim() !== '' && edu.institution && edu.institution.trim() !== ''
        ).length;
        return Math.round((filledEducation / resumeData.education.length) * 100);
      
      case 'skills':
        return resumeData.skills.length >= 3 ? 100 : Math.round((resumeData.skills.length / 3) * 100);
      
      case 'projects':
        return resumeData.projects.length > 0 ? 100 : 0;
      
      case 'awards':
        return resumeData.awards.length > 0 ? 100 : 0;
      
      case 'custom':
        return resumeData.customFields.length > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  return (
    <>
      <SEO
        title="Edit Resume - Update Your CV Information | CareerCraft"
        description="Update your resume information including personal details, work experience, education, skills, projects, and awards. Create the perfect CV for your job applications."
        keywords="edit resume, update CV, resume information, work experience, education details, skills update, project information, awards and achievements"
        canonicalUrl="https://careercraft.in/edit"
      />
      
      <div className="min-h-screen bg-gray-50 py-2 md:py-6">
        <div className="container mx-auto px-2 md:px-4 max-w-6xl">
          {/* Mobile Header */}
          <div className="md:hidden mb-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <h1 className="text-lg font-bold text-gray-800">Edit Resume</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-medium ${sectionList.find(s => s.id === activeSection)?.color}`}>
                    {getSectionTitle(activeSection)}
                  </span>
                  <span className="text-xs text-gray-500">• {calculateCompletion(resumeData)}% Complete</span>
                </div>
              </div>
              <div className="flex gap-2">
                {showSectionPrompts && (
                  <button
                    onClick={() => setShowAllSections(!showAllSections)}
                    className="bg-purple-600 text-white p-2 rounded-lg"
                    title="Jump to Section"
                  >
                    ⚡
                  </button>
                )}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  {isMobileMenuOpen ? '✕' : '☰'}
                </button>
              </div>
            </div>
          </div>

          {/* PROACTIVE SECTION PROMPTS - Mobile */}
          {showSectionPrompts && (
            <div className="md:hidden mb-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 text-sm">🚀 Next Steps to Complete Your Resume</h3>
                <div className="grid grid-cols-3 gap-1">
                  {sectionList.filter(s => s.id !== 'personal').slice(0, 6).map(section => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionEdit(section.id, section.id)}
                      className="flex flex-col items-center p-2 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                    >
                      <span className={`text-lg ${section.color} mb-1`}>{section.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{section.name}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${getSectionCompletion(section.id) === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${getSectionCompletion(section.id)}%` }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mb-3 bg-white rounded-lg shadow-lg p-3">
              <div className="grid grid-cols-3 gap-2">
                {sectionList.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionEdit(section.id, section.id)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                      activeSection === section.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-lg mb-1 ${section.color}`}>{section.icon}</span>
                    <span className="text-xs font-medium">{section.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/builder"
                  onClick={() => trackCTAClick('mobile_view_templates', 'mobile_menu', 'edit_page')}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs text-center"
                >
                  View Templates
                </Link>
                <button 
                  onClick={handleSaveChanges}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Your Resume</h1>
              <p className="text-gray-600">Fill in your information below</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/builder"
                onClick={() => {
                  trackCTAClick('back_to_templates', 'header', 'edit_page');
                  trackUserFlow('edit', 'builder', 'navigation');
                  // Track funnel step
                  trackEvent('resume_funnel', {
                    step: 'back_to_builder',
                    event_category: 'Conversion Funnel',
                    event_label: 'back_to_builder'
                  });
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Templates
              </Link>
              <button 
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-1">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Resume Completion</h3>
                <p className="text-gray-500 text-xs mt-0.5">Complete all sections for the best results</p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 sm:mt-0">
                {calculateCompletion(resumeData)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion(resumeData)}%` }}
              ></div>
            </div>
          </div>

          {/* PROACTIVE SECTION PROMPTS - Desktop */}
          {showSectionPrompts && (
            <div className="hidden md:block mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 text-lg">🚀 Complete Your Resume - Next Steps</h3>
                <div className="grid grid-cols-7 gap-2">
                  {sectionList.filter(s => s.id !== 'personal' && s.id !== 'order' && s.id !== 'import').map(section => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionEdit(section.id, section.id)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105 ${
                        getSectionCompletion(section.id) === 100 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-white border border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`text-2xl ${section.color} mb-2`}>{section.icon}</span>
                      <span className="font-medium text-gray-800 text-sm">{section.name}</span>
                      <span className="text-xs text-gray-600 mt-1">{section.description}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className={`h-1.5 rounded-full ${
                            getSectionCompletion(section.id) === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${getSectionCompletion(section.id)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1 font-medium">
                        {getSectionCompletion(section.id) === 100 ? '✓ Complete' : `${getSectionCompletion(section.id)}%`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
                <h3 className="font-semibold text-gray-800 mb-3">Jump to Section</h3>
                <div className="space-y-1">
                  {sectionList.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionEdit(section.id, section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-base ${section.color}`}>{section.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{section.name}</span>
                          {section.id !== 'personal' && section.id !== 'order' && section.id !== 'import' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              getSectionCompletion(section.id) === 100 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {getSectionCompletion(section.id)}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      to="/builder"
                      className="w-full bg-blue-600 text-white px-3 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      View Templates
                    </Link>
                    <button 
                      onClick={handleSaveChanges}
                      className="w-full bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              {/* Mobile: Show Jump to Section when toggled */}
              {(showAllSections || window.innerWidth >= 768) && (
                <div className="mb-4 md:hidden">
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">Jump to Section</h3>
                      <button
                        onClick={() => setShowAllSections(false)}
                        className="text-gray-500 text-sm"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sectionList.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionEdit(section.id, section.id)}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                            activeSection === section.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-base mb-1 ${section.color}`}>{section.icon}</span>
                          <span className="text-xs font-medium">{section.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Show only active section */}
              <div className="lg:hidden">
                {activeSection === 'personal' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-blue-500">👤</span>
                      Personal Information
                    </h2>
                    <PersonalInfo 
                      data={resumeData.personalInfo} 
                      onChange={updatePersonalInfo}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'personal')}
                    />
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-green-500">💼</span>
                        Work Experience
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.experiences.length}
                      </span>
                    </div>
                    <Experience 
                      experiences={resumeData.experiences}
                      onUpdate={updateExperience}
                      onAdd={addExperience}
                      onRemove={removeExperience}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'experience')}
                    />
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-orange-500">🎓</span>
                        Education
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.education.length}
                      </span>
                    </div>
                    <Education 
                      education={resumeData.education}
                      onUpdate={updateEducation}
                      onAdd={addEducation}
                      onRemove={removeEducation}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'education')}
                    />
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-teal-500">📁</span>
                        Projects
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.projects.length}
                      </span>
                    </div>
                    <Projects
                      projects={resumeData.projects}
                      onUpdate={updateProject}
                      onAdd={addProject}
                      onRemove={removeProject}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'projects')}
                    />
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-red-500">⚡</span>
                        Skills
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.skills.length}
                      </span>
                    </div>
                    <Skills 
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdateProficiency={updateSkillProficiency}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'skills')}
                    />
                  </div>
                )}

                {activeSection === 'awards' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-yellow-500">🏆</span>
                        Awards & Achievements
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.awards.length}
                      </span>
                    </div>
                    <Awards
                      awards={resumeData.awards}
                      onUpdate={updateAward}
                      onAdd={addAward}
                      onRemove={removeAward}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'awards')}
                    />
                  </div>
                )}

                {activeSection === 'custom' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-indigo-500">➕</span>
                        Additional Information
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.customFields.length}
                      </span>
                    </div>
                    <CustomFields
                      customFields={resumeData.customFields}
                      onUpdate={updateCustomField}
                      onAdd={addCustomField}
                      onRemove={removeCustomField}
                      onChangeType={changeCustomFieldType}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'custom')}
                    />
                  </div>
                )}

                {activeSection === 'order' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-purple-500">↕️</span>
                        Section Order & Reordering
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {sectionOrder.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Drag and drop sections to reorder your resume layout</p>
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={handleSectionReorder}
                    />
                  </div>
                )}

                {activeSection === 'import' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-pink-500">📥</span>
                      Import Resume
                    </h2>
                    <FileUpload 
                      onUpload={handleFileUploadTracked}
                    />
                  </div>
                )}

                {/* Quick Actions for Mobile */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">Need Help?</h3>
                  <p className="text-xs text-blue-700 mb-2">Complete your information and view templates</p>
                  <button
                    onClick={() => setShowAllSections(true)}
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-xs text-center mb-2"
                  >
                    ⚡ Jump to Another Section
                  </button>
                  <div className="flex gap-2">
                    <Link
                      to="/builder"
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs text-center"
                    >
                      View Templates
                    </Link>
                    <button 
                      onClick={handleSaveChanges}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs"
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop: Show all sections */}
              <div className="hidden lg:block space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-blue-500">👤</span>
                    Personal Information
                  </h2>
                  <PersonalInfo 
                    data={resumeData.personalInfo} 
                    onChange={updatePersonalInfo}
                    onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'personal')}
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-green-500">💼</span>
                      Work Experience
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {resumeData.experiences.length} entries
                    </span>
                  </div>
                  <Experience 
                    experiences={resumeData.experiences}
                    onUpdate={updateExperience}
                    onAdd={addExperience}
                    onRemove={removeExperience}
                    onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'experience')}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-orange-500">🎓</span>
                      Education
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {resumeData.education.length} entries
                    </span>
                  </div>
                  <Education 
                    education={resumeData.education}
                    onUpdate={updateEducation}
                    onAdd={addEducation}
                    onRemove={removeEducation}
                    onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'education')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-teal-500">📁</span>
                        Projects
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.projects.length}
                      </span>
                    </div>
                    <Projects
                      projects={resumeData.projects}
                      onUpdate={updateProject}
                      onAdd={addProject}
                      onRemove={removeProject}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'projects')}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-red-500">⚡</span>
                        Skills
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.skills.length}
                      </span>
                    </div>
                    <Skills 
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdateProficiency={updateSkillProficiency}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'skills')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-yellow-500">🏆</span>
                        Awards & Achievements
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.awards.length}
                      </span>
                    </div>
                    <Awards
                      awards={resumeData.awards}
                      onUpdate={updateAward}
                      onAdd={addAward}
                      onRemove={removeAward}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'awards')}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-indigo-500">➕</span>
                        Additional Information
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.customFields.length}
                      </span>
                    </div>
                    <CustomFields
                      customFields={resumeData.customFields}
                      onUpdate={updateCustomField}
                      onAdd={addCustomField}
                      onRemove={removeCustomField}
                      onChangeType={changeCustomFieldType}
                      onFieldInteraction={(fieldName, action) => trackFieldInteraction(fieldName, action, 'custom')}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-purple-500">↕️</span>
                      Section Order & Reordering
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sectionOrder.length} sections
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Drag and drop sections to customize the order of your resume layout</p>
                  <SectionOrderCustomizer 
                    sections={sectionOrder}
                    onReorder={handleSectionReorder}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-pink-500">📥</span>
                    Import Resume
                  </h2>
                  <FileUpload 
                    onUpload={handleFileUploadTracked}
                  />
                </div>
              </div>

              {/* Tips & Actions - Bottom Section */}
              <div className="mt-4 md:mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">💡 Pro Tips</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Use action verbs to describe achievements</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Quantify results with numbers</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Tailor keywords to job description</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Keep resume to 1-2 pages maximum</span>
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/builder"
                    onClick={() => {
                      trackCTAClick('view_ats_templates', 'quick_actions', 'edit_page');
                      trackUserFlow('edit', 'builder', 'navigation');
                      // Track completion status when going back to builder
                      trackEvent('edit_to_builder', {
                        completion: calculateCompletion(resumeData),
                        sections_completed: getCompletedSectionsCount(resumeData),
                        time_spent_seconds: Math.round((Date.now() - pageEnterTime.current) / 1000),
                        event_category: 'Conversion Funnel',
                        event_label: `edit_completed_${calculateCompletion(resumeData)}%`
                      });
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    View ATS Templates
                  </Link>
                  <Link
                    to="/premium"
                    onClick={() => {
                      trackCTAClick('view_premium_templates', 'quick_actions', 'edit_page');
                      trackUserFlow('edit', 'premium', 'navigation');
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    View Premium Templates
                  </Link>
                  <button 
                    onClick={handleSaveChanges}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to check if personal info is filled
const checkPersonalInfoFilled = (personalInfo: PersonalInfoData): boolean => {
  const requiredFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
  return requiredFields.every(field => {
    const value = personalInfo[field];
    // Handle both string and string[] types
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  });
};

// Helper function to calculate completion percentage
const calculateCompletion = (resumeData: any): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info - FIXED: Use proper typing and handle string/string[]
  const personalInfoFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
  totalFields += personalInfoFields.length;
  completedFields += personalInfoFields.filter(field => {
    const value = resumeData.personalInfo[field];
    // Handle both string and string[] types
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  }).length;

  // Experience (at least one entry with title and company)
  if (resumeData.experiences.length > 0) {
    completedFields += 2;
    resumeData.experiences.forEach((exp: any) => {
      const expFields = ['company', 'title'];
      totalFields += expFields.length;
      completedFields += expFields.filter(field => 
        exp[field] && exp[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Education (at least one entry)
  if (resumeData.education.length > 0) {
    completedFields += 2;
    resumeData.education.forEach((edu: any) => {
      const eduFields = ['institution', 'degree'];
      totalFields += eduFields.length;
      completedFields += eduFields.filter(field => 
        edu[field] && edu[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Skills (at least 3 skills)
  if (resumeData.skills.length >= 3) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  // Summary (at least one summary point)
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Helper function to count completed sections
const getCompletedSectionsCount = (resumeData: any): number => {
  let completedSections = 0;
  
  // Personal Info (name, email, phone, title)
  const hasPersonalInfo = ['name', 'email', 'phone', 'title'].every(field => {
    const value = resumeData.personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  });
  if (hasPersonalInfo) completedSections++;
  
  // Experience (at least one entry)
  if (resumeData.experiences.length > 0) completedSections++;
  
  // Education (at least one entry)
  if (resumeData.education.length > 0) completedSections++;
  
  // Skills (at least 3 skills)
  if (resumeData.skills.length >= 3) completedSections++;
  
  // Projects (at least one project)
  if (resumeData.projects.length > 0) completedSections++;
  
  // Awards (at least one award)
  if (resumeData.awards.length > 0) completedSections++;
  
  // Summary (at least one summary point)
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) completedSections++;
  
  return completedSections;
};

export default EditResumePage;