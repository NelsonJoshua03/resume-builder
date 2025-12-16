import type { AwardsProps } from './types';

const Awards = ({ awards, onUpdate, onAdd, onRemove, template, onFieldInteraction }: AwardsProps) => {
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

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center`}>
          <i className="fas fa-trophy mr-2 text-blue-500"></i> Awards & Achievements
        </h2>
        <button
          onClick={addAward}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+ Add Award</span>
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
              {index > 0 && (
                <button 
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => onRemove(award.id)}
                  title="Remove award"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
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