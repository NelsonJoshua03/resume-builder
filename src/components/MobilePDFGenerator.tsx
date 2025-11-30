// MobilePDFGenerator.tsx
import { useState } from 'react';
import jsPDF from 'jspdf';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface MobilePDFGeneratorProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string[];
    profilePicture?: string;
  };
  resumeData: any;
  template: any;
  sectionOrder?: any[];
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

const MobilePDFGenerator = ({ 
  resumeRef, 
  personalInfo,
  resumeData,
  template,
  sectionOrder,
  onDownloadStart, 
  onDownloadEnd 
}: MobilePDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackResumeDownload, trackButtonClick } = useGoogleAnalytics();

  const trackDownload = (fileName: string) => {
    trackResumeDownload('PDF', template.name);
    trackButtonClick('download_pdf', 'pdf_generator', 'resume_builder');
    
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

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;
      
      const primaryColor = template.colors?.primary || '#374151';
      
      // Helper to convert hex to RGB
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };
      
      // Helper functions
      const checkNewPage = (requiredSpace: number = 10) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      const addSpacing = (space: number) => {
        yPosition += space;
        checkNewPage();
      };
      
      const addSectionHeader = (title: string, color?: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        
        // Use provided color or default to primary color for specific templates
        if (color) {
          const rgb = hexToRgb(color);
          pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        // Thinner horizontal line across the page
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3); // Thinner line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Across entire content width
        yPosition += 8;
      };

      // Tech template section header with primary color and full-width thin line
      const addTechSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('courier', 'bold');
        
        // Use primary color for tech template
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(`< ${title.toUpperCase()} />`, margin, yPosition);
        yPosition += 2;
        
        // Tech-style thin horizontal line across entire page
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.3); // Very thin line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Full width
        yPosition += 8;
      };

      // Creative template section header with primary color and full-width thin line
      const addCreativeSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        
        // Use primary color for creative template
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        // Creative style thin decorative line across entire page
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.3); // Very thin line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Full width
        yPosition += 8;
      };

      // Professional template section header with primary color and full-width thin line
      const addProfessionalSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        
        // Use primary color for professional template
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        // Professional style thin solid line across entire page
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.4); // Thin line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Full width
        yPosition += 8;
      };

      // Executive template section header with primary color and full-width thin line
      const addExecutiveSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        
        // Use primary color for executive template
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        // Executive style thin solid line across entire page
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.4); // Thin line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Full width
        yPosition += 8;
      };
      
      const addBulletPoint = (text: string, fontSize: number = 9.5, indent: number = 6) => {
        if (!text || text.trim() === '') return;
        
        checkNewPage(6);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        
        // Simple bullet
        pdf.setFont('helvetica', 'bold');
        pdf.text('•', margin + 2, yPosition);
        pdf.setFont('helvetica', 'normal');
        
        const textWidth = contentWidth - indent;
        const lines = pdf.splitTextToSize(text, textWidth);
        const lineHeight = fontSize * 0.42;
        
        lines.forEach((line: string, index: number) => {
          if (index > 0) checkNewPage(lineHeight);
          pdf.text(line, margin + indent, yPosition);
          yPosition += lineHeight;
        });
        
        addSpacing(1.5);
      };

      // Get enabled sections in order
      const defaultSectionOrder = [
        { id: 'summary', label: 'Professional Summary', enabled: true, order: 0 },
        { id: 'experience', label: 'Work Experience', enabled: true, order: 1 },
        { id: 'education', label: 'Education', enabled: true, order: 2 },
        { id: 'projects', label: 'Projects', enabled: true, order: 3 },
        { id: 'skills', label: 'Skills', enabled: true, order: 4 },
        { id: 'awards', label: 'Awards', enabled: true, order: 5 },
        { id: 'custom', label: 'Additional Sections', enabled: true, order: 6 }
      ];

      const currentSectionOrder = sectionOrder || defaultSectionOrder;
      const enabledSections = currentSectionOrder
        .filter(section => section.enabled)
        .sort((a, b) => a.order - b.order);

      // COMMON SECTION RENDERING FUNCTIONS
      const renderSummarySection = () => {
        if (personalInfo.summary && personalInfo.summary.length > 0) {
          if (template.layout === 'tech') {
            addTechSectionHeader('PROFESSIONAL SUMMARY');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('PROFESSIONAL SUMMARY');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('PROFESSIONAL SUMMARY');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('PROFESSIONAL SUMMARY');
          } else {
            addSectionHeader('PROFESSIONAL SUMMARY');
          }
          personalInfo.summary.forEach(item => {
            addBulletPoint(item);
          });
          addSpacing(4);
        }
      };

      const renderExperienceSection = () => {
        if (resumeData.experiences && resumeData.experiences.length > 0) {
          if (template.layout === 'tech') {
            addTechSectionHeader('WORK EXPERIENCE');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('WORK EXPERIENCE');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('WORK EXPERIENCE');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('WORK EXPERIENCE');
          } else {
            addSectionHeader('WORK EXPERIENCE');
          }
          
          resumeData.experiences.forEach((exp: any, index: number) => {
            if (exp.title || exp.company) {
              checkNewPage(18);
              
              pdf.setFontSize(11.5);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(20, 20, 20);
              pdf.text(exp.title || '', margin, yPosition);
              yPosition += 5.5;
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor(100, 100, 100);
              pdf.text(`${exp.company || ''} | ${exp.period || ''}`, margin, yPosition);
              yPosition += 6;
              
              if (exp.description && exp.description.length > 0) {
                exp.description.forEach((item: string) => {
                  if (item.trim()) {
                    addBulletPoint(item);
                  }
                });
              }
              
              if (index < resumeData.experiences.length - 1) {
                addSpacing(4);
              }
            }
          });
          addSpacing(4);
        }
      };

      const renderEducationSection = () => {
        if (resumeData.education && resumeData.education.length > 0) {
          if (template.layout === 'tech') {
            addTechSectionHeader('EDUCATION');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('EDUCATION');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('EDUCATION');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('EDUCATION');
          } else {
            addSectionHeader('EDUCATION');
          }
          
          resumeData.education.forEach((edu: any) => {
            if (edu.degree || edu.institution) {
              checkNewPage(14);
              
              pdf.setFontSize(11.5);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(20, 20, 20);
              pdf.text(edu.degree || '', margin, yPosition);
              yPosition += 5.5;
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(80, 80, 80);
              pdf.text(edu.institution || '', margin, yPosition);
              yPosition += 5;
              
              let eduDetails = [];
              if (edu.year) eduDetails.push(edu.year);
              if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);
              
              if (eduDetails.length > 0) {
                pdf.setFontSize(9);
                pdf.setTextColor(100, 100, 100);
                pdf.text(eduDetails.join('  |  '), margin, yPosition);
                yPosition += 4;
              }
              addSpacing(3);
            }
          });
          addSpacing(4);
        }
      };

      const renderSkillsSection = () => {
        if (resumeData.skills && resumeData.skills.length > 0) {
          if (template.layout === 'tech') {
            addTechSectionHeader('SKILLS');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('SKILLS');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('SKILLS');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('SKILLS');
          } else {
            addSectionHeader('SKILLS');
          }
          
          checkNewPage(15);
          
          // Enhanced skills display with categories
          const skillsText = resumeData.skills.map((skill: any) => skill.name).join('  •  ');
          const lines = pdf.splitTextToSize(skillsText, contentWidth);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(40, 40, 40);
          
          lines.forEach((line: string) => {
            checkNewPage(4.5);
            pdf.text(line, margin, yPosition);
            yPosition += 4.5;
          });
          addSpacing(4);
        }
      };

      const renderProjectsSection = () => {
        if (resumeData.projects && resumeData.projects.length > 0) {
          if (template.layout === 'tech') {
            addTechSectionHeader('PROJECTS');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('PROJECTS');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('PROJECTS');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('PROJECTS');
          } else {
            addSectionHeader('PROJECTS');
          }
          
          resumeData.projects.forEach((project: any) => {
            if (project.name) {
              checkNewPage(18);
              
              pdf.setFontSize(11.5);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(20, 20, 20);
              pdf.text(project.name, margin, yPosition);
              yPosition += 5.5;
              
              if (project.period) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'italic');
                pdf.setTextColor(100, 100, 100);
                pdf.text(project.period, margin, yPosition);
                yPosition += 5;
              }
              
              if (project.description && project.description.length > 0) {
                pdf.setTextColor(40, 40, 40);
                project.description.forEach((item: string) => {
                  if (item.trim()) {
                    addBulletPoint(item);
                  }
                });
              }
              
              addSpacing(4);
            }
          });
          addSpacing(4);
        }
      };

      const renderAwardsSection = () => {
        if (resumeData.awards && resumeData.awards.length > 0 && resumeData.awards[0].title) {
          if (template.layout === 'tech') {
            addTechSectionHeader('AWARDS & HONORS');
          } else if (template.layout === 'creative') {
            addCreativeSectionHeader('AWARDS & HONORS');
          } else if (template.layout === 'professional') {
            addProfessionalSectionHeader('AWARDS & HONORS');
          } else if (template.layout === 'executive') {
            addExecutiveSectionHeader('AWARDS & HONORS');
          } else {
            addSectionHeader('AWARDS & HONORS');
          }
          
          resumeData.awards.forEach((award: any) => {
            if (award.title) {
              checkNewPage(14);
              
              pdf.setFontSize(11.5);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(20, 20, 20);
              pdf.text(award.title, margin, yPosition);
              yPosition += 5.5;
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor(100, 100, 100);
              pdf.text(`${award.issuer || ''} | ${award.year || ''}`, margin, yPosition);
              yPosition += 5;
              
              if (award.description) {
                pdf.setFontSize(9.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(40, 40, 40);
                const lines = pdf.splitTextToSize(award.description, contentWidth);
                lines.forEach((line: string) => {
                  checkNewPage(4);
                  pdf.text(line, margin, yPosition);
                  yPosition += 4;
                });
              }
              addSpacing(3);
            }
          });
          addSpacing(4);
        }
      };

      const renderCustomFieldsSection = () => {
        if (resumeData.customFields && resumeData.customFields.length > 0) {
          resumeData.customFields.forEach((field: any) => {
            if (field.label && field.value) {
              if (template.layout === 'tech') {
                addTechSectionHeader(`${field.label.toUpperCase()}`);
              } else if (template.layout === 'creative') {
                addCreativeSectionHeader(`${field.label.toUpperCase()}`);
              } else if (template.layout === 'professional') {
                addProfessionalSectionHeader(`${field.label.toUpperCase()}`);
              } else if (template.layout === 'executive') {
                addExecutiveSectionHeader(`${field.label.toUpperCase()}`);
              } else {
                addSectionHeader(`${field.label.toUpperCase()}`);
              }
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(40, 40, 40);
              const lines = pdf.splitTextToSize(field.value, contentWidth);
              lines.forEach((line: string) => {
                checkNewPage(4.5);
                pdf.text(line, margin, yPosition);
                yPosition += 4.5;
              });
              addSpacing(4);
            }
          });
        }
      };

      const renderProfessionalPersonalInfo = () => {
        const rgb = hexToRgb(primaryColor);
        
        pdf.setFontSize(32);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        pdf.text(personalInfo.name.toUpperCase(), margin, yPosition);
        yPosition += 10;
        
        // Decorative line
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.8);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(personalInfo.title, margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${personalInfo.email}  |  ${personalInfo.phone}`, margin, yPosition);
        yPosition += 12;
      };

      const renderExecutivePersonalInfo = () => {
        const headerHeight = 35;
        const rgb = hexToRgb(primaryColor);
        
        // Header background
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');
        
        yPosition = 13;
        pdf.setFontSize(26);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(personalInfo.name.toUpperCase(), margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(220, 220, 220);
        pdf.text(personalInfo.title, margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(9);
        pdf.setTextColor(220, 220, 220);
        pdf.text(`${personalInfo.email}  |  ${personalInfo.phone}`, margin, yPosition);
        
        yPosition = headerHeight + 10;
      };

     const renderCreativePersonalInfo = () => {
  // UPDATED: Creative Template Personal Info with purple and white gradient circle and WHITE border
  const headerHeight = 32; // Increased header height to accommodate the circle
  const rgb = hexToRgb(primaryColor);
  
  // Add colored header section
  pdf.setFillColor(rgb.r, rgb.g, rgb.b);
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Circle positioned at the boundary between header and content
  const circleY = headerHeight; // Position circle at the bottom of header
  const circleX = margin + 20;
  const circleRadius = 18;
  
  // Draw circle that spans both header and content areas
  // Outer circle with purple tint
  const purpleTint = { r: 147, g: 112, b: 219 }; // Medium purple color
  pdf.setFillColor(purpleTint.r, purpleTint.g, purpleTint.b);
  pdf.circle(circleX, circleY, circleRadius, 'F');
  
  // Inner circle with purple and white gradient effect
  // Create gradient effect by using a lighter purple/white mix
  const gradientPurple = { 
    r: Math.min(255, purpleTint.r + 80), 
    g: Math.min(255, purpleTint.g + 80), 
    b: Math.min(255, purpleTint.b + 80) 
  };
  pdf.setFillColor(gradientPurple.r, gradientPurple.g, gradientPurple.b);
  pdf.circle(circleX, circleY, circleRadius - 2, 'F');
  
  // UPDATED: White border for the circle
  pdf.setDrawColor(255, 255, 255); // WHITE border
  pdf.setLineWidth(0.8); // Slightly thicker border for better visibility
  pdf.circle(circleX, circleY, circleRadius - 2, 'S');
  
  // Initials with creative font - positioned in center of circle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255); // White text for better contrast on purple
  const initials = personalInfo.name.split(' ').map(n => n[0]).join('');
  const initialsWidth = pdf.getTextWidth(initials);
  pdf.text(initials, circleX - initialsWidth / 2, circleY + 2);
  
  // Start content below the circle
  yPosition = headerHeight + circleRadius + 10;
  
  // Name and title below header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  const nameWidth = pdf.getTextWidth(personalInfo.name);
  pdf.text(personalInfo.name, (pageWidth - nameWidth) / 2, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  const titleWidth = pdf.getTextWidth(personalInfo.title);
  pdf.text(personalInfo.title, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 6;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const contactText = `${personalInfo.email}  •  ${personalInfo.phone}`;
  const contactWidth = pdf.getTextWidth(contactText);
  pdf.text(contactText, (pageWidth - contactWidth) / 2, yPosition);
  yPosition += 12;
};

      const renderTechPersonalInfo = () => {
        // Header background
        const headerHeight = 35;
        const rgb = hexToRgb(primaryColor);
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');
        
        yPosition = 13;
        pdf.setFontSize(26);
        pdf.setFont('courier', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text('< ' + personalInfo.name + ' />', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(220, 220, 220);
        pdf.text('// ' + personalInfo.title, margin, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(8.5);
        pdf.text(`${personalInfo.email}  |  ${personalInfo.phone}`, margin, yPosition);
        
        yPosition = headerHeight + 7;
        pdf.setTextColor(0, 0, 0);
      };

      const renderATSPersonalInfo = () => {
        const rgb = hexToRgb(primaryColor);
        
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        const nameWidth = pdf.getTextWidth(personalInfo.name);
        pdf.text(personalInfo.name, (pageWidth - nameWidth) / 2, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const titleWidth = pdf.getTextWidth(personalInfo.title);
        pdf.text(personalInfo.title, (pageWidth - titleWidth) / 2, yPosition);
        yPosition += 7;
        
        pdf.setFontSize(9.5);
        const contactText = `${personalInfo.email}  |  ${personalInfo.phone}`;
        const contactWidth = pdf.getTextWidth(contactText);
        pdf.text(contactText, (pageWidth - contactWidth) / 2, yPosition);
        yPosition += 12;
      };

      const renderTwoColumnPersonalInfo = () => {
        const leftColumnWidth = 65;
        const rightColumnWidth = contentWidth - leftColumnWidth - 10;
        const sidebarColor = hexToRgb(primaryColor);
        
        // Draw sidebar background for entire first page
        pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
        pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
        
        let leftY = yPosition + 5;
        
        // Name and Title in sidebar with better spacing
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
        // Wrap name if too long
        const nameLines = pdf.splitTextToSize(personalInfo.name, leftColumnWidth - 10);
        nameLines.forEach((line: string) => {
          const lineWidth = pdf.getTextWidth(line);
          pdf.text(line, margin + (leftColumnWidth - lineWidth) / 2, leftY);
          leftY += 6;
        });
        leftY += 2;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        const titleLines = pdf.splitTextToSize(personalInfo.title, leftColumnWidth - 10);
        titleLines.forEach((line: string) => {
          const lineWidth = pdf.getTextWidth(line);
          pdf.text(line, margin + (leftColumnWidth - lineWidth) / 2, leftY);
          leftY += 5;
        });
        leftY += 8;
        
        // Contact Info with icons
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONTACT', margin + 5, leftY);
        leftY += 6;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Email:', margin + 5, leftY);
        leftY += 4;
        const emailLines = pdf.splitTextToSize(personalInfo.email, leftColumnWidth - 10);
        emailLines.forEach((line: string) => {
          pdf.text(line, margin + 5, leftY);
          leftY += 3.5;
        });
        leftY += 2;
        
        pdf.text('Phone:', margin + 5, leftY);
        leftY += 4;
        pdf.text(personalInfo.phone, margin + 5, leftY);
        leftY += 10;

        return { leftY, leftColumnWidth };
      };

      // TEMPLATE-SPECIFIC LAYOUTS

      if (template.layout === 'professional') {
        // Professional Template - Elegant serif-style with bold headers
        renderProfessionalPersonalInfo();
        
        // Render sections for professional template with primary color headers
        enabledSections.forEach(section => {
          switch(section.id) {
            case 'summary':
              renderSummarySection();
              break;
            case 'experience':
              renderExperienceSection();
              break;
            case 'education':
              renderEducationSection();
              break;
            case 'projects':
              renderProjectsSection();
              break;
            case 'skills':
              renderSkillsSection();
              break;
            case 'awards':
              renderAwardsSection();
              break;
            case 'custom':
              renderCustomFieldsSection();
              break;
          }
        });
      } 
      
      else if (template.layout === 'executive') {
        // Executive Template - Premium look with elegant spacing
        renderExecutivePersonalInfo();
        
        // Render sections for executive template with primary color headers
        enabledSections.forEach(section => {
          switch(section.id) {
            case 'summary':
              renderSummarySection();
              break;
            case 'experience':
              renderExperienceSection();
              break;
            case 'education':
              renderEducationSection();
              break;
            case 'projects':
              renderProjectsSection();
              break;
            case 'skills':
              renderSkillsSection();
              break;
            case 'awards':
              renderAwardsSection();
              break;
            case 'custom':
              renderCustomFieldsSection();
              break;
          }
        });
      }
      
      else if (template.layout === 'creative') {
        // UPDATED: Creative Template - Now with purple and white gradient circle and WHITE border
        renderCreativePersonalInfo();
        
        // Render sections for creative template with primary color headers
        enabledSections.forEach(section => {
          switch(section.id) {
            case 'summary':
              renderSummarySection();
              break;
            case 'experience':
              renderExperienceSection();
              break;
            case 'education':
              renderEducationSection();
              break;
            case 'projects':
              renderProjectsSection();
              break;
            case 'skills':
              renderSkillsSection();
              break;
            case 'awards':
              renderAwardsSection();
              break;
            case 'custom':
              renderCustomFieldsSection();
              break;
          }
        });
      } 
      
      else if (template.layout === 'tech') {
        // Tech Template - Monospace-inspired modern look
        renderTechPersonalInfo();
        
        // Render sections for tech template with primary color headers
        enabledSections.forEach(section => {
          switch(section.id) {
            case 'summary':
              renderSummarySection();
              break;
            case 'experience':
              renderExperienceSection();
              break;
            case 'education':
              renderEducationSection();
              break;
            case 'projects':
              renderProjectsSection();
              break;
            case 'skills':
              renderSkillsSection();
              break;
            case 'awards':
              renderAwardsSection();
              break;
            case 'custom':
              renderCustomFieldsSection();
              break;
          }
        });
      } 
      
      else if (template.layout === 'twoColumn') {
        // Two Column Template - Modern sidebar design
        const { leftY, leftColumnWidth } = renderTwoColumnPersonalInfo();
        const rightColumnWidth = contentWidth - leftColumnWidth - 10;
        const sidebarColor = hexToRgb(primaryColor);
        
        // Skills in left column with better formatting
        if (resumeData.skills && resumeData.skills.length > 0) {
          let currentLeftY = leftY;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
          pdf.text('SKILLS', margin + 5, currentLeftY);
          currentLeftY += 6;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          
          resumeData.skills.forEach((skill: any) => {
            if (currentLeftY > pageHeight - 20) {
              // Continue on next page if needed
              pdf.addPage();
              pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
              pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
              pdf.setTextColor(255, 255, 255);
              currentLeftY = margin;
            }
            
            // Skill with proficiency indicator
            const skillLine = `• ${skill.name}`;
            pdf.text(skillLine, margin + 5, currentLeftY);
            currentLeftY += 4;
          });
        }
        
        // Education in left column
        if (resumeData.education && resumeData.education.length > 0) {
          let currentLeftY = leftY + (resumeData.skills ? resumeData.skills.length * 4 + 20 : 0);
          if (currentLeftY > pageHeight - 40) {
            pdf.addPage();
            pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
            pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
            pdf.setTextColor(255, 255, 255);
            currentLeftY = margin;
          }
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EDUCATION', margin + 5, currentLeftY);
          currentLeftY += 6;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          resumeData.education.forEach((edu: any) => {
            if (edu.degree) {
              const degreeLines = pdf.splitTextToSize(edu.degree, leftColumnWidth - 10);
              degreeLines.forEach((line: string) => {
                pdf.text(line, margin + 5, currentLeftY);
                currentLeftY += 3.5;
              });
            }
            if (edu.institution) {
              const instLines = pdf.splitTextToSize(edu.institution, leftColumnWidth - 10);
              instLines.forEach((line: string) => {
                pdf.text(line, margin + 5, currentLeftY);
                currentLeftY += 3.5;
              });
            }
            if (edu.year) {
              pdf.text(edu.year, margin + 5, currentLeftY);
              currentLeftY += 3.5;
            }
            currentLeftY += 3;
          });
        }
        
        // Right Column - Main Content
        let rightY = yPosition + 12;
        const rightColumnX = margin + leftColumnWidth + 10;
        
        // Professional Summary
        if (personalInfo.summary && personalInfo.summary.length > 0 && enabledSections.find(s => s.id === 'summary')) {
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
          pdf.text('PROFESSIONAL SUMMARY', rightColumnX, rightY);
          rightY += 2;
          
          pdf.setLineWidth(0.3);
          pdf.line(rightColumnX, rightY, rightColumnX + 60, rightY);
          rightY += 6;
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(40, 40, 40);
          personalInfo.summary.forEach(item => {
            const lines = pdf.splitTextToSize(item, rightColumnWidth);
            lines.forEach((line: string) => {
              if (rightY > pageHeight - margin) {
                pdf.addPage();
                rightY = margin;
              }
              pdf.text(line, rightColumnX, rightY);
              rightY += 4;
            });
            rightY += 1.5;
          });
          rightY += 6;
        }
        
        // Work Experience
        if (resumeData.experiences && resumeData.experiences.length > 0 && enabledSections.find(s => s.id === 'experience')) {
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
          pdf.text('WORK EXPERIENCE', rightColumnX, rightY);
          rightY += 2;
          
          pdf.setLineWidth(0.3);
          pdf.line(rightColumnX, rightY, rightColumnX + 60, rightY);
          rightY += 6;
          
          resumeData.experiences.forEach((exp: any) => {
            if (exp.title || exp.company) {
              if (rightY > pageHeight - 30) {
                pdf.addPage();
                rightY = margin;
              }
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(exp.title || '', rightColumnX, rightY);
              rightY += 5;
              
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor(100, 100, 100);
              pdf.text(`${exp.company || ''} | ${exp.period || ''}`, rightColumnX, rightY);
              rightY += 5;
              
              if (exp.description && exp.description.length > 0) {
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(40, 40, 40);
                exp.description.forEach((item: string) => {
                  if (item.trim()) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('•', rightColumnX + 2, rightY);
                    pdf.setFont('helvetica', 'normal');
                    
                    const lines = pdf.splitTextToSize(item, rightColumnWidth - 6);
                    lines.forEach((line: string) => {
                      if (rightY > pageHeight - margin) {
                        pdf.addPage();
                        rightY = margin;
                      }
                      pdf.text(line, rightColumnX + 6, rightY);
                      rightY += 4;
                    });
                  }
                });
              }
              
              rightY += 4;
            }
          });
        }
        
        // Projects
        if (resumeData.projects && resumeData.projects.length > 0 && enabledSections.find(s => s.id === 'projects')) {
          if (rightY > pageHeight - 30) {
            pdf.addPage();
            rightY = margin;
          }
          
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
          pdf.text('PROJECTS', rightColumnX, rightY);
          rightY += 2;
          
          pdf.setLineWidth(0.3);
          pdf.line(rightColumnX, rightY, rightColumnX + 60, rightY);
          rightY += 6;
          
          resumeData.projects.forEach((project: any) => {
            if (project.name) {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(project.name, rightColumnX, rightY);
              rightY += 5;
              
              if (project.period) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'italic');
                pdf.setTextColor(100, 100, 100);
                pdf.text(project.period, rightColumnX, rightY);
                rightY += 5;
              }
              
              if (project.description && project.description.length > 0) {
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(40, 40, 40);
                project.description.forEach((item: string) => {
                  if (item.trim()) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('•', rightColumnX + 2, rightY);
                    pdf.setFont('helvetica', 'normal');
                    
                    const lines = pdf.splitTextToSize(item, rightColumnWidth - 6);
                    lines.forEach((line: string) => {
                      if (rightY > pageHeight - margin) {
                        pdf.addPage();
                        rightY = margin;
                      }
                      pdf.text(line, rightColumnX + 6, rightY);
                      rightY += 4;
                    });
                  }
                });
              }
              
              rightY += 4;
            }
          });
        }
        
        yPosition = Math.max(leftY, rightY);
        
      } else {
        // ATS Template - Ultra-clean professional (DEFAULT/ATS)
        renderATSPersonalInfo();

        // Render ALL sections for ATS template using common functions
        enabledSections.forEach(section => {
          switch(section.id) {
            case 'summary':
              renderSummarySection();
              break;
            case 'experience':
              renderExperienceSection();
              break;
            case 'education':
              renderEducationSection();
              break;
            case 'projects':
              renderProjectsSection();
              break;
            case 'skills':
              renderSkillsSection();
              break;
            case 'awards':
              renderAwardsSection();
              break;
            case 'custom':
              renderCustomFieldsSection();
              break;
          }
        });
      }

      const fileName = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      trackDownload(fileName);
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
      <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-800">✨ Premium PDF Generation</span>
        </div>
        <p className="text-xs text-gray-600 mb-2">
          Professional PDF with <strong>optimized fonts</strong>, unique template styling, and fully searchable text.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-white px-2 py-1 rounded text-gray-700 flex items-center">
            🔍 Searchable
          </span>
          <span className="bg-white px-2 py-1 rounded text-gray-700 flex items-center">
            📋 Copy-paste
          </span>
          <span className="bg-white px-2 py-1 rounded text-gray-700 flex items-center">
            🤖 ATS-friendly
          </span>
          <span className="bg-white px-2 py-1 rounded text-gray-700 flex items-center">
            🎨 {template.name} style
          </span>
        </div>
      </div>

      <button 
        onClick={downloadPDF}
        disabled={isGenerating}
        aria-label={isGenerating ? "Generating PDF document" : "Download PDF document"}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 flex items-center justify-center transition-all shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
            Download Premium Resume PDF
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p className="font-medium">🎨 Crafting your {template.name} resume...</p>
          <p className="text-xs mt-1">
            Applying professional fonts and unique styling
          </p>
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
      
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-xs text-gray-700">
            <strong className="text-blue-700">✨ What's New:</strong> Each template now features unique font combinations and professional styling. Your {template.name} template uses optimized typography for maximum impact and readability.
          </div>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="font-semibold text-gray-700 mb-1">📝 Font Styling</div>
          <div>{template.layout === 'professional' ? 'Times New Roman headers' : 
                template.layout === 'tech' ? 'Courier monospace' : 
                template.layout === 'executive' ? 'Premium serif fonts' :
                'Optimized Helvetica'}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="font-semibold text-gray-700 mb-1">🎨 Layout</div>
          <div>{template.layout === 'twoColumn' ? 'Dual-column sidebar' :
                template.layout === 'creative' ? 'Centered with circle' :
                template.layout === 'executive' ? 'Full-width header' :
                'Single column clean'}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
        <span>📱 Mobile & Desktop  •  🎯 {template.name} template  •  ⚡ Instant download</span>
      </div>
    </div>
  );
};

export default MobilePDFGenerator;