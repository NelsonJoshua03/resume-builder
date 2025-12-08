// ImprovedPDFGenerator.tsx - UPDATED WITH ANALYTICS
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface ImprovedPDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
    profilePicture?: string;
  };
  template: {
    id: string;
    name: string;
    layout: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

const ImprovedPDFGenerator: React.FC<ImprovedPDFGeneratorProps> = ({ 
  resumeRef, 
  personalInfo,
  template,
  onDownloadStart, 
  onDownloadEnd 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackResumeDownload, trackButtonClick, trackError, getDeviceType } = useGoogleAnalytics();

  const trackDownload = (fileName: string) => {
    const device = getDeviceType();
    
    // Track to Google Analytics
    trackResumeDownload('PDF', template.name, 'improved_generator');
    
    // Enhanced local tracking for premium templates
    try {
      // Premium template specific tracking
      const premiumKey = `premium_downloads_${template.id}`;
      const premiumDownloads = parseInt(localStorage.getItem(premiumKey) || '0');
      localStorage.setItem(premiumKey, (premiumDownloads + 1).toString());
      
      // Track premium vs regular
      const totalPremium = parseInt(localStorage.getItem('total_premium_downloads') || '0');
      localStorage.setItem('total_premium_downloads', (totalPremium + 1).toString());
      
      // Device tracking
      const deviceKey = `premium_downloads_${device}`;
      const deviceDownloads = parseInt(localStorage.getItem(deviceKey) || '0');
      localStorage.setItem(deviceKey, (deviceDownloads + 1).toString());
      
      // Store detailed history
      const premiumHistory = JSON.parse(localStorage.getItem('premium_download_history') || '[]');
      premiumHistory.push({
        template: template.name,
        templateId: template.id,
        fileName,
        device,
        timestamp: new Date().toISOString(),
        layout: template.layout,
        isPremium: true
      });
      
      if (premiumHistory.length > 50) {
        premiumHistory.splice(0, premiumHistory.length - 50);
      }
      
      localStorage.setItem('premium_download_history', JSON.stringify(premiumHistory));
      
      console.log(`🎯 Premium Download: ${template.name} on ${device}`);
    } catch (error) {
      console.error('Premium tracking failed:', error);
    }
  };

  const generatePDF = async () => {
    if (!resumeRef.current) {
      setError('Resume content not available');
      trackError('missing_resume_ref', 'Resume ref is null', 'ImprovedPDFGenerator');
      return;
    }

    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    // Track start
    trackButtonClick('premium_pdf_start', 'pdf_generator', 'premium_templates');

    const element = resumeRef.current;
    
    // Store original styles
    const originalTransform = element.style.transform;
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalPosition = element.style.position;
    const originalOverflow = element.style.overflow;
    
    try {
      // Prepare element for capture
      element.style.transform = 'scale(1)';
      element.style.transformOrigin = 'top left';
      element.style.width = '210mm';
      element.style.maxWidth = 'none';
      element.style.position = 'relative';
      element.style.overflow = 'visible';
      
      // Force reflow
      element.offsetHeight;
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate canvas with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          try {
            // Find the resume template in cloned document
            const resumeElement = clonedDoc.querySelector('[data-resume-template]') || clonedDoc.body;
            
            // Cast to HTMLElement to access style property
            const htmlResumeElement = resumeElement as HTMLElement;
            
            // Remove all SVG elements that cause issues
            const svgs = htmlResumeElement.querySelectorAll('svg');
            svgs.forEach((svg: SVGElement) => {
              const parent = svg.parentElement;
              if (parent) {
                // Replace SVG with a simple div
                const replacement = clonedDoc.createElement('div');
                replacement.style.display = 'inline-block';
                replacement.style.width = '20px';
                replacement.style.height = '20px';
                replacement.style.backgroundColor = '#666';
                parent.replaceChild(replacement, svg);
              }
            });
            
            // Fix all elements for PDF rendering
            const allElements = htmlResumeElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              
              // Force visibility
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              
              // Handle gradient backgrounds
              if (computedStyle.backgroundImage && computedStyle.backgroundImage.includes('gradient')) {
                let solidColor = '#ffffff';
                
                if (computedStyle.backgroundImage.includes('from-blue-')) {
                  solidColor = '#60a5fa';
                }
                else if (computedStyle.backgroundImage.includes('from-purple-600')) {
                  solidColor = '#9333ea';
                }
                
                el.style.backgroundImage = 'none';
                el.style.backgroundColor = solidColor;
              }
              
              // Remove problematic CSS properties
              el.style.transition = 'none';
              el.style.animation = 'none';
              el.style.transform = 'none';
              
              // Ensure proper font rendering
              el.style.fontFamily = computedStyle.fontFamily;
              el.style.fontSize = computedStyle.fontSize;
              el.style.fontWeight = computedStyle.fontWeight;
            });
            
            // Ensure main element has proper dimensions
            if (htmlResumeElement !== clonedDoc.body) {
              htmlResumeElement.style.width = '210mm';
              htmlResumeElement.style.minHeight = '297mm';
              htmlResumeElement.style.backgroundColor = '#ffffff';
            }
          } catch (cloneError: any) {
            console.error('Error in onclone:', cloneError);
            trackError('pdf_clone_error', cloneError.message, 'generatePDF');
          }
        }
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Convert to image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Add pages
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      // Add metadata
      pdf.setProperties({
        title: `${personalInfo.name || 'Resume'} - ${template.name}`,
        subject: 'Premium Resume',
        author: 'CareerCraft Premium Templates',
        keywords: 'premium, resume, cv, career',
        creator: 'CareerCraft'
      });

      // Download
      const fileName = `${personalInfo.name?.replace(/\s+/g, '_') || 'resume'}_${template.name.replace(/\s+/g, '_')}_Premium.pdf`;
      
      // Track before download
      trackDownload(fileName);
      
      pdf.save(fileName);
      
      // Track successful completion
      trackButtonClick('premium_pdf_success', 'pdf_generator', 'premium_templates');
      
      setError(null);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
      
      // Track the error
      trackError('premium_pdf_failed', err.message, 'generatePDF');
    } finally {
      // Restore original styles
      element.style.transform = originalTransform;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.position = originalPosition;
      element.style.overflow = originalOverflow;
      
      setIsGenerating(false);
      onDownloadEnd?.();
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={generatePDF}
        disabled={isGenerating}
        className={`bg-gradient-to-r ${
          template.id === 'modernIcons' 
            ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
            : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        } text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed`}
        data-analytics-event="premium_pdf_download"
        data-template={template.id}
        data-device={getDeviceType()}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Premium PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Premium PDF
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-center text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        <p>🎯 Premium template with enhanced styling</p>
        <p className="mt-1">📊 Analytics: Tracking downloads by device ({getDeviceType()})</p>
      </div>
      
      {/* Analytics info */}
      <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded">
        <p>ℹ️ Downloads tracked: Premium templates + Device type</p>
      </div>
    </div>
  );
};

export default ImprovedPDFGenerator;