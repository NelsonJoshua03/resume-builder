import { useState } from 'react';
import { ProjectsProps } from './types';

const Projects = ({ projects, onUpdate, onAdd, onRemove, template, onFieldInteraction }: ProjectsProps) => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const formStyle = template?.formStyle || {
    sectionBg: 'bg-white shadow-md rounded-lg',
    headerColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    accentColor: 'text-gray-700'
  };

  const toggleExpand = (id: number) => {
    if (expandedProject === id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(id);
    }
  };

  const addProject = () => {
    const newId = onAdd();
    setTimeout(() => {
      const newProjectInput = document.getElementById(`project-name-${newId}`);
      if (newProjectInput) {
        newProjectInput.focus();
      }
    }, 100);
  };

  const addBulletPoint = (projectId: number) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const updatedBullets = [...project.description, ''];
      onUpdate(projectId, 'description', updatedBullets);
      onFieldInteraction?.(`description_add_${projectId}`, 'change');
    }
  };

  const updateBulletPoint = (projectId: number, index: number, value: string) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const updatedBullets = [...project.description];
      updatedBullets[index] = value;
      onUpdate(projectId, 'description', updatedBullets);
      onFieldInteraction?.(`description_${projectId}_${index}`, 'change');
    }
  };

  const removeBulletPoint = (projectId: number, index: number) => {
    const project = projects.find(proj => proj.id === projectId);
    if (project && project.description.length > 1) {
      const updatedBullets = project.description.filter((_, i) => i !== index);
      onUpdate(projectId, 'description', updatedBullets);
    }
  };

  return (
    <div className={`p-6 mb-6 ${formStyle.sectionBg} border ${formStyle.borderColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-semibold ${formStyle.headerColor} flex items-center`}>
          <i className="fas fa-laptop-code mr-2 text-blue-500"></i> Projects & Portfolio
        </h2>
        <button
          onClick={addProject}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+ Add Project</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={project.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
            <div className="flex justify-between items-start mb-3">
              <input
                id={`project-name-${project.id}`}
                type="text"
                placeholder="Project Name"
                value={project.name}
                onChange={(e) => {
                  onUpdate(project.id, 'name', e.target.value);
                  onFieldInteraction?.(`name_${project.id}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`name_${project.id}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`name_${project.id}`, 'blur')}
                className={`w-full text-lg font-semibold p-2 border-b ${formStyle.borderColor} focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              <div className="flex space-x-2 ml-4">
                <button 
                  className="text-blue-500 hover:text-blue-700 p-2"
                  onClick={() => toggleExpand(project.id)}
                  title={expandedProject === project.id ? "Collapse" : "Expand"}
                >
                  <i className={`fas ${expandedProject === project.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {index > 0 && (
                  <button 
                    className="text-red-500 hover:text-red-700 p-2"
                    onClick={() => onRemove(project.id)}
                    title="Remove Project"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jan 2023 - Mar 2023"
                  value={project.period}
                  onChange={(e) => {
                    onUpdate(project.id, 'period', e.target.value);
                    onFieldInteraction?.(`period_${project.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`period_${project.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`period_${project.id}`, 'blur')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={project.link || ''}
                  onChange={(e) => {
                    onUpdate(project.id, 'link', e.target.value);
                    onFieldInteraction?.(`link_${project.id}`, 'change');
                  }}
                  onFocus={() => onFieldInteraction?.(`link_${project.id}`, 'focus')}
                  onBlur={() => onFieldInteraction?.(`link_${project.id}`, 'blur')}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={project.technologies?.join(', ') || ''}
                onChange={(e) => {
                  onUpdate(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()));
                  onFieldInteraction?.(`technologies_${project.id}`, 'change');
                }}
                onFocus={() => onFieldInteraction?.(`technologies_${project.id}`, 'focus')}
                onBlur={() => onFieldInteraction?.(`technologies_${project.id}`, 'blur')}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              {project.description.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2 mb-2">
                  <span className="mt-2 text-gray-500">•</span>
                  <textarea
                    placeholder="Describe your project achievements and responsibilities..."
                    value={item}
                    onChange={(e) => updateBulletPoint(project.id, itemIndex, e.target.value)}
                    onFocus={() => onFieldInteraction?.(`description_${project.id}_${itemIndex}`, 'focus')}
                    onBlur={() => onFieldInteraction?.(`description_${project.id}_${itemIndex}`, 'blur')}
                    rows={2}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-vertical"
                  />
                  {project.description.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(project.id, itemIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded self-start mt-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBulletPoint(project.id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                + Add Description Point
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No projects added yet.</p>
          <p className="text-sm">Click "Add Project" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Projects;