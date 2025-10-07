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
      };
      
      // Apply mobile-optimized styles for PDF generation
      resumeRef.current.style.width = '595px'; // A4 width in pixels at 72 DPI
      resumeRef.current.style.height = 'auto';
      resumeRef.current.style.overflow = 'visible';
      resumeRef.current.style.transform = 'scale(1)';
      
      // Force font loading
      await document.fonts.ready;
      
      // Use type assertion for html2canvas options
      const canvas = await html2canvas(resumeRef.current, {
        scale: 1.5, // This is a valid option, but TypeScript definitions might be outdated:cite[2]
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          const previewElement = clonedDoc.getElementById('resume-preview');
          if (previewElement) {
            previewElement.style.width = '595px';
            previewElement.style.fontFamily = "'Arial', 'Helvetica', sans-serif";
            
            // Optimize images in the clone
            const images = previewElement.querySelectorAll('img');
            images.forEach((img: HTMLImageElement) => {
              img.style.imageRendering = 'auto';
              img.loading = 'eager';
            });
            
            // Ensure all circular elements maintain their shape
            const circularElements = previewElement.querySelectorAll('.rounded-full, [style*="border-radius"]');
            circularElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                if (el.classList.contains('rounded-full') || 
                    el.style.borderRadius.includes('50%') || 
                    el.style.borderRadius.includes('9999px')) {
                  el.style.borderRadius = '50%';
                  el.style.overflow = 'hidden';
                }
                el.style.fontFamily = "'Arial', 'Helvetica', sans-serif";
                el.style.letterSpacing = 'normal';
              }
            });
            
            // Ensure all text elements use consistent fonts
            const textElements = previewElement.querySelectorAll('*');
            textElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                el.style.fontFamily = "'Arial', 'Helvetica', sans-serif";
                el.style.letterSpacing = 'normal';
                el.style.boxShadow = 'none';
                el.style.filter = 'none';
              }
            });

            // Remove any animations or transitions
            previewElement.style.animation = 'none';
            previewElement.style.transition = 'none';
          }
        }
      } as any); // Type assertion to bypass TypeScript errors
      
      // Restore original styles
      resumeRef.current.style.width = originalStyles.width;
      resumeRef.current.style.height = originalStyles.height;
      resumeRef.current.style.overflow = originalStyles.overflow;
      resumeRef.current.style.transform = originalStyles.transform;
      
      // Convert canvas to JPEG with lower quality to reduce file size:cite[1]
      const jpegQuality = 0.7;
      const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
      
      // Calculate dimensions for A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add main image with compression:cite[1]
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      // Handle multi-page PDF
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 1;
      
      while (heightLeft > pdfHeight) {
        position = -(pageCount * pdfHeight);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        pageCount++;
        
        if (pageCount > 10) break;
      }
      
      // Generate filename
      const fileName = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      
      // Track the download BEFORE saving
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
            Download PDF (Optimized for Size)
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Generating optimized PDF (target: under 2MB)...</p>
          <p className="text-xs mt-1">This may take a moment on mobile devices.</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>PDF optimized for smaller file size and mobile devices</p>
      </div>
    </div>
  );
};

export default MobilePDFGenerator;