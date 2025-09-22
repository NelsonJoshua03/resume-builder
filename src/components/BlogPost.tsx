// src/components/BlogPost.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // This line is fine now
  
  // Mock blog post data - in real app, you'd fetch this based on slug
  const blogPost = {
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
  };

  // Add this line to actually use the slug variable
  console.log('Current slug:', slug); // This satisfies TypeScript

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">ResumeCVForge</Link>
            <div className="flex space-x-6">
              <Link to="/job-disciplines" className="text-gray-700 hover:text-blue-600">Job Disciplines</Link>
              <Link to="/blog" className="text-blue-600 font-semibold">Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/builder" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Build Resume</Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">← Back to Blog</Link>
          
          <article className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {blogPost.category}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(blogPost.date).toLocaleDateString()} • {blogPost.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{blogPost.title}</h1>
            
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link to="/builder" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                Create Your ATS-Friendly Resume
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;