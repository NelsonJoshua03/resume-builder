// HomePage.tsx - UPDATED VERSION - CLEANED MOBILE VIEW, FIXED EXIT MODAL
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  Briefcase, 
  CheckCircle,
  ArrowRight,
  Star,
  Download,
  Shield,
  Zap,
  Users,
  Award,
  Clock,
  Target,
  Search,
  Building,
  GraduationCap,
  Rocket,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Smartphone,
  TrendingUp as TrendingUpIcon,
  Edit
} from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import SEO from './SEO';

// Default resume data for John Doe (from ResumeContext)
const defaultResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Software Developer',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    summary: [
      'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
      'Passionate about building scalable web applications with clean architecture.',
      'Strong problem-solving skills and experience in agile development environments.'
    ],
    profilePicture: ''
  },
  experiences: [
    {
      id: 1,
      title: 'Senior Developer',
      company: 'Tech Solutions Inc.',
      period: '2020 - Present',
      description: [
        'Led frontend development team and implemented new features',
        'Mentored junior developers and conducted code reviews',
        'Optimized application performance reducing load time by 40%'
      ]
    },
    {
      id: 2,
      title: 'Junior Developer',
      company: 'StartUp Co.',
      period: '2018 - 2020',
      description: [
        'Developed and maintained web applications using React',
        'Collaborated with design team to implement responsive UI',
        'Participated in agile development processes'
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: 'Bachelor of Computer Science',
      institution: 'University of Technology',
      year: '2018',
      gpa: '3.8/4.0'
    }
  ],
  projects: [],
  awards: [],
  customFields: [],
  skills: [
    { name: 'React', proficiency: 'Advanced' },
    { name: 'Node.js', proficiency: 'Intermediate' },
    { name: 'JavaScript', proficiency: 'Advanced' },
    { name: 'HTML/CSS', proficiency: 'Expert' },
    { name: 'MongoDB', proficiency: 'Intermediate' },
    { name: 'AWS', proficiency: 'Beginner' }
  ],
  selectedTemplate: 'creative',
  customColors: {}
};

// Creative template
const creativeTemplate = {
  id: 'creative',
  name: 'Creative',
  layout: 'creative',
  colors: {
    primary: '#9333ea',
    secondary: '#7e22ce',
    accent: '#d8b4fe',
    background: '#faf5ff',
    text: '#1f2937'
  }
};

// Executive template
const executiveTemplate = {
  id: 'executive',
  name: 'Executive',
  layout: 'executive',
  colors: {
    primary: '#312e81',
    secondary: '#3730a3',
    accent: '#6366f1',
    background: '#ffffff',
    text: '#111827'
  }
};

// Default section order
const defaultSectionOrder = [
  { id: 'summary', label: 'Professional Summary', enabled: true, order: 0 },
  { id: 'experience', label: 'Work Experience', enabled: true, order: 1 },
  { id: 'education', label: 'Education', enabled: true, order: 2 },
  { id: 'projects', label: 'Projects', enabled: true, order: 3 },
  { id: 'skills', label: 'Skills', enabled: true, order: 4 },
  { id: 'awards', label: 'Awards', enabled: true, order: 5 },
  { id: 'custom', label: 'Additional Sections', enabled: true, order: 6 }
];

