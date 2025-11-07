// src/components/BlogPost.tsx
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { trackBlogView, trackButtonClick } = useGoogleAnalytics();
  
  // Dynamic blog posts based on slug
  const getBlogPostBySlug = (slug: string | undefined) => {
    const posts = {
      "ats-friendly-resume-guide": {
        title: "How to Create an ATS-Friendly Resume for Indian Job Market",
        excerpt: "Learn the secrets to making your resume pass through Applicant Tracking Systems used by Indian companies and reach human recruiters.",
        content: `
          <h2>Understanding Applicant Tracking Systems in India</h2>
          <p>Applicant Tracking Systems (ATS) are software used by Indian employers to manage job applications. They scan resumes for keywords and qualifications before they reach human recruiters at Indian companies.</p>
          
          <h2>Key Elements of an ATS-Friendly Resume for Indian Market</h2>
          <ul>
            <li><strong>Use standard section headings:</strong> "Work Experience," "Education," "Skills" as used in Indian resumes</li>
            <li><strong>Include relevant Indian industry keywords:</strong> Mirror the language used in Indian job descriptions</li>
            <li><strong>Choose a clean, simple format:</strong> Avoid tables, columns, and graphics that Indian ATS might not parse</li>
            <li><strong>Use standard fonts:</strong> Arial, Calibri, Georgia, Times New Roman preferred by Indian companies</li>
            <li><strong>Save as .docx or PDF:</strong> Ensure the ATS used by Indian companies can parse your resume</li>
            <li><strong>Include Indian educational qualifications properly:</strong> Use standard degree names and university formats</li>
          </ul>
          
          <h2>Pro Tips for ATS Optimization in Indian Context</h2>
          <p>Always customize your resume for each Indian company application. Study the job description carefully and incorporate relevant keywords naturally throughout your resume. Include specific Indian technologies, tools, and methodologies used in your industry.</p>
        `,
        category: "Resume Tips",
        date: "2024-01-15",
        readTime: "5 min read"
      },
      "resume-mistakes-2024": {
        title: "10 Resume Mistakes Indian Job Seekers Must Avoid in 2024",
        excerpt: "Common pitfalls that could be costing you interviews at Indian companies and how to fix them.",
        content: `
          <h2>Common Resume Pitfalls That Cost You Interviews in India</h2>
          <p>Avoid these common mistakes to ensure your resume gets noticed by Indian recruiters and hiring managers.</p>
          
          <h2>Top 10 Resume Mistakes for Indian Job Market</h2>
          <ol>
            <li><strong>Spelling and grammar errors in Indian English:</strong> Always proofread multiple times</li>
            <li><strong>Using unprofessional email addresses:</strong> Use a simple, professional format preferred by Indian companies</li>
            <li><strong>Including irrelevant personal information:</strong> Focus on what matters for Indian jobs</li>
            <li><strong>Being too vague about Indian context:</strong> Use specific achievements and metrics relevant to Indian market</li>
            <li><strong>Using outdated Indian resume formats:</strong> Modern, clean designs work best for Indian companies</li>
            <li><strong>Including unnecessary personal details:</strong> Avoid age, marital status, photos unless requested</li>
            <li><strong>Using clichés without Indian context:</strong> Be authentic and specific to Indian industry</li>
            <li><strong>Inconsistent formatting for Indian standards:</strong> Maintain consistent styling throughout</li>
            <li><strong>Too long for Indian recruiters:</strong> 1-2 pages is ideal for most Indian professionals</li>
            <li><strong>Not tailoring for Indian companies:</strong> Customize for each Indian company application</li>
          </ol>
        `,
        category: "Career Advice",
        date: "2024-01-10",
        readTime: "7 min read"
      },
      "engineering-resume-templates": {
        title: "Best Resume Templates for Engineering Roles in India",
        excerpt: "Industry-specific templates that highlight technical skills and project experience for Indian engineering job market.",
        content: `
          <h2>Engineering Resume Essentials for Indian Market</h2>
          <p>Engineering resumes for Indian job market need to highlight technical skills, project experience, and problem-solving abilities in a clear, professional format preferred by Indian engineering companies.</p>
          
          <h2>Key Sections for Indian Engineering Resumes</h2>
          <ul>
            <li><strong>Technical Skills for Indian Industry:</strong> List programming languages, tools, and technologies used in Indian engineering firms</li>
            <li><strong>Projects with Indian Context:</strong> Highlight relevant engineering projects with specific outcomes for Indian scenarios</li>
            <li><strong>Indian Certifications:</strong> Include relevant engineering certifications recognized in India</li>
            <li><strong>Indian Education:</strong> Emphasize engineering degrees from Indian universities and relevant coursework</li>
            <li><strong>Internships at Indian Companies:</strong> Showcase practical experience in Indian engineering environment</li>
          </ul>
          
          <h2>Recommended Template Types for Indian Engineers</h2>
          <p><strong>Chronological:</strong> Best for experienced engineers with steady career progression in Indian companies</p>
          <p><strong>Functional:</strong> Ideal for career changers or those with employment gaps in Indian job market</p>
          <p><strong>Combination:</strong> Perfect for highlighting both skills and experience for Indian recruiters</p>
        `,
        category: "Engineering",
        date: "2024-01-05",
        readTime: "6 min read"
      }
    };

    return posts[slug as keyof typeof posts] || posts["ats-friendly-resume-guide"];
  };

  const currentPost = getBlogPostBySlug(slug);

  // Track blog post view - ADD THIS BACK
  useEffect(() => {
    if (currentPost) {
      trackBlogView(slug || 'unknown', currentPost.title, currentPost.category);
    }
  }, [currentPost, slug, trackBlogView]);

  const handleCTAClick = () => {
    trackButtonClick('build_resume_from_blog', 'blog_post_cta', 'blog');
  };

  return (
    <>
      <Helmet>
        <title>{currentPost.title} | CareerCraft.in</title>
        <meta name="description" content={`${currentPost.excerpt} Learn professional resume writing and ATS optimization strategies for Indian job market.`} />
        <meta name="keywords" content={`${currentPost.category.toLowerCase()} resume tips India, ATS optimization India, ${currentPost.title.toLowerCase()} Indian job market`} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            onClick={() => trackButtonClick('back_to_blog', 'blog_navigation', 'blog')}
          >
            ← Back to CareerCraft Blog
          </Link>
          
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
              <Link 
                to="/builder" 
                onClick={handleCTAClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 inline-block"
              >
                Create Your ATS-Friendly Indian Resume
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogPost;