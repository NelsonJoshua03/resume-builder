// src/components/seo-pages/FreeResumeBuilderPage.tsx
import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const FreeResumeBuilderPage = () => {
  return (
    <>
      <Helmet>
        <title>Free Resume Builder Online - Create ATS-Friendly CV in Minutes | CareerCraft</title>
        <meta name="description" content="Build your professional resume for free with our online resume builder. ATS-friendly templates, instant download, and no sign-up required. Create your perfect CV in minutes." />
        <meta name="keywords" content="free resume builder, online resume builder free, resume maker online, CV creator free, ATS resume builder, resume template free download, create resume online no sign up, best free resume builder, resume builder for freshers, professional resume builder free, Indian resume builder, resume builder 2024, download resume template, easy resume builder, resume builder with templates, modern resume builder, simple resume builder, resume builder for students, resume builder for job seekers, resume format download, online CV maker free, make resume online free, resume builder app, resume writing online, career builder resume" />
        <link rel="canonical" href="https://careercraft.in/free-resume-builder" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Free Resume Builder Online - Create ATS-Friendly CV in Minutes | CareerCraft" />
        <meta property="og:description" content="Build your professional resume for free with our online resume builder. ATS-friendly templates, instant download, and no sign-up required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/free-resume-builder" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Resume Builder Online - Create ATS-Friendly CV in Minutes | CareerCraft" />
        <meta name="twitter:description" content="Build your professional resume for free with our online resume builder. ATS-friendly templates, instant download." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Free Resume Builder",
            "url": "https://careercraft.in/free-resume-builder",
            "description": "Free online resume builder with ATS-friendly templates for Indian job seekers",
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
            }
          })}
        </script>
      </Helmet>
      
      {/* Unique Content */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Free Resume Builder
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create professional, ATS-optimized resumes for free with our easy-to-use online resume builder. 
            No sign up required. Download instantly in PDF format.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-green-600 font-bold">100% Free</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">No Sign Up</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-purple-600 font-bold">Instant PDF</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-teal-600 font-bold">ATS Friendly</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default FreeResumeBuilderPage;