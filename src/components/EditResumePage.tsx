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

  return (
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Templates
          </Link>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          <PersonalInfo 
            data={resumeData.personalInfo} 
            onChange={updatePersonalInfo}
          />
          
          <SectionOrderCustomizer 
            sections={sectionOrder}
            onReorder={handleSectionReorder}
          />

          <Experience 
            experiences={resumeData.experiences}
            onUpdate={updateExperience}
            onAdd={addExperience}
            onRemove={removeExperience}
          />

          <Education 
            education={resumeData.education}
            onUpdate={updateEducation}
            onAdd={addEducation}
            onRemove={removeEducation}
          />

          <Projects
            projects={resumeData.projects}
            onUpdate={updateProject}
            onAdd={addProject}
            onRemove={removeProject}
          />

          <Awards
            awards={resumeData.awards}
            onUpdate={updateAward}
            onAdd={addAward}
            onRemove={removeAward}
          />

          <Skills 
            skills={resumeData.skills}
            onAdd={addSkill}
            onRemove={removeSkill}
            onUpdateProficiency={updateSkillProficiency}
          />

          <CustomFields
            customFields={resumeData.customFields}
            onUpdate={updateCustomField}
            onAdd={addCustomField}
            onRemove={removeCustomField}
            onChangeType={changeCustomFieldType}
          />

          <FileUpload 
            onUpload={handleFileUpload}
          />

          {/* Quick Actions */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 text-lg">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View ATS Templates
              </Link>
              <Link
                to="/premium"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Premium Templates
              </Link>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResumePage;