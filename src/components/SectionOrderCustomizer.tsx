import { useState } from 'react';
import { SectionOrderCustomizerProps, SectionItem } from './types';

const SectionOrderCustomizer = ({ sections, onReorder }: SectionOrderCustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSections, setLocalSections] = useState<SectionItem[]>(sections);

  const moveSection = (fromIndex: number, toIndex: number) => {
    const updatedSections = [...localSections];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);
    
    // Update order numbers
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setLocalSections(reorderedSections);
    onReorder(reorderedSections);
  };

  const toggleSection = (sectionId: string) => {
    const updatedSections = localSections.map(section =>
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    );
    
    setLocalSections(updatedSections);
    onReorder(updatedSections);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveSection(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < localSections.length - 1) {
      moveSection(index, index + 1);
    }
  };

  const resetOrder = () => {
    const defaultSections: SectionItem[] = [
      { id: 'summary', label: 'Professional Summary', enabled: true, order: 0 },
      { id: 'experience', label: 'Work Experience', enabled: true, order: 1 },
      { id: 'education', label: 'Education', enabled: true, order: 2 },
      { id: 'projects', label: 'Projects', enabled: true, order: 3 },
      { id: 'skills', label: 'Skills', enabled: true, order: 4 },
      { id: 'awards', label: 'Awards', enabled: true, order: 5 },
      { id: 'custom', label: 'Additional Sections', enabled: true, order: 6 }
    ];
    setLocalSections(defaultSections);
    onReorder(defaultSections);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <i className="fas fa-bars mr-2 text-blue-500"></i>
          Arrange Sections
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={resetOrder}
            className="text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
          >
            Reset Order
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isOpen ? 'Hide' : 'Show'} Options
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop sections to rearrange their order in your resume. Uncheck sections to hide them.
          </p>
          
          <div className="space-y-2">
            {localSections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`w-6 h-6 flex items-center justify-center rounded ${
                          index === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        <i className="fas fa-chevron-up text-xs"></i>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === localSections.length - 1}
                        className={`w-6 h-6 flex items-center justify-center rounded ${
                          index === localSections.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        <i className="fas fa-chevron-down text-xs"></i>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-grip-vertical text-gray-400"></i>
                      <span className="font-medium text-gray-700">{section.label}</span>
                    </div>
                  </div>
                  
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${
                        section.enabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        section.enabled ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </label>
                </div>
              ))}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>
              Changes will be reflected in the resume preview immediately
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionOrderCustomizer;