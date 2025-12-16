// EditResumePage.tsx - COMPLETE WITH FIREBASE ANALYTICS (TYPE FIXED)
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from './ResumeContext';
import PersonalInfo from './PersonalInfo';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Projects from './Projects';
import Awards from './Awards';
import CustomFields from './CustomFields';
import FileUpload from './FileUpload';
import SectionOrderCustomizer from './SectionOrderCustomizer';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import type { PersonalInfoData } from './types';

const EditResumePage = () => {
  const {
    resumeData,
    sectionOrder,
    handleSectionReorder,
    handleFileUpload,
    updatePersonalInfo,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    addSkill,
    removeSkill,
    updateSkillProficiency,
    updateProject,
    addProject,
    removeProject,
    updateAward,
    addAward,
    removeAward,
    updateCustomField,
    changeCustomFieldType,
    addCustomField,
    removeCustomField
  } = useResume();

  const { 
    trackButtonClick: trackGAButtonClick, 
    trackCTAClick: trackGACTAClick, 
    trackUserFlow: trackGAUserFlow,
    trackResumeGeneration: trackGAResumeGeneration,
    trackPageView: trackGAPageView,
    trackEvent: trackGAEvent 
  } = useGoogleAnalytics();

  const {
    trackEvent: trackFirebaseEvent,
    trackPageView: trackFirebasePageView,
    trackButtonClick: trackFirebaseButtonClick,
    trackCTAClick: trackFirebaseCTAClick,
    trackUserFlow: trackFirebaseUserFlow,
    trackFunnelStep: trackFirebaseFunnelStep,
    trackResumeGeneration: trackFirebaseResumeGeneration,
    trackResumeDownload: trackFirebaseResumeDownload,
    trackResumePreview: trackFirebaseResumePreview,
    trackError: trackFirebaseError
  } = useFirebaseAnalytics();

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [showSectionPrompts, setShowSectionPrompts] = useState(false);
  const [fieldEditStartTime, setFieldEditStartTime] = useState<Record<string, number>>({});
  const [sectionTimeSpent, setSectionTimeSpent] = useState<Record<string, number>>({});
  const [totalEditTime, setTotalEditTime] = useState<number>(0);
  const [fieldsEdited, setFieldsEdited] = useState<Set<string>>(new Set());
  const pageEnterTime = useRef<number>(Date.now());
  const lastSectionSwitchTime = useRef<number>(Date.now());
  const sectionEnterTime = useRef<number>(Date.now());
  const editSessionId = useRef<string>(`edit_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track page view on mount - DUAL TRACKING
  useEffect(() => {
    // Google Analytics
    trackGAPageView('Edit Resume', '/edit');
    
    // Firebase Analytics
    trackFirebasePageView('/edit', 'Edit Resume');
    
    // Track session start
    trackFirebaseEvent({
      eventName: 'edit_session_started',
      eventCategory: 'Resume Builder',
      eventLabel: 'edit_page_loaded',
      pagePath: '/edit',
      pageTitle: 'Edit Resume',
      metadata: {
        session_id: editSessionId.current,
        initial_completion: calculateCompletion(resumeData),
        sections_completed: getCompletedSectionsCount(resumeData),
        has_previous_resume: localStorage.getItem('has_previous_resume') === 'true',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }
    });

    // Track funnel entry
    trackFirebaseFunnelStep('resume_editing', 'edit_page_entered', 1, {
      entry_point: 'direct',
      resume_completion_before: calculateCompletion(resumeData),
      session_id: editSessionId.current
    });

    // Set session start time
    localStorage.setItem('current_edit_session', editSessionId.current);
    localStorage.setItem('edit_session_start', Date.now().toString());

    return () => {
      // Track session duration when leaving page
      const timeSpent = Math.round((Date.now() - pageEnterTime.current) / 1000);
      setTotalEditTime(timeSpent);
      
      // Calculate sections completed during session
      const sectionsCompletedDuringSession = getSectionsCompletedDuringSession(resumeData);
      
      trackFirebaseEvent({
        eventName: 'edit_session_ended',
        eventCategory: 'Resume Builder',
        eventLabel: 'session_completed',
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        eventValue: timeSpent,
        metadata: {
          session_id: editSessionId.current,
          total_time_seconds: timeSpent,
          fields_edited: fieldsEdited.size,
          sections_edited: Object.keys(sectionTimeSpent).length,
          sections_completed: sectionsCompletedDuringSession,
          final_completion: calculateCompletion(resumeData),
          completion_increase: calculateCompletion(resumeData) - (localStorage.getItem('initial_completion') ? parseInt(localStorage.getItem('initial_completion') || '0') : 0),
          exit_action: 'page_close',
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
        }
      });

      // Clear session data
      localStorage.removeItem('current_edit_session');
      localStorage.removeItem('initial_completion');
    };
  }, []);

  // Track section switching with time spent
  useEffect(() => {
    const trackSectionSwitch = () => {
      const timeSpentInSection = Math.round((Date.now() - sectionEnterTime.current) / 1000);
      
      if (timeSpentInSection > 2) { // Only track if spent more than 2 seconds
        const sectionCompletion = getSectionCompletion(activeSection);
        
        // Update time spent in this section
        setSectionTimeSpent(prev => ({
          ...prev,
          [activeSection]: (prev[activeSection] || 0) + timeSpentInSection
        }));

        // Track section engagement
        trackFirebaseEvent({
          eventName: 'section_engagement',
          eventCategory: 'Resume Builder',
          eventLabel: activeSection,
          pagePath: '/edit',
          pageTitle: 'Edit Resume',
          eventValue: timeSpentInSection,
          metadata: {
            section_id: activeSection,
            time_spent_seconds: timeSpentInSection,
            completion_percentage: sectionCompletion,
            fields_in_section: getSectionFieldCount(activeSection),
            session_id: editSessionId.current,
            is_completed: sectionCompletion === 100
          }
        });

        // If spent significant time and made progress, track as valuable interaction
        if (timeSpentInSection > 10 && fieldsEdited.size > 0) {
          trackFirebaseEvent({
            eventName: 'section_meaningful_engagement',
            eventCategory: 'Resume Builder',
            eventLabel: activeSection,
            pagePath: '/edit',
            pageTitle: 'Edit Resume',
            metadata: {
              section_id: activeSection,
              time_spent_seconds: timeSpentInSection,
              fields_edited_in_session: Array.from(fieldsEdited).filter(f => f.startsWith(activeSection)).length,
              session_id: editSessionId.current
            }
          });
        }
      }
      
      // Update last section switch time
      lastSectionSwitchTime.current = Date.now();
      sectionEnterTime.current = Date.now();
    };

    // Track when component unmounts or section changes
    return () => {
      trackSectionSwitch();
    };
  }, [activeSection]);

  // Check if personal info is filled to show section prompts
  useEffect(() => {
    const isPersonalFilled = checkPersonalInfoFilled(resumeData.personalInfo);
    setShowSectionPrompts(isPersonalFilled);
    
    // Track when personal info becomes complete
    if (isPersonalFilled && !localStorage.getItem('personal_info_completed_tracked')) {
      trackFirebaseEvent({
        eventName: 'personal_info_completed',
        eventCategory: 'Resume Builder',
        eventLabel: 'milestone',
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        metadata: {
          session_id: editSessionId.current,
          time_to_complete: Math.round((Date.now() - pageEnterTime.current) / 1000),
          fields_filled: Object.keys(resumeData.personalInfo).filter(key => {
            const val = resumeData.personalInfo[key as keyof PersonalInfoData];
            return val && (Array.isArray(val) ? val.length > 0 : val.toString().trim() !== '');
          }).length
        }
      });
      localStorage.setItem('personal_info_completed_tracked', 'true');
    }
  }, [resumeData.personalInfo]);

  const handleSaveChanges = () => {
    const timeSpent = Math.round((Date.now() - pageEnterTime.current) / 1000);
    const overallCompletion = calculateCompletion(resumeData);
    const sectionsCompleted = getCompletedSectionsCount(resumeData);
    
    // Track each section's completion on save
    const sectionsToTrack = ['personal', 'experience', 'education', 'skills', 'projects', 'awards', 'custom'];
    sectionsToTrack.forEach(sectionId => {
      const completion = getSectionCompletion(sectionId);
      trackSectionCompletion(sectionId, completion);
    });
    
    // Google Analytics
    trackGAButtonClick('save_changes', 'quick_actions', 'edit_page');
    trackGAResumeGeneration('manual_save', 'edit', 'saved');
    
    // Firebase Analytics
    trackFirebaseButtonClick('save_changes', 'quick_actions', '/edit');
    trackFirebaseResumeGeneration('professional', {
      personalInfo: Object.keys(resumeData.personalInfo).length,
      experience: resumeData.experiences.length,
      education: resumeData.education.length,
      skills: resumeData.skills.length,
      projects: resumeData.projects.length
    }, 'edit');
    
    // Track overall save event
    trackFirebaseEvent({
      eventName: 'resume_saved',
      eventCategory: 'Resume Builder',
      eventLabel: 'manual_save',
      pagePath: '/edit',
      pageTitle: 'Edit Resume',
      eventValue: overallCompletion,
      metadata: {
        session_id: editSessionId.current,
        total_completion: overallCompletion,
        sections_completed: sectionsCompleted,
        time_spent_seconds: timeSpent,
        fields_edited: fieldsEdited.size,
        sections_edited: Object.keys(sectionTimeSpent).length,
        has_experience: resumeData.experiences.length > 0,
        has_education: resumeData.education.length > 0,
        has_projects: resumeData.projects.length > 0,
        has_skills: resumeData.skills.length >= 3,
        save_type: 'manual',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    });

    // Track completion milestone if significant progress made
    const initialCompletion = localStorage.getItem('initial_completion') 
      ? parseInt(localStorage.getItem('initial_completion') || '0') 
      : overallCompletion;
    
    if (overallCompletion - initialCompletion >= 25) {
      trackFirebaseEvent({
        eventName: 'significant_progress_made',
        eventCategory: 'Resume Builder',
        eventLabel: 'milestone',
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        metadata: {
          session_id: editSessionId.current,
          progress_increase: overallCompletion - initialCompletion,
          from_completion: initialCompletion,
          to_completion: overallCompletion,
          time_to_progress: timeSpent
        }
      });
    }

    // Funnel step for saving
    trackFirebaseFunnelStep('resume_editing', 'changes_saved', 3, {
      completion: overallCompletion,
      save_count: parseInt(localStorage.getItem('save_count') || '0') + 1,
      session_id: editSessionId.current
    });

    // Increment save count
    const saveCount = parseInt(localStorage.getItem('save_count') || '0') + 1;
    localStorage.setItem('save_count', saveCount.toString());

    alert('Changes saved successfully!');
  };

  const handleSectionEdit = (sectionName: string, sectionId: string) => {
    // Track completion of current section before switching
    if (activeSection !== sectionId) {
      const completion = getSectionCompletion(activeSection);
      
      // Track section switch
      trackFirebaseEvent({
        eventName: 'section_switched',
        eventCategory: 'Resume Builder',
        eventLabel: `${activeSection}_to_${sectionId}`,
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        metadata: {
          from_section: activeSection,
          to_section: sectionId,
          from_completion: completion,
          to_completion: getSectionCompletion(sectionId),
          session_id: editSessionId.current,
          switch_count: parseInt(localStorage.getItem('section_switch_count') || '0') + 1
        }
      });

      // Increment switch count
      const switchCount = parseInt(localStorage.getItem('section_switch_count') || '0') + 1;
      localStorage.setItem('section_switch_count', switchCount.toString());
    }
    
    setActiveSection(sectionId);
    
    // Google Analytics
    trackGAButtonClick(`edit_${sectionName.toLowerCase()}`, 'form_section', 'edit_page');
    
    // Firebase Analytics
    trackFirebaseButtonClick(`edit_${sectionName.toLowerCase()}`, 'form_section', '/edit');
    
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
    
    // Update section enter time
    sectionEnterTime.current = Date.now();
  };

  // Track field interactions with detailed analytics
  const trackFieldInteraction = (fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', sectionId: string, value?: any) => {
    if (action === 'focus') {
      setFieldEditStartTime(prev => ({ ...prev, [fieldName]: Date.now() }));
      
      trackFirebaseEvent({
        eventName: 'field_focused',
        eventCategory: 'Resume Builder',
        eventLabel: fieldName,
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        metadata: {
          field_name: fieldName,
          section_id: sectionId,
          session_id: editSessionId.current,
          is_required_field: isRequiredField(fieldName, sectionId),
          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
        }
      });
      
    } else if (action === 'blur' && fieldEditStartTime[fieldName]) {
      const timeSpent = Date.now() - fieldEditStartTime[fieldName];
      
      // Only track if spent more than 1 second (meaningful interaction)
      if (timeSpent > 1000) {
        trackFirebaseEvent({
          eventName: 'field_engagement',
          eventCategory: 'Resume Builder',
          eventLabel: fieldName,
          pagePath: '/edit',
          pageTitle: 'Edit Resume',
          eventValue: Math.round(timeSpent / 1000),
          metadata: {
            field_name: fieldName,
            section_id: sectionId,
            time_spent_seconds: Math.round(timeSpent / 1000),
            session_id: editSessionId.current,
            field_type: getFieldType(fieldName),
            is_required_field: isRequiredField(fieldName, sectionId)
          }
        });
      }
      
      // Add to edited fields set
      const fieldKey = `${sectionId}_${fieldName}`;
      if (!fieldsEdited.has(fieldKey)) {
        setFieldsEdited(prev => new Set([...prev, fieldKey]));
        
        // Track first edit of this field
        trackFirebaseEvent({
          eventName: 'field_first_edit',
          eventCategory: 'Resume Builder',
          eventLabel: fieldName,
          pagePath: '/edit',
          pageTitle: 'Edit Resume',
          metadata: {
            field_name: fieldName,
            section_id: sectionId,
            session_id: editSessionId.current,
            total_fields_edited: fieldsEdited.size + 1,
            time_to_first_edit: Math.round((Date.now() - pageEnterTime.current) / 1000)
          }
        });
      }
      
    } else if (action === 'change' || action === 'input') {
      // Track field value changes (but throttle to avoid too many events)
      const lastTrackTime = localStorage.getItem(`last_track_${fieldName}`);
      const currentTime = Date.now();
      
      if (!lastTrackTime || currentTime - parseInt(lastTrackTime) > 5000) { // Throttle to 5 seconds
        trackFirebaseEvent({
          eventName: 'field_value_changed',
          eventCategory: 'Resume Builder',
          eventLabel: fieldName,
          pagePath: '/edit',
          pageTitle: 'Edit Resume',
          metadata: {
            field_name: fieldName,
            section_id: sectionId,
            session_id: editSessionId.current,
            value_length: value ? value.toString().length : 0,
            has_value: !!value && value.toString().trim() !== '',
            field_type: getFieldType(fieldName)
          }
        });
        localStorage.setItem(`last_track_${fieldName}`, currentTime.toString());
      }
    }
    
    // Also track for Google Analytics
    trackGAEvent('field_interaction', {
      field_name: fieldName,
      action: action,
      section_id: sectionId,
      event_category: 'Form Engagement',
      event_label: fieldName
    });
  };

  // Track section completion with detailed metrics
  const trackSectionCompletion = (sectionId: string, completion: number) => {
    const previousCompletion = localStorage.getItem(`section_${sectionId}_completion`) || '0';
    
    trackFirebaseEvent({
      eventName: 'section_completion_updated',
      eventCategory: 'Resume Builder',
      eventLabel: sectionId,
      pagePath: '/edit',
      pageTitle: 'Edit Resume',
      eventValue: completion,
      metadata: {
        section_id: sectionId,
        completion_percentage: completion,
        previous_completion: parseInt(previousCompletion),
        completion_increase: completion - parseInt(previousCompletion),
        time_spent_in_section: sectionTimeSpent[sectionId] || 0,
        fields_edited: Array.from(fieldsEdited).filter(f => f.startsWith(sectionId)).length,
        session_id: editSessionId.current
      }
    });
    
    // Save current completion for comparison
    localStorage.setItem(`section_${sectionId}_completion`, completion.toString());
    
    // If section is completed (100%), track milestone
    if (completion === 100 && parseInt(previousCompletion) < 100) {
      trackFirebaseEvent({
        eventName: 'section_completed',
        eventCategory: 'Resume Builder',
        eventLabel: sectionId,
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        metadata: {
          section_id: sectionId,
          time_to_complete: Math.round((Date.now() - pageEnterTime.current) / 1000),
          fields_in_section: getSectionFieldCount(sectionId),
          session_id: editSessionId.current,
          is_required_section: isRequiredSection(sectionId)
        }
      });
      
      // Funnel step for section completion
      trackFirebaseFunnelStep('resume_editing', `${sectionId}_completed`, 2, {
        section_id: sectionId,
        session_id: editSessionId.current,
        total_sections_completed: getCompletedSectionsCount(resumeData)
      });
    }
  };

  const handleFileUploadTracked = (fileData: any) => {
    handleFileUpload(fileData);
    
    // Google Analytics
    trackGAButtonClick('file_upload', 'file_upload', 'edit_page');
    
    // Firebase Analytics
    trackFirebaseButtonClick('file_upload', 'file_upload', '/edit');
    
    trackFirebaseEvent({
      eventName: 'resume_imported',
      eventCategory: 'Resume Builder',
      eventLabel: 'file_upload',
      pagePath: '/edit',
      pageTitle: 'Edit Resume',
      metadata: {
        file_type: 'resume/cv',
        has_data: !!fileData,
        data_extracted: fileData ? Object.keys(fileData).length : 0,
        session_id: editSessionId.current,
        import_method: 'file_upload',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    });

    // If data was extracted, track what was imported
    if (fileData) {
      const extractedFields = Object.keys(fileData);
      trackFirebaseEvent({
        eventName: 'data_extracted_from_import',
        eventCategory: 'Resume Builder',
        eventLabel: 'import_success',
        pagePath: '/edit',
        pageTitle: 'Edit Resume',
        eventValue: extractedFields.length,
        metadata: {
          fields_extracted: extractedFields.length,
          has_personal_info: !!fileData.personalInfo,
          has_experience: fileData.experiences && fileData.experiences.length > 0,
          has_education: fileData.education && fileData.education.length > 0,
          has_skills: fileData.skills && fileData.skills.length > 0,
          session_id: editSessionId.current
        }
      });
    }
  };

  const sectionList = [
    { id: 'personal', name: 'Personal', icon: '👤', color: 'text-blue-500', description: 'Basic information' },
    { id: 'experience', name: 'Experience', icon: '💼', color: 'text-green-500', description: 'Work history' },
    { id: 'education', name: 'Education', icon: '🎓', color: 'text-orange-500', description: 'Academic background' },
    { id: 'skills', name: 'Skills', icon: '⚡', color: 'text-red-500', description: 'Technical & soft skills' },
    { id: 'projects', name: 'Projects', icon: '📁', color: 'text-teal-500', description: 'Key projects' },
    { id: 'awards', name: 'Awards', icon: '🏆', color: 'text-yellow-500', description: 'Achievements' },
    { id: 'custom', name: 'Additional', icon: '➕', color: 'text-indigo-500', description: 'Extra sections' },
    { id: 'order', name: 'Reorder', icon: '↕️', color: 'text-purple-500', description: 'Layout order' },
    { id: 'import', name: 'Import', icon: '📥', color: 'text-pink-500', description: 'Upload resume' },
  ];

  const getSectionTitle = (sectionId: string) => {
    const section = sectionList.find(s => s.id === sectionId);
    return section ? section.name : 'Section';
  };

  // Check completion status of each section
  const getSectionCompletion = (sectionId: string) => {
    switch(sectionId) {
      case 'personal':
        const personalFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
        const filledPersonal = personalFields.filter(field => {
          const value = resumeData.personalInfo[field];
          if (Array.isArray(value)) {
            return value.length > 0 && value[0] !== '';
          }
          return value && value.toString().trim() !== '';
        }).length;
        return Math.round((filledPersonal / personalFields.length) * 100);
      
      case 'experience':
        if (resumeData.experiences.length === 0) return 0;
        const filledExperiences = resumeData.experiences.filter(exp => 
          exp.title && exp.title.trim() !== '' && exp.company && exp.company.trim() !== ''
        ).length;
        return Math.round((filledExperiences / resumeData.experiences.length) * 100);
      
      case 'education':
        if (resumeData.education.length === 0) return 0;
        const filledEducation = resumeData.education.filter(edu => 
          edu.degree && edu.degree.trim() !== '' && edu.institution && edu.institution.trim() !== ''
        ).length;
        return Math.round((filledEducation / resumeData.education.length) * 100);
      
      case 'skills':
        return resumeData.skills.length >= 3 ? 100 : Math.round((resumeData.skills.length / 3) * 100);
      
      case 'projects':
        return resumeData.projects.length > 0 ? 100 : 0;
      
      case 'awards':
        return resumeData.awards.length > 0 ? 100 : 0;
      
      case 'custom':
        return resumeData.customFields.length > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  // Helper functions for analytics
  const getSectionFieldCount = (sectionId: string): number => {
    switch(sectionId) {
      case 'personal': return 10;
      case 'experience': return resumeData.experiences.length * 6;
      case 'education': return resumeData.education.length * 5;
      case 'skills': return resumeData.skills.length;
      case 'projects': return resumeData.projects.length * 4;
      case 'awards': return resumeData.awards.length * 3;
      case 'custom': return resumeData.customFields.length * 2;
      default: return 0;
    }
  };

  const isRequiredField = (fieldName: string, sectionId: string): boolean => {
    const requiredFields: Record<string, string[]> = {
      'personal': ['name', 'email', 'phone', 'title'],
      'experience': ['title', 'company'],
      'education': ['degree', 'institution']
    };
    return requiredFields[sectionId]?.includes(fieldName) || false;
  };

  const getFieldType = (fieldName: string): string => {
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('phone')) return 'phone';
    if (fieldName.includes('date')) return 'date';
    if (fieldName.includes('url') || fieldName.includes('link')) return 'url';
    if (fieldName.includes('description') || fieldName.includes('summary')) return 'textarea';
    return 'text';
  };

  const isRequiredSection = (sectionId: string): boolean => {
    return ['personal', 'experience', 'education', 'skills'].includes(sectionId);
  };

  const getSectionsCompletedDuringSession = (resumeData: any): number => {
    let completed = 0;
    const sections = ['personal', 'experience', 'education', 'skills', 'projects', 'awards'];
    
    sections.forEach(sectionId => {
      if (getSectionCompletion(sectionId) === 100) {
        completed++;
      }
    });
    
    return completed;
  };

  return (
    <>
      <SEO
        title="Edit Resume - Update Your CV Information | CareerCraft"
        description="Update your resume information including personal details, work experience, education, skills, projects, and awards. Create the perfect CV for your job applications."
        keywords="edit resume, update CV, resume information, work experience, education details, skills update, project information, awards and achievements"
        canonicalUrl="https://careercraft.in/edit"
      />
      
      <div className="min-h-screen bg-gray-50 py-2 md:py-6">
        <div className="container mx-auto px-2 md:px-4 max-w-6xl">
          {/* Mobile Header */}
          <div className="md:hidden mb-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <h1 className="text-lg font-bold text-gray-800">Edit Resume</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-medium ${sectionList.find(s => s.id === activeSection)?.color}`}>
                    {getSectionTitle(activeSection)}
                  </span>
                  <span className="text-xs text-gray-500">• {calculateCompletion(resumeData)}% Complete</span>
                </div>
              </div>
              <div className="flex gap-2">
                {showSectionPrompts && (
                  <button
                    onClick={() => {
                      setShowAllSections(!showAllSections);
                      trackFirebaseButtonClick('jump_to_section_toggle', 'mobile_header', '/edit');
                    }}
                    className="bg-purple-600 text-white p-2 rounded-lg"
                    title="Jump to Section"
                  >
                    ⚡
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    trackFirebaseButtonClick('mobile_menu_toggle', 'mobile_header', '/edit');
                  }}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  {isMobileMenuOpen ? '✕' : '☰'}
                </button>
              </div>
            </div>
          </div>

          {/* PROACTIVE SECTION PROMPTS - Mobile */}
          {showSectionPrompts && (
            <div className="md:hidden mb-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 text-sm">🚀 Next Steps to Complete Your Resume</h3>
                <div className="grid grid-cols-3 gap-1">
                  {sectionList.filter(s => s.id !== 'personal').slice(0, 6).map(section => (
                    <button
                      key={section.id}
                      onClick={() => {
                        handleSectionEdit(section.id, section.id);
                        trackFirebaseEvent({
                          eventName: 'section_prompt_clicked',
                          eventCategory: 'Resume Builder',
                          eventLabel: section.id,
                          pagePath: '/edit',
                          pageTitle: 'Edit Resume',
                          metadata: {
                            section_id: section.id,
                            completion_before: getSectionCompletion(section.id),
                            prompt_location: 'mobile_proactive',
                            session_id: editSessionId.current
                          }
                        });
                      }}
                      className="flex flex-col items-center p-2 rounded-lg bg-white hover:bg-blue-50 transition-colors"
                    >
                      <span className={`text-lg ${section.color} mb-1`}>{section.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{section.name}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${getSectionCompletion(section.id) === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${getSectionCompletion(section.id)}%` }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mb-3 bg-white rounded-lg shadow-lg p-3">
              <div className="grid grid-cols-3 gap-2">
                {sectionList.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionEdit(section.id, section.id)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                      activeSection === section.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-lg mb-1 ${section.color}`}>{section.icon}</span>
                    <span className="text-xs font-medium">{section.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/builder"
                  onClick={() => {
                    trackGACTAClick('mobile_view_templates', 'mobile_menu', 'edit_page');
                    trackFirebaseCTAClick('mobile_view_templates', 'mobile_menu', '/edit');
                    
                    trackFirebaseEvent({
                      eventName: 'exit_to_builder',
                      eventCategory: 'Resume Builder',
                      eventLabel: 'mobile_menu',
                      pagePath: '/edit',
                      pageTitle: 'Edit Resume',
                      metadata: {
                        exit_point: 'mobile_menu',
                        completion_at_exit: calculateCompletion(resumeData),
                        time_spent: Math.round((Date.now() - pageEnterTime.current) / 1000),
                        session_id: editSessionId.current
                      }
                    });
                  }}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs text-center"
                >
                  View Templates
                </Link>
                <button 
                  onClick={handleSaveChanges}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Your Resume</h1>
              <p className="text-gray-600">Fill in your information below</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/builder"
                onClick={() => {
                  trackGACTAClick('back_to_templates', 'header', 'edit_page');
                  trackGAUserFlow('edit', 'builder', 'navigation');
                  trackFirebaseCTAClick('back_to_templates', 'header', '/edit');
                  trackFirebaseUserFlow('edit', 'builder', 'navigation');
                  
                  // Track funnel step
                  trackFirebaseEvent({
                    eventName: 'back_to_builder',
                    eventCategory: 'Resume Builder',
                    eventLabel: 'navigation',
                    pagePath: '/edit',
                    pageTitle: 'Edit Resume',
                    metadata: {
                      completion_at_exit: calculateCompletion(resumeData),
                      time_spent: Math.round((Date.now() - pageEnterTime.current) / 1000),
                      fields_edited: fieldsEdited.size,
                      session_id: editSessionId.current,
                      exit_action: 'back_to_builder'
                    }
                  });
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Templates
              </Link>
              <button 
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-1">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Resume Completion</h3>
                <p className="text-gray-500 text-xs mt-0.5">Complete all sections for the best results</p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 sm:mt-0">
                {calculateCompletion(resumeData)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion(resumeData)}%` }}
              ></div>
            </div>
          </div>

          {/* PROACTIVE SECTION PROMPTS - Desktop */}
          {showSectionPrompts && (
            <div className="hidden md:block mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 text-lg">🚀 Complete Your Resume - Next Steps</h3>
                <div className="grid grid-cols-7 gap-2">
                  {sectionList.filter(s => s.id !== 'personal' && s.id !== 'order' && s.id !== 'import').map(section => (
                    <button
                      key={section.id}
                      onClick={() => {
                        handleSectionEdit(section.id, section.id);
                        trackFirebaseEvent({
                          eventName: 'section_prompt_clicked',
                          eventCategory: 'Resume Builder',
                          eventLabel: section.id,
                          pagePath: '/edit',
                          pageTitle: 'Edit Resume',
                          metadata: {
                            section_id: section.id,
                            completion_before: getSectionCompletion(section.id),
                            prompt_location: 'desktop_proactive',
                            session_id: editSessionId.current
                          }
                        });
                      }}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105 ${
                        getSectionCompletion(section.id) === 100 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-white border border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`text-2xl ${section.color} mb-2`}>{section.icon}</span>
                      <span className="font-medium text-gray-800 text-sm">{section.name}</span>
                      <span className="text-xs text-gray-600 mt-1">{section.description}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className={`h-1.5 rounded-full ${
                            getSectionCompletion(section.id) === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${getSectionCompletion(section.id)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1 font-medium">
                        {getSectionCompletion(section.id) === 100 ? '✓ Complete' : `${getSectionCompletion(section.id)}%`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
                <h3 className="font-semibold text-gray-800 mb-3">Jump to Section</h3>
                <div className="space-y-1">
                  {sectionList.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionEdit(section.id, section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-base ${section.color}`}>{section.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{section.name}</span>
                          {section.id !== 'personal' && section.id !== 'order' && section.id !== 'import' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              getSectionCompletion(section.id) === 100 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {getSectionCompletion(section.id)}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      to="/builder"
                      onClick={() => {
                        trackFirebaseCTAClick('sidebar_view_templates', 'desktop_sidebar', '/edit');
                        trackFirebaseEvent({
                          eventName: 'sidebar_navigation',
                          eventCategory: 'Resume Builder',
                          eventLabel: 'to_builder',
                          pagePath: '/edit',
                          pageTitle: 'Edit Resume',
                          metadata: {
                            navigation_source: 'desktop_sidebar',
                            completion_at_navigation: calculateCompletion(resumeData),
                            session_id: editSessionId.current
                          }
                        });
                      }}
                      className="w-full bg-blue-600 text-white px-3 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      View Templates
                    </Link>
                    <button 
                      onClick={handleSaveChanges}
                      className="w-full bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              {/* Mobile: Show Jump to Section when toggled */}
              {(showAllSections || window.innerWidth >= 768) && (
                <div className="mb-4 md:hidden">
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">Jump to Section</h3>
                      <button
                        onClick={() => {
                          setShowAllSections(false);
                          trackFirebaseButtonClick('close_section_selector', 'mobile_section_selector', '/edit');
                        }}
                        className="text-gray-500 text-sm"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sectionList.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionEdit(section.id, section.id)}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                            activeSection === section.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-base mb-1 ${section.color}`}>{section.icon}</span>
                          <span className="text-xs font-medium">{section.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Show only active section */}
              <div className="lg:hidden">
                {activeSection === 'personal' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-blue-500">👤</span>
                      Personal Information
                    </h2>
                    <PersonalInfo 
                      data={resumeData.personalInfo} 
                      onChange={updatePersonalInfo}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'personal', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-green-500">💼</span>
                        Work Experience
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.experiences.length}
                      </span>
                    </div>
                    <Experience 
                      experiences={resumeData.experiences}
                      onUpdate={updateExperience}
                      onAdd={addExperience}
                      onRemove={removeExperience}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'experience', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-orange-500">🎓</span>
                        Education
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.education.length}
                      </span>
                    </div>
                    <Education 
                      education={resumeData.education}
                      onUpdate={updateEducation}
                      onAdd={addEducation}
                      onRemove={removeEducation}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'education', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-teal-500">📁</span>
                        Projects
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.projects.length}
                      </span>
                    </div>
                    <Projects
                      projects={resumeData.projects}
                      onUpdate={updateProject}
                      onAdd={addProject}
                      onRemove={removeProject}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'projects', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-red-500">⚡</span>
                        Skills
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.skills.length}
                      </span>
                    </div>
                    <Skills 
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdateProficiency={updateSkillProficiency}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'skills', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'awards' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-yellow-500">🏆</span>
                        Awards & Achievements
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.awards.length}
                      </span>
                    </div>
                    <Awards
                      awards={resumeData.awards}
                      onUpdate={updateAward}
                      onAdd={addAward}
                      onRemove={removeAward}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'awards', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'custom' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-indigo-500">➕</span>
                        Additional Information
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {resumeData.customFields.length}
                      </span>
                    </div>
                    <CustomFields
                      customFields={resumeData.customFields}
                      onUpdate={updateCustomField}
                      onAdd={addCustomField}
                      onRemove={removeCustomField}
                      onChangeType={changeCustomFieldType}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'custom', value)
                      }
                    />
                  </div>
                )}

                {activeSection === 'order' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-purple-500">↕️</span>
                        Section Order & Reordering
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {sectionOrder.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Drag and drop sections to reorder your resume layout</p>
                    <SectionOrderCustomizer 
                      sections={sectionOrder}
                      onReorder={(newOrder) => {
                        handleSectionReorder(newOrder);
                        trackFirebaseEvent({
                          eventName: 'section_order_changed',
                          eventCategory: 'Resume Builder',
                          eventLabel: 'layout_reordered',
                          pagePath: '/edit',
                          pageTitle: 'Edit Resume',
                          metadata: {
                            new_order: newOrder,
                            previous_order: sectionOrder,
                            session_id: editSessionId.current
                          }
                        });
                      }}
                    />
                  </div>
                )}

                {activeSection === 'import' && (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-pink-500">📥</span>
                      Import Resume
                    </h2>
                    <FileUpload 
                      onUpload={handleFileUploadTracked}
                    />
                  </div>
                )}

                {/* Quick Actions for Mobile */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">Need Help?</h3>
                  <p className="text-xs text-blue-700 mb-2">Complete your information and view templates</p>
                  <button
                    onClick={() => {
                      setShowAllSections(true);
                      trackFirebaseButtonClick('jump_to_section_prompt', 'mobile_help_section', '/edit');
                    }}
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-xs text-center mb-2"
                  >
                    ⚡ Jump to Another Section
                  </button>
                  <div className="flex gap-2">
                    <Link
                      to="/builder"
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs text-center"
                    >
                      View Templates
                    </Link>
                    <button 
                      onClick={handleSaveChanges}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs"
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop: Show all sections */}
              <div className="hidden lg:block space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-blue-500">👤</span>
                    Personal Information
                  </h2>
                  <PersonalInfo 
                    data={resumeData.personalInfo} 
                    onChange={updatePersonalInfo}
                    onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                      trackFieldInteraction(fieldName, action, 'personal', value)
                    }
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-green-500">💼</span>
                      Work Experience
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {resumeData.experiences.length} entries
                    </span>
                  </div>
                  <Experience 
                    experiences={resumeData.experiences}
                    onUpdate={updateExperience}
                    onAdd={addExperience}
                    onRemove={removeExperience}
                    onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                      trackFieldInteraction(fieldName, action, 'experience', value)
                    }
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-orange-500">🎓</span>
                      Education
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {resumeData.education.length} entries
                    </span>
                  </div>
                  <Education 
                    education={resumeData.education}
                    onUpdate={updateEducation}
                    onAdd={addEducation}
                    onRemove={removeEducation}
                    onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                      trackFieldInteraction(fieldName, action, 'education', value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-teal-500">📁</span>
                        Projects
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.projects.length}
                      </span>
                    </div>
                    <Projects
                      projects={resumeData.projects}
                      onUpdate={updateProject}
                      onAdd={addProject}
                      onRemove={removeProject}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'projects', value)
                      }
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-red-500">⚡</span>
                        Skills
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.skills.length}
                      </span>
                    </div>
                    <Skills 
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdateProficiency={updateSkillProficiency}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'skills', value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-yellow-500">🏆</span>
                        Awards & Achievements
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.awards.length}
                      </span>
                    </div>
                    <Awards
                      awards={resumeData.awards}
                      onUpdate={updateAward}
                      onAdd={addAward}
                      onRemove={removeAward}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'awards', value)
                      }
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-indigo-500">➕</span>
                        Additional Information
                      </h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {resumeData.customFields.length}
                      </span>
                    </div>
                    <CustomFields
                      customFields={resumeData.customFields}
                      onUpdate={updateCustomField}
                      onAdd={addCustomField}
                      onRemove={removeCustomField}
                      onChangeType={changeCustomFieldType}
                      onFieldInteraction={(fieldName: string, action: 'focus' | 'blur' | 'change' | 'input', value?: any) => 
                        trackFieldInteraction(fieldName, action, 'custom', value)
                      }
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-purple-500">↕️</span>
                      Section Order & Reordering
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sectionOrder.length} sections
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Drag and drop sections to customize the order of your resume layout</p>
                  <SectionOrderCustomizer 
                    sections={sectionOrder}
                    onReorder={(newOrder) => {
                      handleSectionReorder(newOrder);
                      trackFirebaseEvent({
                        eventName: 'section_order_changed',
                        eventCategory: 'Resume Builder',
                        eventLabel: 'layout_reordered',
                        pagePath: '/edit',
                        pageTitle: 'Edit Resume',
                        metadata: {
                          new_order: newOrder,
                          previous_order: sectionOrder,
                          session_id: editSessionId.current
                        }
                      });
                    }}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-pink-500">📥</span>
                    Import Resume
                  </h2>
                  <FileUpload 
                    onUpload={handleFileUploadTracked}
                  />
                </div>
              </div>

              {/* Tips & Actions - Bottom Section */}
              <div className="mt-4 md:mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">💡 Pro Tips</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Use action verbs to describe achievements</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Quantify results with numbers</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Tailor keywords to job description</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Keep resume to 1-2 pages maximum</span>
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/builder"
                    onClick={() => {
                      trackGACTAClick('view_ats_templates', 'quick_actions', 'edit_page');
                      trackGAUserFlow('edit', 'builder', 'navigation');
                      trackFirebaseCTAClick('view_ats_templates', 'quick_actions', '/edit');
                      trackFirebaseUserFlow('edit', 'builder', 'navigation');
                      
                      // Track completion status when going back to builder
                      trackFirebaseEvent({
                        eventName: 'edit_to_builder',
                        eventCategory: 'Resume Builder',
                        eventLabel: 'navigation',
                        pagePath: '/edit',
                        pageTitle: 'Edit Resume',
                        metadata: {
                          completion: calculateCompletion(resumeData),
                          sections_completed: getCompletedSectionsCount(resumeData),
                          time_spent_seconds: Math.round((Date.now() - pageEnterTime.current) / 1000),
                          fields_edited: fieldsEdited.size,
                          session_id: editSessionId.current,
                          exit_action: 'to_builder'
                        }
                      });
                      
                      // Funnel step
                      trackFirebaseFunnelStep('resume_editing', 'returned_to_builder', 4, {
                        completion_at_exit: calculateCompletion(resumeData),
                        session_id: editSessionId.current
                      });
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    View ATS Templates
                  </Link>
                  <Link
                    to="/premium"
                    onClick={() => {
                      trackFirebaseCTAClick('view_premium_templates', 'quick_actions', '/edit');
                      trackFirebaseUserFlow('edit', 'premium', 'navigation');
                      trackFirebaseEvent({
                        eventName: 'premium_interest',
                        eventCategory: 'Resume Builder',
                        eventLabel: 'from_edit_page',
                        pagePath: '/edit',
                        pageTitle: 'Edit Resume',
                        metadata: {
                          completion_at_click: calculateCompletion(resumeData),
                          session_id: editSessionId.current,
                          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                        }
                      });
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    View Premium Templates
                  </Link>
                  <button 
                    onClick={handleSaveChanges}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base text-center font-semibold"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Analytics Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-1">📝 Edit Session Analytics</div>
          <div className="text-green-400">✓ Session: {editSessionId.current.substring(0, 10)}...</div>
          <div className="text-blue-400">⏱️ Time: {Math.round((Date.now() - pageEnterTime.current) / 1000)}s</div>
          <div className="text-yellow-400">📋 Fields: {fieldsEdited.size} edited</div>
          <div className="text-purple-400">📊 Sections: {Object.keys(sectionTimeSpent).length} engaged</div>
          <div className="text-teal-400">🎯 Completion: {calculateCompletion(resumeData)}%</div>
        </div>
      )}
    </>
  );
};

// Helper function to check if personal info is filled
const checkPersonalInfoFilled = (personalInfo: PersonalInfoData): boolean => {
  const requiredFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
  return requiredFields.every(field => {
    const value = personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  });
};

// Helper function to calculate completion percentage
const calculateCompletion = (resumeData: any): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info - FIXED: Use proper typing and handle string/string[]
  const personalInfoFields: (keyof PersonalInfoData)[] = ['name', 'email', 'phone', 'title'];
  totalFields += personalInfoFields.length;
  completedFields += personalInfoFields.filter(field => {
    const value = resumeData.personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  }).length;

  // Experience (at least one entry with title and company)
  if (resumeData.experiences.length > 0) {
    completedFields += 2;
    resumeData.experiences.forEach((exp: any) => {
      const expFields = ['company', 'title'];
      totalFields += expFields.length;
      completedFields += expFields.filter(field => 
        exp[field] && exp[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Education (at least one entry)
  if (resumeData.education.length > 0) {
    completedFields += 2;
    resumeData.education.forEach((edu: any) => {
      const eduFields = ['institution', 'degree'];
      totalFields += eduFields.length;
      completedFields += eduFields.filter(field => 
        edu[field] && edu[field].trim() !== ''
      ).length;
    });
  } else {
    totalFields += 2;
  }

  // Skills (at least 3 skills)
  if (resumeData.skills.length >= 3) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  // Summary (at least one summary point)
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) {
    completedFields += 1;
    totalFields += 1;
  } else {
    totalFields += 1;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Helper function to count completed sections
const getCompletedSectionsCount = (resumeData: any): number => {
  let completedSections = 0;
  
  // Personal Info (name, email, phone, title)
  const hasPersonalInfo = ['name', 'email', 'phone', 'title'].every(field => {
    const value = resumeData.personalInfo[field];
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== '';
    }
    return value && value.toString().trim() !== '';
  });
  if (hasPersonalInfo) completedSections++;
  
  // Experience (at least one entry)
  if (resumeData.experiences.length > 0) completedSections++;
  
  // Education (at least one entry)
  if (resumeData.education.length > 0) completedSections++;
  
  // Skills (at least 3 skills)
  if (resumeData.skills.length >= 3) completedSections++;
  
  // Projects (at least one project)
  if (resumeData.projects.length > 0) completedSections++;
  
  // Awards (at least one award)
  if (resumeData.awards.length > 0) completedSections++;
  
  // Summary (at least one summary point)
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 0) completedSections++;
  
  return completedSections;
};

export default EditResumePage;