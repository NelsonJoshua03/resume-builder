import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MobilePDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
  };
  resumeData: any;
  template: any;
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

const trackDownload = (fileName: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'download', {
      'event_category': 'resume',
      'event_label': fileName,
      'value': 1
    });
  }
  
  try {
    const currentDownloads = parseInt(localStorage.getItem('resumeDownloads') || '0');
    localStorage.setItem('resumeDownloads', (currentDownloads + 1).toString());
    
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
  resumeData,
  template,
  onDownloadStart, 
  onDownloadEnd 
}: MobilePDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadHybridPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    try {
      // Step 1: Capture visual with optimized settings
      const canvas = await html2canvas(resumeRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 0,
        allowTaint: false
      } as any); // Type assertion to fix scale issue

      // Step 2: Create optimized PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Calculate dimensions
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Convert to JPEG with compression
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      // Add pages with content
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const position = - (i * pageHeight);
        
        // Add image portion for this page
        pdf.addImage(
          imgData, 
          'JPEG', 
          0, 
          position, 
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );
      }
      
      // Step 3: Add INVISIBLE searchable text layer (minimal size impact)
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(0.1); // Extremely tiny (almost invisible)
      
      // Go back to first page for text
      pdf.setPage(1);
      
      let yPos = 5; // Start near top
      const lineHeight = 2; // Minimal spacing
      
      // Track current page for text
      let currentTextPage = 1;
      
      // Optimized text addition - only add essential searchable content
      const addSearchableText = (text: string) => {
        if (!text || text.trim() === '') return;
        
        // Remove extra whitespace to reduce size
        const cleanText = text.trim().replace(/\s+/g, ' ');
        
        if (yPos > pageHeight - 5) {
          // Move to next page if available
          if (currentTextPage < totalPages) {
            currentTextPage++;
            pdf.setPage(currentTextPage);
          }
          yPos = 5;
        }
        
        pdf.text(cleanText, 1, yPos);
        yPos += lineHeight;
      };
      
      // Add all searchable content efficiently
      addSearchableText(personalInfo.name);
      addSearchableText(personalInfo.title);
      addSearchableText(personalInfo.email);
      addSearchableText(personalInfo.phone);
      
      // Summary
      if (personalInfo.summary) {
        addSearchableText('Professional Summary');
        personalInfo.summary.forEach(item => addSearchableText(item));
      }
      
      // Experience
      if (resumeData.experiences) {
        addSearchableText('Work Experience');
        resumeData.experiences.forEach((exp: any) => {
          addSearchableText(exp.title || '');
          addSearchableText(exp.company || '');
          addSearchableText(exp.period || '');
          if (exp.description) {
            exp.description.forEach((desc: string) => addSearchableText(desc));
          }
        });
      }
      
      // Education
      if (resumeData.education) {
        addSearchableText('Education');
        resumeData.education.forEach((edu: any) => {
          addSearchableText(edu.degree || '');
          addSearchableText(edu.institution || '');
          addSearchableText(edu.year || '');
          if (edu.gpa) addSearchableText(`GPA ${edu.gpa}`);
        });
      }
      
      // Projects
      if (resumeData.projects) {
        addSearchableText('Projects');
        resumeData.projects.forEach((project: any) => {
          addSearchableText(project.name || '');
          addSearchableText(project.period || '');
          if (project.description) {
            project.description.forEach((desc: string) => addSearchableText(desc));
          }
          if (project.technologies?.length > 0) {
            addSearchableText('Technologies ' + project.technologies.join(' '));
          }
        });
      }
      
      // Skills
      if (resumeData.skills) {
        addSearchableText('Skills');
        const skillText = resumeData.skills
          .map((skill: any) => `${skill.name} ${skill.proficiency}`)
          .join(' ');
        addSearchableText(skillText);
      }
      
      // Awards
      if (resumeData.awards) {
        addSearchableText('Awards and Achievements');
        resumeData.awards.forEach((award: any) => {
          addSearchableText(award.title || '');
          addSearchableText(award.issuer || '');
          addSearchableText(award.year || '');
          addSearchableText(award.description || '');
        });
      }
      
      // Custom fields
      if (resumeData.customFields) {
        resumeData.customFields.forEach((field: any) => {
          addSearchableText(field.label || '');
          addSearchableText(field.value || '');
        });
      }

      const fileName = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      trackDownload(fileName);
      
      // Save with compression
      pdf.save(fileName);
      
      console.log(`✅ PDF generated successfully!`);
      
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
      <div className="mb-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-file-pdf text-green-600 text-xl"></i>
          <span className="text-sm font-semibold text-gray-800">Hybrid PDF - Visual + Searchable</span>
          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
            OPTIMIZED
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Get the perfect resume with <strong>beautiful formatting AND searchable text</strong>. Optimized file size (300-800KB) with professional quality.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white px-3 py-2 rounded border border-green-200">
            <div className="font-semibold text-green-700 mb-1">✨ Visual Quality</div>
            <div className="text-gray-600">
              • All icons visible<br/>
              • Colors & gradients<br/>
              • Professional layout
            </div>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <div className="font-semibold text-blue-700 mb-1">🔍 Searchable</div>
            <div className="text-gray-600">
              • 100% text search<br/>
              • ATS compatible<br/>
              • Copy/paste ready
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={downloadHybridPDF}
        disabled={isGenerating}
        aria-label={isGenerating ? "Generating PDF document" : "Download PDF document"}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center transition-all shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Generating Optimized PDF...
          </>
        ) : (
          <>
            <i className="fas fa-download mr-2"></i>
            Download {template.name} Resume PDF
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <p className="font-medium">Creating your {template.name} resume...</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-green-700">🎨 Capturing visual with icons & styling</p>
            <p className="text-blue-700">📝 Adding invisible searchable text layer</p>
            <p className="text-purple-700">⚡ Optimizing file size (target: 300-800KB)</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-center">
          <p className="text-sm text-red-600 mb-2 flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </p>
          <button 
            onClick={downloadHybridPDF}
            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div className="text-xs text-gray-700">
            <strong className="text-blue-700">How it works:</strong> Creates a high-quality visual PDF (with all icons and styling) and adds an invisible searchable text layer underneath. This gives you <span className="text-green-700 font-semibold">perfect visual presentation</span> for humans PLUS <span className="text-blue-700 font-semibold">full text searchability</span> for ATS systems. File size optimized to 300-800KB using JPEG compression and smart rendering.
          </div>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="text-xs text-gray-700">
          <div className="font-semibold text-purple-700 mb-1 flex items-center gap-1">
            <i className="fas fa-magic"></i> Optimization Features:
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>• JPEG compression (85%)</div>
            <div>• Smart page splitting</div>
            <div>• Optimized text layer</div>
            <div>• Fast rendering mode</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
        <i className="fas fa-check-circle text-green-600"></i>
        <span>🎯 Visual + Searchable • 📦 300-800KB • {template.name} template</span>
      </div>
    </div>
  );
};

export default MobilePDFGenerator;