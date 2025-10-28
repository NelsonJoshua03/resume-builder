import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MobilePDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: {
    name: string;
  };
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

// Track download function
const trackDownload = (fileName: string) => {
  // Track in Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'download', {
      'event_category': 'resume',
      'event_label': fileName,
      'value': 1
    });
  }
  
  // Track in localStorage for simple counter
  try {
    const currentDownloads = parseInt(localStorage.getItem('resumeDownloads') || '0');
    localStorage.setItem('resumeDownloads', (currentDownloads + 1).toString());
    
    // Also track total downloads by template type if available
    const templateType = localStorage.getItem('currentTemplate') || 'default';
    const templateDownloads = parseInt(localStorage.getItem(`downloads_${templateType}`) || '0');
    localStorage.setItem(`downloads_${templateType}`, (templateDownloads + 1).toString());
  } catch (error) {
    console.log('LocalStorage tracking failed:', error);
  }
  
  console.log(`📊 Download tracked: ${fileName}`);
};

const MobilePDFGenerator = ({ 
  resumeRef, 
  personalInfo, 
  onDownloadStart, 
  onDownloadEnd 
}: MobilePDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    try {
      // Store original styles
      const originalStyles = {
        width: resumeRef.current.style.width,
        height: resumeRef.current.style.height,
        overflow: resumeRef.current.style.overflow,
        transform: resumeRef.current.style.transform,
        fontFamily: resumeRef.current.style.fontFamily,
        fontSize: resumeRef.current.style.fontSize,
        lineHeight: resumeRef.current.style.lineHeight,
        letterSpacing: resumeRef.current.style.letterSpacing,
      };
      
      // Apply PDF-optimized styles
      const pdfWidthPixels = 595; // A4 width in pixels at 72 DPI
      resumeRef.current.style.width = `${pdfWidthPixels}px`;
      resumeRef.current.style.height = 'auto';
      resumeRef.current.style.overflow = 'visible';
      resumeRef.current.style.transform = 'scale(1)';
      
      // Force consistent fonts and spacing for PDF
      resumeRef.current.style.fontFamily = "'Arial', 'Helvetica', 'Segoe UI', sans-serif";
      resumeRef.current.style.fontSize = '14px';
      resumeRef.current.style.lineHeight = '1.4';
      resumeRef.current.style.letterSpacing = 'normal';
      
      // Force font loading
      await document.fonts.ready;
      
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true,
        onclone: (clonedDoc: Document) => {
          const previewElement = clonedDoc.getElementById('resume-preview');
          if (previewElement) {
            // Apply PDF-optimized styles to the clone
            previewElement.style.width = `${pdfWidthPixels}px`;
            previewElement.style.fontFamily = "'Arial', 'Helvetica', 'Segoe UI', sans-serif";
            previewElement.style.fontSize = '14px';
            previewElement.style.lineHeight = '1.4';
            previewElement.style.letterSpacing = 'normal';
            previewElement.style.wordSpacing = 'normal';
            
            // Optimize all text elements for consistent rendering
            const allElements = previewElement.querySelectorAll('*');
            allElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                // Ensure consistent fonts
                el.style.fontFamily = "'Arial', 'Helvetica', 'Segoe UI', sans-serif";
                el.style.letterSpacing = 'normal';
                el.style.wordSpacing = 'normal';
                el.style.textRendering = 'geometricPrecision';
                el.style.fontKerning = 'normal';
                
                // Remove any problematic styles
                el.style.boxShadow = 'none';
                el.style.filter = 'none';
                el.style.transform = 'none';
                el.style.transition = 'none';
                el.style.animation = 'none';
              }
            });
            
            // Optimize images
            const images = previewElement.querySelectorAll('img');
            images.forEach((img: HTMLImageElement) => {
              img.style.imageRendering = 'auto';
              img.loading = 'eager';
              img.decoding = 'sync';
            });
            
            // Ensure circular elements maintain shape
            const circularElements = previewElement.querySelectorAll('.rounded-full, [style*="border-radius"]');
            circularElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                if (el.classList.contains('rounded-full') || 
                    el.style.borderRadius.includes('50%') || 
                    el.style.borderRadius.includes('9999px')) {
                  el.style.borderRadius = '50%';
                  el.style.overflow = 'hidden';
                }
              }
            });
          }
        }
      } as any); // Type assertion to bypass TypeScript errors for html2canvas options
      
      // Restore original styles
      resumeRef.current.style.width = originalStyles.width;
      resumeRef.current.style.height = originalStyles.height;
      resumeRef.current.style.overflow = originalStyles.overflow;
      resumeRef.current.style.transform = originalStyles.transform;
      resumeRef.current.style.fontFamily = originalStyles.fontFamily;
      resumeRef.current.style.fontSize = originalStyles.fontSize;
      resumeRef.current.style.lineHeight = originalStyles.lineHeight;
      resumeRef.current.style.letterSpacing = originalStyles.letterSpacing;
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidthMM = 210; // A4 width in mm
      const pdfHeightMM = 297; // A4 height in mm
      
      // Calculate image dimensions maintaining aspect ratio
      const imgWidth = pdfWidthMM;
      const imgHeight = (canvas.height * pdfWidthMM) / canvas.width;
      
      // Convert canvas to image with good quality
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      
      // Add main image
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'MEDIUM');
      
      // Handle multi-page PDF
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 1;
      
      // Add additional pages if content is longer than one page
      while (heightLeft > pdfHeightMM) {
        position = heightLeft - pdfHeightMM;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight, undefined, 'MEDIUM');
        heightLeft -= pdfHeightMM;
        pageCount++;
        
        // Safety limit
        if (pageCount > 10) break;
      }
      
      // Generate filename
      const fileName = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      
      // Track the download
      trackDownload(fileName);
      
      // Save the PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      onDownloadEnd?.();
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={downloadPDF}
        disabled={isGenerating}
        aria-label={isGenerating ? "Generating PDF document" : "Download PDF document"}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors shadow-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Generating PDF...
          </>
        ) : (
          <>
            <i className="fas fa-download mr-2"></i>
            Download PDF (Professional Format)
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Generating professional PDF with consistent fonts...</p>
          <p className="text-xs mt-1">This may take a moment on mobile devices.</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button 
            onClick={downloadPDF}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Optimized for consistent fonts (Arial/Helvetica) and proper spacing</p>
        <p className="mt-1">Works perfectly on both mobile and desktop</p>
      </div>
    </div>
  );
};

export default MobilePDFGenerator;