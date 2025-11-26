import { EducationProps } from './types';

const Education = ({ education, onUpdate, onAdd, onRemove, template }: EducationProps) => {
  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const addEducation = () => {
    const newId = onAdd();
    setTimeout(() => {
      const newEduInput = document.getElementById(`edu-degree-${newId}`);
      if (newEduInput) {
        newEduInput.focus();
      }
    }, 100);
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center`}>
          <i className="fas fa-graduation-cap mr-2 text-blue-500"></i> Education
        </h2>
        <button
          onClick={addEducation}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+ Add Education</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
            <div className="flex justify-between items-start mb-3">
              <input
                id={`edu-degree-${edu.id}`}
                type="text"
                placeholder="Degree Name"
                value={edu.degree}
                onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                className={`w-full text-lg font-semibold p-2 border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              {index > 0 && (
                <button 
                  className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => onRemove(edu.id)}
                  title="Remove education"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={edu.institution}
                  onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2018 - 2022"
                  value={edu.year}
                  onChange={(e) => onUpdate(edu.id, 'year', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA/Percentage (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 3.8/4.0 or 92%"
                value={edu.gpa || ''}
                onChange={(e) => onUpdate(edu.id, 'gpa', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      {education.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No education added yet.</p>
          <p className="text-sm">Click "Add Education" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Education;