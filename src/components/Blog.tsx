// src/components/Blog.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How to Create an ATS-Friendly Resume",
      excerpt: "Learn the secrets to making your resume pass through Applicant Tracking Systems and reach human recruiters.",
      category: "Resume Tips",
      date: "2024-01-15",
      readTime: "5 min read",
      slug: "ats-friendly-resume-guide"
    },
    {
      id: 2,
      title: "10 Resume Mistakes to Avoid in 2024",
      excerpt: "Common pitfalls that could be costing you interviews and how to fix them.",
      category: "Career Advice",
      date: "2024-01-10",
      readTime: "7 min read",
      slug: "resume-mistakes-2024"
    },
    {
      id: 3,
      title: "Best Resume Templates for Engineering Roles",
      excerpt: "Industry-specific templates that highlight technical skills and project experience.",
      category: "Engineering",
      date: "2024-01-05",
      readTime: "6 min read",
      slug: "engineering-resume-templates"
    }
  ];

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ResumeCVForge Blog</h1>
          <p className="text-xl text-gray-600 mb-12">
            Expert advice, tips, and insights to help you create the perfect resume and land your dream job.
          </p>

          <div className="grid gap-8">
            {blogPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <div className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString()} • {post.readTime}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/builder" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Start Building Your Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;