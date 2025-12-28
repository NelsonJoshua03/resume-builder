// src/components/SEOOptimizedResumeBuilder.tsx - FIXED VERSION
import { useLocation } from 'react-router-dom';
import ResumeBuilder from './ResumeBuilder';
import { Helmet } from 'react-helmet-async';

const SEOOptimizedResumeBuilder = () => {
  const location = useLocation();
  const path = location.pathname; // Define path variable at the top
  
  const getSEOData = () => {
    if (path.includes('free-resume-builder')) {
      return {
        title: "Free Resume Builder Online - Create ATS-Friendly CV in Minutes | CareerCraft",
        description: "Build your professional resume for free with our online resume builder. ATS-friendly templates, instant download, and no sign-up required. Create your perfect CV in minutes.",
        keywords: "free resume builder, online resume builder free, resume maker online, CV creator free, ATS resume builder, resume template free download, create resume online no sign up, best free resume builder, resume builder for freshers, professional resume builder free, Indian resume builder, resume builder 2024, download resume template, easy resume builder, resume builder with templates, modern resume builder, simple resume builder, resume builder for students, resume builder for job seekers, resume format download, online CV maker free, make resume online free, resume builder app, resume writing online, career builder resume",
        canonical: "https://careercraft.in/free-resume-builder"
      };
    }
    
    if (path.includes('ats-resume-builder')) {
      return {
        title: "ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft",
        description: "Create ATS-optimized resumes that pass through automated screening systems. Templates designed for Indian companies like TCS, Infosys, Wipro & Amazon.",
        keywords: "ATS resume builder, ATS friendly resume, applicant tracking system resume, resume scanner friendly, ATS optimization, ATS resume format, ATS compliant resume, ATS resume template, ATS resume checker, ATS resume tips, ATS resume keywords, ATS resume 2024, resume for ATS software, ATS resume test, ATS resume examples, resume parsing software, ATS resume India, Indian company ATS, TCS ATS resume, Infosys resume format, Wipro resume template, Amazon ATS resume, ATS resume builder free, ATS resume online, ATS resume maker, ATS resume download, ATS resume guide, best ATS resume builder",
        canonical: "https://careercraft.in/ats-resume-builder"
      };
    }
    
    if (path.includes('online-resume-maker')) {
      return {
        title: "Online Resume Maker - Create Professional CV with Free Templates | CareerCraft",
        description: "Make a professional resume online with our easy-to-use resume maker. Download in PDF format instantly. Perfect for Indian job market.",
        keywords: "online resume maker, make resume online, online CV maker, create resume online, online resume creator, online resume builder free, online resume maker free, online resume generator, online resume editor, online resume writing, online resume download, online resume PDF, online resume templates, online resume format, online resume India, online resume for freshers, online resume for job, online resume maker app, best online resume maker, free online resume maker, professional online resume maker, online resume maker with templates, online resume maker 2024, online resume maker download, online resume maker no signup, online resume maker easy",
        canonical: "https://careercraft.in/online-resume-maker"
      };
    }
    
    if (path.includes('cv-maker-online')) {
      return {
        title: "CV Maker Online - Create Professional Curriculum Vitae for Free | CareerCraft",
        description: "Create a professional CV online with our free CV maker. Download instantly in PDF format. Perfect for job applications in India.",
        keywords: "CV maker online, online CV maker, CV creator online, make CV online, create CV online, CV builder online, CV generator online, professional CV maker, free CV maker, CV maker free, CV template online, CV format online, CV download, CV PDF, CV for job, CV for freshers, Indian CV format, CV maker India, best CV maker, CV maker app, CV maker 2024, modern CV maker, simple CV maker, academic CV maker, job CV maker, CV maker with photo, CV maker for students, CV maker for job application, CV maker no registration",
        canonical: "https://careercraft.in/cv-maker-online"
      };
    }
    
    if (path.includes('professional-resume-builder')) {
      return {
        title: "Professional Resume Builder - Create Executive Level CV | CareerCraft",
        description: "Build executive-level professional resumes with our advanced resume builder. Perfect for senior roles and corporate positions in India.",
        keywords: "professional resume builder, executive resume builder, corporate resume builder, senior level resume builder, management resume builder, professional CV builder, executive CV maker, professional resume template, executive resume template, corporate resume format, senior management resume, director level resume, VP resume, CEO resume, professional resume writing, executive resume writing, professional resume services, executive resume services, resume for experienced professionals, resume for managers, resume for senior executives, professional resume India, executive resume India, corporate resume India, professional resume 2024, executive resume 2024, best professional resume builder, premium resume builder",
        canonical: "https://careercraft.in/professional-resume-builder"
      };
    }
    
    if (path.includes('resume-builder-for-freshers')) {
      return {
        title: "Resume Builder for Freshers - Create First Job Resume | CareerCraft",
        description: "Create the perfect resume for freshers and entry-level positions. Templates designed for first-time job seekers in India.",
        keywords: "resume builder for freshers, fresher resume builder, entry level resume builder, first job resume builder, resume for freshers, fresher resume format, fresher resume template, fresher CV format, fresher CV template, resume for college students, resume for graduates, resume for first job, resume with no experience, beginner resume, student resume builder, campus placement resume, fresher resume India, fresher resume 2024, fresher resume download, fresher resume examples, fresher resume tips, fresher resume writing, fresher resume samples, resume for engineering freshers, resume for B.Tech freshers, resume for MBA freshers, resume for diploma freshers, best resume for freshers, free fresher resume builder",
        canonical: "https://careercraft.in/resume-builder-for-freshers"
      };
    }
    
    if (path.includes('resume-builder-for-engineers')) {
      return {
        title: "Resume Builder for Engineers - Technical Resume Templates | CareerCraft",
        description: "Create engineering resumes with technical templates. Perfect for mechanical, civil, electrical engineers in India.",
        keywords: "resume builder for engineers, engineering resume builder, technical resume builder, mechanical engineer resume, civil engineer resume, electrical engineer resume, engineer resume template, engineer CV format, engineering resume format, technical resume format, resume for mechanical engineers, resume for civil engineers, resume for electrical engineers, resume for software engineers, engineer resume India, engineering resume 2024, technical resume tips, engineering CV builder, engineer resume examples, engineer resume samples, project engineer resume, design engineer resume, site engineer resume, maintenance engineer resume, production engineer resume, quality engineer resume, engineering graduate resume, experienced engineer resume, best engineer resume builder, free engineer resume builder",
        canonical: "https://careercraft.in/resume-builder-for-engineers"
      };
    }
    
    if (path.includes('resume-builder-for-it-jobs')) {
      return {
        title: "Resume Builder for IT Jobs - Tech Resume Templates | CareerCraft",
        description: "Create IT professional resumes with tech-focused templates. Perfect for software developers, data scientists, and IT professionals.",
        keywords: "resume builder for IT jobs, IT resume builder, tech resume builder, software developer resume, IT professional resume, tech resume template, IT resume format, resume for IT jobs, resume for software jobs, resume for tech jobs, IT resume India, tech resume 2024, IT professional CV, software engineer resume, web developer resume, mobile developer resume, full stack developer resume, frontend developer resume, backend developer resume, IT support resume, network engineer resume, system administrator resume, database administrator resume, cloud engineer resume, DevOps resume, cybersecurity resume, IT manager resume, best IT resume builder, free IT resume builder, IT resume examples, IT resume samples",
        canonical: "https://careercraft.in/resume-builder-for-it-jobs"
      };
    }
    
    if (path.includes('resume-builder-for-developers')) {
      return {
        title: "Resume Builder for Developers - Software Engineer CV | CareerCraft",
        description: "Create developer resumes with code-friendly templates. Perfect for software engineers, web developers, and programmers.",
        keywords: "resume builder for developers, developer resume builder, software engineer resume builder, programmer resume builder, coder resume builder, web developer resume builder, developer resume template, software engineer resume format, programmer resume format, coding resume, developer resume examples, software engineer resume examples, web developer resume examples, frontend developer resume, backend developer resume, full stack developer resume, mobile app developer resume, game developer resume, Python developer resume, Java developer resume, JavaScript developer resume, C++ developer resume, PHP developer resume, .NET developer resume, React developer resume, Angular developer resume, Node.js developer resume, developer resume India, developer resume 2024, best developer resume builder, free developer resume builder, GitHub resume, coding portfolio resume",
        canonical: "https://careercraft.in/resume-builder-for-developers"
      };
    }
    
    if (path.includes('create-resume-online')) {
      return {
        title: "Create Resume Online - Instant Resume Maker | CareerCraft",
        description: "Create your resume online instantly with our easy-to-use resume maker. No signup required, download in PDF immediately.",
        keywords: "create resume online, instant resume maker, quick resume builder, make resume now, online resume creator, build resume online, generate resume online, resume maker online free, create CV online, make CV now, quick CV maker, instant CV creator, resume builder no signup, resume maker no registration, resume builder instant download, resume builder fast, resume builder easy, resume builder simple, resume builder for beginners, resume builder step by step, resume builder guide, resume builder tutorial, resume builder help, resume builder tips, resume builder tools, resume builder software, resume builder app, resume builder website, best resume builder online, free online resume creator, resume maker 2024, create professional resume online, resume writing online free",
        canonical: "https://careercraft.in/create-resume-online"
      };
    }
    
    // Default (main resume builder page)
    return {
      title: "Resume Builder - Create Professional ATS-Friendly CV | CareerCraft India",
      description: "Build professional resumes with our free online resume builder. ATS-friendly templates, instant PDF download, no signup required. Perfect for Indian job market.",
      keywords: "resume builder, CV maker, ATS resume, professional resume builder, online resume maker, free resume builder, resume template, CV template, resume format, CV format, resume download, resume PDF, resume for job, resume for freshers, resume for experienced, resume writing, resume tips, resume examples, resume samples, resume guide, resume help, resume tools, resume software, resume app, resume website, best resume builder, Indian resume builder, resume builder India, resume builder 2024, career builder, job resume, employment resume, interview resume, application resume",
      canonical: "https://careercraft.in/free-resume-builder"
    };
  };
  
  const seoData = getSEOData();
  
  // Get breadcrumb data for structured data
  const getBreadcrumbData = () => {
    const pathSegments = path.split('/').filter(Boolean);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://careercraft.in/"
      }
    ];

    if (pathSegments.length > 0) {
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": 2,
        "name": seoData.title.split(' - ')[0],
        "item": `https://careercraft.in/${pathSegments[0]}`
      });
    }

    return breadcrumbItems;
  };

  // Get FAQ structured data based on page
  const getFAQData = () => {
    interface FAQItem {
      "@type": string;
      name: string;
      acceptedAnswer: {
        "@type": string;
        text: string;
      };
    }
    
    const commonFAQs: FAQItem[] = [
      {
        "@type": "Question",
        "name": "Is this resume builder really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CareerCraft Resume Builder is 100% free with no hidden charges. You can create, edit, and download unlimited resumes without any payment."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to sign up or create an account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration required! Start building your resume immediately without any signup. Your data stays in your browser."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download my resume in PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! One-click instant PDF download. Your resume will be professionally formatted and ready to print or email."
        }
      }
    ];
    
    let pageSpecificFAQs: FAQItem[] = [];
    
    if (path.includes('ats-resume-builder')) {
      pageSpecificFAQs = [
        {
          "@type": "Question",
          "name": "Are your templates ATS-friendly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, all templates are optimized for Applicant Tracking Systems used by top Indian companies like TCS, Infosys, Wipro, Amazon, and Flipkart."
          }
        },
        {
          "@type": "Question",
          "name": "What makes a resume ATS-friendly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ATS-friendly resumes use simple formatting, standard fonts, proper headings, and relevant keywords that ATS software can easily parse and understand."
          }
        }
      ];
    } else if (path.includes('resume-builder-for-freshers')) {
      pageSpecificFAQs = [
        {
          "@type": "Question",
          "name": "How do I write a resume with no experience?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Focus on education, projects, internships, skills, and achievements. Use our fresher-specific templates that highlight your potential."
          }
        },
        {
          "@type": "Question",
          "name": "What should freshers include in their resume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Include education details, academic projects, internships, technical skills, soft skills, certifications, achievements, and objective statement."
          }
        }
      ];
    } else if (path.includes('resume-builder-for-engineers')) {
      pageSpecificFAQs = [
        {
          "@type": "Question",
          "name": "What's different in an engineering resume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Engineering resumes emphasize technical skills, projects, tools used, certifications, and problem-solving abilities specific to your engineering discipline."
          }
        }
      ];
    } else if (path.includes('resume-builder-for-developers')) {
      pageSpecificFAQs = [
        {
          "@type": "Question",
          "name": "Should developers include GitHub links?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Include GitHub, portfolio links, and live projects. Our developer templates have dedicated sections for coding profiles."
          }
        }
      ];
    }
    
    return [...commonFAQs, ...pageSpecificFAQs];
  };

  const faqData = getFAQData();
  const breadcrumbData = getBreadcrumbData();

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoData.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://careercraft.in${path}`} />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="CareerCraft.in" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        {/* Article structured data for blog-like content */}
        {path.includes('ats-resume-builder') && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "Complete Guide to ATS Resume Optimization for Indian Job Market",
              "description": seoData.description,
              "image": "https://careercraft.in/og/resume-builder-preview.jpg",
              "author": {
                "@type": "Organization",
                "name": "CareerCraft India",
                "url": "https://careercraft.in/"
              },
              "publisher": {
                "@type": "Organization",
                "name": "CareerCraft",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://careercraft.in/logo.png"
                }
              },
              "datePublished": "2024-01-01",
              "dateModified": "2024-01-01",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": seoData.canonical
              },
              "keywords": "ATS, resume optimization, Indian job market, resume tips",
              "articleSection": "Career Advice",
              "inLanguage": "en-IN"
            })}
          </script>
        )}
        
        {/* WebApplication structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": seoData.title.split(' - ')[0],
            "url": `https://careercraft.in${path}`,
            "description": seoData.description,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "ATS-friendly templates",
              "Instant PDF download",
              "No signup required",
              "Mobile responsive",
              "Free forever",
              "8+ professional templates",
              "Indian job market optimized",
              "Real-time preview",
              "One-click formatting",
              "Unlimited downloads"
            ],
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "termsOfService": "https://careercraft.in/terms",
            "softwareVersion": "2.0.0"
          })}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbData
          })}
        </script>
        
        {/* FAQ Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData
          })}
        </script>
        
        {/* LocalBusiness schema for Indian users */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "CareerCraft Resume Builder",
            "image": "https://careercraft.in/og/resume-builder-preview.jpg",
            "@id": seoData.canonical,
            "url": seoData.canonical,
            "telephone": "",
            "priceRange": "Free",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
              "addressRegion": "India"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 20.5937,
              "longitude": 78.9629
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "00:00",
              "closes": "23:59"
            },
            "sameAs": [
              "https://www.linkedin.com/in/career-coach-expert-2a47a0399",
              "https://www.instagram.com/career_craft_india/"
            ]
          })}
        </script>
      </Helmet>
      
      {/* Hidden semantic content for SEO (not visible to users) */}
      <div style={{display: 'none'}}>
        <h1>{seoData.title.split(' - ')[0]}</h1>
        <h2>CareerCraft - India's Leading Free Resume Builder</h2>
        <p>Create professional resumes for Indian job market. Best resume builder for freshers, engineers, developers, and IT professionals.</p>
        <p>Free ATS-friendly resume templates. No signup required. Instant PDF download.</p>
        <ul>
          <li>Free Resume Builder</li>
          <li>ATS Resume Builder</li>
          <li>Online Resume Maker</li>
          <li>CV Maker Online</li>
          <li>Professional Resume Builder</li>
          <li>Resume Builder for Freshers</li>
          <li>Resume Builder for Engineers</li>
          <li>Resume Builder for IT Jobs</li>
          <li>Resume Builder for Developers</li>
        </ul>
        <p>CareerCraft helps job seekers in India create winning resumes for companies like TCS, Infosys, Wipro, Amazon, Flipkart, and more.</p>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default SEOOptimizedResumeBuilder;