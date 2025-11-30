// ImprovedPDFGenerator.tsx
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const generatePDF = async () => {
    if (!resumeRef.current) {
      setError('Resume content not available');
      return;
    }

    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();

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
            
            // Remove all SVG elements that cause issues
            const svgs = resumeElement.querySelectorAll('svg');
            svgs.forEach((svg: SVGElement) => {
              // Replace SVG with a simple div or remove it
              const parent = svg.parentElement;
              if (parent) {
                // For icon SVGs, just remove them or replace with text
                const replacement = clonedDoc.createElement('span');
                replacement.style.display = 'inline-block';
                replacement.style.width = '20px';
                replacement.style.height = '20px';
                parent.replaceChild(replacement, svg);
              }
            });
            
            // Fix all elements for PDF rendering
            const allElements = resumeElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              
              // Force visibility
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              
              // Handle gradient backgrounds - replace with solid colors for better PDF rendering
              if (computedStyle.backgroundImage && computedStyle.backgroundImage.includes('gradient')) {
                let solidColor = '#ffffff';
                
                // Handle ModernIconsTemplate blue-purple gradient
                if (computedStyle.backgroundImage.includes('from-blue-400') || computedStyle.backgroundImage.includes('from-blue-')) {
                  solidColor = '#60a5fa'; // blue-400
                }
                // Handle CreativePortfolioTemplate purple-pink gradient
                else if (computedStyle.backgroundImage.includes('from-purple-600') || computedStyle.backgroundImage.includes('to-pink-600')) {
                  solidColor = '#9333ea'; // purple-600
                }
                
                el.style.backgroundImage = 'none';
                el.style.backgroundColor = solidColor;
              }
              
              // Remove any elliptical backgrounds (border-radius with colored backgrounds)
              if (computedStyle.backgroundColor && 
                  computedStyle.borderRadius && 
                  computedStyle.borderRadius !== '0px' &&
                  !computedStyle.backgroundColor.includes('rgba(0, 0, 0, 0)')) {
                // Remove background color from period time elements and similar
                if (el.textContent && (el.textContent.includes('202') || el.classList.contains('text-xs'))) {
                  el.style.backgroundColor = 'transparent';
                  el.style.borderRadius = '0';
                }
              }
              
              // Ensure solid background colors are preserved (except for period times)
              if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                // Skip setting background for period time elements
                if (!el.textContent || !el.textContent.match(/\d{4}.*\d{4}/)) {
                  el.style.backgroundColor = computedStyle.backgroundColor;
                }
              }
              
              // Ensure text colors are preserved
              if (computedStyle.color) {
                el.style.color = computedStyle.color;
              }
              
              // Handle images
              if (el.tagName === 'IMG') {
                el.style.display = 'block';
                el.style.opacity = '1';
                el.style.visibility = 'visible';
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
            if (resumeElement !== clonedDoc.body) {
              resumeElement.style.width = '210mm';
              resumeElement.style.minHeight = '297mm';
              resumeElement.style.backgroundColor = '#ffffff';
            }
          } catch (cloneError) {
            console.error('Error in onclone:', cloneError);
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

      // Download
      const fileName = `${personalInfo.name?.replace(/\s+/g, '_') || 'resume'}_${template.name.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      
      setError(null);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
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
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-center text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        <p>📄 Optimized for A4 paper (210mm × 297mm)</p>
        {isMobileDevice() && (
          <p className="text-blue-600 mt-1">📱 Mobile: Generating high-quality PDF</p>
        )}
      </div>
    </div>
  );
};

export default ImprovedPDFGenerator;