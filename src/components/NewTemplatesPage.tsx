// NewTemplatesPage.tsx - UPDATED WITH TRACKING
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from './ResumeContext';
import ModernIconsTemplate from './ModernIconsTemplate';
import CreativePortfolioTemplate from './CreativePortfolioTemplate';
import NewTemplatesPDFGenerator from './NewTemplatesPDFGenerator';
import SocialSharing from './SocialSharing';
import FileUpload from './FileUpload';
import SectionOrderCustomizer from './SectionOrderCustomizer';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

// QR Code Generator Component
const QRCodeGenerator = () => {
  const [showQR, setShowQR] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const { trackButtonClick } = useGoogleAnalytics();

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const SimpleQRCode = ({ value, size = 128 }: { value: string; size?: number }) => {
    return (
      <div className="border-2 border-gray-300 p-4 bg-white rounded-lg">
        <div className="text-center text-xs text-gray-500 mb-2">
          Scan with your phone camera
        </div>
        <div 
          className="mx-auto border border-gray-200 bg-white p-2"
          style={{ 
            width: size, 
            height: size,
            background: `
              repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px),
              repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-xs text-gray-600 font-semibold">MOBILE PREVIEW</div>
              <div className="text-xs text-gray-500 mt-1">Scan with phone</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-xs text-blue-600 font-mono break-all">
            {url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    );
  };

  const handleQRClick = () => {
    setShowQR(!showQR);
    trackButtonClick('qr_code_toggle', 'qr_generator', 'premium_templates');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleQRClick}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg shadow-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center space-x-2"
      >
        <span>📱</span>
        <span className="text-sm font-semibold">QR Code</span>
      </button>
      
      {showQR && (
        <div className="absolute bottom-16 left-0 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <div className="text-center mb-3">
            <div className="text-sm font-semibold text-gray-800">Test on Mobile</div>
            <div className="text-xs text-gray-500 mt-1">Scan with your phone camera</div>
          </div>
          <SimpleQRCode value={url} size={150} />
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Make sure you're on the same Wi-Fi
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Point your camera at the code
            </div>
          </div>
          <button
            onClick={handleQRClick}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Template Preview Card Component
const TemplatePreviewCard = ({ 
  template, 
  isSelected, 
  onClick,
  templateProps 
}: { 
  template: any;
  isSelected: boolean;
  onClick: () => void;
  templateProps: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { trackButtonClick } = useGoogleAnalytics();

  const getTemplateComponent = (templateId: string) => {
    switch (templateId) {
      case 'modernIcons':
        return <ModernIconsTemplate {...templateProps} />;
      case 'creativePortfolio':
        return <CreativePortfolioTemplate {...templateProps} />;
      default:
        return <ModernIconsTemplate {...templateProps} />;
    }
  };

  const handleCardClick = () => {
    onClick();
    trackButtonClick(`preview_${template.id}`, 'template_grid', 'premium_templates');
  };

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'ring-4 ring-blue-500 scale-105 shadow-2xl' 
          : 'ring-2 ring-gray-200 hover:ring-blue-300 hover:scale-102'
      } rounded-xl overflow-hidden bg-white`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: '300px',
        height: '424px',
        transform: isSelected ? 'scale(1.05)' : isHovered ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {/* Zoomed-out preview container */}
      <div 
        className="absolute inset-0 origin-top-left bg-white"
        style={{
          transform: 'scale(0.3)',
          transformOrigin: '0 0',
          width: '1000px',
          height: '1414px',
          pointerEvents: 'none'
        }}
      >
        {getTemplateComponent(template.id)}
      </div>
      
      {/* Overlay with template info */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${
        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-white">
          <h3 className="font-bold text-lg mb-1">{template.name}</h3>
          <p className="text-sm text-gray-200">Click to select this template</p>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Selected
        </div>
      )}
    </div>
  );
};

const NewTemplatesPage = () => {
  const { resumeData, sectionOrder, handleSectionReorder, handleFileUpload } = useResume();
  const [selectedTemplate, setSelectedTemplate] = useState<'modernIcons' | 'creativePortfolio'>('modernIcons');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'preview'>('grid');

  const modernIconsRef = useRef<HTMLDivElement>(null);
  const creativePortfolioRef = useRef<HTMLDivElement>(null);

  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackTemplateChange,
    trackUserFlow,
    trackPremiumTemplateView,
    trackPageView 
  } = useGoogleAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('Premium Templates', '/premium');
    
    // Track daily visits in localStorage
    const pageViews = parseInt(localStorage.getItem('page_views_premium') || '0');
    localStorage.setItem('page_views_premium', (pageViews + 1).toString());
    
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_premium_${today}`;
    const dailyVisits = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyVisits + 1).toString());
    
    console.log(`📊 Premium Templates Page View Tracked - Total: ${pageViews + 1}`);
  }, [trackPageView]);

  // Template configurations
  const TEMPLATES = {
    modernIcons: {
      id: 'modernIcons',
      name: 'Modern Icons',
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
      layout: 'creativePortfolio',
      colors: {
        primary: '#9333ea',
        secondary: '#db2777',
        accent: '#c084fc',
        background: '#faf5ff',
        text: '#1f2937'
      }
    }
  };

  const currentTemplate = TEMPLATES[selectedTemplate];
  const currentRef = 
    selectedTemplate === 'modernIcons' ? modernIconsRef :
    creativePortfolioRef;

  // Common template props with sectionOrder
  const templateProps = {
    personalInfo: resumeData.personalInfo,
    experiences: resumeData.experiences,
    education: resumeData.education,
    projects: resumeData.projects,
    skills: resumeData.skills,
    awards: resumeData.awards,
    customFields: resumeData.customFields,
    customColors: currentTemplate.colors,
    sectionOrder: sectionOrder
  };

  // Toggle mobile preview
  const toggleMobilePreview = () => {
    setIsMobilePreview(!isMobilePreview);
    trackButtonClick('toggle_mobile_preview', 'preview_controls', 'premium_templates');
  };

  // PDF generation handlers
  const handleDownloadStart = () => {
    setIsGeneratingPDF(true);
    trackButtonClick('pdf_generation_start', 'pdf_download', 'premium_templates');
  };

  const handleDownloadEnd = () => {
    setIsGeneratingPDF(false);
    trackButtonClick('pdf_generation_complete', 'pdf_download', 'premium_templates');
  };

  const getTemplateFeatures = () => {
    switch (selectedTemplate) {
      case 'modernIcons':
        return {
          title: '🎨 Modern Icons Features',
          features: [
            'Beautiful gradient headers with profile picture',
            'Icon-based contact information',
            'Professional skill matrix layout',
            'Modern card layouts',
            'Single column clean design',
            'Professional spacing'
          ]
        };
      case 'creativePortfolio':
        return {
          title: '✨ Creative Portfolio Features',
          features: [
            'Profile picture in creative header',
            'Creative timeline design',
            'Professional skill organization',
            'Portfolio-style project cards',
            'Modern sidebar layout',
            'Interactive elements'
          ]
        };
      default:
        return { title: '', features: [] };
    }
  };

  const templateFeatures = getTemplateFeatures();

  // Template selection handler
  const handleTemplateSelect = (templateId: keyof typeof TEMPLATES) => {
    setSelectedTemplate(templateId);
    setViewMode('preview');
    trackTemplateChange(templateId);
    trackPremiumTemplateView(templateId, 'template_grid');
    trackUserFlow('template_grid', 'template_preview', 'template_selection');
    
    // Track template selection
    const templateKey = `premium_template_${templateId}`;
    const templateSelections = parseInt(localStorage.getItem(templateKey) || '0');
    localStorage.setItem(templateKey, (templateSelections + 1).toString());
  };

  const handleViewModeChange = (mode: 'grid' | 'preview') => {
    setViewMode(mode);
    trackButtonClick(`view_mode_${mode}`, 'navigation', 'premium_templates');
  };

  return (
    <>
      <SEO
        title="Premium Resume Templates - Modern Designs with Profile Pictures | CareerCraft"
        description="Explore premium resume templates with beautiful icons, profile pictures, and modern layouts. Perfect for professionals, creatives, and executives. Download as PDF instantly."
        keywords="premium resume templates, modern CV designs, resume with profile picture, creative portfolio template, executive resume template, professional CV designs"
        canonicalUrl="https://careercraft.in/premium"
      />

      <div className="min-h-screen bg-gray-50 py-1">
        <div className="mx-auto px-1 max-w-[100rem]">
          <header className="text-center mb-3">
            <h1 className="text-xl font-bold text-gray-800 mb-1">Premium Resume Templates</h1>
            <p className="text-sm text-gray-600">Modern designs with beautiful icons, profile pictures, and layouts</p>
            
            <div className="mt-2 flex gap-2 justify-center">
              <Link
                to="/edit"
                onClick={() => {
                  trackCTAClick('edit_resume', 'header', 'premium_templates');
                  trackUserFlow('premium', 'edit', 'navigation');
                  
                  // Track navigation from premium to edit
                  const navCount = parseInt(localStorage.getItem('premium_to_edit') || '0');
                  localStorage.setItem('premium_to_edit', (navCount + 1).toString());
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </Link>
              
              {viewMode === 'preview' && (
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  View All Templates
                </button>
              )}
            </div>
            
            {/* Analytics Info */}
            <div className="mt-2 text-xs text-gray-500">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {localStorage.getItem('page_views_premium') || '0'} premium views
              </span>
            </div>
          </header>

          {/* MOBILE LAYOUT: Vertical stack */}
          <div className="block lg:hidden space-y-2">
            {/* Template Grid View for Mobile */}
            {viewMode === 'grid' && (
              <div className="bg-white rounded-md shadow-sm p-2">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Choose Your Template</h3>
                <div className="flex flex-col items-center gap-4">
                  {Object.values(TEMPLATES).map((template) => (
                    <TemplatePreviewCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onClick={() => handleTemplateSelect(template.id as keyof typeof TEMPLATES)}
                      templateProps={templateProps}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Preview Container */}
            {viewMode === 'preview' && (
              <div className="bg-white rounded-md shadow-sm p-2">
                {/* Mobile Preview Toggle */}
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
                </div>

                {/* Template Preview */}
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
                    {selectedTemplate === 'modernIcons' ? (
                      <div ref={modernIconsRef}>
                        <ModernIconsTemplate {...templateProps} />
                      </div>
                    ) : (
                      <div ref={creativePortfolioRef}>
                        <CreativePortfolioTemplate {...templateProps} />
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Download Section */}
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <NewTemplatesPDFGenerator 
                    resumeRef={currentRef as React.RefObject<HTMLDivElement>}
                    personalInfo={resumeData.personalInfo}
                    template={currentTemplate}
                    onDownloadStart={handleDownloadStart}
                    onDownloadEnd={handleDownloadEnd}
                  />
                </div>

                {/* Social Sharing */}
                <div className="mt-2">
                  <SocialSharing 
                    resumeTitle={resumeData.personalInfo.title}
                  />
                </div>
              </div>
            )}

            {/* Controls Section */}
            <div className="space-y-2">
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

              <div className="bg-purple-50 p-2 rounded-md border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-1 text-xs">Need to edit your information?</h3>
                <Link
                  to="/edit"
                  onClick={() => {
                    trackCTAClick('edit_resume_mobile', 'quick_actions', 'premium_templates');
                    trackUserFlow('premium', 'edit', 'navigation');
                  }}
                  className="bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition-colors w-full text-center block text-xs"
                >
                  Edit Resume Details
                </Link>
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden lg:block">
            {/* Template Grid View for Desktop */}
            {viewMode === 'grid' && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Perfect Resume Template</h2>
                <div className="flex justify-center gap-8 flex-wrap">
                  {Object.values(TEMPLATES).map((template) => (
                    <TemplatePreviewCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onClick={() => handleTemplateSelect(template.id as keyof typeof TEMPLATES)}
                      templateProps={templateProps}
                    />
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600 text-sm">
                    Click on any template to preview it in full size and download as PDF
                  </p>
                </div>
              </div>
            )}

            {/* Full Preview View for Desktop */}
            {viewMode === 'preview' && (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Content - Template Preview */}
                <div className="xl:w-2/3">
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    {/* Template Preview Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">{currentTemplate.name} Template</h2>
                      <button
                        onClick={() => handleViewModeChange('grid')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        View All Templates
                      </button>
                    </div>

                    {/* Template Preview */}
                    <div className="mb-4 border-2 border-gray-200 rounded-lg overflow-hidden">
                      {selectedTemplate === 'modernIcons' ? (
                        <div ref={modernIconsRef}>
                          <ModernIconsTemplate {...templateProps} />
                        </div>
                      ) : (
                        <div ref={creativePortfolioRef}>
                          <CreativePortfolioTemplate {...templateProps} />
                        </div>
                      )}
                    </div>

                    {/* PDF Download Section */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Download Your Resume</h3>
                      <NewTemplatesPDFGenerator 
                        resumeRef={currentRef as React.RefObject<HTMLDivElement>}
                        personalInfo={resumeData.personalInfo}
                        template={currentTemplate}
                        onDownloadStart={handleDownloadStart}
                        onDownloadEnd={handleDownloadEnd}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      <SocialSharing 
                        resumeTitle={resumeData.personalInfo.title}
                      />
                    </div>

                    {/* Template Features */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        {templateFeatures.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        {templateFeatures.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Analytics Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm">📊 Premium Template Analytics</h3>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <div className="text-gray-500">Selected Template</div>
                          <div className="font-bold">{currentTemplate.name}</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="text-gray-500">Template Views</div>
                          <div className="font-bold text-purple-600">
                            {localStorage.getItem(`premium_template_${selectedTemplate}`) || '0'}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="text-gray-500">Total Premium Views</div>
                          <div className="font-bold text-blue-600">
                            {localStorage.getItem('page_views_premium') || '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Controls */}
                <div className="xl:w-1/3">
                  <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Template Controls</h2>
                    
                    {/* Quick Template Switcher */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Quick Switch</h3>
                      <div className="flex flex-col gap-2">
                        {Object.values(TEMPLATES).map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setSelectedTemplate(template.id as keyof typeof TEMPLATES);
                              trackButtonClick(`quick_switch_${template.id}`, 'template_switcher', 'premium_templates');
                            }}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm text-left ${
                              selectedTemplate === template.id
                                ? template.id === 'modernIcons'
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <SectionOrderCustomizer 
                        sections={sectionOrder}
                        onReorder={handleSectionReorder}
                      />

                      <FileUpload 
                        onUpload={handleFileUpload}
                      />

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-800 mb-2">Need to edit your information?</h3>
                        <p className="text-purple-700 text-sm mb-3">Update your personal details, experience, education, and more.</p>
                        <Link
                          to="/edit"
                          onClick={() => {
                            trackCTAClick('edit_resume_desktop', 'quick_actions', 'premium_templates');
                            trackUserFlow('premium', 'edit', 'navigation');
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full text-center block"
                        >
                          Edit Resume Details
                        </Link>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Explore More Templates</h3>
                        <div className="flex gap-3">
                          <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
                            Premium Templates
                          </button>
                          <Link
                            to="/builder"
                            onClick={() => {
                              trackCTAClick('view_ats_templates', 'template_exploration', 'premium_templates');
                              trackUserFlow('premium', 'builder', 'navigation');
                            }}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                          >
                            ATS Templates
                          </Link>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2 text-sm">Quick Tips</h3>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Upload a professional profile picture</li>
                          <li>• Arrange sections in your preferred order</li>
                          <li>• Use high-quality images for best results</li>
                          <li>• Premium templates work best with complete information</li>
                        </ul>
                      </div>
                      
                      {/* Analytics Tracking Info */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2 text-sm">Analytics Tracking Active</h3>
                        <div className="text-xs text-green-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Total Premium Views:</span>
                            <span className="font-bold">{localStorage.getItem('page_views_premium') || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{currentTemplate.name} Views:</span>
                            <span className="font-bold">{localStorage.getItem(`premium_template_${selectedTemplate}`) || '0'}</span>
                          </div>
                          <div className="mt-2 text-xs text-green-600">
                            Google Analytics Property: G-JW2bS0D8YB
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Edit Section */}
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200 inline-block">
              <h3 className="text-base font-bold text-gray-800 mb-1">Ready to customize your resume?</h3>
              <p className="text-gray-600 text-xs mb-2">Add your personal information, experience, education, and more</p>
              <Link
                to="/edit"
                onClick={() => {
                  trackCTAClick('edit_resume_footer', 'footer', 'premium_templates');
                  trackUserFlow('premium', 'edit', 'navigation');
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume Information
              </Link>
            </div>
          </div>
          
          {/* Analytics Footer */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Premium Template Analytics Tracking Active
              </div>
              <div className="flex gap-4">
                <span>Views: {localStorage.getItem('page_views_premium') || '0'}</span>
                <span>Template: {currentTemplate.name}</span>
                <span>Selected: {localStorage.getItem(`premium_template_${selectedTemplate}`) || '0'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Generator */}
          <QRCodeGenerator />
        </div>
      </div>
    </>
  );
};

export default NewTemplatesPage;