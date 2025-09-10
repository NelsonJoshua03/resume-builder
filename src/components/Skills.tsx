import  { useState } from 'react';
import { SkillsProps } from './types';

const Skills = ({ skills, onAdd, onRemove }: SkillsProps) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAdd(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-tools mr-2 text-blue-500"></i> Skills
      </h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
            {skill}
            {index > 0 && (
              <button 
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => onRemove(skill)}
                title="Remove skill"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </span>
        ))}
      </div>
      
      <div className="flex">
        <input 
          type="text" 
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg" 
          placeholder="Add a skill"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
          onClick={handleAddSkill}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Skills;