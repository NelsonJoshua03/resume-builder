import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const CreateResumeOnlinePage = () => {
  return (
    <>
      <Helmet>
        <title>Create Resume Online - Instant Resume Maker | CareerCraft</title>
        <meta name="description" content="Create your resume online instantly with our easy-to-use resume maker. No signup required, download in PDF immediately." />
        <meta name="keywords" content="create resume online, instant resume maker, quick resume builder, make resume now, online resume creator, build resume online, generate resume online, resume maker online free, create CV online, make CV now, quick CV maker, instant CV creator, resume builder no signup, resume maker no registration, resume builder instant download, resume builder fast, resume builder easy, resume builder simple, resume builder for beginners, resume builder step by step, resume builder guide, resume builder tutorial, resume builder help, resume builder tips, resume builder tools, resume builder software, resume builder app, resume builder website, best resume builder online, free online resume creator, resume maker 2024, create professional resume online, resume writing online free" />
        <link rel="canonical" href="https://careercraft.in/create-resume-online" />
        
        <meta property="og:title" content="Create Resume Online - Instant Resume Maker | CareerCraft" />
        <meta property="og:description" content="Create your resume online instantly with our easy-to-use resume maker." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercraft.in/create-resume-online" />
        <meta property="og:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create Resume Online - Instant Resume Maker | CareerCraft" />
        <meta name="twitter:description" content="Create your resume online instantly with our easy-to-use resume maker." />
        <meta name="twitter:image" content="https://careercraft.in/og/resume-builder-preview.jpg" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Create Resume Online
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create your resume online instantly with our simple resume maker. 
            No sign up required. Get your professional resume in minutes, not hours.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-green-600 font-bold">Quick</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-blue-600 font-bold">Easy</span>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <span className="text-purple-600 font-bold">Instant</span>
            </div>
          </div>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default CreateResumeOnlinePage;