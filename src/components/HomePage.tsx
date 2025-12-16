// src/components/HomePage.tsx - UPDATED WITHOUT DEBUG SCREEN
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Target
} from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import SEO from './SEO';

const HomePage = () => {
  const { 
    trackButtonClick, 
    trackCTAClick, 
    trackUserFlow, 
    trackPageView 
  } = useGoogleAnalytics();

  const { trackDailyPageView } = useEnhancedAnalytics();
  
  const {
    trackEvent,
    trackPageView: trackFirebasePageView,
    trackCTAClick: trackFirebaseCTAClick,
    trackButtonClick: trackFirebaseButtonClick,
    trackFunnelStep: trackFirebaseFunnelStep,
    trackSignup: trackFirebaseSignup,
    trackUserFlow: trackFirebaseUserFlow
  } = useFirebaseAnalytics();

  // Track page view on mount - DUAL TRACKING
  useEffect(() => {
    // Google Analytics
    trackPageView('CareerCraft Home Page', '/');
    trackDailyPageView('Home Page', '/');
    
    // Firebase Analytics
    trackFirebasePageView('/', 'CareerCraft Home Page');
    trackEvent({
      eventName: 'homepage_view',
      eventCategory: 'Page Views',
      eventLabel: 'homepage_loaded',
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: { 
        source: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent.substring(0, 100)
      }
    });
    
    // Track funnel entry
    trackFirebaseFunnelStep('user_onboarding', 'homepage_visit', 1, {
      entry_point: 'homepage',
      referrer: document.referrer || 'direct',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
    });

    // Track new user vs returning
    const hasVisitedBefore = localStorage.getItem('has_visited_before');
    trackEvent({
      eventName: hasVisitedBefore ? 'returning_user' : 'new_user',
      eventCategory: 'User Type',
      eventLabel: 'homepage_visit',
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: {
        is_returning: !!hasVisitedBefore,
        first_visit: !hasVisitedBefore
      }
    });

    // Set visited flag
    if (!hasVisitedBefore) {
      localStorage.setItem('has_visited_before', 'true');
      localStorage.setItem('first_visit_date', new Date().toISOString());
    }
  }, []);

  const handleCTAClick = (buttonName: string, section: string) => {
    // Google Analytics
    trackCTAClick(buttonName, section, 'homepage');
    trackButtonClick(buttonName, section, 'homepage');
    
    // Firebase Analytics
    trackFirebaseCTAClick(buttonName, section, '/');
    trackFirebaseButtonClick(buttonName, section, '/');
    
    // Track specific conversions
    if (buttonName.includes('build_resume')) {
      trackFirebaseFunnelStep('user_onboarding', 'resume_builder_clicked', 2, {
        button_name: buttonName,
        section: section,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      });
    }
  };

  const handleFeatureClick = (featureName: string) => {
    // Google Analytics
    trackButtonClick(`view_${featureName.toLowerCase()}`, 'features_section', 'homepage');
    
    // Firebase Analytics
    trackFirebaseButtonClick(`view_${featureName.toLowerCase()}`, 'features_section', '/');
    trackEvent({
      eventName: 'feature_view',
      eventCategory: 'Features',
      eventLabel: featureName,
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: { 
        feature_name: featureName,
        page: '/',
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleNavigation = (from: string, to: string, action: string) => {
    // Google Analytics
    trackUserFlow(from, to, action);
    
    // Firebase Analytics
    trackFirebaseUserFlow(from, to, action);
  };

  const handleSignupIntent = (method: string) => {
    // Firebase Analytics
    trackFirebaseSignup(method, 'homepage_cta');
    trackFirebaseFunnelStep('user_onboarding', 'signup_intent', 3, {
      method: method,
      source: 'homepage',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
    });
  };

  // Track scroll depth
  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      const depthMilestones = [25, 50, 75, 90];
      
      depthMilestones.forEach(depth => {
        const key = `scroll_depth_${depth}_tracked`;
        if (scrollDepth >= depth && !sessionStorage.getItem(key)) {
          trackEvent({
            eventName: 'scroll_depth',
            eventCategory: 'Engagement',
            eventLabel: `${depth}%_scroll`,
            pagePath: '/',
            pageTitle: 'CareerCraft Home Page',
            metadata: { 
              scroll_depth: depth,
              page: '/',
              timestamp: new Date().toISOString()
            }
          });
          sessionStorage.setItem(key, 'true');
        }
      });
    };

    window.addEventListener('scroll', trackScrollDepth);
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackEvent({
          eventName: 'time_on_page',
          eventCategory: 'Engagement',
          eventLabel: 'homepage_time_spent',
          pagePath: '/',
          pageTitle: 'CareerCraft Home Page',
          eventValue: timeSpent,
          metadata: { 
            time_spent_seconds: timeSpent,
            page: '/',
            exit_time: new Date().toISOString()
          }
        });
      }
    };
  }, []);

  return (
    <>
      <SEO
        title="Free ATS Resume Builder & Job Portal for Indian Job Seekers | CareerCraft.in"
        description="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume templates for freshers and experienced professionals."
        keywords="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India"
        canonicalUrl="https://careercraft.in/"
        ogImage="https://careercraft.in/logos/careercraft-logo-square.png"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 md:py-20 w-full">
          <div className="container mx-auto px-4 text-center w-full max-w-7xl">
            <div className="max-w-4xl mx-auto w-full">
              <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star size={16} className="text-yellow-300" />
                <span className="text-sm font-medium">Trusted by 10,000+ Indian Job Seekers</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Land Your Dream Job in India
                <span className="block text-blue-200 text-xl md:text-2xl lg:text-3xl mt-2">
                  With ATS-Friendly Resumes & Curated Job Portal
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-200 mb-6 md:mb-8 max-w-3xl mx-auto">
                Built specifically for Indian job market. Create professional resumes that pass through ATS systems used by Indian companies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
                <Link 
                  to="/builder" 
                  onClick={() => {
                    handleCTAClick('build_resume_hero', 'hero_section');
                    handleNavigation('homepage', 'builder', 'hero_cta');
                    handleSignupIntent('free_resume_builder');
                  }}
                  className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto max-w-sm active:scale-95"
                >
                  <FileText size={20} />
                  Build Free ATS Resume
                </Link>
                
                <Link 
                  to="/edit" 
                  onClick={() => {
                    handleCTAClick('edit_resume_hero', 'hero_section');
                    handleNavigation('homepage', 'edit', 'hero_cta');
                    trackEvent({
                      eventName: 'edit_resume_clicked',
                      eventCategory: 'Navigation',
                      eventLabel: 'from_hero',
                      pagePath: '/',
                      pageTitle: 'CareerCraft Home Page',
                      metadata: {
                        source: 'hero_section',
                        user_type: localStorage.getItem('has_visited_before') ? 'returning' : 'new'
                      }
                    });
                  }}
                  className="bg-blue-500/20 text-white border-2 border-white/30 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto max-w-sm active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Existing Resume
                </Link>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                {[
                  { number: "10K+", label: "Resumes Created", color: "text-green-300" },
                  { number: "6", label: "ATS Templates", color: "text-yellow-300" },
                  { number: "100%", label: "Free Forever", color: "text-pink-300" },
                  { number: "24/7", label: "Instant Download", color: "text-purple-300" }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center cursor-pointer hover:bg-white/15 transition-colors"
                    onClick={() => {
                      trackFirebaseButtonClick(`stat_${index}`, 'hero_stats', '/');
                      trackEvent({
                        eventName: 'stat_clicked',
                        eventCategory: 'Engagement',
                        eventLabel: stat.label.toLowerCase().replace(' ', '_'),
                        pagePath: '/',
                        pageTitle: 'CareerCraft Home Page',
                        metadata: { stat_name: stat.label, stat_value: stat.number }
                      });
                    }}
                  >
                    <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.number}
                    </div>
                    <div className="text-sm text-blue-200">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trust Badges with Firebase tracking */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-blue-500">
                {[
                  { icon: <CheckCircle size={14} />, text: 'No Sign Up Required' },
                  { icon: <Download size={14} />, text: 'Instant PDF Download' },
                  { icon: <Shield size={14} />, text: 'GDPR Compliant' },
                  { icon: <Star size={14} />, text: 'ATS Optimized Templates' }
                ].map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center text-blue-200 text-xs md:text-sm cursor-pointer hover:text-white transition-colors group"
                    onClick={() => {
                      trackFirebaseButtonClick(`trust_badge_${index}`, 'trust_section', '/');
                      trackEvent({
                        eventName: 'trust_badge_clicked',
                        eventCategory: 'Trust Signals',
                        eventLabel: badge.text.toLowerCase().replace(/ /g, '_'),
                        pagePath: '/',
                        pageTitle: 'CareerCraft Home Page',
                        metadata: { badge_text: badge.text }
                      });
                    }}
                  >
                    <span className="mr-1 md:mr-2 group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </span>
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Firebase tracking */}
        <section id="features" className="py-12 md:py-16 bg-white w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Built for Indian Job Market Success
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to stand out in competitive Indian job market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
              {[
                {
                  icon: (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ),
                  title: 'ATS Optimized Templates',
                  description: 'Templates designed to pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, Wipro',
                  features: ['Keyword optimization', 'Clean formatting', 'Indian industry standards'],
                  bgColor: 'border-blue-200 hover:border-blue-300',
                  featureId: 'ats_templates'
                },
                {
                  icon: (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                  ),
                  title: 'Indian Job Portal',
                  description: 'Curated job opportunities from top Indian companies, startups, and MNCs across all sectors',
                  features: ['IT/Software jobs', 'Engineering roles', 'Marketing positions', 'Finance careers'],
                  bgColor: 'border-green-200 hover:border-green-300',
                  featureId: 'job_portal'
                },
                {
                  icon: (
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  ),
                  title: 'Fresher Friendly',
                  description: 'Special resources and templates designed for fresh graduates and entry-level job seekers',
                  features: ['Internship guidance', 'Campus placement tips', 'First job resume templates'],
                  bgColor: 'border-purple-200 hover:border-purple-300',
                  featureId: 'fresher_friendly'
                },
                {
                  icon: (
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  ),
                  title: 'Instant PDF Download',
                  description: 'Get professional resumes in PDF format immediately, no waiting, no watermarks',
                  features: ['No registration required', 'Mobile-friendly PDFs', 'Share via WhatsApp/Email'],
                  bgColor: 'border-yellow-200 hover:border-yellow-300',
                  featureId: 'instant_download'
                },
                {
                  icon: (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-red-600" />
                    </div>
                  ),
                  title: 'Industry Specific',
                  description: 'Templates tailored for different Indian industries and job roles',
                  features: ['IT/Software Development', 'Mechanical Engineering', 'Civil Engineering', 'Data Science'],
                  bgColor: 'border-red-200 hover:border-red-300',
                  featureId: 'industry_specific'
                },
                {
                  icon: (
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                  ),
                  title: 'Career Resources',
                  description: 'Free guides and resources for Indian job market success',
                  features: ['Interview preparation', 'Salary negotiation tips', 'Company research guides'],
                  bgColor: 'border-indigo-200 hover:border-indigo-300',
                  featureId: 'career_resources'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`text-left p-6 hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border-2 ${feature.bgColor} group`}
                  onClick={() => {
                    handleFeatureClick(feature.featureId);
                    trackEvent({
                      eventName: 'feature_card_clicked',
                      eventCategory: 'Features',
                      eventLabel: feature.featureId,
                      pagePath: '/',
                      pageTitle: 'CareerCraft Home Page',
                      metadata: {
                        feature_name: feature.title,
                        feature_index: index,
                        page_section: 'features',
                        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                      }
                    });
                  }}
                >
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Template Showcase */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Choose From 6+ Professional Templates
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Each template is designed for specific Indian job sectors and optimized for ATS systems
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'ATS Optimized', color: 'bg-gray-800', desc: 'Maximum ATS compatibility' },
                  { name: 'Professional', color: 'bg-blue-600', desc: 'Corporate formal' },
                  { name: 'Creative', color: 'bg-purple-600', desc: 'Design & Marketing' },
                  { name: 'Tech', color: 'bg-gray-700', desc: 'IT & Development' },
                  { name: 'Executive', color: 'bg-indigo-800', desc: 'Senior roles' },
                  { name: 'Two Column', color: 'bg-teal-600', desc: 'Modern layout' }
                ].map((template, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      trackFirebaseButtonClick(`template_preview_${template.name.toLowerCase()}`, 'template_showcase', '/');
                      trackEvent({
                        eventName: 'template_preview_clicked',
                        eventCategory: 'Templates',
                        eventLabel: template.name.toLowerCase(),
                        pagePath: '/',
                        pageTitle: 'CareerCraft Home Page',
                        metadata: { template_name: template.name, template_type: template.desc }
                      });
                    }}
                  >
                    <div className={`${template.color} h-32 rounded-lg mb-3 flex items-center justify-center group-hover:opacity-90 transition-opacity`}>
                      <span className="text-white font-bold">Preview</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  to="/builder"
                  onClick={() => {
                    handleCTAClick('view_all_templates', 'template_showcase');
                    trackFirebaseFunnelStep('user_onboarding', 'template_exploration', 2, {
                      source: 'template_showcase',
                      action: 'view_all_templates'
                    });
                  }}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  View all templates
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Success Stories from India
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                See how CareerCraft helped Indian job seekers land their dream roles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: 'Rajesh Kumar',
                  role: 'Software Engineer at Infosys',
                  testimonial: 'The ATS template helped me get through Infosys initial screening. Got the job in 2 weeks!',
                  avatar: 'RK'
                },
                {
                  name: 'Priya Sharma',
                  role: 'Marketing Manager at Zomato',
                  testimonial: 'Creative template stood out in my application. Recruiter specifically mentioned the design.',
                  avatar: 'PS'
                },
                {
                  name: 'Amit Patel',
                  role: 'Mechanical Engineer at Tata Motors',
                  testimonial: 'Industry-specific template was perfect. Landed 3 interviews in first week of applying.',
                  avatar: 'AP'
                }
              ].map((testimonial, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    trackFirebaseButtonClick(`testimonial_${idx}`, 'testimonials_section', '/');
                    trackEvent({
                      eventName: 'testimonial_viewed',
                      eventCategory: 'Social Proof',
                      eventLabel: 'testimonial_clicked',
                      pagePath: '/',
                      pageTitle: 'CareerCraft Home Page',
                      metadata: { testimonial_index: idx, testimonial_name: testimonial.name }
                    });
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA with Firebase tracking */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 md:py-20 text-white w-full">
          <div className="container mx-auto px-4 text-center w-full max-w-7xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Ready to Start Your Career Journey in India?
            </h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-blue-100 max-w-2xl mx-auto">
              Join thousands of Indian professionals who found success with CareerCraft.in
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
              <Link 
                to="/builder" 
                onClick={() => {
                  handleCTAClick('final_build_resume', 'final_cta');
                  handleNavigation('homepage', 'builder', 'final_cta');
                  handleSignupIntent('final_cta');
                  trackFirebaseFunnelStep('user_onboarding', 'final_cta_clicked', 4, {
                    cta_type: 'primary',
                    location: 'final_section',
                    user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                  });
                }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
              >
                <Zap size={20} />
                Start Building Now - 100% Free
                <ArrowRight size={20} />
              </Link>
              
              <Link 
                to="/job-applications" 
                onClick={() => {
                  handleCTAClick('find_jobs', 'final_cta');
                  handleNavigation('homepage', 'job-applications', 'final_cta');
                  trackFirebaseFunnelStep('user_onboarding', 'jobs_exploration', 4, {
                    cta_type: 'secondary',
                    location: 'final_section',
                    user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                  });
                }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
              >
                <Briefcase size={20} className="inline mr-2" />
                Browse Indian Job Openings
              </Link>
            </div>

            {/* Additional Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Link 
                to="/fresh-graduate-guide"
                onClick={() => trackFirebaseButtonClick('fresher_guide', 'final_links', '/')}
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Fresher's Guide
              </Link>
              <Link 
                to="/job-disciplines"
                onClick={() => trackFirebaseButtonClick('job_disciplines', 'final_links', '/')}
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Job Disciplines
              </Link>
              <Link 
                to="/blog"
                onClick={() => trackFirebaseButtonClick('career_blog', 'final_links', '/')}
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Career Blog
              </Link>
              <Link 
                to="/about"
                onClick={() => trackFirebaseButtonClick('about_us', 'final_links', '/')}
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                About Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;