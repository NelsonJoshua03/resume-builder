// ResumeBuilder.tsx - ATS Templates Page with Grid Preview
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from './ResumeContext';
import TemplateSelector from './TemplateSelector';
import FileUpload from './FileUpload';
import ResumePreview from './ResumePreview';
import ColorCustomizer from './ColorCustomizer';
import MobilePDFGenerator from './MobilePDFGenerator';
import SocialSharing from './SocialSharing';
import SEO from './SEO';
import SectionOrderCustomizer from './SectionOrderCustomizer';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { TemplatesMap } from './types';

// Enhanced template configuration with unique styling for each template
const TEMPLATES: TemplatesMap = {
  creative: {
    id: 'creative',
    name: 'Creative',
    background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    textColor: 'text-gray-900',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    headerBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    headerText: 'text-white',
    sectionBg: 'bg-white bg-opacity-70',
    description: 'Colorful and expressive design for creative fields',
    layout: 'creative',
    colors: {
      primary: '#9333ea',
      secondary: '#7e22ce',
      accent: '#d8b4fe',
      background: '#faf5ff',
      text: '#1f2937'
    },
    formStyle: {
      sectionBg: 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl',
      headerColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-600'
    }
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-indigo-900',
    borderColor: 'border-indigo-600',
    buttonColor: 'bg-indigo-900 hover:bg-indigo-800',
    headerBg: 'bg-indigo-900',
    headerText: 'text-white',
    sectionBg: 'bg-gray-50',
    description: 'Elegant corporate design for senior roles',
    layout: 'executive',
    colors: {
      primary: '#312e81',
      secondary: '#3730a3',
      accent: '#6366f1',
      background: '#ffffff',
      text: '#111827'
    },
    formStyle: {
      sectionBg: 'bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100',
      headerColor: 'text-indigo-900',
      borderColor: 'border-indigo-200',
      accentColor: 'text-indigo-700'
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-900',
    borderColor: 'border-blue-900',
    buttonColor: 'bg-blue-900 hover:bg-blue-800',
    headerBg: 'bg-blue-900',
    headerText: 'text-white',
    sectionBg: 'bg-gray-50',
    description: 'Classic professional design for corporate environments',
    layout: 'professional',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#111827'
    },
    formStyle: {
      sectionBg: 'bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200',
      headerColor: 'text-blue-900',
      borderColor: 'border-blue-300',
      accentColor: 'text-blue-700'
    }
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    background: 'bg-gradient-to-br from-gray-50 to-blue-50',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-800',
    borderColor: 'border-gray-400',
    buttonColor: 'bg-gray-800 hover:bg-gray-700',
    headerBg: 'bg-gradient-to-r from-gray-900 to-gray-700',
    headerText: 'text-white',
    sectionBg: 'bg-white bg-opacity-80',
    description: 'Modern tech-focused design for developers',
    layout: 'tech',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#9ca3af',
      background: '#f9fafb',
      text: '#1f2937'
    },
    formStyle: {
      sectionBg: 'bg-gradient-to-br from-gray-100 to-blue-100 rounded-lg border border-gray-300',
      headerColor: 'text-gray-900',
      borderColor: 'border-gray-400',
      accentColor: 'text-gray-700'
    }
  },
  ats: {
    id: 'ats',
    name: 'ATS Optimized',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-800',
    borderColor: 'border-gray-600',
    buttonColor: 'bg-gray-800 hover:bg-gray-700',
    headerBg: 'bg-gray-800',
    headerText: 'text-white',
    sectionBg: 'bg-gray-50',
    description: 'Maximum ATS compatibility with clean, single-column layout',
    layout: 'ats',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#6b7280',
      background: '#ffffff',
      text: '#111827'
    },
    formStyle: {
      sectionBg: 'bg-white border border-gray-300 rounded-md',
      headerColor: 'text-gray-900',
      borderColor: 'border-gray-400',
      accentColor: 'text-gray-700'
    }
  },
  twoColumn: {
    id: 'twoColumn',
    name: 'Two Column',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'text-teal-700',
    borderColor: 'border-teal-600',
    buttonColor: 'bg-teal-700 hover:bg-teal-600',
    headerBg: 'bg-teal-700',
    headerText: 'text-white',
    sectionBg: 'bg-teal-50',
    description: 'Modern two-column layout with sidebar',
    layout: 'twoColumn',
    colors: {
      primary: '#0f766e',
      secondary: '#115e59',
      accent: '#5eead4',
      background: '#ffffff',
      text: '#111827'
    },
    formStyle: {
      sectionBg: 'bg-gradient-to-br from-teal-50 to-green-50 rounded-xl border border-teal-200',
      headerColor: 'text-teal-800',
      borderColor: 'border-teal-300',
      accentColor: 'text-teal-700'
    }
  }
};

