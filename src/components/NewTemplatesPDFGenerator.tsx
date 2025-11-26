import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NewTemplatesPDFGenerator = ({ 
  resumeRef, 
  personalInfo,
  template,
  onDownloadStart, 
  onDownloadEnd 
}: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = async () => {
    if (!resumeRef.current) {
      setError('Resume content not found. Please try refreshing the page.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    try {
      const element = resumeRef.current;
      
      // Create a clone of the element to avoid disturbing the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Apply PDF styles to the clone
      clone.style.width = '793.7px';
      clone.style.minHeight = '1122.5px';
      clone.style.height = 'auto';
      clone.style.maxWidth = 'none';
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'unset';
      clone.style.overflow = 'visible';
      clone.style.position = 'relative';
      clone.style.background = 'white';
      clone.style.margin = '0';
      clone.style.padding = '0';
      
      // CRITICAL FIX: Force all gradients to be replaced with solid colors
      const gradientsElements = clone.querySelectorAll('[class*="gradient"], [style*="gradient"]');
      gradientsElements.forEach((el: any) => {
        const computedStyle = window.getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;
        
        // Replace gradient with solid color based on template
        if (template?.id === 'modernIcons') {
          el.style.background = '#4f46e5'; // Solid blue
        } else if (template?.id === 'creativePortfolio') {
          el.style.background = '#9333ea'; // Solid purple
        } else if (template?.id === 'professionalExecutive') {
          el.style.background = '#1e293b'; // Solid slate
        } else {
          el.style.background = bgColor || '#4f46e5';
        }
        el.style.backgroundImage = 'none';
      });

      // Force color rendering for all colored elements
      const coloredElements = clone.querySelectorAll('*');
      coloredElements.forEach((el: any) => {
        const computedStyle = window.getComputedStyle(el);
        
        // Force background colors
        if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          el.style.backgroundColor = computedStyle.backgroundColor;
        }
        
        // Force text colors
        if (computedStyle.color) {
          el.style.color = computedStyle.color;
        }

        // Force border colors
        if (computedStyle.borderColor) {
          el.style.borderColor = computedStyle.borderColor;
        }
      });
      
      // Add PDF class
      clone.classList.add('pdf-full-scale');
      
      // Create a hidden container for the clone
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'fixed';
      hiddenContainer.style.left = '0';
      hiddenContainer.style.top = '0';
      hiddenContainer.style.width = '793.7px';
      hiddenContainer.style.height = 'auto';
      hiddenContainer.style.opacity = '0';
      hiddenContainer.style.pointerEvents = 'none';
      hiddenContainer.style.zIndex = '-9999';
      hiddenContainer.appendChild(clone);
      
      document.body.appendChild(hiddenContainer);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Capture the clone with optimized settings for mobile
      const canvas = await html2canvas(clone, {
        scale: window.innerWidth < 768 ? 1.5 : 2, // Lower scale on mobile for performance
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 793.7,
        height: clone.scrollHeight,
        windowWidth: 793.7,
        windowHeight: clone.scrollHeight,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        // CRITICAL: Force color rendering
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.pdf-full-scale');
          if (clonedElement) {
            // Apply print color adjust to cloned element
            (clonedElement as HTMLElement).style.webkitPrintColorAdjust = 'exact';
            (clonedElement as HTMLElement).style.printColorAdjust = 'exact';
            (clonedElement as HTMLElement).style.colorAdjust = 'exact';
          }
        }
      });

      // Clean up
      document.body.removeChild(hiddenContainer);

      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty - no content captured');
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      console.log('PDF dimensions:', pageWidth, 'x', pageHeight);
      console.log('Image dimensions:', imgWidth, 'x', imgHeight);

      // Use higher quality for better color preservation
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      // Add additional pages if content is longer than one page
      let heightLeft = imgHeight - pageHeight;
      let position = 0;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `${personalInfo?.name?.replace(/\s+/g, '_') || 'resume'}_${template?.name || 'premium'}_Resume.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated successfully');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF: ${error.message}. Try Method 2 or use Chrome browser.`);
    } finally {
      setIsGenerating(false);
      onDownloadEnd?.();
    }
  };

  // Alternative method - Simplified for mobile
  const downloadPDFAlternative = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    try {
      const element = resumeRef.current;
      
      // Create a simpler clone for better mobile compatibility
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Replace gradients with solid colors
      const gradientsElements = clone.querySelectorAll('[class*="gradient"], [style*="gradient"]');
      gradientsElements.forEach((el: any) => {
        if (template?.id === 'modernIcons') {
          el.style.background = '#4f46e5';
        } else if (template?.id === 'creativePortfolio') {
          el.style.background = '#9333ea';
        } else if (template?.id === 'professionalExecutive') {
          el.style.background = '#1e293b';
        }
        el.style.backgroundImage = 'none';
      });

      // Apply to document temporarily
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple capture with lower settings for mobile
      const canvas = await html2canvas(clone, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body.querySelector('*');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.webkitPrintColorAdjust = 'exact';
            (clonedElement as HTMLElement).style.printColorAdjust = 'exact';
          }
        }
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for smaller file size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      // Handle multi-page
      let heightLeft = imgHeight - pdf.internal.pageSize.getHeight();
      let position = 0;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${personalInfo?.name || 'resume'}_${template?.name || 'premium'}.pdf`);
      
    } catch (error: any) {
      console.error('Alternative PDF generation failed:', error);
      setError(`Method 2 failed: ${error.message}. Please try Method 1 or use a desktop browser.`);
    } finally {
      setIsGenerating(false);
      onDownloadEnd?.();
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <button 
        onClick={downloadPDF}
        disabled={isGenerating}
        className={`bg-gradient-to-r ${template?.id === 'modernIcons' ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : template?.id === 'creativePortfolio' ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900'} text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed`}
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
          '📄 Download PDF (Recommended)'
        )}
      </button>

      <button 
        onClick={downloadPDFAlternative}
        disabled={isGenerating}
        className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
      >
        {isGenerating ? 'Generating...' : '⚡ Quick Download (Mobile Friendly)'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Recommended method preserves all colors</p>
        <p>• Quick download is optimized for mobile devices</p>
        <p>• Ensure all images are loaded before downloading</p>
        <p>• For best results on mobile, try Quick Download</p>
      </div>
    </div>
  );
};

export default NewTemplatesPDFGenerator;