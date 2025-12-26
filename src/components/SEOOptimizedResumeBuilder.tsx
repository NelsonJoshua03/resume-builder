// src/components/SEOOptimizedResumeBuilder.tsx
import { useLocation } from 'react-router-dom';
import ResumeBuilder from './ResumeBuilder';
import { Helmet } from 'react-helmet-async';

const SEOOptimizedResumeBuilder = () => {
  const location = useLocation();
  
  const getSEOData = () => {
    const path = location.pathname;
    
    if (path.includes('free-resume-builder')) {
      return {
        title: "Free Resume Builder Online - Create ATS-Friendly CV in Minutes | CareerCraft",
        description: "Build your professional resume for free with our online resume builder. ATS-friendly templates, instant download, and no sign-up required. Create your perfect CV in minutes.",
        keywords: "free resume builder, online CV maker, ATS resume template, professional resume download, resume builder no sign up, create resume free, career craft, resume builder India",
        canonical: "https://careercraft.in/free-resume-builder"
      };
    }
    
    if (path.includes('ats-resume-builder')) {
      return {
        title: "ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft",
        description: "Create ATS-optimized resumes that pass through automated screening systems. Templates designed for Indian companies like TCS, Infosys, Wipro & Amazon.",
        keywords: "ATS resume builder, applicant tracking system resume, ATS friendly CV, resume scanner friendly, ATS optimization, Indian companies ATS",
        canonical: "https://careercraft.in/ats-resume-builder"
      };
    }
    
    if (path.includes('online-resume-maker')) {
      return {
        title: "Online Resume Maker - Create Professional CV with Free Templates | CareerCraft",
        description: "Make a professional resume online with our easy-to-use resume maker. Download in PDF format instantly. Perfect for Indian job market.",
        keywords: "online resume maker, create resume online, make CV online, resume creator, CV maker online free, Indian resume maker",
        canonical: "https://careercraft.in/online-resume-maker"
      };
    }
    
    if (path.includes('cv-maker-online')) {
      return {
        title: "CV Maker Online - Create Professional Curriculum Vitae for Free | CareerCraft",
        description: "Create a professional CV online with our free CV maker. Download instantly in PDF format. Perfect for job applications in India.",
        keywords: "CV maker online, create CV online, curriculum vitae maker, professional CV builder, free CV maker India",
        canonical: "https://careercraft.in/cv-maker-online"
      };
    }
    
    if (path.includes('professional-resume-builder')) {
      return {
        title: "Professional Resume Builder - Create Executive Level CV | CareerCraft",
        description: "Build executive-level professional resumes with our advanced resume builder. Perfect for senior roles and corporate positions in India.",
        keywords: "professional resume builder, executive resume builder, corporate resume maker, senior level resume, management resume",
        canonical: "https://careercraft.in/professional-resume-builder"
      };
    }
    
    if (path.includes('resume-builder-for-freshers')) {
      return {
        title: "Resume Builder for Freshers - Create First Job Resume | CareerCraft",
        description: "Create the perfect resume for freshers and entry-level positions. Templates designed for first-time job seekers in India.",
        keywords: "resume builder for freshers, first job resume, entry level resume, fresher CV, college graduate resume",
        canonical: "https://careercraft.in/resume-builder-for-freshers"
      };
    }
    
    if (path.includes('resume-builder-for-engineers')) {
      return {
        title: "Resume Builder for Engineers - Technical Resume Templates | CareerCraft",
        description: "Create engineering resumes with technical templates. Perfect for mechanical, civil, electrical engineers in India.",
        keywords: "resume builder for engineers, engineering resume, technical resume, mechanical engineer resume, civil engineer CV",
        canonical: "https://careercraft.in/resume-builder-for-engineers"
      };
    }
    
    if (path.includes('resume-builder-for-it-jobs')) {
      return {
        title: "Resume Builder for IT Jobs - Tech Resume Templates | CareerCraft",
        description: "Create IT professional resumes with tech-focused templates. Perfect for software developers, data scientists, and IT professionals.",
        keywords: "resume builder for IT jobs, software developer resume, IT professional CV, tech resume, computer science resume",
        canonical: "https://careercraft.in/resume-builder-for-it-jobs"
      };
    }
    
    if (path.includes('resume-builder-for-developers')) {
      return {
        title: "Resume Builder for Developers - Software Engineer CV | CareerCraft",
        description: "Create developer resumes with code-friendly templates. Perfect for software engineers, web developers, and programmers.",
        keywords: "resume builder for developers, software engineer resume, web developer CV, programmer resume, coding resume",
        canonical: "https://careercraft.in/resume-builder-for-developers"
      };
    }
    
    if (path.includes('create-resume-online')) {
      return {
        title: "Create Resume Online - Instant Resume Maker | CareerCraft",
        description: "Create your resume online instantly with our easy-to-use resume maker. No signup required, download in PDF immediately.",
        keywords: "create resume online, instant resume maker, quick resume builder, make resume now, online CV creator",
        canonical: "https://careercraft.in/create-resume-online"
      };
    }
    
    // Default
    return {
      title: "Resume Builder - Create Professional ATS-Friendly CV | CareerCraft",
      description: "Build professional resumes with our free online resume builder. ATS-friendly templates for Indian job seekers.",
      keywords: "resume builder, CV maker, ATS resume, professional resume, career craft",
      canonical: "https://careercraft.in/free-resume-builder"
    };
  };
  
  const seoData = getSEOData();
  
  // Get breadcrumb data for structured data
  const getBreadcrumbData = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
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
        <meta property="og:url" content={`https://careercraft.in${location.pathname}`} />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        <meta property="og:site_name" content="CareerCraft.in" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        {/* Structured Data for Web Application */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": seoData.title.split(' - ')[0],
            "url": `https://careercraft.in${location.pathname}`,
            "description": seoData.description,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250"
            },
            "featureList": [
              "ATS-friendly templates",
              "Instant PDF download",
              "No signup required",
              "Mobile responsive",
              "Free forever",
              "8+ professional templates",
              "Indian job market optimized"
            ],
            "areaServed": {
              "@type": "Country",
              "name": "India"
            }
          })}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": getBreadcrumbData()
          })}
        </script>
        
        {/* FAQ Structured Data for common questions */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is this resume builder really free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, CareerCraft Resume Builder is completely free with no hidden charges. You can create, edit, and download your resume without any payment."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to sign up or create an account?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, you don't need to sign up or create an account. You can start building your resume immediately without any registration."
                }
              },
              {
                "@type": "Question",
                "name": "Are the templates ATS-friendly?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all our templates are optimized for Applicant Tracking Systems (ATS) used by Indian companies like TCS, Infosys, Wipro, and Amazon."
                }
              },
              {
                "@type": "Question",
                "name": "Can I download my resume in PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can download your resume instantly as a PDF file with one click. The PDF is print-ready and professional."
                }
              },
              {
                "@type": "Question",
                "name": "Is this suitable for Indian job market?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! Our templates are specifically designed for the Indian job market with formats preferred by Indian recruiters and companies."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      
      <ResumeBuilder />
    </>
  );
};

export default SEOOptimizedResumeBuilder;