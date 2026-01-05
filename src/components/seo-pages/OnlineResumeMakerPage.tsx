// src/components/seo-pages/OnlineResumeMakerPage.tsx
import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const OnlineResumeMakerPage = () => {
  return (
    <>
      <Helmet>
        <title>Online Resume Maker - Create Professional CV with Free Templates | CareerCraft</title>
        <meta name="description" content="Make a professional resume online with our easy-to-use resume maker. Download in PDF format instantly. Perfect for Indian job market." />
        <meta name="keywords" content="online resume maker, make resume online, online CV maker, create resume online, online resume creator, online resume builder free, online resume maker free, online resume generator, online resume editor, online resume writing, online resume download, online resume PDF, online resume templates, online resume format, online resume India, online resume for freshers, online resume for job, online resume maker app, best online resume maker, free online resume maker, professional online resume maker, online resume maker with templates, online resume maker 2024, online resume maker download, online resume maker no signup, online resume maker easy" />
        <link rel="canonical" href="https://careercraft.in/online-resume-maker" />
        
        <meta property="og:title" content="Online Resume Maker - Create Professional CV with Free Templates | CareerCraft" />
        <meta property="og:description" content="Make a professional resume online with our easy-to-use resume maker. Download in PDF format instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/online-resume-maker" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Online Resume Maker
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create your resume online with our intuitive resume maker. Choose from professional templates, 
            customize your content, and download instantly in PDF format.
          </p>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default OnlineResumeMakerPage;