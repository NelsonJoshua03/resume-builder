import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ResumeBuilderForEngineersPage = () => {
  return (
    <>
      <Helmet>
        <title>Resume Builder for Engineers - Technical Resume Templates | CareerCraft</title>
        <meta name="description" content="Create engineering resumes with technical templates. Perfect for mechanical, civil, electrical engineers in India." />
        <meta name="keywords" content="resume builder for engineers, engineering resume builder, technical resume builder, mechanical engineer resume, civil engineer resume, electrical engineer resume, engineer resume template, engineer CV format, engineering resume format, technical resume format, resume for mechanical engineers, resume for civil engineers, resume for electrical engineers, resume for software engineers, engineer resume India, engineering resume 2024, technical resume tips, engineering CV builder, engineer resume examples, engineer resume samples, project engineer resume, design engineer resume, site engineer resume, maintenance engineer resume, production engineer resume, quality engineer resume, engineering graduate resume, experienced engineer resume, best engineer resume builder, free engineer resume builder" />
        <link rel="canonical" href="https://careercraft.in/resume-builder-for-engineers" />
        
        <meta property="og:title" content="Resume Builder for Engineers - Technical Resume Templates | CareerCraft" />
        <meta property="og:description" content="Create engineering resumes with technical templates. Perfect for mechanical, civil, electrical engineers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/resume-builder-for-engineers" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resume Builder for Engineers - Technical Resume Templates | CareerCraft" />
        <meta name="twitter:description" content="Create engineering resumes with technical templates." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Resume Builder for Engineers
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create technical resumes for engineering disciplines. Perfect for mechanical, civil, electrical, 
            and software engineers in the Indian job market.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Mechanical</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-green-600 font-bold">Civil</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-yellow-600 font-bold">Electrical</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-purple-600 font-bold">Software</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ResumeBuilderForEngineersPage;