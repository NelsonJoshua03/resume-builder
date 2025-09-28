// src/components/BlogPost.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Dynamic blog posts based on slug
  const getBlogPostBySlug = (slug: string | undefined) => {
    const posts = {
      "ats-friendly-resume-guide": {
        title: "How to Create an ATS-Friendly Resume",
        content: `
          <h2>Understanding Applicant Tracking Systems</h2>
          <p>Applicant Tracking Systems (ATS) are software used by employers to manage job applications. They scan resumes for keywords and qualifications before they reach human recruiters.</p>
          
          <h2>Key Elements of an ATS-Friendly Resume</h2>
          <ul>
            <li><strong>Use standard section headings:</strong> "Work Experience," "Education," "Skills"</li>
            <li><strong>Include relevant keywords:</strong> Mirror the language used in job descriptions</li>
            <li><strong>Choose a clean, simple format:</strong> Avoid tables, columns, and graphics</li>
            <li><strong>Use standard fonts:</strong> Arial, Calibri, Georgia, Times New Roman</li>
            <li><strong>Save as .docx or PDF:</strong> Ensure the ATS can parse your resume</li>
          </ul>
          
          <h2>Pro Tips for ATS Optimization</h2>
          <p>Always customize your resume for each job application. Study the job description carefully and incorporate relevant keywords naturally throughout your resume.</p>
        `,
        category: "Resume Tips",
        date: "2024-01-15",
        readTime: "5 min read"
      },
      "resume-mistakes-2024": {
        title: "10 Resume Mistakes to Avoid in 2024",
        content: `
          <h2>Common Resume Pitfalls That Cost You Interviews</h2>
          <p>Avoid these common mistakes to ensure your resume gets noticed by recruiters and hiring managers.</p>
          
          <h2>Top 10 Resume Mistakes</h2>
          <ol>
            <li><strong>Spelling and grammar errors:</strong> Always proofread multiple times</li>
            <li><strong>Using an unprofessional email address:</strong> Use a simple, professional format</li>
            <li><strong>Including irrelevant information:</strong> Focus on what matters for the job</li>
            <li><strong>Being too vague:</strong> Use specific achievements and metrics</li>
            <li><strong>Using an outdated format:</strong> Modern, clean designs work best</li>
            <li><strong>Including personal information:</strong> Avoid age, marital status, photos</li>
            <li><strong>Using clichés and buzzwords:</strong> Be authentic and specific</li>
            <li><strong>Inconsistent formatting:</strong> Maintain consistent styling throughout</li>
            <li><strong>Too long or too short:</strong> 1-2 pages is ideal for most professionals</li>
            <li><strong>Not tailoring for the job:</strong> Customize for each application</li>
          </ol>
        `,
        category: "Career Advice",
        date: "2024-01-10",
        readTime: "7 min read"
      },
      "engineering-resume-templates": {
        title: "Best Resume Templates for Engineering Roles",
        content: `
          <h2>Engineering Resume Essentials</h2>
          <p>Engineering resumes need to highlight technical skills, project experience, and problem-solving abilities in a clear, professional format.</p>
          
          <h2>Key Sections for Engineering Resumes</h2>
          <ul>
            <li><strong>Technical Skills:</strong> List programming languages, tools, and technologies</li>
            <li><strong>Projects:</strong> Highlight relevant engineering projects with specific outcomes</li>
            <li><strong>Certifications:</strong> Include relevant engineering certifications</li>
            <li><strong>Education:</strong> Emphasize engineering degrees and coursework</li>
          </ul>
          
          <h2>Recommended Template Types</h2>
          <p><strong>Chronological:</strong> Best for experienced engineers with steady career progression</p>
          <p><strong>Functional:</strong> Ideal for career changers or those with employment gaps</p>
          <p><strong>Combination:</strong> Perfect for highlighting both skills and experience</p>
        `,
        category: "Engineering",
        date: "2024-01-05",
        readTime: "6 min read"
      }
    };

    return posts[slug as keyof typeof posts] || posts["ats-friendly-resume-guide"];
  };

  const currentPost = getBlogPostBySlug(slug);

  return (
    <>
      <Helmet>
        <title>{currentPost.title} | ResumeCVForge Blog</title>
        <meta name="description" content={`Learn how to create resumes that pass through Applicant Tracking Systems. ATS-friendly resume tips and optimization strategies.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">← Back to Blog</Link>
          
          <article className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {currentPost.category}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(currentPost.date).toLocaleDateString()} • {currentPost.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{currentPost.title}</h1>
            
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link to="/builder" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your ATS-Friendly Resume
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogPost;