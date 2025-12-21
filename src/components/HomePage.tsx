// src/components/HomePage.tsx - FULLY OPTIMIZED SEO VERSION
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import SEO from './SEO';

// Structured Data Component
const StructuredData = ({ data }: { data: any }) => (
  <script type="application/ld+json">
    {JSON.stringify(data)}
  </script>
);

// Generate comprehensive structured data for Home Page
const generateHomePageStructuredData = () => {
  const baseUrl = 'https://careercraft.in';
  const currentDate = new Date().toISOString();
  
  return [
    // Organization Schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "CareerCraft India",
      "alternateName": "CareerCraft",
      "url": baseUrl,
      "logo": `${baseUrl}/logos/careercraft-logo-square.png`,
      "description": "India's premier career platform offering free ATS-optimized resume builder and job portal services for Indian job seekers",
      "foundingDate": "2024",
      "founders": [
        {
          "@type": "Person",
          "name": "CareerCraft Team"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
        "addressRegion": "India"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "contact@careercraft.in",
        "availableLanguage": ["English", "Hindi"]
      },
      "sameAs": [
        "https://www.linkedin.com/in/career-coach-expert-2a47a0399",
        "https://www.instagram.com/career_craft_india/",
        "https://www.facebook.com/people/CareerCraft-India",
        "https://twitter.com/CareerCraftIN"
      ],
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "10"
      },
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      "knowsAbout": [
        "Resume Writing India",
        "ATS Optimization",
        "Indian Job Market",
        "Career Counseling India",
        "Interview Preparation India"
      ],
      "makesOffer": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ATS Resume Builder",
            "description": "Free online resume builder optimized for Indian Applicant Tracking Systems"
          },
          "price": "0",
          "priceCurrency": "INR"
        }
      ]
    },
    // WebSite Schema
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "CareerCraft India - Resume Builder & Job Portal",
      "description": "Free ATS-optimized resume builder and job portal for Indian job seekers",
      "publisher": {
        "@id": `${baseUrl}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "en-IN",
      "datePublished": "2024-01-01T00:00:00+05:30",
      "dateModified": currentDate
    },
    // WebPage Schema
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${baseUrl}/#webpage`,
      "url": baseUrl,
      "name": "CareerCraft.in - Free ATS Resume Builder & Job Portal | India's #1 Career Platform",
      "description": "Create ATS-optimized resumes for Indian job market + Find 50,000+ jobs. 100% Free • No Signup • Instant Download • Trusted by Indian Job Seekers",
      "isPartOf": {
        "@id": `${baseUrl}/#website`
      },
      "about": {
        "@id": `${baseUrl}/#organization`
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          }
        ]
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${baseUrl}/og/homepage-preview.jpg`,
        "width": "1200",
        "height": "630"
      },
      "datePublished": "2024-01-01T00:00:00+05:30",
      "dateModified": currentDate,
      "inLanguage": "en-IN",
      "potentialAction": [
        {
          "@type": "ReadAction",
          "target": [baseUrl]
        }
      ]
    },
    // SoftwareApplication Schema for Resume Builder
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CareerCraft Resume Builder",
      "description": "Free online ATS-optimized resume builder for Indian job seekers with professional templates",
      "url": `${baseUrl}/builder`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "permissions": "browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "ATS-optimized templates",
        "6+ professional designs",
        "Instant PDF download",
        "No signup required",
        "Mobile-friendly interface",
        "Color customization",
        "Section reordering",
        "File upload support"
      ],
      "screenshot": `${baseUrl}/screenshots/resume-builder-preview.jpg`,
      "softwareVersion": "2.0",
      "releaseNotes": "Enhanced ATS compatibility for Indian job market",
      "countriesSupported": "IN",
      "areaServed": "IN",
      "countryOfOrigin": "India",
      "creator": {
        "@type": "Organization",
        "name": "CareerCraft India",
        "url": baseUrl
      },
      "statistics": {
        "@type": "QuantitativeValue",
        "value": "50000",
        "unitText": "Resumes Created"
      }
    },
    // Service Schema for Job Portal
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "CareerCraft Job Portal",
      "description": "Curated job portal for Indian job market with opportunities across IT, Engineering, Marketing and more",
      "provider": {
        "@id": `${baseUrl}/#organization`
      },
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Job Categories",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "IT & Software Jobs"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Engineering Jobs"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Marketing Jobs"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Finance Jobs"
            }
          }
        ]
      }
    },
    // FAQ Schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is CareerCraft really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, 100% free forever. No hidden charges, no premium features, no watermarks. We believe career tools should be accessible to everyone."
          }
        },
        {
          "@type": "Question",
          "name": "Are the resumes ATS-friendly for Indian companies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Our templates are specifically designed to pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, Wipro, Accenture, and HCL."
          }
        },
        {
          "@type": "Question",
          "name": "How many job listings do you have?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We aggregate 50,000+ job opportunities from top Indian companies across IT, Engineering, Marketing, Finance, and other sectors. New jobs are added daily."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to create an account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No account required! Build, customize, and download your resume instantly without any registration. Your privacy is our priority."
          }
        },
        {
          "@type": "Question",
          "name": "Which Indian cities do you cover for jobs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We cover all major Indian cities including Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune, Kolkata, Gurgaon, and Noida with location-specific job opportunities."
          }
        },
        {
          "@type": "Question",
          "name": "Can freshers use CareerCraft?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We have special templates and resources for fresh graduates, including internship opportunities, campus placement guides, and entry-level job listings."
          }
        }
      ]
    },
    // LocalBusiness Schema
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      "name": "CareerCraft India",
      "description": "India's free ATS-friendly resume builder and job portal",
      "url": baseUrl,
      "telephone": "+91-XXXXXXXXXX",
      "email": "contact@careercraft.in",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "CareerCraft Office",
        "addressLocality": "Bangalore",
        "addressRegion": "Karnataka",
        "postalCode": "560001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.9716",
        "longitude": "77.5946"
      },
      "openingHours": "Mo-Su 00:00-23:59",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      ],
      "priceRange": "₹₹₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Free",
      "areaServed": {
        "@type": "Country",
        "name": "India"
      }
    },
    // HowTo Schema for Resume Building
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Create an ATS-Friendly Resume for Indian Job Market",
      "description": "Step-by-step guide to build professional resume that gets noticed by Indian recruiters",
      "totalTime": "PT5M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": "0"
      },
      "step": [
        {
          "@type": "HowToStep",
          "position": "1",
          "name": "Enter Your Details",
          "text": "Fill in your personal information, contact details, and professional summary",
          "image": `${baseUrl}/screenshots/step1-personal-info.jpg`
        },
        {
          "@type": "HowToStep",
          "position": "2",
          "name": "Add Work Experience",
          "text": "List your previous roles, responsibilities, and achievements with quantifiable results",
          "image": `${baseUrl}/screenshots/step2-experience.jpg`
        },
        {
          "@type": "HowToStep",
          "position": "3",
          "name": "Include Education",
          "text": "Add your educational qualifications, university details, and year of passing",
          "image": `${baseUrl}/screenshots/step3-education.jpg`
        },
        {
          "@type": "HowToStep",
          "position": "4",
          "name": "Select Relevant Skills",
          "text": "Choose skills that match your target job role from our extensive database",
          "image": `${baseUrl}/screenshots/step4-skills.jpg`
        },
        {
          "@type": "HowToStep",
          "position": "5",
          "name": "Choose ATS Template",
          "text": "Select from 6+ ATS-optimized templates designed for Indian companies",
          "image": `${baseUrl}/screenshots/step5-templates.jpg`
        },
        {
          "@type": "HowToStep",
          "position": "6",
          "name": "Customize & Download",
          "text": "Adjust colors, reorder sections, and download your professional resume instantly",
          "image": `${baseUrl}/screenshots/step6-download.jpg`
        }
      ]
    },
    // Breadcrumb Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        }
      ]
    },
    // ItemList Schema for Features
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "CareerCraft Features",
      "description": "Key features of CareerCraft resume builder and job portal",
      "numberOfItems": 6,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Product",
            "name": "ATS Optimized Templates",
            "description": "Templates designed to pass through Applicant Tracking Systems"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Product",
            "name": "Indian Job Portal",
            "description": "Curated job opportunities from top Indian companies"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Product",
            "name": "Fresher Friendly",
            "description": "Special resources for fresh graduates and entry-level job seekers"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": {
            "@type": "Product",
            "name": "Instant PDF Download",
            "description": "Get professional resumes in PDF format immediately"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": {
            "@type": "Product",
            "name": "Industry Specific Templates",
            "description": "Templates tailored for different Indian industries and job roles"
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "item": {
            "@type": "Product",
            "name": "Career Resources",
            "description": "Free guides and resources for Indian job market success"
          }
        }
      ]
    }
  ];
};

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

  // Generate structured data
  const structuredData = generateHomePageStructuredData();

  // Track page view on mount - DUAL TRACKING
  useEffect(() => {
    // Google Analytics
    trackPageView('CareerCraft Home Page - Free Resume Builder & Job Portal India', '/');
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
        user_agent: navigator.userAgent.substring(0, 100),
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      }
    });
    
    // Track funnel entry
    trackFirebaseFunnelStep('user_onboarding', 'homepage_visit', 1, {
      entry_point: 'homepage',
      referrer: document.referrer || 'direct',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
      landing_time: new Date().toISOString()
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
        first_visit: !hasVisitedBefore,
        session_start: new Date().toISOString()
      }
    });

    // Set visited flag
    if (!hasVisitedBefore) {
      localStorage.setItem('has_visited_before', 'true');
      localStorage.setItem('first_visit_date', new Date().toISOString());
      
      // Track first visit
      trackEvent({
        eventName: 'first_visit',
        eventCategory: 'User Acquisition',
        eventLabel: 'new_user_homepage',
        pagePath: '/',
        pageTitle: 'CareerCraft Home Page',
        metadata: {
          acquisition_date: new Date().toISOString(),
          entry_source: document.referrer || 'direct'
        }
      });
    }

    // Track page performance
    const perfData = window.performance?.timing;
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      trackEvent({
        eventName: 'page_performance',
        eventCategory: 'Performance',
        eventLabel: 'homepage_load_time',
        pagePath: '/',
        pageTitle: 'CareerCraft Home Page',
        eventValue: loadTime,
        metadata: {
          load_time_ms: loadTime,
          dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          page_size: document.documentElement.innerHTML.length
        }
      });
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
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        timestamp: new Date().toISOString()
      });
    }

    // Track CTA event
    trackEvent({
      eventName: 'cta_click',
      eventCategory: 'Conversions',
      eventLabel: buttonName,
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: {
        cta_name: buttonName,
        section: section,
        user_type: localStorage.getItem('has_visited_before') ? 'returning' : 'new'
      }
    });
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
        timestamp: new Date().toISOString(),
        engagement_time: new Date().toISOString()
      }
    });
  };

  const handleNavigation = (from: string, to: string, action: string) => {
    // Google Analytics
    trackUserFlow(from, to, action);
    
    // Firebase Analytics
    trackFirebaseUserFlow(from, to, action);
    
    // Track navigation event
    trackEvent({
      eventName: 'navigation',
      eventCategory: 'User Journey',
      eventLabel: action,
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: {
        from_section: from,
        to_section: to,
        action: action,
        navigation_time: new Date().toISOString()
      }
    });
  };

  const handleSignupIntent = (method: string) => {
    // Firebase Analytics
    trackFirebaseSignup(method, 'homepage_cta');
    trackFirebaseFunnelStep('user_onboarding', 'signup_intent', 3, {
      method: method,
      source: 'homepage',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
      intent_time: new Date().toISOString()
    });
    
    // Track conversion intent
    trackEvent({
      eventName: 'signup_intent',
      eventCategory: 'Conversions',
      eventLabel: method,
      pagePath: '/',
      pageTitle: 'CareerCraft Home Page',
      metadata: {
        signup_method: method,
        intent_source: 'homepage',
        user_engagement: localStorage.getItem('time_on_page') || '0'
      }
    });
  };

  // Track scroll depth
  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      const depthMilestones = [25, 50, 75, 90, 100];
      
      depthMilestones.forEach(depth => {
        const key = `homepage_scroll_depth_${depth}_tracked`;
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
              timestamp: new Date().toISOString(),
              viewport: `${window.innerWidth}x${window.innerHeight}`
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
      localStorage.setItem('time_on_page', timeSpent.toString());
      
      if (timeSpent > 5) {
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
            exit_time: new Date().toISOString(),
            scroll_position: window.scrollY
          }
        });
      }
    };
  }, []);

  return (
    <>
      {/* ENHANCED SEO WITH STRUCTURED DATA */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>CareerCraft.in - Free ATS Resume Builder & Job Portal | India's #1 Career Platform</title>
        <meta 
          name="description" 
          content="Create ATS-optimized resumes for Indian job market + Find 50,000+ jobs. 100% Free • No Signup • Instant Download • Trusted by 50,000+ Indian Job Seekers" 
        />
        <meta 
          name="keywords" 
          content="resume builder India free, ATS resume maker online, job portal India 2025, Indian job search platform, engineering jobs Bangalore, IT jobs Mumbai, fresher jobs Delhi, free resume maker no signup, CV builder download PDF, career platform India, software engineer jobs, mechanical engineer jobs, civil engineer jobs, data science jobs, government jobs India, walk-in interviews, immediate hiring, career resources India" 
        />
        <link rel="canonical" href="https://careercraft.in/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/" />
        <meta property="og:title" content="CareerCraft.in - Free ATS Resume Builder & Job Portal | India's #1 Career Platform" />
        <meta property="og:description" content="Create ATS-optimized resumes for Indian job market + Find 50,000+ jobs. 100% Free • No Signup • Instant Download • Trusted by Indian Job Seekers" />
        <meta property="og:image" content="https://careercraft.in/og/homepage-preview.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CareerCraft India - Resume Builder and Job Portal Interface" />
        <meta property="og:site_name" content="CareerCraft India" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:locale:alternate" content="hi_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CareerCraftIN" />
        <meta name="twitter:creator" content="@CareerCraftIN" />
        <meta name="twitter:title" content="CareerCraft.in - Free Resume Builder & Job Portal India" />
        <meta name="twitter:description" content="Create ATS resumes + Find jobs in India. 100% Free • No Signup Required • Trusted Platform" />
        <meta name="twitter:image" content="https://careercraft.in/twitter/homepage-card.jpg" />
        <meta name="twitter:image:alt" content="CareerCraft Platform Preview - Resume Builder and Job Portal" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Hreflang tags for international SEO */}
        <link rel="alternate" href="https://careercraft.in/" hrefLang="en-in" />
        <link rel="alternate" href="https://careercraft.in/" hrefLang="en" />
        <link rel="alternate" href="https://careercraft.in/" hrefLang="hi" />
        <link rel="alternate" href="https://careercraft.in/" hrefLang="x-default" />
        
        {/* Mobile-specific meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="CareerCraft" />
        <meta name="apple-mobile-web-app-title" content="CareerCraft" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        
        {/* Article meta tags */}
        <meta property="article:published_time" content="2024-01-01T00:00:00+05:30" />
        <meta property="article:modified_time" content={new Date().toISOString()} />
        <meta property="article:author" content="CareerCraft India" />
        <meta property="article:section" content="Career Tools" />
        <meta property="article:tag" content="Resume Builder" />
        <meta property="article:tag" content="Job Portal India" />
        <meta property="article:tag" content="ATS Resume" />
        <meta property="article:tag" content="Indian Job Market" />
        <meta property="article:tag" content="Career Resources" />
        <meta property="article:tag" content="Fresher Jobs" />
        
        {/* Additional Meta Tags */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="12.9716;77.5946" />
        <meta name="ICBM" content="12.9716, 77.5946" />
        <meta name="author" content="CareerCraft India" />
        <meta name="copyright" content="CareerCraft India" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="generator" content="CareerCraft Platform" />
        <meta name="distribution" content="Global" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        
        {/* Verification Tags */}
        <meta name="google-site-verification" content="72ogLK0F0xw0H23swyyhs8idWOcyyv7hr1-zAMZ9v7w" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
      </Helmet>
      
      {/* STRUCTURED DATA JSON-LD */}
      {structuredData.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}
      
      {/* Hidden H1 for SEO Optimization */}
      <h1 className="sr-only">
        CareerCraft India - Free ATS Resume Builder and Job Portal for Indian Job Seekers | Create Professional Resumes | Find Jobs in Bangalore, Mumbai, Delhi, Hyderabad | Fresher to Experienced Opportunities
      </h1>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-12 md:py-24 w-full relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 text-center w-full max-w-7xl relative z-10">
            <div className="max-w-5xl mx-auto w-full">
              <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse">
                <Star size={16} className="text-yellow-300" />
                <span className="text-sm font-medium">Trusted by 50,000+ Indian Job Seekers</span>
              </div>
              
              <div className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                <span className="block text-white">Land Your Dream Job</span>
                <span className="block text-blue-200 text-2xl md:text-3xl lg:text-4xl mt-2">
                  In India's Competitive Market
                </span>
              </div>
              
              <p className="text-xl md:text-2xl text-blue-200 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
                Built specifically for the <strong className="text-white">Indian job market</strong>. Create professional resumes that pass through <strong className="text-white">ATS systems</strong> used by Indian companies like TCS, Infosys, Wipro & Accenture.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
                <Link 
                  to="/builder" 
                  onClick={() => {
                    handleCTAClick('build_resume_hero', 'hero_section');
                    handleNavigation('homepage', 'builder', 'hero_cta');
                    handleSignupIntent('free_resume_builder');
                  }}
                  className="bg-white text-blue-600 px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 w-full sm:w-auto max-w-md active:scale-95"
                >
                  <Rocket size={24} />
                  Build Free ATS Resume Now
                  <ArrowRight size={20} />
                </Link>
                
                <Link 
                  to="/job-applications" 
                  onClick={() => {
                    handleCTAClick('find_jobs_hero', 'hero_section');
                    handleNavigation('homepage', 'job-applications', 'hero_cta');
                    trackEvent({
                      eventName: 'find_jobs_clicked',
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
                  className="bg-blue-500/20 text-white border-2 border-white/30 px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto max-w-md active:scale-95"
                >
                  <Search size={24} />
                  Browse 50,000+ Indian Jobs
                </Link>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
                {[
                  { number: "50K+", label: "Resumes Created", color: "text-green-300", icon: <FileText size={20} /> },
                  { number: "50K+", label: "Job Listings", color: "text-yellow-300", icon: <Briefcase size={20} /> },
                  { number: "100%", label: "Free Forever", color: "text-pink-300", icon: <CheckCircle size={20} /> },
                  { number: "24/7", label: "Available", color: "text-purple-300", icon: <Clock size={20} /> }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
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
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-white/20 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                    <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>
                      {stat.number}
                    </div>
                    <div className="text-sm text-blue-200 group-hover:text-white transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trust Badges with Firebase tracking */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-blue-500">
                {[
                  { icon: <CheckCircle size={16} />, text: 'No Sign Up Required' },
                  { icon: <Download size={16} />, text: 'Instant PDF Download' },
                  { icon: <Shield size={16} />, text: 'GDPR Compliant' },
                  { icon: <Star size={16} />, text: 'ATS Optimized Templates' },
                  { icon: <Globe size={16} />, text: 'All Indian Cities' },
                  { icon: <GraduationCap size={16} />, text: 'Fresher Friendly' }
                ].map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center text-blue-200 text-sm md:text-base cursor-pointer hover:text-white transition-all duration-300 group hover:scale-105"
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
                    <span className="mr-2 group-hover:scale-110 transition-transform">
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
        <section id="features" className="py-16 md:py-24 bg-white w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                Built for Indian Job Market Success
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Everything you need to stand out in competitive Indian job market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full">
              {[
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={28} className="text-blue-600" />
                    </div>
                  ),
                  title: 'ATS Optimized Templates',
                  description: 'Templates designed to pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, Wipro, Accenture',
                  features: ['Keyword optimization', 'Clean ATS-friendly formatting', 'Indian industry standards'],
                  bgColor: 'border-blue-200 hover:border-blue-400',
                  featureId: 'ats_templates',
                  stats: '6+ Templates'
                },
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Briefcase size={28} className="text-green-600" />
                    </div>
                  ),
                  title: 'Indian Job Portal',
                  description: 'Curated job opportunities from top Indian companies, startups, and MNCs across all sectors',
                  features: ['IT/Software jobs', 'Engineering roles', 'Marketing positions', 'Finance careers'],
                  bgColor: 'border-green-200 hover:border-green-400',
                  featureId: 'job_portal',
                  stats: '50,000+ Jobs'
                },
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users size={28} className="text-purple-600" />
                    </div>
                  ),
                  title: 'Fresher Friendly',
                  description: 'Special resources and templates designed for fresh graduates and entry-level job seekers',
                  features: ['Internship guidance', 'Campus placement tips', 'First job resume templates'],
                  bgColor: 'border-purple-200 hover:border-purple-400',
                  featureId: 'fresher_friendly',
                  stats: '10K+ Freshers'
                },
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock size={28} className="text-yellow-600" />
                    </div>
                  ),
                  title: 'Instant PDF Download',
                  description: 'Get professional resumes in PDF format immediately, no waiting, no watermarks',
                  features: ['No registration required', 'Mobile-friendly PDFs', 'Share via WhatsApp/Email'],
                  bgColor: 'border-yellow-200 hover:border-yellow-400',
                  featureId: 'instant_download',
                  stats: 'Instant'
                },
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Award size={28} className="text-red-600" />
                    </div>
                  ),
                  title: 'Industry Specific',
                  description: 'Templates tailored for different Indian industries and job roles',
                  features: ['IT/Software Development', 'Mechanical Engineering', 'Civil Engineering', 'Data Science'],
                  bgColor: 'border-red-200 hover:border-red-400',
                  featureId: 'industry_specific',
                  stats: '15+ Industries'
                },
                {
                  icon: (
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target size={28} className="text-indigo-600" />
                    </div>
                  ),
                  title: 'Career Resources',
                  description: 'Free guides and resources for Indian job market success',
                  features: ['Interview preparation', 'Salary negotiation tips', 'Company research guides'],
                  bgColor: 'border-indigo-200 hover:border-indigo-400',
                  featureId: 'career_resources',
                  stats: '100+ Resources'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`text-left p-8 hover:transform hover:-translate-y-3 transition-all duration-500 cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 ${feature.bgColor} group relative overflow-hidden`}
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
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      {feature.icon}
                      <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mt-4 mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-base text-gray-700">
                          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Template Showcase */}
            <div className="mt-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-10 md:p-14 border border-gray-200 shadow-lg">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Choose From 6+ Professional Templates
                </h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Each template is designed for specific Indian job sectors and optimized for ATS systems used by Indian recruiters
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { name: 'ATS Optimized', color: 'from-gray-800 to-gray-900', desc: 'Maximum ATS compatibility' },
                  { name: 'Professional', color: 'from-blue-600 to-blue-700', desc: 'Corporate formal' },
                  { name: 'Creative', color: 'from-purple-600 to-purple-700', desc: 'Design & Marketing' },
                  { name: 'Tech', color: 'from-gray-700 to-gray-800', desc: 'IT & Development' },
                  { name: 'Executive', color: 'from-indigo-800 to-indigo-900', desc: 'Senior roles' },
                  { name: 'Two Column', color: 'from-teal-600 to-teal-700', desc: 'Modern layout' }
                ].map((template, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-xl p-5 text-center shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
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
                    <div className={`${template.color} h-40 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br`}>
                      <div className="text-white text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <span className="font-bold text-lg">Preview</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-10">
                <Link 
                  to="/builder"
                  onClick={() => {
                    handleCTAClick('view_all_templates', 'template_showcase');
                    trackFirebaseFunnelStep('user_onboarding', 'template_exploration', 2, {
                      source: 'template_showcase',
                      action: 'view_all_templates',
                      user_intent: 'template_browsing'
                    });
                  }}
                  className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800 transition-colors group"
                >
                  View all 6+ templates with preview
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white w-full">
          <div className="container mx-auto px-4 w-full max-w-7xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                Success Stories from India
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                See how CareerCraft helped Indian job seekers land their dream roles in top companies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  name: 'Rajesh Kumar',
                  role: 'Software Engineer at Infosys',
                  testimonial: 'The ATS template helped me get through Infosys initial screening. Got the job in 2 weeks! The Indian job market templates made all the difference.',
                  avatar: 'RK',
                  location: 'Bangalore, Karnataka',
                  time: '2 weeks ago',
                  company: 'Infosys'
                },
                {
                  name: 'Priya Sharma',
                  role: 'Marketing Manager at Zomato',
                  testimonial: 'Creative template stood out in my application. Recruiter specifically mentioned the design. Best part? It was completely free!',
                  avatar: 'PS',
                  location: 'Delhi NCR',
                  time: '1 month ago',
                  company: 'Zomato'
                },
                {
                  name: 'Amit Patel',
                  role: 'Mechanical Engineer at Tata Motors',
                  testimonial: 'Industry-specific template was perfect. Landed 3 interviews in first week of applying. The Indian engineering templates are spot on.',
                  avatar: 'AP',
                  location: 'Pune, Maharashtra',
                  time: '3 weeks ago',
                  company: 'Tata Motors'
                }
              ].map((testimonial, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                  onClick={() => {
                    trackFirebaseButtonClick(`testimonial_${idx}`, 'testimonials_section', '/');
                    trackEvent({
                      eventName: 'testimonial_viewed',
                      eventCategory: 'Social Proof',
                      eventLabel: 'testimonial_clicked',
                      pagePath: '/',
                      pageTitle: 'CareerCraft Home Page',
                      metadata: { 
                        testimonial_index: idx, 
                        testimonial_name: testimonial.name,
                        company: testimonial.company 
                      }
                    });
                  }}
                >
                  <div className="flex items-start mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl mr-5">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-xl">{testimonial.name}</h4>
                      <p className="text-gray-600 font-medium">{testimonial.role}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {testimonial.location}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {testimonial.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed border-l-4 border-blue-500 pl-4">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{testimonial.company}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { number: "4.8/5", label: "User Rating", icon: <Star size={24} /> },
                  { number: "50K+", label: "Active Users", icon: <Users size={24} /> },
                  { number: "95%", label: "Success Rate", icon: <TrendingUp size={24} /> },
                  { number: "24/7", label: "Support", icon: <Phone size={24} /> }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA with Firebase tracking */}
        <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 py-20 md:py-28 text-white w-full relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10.83V8zm0 4L52 0h2L40 14.83V12zm0 4L56 0h2L40 18.83V16zm0 4L60 0h2L40 22.83V20zm0 4L64 0h2L40 26.83V24zm0 4L68 0h2L40 30.83V28zm0 4L72 0h2L40 34.83V32zm0 4L76 0h2L40 38.83V36zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0L80 12v2L54 40h-2zm4 0L80 16v2L58 40h-2zm4 0L80 20v2L62 40h-2zm4 0L80 24v2L66 40h-2zm4 0L80 28v2L70 40h-2zm4 0L80 32v2L74 40h-2zm4 0L80 36v2L78 40h-2zM0 40h40v40H0V40zm40 40h40v40H40V80zm0-40h2l-2 2V40zm0 4l4-4h2l-6 6V44zm0 4l8-8h2L40 50.83V48zm0 4L52 40h2L40 54.83V52zm0 4L56 40h2L40 58.83V56zm0 4L60 40h2L40 62.83V60zm0 4L64 40h2L40 66.83V64zm0 4L68 40h2L40 70.83V68zm0 4L72 40h2L40 74.83V72zm0 4L76 40h2L40 78.83V76zm0 4L80 40v2L42 80h-2zm4 0L80 44v2L46 80h-2zm4 0L80 48v2L50 80h-2zm4 0L80 52v2L54 80h-2zm4 0L80 56v2L58 80h-2zm4 0L80 60v2L62 80h-2zm4 0L80 64v2L66 80h-2zm4 0L80 68v2L70 80h-2zm4 0L80 72v2L74 80h-2zm4 0L80 76v2L78 80h-2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 text-center w-full max-w-7xl relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">
                Ready to Start Your Career Journey in India?
              </h2>
              <p className="text-xl md:text-2xl mb-10 md:mb-12 text-blue-100 leading-relaxed">
                Join <strong className="text-white">50,000+ Indian professionals</strong> who found success with CareerCraft.in
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full mb-10">
                <Link 
                  to="/builder" 
                  onClick={() => {
                    handleCTAClick('final_build_resume', 'final_cta');
                    handleNavigation('homepage', 'builder', 'final_cta');
                    handleSignupIntent('final_cta');
                    trackFirebaseFunnelStep('user_onboarding', 'final_cta_clicked', 4, {
                      cta_type: 'primary',
                      location: 'final_section',
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      conversion_intent: 'resume_builder'
                    });
                  }}
                  className="bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 active:scale-95 w-full sm:w-auto min-w-[300px] group"
                >
                  <Rocket size={24} className="group-hover:animate-pulse" />
                  Start Building Now - 100% Free
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <Link 
                  to="/job-applications" 
                  onClick={() => {
                    handleCTAClick('find_jobs', 'final_cta');
                    handleNavigation('homepage', 'job-applications', 'final_cta');
                    trackFirebaseFunnelStep('user_onboarding', 'jobs_exploration', 4, {
                      cta_type: 'secondary',
                      location: 'final_section',
                      user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
                      conversion_intent: 'job_search'
                    });
                  }}
                  className="border-3 border-white text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 active:scale-95 w-full sm:w-auto min-w-[300px] group"
                >
                  <Search size={24} className="inline mr-3 group-hover:animate-bounce" />
                  Browse 50,000+ Indian Jobs
                </Link>
              </div>

              {/* Additional Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12 pt-8 border-t border-blue-500">
                <Link 
                  to="/fresh-graduate-guide"
                  onClick={() => trackFirebaseButtonClick('fresher_guide', 'final_links', '/')}
                  className="text-blue-200 hover:text-white text-base transition-colors hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <GraduationCap size={18} />
                  Fresher's Guide
                </Link>
                <Link 
                  to="/job-disciplines"
                  onClick={() => trackFirebaseButtonClick('job_disciplines', 'final_links', '/')}
                  className="text-blue-200 hover:text-white text-base transition-colors hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Briefcase size={18} />
                  Job Disciplines
                </Link>
                <Link 
                  to="/blog"
                  onClick={() => trackFirebaseButtonClick('career_blog', 'final_links', '/')}
                  className="text-blue-200 hover:text-white text-base transition-colors hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Career Blog
                </Link>
                <Link 
                  to="/about"
                  onClick={() => trackFirebaseButtonClick('about_us', 'final_links', '/')}
                  className="text-blue-200 hover:text-white text-base transition-colors hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Building size={18} />
                  About Us
                </Link>
              </div>
              
              {/* Trust & Security */}
              <div className="mt-10 flex flex-wrap justify-center gap-6">
                {[
                  { text: 'No Credit Card Required', icon: <Shield size={16} /> },
                  { text: 'Data Privacy Protected', icon: <CheckCircle size={16} /> },
                  { text: 'No Hidden Fees', icon: <Star size={16} /> },
                  { text: 'Instant Access', icon: <Zap size={16} /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-blue-200 text-sm">
                    {item.icon}
                    <span className="ml-2">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;