import { Helmet } from 'react-helmet-async';
import ResumeBuilder from '../ResumeBuilder';

const ResumeBuilderForFreshersPage = () => {
  return (
    <>
      <Helmet>
        <title>Resume Builder for Freshers - Create First Job Resume | CareerCraft</title>
        <meta name="description" content="Create the perfect resume for freshers and entry-level positions. Templates designed for first-time job seekers in India." />
        <meta name="keywords" content="resume builder for freshers, fresher resume builder, entry level resume builder, first job resume builder, resume for freshers, fresher resume format, fresher resume template, fresher CV format, fresher CV template, resume for college students, resume for graduates, resume for first job, resume with no experience, beginner resume, student resume builder, campus placement resume, fresher resume India, fresher resume 2024, fresher resume download, fresher resume examples, fresher resume tips, fresher resume writing, fresher resume samples, resume for engineering freshers, resume for B.Tech freshers, resume for MBA freshers, resume for diploma freshers, best resume for freshers, free fresher resume builder" />
        <link rel="canonical" href="https://careercraft.in/resume-builder-for-freshers" />
      </Helmet>
      
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-orange-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Resume Builder for Freshers
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-3xl mx-auto">
            Create the perfect resume for your first job. Templates designed specifically for freshers 
            and entry-level positions in India.
          </p>
        </div>
      </div>
      
      <ResumeBuilder />
    </>
  );
};

export default ResumeBuilderForFreshersPage;