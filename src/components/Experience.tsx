import { useState } from 'react';
import { ExperienceProps } from './types';

const Experience = ({ experiences, onUpdate, onAdd, onRemove, template }: ExperienceProps) => {
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);

  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const toggleExpand = (id: number) => {
    if (expandedExperience === id) {
      setExpandedExperience(null);
    } else {
      setExpandedExperience(id);
    }
  };

  const addExperience = () => {
    const newId = onAdd();
    setTimeout(() => {
      const newExpInput = document.getElementById(`exp-title-${newId}`);
      if (newExpInput) {
        newExpInput.focus();
      }
    }, 100);
  };

  const addBulletPoint = (expId: number) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience) {
      const updatedBullets = [...experience.description, ''];
      onUpdate(expId, 'description', updatedBullets);
    }
  };

  const updateBulletPoint = (expId: number, index: number, value: string) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience) {
      const updatedBullets = [...experience.description];
      updatedBullets[index] = value;
      onUpdate(expId, 'description', updatedBullets);
    }
  };

  const removeBulletPoint = (expId: number, index: number) => {
    const experience = experiences.find(exp => exp.id === expId);
    if (experience && experience.description.length > 1) {
      const updatedBullets = experience.description.filter((_, i) => i !== index);
      onUpdate(expId, 'description', updatedBullets);
    }
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center`}>
          <i className="fas fa-briefcase mr-2 text-blue-500"></i> Work Experience
        </h2>
        <button
          onClick={addExperience}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+ Add Experience</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
            <div className="flex justify-between items-start mb-3">
              <input
                id={`exp-title-${exp.id}`}
                type="text"
                placeholder="Job Title"
                value={exp.title}
                onChange={(e) => onUpdate(exp.id, 'title', e.target.value)}
                className={`w-full text-lg font-semibold p-2 border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              <div className="flex space-x-2 ml-4">
                <button 
                  className="text-blue-500 hover:text-blue-700 p-2"
                  onClick={() => toggleExpand(exp.id)}
                  title={expandedExperience === exp.id ? "Collapse" : "Expand"}
                >
                  <i className={`fas ${expandedExperience === exp.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {index > 0 && (
                  <button 
                    className="text-red-500 hover:text-red-700 p-2"
                    onClick={() => onRemove(exp.id)}
                    title="Remove Experience"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2020 - Present"
                  value={exp.period}
                  onChange={(e) => onUpdate(exp.id, 'period', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities & Achievements
              </label>
              {exp.description.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2 mb-2">
                  <span className="mt-2 text-gray-500">•</span>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={item}
                    onChange={(e) => updateBulletPoint(exp.id, itemIndex, e.target.value)}
                    rows={2}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-vertical"
                  />
                  {exp.description.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(exp.id, itemIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded self-start mt-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBulletPoint(exp.id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                + Add Responsibility
              </button>
            </div>
          </div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No work experience added yet.</p>
          <p className="text-sm">Click "Add Experience" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Experience;