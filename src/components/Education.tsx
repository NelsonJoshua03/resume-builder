
import { EducationProps } from './types';

const Education = ({ education, onUpdate, onAdd, onRemove }: EducationProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-graduation-cap mr-2 text-blue-500"></i> Education
      </h2>
      
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Education #{index + 1}</h3>
              {index > 0 && (
                <button 
                  className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                  onClick={() => onRemove(edu.id)}
                >
                  <i className="fas fa-trash mr-1"></i> Remove
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Year"
                value={edu.year}
                onChange={(e) => onUpdate(edu.id, 'year', e.target.value)}
              />
            </div>
          </div>
        ))}
        
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          onClick={onAdd}
        >
          <i className="fas fa-plus-circle mr-2"></i> Add Another Degree
        </button>
      </div>
    </div>
  );
};

export default Education;