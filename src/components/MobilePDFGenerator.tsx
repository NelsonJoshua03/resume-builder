// MobilePDFGenerator.tsx - FIXED FUNCTION CALLS
import { useState } from 'react';
import jsPDF from 'jspdf';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

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
  onDownloadComplete?: (fileName: string, success: boolean) => void;
}

const MobilePDFGenerator = ({ 
  resumeRef, 
  personalInfo,
  resumeData,
  template,
  sectionOrder,
  onDownloadStart, 
  onDownloadComplete 
}: MobilePDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackResumeDownload, trackButtonClick } = useGoogleAnalytics();
  
  // ✅ Firebase Analytics hooks
  const { 
    trackFirebaseEvent,
    trackResumeDownload: trackFirebaseResumeDownload,
    trackButtonClick: trackFirebaseButtonClick
  } = useFirebaseAnalytics();

  const trackDownload = async (fileName: string, resumeId?: string) => {
    const userId = localStorage.getItem('firebase_user_id') || 'anonymous';
    const sessionId = localStorage.getItem('firebase_session_id') || Date.now().toString();
    const currentResumeId = resumeId || localStorage.getItem('current_resume_id') || 'unknown';
    
    // ✅ DUAL TRACKING: Google Analytics (Global) + Firebase Analytics (Real-time)
    
    // 1. GOOGLE ANALYTICS TRACKING
    trackResumeDownload('PDF', template.name);
    trackButtonClick('download_pdf', 'pdf_generator', 'resume_builder');
    
    // Enhanced GA4 event with more details
    if (typeof window.gtag !== 'undefined') {
      // Funnel completion
      window.gtag('event', 'funnel_step', {
        funnel_name: 'resume_creation',
        step: 'resume_downloaded',
        step_number: 4,
        user_id: userId,
        template_name: template.name,
        resume_id: currentResumeId,
        send_to: 'G-SW5M9YN8L5'
      });
      
      // Main download event
      window.gtag('event', 'resume_downloaded', {
        template: template.name,
        file_name: fileName,
        user_id: userId,
        session_id: sessionId,
        resume_id: currentResumeId,
        timestamp: new Date().toISOString(),
        event_category: 'Resume Downloads',
        event_label: `Downloaded ${template.name} template`,
        value: 1,
        send_to: 'G-SW5M9YN8L5'
      });
      
      // Template-specific event
      window.gtag('event', `download_${template.name.toLowerCase()}`, {
        file_name: fileName,
        template_layout: template.layout,
        sections_count: sectionOrder?.filter(s => s.enabled)?.length || 0,
        resume_id: currentResumeId,
        send_to: 'G-SW5M9YN8L5'
      });
    }
    
    // 2. FIREBASE ANALYTICS TRACKING
    try {
      // Track resume download in Firebase
      // ✅ FIXED: Type-safe personalInfo filtering
      const fieldsCount = {
        personalInfo: (['name', 'title', 'email', 'phone', 'summary', 'profilePicture'] as const)
          .filter(k => personalInfo[k] && 
            (Array.isArray(personalInfo[k]) ? 
              (personalInfo[k] as string[]).length > 0 : 
              personalInfo[k] !== ''))
          .length,
        experience: resumeData.experiences?.length || 0,
        education: resumeData.education?.length || 0,
        skills: resumeData.skills?.length || 0,
        projects: resumeData.projects?.length || 0
      };
      
      // ✅ FIXED: Only 3 arguments (removed resumeId)
      await trackFirebaseResumeDownload(template.name, fieldsCount, 'pdf');
      
      // Track additional event in Firebase with resumeId in metadata
      await trackFirebaseEvent(
        'resume_downloaded',
        'Resume Downloads',
        `downloaded_${template.name}`,
        {
          template_name: template.name,
          file_name: fileName,
          user_id: userId,
          session_id: sessionId,
          resume_id: currentResumeId,
          sections_count: sectionOrder?.filter(s => s.enabled)?.length || 0,
          download_source: 'mobile_pdf_generator'
        },
        1
      );
      
      await trackFirebaseButtonClick('download_pdf_button', 'pdf_generator', '/builder');
      
    } catch (firebaseError) {
      console.error('Firebase tracking error:', firebaseError);
      // Fallback to localStorage for retry queue
      const fallbackData = {
        eventName: 'resume_downloaded',
        template: template.name,
        fileName: fileName,
        timestamp: new Date().toISOString(),
        userId: userId,
        resumeId: currentResumeId
      };
      localStorage.setItem(`fb_fallback_download_${Date.now()}`, JSON.stringify(fallbackData));
    }
    
    // 🎯 LOCAL STORAGE TRACKING (Device-specific UX)
    try {
      // Total downloads on this device
      const currentDownloads = parseInt(localStorage.getItem('resumeDownloads') || '0');
      localStorage.setItem('resumeDownloads', (currentDownloads + 1).toString());
      
      // Template-specific downloads on this device
      const templateDownloads = parseInt(localStorage.getItem(`downloads_${template.name}`) || '0');
      localStorage.setItem(`downloads_${template.name}`, (templateDownloads + 1).toString());
      
      // Store current template for analytics
      localStorage.setItem('currentTemplate', template.name);
      
      // Session tracking (resets when browser closes)
      const sessionDownloads = JSON.parse(sessionStorage.getItem('sessionDownloads') || '[]');
      sessionDownloads.push({
        template: template.name,
        time: new Date().toLocaleTimeString(),
        fileName,
        resumeId: currentResumeId
      });
      sessionStorage.setItem('sessionDownloads', JSON.stringify(sessionDownloads.slice(-10)));
      
    } catch (localStorageError) {
      console.log('LocalStorage tracking failed:', localStorageError);
    }
    
    console.log(`📊 Download tracked via DUAL ANALYTICS: ${fileName} (Resume ID: ${currentResumeId})`);
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
      const circleInitialsColor = template.circleInitialsColor || primaryColor;
      
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
        
        if (color) {
          const rgb = hexToRgb(color);
          pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      const addTechSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('courier', 'bold');
        
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(`< ${title.toUpperCase()} />`, margin, yPosition);
        yPosition += 2;
        
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      const addCreativeSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      const addProfessionalSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.4);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      const addExecutiveSectionHeader = (title: string) => {
        checkNewPage(15);
        addSpacing(5);
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        
        const rgb = hexToRgb(primaryColor);
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        
        pdf.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        
        pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        pdf.setLineWidth(0.4);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };
      
      const addBulletPoint = (text: string, fontSize: number = 9.5, indent: number = 6) => {
        if (!text || text.trim() === '') return;
        
        checkNewPage(6);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        
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
          
          // Group skills into chunks of 2 for better formatting
          const skillsList = resumeData.skills.map((skill: any) => skill.name);
          const chunkSize = 2;
          
          // Calculate column positions for perfect alignment
          const bulletX = margin + 2;
          const textX = margin + 6;
          const columnWidth = (contentWidth - 20) / 2; // Divide content width for two columns with spacing
          const secondColumnStart = margin + columnWidth + 10;
          
          for (let i = 0; i < skillsList.length; i += chunkSize) {
            const chunk = skillsList.slice(i, i + chunkSize);
            
            // Always check for new page before adding skills
            checkNewPage(5);
            
            // Set font for all skills
            pdf.setFontSize(10);
            pdf.setTextColor(40, 40, 40);
            
            // First skill (always in first column)
            if (chunk[0]) {
              pdf.setFont('helvetica', 'bold');
              pdf.text('•', bulletX, yPosition);
              pdf.setFont('helvetica', 'normal');
              pdf.text(chunk[0], textX, yPosition);
            }
            
            // Second skill (in second column if exists)
            if (chunk[1]) {
              // Check if skill fits in second column
              const skillWidth = pdf.getTextWidth(chunk[1]);
              const maxWidth = columnWidth - 10; // Leave some padding
              
              if (skillWidth <= maxWidth) {
                // Skill fits, place in second column
                const secondBulletX = secondColumnStart;
                const secondTextX = secondColumnStart + 4;
                
                pdf.setFont('helvetica', 'bold');
                pdf.text('•', secondBulletX, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(chunk[1], secondTextX, yPosition);
              } else {
                // Skill too long, move to next line
                yPosition += 5;
                checkNewPage(5);
                
                pdf.setFont('helvetica', 'bold');
                pdf.text('•', bulletX, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(chunk[1], textX, yPosition);
              }
            }
            
            // Move to next line for next pair
            yPosition += 5;
          }
          
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
        const headerHeight = 32;
        const rgb = hexToRgb(primaryColor);
        
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');
        
        const circleY = headerHeight;
        const circleX = margin + 20;
        const circleRadius = 18;
        
        const purpleTint = { r: 147, g: 112, b: 219 };
        pdf.setFillColor(purpleTint.r, purpleTint.g, purpleTint.b);
        pdf.circle(circleX, circleY, circleRadius, 'F');
        
        const gradientPurple = { 
          r: Math.min(255, purpleTint.r + 80), 
          g: Math.min(255, purpleTint.g + 80), 
          b: Math.min(255, purpleTint.b + 80) 
        };
        pdf.setFillColor(gradientPurple.r, gradientPurple.g, gradientPurple.b);
        pdf.circle(circleX, circleY, circleRadius - 2, 'F');
        
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.8);
        pdf.circle(circleX, circleY, circleRadius - 2, 'S');
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        
        const circleInitialsRgb = hexToRgb(circleInitialsColor);
        pdf.setTextColor(circleInitialsRgb.r, circleInitialsRgb.g, circleInitialsRgb.b);
        
        const initials = personalInfo.name.split(' ').map(n => n[0]).join('');
        const initialsWidth = pdf.getTextWidth(initials);
        pdf.text(initials, circleX - initialsWidth / 2, circleY + 2);
        
        yPosition = headerHeight + circleRadius + 10;
        
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
        
        pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
        pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
        
        let leftY = yPosition + 5;
        
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
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
        renderProfessionalPersonalInfo();
        
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
        renderExecutivePersonalInfo();
        
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
        renderCreativePersonalInfo();
        
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
        renderTechPersonalInfo();
        
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
        const { leftY, leftColumnWidth } = renderTwoColumnPersonalInfo();
        const rightColumnWidth = contentWidth - leftColumnWidth - 10;
        const sidebarColor = hexToRgb(primaryColor);
        
        if (resumeData.skills && resumeData.skills.length > 0) {
          let currentLeftY = leftY;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
          pdf.text('SKILLS', margin + 5, currentLeftY);
          currentLeftY += 6;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          
          // Group skills into pairs for two-column layout
          const skillsList = resumeData.skills.map((skill: any) => skill.name);
          const chunkSize = 2;
          
          // Calculate positions for consistent alignment
          const bulletX = margin + 5;
          const textX = margin + 9;
          const columnWidth = leftColumnWidth - 15; // Account for margins
          const secondColumnStart = margin + 5 + (columnWidth / 2) + 10;
          
          for (let i = 0; i < skillsList.length; i += chunkSize) {
            const chunk = skillsList.slice(i, i + chunkSize);
            
            if (currentLeftY > pageHeight - 20) {
              pdf.addPage();
              pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
              pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
              pdf.setTextColor(255, 255, 255);
              currentLeftY = margin;
            }
            
            // First skill
            if (chunk[0]) {
              pdf.setFont('helvetica', 'bold');
              pdf.text('•', bulletX, currentLeftY);
              pdf.setFont('helvetica', 'normal');
              pdf.text(chunk[0], textX, currentLeftY);
            }
            
            // Second skill
            if (chunk[1]) {
              // Check if skill fits in second column
              const skillWidth = pdf.getTextWidth(chunk[1]);
              const maxWidth = (columnWidth / 2) - 5;
              
              if (skillWidth <= maxWidth) {
                // Skill fits, place in second column
                const secondBulletX = secondColumnStart;
                const secondTextX = secondColumnStart + 4;
                
                pdf.setFont('helvetica', 'bold');
                pdf.text('•', secondBulletX, currentLeftY);
                pdf.setFont('helvetica', 'normal');
                pdf.text(chunk[1], secondTextX, currentLeftY);
              } else {
                // Skill too long, move to next line
                currentLeftY += 4;
                if (currentLeftY > pageHeight - 20) {
                  pdf.addPage();
                  pdf.setFillColor(sidebarColor.r, sidebarColor.g, sidebarColor.b);
                  pdf.rect(0, 0, margin + leftColumnWidth, pageHeight, 'F');
                  pdf.setTextColor(255, 255, 255);
                  currentLeftY = margin;
                }
                
                pdf.setFont('helvetica', 'bold');
                pdf.text('•', bulletX, currentLeftY);
                pdf.setFont('helvetica', 'normal');
                pdf.text(chunk[1], textX, currentLeftY);
              }
            }
            
            currentLeftY += 4;
          }
        }
        
        if (resumeData.education && resumeData.education.length > 0) {
          let currentLeftY = leftY + (resumeData.skills ? Math.ceil(resumeData.skills.length / 2) * 4 + 20 : 0);
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
        
        let rightY = yPosition + 12;
        const rightColumnX = margin + leftColumnWidth + 10;
        
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
        renderATSPersonalInfo();

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
      
      // Get resume ID for tracking
      const currentResumeId = localStorage.getItem('current_resume_id') || 'unknown';
      
      // 🔥 Track download via DUAL ANALYTICS
      await trackDownload(fileName, currentResumeId);
      
      // Save PDF
      pdf.save(fileName);
      
      // ✅ Notify parent component of successful download
      onDownloadComplete?.(fileName, true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      
      // ✅ Track failed download attempt - DUAL TRACKING
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'resume_download_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          template: template.name,
          event_category: 'Errors',
          send_to: 'G-SW5M9YN8L5'
        });
      }
      
      // ✅ Firebase tracking for failed download
      await trackFirebaseEvent(
        'resume_download_failed',
        'Errors',
        'download_failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          template: template.name,
          error_type: 'pdf_generation_failed'
        }
      );
      
      // ✅ Notify parent component of failed download
      onDownloadComplete?.('', false);
    } finally {
      setIsGenerating(false);
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
          <span className="bg-white px-2 py-1 rounded text-gray-700 flex items-center">
            🌍 Dual Analytics
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
                template.layout === 'creative' ? 'Centered with purple initials' :
                template.layout === 'executive' ? 'Full-width header' :
                'Single column clean'}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
        <span>📱 Mobile & Desktop  •  🎯 {template.name} template  •  ⚡ Instant download</span>
      </div>
      
      {/* Firebase Analytics Status */}
      <div className="mt-2 text-xs text-center">
        <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>📊 Analytics: Google Analytics + Firebase</span>
        </div>
      </div>
    </div>
  );
};

export default MobilePDFGenerator;