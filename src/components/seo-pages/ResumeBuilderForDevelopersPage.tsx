import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ResumeBuilderForDevelopersPage = () => {
  return (
    <>
      <Helmet>
        <title>Resume Builder for Developers - Software Engineer CV | CareerCraft</title>
        <meta name="description" content="Create developer resumes with code-friendly templates. Perfect for software engineers, web developers, and programmers." />
        <meta name="keywords" content="resume builder for developers, developer resume builder, software engineer resume builder, programmer resume builder, coder resume builder, web developer resume builder, developer resume template, software engineer resume format, programmer resume format, coding resume, developer resume examples, software engineer resume examples, web developer resume examples, frontend developer resume, backend developer resume, full stack developer resume, mobile app developer resume, game developer resume, Python developer resume, Java developer resume, JavaScript developer resume, C++ developer resume, PHP developer resume, .NET developer resume, React developer resume, Angular developer resume, Node.js developer resume, developer resume India, developer resume 2024, best developer resume builder, free developer resume builder, GitHub resume, coding portfolio resume" />
        <link rel="canonical" href="https://careercraft.in/resume-builder-for-developers" />
        
        <meta property="og:title" content="Resume Builder for Developers - Software Engineer CV | CareerCraft" />
        <meta property="og:description" content="Create developer resumes with code-friendly templates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/resume-builder-for-developers" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resume Builder for Developers - Software Engineer CV | CareerCraft" />
        <meta name="twitter:description" content="Create developer resumes with code-friendly templates." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-gray-50 to-black border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Resume Builder for Developers
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create coding-focused resumes for software engineers and developers. 
            Templates with GitHub integration and technical skill highlighting.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-yellow-600 font-bold">JavaScript</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Python</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-orange-600 font-bold">Java</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-purple-600 font-bold">React</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ResumeBuilderForDevelopersPage;