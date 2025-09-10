// src/components/TemplateSelector.tsx
import { TemplateSelectorProps } from './types';

const TemplateSelector = ({ selectedTemplate, onSelect, templates }: TemplateSelectorProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Choose a Template</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(templates).map(([key, template]) => (
          <div 
            key={key}
            className={`template-card border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedTemplate === key 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => onSelect(key)}
          >
            <div className={`h-32 rounded mb-3 flex flex-col items-center justify-center ${template.background} p-3 relative overflow-hidden`}>
              {/* Mini template preview */}
              <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-red-400"></div>
              <div className="absolute top-2 right-2 w-6 h-2 bg-blue-400 rounded"></div>
              <div className="absolute bottom-2 left-2 w-8 h-2 bg-green-400 rounded"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-yellow-400"></div>
              
              <div className="text-center z-10">
                <div className={`text-xs font-semibold ${template.accentColor}`}>Preview</div>
                <div className="text-xs text-gray-600 mt-1">{template.name}</div>
              </div>
            </div>
            <h3 className={`font-semibold ${
              selectedTemplate === key ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;