// New Component: TemplateGridPreview
const TemplateGridPreview = ({ 
  templates, 
  selectedTemplate, 
  onSelect, 
  resumeData,
  sectionOrder 
}: { 
  templates: TemplatesMap;
  selectedTemplate: string;
  onSelect: (template: string) => void;
  resumeData: any;
  sectionOrder: any[];
}) => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleTemplatePreview = (templateName: string) => {
    trackButtonClick(`preview_${templateName.toLowerCase()}`, 'template_grid', 'resume_builder');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Your Resume Template
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(templates).map((template) => {
          const customColors = resumeData.customColors[template.id] || template.colors;
          
          return (
            <div
              key={template.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedTemplate === template.id
                  ? 'ring-4 ring-blue-500 scale-105 shadow-2xl'
                  : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-300 hover:scale-102 hover:shadow-xl'
              } rounded-lg overflow-hidden bg-white`}
              onClick={() => {
                onSelect(template.id);
                handleTemplatePreview(template.name);
              }}
            >
              {/* Template Preview Container */}
              <div className="relative h-80 overflow-hidden bg-gray-50">
                {/* Zoomed-out preview with transform scale */}
                <div 
                  className="absolute inset-0 origin-top-left transform scale-50"
                  style={{ 
                    width: '200%', 
                    height: '200%',
                    transformOrigin: '0 0'
                  }}
                >
                  <div className="w-full h-full p-2">
                    <ResumePreview
                      data={resumeData}
                      template={template}
                      customColors={customColors}
                      sectionOrder={sectionOrder}
                    />
                  </div>
                </div>
                
                {/* Overlay with template info */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                  <div className="w-full bg-gradient-to-t from-black to-transparent p-4 text-white">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <p className="text-sm opacity-90">{template.description}</p>
                  </div>
                </div>
                
                {/* Selected indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Selected
                  </div>
                )}
              </div>
              
              {/* Template Actions */}
              <div className="p-3 bg-white border-t border-gray-100">
                <button
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(template.id);
                    handleTemplatePreview(template.name);
                  }}
                >
                  {selectedTemplate === template.id ? '✓ Selected' : 'Select Template'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResumeBuilder = () => {
  const { 
    resumeData, 
    sectionOrder, 
    handleSectionReorder, 
    handleFileUpload,
    updateSelectedTemplate,
    updateCustomColors
  } = useResume();
  const [formKey, setFormKey] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'preview'>('grid');
  
  const { 
    trackResumeGeneration, 
    trackButtonClick, 
    trackTemplateChange,
    trackCTAClick,
    trackUserFlow 
  } = useGoogleAnalytics();

  const selectTemplate = (template: string) => {
    updateSelectedTemplate(template);
    console.log('Template selected:', template);
    trackTemplateChange(template);
    trackButtonClick('template_select', 'template_selector', 'resume_builder');
    
    // Switch to preview mode when template is selected
    if (viewMode === 'grid') {
      setViewMode('preview');
      trackUserFlow('template_grid', 'template_preview', 'template_selection');
    }
  };

  const updateTemplateColors = (colors: any) => {
    updateCustomColors(resumeData.selectedTemplate, colors);
    console.log('Colors updated:', colors);
    trackButtonClick('update_colors', 'color_customizer', 'resume_builder');
  };

  const currentTemplate = TEMPLATES[resumeData.selectedTemplate as keyof typeof TEMPLATES] || TEMPLATES.creative;
  const customColors = resumeData.customColors[resumeData.selectedTemplate] || currentTemplate.colors;

  const toggleMobilePreview = () => {
    setIsMobilePreview(!isMobilePreview);
    trackButtonClick('toggle_mobile_preview', 'preview_controls', 'resume_builder');
  };

  const handleViewModeChange = (mode: 'grid' | 'preview') => {
    setViewMode(mode);
    trackButtonClick(`view_mode_${mode}`, 'navigation', 'resume_builder');
  };

  return (
    <>
      <SEO
        title="Free Resume Builder - Create ATS-Friendly CV Online | CareerCraft"
        description="Build professional, ATS-optimized resumes with CareerCraft's free online builder. 8+ templates for engineers, developers, and professionals. Download PDF instantly."
        keywords="free resume builder, online CV maker, ATS resume template, professional resume download, resume builder no sign up, create resume free, career craft"
        canonicalUrl="https://careercraft.in/builder"
      />
      
      <div className="min-h-screen bg-gray-50 py-1">
        <div className="mx-auto px-1 max-w-[100rem]">
          <header className="text-center mb-3">
            <h1 className="text-xl font-bold text-gray-800 mb-1">CareerCraft Resume Builder</h1>
            <p className="text-sm text-gray-600">Create professional ATS-optimized resumes in minutes</p>
            
            <div className="mt-2 flex justify-center gap-2">
              <Link
                to="/edit"
                onClick={() => {
                  trackCTAClick('edit_resume', 'header', 'resume_builder');
                  trackUserFlow('builder', 'edit', 'navigation');
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </Link>
              
              {/* View Mode Toggle */}
              {viewMode === 'preview' && (
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  View All Templates
                </button>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          {viewMode === 'grid' ? (
            // GRID VIEW - Show all templates
            <div className="space-y-4">
              <TemplateGridPreview
                templates={TEMPLATES}
                selectedTemplate={resumeData.selectedTemplate}
                onSelect={selectTemplate}
                resumeData={resumeData}
                sectionOrder={sectionOrder}
              />
              
              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Ready to Customize?</h3>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleViewModeChange('preview')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Customize Selected Template
                  </button>
                  <Link
                    to="/premium"
                    onClick={() => {
                      trackCTAClick('view_premium_templates', 'quick_actions', 'resume_builder');
                      trackUserFlow('builder', 'premium', 'navigation');
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-center"
                  >
                    View Premium Templates
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // PREVIEW VIEW - Show selected template with controls
            <>
              {/* MOBILE LAYOUT: Vertical stack for mobile */}
              <div className="block lg:hidden space-y-2">
                {/* Template Quick Selector - Compact Horizontal Scroll */}
                <div className="bg-white rounded-md shadow-sm p-2">
                  <div className="flex space-x-1 overflow-x-auto pb-1">
                    {Object.values(TEMPLATES).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          selectTemplate(template.id);
                          trackButtonClick(`quick_select_${template.id}`, 'mobile_navigation', 'resume_builder');
                        }}
                        className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-all ${
                          resumeData.selectedTemplate === template.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Container */}
                <div className="bg-white rounded-md shadow-sm p-2">
                  {/* Mobile Preview Toggle and Download Button */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={toggleMobilePreview}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                        isMobilePreview
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isMobilePreview ? '📄 Back to Preview' : '🔍 Read Full Resume'}
                    </button>

                    <MobilePDFGenerator 
                      resumeRef={resumeRef as React.RefObject<HTMLDivElement>}
                      personalInfo={resumeData.personalInfo}
                      resumeData={resumeData}
                      template={currentTemplate}
                      sectionOrder={sectionOrder}
                    />
                  </div>

                  {/* Resume Preview */}
                  <div className="border border-gray-300 rounded bg-gray-50 overflow-auto" style={{ 
                    height: isMobilePreview ? 'auto' : '80vh'
                  }}>
                    <div 
                      className="bg-white mx-auto"
                      style={{ 
                        width: isMobilePreview ? '100%' : '100%',
                        maxWidth: isMobilePreview ? 'none' : '100%',
                        transform: isMobilePreview ? 'scale(1)' : 'none',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <div ref={resumeRef}>
                        <ResumePreview 
                          data={resumeData} 
                          template={currentTemplate}
                          customColors={customColors}
                          sectionOrder={sectionOrder}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="mt-2">
                    <SocialSharing 
                      resumeTitle={resumeData.personalInfo.title}
                    />
                  </div>
                </div>

                {/* Controls Section */}
                <div className="space-y-2">
                  <div className="bg-white rounded-md shadow-sm p-2">
                    <ColorCustomizer
                      template={currentTemplate}
                      colors={customColors}
                      onUpdate={updateTemplateColors}
                    />
                  </div>

                  <div className="bg-white rounded-md shadow-sm p-2">
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={handleSectionReorder}
                    />
                  </div>

                  <div className="bg-white rounded-md shadow-sm p-2">
                    <FileUpload 
                      onUpload={handleFileUpload}
                    />
                  </div>

                  <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-1 text-xs">Need to edit your information?</h3>
                    <Link
                      to="/edit"
                      onClick={() => {
                        trackCTAClick('edit_resume_mobile', 'quick_actions', 'resume_builder');
                        trackUserFlow('builder', 'edit', 'navigation');
                      }}
                      className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors w-full text-center block text-xs"
                    >
                      Edit Resume Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* DESKTOP LAYOUT: Standard side-by-side */}
              <div className="hidden lg:flex flex-col xl:flex-row gap-4">
                {/* Preview Section */}
                <div className="xl:w-3/5">
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <ResumePreview 
                      ref={resumeRef} 
                      data={resumeData} 
                      template={currentTemplate}
                      customColors={customColors}
                      sectionOrder={sectionOrder}
                    />
                    
                    <div className="flex gap-3 justify-center mt-6">
                      <MobilePDFGenerator 
                        resumeRef={resumeRef as React.RefObject<HTMLDivElement>}
                        personalInfo={resumeData.personalInfo}
                        resumeData={resumeData}
                        template={currentTemplate}
                        sectionOrder={sectionOrder}
                      />

                      <SocialSharing 
                        resumeTitle={resumeData.personalInfo.title}
                      />
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="xl:w-2/5 space-y-4">
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <TemplateSelector 
                      selectedTemplate={resumeData.selectedTemplate}
                      onSelect={selectTemplate}
                      templates={TEMPLATES}
                    />
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <ColorCustomizer
                      template={currentTemplate}
                      colors={customColors}
                      onUpdate={updateTemplateColors}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={handleSectionReorder}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <FileUpload 
                      onUpload={handleFileUpload}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Need to edit your information?</h3>
                    <p className="text-blue-700 text-sm mb-3">Update your personal details, experience, education, and more.</p>
                    <Link
                      to="/edit"
                      onClick={() => {
                        trackCTAClick('edit_resume_desktop', 'quick_actions', 'resume_builder');
                        trackUserFlow('builder', 'edit', 'navigation');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full text-center block"
                    >
                      Edit Resume Details
                    </Link>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Explore More Templates</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewModeChange('grid')}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center text-sm"
                      >
                        View All Templates
                      </button>
                      <Link
                        to="/premium"
                        onClick={() => {
                          trackCTAClick('view_premium_from_preview', 'template_exploration', 'resume_builder');
                          trackUserFlow('builder', 'premium', 'navigation');
                        }}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                      >
                        Premium Templates
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Features Section */}
          <div className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h2 className="text-lg font-bold text-center text-gray-800 mb-2">Why Choose ATS Templates?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div 
                className="text-center cursor-pointer"
                onClick={() => trackButtonClick('feature_ats', 'features_section', 'resume_builder')}
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-xs">ATS Friendly</h3>
                <p className="text-gray-600 text-xs">Optimized for Applicant Tracking Systems</p>
              </div>
              <div 
                className="text-center cursor-pointer"
                onClick={() => trackButtonClick('feature_fast', 'features_section', 'resume_builder')}
              >
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-xs">Fast Processing</h3>
                <p className="text-gray-600 text-xs">Quick parsing by automated systems</p>
              </div>
              <div 
                className="text-center cursor-pointer"
                onClick={() => trackButtonClick('feature_professional', 'features_section', 'resume_builder')}
              >
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-xs">Professional</h3>
                <p className="text-gray-600 text-xs">Clean designs that impress recruiters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;