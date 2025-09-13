import { useState } from 'react';
import { CustomFieldsProps, CustomFieldType } from './types';

const CustomFields = ({ customFields, onUpdate, onAdd, onRemove, onChangeType }: CustomFieldsProps) => {
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const handleAddField = () => {
    if (newFieldLabel.trim()) {
      onAdd();
      // Update the label of the newly added field
      if (customFields.length > 0) {
        const newFieldId = customFields[customFields.length - 1].id + 1;
        onUpdate(newFieldId, 'label', newFieldLabel.trim());
      }
      setNewFieldLabel('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddField();
    }
  };

  const handleTypeChange = (id: number, value: string) => {
    // Ensure the value is one of the allowed types
    if (value === 'text' || value === 'textarea' || value === 'date' || value === 'url') {
      onChangeType(id, value as CustomFieldType);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-plus-circle mr-2 text-blue-500"></i> Additional Sections
      </h2>
      
      <div className="space-y-4">
        {customFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Custom Field #{index + 1}</h3>
              {index > 0 && (
                <button 
                  className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                  onClick={() => onRemove(field.id)}
                >
                  <i className="fas fa-trash mr-1"></i> Remove
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Field Label (e.g., Languages, Certifications)"
                value={field.label}
                onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
              />
              
              <div className="flex items-center mb-2">
                <label className="mr-2 text-sm text-gray-700">Field Type:</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={field.type}
                  onChange={(e) => handleTypeChange(field.id, e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Paragraph</option>
                  <option value="date">Date</option>
                  <option value="url">URL</option>
                </select>
              </div>
              
              {field.type === 'textarea' ? (
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  placeholder="Enter value"
                  rows={3}
                  value={field.value}
                  onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
                />
              ) : (
                <input 
                  type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  placeholder="Enter value"
                  value={field.value}
                  onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
        
        <div className="flex items-center">
          <input 
            type="text" 
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg" 
            placeholder="New section title"
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
            onClick={handleAddField}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFields;