import { useState } from 'react';
import { PersonalInfoProps } from '@/components/types';

const PersonalInfo = ({ data, onChange }: PersonalInfoProps) => {
  const [newBullet, setNewBullet] = useState('');

  const handleBulletChange = (index: number, value: string) => {
    const updatedSummary = [...data.summary];
    updatedSummary[index] = value;
    onChange('summary', updatedSummary);
  };

  const addBulletPoint = () => {
    if (newBullet.trim()) {
      onChange('summary', [...data.summary, newBullet.trim()]);
      setNewBullet('');
    }
  };

  const removeBulletPoint = (index: number) => {
    const updatedSummary = data.summary.filter((_, i) => i !== index);
    onChange('summary', updatedSummary);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBulletPoint();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-user-edit mr-2 text-blue-500"></i> Edit Your Details
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-70 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <div className="space-y-2">
            {data.summary.map((bullet, index) => (
              <div key={index} className="flex items-center">
                <span className="mr-2 text-gray-500">•</span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  placeholder="Add a summary point"
                />
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => removeBulletPoint(index)}
                  title="Remove this bullet point"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <div className="flex mt-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                placeholder="Add a new summary point"
                value={newBullet}
                onChange={(e) => setNewBullet(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                onClick={addBulletPoint}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;