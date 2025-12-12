import  { useState } from 'react';
import type { ColorCustomizerProps } from './types';

const ColorCustomizer = ({ template, colors, onUpdate }: ColorCustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColors, setCurrentColors] = useState(colors);

    const handleColorChange = (colorKey: string, value: string) => {
    const updatedColors = {
      ...currentColors,
      [colorKey]: value
    };
    setCurrentColors(updatedColors);
    onUpdate(updatedColors);
  };

  const resetColors = () => {
    setCurrentColors(template.colors);
    onUpdate(template.colors);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Customize Colors</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:text-blue-800"
        >
          {isOpen ? 'Hide' : 'Show'} Options
        </button>
      </div>
      
      {isOpen && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-10 h-10 rounded-md border border-gray-300"
                />
                <span className="ml-2 text-sm">{currentColors.primary}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-10 h-10 rounded-md border border-gray-300"
                />
                <span className="ml-2 text-sm">{currentColors.secondary}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentColors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-10 h-10 rounded-md border border-gray-300"
                />
                <span className="ml-2 text-sm">{currentColors.accent}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentColors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-10 h-10 rounded-md border border-gray-300"
                />
                <span className="ml-2 text-sm">{currentColors.background}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={resetColors}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset to Default
            </button>
            
            <div className="flex space-x-2">
              {Object.entries({
                professional: { primary: '#2563eb', secondary: '#1e40af' },
                modern: { primary: '#0d9488', secondary: '#0f766e' },
                creative: { primary: '#9333ea', secondary: '#7e22ce' },
                minimalist: { primary: '#374151', secondary: '#1f2937' }
              }).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onUpdate({ ...currentColors, ...preset })}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                  title={`Apply ${key} preset`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorCustomizer;