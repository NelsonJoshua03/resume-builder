export const NEW_TEMPLATES = {
  modernIcons: {
    id: 'modernIcons',
    name: 'Modern Icons',
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    buttonColor: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    headerBg: 'bg-gradient-to-r from-blue-600 to-purple-600',
    headerText: 'text-white',
    sectionBg: 'bg-white',
    description: 'Modern design with beautiful icons and gradient accents',
    layout: 'modernIcons',
    colors: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      accent: '#60a5fa',
      background: '#f0f9ff',
      text: '#1f2937'
    }
  },
  creativePortfolio: {
    id: 'creativePortfolio',
    name: 'Creative Portfolio',
    background: 'bg-gradient-to-br from-purple-50 to-pink-50',
    textColor: 'text-gray-900',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    headerText: 'text-white',
    sectionBg: 'bg-white',
    description: 'Creative portfolio style with timeline and skill bars',
    layout: 'creativePortfolio',
    colors: {
      primary: '#9333ea',
      secondary: '#db2777',
      accent: '#c084fc',
      background: '#faf5ff',
      text: '#1f2937'
    }
  },

  professionalExecutive: {
  id: 'professionalExecutive',
  name: 'Professional Executive',
  background: 'bg-gradient-to-br from-slate-50 to-gray-100',
  textColor: 'text-gray-900',
  accentColor: 'text-amber-600',
  borderColor: 'border-gray-300',
  buttonColor: 'bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900',
  headerBg: 'bg-gradient-to-r from-slate-800 to-gray-900',
  headerText: 'text-white',
  sectionBg: 'bg-white',
  description: 'Elegant executive design perfect for senior roles and leadership positions',
  layout: 'professionalExecutive',
  colors: {
    primary: '#1e293b',
    secondary: '#475569',
    accent: '#f59e0b',
    background: '#f8fafc',
    text: '#1f2937'
  }
}
};

export type NewTemplateType = keyof typeof NEW_TEMPLATES;