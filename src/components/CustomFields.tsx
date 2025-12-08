import { CustomFieldsProps, CustomFieldType } from './types';

const CustomFields = ({ customFields, onUpdate, onAdd, onRemove, onChangeType, template, onFieldInteraction }: CustomFieldsProps) => {
  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const handleTypeChange = (id: number, value: string) => {
    if (value === 'text' || value === 'textarea' || value === 'date' || value === 'url') {
      onChangeType(id, value as CustomFieldType);
      onFieldInteraction?.(`type_${id}`, 'change');
    }
  };

  const addCustomField = () => {
    const newId = onAdd();
    setTimeout(() => {
      const newFieldInput = document.getElementById(`custom-label-${newId}`);
      if (newFieldInput) {
        newFieldInput.focus();
      }
    }, 100);
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center`}>
          <i className="fas fa-plus-circle mr-2 text-blue-500"></i> Additional Sections
        </h2>
        <button
          onClick={addCustomField}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+ Add Section</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {customFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
            <div className="flex justify-between items-start mb-3">
              <input
                id={`custom-label-${field.id}`}
                type="text"
                placeholder="Section Title (e.g., Languages, Certifications)"
                value={field.label}
                onChange={(e) => {
                  onUpdate(field.id, 'label', e.target.value);
                  onFieldInteraction?.(`label_${field.id}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`label_${field.id}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`label_${field.id}`, 'blur')}
                className={`w-full text-lg font-semibold p-2 border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              {index > 0 && (
                <button 
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => onRemove(field.id)}
                  title="Remove section"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  value={field.type}
                  onChange={(e) => handleTypeChange(field.id, e.target.value)}
                  onFocus={() => onFieldInteraction?.(`type_${field.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`type_${field.id}`, 'blur')}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Paragraph</option>
                  <option value="date">Date</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
            
            {field.type === 'textarea' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-vertical"
                  placeholder="Enter section content..."
                  rows={3}
                  value={field.value}
                  onChange={(e) => {
                    onUpdate(field.id, 'value', e.target.value);
                    onFieldInteraction?.(`value_${field.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`value_${field.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`value_${field.id}`, 'blur')}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <input 
                  type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" 
                  placeholder="Enter section content..."
                  value={field.value}
                  onChange={(e) => {
                    onUpdate(field.id, 'value', e.target.value);
                    onFieldInteraction?.(`value_${field.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`value_${field.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`value_${field.id}`, 'blur')}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {customFields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No additional sections added yet.</p>
          <p className="text-sm">Click "Add Section" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default CustomFields;