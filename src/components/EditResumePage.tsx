// EditResumePage.tsx - OPTIMIZED WITH COMPLETE MOBILE NAVIGATION
import React, { useEffect, useState } from 'react';
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
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

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
    trackPageView 
  } = useGoogleAnalytics();

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Edit Resume', '/edit');
  }, [trackPageView]);

  const handleSaveChanges = () => {
    trackButtonClick('save_changes', 'quick_actions', 'edit_page');
    trackResumeGeneration('manual_save', 'edit', 'saved');
    
    alert('Changes saved successfully!');
  };

  const handleSectionEdit = (sectionName: string, sectionId: string) => {
    setActiveSection(sectionId);
    trackButtonClick(`edit_${sectionName.toLowerCase()}`, 'form_section', 'edit_page');
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleFileUploadTracked = (fileData: any) => {
    handleFileUpload(fileData);
    trackButtonClick('file_upload', 'file_upload', 'edit_page');
  };

  const sectionList = [
    { id: 'personal', name: 'Personal', icon: '👤', color: 'text-blue-500' },
    { id: 'experience', name: 'Experience', icon: '💼', color: 'text-green-500' },
    { id: 'education', name: 'Education', icon: '🎓', color: 'text-orange-500' },
    { id: 'projects', name: 'Projects', icon: '📁', color: 'text-teal-500' },
    { id: 'skills', name: 'Skills', icon: '⚡', color: 'text-red-500' },
    { id: 'awards', name: 'Awards', icon: '🏆', color: 'text-yellow-500' },
    { id: 'custom', name: 'Additional', icon: '➕', color: 'text-indigo-500' },
    { id: 'order', name: 'Reorder', icon: '↕️', color: 'text-purple-500' },
    { id: 'import', name: 'Import', icon: '📥', color: 'text-pink-500' },
  ];

  const getSectionTitle = (sectionId: string) => {
    const section = sectionList.find(s => s.id === sectionId);
    return section ? section.name : 'Section';
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
                <button
                  onClick={() => setShowAllSections(!showAllSections)}
                  className="bg-purple-600 text-white p-2 rounded-lg"
                  title="Jump to Section"
                >
                  ⚡
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  {isMobileMenuOpen ? '✕' : '☰'}
                </button>
              </div>
            </div>
          </div>

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
                      <span className="font-medium">{section.name}</span>
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

// Helper function to calculate completion percentage
const calculateCompletion = (resumeData: any): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info
  const personalInfoFields = ['fullName', 'email', 'phone', 'title'];
  totalFields += personalInfoFields.length;
  completedFields += personalInfoFields.filter(field => 
    resumeData.personalInfo[field] && resumeData.personalInfo[field].trim() !== ''
  ).length;

  // Experience
  if (resumeData.experiences.length > 0) {
    completedFields += 2;
    resumeData.experiences.forEach((exp: any) => {
      const expFields = ['company', 'position', 'startDate'];
      totalFields += expFields.length;
      completedFields += expFields.filter(field => 
        exp[field] && exp[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Education
  if (resumeData.education.length > 0) {
    completedFields += 2;
    resumeData.education.forEach((edu: any) => {
      const eduFields = ['institution', 'degree', 'graduationYear'];
      totalFields += eduFields.length;
      completedFields += eduFields.filter(field => 
        edu[field] && edu[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Skills
  if (resumeData.skills.length > 0) {
    completedFields += 2;
    totalFields += 2;
  } else {
    totalFields += 2;
  }

  // Projects
  if (resumeData.projects.length > 0) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  return Math.round((completedFields / totalFields) * 100);
};

export default EditResumePage;