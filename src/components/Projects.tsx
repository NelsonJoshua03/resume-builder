import { useState } from 'react';
import { ProjectsProps } from './types';

const Projects = ({ projects, onUpdate, onAdd, onRemove }: ProjectsProps) => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    if (expandedProject === id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(id);
    }
  };

  const addBulletPoint = (projectId: number) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const updatedBullets = [...project.description, ''];
      onUpdate(projectId, 'description', updatedBullets);
    }
  };

  const updateBulletPoint = (projectId: number, index: number, value: string) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const updatedBullets = [...project.description];
      updatedBullets[index] = value;
      onUpdate(projectId, 'description', updatedBullets);
    }
  };

  const removeBulletPoint = (projectId: number, index: number) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project && project.description.length > 1) {
      const updatedBullets = project.description.filter((_, i) => i !== index);
      onUpdate(projectId, 'description', updatedBullets);
    }
  };

  const addTechnology = (projectId: number, tech: string) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project && tech.trim()) {
      const updatedTechs = [...project.technologies, tech.trim()];
      onUpdate(projectId, 'technologies', updatedTechs);
    }
  };

  const removeTechnology = (projectId: number, index: number) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const updatedTechs = project.technologies.filter((_, i) => i !== index);
      onUpdate(projectId, 'technologies', updatedTechs);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        <i className="fas fa-code mr-2 text-blue-500"></i> Projects
      </h2>
      
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Project #{index + 1}</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => toggleExpand(project.id)}
                  title={expandedProject === project.id ? "Collapse" : "Expand"}
                >
                  <i className={`fas ${expandedProject === project.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {index > 0 && (
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onRemove(project.id)}
                    title="Remove Project"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Project Name"
                value={project.name}
                onChange={(e) => onUpdate(project.id, 'name', e.target.value)}
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Period (e.g., Jan 2023 - Mar 2023)"
                value={project.period}
                onChange={(e) => onUpdate(project.id, 'period', e.target.value)}
              />
              <input 
                type="url" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" 
                placeholder="Project Link (optional)"
                value={project.link || ''}
                onChange={(e) => onUpdate(project.id, 'link', e.target.value)}
              />
            </div>
            
            {expandedProject === project.id && (
              <>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Project Description</h4>
                  <div className="space-y-2">
                    {project.description.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-start">
                        <span className="mt-2 mr-2 text-gray-500">•</span>
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Describe the project"
                          value={bullet}
                          onChange={(e) => updateBulletPoint(project.id, bulletIndex, e.target.value)}
                        />
                        {project.description.length > 1 && (
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700 mt-2"
                            onClick={() => removeBulletPoint(project.id, bulletIndex)}
                            title="Remove this bullet point"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
                      onClick={() => addBulletPoint(project.id)}
                    >
                      <i className="fas fa-plus-circle mr-1"></i> Add Another Point
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                        {tech}
                        <button
                          type="button"
                          className="ml-1 text-red-500 hover:text-red-700"
                          onClick={() => removeTechnology(project.id, techIndex)}
                          title="Remove technology"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                      placeholder="Add a technology"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTechnology(project.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                        addTechnology(project.id, input.value);
                        input.value = '';
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          onClick={onAdd}
        >
          <i className="fas fa-plus-circle mr-2"></i> Add Another Project
        </button>
      </div>
    </div>
  );
};

export default Projects;