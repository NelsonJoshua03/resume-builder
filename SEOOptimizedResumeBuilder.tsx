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
        keywords: "free resume builder, online CV maker, ATS resume template, professional resume download, resume builder no sign up, create resume free"
      };
    }
    
    if (path.includes('ats-resume-builder')) {
      return {
        title: "ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft",
        description: "Create ATS-optimized resumes that pass through automated screening systems. Templates designed for Indian companies like TCS, Infosys, Wipro & Amazon.",
        keywords: "ATS resume builder, applicant tracking system resume, ATS friendly CV, resume scanner friendly, ATS optimization"
      };
    }
    
    if (path.includes('online-resume-maker')) {
      return {
        title: "Online Resume Maker - Create Professional CV with Free Templates",
        description: "Make a professional resume online with our easy-to-use resume maker. Download in PDF format instantly. Perfect for Indian job market.",
        keywords: "online resume maker, create resume online, make CV online, resume creator, CV maker online free"
      };
    }
    
    // Add more SEO variations for other routes...
    
    return {
      title: "Resume Builder - Create Professional ATS-Friendly CV | CareerCraft",
      description: "Build professional resumes with our free online resume builder. ATS-friendly templates for Indian job seekers.",
      keywords: "resume builder, CV maker, ATS resume, professional resume"
    };
  };
  
  const seoData = getSEOData();
  
  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        
        {/* Canonical URL - Points to main SEO page */}
        <link rel="canonical" href="https://careercraft.in/free-resume-builder" />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://careercraft.in${location.pathname}`} />
        
        {/* Structured Data for Job Posting */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CareerCraft Resume Builder",
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
              "Free forever"
            ]
          })}
        </script>
      </Helmet>
      
      <ResumeBuilder />
    </>
  );
};

export default SEOOptimizedResumeBuilder;