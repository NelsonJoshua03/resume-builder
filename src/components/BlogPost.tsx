// src/components/BlogPost.tsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import ReactMarkdown from 'react-markdown';

interface BlogPostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorBio: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { trackBlogView, trackButtonClick } = useGoogleAnalytics();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Dynamic content based on slug
  const getPostContent = (postSlug: string) => {
    const contentMap: { [key: string]: string } = {
      "ats-friendly-resume-guide": `
## Understanding Applicant Tracking Systems in India

Applicant Tracking Systems (ATS) are software used by Indian employers to manage job applications. They scan resumes for keywords and qualifications before they reach human recruiters at Indian companies.

## Key Elements of an ATS-Friendly Resume for Indian Market

- **Use standard section headings:** "Work Experience," "Education," "Skills" as used in Indian resumes
- **Include relevant Indian industry keywords:** Mirror the language used in Indian job descriptions  
- **Choose a clean, simple format:** Avoid tables, columns, and graphics that Indian ATS might not parse
- **Use standard fonts:** Arial, Calibri, Georgia, Times New Roman preferred by Indian companies
- **Save as .docx or PDF:** Ensure the ATS used by Indian companies can parse your resume
- **Include Indian educational qualifications properly:** Use standard degree names and university formats

## Pro Tips for ATS Optimization in Indian Context

Always customize your resume for each Indian company application. Study the job description carefully and incorporate relevant keywords naturally throughout your resume. Include specific Indian technologies, tools, and methodologies used in your industry.
      `,
      "resume-mistakes-2024": `
## Common Resume Pitfalls That Cost You Interviews in India

Avoid these common mistakes to ensure your resume gets noticed by Indian recruiters and hiring managers.

## Top 10 Resume Mistakes for Indian Job Market

1. **Spelling and grammar errors in Indian English:** Always proofread multiple times
2. **Using unprofessional email addresses:** Use a simple, professional format preferred by Indian companies
3. **Including irrelevant personal information:** Focus on what matters for Indian jobs
4. **Being too vague about Indian context:** Use specific achievements and metrics relevant to Indian market
5. **Using outdated Indian resume formats:** Modern, clean designs work best for Indian companies
6. **Including unnecessary personal details:** Avoid age, marital status, photos unless requested
7. **Using clichés without Indian context:** Be authentic and specific to Indian industry
8. **Inconsistent formatting for Indian standards:** Maintain consistent styling throughout
9. **Too long for Indian recruiters:** 1-2 pages is ideal for most Indian professionals
10. **Not tailoring for Indian companies:** Customize for each Indian company application
      `,
      // Add content for other posts...
    };

    return contentMap[postSlug] || "Content coming soon...";
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Fetch post metadata
        const response = await fetch(
          'https://raw.githubusercontent.com/NelsonJoshua03/resume-builder/main/public/blog-data.json?t=' + Date.now()
        );
        
        if (response.ok) {
          const data = await response.json();
          const currentPost = data.posts.find((p: BlogPostData) => p.slug === slug);
          
          if (currentPost) {
            setPost(currentPost);
            setContent(getPostContent(slug || ''));
            trackBlogView(slug || 'unknown', currentPost.title, currentPost.category);
          }
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPostData();
    }
  }, [slug, trackBlogView]);

  const handleCTAClick = () => {
    trackButtonClick('build_resume_from_blog', 'blog_post_cta', 'blog');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse text-gray-600">Loading blog post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const blogCategories = {
    'resume-tips': 'Resume Writing Tips',
    'career-advice': 'Career Advice',
    'industry-specific': 'Industry Specific Guides', 
    'ats-optimization': 'ATS Optimization',
    'fresh-graduate': 'Fresh Graduate Guide'
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | CareerCraft.in</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.category} resume tips India, ATS optimization India, ${post.title.toLowerCase()} Indian job market`} />
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
                {blogCategories[post.category as keyof typeof blogCategories] || post.category}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString()} • {post.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
            
            {/* Author Info */}
            <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-600">{post.authorBio}</p>
              </div>
            </div>
            
            {/* Blog Content */}
            <div className="prose prose-lg max-w-none text-gray-700">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            
            {/* CTA Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                to="/builder" 
                onClick={handleCTAClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block transition-colors duration-200"
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