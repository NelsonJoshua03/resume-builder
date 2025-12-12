import { useState } from 'react';
import type { SkillsProps, Skill } from './types';

const Skills = ({ skills, onAdd, onRemove, onUpdateProficiency, template, onFieldInteraction }: SkillsProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState<Skill['proficiency']>('Intermediate');

  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAdd({ name: newSkill.trim(), proficiency: newProficiency });
      onFieldInteraction?.('skill_add', 'change');
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
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <h2 className={`text-2xl font-semibold mb-4 ${formStyle.headerColor} flex items-center`}>
        <i className="fas fa-tools mr-2 text-blue-500"></i> Skills
      </h2>
      
      <div className="space-y-3 mb-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-800">{skill.name}</span>
            <div className="flex items-center space-x-3">
              <select
                value={skill.proficiency}
                onChange={(e) => {
                  onUpdateProficiency(index, e.target.value as Skill['proficiency']);
                  onFieldInteraction?.(`proficiency_${index}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`proficiency_${index}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`proficiency_${index}`, 'blur')}
                className="text-sm border border-gray-300 rounded px-3 py-1 bg-white focus:outline-none focus:border-blue-500"
              >
                {proficiencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button 
                className="text-red-500 hover:text-red-700 p-1"
                onClick={() => onRemove(index)}
                title="Remove skill"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
          placeholder="Add a skill"
          value={newSkill}
          onChange={(e) => {
            setNewSkill(e.target.value);
            onFieldInteraction?.('skill_new', 'change');
          }}
          onFocus={() => onFieldInteraction?.('skill_new', 'focus')}
          onBlur={() => onFieldInteraction?.('skill_new', 'blur')}
          onKeyPress={handleKeyPress}
        />
        <select
          value={newProficiency}
          onChange={(e) => {
            setNewProficiency(e.target.value as Skill['proficiency']);
            onFieldInteraction?.('proficiency_new', 'change');
          }}
          onFocus={() => onFieldInteraction?.('proficiency_new', 'focus')}
          onBlur={() => onFieldInteraction?.('proficiency_new', 'blur')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          {proficiencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          onClick={handleAddSkill}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {skills.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No skills added yet. Add your first skill above!</p>
        </div>
      )}
    </div>
  );
};

export default Skills;