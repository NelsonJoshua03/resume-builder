import { useState } from 'react'; // Added useState import
import type { AwardsProps } from './types';

const Awards = ({ awards, onUpdate, onAdd, onRemove, template, onFieldInteraction, onRenameSection, sectionTitle, onRemoveSection }: AwardsProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(sectionTitle || 'Awards & Achievements');

  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const addAward = () => {
    const newId = onAdd();
    setTimeout(() => {
      const newAwardInput = document.getElementById(`award-title-${newId}`);
      if (newAwardInput) {
        newAwardInput.focus();
      }
    }, 100);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    onRenameSection?.(customTitle);
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl relative group`}>
      {onRemoveSection && (
        <button
          onClick={onRemoveSection}
          className="absolute top-4 right-4 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove this section"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">🏆</span>
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
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center gap-2`}>
              <span className="text-yellow-500">🏆</span>
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
          </div>
        )}
        <button
          onClick={addAward}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Add Award</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {awards.map((award, index) => (
          <div key={award.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
            <div className="flex justify-between items-start mb-3">
              <input
                id={`award-title-${award.id}`}
                type="text"
                placeholder="Award Title"
                value={award.title}
                onChange={(e) => {
                  onUpdate(award.id, 'title', e.target.value);
                  onFieldInteraction?.(`title_${award.id}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`title_${award.id}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`title_${award.id}`, 'blur')}
                className={`w-full text-lg font-semibold p-2 border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              <button 
                className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                onClick={() => onRemove(award.id)}
                title="Remove award"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={award.issuer}
                  onChange={(e) => {
                    onUpdate(award.id, 'issuer', e.target.value);
                    onFieldInteraction?.(`issuer_${award.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`issuer_${award.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`issuer_${award.id}`, 'blur')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2023"
                  value={award.year}
                  onChange={(e) => {
                    onUpdate(award.id, 'year', e.target.value);
                    onFieldInteraction?.(`year_${award.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`year_${award.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`year_${award.id}`, 'blur')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Describe the award and its significance..."
                value={award.description}
                onChange={(e) => {
                  onUpdate(award.id, 'description', e.target.value);
                  onFieldInteraction?.(`description_${award.id}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`description_${award.id}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`description_${award.id}`, 'blur')}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-vertical"
              />
            </div>
          </div>
        ))}
      </div>

      {awards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No awards added yet.</p>
          <p className="text-sm">Click "Add Award" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Awards;