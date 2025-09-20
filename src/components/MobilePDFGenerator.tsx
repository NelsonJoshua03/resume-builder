// Create a new component: MobilePDFGenerator.tsx
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

const MobilePDFGenerator = ({ 
  resumeRef, 
  personalInfo, 
  onDownloadStart, 
  onDownloadEnd 
}: MobilePDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    onDownloadStart?.();
    
    try {
      // Store original styles
      const originalStyles = {
        width: resumeRef.current.style.width,
        height: resumeRef.current.style.height,
        overflow: resumeRef.current.style.overflow,
      };
      
      // Apply mobile-optimized styles for PDF generation
      resumeRef.current.style.width = '794px'; // A4 width in pixels
      resumeRef.current.style.height = 'auto';
      resumeRef.current.style.overflow = 'visible';
      
      // Force font loading
      await document.fonts.ready;
      
      const canvas = await html2canvas(resumeRef.current, {
        scale: 3, // Higher scale for better quality on mobile
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          // Apply mobile-specific styles to the clone
          const previewElement = clonedDoc.getElementById('resume-preview');
          if (previewElement) {
            previewElement.style.width = '794px';
            previewElement.style.fontFamily = "'Arial', 'Helvetica', sans-serif";
            
            // Ensure all text elements use consistent fonts
            const textElements = previewElement.querySelectorAll('*');
            textElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                el.style.fontFamily = "'Arial', 'Helvetica', sans-serif";
                el.style.letterSpacing = 'normal';
              }
            });
          }
        }
      } as any);
      
      // Restore original styles
      resumeRef.current.style.width = originalStyles.width;
      resumeRef.current.style.height = originalStyles.height;
      resumeRef.current.style.overflow = originalStyles.overflow;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Handle multi-page resumes - FIXED: Removed duplicate first page
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight; // Start position for next page
      
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
      
      pdf.save(`${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors shadow-md w-full"
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Generating PDF...
          </>
        ) : (
          <>
            <i className="fas fa-download mr-2"></i>
            Download PDF (Mobile Optimized)
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>This may take a moment on mobile devices...</p>
        </div>
      )}
    </div>
  );
};

export default MobilePDFGenerator;