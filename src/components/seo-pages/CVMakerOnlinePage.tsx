import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const CVMakerOnlinePage = () => {
  return (
    <>
      <Helmet>
        <title>CV Maker Online - Create Professional Curriculum Vitae for Free | CareerCraft</title>
        <meta name="description" content="Create a professional CV online with our free CV maker. Download instantly in PDF format. Perfect for job applications in India." />
        <meta name="keywords" content="CV maker online, online CV maker, CV creator online, make CV online, create CV online, CV builder online, CV generator online, professional CV maker, free CV maker, CV maker free, CV template online, CV format online, CV download, CV PDF, CV for job, CV for freshers, Indian CV format, CV maker India, best CV maker, CV maker app, CV maker 2024, modern CV maker, simple CV maker, academic CV maker, job CV maker, CV maker with photo, CV maker for students, CV maker for job application, CV maker no registration" />
        <link rel="canonical" href="https://careercraft.in/cv-maker-online" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-teal-50 to-green-50 border-b border-teal-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            CV Maker Online
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create professional Curriculum Vitae (CV) online for academic and job applications. 
            Download in PDF format instantly. Perfect for Indian job market.
          </p>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default CVMakerOnlinePage;