// Exit Intent Modal Component - UPDATED: Responsive mobile design
const ExitIntentModal = ({ onClose }: { 
  onClose: () => void;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'creative' | 'executive'>('creative');
  const navigate = useNavigate();

  const handleGoToBuilder = () => {
    navigate('/edit');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Rocket size={18} className="md:size-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">🚀 Ready to Build Your Perfect Resume?</h3>
                <p className="text-blue-100 text-sm md:text-base">Start creating your professional resume now</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} className="md:size-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Left - Template Selection */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">Choose Your Resume Template</h4>
                
                <div className="space-y-3">
                  {/* Creative Template */}
                  <div 
                    className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTemplate === 'creative' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                    onClick={() => setSelectedTemplate('creative')}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedTemplate === 'creative' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}></div>
                      <h5 className="font-semibold text-gray-800 text-sm md:text-base">Creative Template</h5>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Colorful and expressive design for creative fields</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Modern</span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">ATS-Friendly</span>
                    </div>
                  </div>
                  
                  {/* Executive Template */}
                  <div 
                    className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTemplate === 'executive' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                    onClick={() => setSelectedTemplate('executive')}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedTemplate === 'executive' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}></div>
                      <h5 className="font-semibold text-gray-800 text-sm md:text-base">Executive Template</h5>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Elegant corporate design for senior roles</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Professional</span>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Corporate</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm">
                  <TrendingUpIcon size={14} className="md:size-4" />
                  <span className="font-semibold">87% higher interview rate</span>
                </div>
              </div>
            </div>

            {/* Right - Call to Action */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  <span className="text-blue-600">Start Building Your Resume Now</span>
                </h4>
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  Create a professionally designed resume with your own information. No sample needed - build your real resume immediately.
                </p>
                
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  {[
                    "✅ ATS-optimized for Indian companies",
                    "✅ Ready in under 5 minutes",
                    "✅ No signup required",
                    "✅ 8+ professional templates",
                    "✅ Instant PDF download"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle size={14} className="md:size-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={handleGoToBuilder}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 group"
                >
                  <Edit size={18} className="md:size-5" />
                  Start Building My Resume
                  <ArrowRight size={18} className="md:size-5 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <Link
                  to="/free-resume-builder"  // CHANGED FROM '/builder'
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <FileText size={18} className="md:size-5" />
                  View All Templates First
                </Link>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-2 md:py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm md:text-base"
                >
                  Maybe later, continue browsing
                </button>
              </div>

              <div className="text-center text-xs md:text-sm text-gray-500 pt-3 md:pt-4 border-t">
                <p>⏰ Limited time: Get <strong>free ATS optimization guide</strong> with your resume</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Optimized Hero Section - UPDATED: Removed redundant mobile CTA
const MobileHeroCTA = () => {
  const navigate = useNavigate();
  const { trackCTAClick } = useGoogleAnalytics();

  return (
    <div className="lg:hidden">
      <div className="sticky bottom-0 z-40 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-4 px-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Build Resume in 2 mins</h4>
              <p className="text-blue-100 text-xs">No signup • Free • ATS Optimized</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              trackCTAClick('mobile_floating_cta', 'floating_bar', 'homepage');
              navigate('/edit');
            }}
            className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold text-base hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <Edit size={16} />
            EDIT & BUILD RESUME
            <ArrowRight size={16} />
          </button>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-1 text-white/80">
              <Users size={12} />
              <span className="text-xs">50K+ Users</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Star size={12} />
              <span className="text-xs">4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Clock size={12} />
              <span className="text-xs">2 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resume Preview Section - UPDATED: No download, direct to builder
const ResumePreviewSection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<'creative' | 'executive'>('creative');
  const { trackCTAClick } = useGoogleAnalytics();
  const { trackCTAClick: trackFirebaseCTAClick } = useFirebaseAnalytics();
  const navigate = useNavigate();

  const handleGoToBuilder = () => {
    navigate('/edit');
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="text-blue-600">Professional Resume Templates</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Choose from our professionally designed templates and build your resume in minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* RESUME IMAGE PREVIEW */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="md:size-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm md:text-base">Professional Resume Templates</h4>
                    <p className="text-xs md:text-sm text-gray-500">Choose your preferred design</p>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-3 md:mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTemplate('creative')}
                    className={`flex-1 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${selectedTemplate === 'creative' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Creative Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('executive')}
                    className={`flex-1 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${selectedTemplate === 'executive' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Executive Template
                  </button>
                </div>
              </div>

              {/* High-Quality Resume Image */}
              <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                {/* Placeholder images - Replace with your actual generated images */}
                {selectedTemplate === 'creative' ? (
                  <div className="relative w-full h-full p-2 md:p-4">
                    {/* Creative Template Image */}
                    <img 
                      src="/images/creative-resume-preview.png" 
                      alt="Creative Resume Template Preview"
                      className="w-full h-full object-contain rounded-lg border border-purple-200 shadow-sm"
                      loading="lazy"
                    />
                    <span className="sr-only">Preview of Creative Resume Template - Modern design with purple accent colors, professional layout for creative fields</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full p-2 md:p-4">
                    {/* Executive Template Image */}
                    <img 
                      src="/images/executive-resume-preview.png" 
                      alt="Executive Resume Template Preview"
                      className="w-full h-full object-contain rounded-lg border border-indigo-200 shadow-sm"
                      loading="lazy"
                    />
                    <span className="sr-only">Preview of Executive Resume Template - Professional corporate design with indigo accents, clean layout for business roles</span>
                  </div>
                )}
                
                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-xs text-gray-400">
                    Preview only - Build your own to download
                  </div>
                </div>
              </div>
              
              {/* Image Caption */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  High-quality {selectedTemplate === 'creative' ? 'Creative' : 'Executive'} template preview
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                Ready to Build Your Resume?
              </h3>
              
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                {[
                  "✅ Choose from 8+ professional templates",
                  "✅ Customize with your information",
                  "✅ Optimize for Indian companies",
                  "✅ No signup required",
                  "✅ Instant PDF download"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 md:gap-3">
                    <CheckCircle size={14} className="md:size-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={() => {
                    trackCTAClick('start_building_from_preview', 'preview_section', 'homepage');
                    trackFirebaseCTAClick('start_building_from_preview', 'preview_section', 'homepage');
                    handleGoToBuilder();
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
                >
                  <Edit size={16} className="md:size-5" />
                  Start Building My Resume
                  <ArrowRight size={16} className="md:size-5" />
                </button>

                <button
                  onClick={() => {
                    trackCTAClick('view_all_templates', 'preview_section', 'homepage');
                    trackFirebaseCTAClick('view_all_templates', 'preview_section', 'homepage');
                    navigate('/free-resume-builder');  // CHANGED FROM '/builder'
                  }}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 py-2 md:py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <FileText size={16} className="md:size-5" />
                  View All 8+ Templates
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">5 min</div>
                <div className="text-xs md:text-sm text-gray-600">Average build time</div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">87%</div>
                <div className="text-xs md:text-sm text-gray-600">Higher interview rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeOnPage, setTimeOnPage] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow, 
    trackPageView,
    trackExitIntent
  } = useGoogleAnalytics();

  const { trackDailyPageView } = useEnhancedAnalytics();
  
  const {
    trackEvent: trackFirebaseEvent,
    trackPageView: trackFirebasePageView,
    trackCTAClick: trackFirebaseCTAClick,
    trackButtonClick: trackFirebaseButtonClick,
    trackFunnelStep: trackFirebaseFunnelStep,
    trackExitIntent: trackFirebaseExitIntent
  } = useFirebaseAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView('CareerCraft Home Page - Free Resume Builder & Job Portal India', '/');
    trackDailyPageView('Home Page', '/');
    trackFirebasePageView('/', 'CareerCraft Home Page');

    // Track time on page
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasInteracted && timeOnPage > 10) {
        showExitIntent();
      }
    };

    const handleBeforeUnload = () => {
      if (!hasInteracted && timeOnPage > 5) {
        trackExitIntent('page_exit', timeOnPage);
        trackFirebaseExitIntent(timeOnPage, 'page_close');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasInteracted, timeOnPage]);

  // Mouse movement tracking for exit intent
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if moving toward exit (top of page)
      if (e.clientY < 100 && timeOnPage > 15 && !hasInteracted) {
        showExitIntent();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [timeOnPage, hasInteracted]);

  const showExitIntent = () => {
    if (!showExitModal && !hasInteracted) {
      setShowExitModal(true);
      trackExitIntent('modal_triggered', timeOnPage);
      trackFirebaseExitIntent(timeOnPage, 'exit_modal');
    }
  };

  const handleExitModalClose = () => {
    setShowExitModal(false);
    setHasInteracted(true);
  };

  const handleCTAClick = (buttonName: string, section: string) => {
    trackCTAClick(buttonName, section, 'homepage');
    trackFirebaseCTAClick(buttonName, section, 'homepage');
    setHasInteracted(true);
  };

  // Scroll-based CTA trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show exit modal when user scrolls 75% down
      if (scrollPosition > (documentHeight - windowHeight) * 0.75 && !hasInteracted && timeOnPage > 20) {
        showExitIntent();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasInteracted, timeOnPage]);

  return (
    <>
      <SEO
        title="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's #1 Career Platform"
        description="Create ATS-optimized resumes for Indian job market + Find 50,000+ jobs. 100% Free • No Signup • Instant Download • Trusted by 50,000+ Indian Job Seekers"
        keywords="resume builder India free, ATS resume maker online, job portal India 2025, Indian job search platform, engineering jobs Bangalore, IT jobs Mumbai, fresher jobs Delhi, free resume maker no signup, CV builder download PDF, career platform India"
        canonicalUrl="https://careercraft.in/"
        ogImage="https://careercraft.in/og/homepage-preview.jpg"
        structuredData={[]}
      />

      {/* Exit Intent Modal - UPDATED: Responsive design */}
      {showExitModal && (
        <ExitIntentModal 
          onClose={handleExitModalClose}
        />
      )}

      {/* Floating Mobile CTA */}
      <MobileHeroCTA />

      {/* Hidden Time Tracker */}
      <div className="sr-only">
        Time on page: {timeOnPage} seconds
        {hasInteracted && " - User has interacted"}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden" ref={pageRef}>
        {/* Enhanced Hero Section - UPDATED: Clean mobile design */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-8 md:py-12 lg:py-24 w-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 text-center w-full max-w-7xl relative z-10">
            <div className="max-w-5xl mx-auto w-full">
              {/* Mobile Optimized Header - REMOVED redundant mobile CTA */}
              <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2 mb-4 md:mb-6 animate-pulse">
                <TrendingUp size={14} className="md:size-4 text-yellow-300" />
                <span className="text-xs md:text-sm font-medium">Trending: 5,000+ Resumes Built This Week</span>
              </div>
              
              <div className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                <span className="block text-white">Your Dream Job Awaits</span>
                <span className="block text-blue-200 text-lg md:text-2xl lg:text-4xl mt-1 md:mt-2">
                  Start with the Right Resume
                </span>
              </div>
              
              <p className="text-base md:text-xl lg:text-2xl text-blue-200 mb-4 md:mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
                Most candidates get rejected because of <strong className="text-white">ATS filters</strong>. 
                Our templates pass through systems used by <strong className="text-white">TCS, Infosys, Wipro & Amazon</strong>.
              </p>
              
              {/* Primary CTA - UPDATED: Hide "Edit & Build Resume Now" on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full mb-6 md:mb-8">
                <button 
                  onClick={() => {
                    handleCTAClick('edit_resume_hero', 'hero_section');
                    navigate('/edit');
                  }}
                  className="bg-white text-blue-600 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl font-bold text-base md:text-lg lg:text-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 w-full sm:w-auto max-w-md active:scale-95 group hidden sm:flex"
                >
                  <Edit size={20} className="md:size-6" />
                  Edit & Build Resume Now
                  <ArrowRight size={16} className="md:size-5 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <button 
                  onClick={() => {
                    handleCTAClick('view_templates', 'hero_section');
                    navigate('/free-resume-builder');  // CHANGED FROM '/builder'
                  }}
                  className="bg-blue-500/20 text-white border-2 border-white/30 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl font-bold text-base md:text-lg lg:text-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 w-full sm:w-auto max-w-md active:scale-95"
                >
                  <FileText size={20} className="md:size-6" />
                  View All Templates
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
                {[
                  { number: "2 min", label: "Avg. Build Time", color: "text-green-300", icon: <Clock size={16} className="md:size-5" /> },
                  { number: "50K+", label: "Resumes Created", color: "text-yellow-300", icon: <FileText size={16} className="md:size-5" /> },
                  { number: "100%", label: "Free Forever", color: "text-pink-300", icon: <CheckCircle size={16} className="md:size-5" /> },
                  { number: "8+", label: "Templates", color: "text-purple-300", icon: <Award size={16} className="md:size-5" /> }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-5 text-center cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex justify-center mb-1 md:mb-2">
                      <div className="p-1 md:p-2 bg-white/20 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                    <div className={`text-lg md:text-2xl lg:text-3xl font-bold ${stat.color} mb-0.5 md:mb-1 group-hover:scale-110 transition-transform`}>
                      {stat.number}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200 group-hover:text-white transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resume Preview with Image Previews */}
        <ResumePreviewSection />

        {/* Quick Stats Banner */}
        <section className="py-6 md:py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: "🚀", value: "2 min", label: "To build resume" },
                { icon: "🎯", value: "87%", label: "Higher interview rate" },
                { icon: "💯", value: "100%", label: "Free forever" },
                { icon: "📱", value: "Mobile", label: "Friendly" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-3 md:p-4">
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.icon}</div>
                  <div className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-xs md:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Mobile Optimized */}
        <section className="py-8 md:py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Why Build Your Resume Here?
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                We make resume building easy, fast, and effective for Indian job seekers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: "🤖",
                  title: "ATS Optimized",
                  description: "Templates designed to pass through Applicant Tracking Systems",
                  color: "blue",
                  features: ["Keyword optimization", "Clean formatting", "Indian standards"]
                },
                {
                  icon: "⚡",
                  title: "Instant Results",
                  description: "Get your resume ready in minutes, not hours",
                  color: "green",
                  features: ["5-minute setup", "Real-time preview", "Instant download"]
                },
                {
                  icon: "📱",
                  title: "Mobile First",
                  description: "Build and edit on any device, anywhere",
                  color: "purple",
                  features: ["Touch-friendly", "Offline support", "Sync across devices"]
                },
                {
                  icon: "🎯",
                  title: "Industry Specific",
                  description: "Templates for every Indian job sector",
                  color: "red",
                  features: ["IT & Software", "Engineering", "Marketing", "Finance"]
                },
                {
                  icon: "🛡️",
                  title: "Privacy First",
                  description: "Your data stays on your device",
                  color: "indigo",
                  features: ["No signup needed", "No data storage", "GDPR compliant"]
                },
                {
                  icon: "🌟",
                  title: "Proven Results",
                  description: "Trusted by 50,000+ job seekers",
                  color: "yellow",
                  features: ["Higher interview rates", "Better job matches", "Career growth"]
                }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleCTAClick(`feature_${feature.title.toLowerCase()}`, 'features')}
                >
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4">{feature.description}</p>
                  <ul className="space-y-1 md:space-y-2">
                    {feature.features.map((f, i) => (
                      <li key={i} className="flex items-center text-xs md:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 md:mt-12 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-blue-200 max-w-2xl mx-auto">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Ready to Build Your Resume?
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                  Join thousands who found better jobs with professionally built resumes
                </p>
                <button
                  onClick={() => {
                    handleCTAClick('final_bottom_cta', 'features_section');
                    navigate('/edit');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 md:gap-3"
                >
                  <Edit size={16} className="md:size-5" />
                  Edit & Build Now - It's Free!
                  <ArrowRight size={16} className="md:size-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile-Only Quick Actions */}
        <section className="lg:hidden py-6 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleCTAClick('mobile_view_templates', 'quick_actions');
                  navigate('/free-resume-builder');  // CHANGED FROM '/builder'
                }}
                className="bg-white p-3 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow active:scale-95"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-gray-800 text-sm">View Templates</div>
                <div className="text-xs text-gray-500 mt-1">8+ designs</div>
              </button>
              <button
                onClick={() => {
                  handleCTAClick('mobile_start_building', 'quick_actions');
                  navigate('/edit');
                }}
                className="bg-blue-600 text-white p-3 rounded-xl text-center hover:shadow-md transition-shadow active:scale-95"
              >
                <div className="text-2xl mb-2">✏️</div>
                <div className="font-semibold text-sm">Edit Resume</div>
                <div className="text-blue-100 text-xs mt-1">2 minutes</div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;