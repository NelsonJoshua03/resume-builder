// src/components/seo-pages/ATSResumeBuilderPage.tsx
import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ATSResumeBuilderPage = () => {
  return (
    <>
      <Helmet>
        <title>ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft</title>
        <meta name="description" content="Create ATS-optimized resumes that pass through automated screening systems. Templates designed for Indian companies like TCS, Infosys, Wipro & Amazon." />
        <meta name="keywords" content="ATS resume builder, ATS friendly resume, applicant tracking system resume, resume scanner friendly, ATS optimization, ATS resume format, ATS compliant resume, ATS resume template, ATS resume checker, ATS resume tips, ATS resume keywords, ATS resume 2024, resume for ATS software, ATS resume test, ATS resume examples, resume parsing software, ATS resume India, Indian company ATS, TCS ATS resume, Infosys resume format, Wipro resume template, Amazon ATS resume, ATS resume builder free, ATS resume online, ATS resume maker, ATS resume download, ATS resume guide, best ATS resume builder" />
        <link rel="canonical" href="https://careercraft.in/ats-resume-builder" />
        
        <meta property="og:title" content="ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft" />
        <meta property="og:description" content="Create ATS-optimized resumes that pass through automated screening systems. Templates designed for Indian companies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/ats-resume-builder" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ATS Resume Builder - Pass Through Applicant Tracking Systems | CareerCraft" />
        <meta name="twitter:description" content="Create ATS-optimized resumes that pass through automated screening systems." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ATS Resume Builder",
            "url": "https://careercraft.in/ats-resume-builder",
            "description": "ATS-optimized resume builder designed for Indian companies' applicant tracking systems",
            "applicationCategory": "BusinessApplication",
            "featureList": [
              "ATS-friendly templates",
              "Resume parsing optimization",
              "Keyword optimization",
              "Clean single-column layouts"
            ],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            }
          })}
        </script>
      </Helmet>
      
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            ATS Resume Builder
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create resumes that pass through Applicant Tracking Systems used by 98% of companies. 
            Optimized for Indian companies like TCS, Infosys, Wipro, and Amazon.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">TCS</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Infosys</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Wipro</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-orange-600 font-bold">Amazon</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ATSResumeBuilderPage;