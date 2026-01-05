import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ProfessionalResumeBuilderPage = () => {
  return (
    <>
      <Helmet>
        <title>Professional Resume Builder - Create Executive Level CV | CareerCraft</title>
        <meta name="description" content="Build executive-level professional resumes with our advanced resume builder. Perfect for senior roles and corporate positions in India." />
        <meta name="keywords" content="professional resume builder, executive resume builder, corporate resume builder, senior level resume builder, management resume builder, professional CV builder, executive CV maker, professional resume template, executive resume template, corporate resume format, senior management resume, director level resume, VP resume, CEO resume, professional resume writing, executive resume writing, professional resume services, executive resume services, resume for experienced professionals, resume for managers, resume for senior executives, professional resume India, executive resume India, corporate resume India, professional resume 2024, executive resume 2024, best professional resume builder, premium resume builder" />
        <link rel="canonical" href="https://careercraft.in/professional-resume-builder" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-indigo-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Professional Resume Builder
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create executive-level professional resumes for senior roles and corporate positions. 
            Premium templates designed for experienced professionals in India.
          </p>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ProfessionalResumeBuilderPage;