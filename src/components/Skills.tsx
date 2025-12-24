import { useState } from 'react';
import type { SkillsProps, Skill } from './types';

const Skills = ({ skills, onAdd, onRemove, onUpdateProficiency, template, onFieldInteraction, onRenameSection, sectionTitle }: SkillsProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState<Skill['proficiency']>('Intermediate');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(sectionTitle || 'Skills');

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

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    onRenameSection?.(customTitle);
  };

  const proficiencyOptions: { value: Skill['proficiency']; label: string }[] = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl group`}>
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xl">⚡</span>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
              onBlur={handleTitleSave}
              className={`text-2xl font-semibold ${formStyle.headerColor} bg-transparent border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500`}
              autoFocus
            />
            <button
              onClick={handleTitleSave}
              className="ml-2 p-1 text-green-600 hover:text-green-800"
              title="Save title"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center gap-2`}>
            <span className="text-red-500">⚡</span>
            {customTitle}
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit section title"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </h2>
        )}
      </div>
      
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
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
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
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