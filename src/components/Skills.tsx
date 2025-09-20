import { useState } from 'react';
import { SkillsProps, Skill } from './types';

const Skills = ({ skills, onAdd, onRemove, onUpdateProficiency }: SkillsProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState<Skill['proficiency']>('Intermediate');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAdd({ name: newSkill.trim(), proficiency: newProficiency });
      setNewSkill('');
      setNewProficiency('Intermediate');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  const proficiencyOptions: { value: Skill['proficiency']; label: string }[] = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-tools mr-2 text-blue-500"></i> Skills
      </h2>
      
      <div className="space-y-3 mb-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <span className="font-medium">{skill.name}</span>
            <div className="flex items-center space-x-2">
              <select
                value={skill.proficiency}
                onChange={(e) => onUpdateProficiency(index, e.target.value as Skill['proficiency'])}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {proficiencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemove(index)}
                title="Remove skill"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input 
          type="text" 
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg" 
          placeholder="Add a skill"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          value={newProficiency}
          onChange={(e) => setNewProficiency(e.target.value as Skill['proficiency'])}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          {proficiencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleAddSkill}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Skills;