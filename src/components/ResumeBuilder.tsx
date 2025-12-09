// ResumeBuilder.tsx - ATS Templates Page with Grid Preview
import { useState, useRef, useEffect } from 'react';
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

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    handleTemplatePreview(templateId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          Choose Your Resume Template
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Select a template to preview and download your resume instantly
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              onClick={() => handleSelect(template.id)}
            >
              {/* Template Preview Container */}
              <div className="relative h-64 md:h-80 overflow-hidden bg-gray-50">
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
                  <div className="w-full bg-gradient-to-t from-black to-transparent p-3 md:p-4 text-white">
                    <h3 className="font-bold text-base md:text-lg">{template.name}</h3>
                    <p className="text-xs md:text-sm opacity-90">{template.description}</p>
                  </div>
                </div>
                
                {/* Selected indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Selected
                  </div>
                )}
              </div>
              
              {/* Template Actions */}
              <div className="p-3 bg-white border-t border-gray-100">
                <button
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(template.id);
                  }}
                >
                  {selectedTemplate === template.id ? (
                    <>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected Template
                    </>
                  ) : (
                    'Select Template'
                  )}
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
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [lastSelectedTemplate, setLastSelectedTemplate] = useState('');
  const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);
  
  const { 
    trackResumeGeneration, 
    trackButtonClick, 
    trackTemplateChange,
    trackCTAClick,
    trackUserFlow,
    trackPageView,
    trackEvent 
  } = useGoogleAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('Resume Builder', '/builder');
    
    // Track entry to builder page
    trackEvent('resume_funnel', {
      step: 'builder_entered',
      event_category: 'Conversion Funnel',
      event_label: 'builder_entered'
    });
  }, [trackPageView, trackEvent]);

  // Track resume completion status
  useEffect(() => {
    const completion = calculateResumeCompletion(resumeData);
    trackEvent('resume_completion_status', {
      completion_percentage: completion,
      sections_completed: getCompletedSectionsCount(resumeData),
      event_category: 'Resume Progress',
      event_label: `${completion}%_complete`
    });
  }, [resumeData, trackEvent]);

  // Auto-download when template is selected in grid mode
  useEffect(() => {
    if (viewMode === 'preview' && !autoDownloadTriggered && lastSelectedTemplate) {
      // Small delay to ensure preview is rendered
      const timer = setTimeout(() => {
        triggerActualResumeDownload();
        setAutoDownloadTriggered(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, lastSelectedTemplate, autoDownloadTriggered]);

  const selectTemplate = (template: string) => {
    updateSelectedTemplate(template);
    trackTemplateChange(template);
    trackButtonClick('template_select', 'template_selector', 'resume_builder');
    
    // Track funnel step
    trackEvent('resume_funnel', {
      step: 'template_selected',
      template_name: template,
      event_category: 'Conversion Funnel',
      event_label: 'template_selected'
    });
    
    setLastSelectedTemplate(template);
    setAutoDownloadTriggered(false);
    
    // Switch to preview mode when template is selected
    if (viewMode === 'grid') {
      setViewMode('preview');
      trackUserFlow('template_grid', 'template_preview', 'template_selection');
    }
  };

  const triggerActualResumeDownload = () => {
    if (!resumeRef.current) return;
    
    // Find the download button in MobilePDFGenerator and trigger it
    const downloadButton = document.querySelector('[aria-label="Download PDF document"]') as HTMLButtonElement;
    if (downloadButton && !downloadButton.disabled) {
      downloadButton.click();
      trackButtonClick('auto_download_template', 'template_selection', 'resume_builder');
      trackResumeGeneration('auto', resumeData.selectedTemplate, 'downloaded');
      
      // Track funnel step
      trackEvent('resume_funnel', {
        step: 'download_triggered',
        template_name: resumeData.selectedTemplate,
        event_category: 'Conversion Funnel',
        event_label: 'download_triggered'
      });
      
      // Show success message
      setTimeout(() => {
        const currentTemplate = TEMPLATES[resumeData.selectedTemplate as keyof typeof TEMPLATES] || TEMPLATES.creative;
        setShowDownloadPrompt(true);
      }, 500);
    }
  };

  const updateTemplateColors = (colors: any) => {
    updateCustomColors(resumeData.selectedTemplate, colors);
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
      
      {/* Success Download Prompt Modal */}
      {showDownloadPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Resume Downloaded!</h3>
              </div>
              <button 
                onClick={() => setShowDownloadPrompt(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Your <strong className="text-blue-600">{currentTemplate.name}</strong> resume has been downloaded successfully! 
              The PDF includes all your information and is ready to use.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Your actual resume with all data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Professional {currentTemplate.name} template</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>ATS-friendly formatting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Searchable text and clean layout</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDownloadPrompt(false);
                  trackButtonClick('close_success_prompt', 'modal', 'resume_builder');
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Close
              </button>
              <Link
                to="/edit"
                onClick={() => {
                  setShowDownloadPrompt(false);
                  trackCTAClick('edit_from_success', 'modal', 'resume_builder');
                  // Track funnel step
                  trackEvent('resume_funnel', {
                    step: 'edit_from_download',
                    event_category: 'Conversion Funnel',
                    event_label: 'edit_from_download'
                  });
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
              >
                Edit & Customize
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="mx-auto px-4 max-w-7xl">
          <header className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">CareerCraft Resume Builder</h1>
            <p className="text-gray-600 text-sm md:text-base">Create professional ATS-optimized resumes in minutes</p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
              <Link
                to="/edit"
                onClick={() => {
                  trackCTAClick('edit_resume', 'header', 'resume_builder');
                  trackUserFlow('builder', 'edit', 'navigation');
                  // Track funnel step
                  trackEvent('resume_funnel', {
                    step: 'edit_started',
                    event_category: 'Conversion Funnel',
                    event_label: 'edit_started'
                  });
                }}
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </Link>
              
              {/* View Mode Toggle */}
              {viewMode === 'preview' && (
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-2 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="space-y-6">
              <TemplateGridPreview
                templates={TEMPLATES}
                selectedTemplate={resumeData.selectedTemplate}
                onSelect={selectTemplate}
                resumeData={resumeData}
                sectionOrder={sectionOrder}
              />
              
              {/* Download CTA Banner */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6 rounded-xl border border-green-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg md:text-xl mb-1">Select a Template to Download</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Choose a template above to get your complete resume PDF immediately
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewModeChange('preview')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base"
                    >
                      Preview Current Template
                    </button>
                    <Link
                      to="/edit"
                      onClick={() => {
                        trackCTAClick('edit_first_grid', 'cta_banner', 'resume_builder');
                        trackUserFlow('builder', 'edit', 'navigation');
                        // Track funnel step
                        trackEvent('resume_funnel', {
                          step: 'edit_from_grid',
                          event_category: 'Conversion Funnel',
                          event_label: 'edit_from_grid'
                        });
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center text-sm md:text-base"
                    >
                      Edit Resume First
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // PREVIEW VIEW - Show selected template with controls
            <>
              {/* MOBILE LAYOUT: Vertical stack for mobile */}
              <div className="block lg:hidden space-y-4">
                {/* Template Quick Selector - Compact Horizontal Scroll */}
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {Object.values(TEMPLATES).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          selectTemplate(template.id);
                          trackButtonClick(`quick_select_${template.id}`, 'mobile_navigation', 'resume_builder');
                        }}
                        className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-all ${
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
                <div className="bg-white rounded-lg shadow-sm p-3">
                  {/* Mobile Preview Toggle */}
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={toggleMobilePreview}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                        isMobilePreview
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isMobilePreview ? '📄 Back to Preview' : '🔍 Read Full Resume'}
                    </button>
                  </div>

                  {/* Resume Preview */}
                  <div className="border border-gray-300 rounded-lg bg-gray-50 overflow-auto" style={{ 
                    height: isMobilePreview ? 'auto' : '70vh'
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

                  {/* Prominent Download Button for Mobile */}
                  <div className="mt-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200 mb-3">
                      <h4 className="font-semibold text-gray-800 mb-2 text-center">Download Your Resume</h4>
                      <p className="text-gray-600 text-xs text-center mb-3">
                        Your <strong>{currentTemplate.name}</strong> template is ready
                      </p>
                      <MobilePDFGenerator 
                        resumeRef={resumeRef as React.RefObject<HTMLDivElement>}
                        personalInfo={resumeData.personalInfo}
                        resumeData={resumeData}
                        template={currentTemplate}
                        sectionOrder={sectionOrder}
                        onDownloadStart={() => {
                          // Track funnel step
                          trackEvent('resume_funnel', {
                            step: 'download_initiated',
                            template_name: currentTemplate.name,
                            event_category: 'Conversion Funnel',
                            event_label: 'download_initiated'
                          });
                        }}
                      />
                    </div>

                    {/* Social Sharing */}
                    <SocialSharing 
                      resumeTitle={resumeData.personalInfo.title}
                    />
                  </div>
                </div>

                {/* Controls Section */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <ColorCustomizer
                      template={currentTemplate}
                      colors={customColors}
                      onUpdate={updateTemplateColors}
                    />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={handleSectionReorder}
                    />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <FileUpload 
                      onUpload={handleFileUpload}
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Need to edit your information?</h3>
                    <Link
                      to="/edit"
                      onClick={() => {
                        trackCTAClick('edit_resume_mobile', 'quick_actions', 'resume_builder');
                        trackUserFlow('builder', 'edit', 'navigation');
                        // Track funnel step
                        trackEvent('resume_funnel', {
                          step: 'edit_from_preview',
                          event_category: 'Conversion Funnel',
                          event_label: 'edit_from_preview'
                        });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full text-center block"
                    >
                      Edit Resume Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* DESKTOP LAYOUT: Standard side-by-side */}
              <div className="hidden lg:flex flex-col xl:flex-row gap-6">
                {/* Preview Section */}
                <div className="xl:w-3/5">
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <ResumePreview 
                      ref={resumeRef} 
                      data={resumeData} 
                      template={currentTemplate}
                      customColors={customColors}
                      sectionOrder={sectionOrder}
                    />
                    
                    {/* Prominent Download Section */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">Your Resume is Ready to Download!</h3>
                          <p className="text-gray-600 text-sm">
                            Template: <strong className="text-blue-600">{currentTemplate.name}</strong> • 
                            Sections: <strong>{sectionOrder.filter(s => s.enabled).length}</strong>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <MobilePDFGenerator 
                            resumeRef={resumeRef as React.RefObject<HTMLDivElement>}
                            personalInfo={resumeData.personalInfo}
                            resumeData={resumeData}
                            template={currentTemplate}
                            sectionOrder={sectionOrder}
                            onDownloadStart={() => {
                              // Track funnel step
                              trackEvent('resume_funnel', {
                                step: 'download_initiated',
                                template_name: currentTemplate.name,
                                event_category: 'Conversion Funnel',
                                event_label: 'download_initiated'
                              });
                            }}
                          />
                          <SocialSharing 
                            resumeTitle={resumeData.personalInfo.title}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="xl:w-2/5 space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <TemplateSelector 
                      selectedTemplate={resumeData.selectedTemplate}
                      onSelect={selectTemplate}
                      templates={TEMPLATES}
                    />
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <ColorCustomizer
                      template={currentTemplate}
                      colors={customColors}
                      onUpdate={updateTemplateColors}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={handleSectionReorder}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <FileUpload 
                      onUpload={handleFileUpload}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2 md:mb-3">Need to edit your information?</h3>
                    <p className="text-blue-700 text-sm md:text-base mb-3">Update your personal details, experience, education, and more.</p>
                    <Link
                      to="/edit"
                      onClick={() => {
                        trackCTAClick('edit_resume_desktop', 'quick_actions', 'resume_builder');
                        trackUserFlow('builder', 'edit', 'navigation');
                        // Track funnel step
                        trackEvent('resume_funnel', {
                          step: 'edit_from_preview',
                          event_category: 'Conversion Funnel',
                          event_label: 'edit_from_preview'
                        });
                      }}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full text-center block font-semibold"
                    >
                      Edit Resume Details
                    </Link>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-gray-800 mb-3 md:mb-4">Explore More Templates</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewModeChange('grid')}
                        className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center font-semibold"
                      >
                        View All Templates
                      </button>
                      <Link
                        to="/premium"
                        onClick={() => {
                          trackCTAClick('view_premium_from_preview', 'template_exploration', 'resume_builder');
                          trackUserFlow('builder', 'premium', 'navigation');
                          // Track funnel step
                          trackEvent('resume_funnel', {
                            step: 'premium_explored',
                            event_category: 'Conversion Funnel',
                            event_label: 'premium_explored'
                          });
                        }}
                        className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center font-semibold"
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
          <div className="mt-6 md:mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-center text-gray-800 mb-4">Why Choose ATS Templates?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div 
                className="text-center cursor-pointer p-3"
                onClick={() => trackButtonClick('feature_ats', 'features_section', 'resume_builder')}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">ATS Friendly</h3>
                <p className="text-gray-600 text-sm mt-1">Optimized for Applicant Tracking Systems</p>
              </div>
              <div 
                className="text-center cursor-pointer p-3"
                onClick={() => trackButtonClick('feature_fast', 'features_section', 'resume_builder')}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Fast Processing</h3>
                <p className="text-gray-600 text-sm mt-1">Quick parsing by automated systems</p>
              </div>
              <div 
                className="text-center cursor-pointer p-3"
                onClick={() => trackButtonClick('feature_professional', 'features_section', 'resume_builder')}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">Professional</h3>
                <p className="text-gray-600 text-sm mt-1">Clean designs that impress recruiters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to calculate resume completion
const calculateResumeCompletion = (resumeData: any): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info
  const personalFields = ['name', 'email', 'phone', 'title'];
  totalFields += personalFields.length;
  completedFields += personalFields.filter(field => {
    const value = resumeData.personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  }).length;

  // Experience (at least one entry with title and company)
  if (resumeData.experiences.length > 0) {
    completedFields += 2;
    totalFields += 2;
  } else {
    totalFields += 2;
  }

  // Education (at least one entry)
  if (resumeData.education.length > 0) {
    completedFields += 2;
    totalFields += 2;
  } else {
    totalFields += 2;
  }

  // Skills (at least 3 skills)
  if (resumeData.skills.length >= 3) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  // Summary (at least one summary point)
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Helper function to count completed sections
const getCompletedSectionsCount = (resumeData: any): number => {
  let completedSections = 0;
  
  // Personal Info (name, email, phone, title)
  const hasPersonalInfo = ['name', 'email', 'phone', 'title'].every(field => {
    const value = resumeData.personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  });
  if (hasPersonalInfo) completedSections++;
  
  // Experience
  if (resumeData.experiences.length > 0) completedSections++;
  
  // Education
  if (resumeData.education.length > 0) completedSections++;
  
  // Skills
  if (resumeData.skills.length >= 3) completedSections++;
  
  // Projects
  if (resumeData.projects.length > 0) completedSections++;
  
  // Awards
  if (resumeData.awards.length > 0) completedSections++;
  
  // Summary
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) completedSections++;
  
  return completedSections;
};

export default ResumeBuilder;