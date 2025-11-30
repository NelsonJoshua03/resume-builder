// src/components/BlogPost.tsx - UPDATED WITH GOOGLE ANALYTICS & SEO
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import ReactMarkdown from 'react-markdown';
import BlogSocialSharing from './BlogSocialSharing';
import SEO from './SEO';

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
  contentFile: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { trackBlogView, trackButtonClick, trackPageView, trackCTAClick } = useGoogleAnalytics();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Helper function to get the correct URLs based on environment
  const getBlogUrls = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return {
        dataUrl: '/blog-data.json',
        contentUrl: (filename: string) => `/blog-content/${filename}`
      };
    } else {
      const baseUrl = 'https://raw.githubusercontent.com/NelsonJoshua03/resume-builder/main';
      return {
        dataUrl: `${baseUrl}/public/blog-data.json?t=${Date.now()}`,
        contentUrl: (filename: string) => `${baseUrl}/public/blog-content/${filename}?t=${Date.now()}`
      };
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const urls = getBlogUrls();
        
        // Fetch post metadata
        const response = await fetch(urls.dataUrl);
        
        if (!response.ok) {
          throw new Error('Failed to load blog post');
        }
        
        const data = await response.json();
        const currentPost = data.posts.find((p: BlogPostData) => p.slug === slug);
        
        if (currentPost) {
          setPost(currentPost);
          trackBlogView(slug || 'unknown', currentPost.title, currentPost.category);
          trackPageView(currentPost.title, `/blog/${slug}`);
          
          // Track blog post loaded
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'blog_post_loaded', {
              post_slug: slug,
              post_title: currentPost.title,
              category: currentPost.category,
              event_category: 'Blog',
              event_label: 'blog_post_view'
            });
          }

          // Fetch markdown content
          setContentLoading(true);
          try {
            const contentResponse = await fetch(urls.contentUrl(currentPost.contentFile));
            
            if (contentResponse.ok) {
              const markdownContent = await contentResponse.text();
              setContent(markdownContent);
            } else {
              setContent('*Content is being updated. Please check back soon!*');
            }
          } catch (contentError) {
            console.error('Error loading blog content:', contentError);
            setContent('*Content is being updated. Please check back soon!*');
          } finally {
            setContentLoading(false);
          }
        } else {
          setError('Blog post not found');
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError('Failed to load blog post. Please try again later.');
        
        // Track error
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'exception', {
            description: 'Blog post load error',
            fatal: false
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPostData();
    }
  }, [slug, trackBlogView, trackPageView]);

  const handleCTAClick = () => {
    trackButtonClick('build_resume_from_blog', 'blog_post_cta', 'blog');
    trackCTAClick('blog_post_resume_builder', 'blog_post_footer', 'blog');
  };

  const handleBackToBlog = () => {
    trackButtonClick('back_to_blog', 'blog_navigation', 'blog');
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

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700"
            onClick={handleBackToBlog}
          >
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

  const currentUrl = `${window.location.origin}/blog/${post.slug}`;
  const publishedTime = new Date(post.date).toISOString();

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={`${post.category} resume tips India, ATS optimization India, ${post.title.toLowerCase()} Indian job market`}
        canonicalUrl={currentUrl}
        type="article"
        publishedTime={publishedTime}
        author={post.author}
        ogImage="https://careercraft.in/logos/careercraft-logo-square.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": "https://careercraft.in/logos/careercraft-logo-square.png",
          "datePublished": publishedTime,
          "dateModified": publishedTime,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "CareerCraft India",
            "logo": {
              "@type": "ImageObject",
              "url": "https://careercraft.in/logos/careercraft-logo-square.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
          }
        }}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            onClick={handleBackToBlog}
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
              {contentLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <ReactMarkdown>{content}</ReactMarkdown>
              )}
            </div>
            
            {/* Social Sharing */}
            <BlogSocialSharing 
              title={post.title}
              url={currentUrl}
              description={post.excerpt}
            />
            
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