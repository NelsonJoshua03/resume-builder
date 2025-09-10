import  { useState } from 'react';
import { ExperienceProps } from './types';


const Experience = ({ experiences, onUpdate, onAdd, onRemove }: ExperienceProps) => {
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    if (expandedExperience === id) {
      setExpandedExperience(null);
    } else {
      setExpandedExperience(id);
    }
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-briefcase mr-2 text-blue-500"></i> Work Experience
      </h2>
      
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Experience #{index + 1}</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => toggleExpand(exp.id)}
                  title={expandedExperience === exp.id ? "Collapse" : "Expand"}
                >
                  <i className={`fas ${expandedExperience === exp.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {index > 0 && (
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onRemove(exp.id)}
                    title="Remove Experience"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Job Title"
                value={exp.title}
                onChange={(e) => onUpdate(exp.id, 'title', e.target.value)}
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Company"
                value={exp.company}
                onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Period (e.g., 2020 - Present)"
                value={exp.period}
                onChange={(e) => onUpdate(exp.id, 'period', e.target.value)}
              />
            </div>
            
            {/* Always show the first bullet point input */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Responsibilities & Achievements</h4>
              <div className="space-y-2">
                {exp.description.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start">
                    <span className="mt-2 mr-2 text-gray-500">•</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Describe a responsibility or achievement"
                      value={bullet}
                      onChange={(e) => updateBulletPoint(exp.id, bulletIndex, e.target.value)}
                    />
                    {exp.description.length > 1 && (
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700 mt-2"
                        onClick={() => removeBulletPoint(exp.id, bulletIndex)}
                        title="Remove this bullet point"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
                  onClick={() => addBulletPoint(exp.id)}
                >
                  <i className="fas fa-plus-circle mr-1"></i> Add Another Point
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          onClick={onAdd}
        >
          <i className="fas fa-plus-circle mr-2"></i> Add Another Position
        </button>
      </div>
    </div>
  );
};

export default Experience;