import { useState } from 'react';
import { PersonalInfoProps } from '@/components/types';

const PersonalInfo = ({ data, onChange, template, onFieldInteraction }: PersonalInfoProps) => {
  const [newBullet, setNewBullet] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(data.profilePicture || null);

  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const handleBulletChange = (index: number, value: string) => {
    const updatedSummary = [...data.summary];
    updatedSummary[index] = value;
    onChange('summary', updatedSummary);
    onFieldInteraction?.(`summary_${index}`, 'change');
  };

  const addBulletPoint = () => {
    if (newBullet.trim()) {
      onChange('summary', [...data.summary, newBullet.trim()]);
      onFieldInteraction?.('summary_add', 'change');
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onChange('profilePicture', result);
        onFieldInteraction?.('profilePicture', 'change');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onChange('profilePicture', '');
    onFieldInteraction?.('profilePicture', 'change');
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <h2 className={`text-2xl font-semibold mb-4 ${formStyle.headerColor} flex items-center`}>
        <i className="fas fa-user-edit mr-2 text-blue-500"></i> Edit Your Details
      </h2>
      
      <div className="space-y-4">
        {/* Profile Picture Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profile Picture <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <div className="flex flex-col items-center space-y-4">
            {imagePreview ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Profile Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <p className="text-sm text-green-600 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  Profile picture uploaded successfully
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-full w-32 h-32 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <label className="cursor-pointer flex flex-col items-center">
                    <i className="fas fa-camera text-gray-400 text-xl mb-2"></i>
                    <span className="text-xs text-gray-500">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      onFocus={() => onFieldInteraction?.('profilePicture', 'focus')}
                      onBlur={() => onFieldInteraction?.('profilePicture', 'blur')}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Recommended: Square image, max 5MB (Optional)
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={data.name}
            onChange={(e) => {
              onChange('name', e.target.value);
              onFieldInteraction?.('name', 'change');
            }}
            onFocus={() => onFieldInteraction?.('name', 'focus')}
            onBlur={() => onFieldInteraction?.('name', 'blur')}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title *</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={data.title}
            onChange={(e) => {
              onChange('title', e.target.value);
              onFieldInteraction?.('title', 'change');
            }}
            onFocus={() => onFieldInteraction?.('title', 'focus')}
            onBlur={() => onFieldInteraction?.('title', 'blur')}
            placeholder="Software Engineer"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={data.email}
              onChange={(e) => {
                onChange('email', e.target.value);
                onFieldInteraction?.('email', 'change');
              }}
              onFocus={() => onFieldInteraction?.('email', 'focus')}
              onBlur={() => onFieldInteraction?.('email', 'blur')}
              placeholder="john.doe@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={data.phone}
              onChange={(e) => {
                onChange('phone', e.target.value);
                onFieldInteraction?.('phone', 'change');
              }}
              onFocus={() => onFieldInteraction?.('phone', 'focus')}
              onBlur={() => onFieldInteraction?.('phone', 'blur')}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary *</label>
          <div className="space-y-2">
            {data.summary.map((bullet, index) => (
              <div key={index} className="flex items-center group">
                <span className="mr-3 text-blue-500 font-bold">•</span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  onFocus={() => onFieldInteraction?.(`summary_${index}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`summary_${index}`, 'blur')}
                  placeholder="Add a summary point"
                />
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeBulletPoint(index)}
                  title="Remove this bullet point"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <div className="flex mt-3">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a new summary point"
                value={newBullet}
                onChange={(e) => {
                  setNewBullet(e.target.value);
                  onFieldInteraction?.('summary_new', 'change');
                }}
                onFocus={() => onFieldInteraction?.('summary_new', 'focus')}
                onBlur={() => onFieldInteraction?.('summary_new', 'blur')}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors flex items-center"
                onClick={addBulletPoint}
              >
                <i className="fas fa-plus mr-1"></i>
                Add
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: Press Enter to quickly add bullet points
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;