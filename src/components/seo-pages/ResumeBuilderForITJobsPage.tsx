import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ResumeBuilderForITJobsPage = () => {
  return (
    <>
      <Helmet>
        <title>Resume Builder for IT Jobs - Tech Resume Templates | CareerCraft</title>
        <meta name="description" content="Create IT professional resumes with tech-focused templates. Perfect for software developers, data scientists, and IT professionals." />
        <meta name="keywords" content="resume builder for IT jobs, IT resume builder, tech resume builder, software developer resume, IT professional resume, tech resume template, IT resume format, resume for IT jobs, resume for software jobs, resume for tech jobs, IT resume India, tech resume 2024, IT professional CV, software engineer resume, web developer resume, mobile developer resume, full stack developer resume, frontend developer resume, backend developer resume, IT support resume, network engineer resume, system administrator resume, database administrator resume, cloud engineer resume, DevOps resume, cybersecurity resume, IT manager resume, best IT resume builder, free IT resume builder, IT resume examples, IT resume samples" />
        <link rel="canonical" href="https://careercraft.in/resume-builder-for-it-jobs" />
        
        <meta property="og:title" content="Resume Builder for IT Jobs - Tech Resume Templates | CareerCraft" />
        <meta property="og:description" content="Create IT professional resumes with tech-focused templates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/resume-builder-for-it-jobs" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resume Builder for IT Jobs - Tech Resume Templates | CareerCraft" />
        <meta name="twitter:description" content="Create IT professional resumes with tech-focused templates." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Resume Builder for IT Jobs
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create professional IT resumes for technology roles. Perfect for software developers, 
            data scientists, cybersecurity experts, and IT professionals in India.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Developer</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-green-600 font-bold">Data Science</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-red-600 font-bold">Cybersecurity</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-purple-600 font-bold">DevOps</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ResumeBuilderForITJobsPage;