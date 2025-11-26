import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from './ResumeContext';
import ModernIconsTemplate from './ModernIconsTemplate';
import CreativePortfolioTemplate from './CreativePortfolioTemplate';
import ProfessionalExecutiveTemplate from './ProfessionalExecutiveTemplate';
import NewTemplatesPDFGenerator from './NewTemplatesPDFGenerator';
import SocialSharing from './SocialSharing';
import FileUpload from './FileUpload';
import SectionOrderCustomizer from './SectionOrderCustomizer';

// QR Code Generator Component
const QRCodeGenerator = () => {
  const [showQR, setShowQR] = React.useState(false);
  const [url, setUrl] = React.useState('');

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

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowQR(!showQR)}
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
            onClick={() => setShowQR(false)}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const NewTemplatesPage = () => {
  const { resumeData, sectionOrder, handleSectionReorder, handleFileUpload } = useResume();
  const [selectedTemplate, setSelectedTemplate] = useState<'modernIcons' | 'creativePortfolio' | 'professionalExecutive'>('modernIcons');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  const modernIconsRef = useRef<HTMLDivElement>(null);
  const creativePortfolioRef = useRef<HTMLDivElement>(null);
  const professionalExecutiveRef = useRef<HTMLDivElement>(null);

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
    },
    professionalExecutive: {
      id: 'professionalExecutive',
      name: 'Professional Executive',
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

  const currentTemplate = TEMPLATES[selectedTemplate];
  const currentRef = 
    selectedTemplate === 'modernIcons' ? modernIconsRef :
    selectedTemplate === 'creativePortfolio' ? creativePortfolioRef :
    professionalExecutiveRef;

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
  };

  // PDF generation handlers
  const handleDownloadStart = () => {
    setIsGeneratingPDF(true);
  };

  const handleDownloadEnd = () => {
    setIsGeneratingPDF(false);
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
      case 'professionalExecutive':
        return {
          title: '💼 Professional Executive Features',
          features: [
            'Executive profile picture display',
            'Elegant dark header design',
            'Professional skill grouping',
            'Executive typography',
            'Corporate color scheme',
            'Premium aesthetic'
          ]
        };
      default:
        return { title: '', features: [] };
    }
  };

  const templateFeatures = getTemplateFeatures();

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto px-1 max-w-[100rem]">
        <header className="text-center mb-3">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Premium Resume Templates</h1>
          <p className="text-sm text-gray-600">Modern designs with beautiful icons, profile pictures, and layouts</p>
          
          <div className="mt-2">
            <Link
              to="/edit"
              className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Resume
            </Link>
          </div>
        </header>

        {/* MOBILE LAYOUT: Vertical stack */}
        <div className="block lg:hidden space-y-2">
          {/* Template Selector - Compact Horizontal */}
          <div className="bg-white rounded-md shadow-sm p-2">
            <div className="flex space-x-1 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTemplate('modernIcons')}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-all ${
                  selectedTemplate === 'modernIcons'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎨 Modern
              </button>
              <button
                onClick={() => setSelectedTemplate('creativePortfolio')}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-all ${
                  selectedTemplate === 'creativePortfolio'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✨ Creative
              </button>
              <button
                onClick={() => setSelectedTemplate('professionalExecutive')}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-all ${
                  selectedTemplate === 'professionalExecutive'
                    ? 'bg-gradient-to-r from-slate-700 to-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💼 Executive
              </button>
            </div>
          </div>

          {/* Preview Container */}
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
                ) : selectedTemplate === 'creativePortfolio' ? (
                  <div ref={creativePortfolioRef}>
                    <CreativePortfolioTemplate {...templateProps} />
                  </div>
                ) : (
                  <div ref={professionalExecutiveRef}>
                    <ProfessionalExecutiveTemplate {...templateProps} />
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
                className="bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition-colors w-full text-center block text-xs"
              >
                Edit Resume Details
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT: Standard layout */}
        <div className="hidden lg:flex flex-col xl:flex-row gap-4">
          {/* Main Content - Template Preview */}
          <div className="xl:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-4">
              {/* Template Preview */}
              <div className="mb-4">
                {selectedTemplate === 'modernIcons' ? (
                  <div ref={modernIconsRef}>
                    <ModernIconsTemplate {...templateProps} />
                  </div>
                ) : selectedTemplate === 'creativePortfolio' ? (
                  <div ref={creativePortfolioRef}>
                    <CreativePortfolioTemplate {...templateProps} />
                  </div>
                ) : (
                  <div ref={professionalExecutiveRef}>
                    <ProfessionalExecutiveTemplate {...templateProps} />
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
            </div>
          </div>

          {/* Right Sidebar - Controls */}
          <div className="xl:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Template Controls</h2>
              
              {/* Template Selector for Desktop */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Choose Template</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedTemplate('modernIcons')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm text-left ${
                      selectedTemplate === 'modernIcons'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎨 Modern Icons
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('creativePortfolio')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm text-left ${
                      selectedTemplate === 'creativePortfolio'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✨ Creative Portfolio
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('professionalExecutive')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm text-left ${
                      selectedTemplate === 'professionalExecutive'
                        ? 'bg-gradient-to-r from-slate-700 to-gray-800 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💼 Professional Executive
                  </button>
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
                      to="/"
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
              </div>
            </div>
          </div>
        </div>

        {/* Quick Edit Section */}
        <div className="mt-4 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200 inline-block">
            <h3 className="text-base font-bold text-gray-800 mb-1">Ready to customize your resume?</h3>
            <p className="text-gray-600 text-xs mb-2">Add your personal information, experience, education, and more</p>
            <Link
              to="/edit"
              className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-1 text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Resume Information
            </Link>
          </div>
        </div>

        {/* QR Code Generator */}
        <QRCodeGenerator />
      </div>
    </div>
  );
};

export default NewTemplatesPage;