// EditResumePage.tsx
import React from 'react';
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
    removeCustomField,
    handleFileUpload,
    sectionOrder,
    handleSectionReorder
  } = useResume();

  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow,
    trackResumeGeneration 
  } = useGoogleAnalytics();

  const handleSaveChanges = () => {
    trackButtonClick('save_changes', 'quick_actions', 'edit_page');
    trackResumeGeneration('manual_save', 'edit', 'saved');
    // Add your save logic here
    alert('Changes saved successfully!');
  };

  const handleSectionEdit = (sectionName: string) => {
    trackButtonClick(`edit_${sectionName.toLowerCase()}`, 'form_section', 'edit_page');
  };

  const handleFileUploadTracked = (fileData: any) => {
    handleFileUpload(fileData);
    trackButtonClick('file_upload', 'file_upload', 'edit_page');
  };

  return (
    <>
      <SEO
        title="Edit Resume - Update Your CV Information | CareerCraft"
        description="Update your resume information including personal details, work experience, education, skills, projects, and awards. Create the perfect CV for your job applications."
        keywords="edit resume, update CV, resume information, work experience, education details, skills update, project information, awards and achievements"
        canonicalUrl="https://careercraft.in/edit"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit Your Resume</h1>
              <p className="text-gray-600">Fill in your information below</p>
            </div>
            <Link
              to="/"
              onClick={() => {
                trackCTAClick('back_to_templates', 'header', 'edit_page');
                trackUserFlow('edit', 'builder', 'navigation');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Templates
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Resume Completion</h3>
              <span className="text-sm font-medium text-blue-600">
                {calculateCompletion(resumeData)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion(resumeData)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete all sections for the best resume results
            </p>
          </div>

          {/* Edit Form */}
          <div className="space-y-6">
            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('personal_info')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Personal Information
              </h2>
              <PersonalInfo 
                data={resumeData.personalInfo} 
                onChange={updatePersonalInfo}
              />
            </div>
            
            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('section_order')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Section Order
              </h2>
              <SectionOrderCustomizer 
                sections={sectionOrder}
                onReorder={handleSectionReorder}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('experience')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Work Experience
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.experiences.length} {resumeData.experiences.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>
              <Experience 
                experiences={resumeData.experiences}
                onUpdate={updateExperience}
                onAdd={addExperience}
                onRemove={removeExperience}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('education')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Education
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.education.length} {resumeData.education.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>
              <Education 
                education={resumeData.education}
                onUpdate={updateEducation}
                onAdd={addEducation}
                onRemove={removeEducation}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('projects')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                Projects
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.projects.length} {resumeData.projects.length === 1 ? 'project' : 'projects'}
                </span>
              </h2>
              <Projects
                projects={resumeData.projects}
                onUpdate={updateProject}
                onAdd={addProject}
                onRemove={removeProject}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('awards')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Awards & Achievements
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.awards.length} {resumeData.awards.length === 1 ? 'award' : 'awards'}
                </span>
              </h2>
              <Awards
                awards={resumeData.awards}
                onUpdate={updateAward}
                onAdd={addAward}
                onRemove={removeAward}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('skills')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Skills
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.skills.length} {resumeData.skills.length === 1 ? 'skill' : 'skills'}
                </span>
              </h2>
              <Skills 
                skills={resumeData.skills}
                onAdd={addSkill}
                onRemove={removeSkill}
                onUpdateProficiency={updateSkillProficiency}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('custom_fields')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Additional Information
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {resumeData.customFields.length} {resumeData.customFields.length === 1 ? 'field' : 'fields'}
                </span>
              </h2>
              <CustomFields
                customFields={resumeData.customFields}
                onUpdate={updateCustomField}
                onAdd={addCustomField}
                onRemove={removeCustomField}
                onChangeType={changeCustomFieldType}
              />
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleSectionEdit('file_upload')}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Import Resume
              </h2>
              <FileUpload 
                onUpload={handleFileUploadTracked}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-lg">Quick Actions</h3>
              <p className="text-blue-700 text-sm mb-4">
                Your resume is {calculateCompletion(resumeData)}% complete. Finish filling out all sections for the best results.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  onClick={() => {
                    trackCTAClick('view_ats_templates', 'quick_actions', 'edit_page');
                    trackUserFlow('edit', 'builder', 'navigation');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  View ATS Templates
                </Link>
                <Link
                  to="/premium"
                  onClick={() => {
                    trackCTAClick('view_premium_templates', 'quick_actions', 'edit_page');
                    trackUserFlow('edit', 'premium', 'navigation');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  View Premium Templates
                </Link>
                <button 
                  onClick={handleSaveChanges}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-3 text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-yellow-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Use action verbs to describe your achievements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Quantify your accomplishments with numbers</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Keep your resume to 1-2 pages maximum</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Tailor your resume for each job application</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Include relevant keywords from the job description</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Proofread for spelling and grammar errors</span>
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
    completedFields += 2; // At least one experience entry
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
    completedFields += 2; // At least one education entry
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