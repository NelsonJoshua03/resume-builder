// src/components/Blog.tsx - UPDATED WITH GOOGLE ANALYTICS & SEO
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import SEO from './SEO';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  slug: string;
  author: string;
  authorBio: string;
  contentFile: string;
}

const blogCategories = {
  'resume-tips': 'Resume Writing Tips',
  'career-advice': 'Career Advice', 
  'industry-specific': 'Industry Specific Guides',
  'ats-optimization': 'ATS Optimization',
  'fresh-graduate': 'Fresh Graduate Guide'
};

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { trackPageView, trackBlogView, trackButtonClick, trackCTAClick } = useGoogleAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView('CareerCraft Blog', '/blog');
  }, [trackPageView]);

  // Helper function to get the correct URL based on environment
  const getBlogDataUrl = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return '/blog-data.json';
    } else {
      return 'https://raw.githubusercontent.com/NelsonJoshua03/resume-builder/main/public/blog-data.json?t=' + Date.now();
    }
  };

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const dataUrl = getBlogDataUrl();
        console.log('📡 Fetching blog data from:', dataUrl);
        
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
          throw new Error('Failed to load blog posts');
        }
        
        const data = await response.json();
        console.log('📝 Loaded blog posts:', data.posts.length);
        setBlogPosts(data.posts);
        setLoading(false);
        
        // Track blog loaded event
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'blog_loaded', {
            post_count: data.posts.length,
            event_category: 'Blog',
            event_label: 'blog_page_loaded'
          });
        }
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
        
        // Track error event
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'exception', {
            description: 'Blog load error',
            fatal: false
          });
        }
      }
    };

    fetchBlogPosts();
  }, []);

  const handleBlogPostClick = (post: BlogPost) => {
    trackBlogView(post.slug, post.title, post.category);
    trackButtonClick(`blog_post_${post.slug}`, 'blog_grid', 'blog');
  };

  const handleCategoryFilter = (category: string) => {
    trackButtonClick(`filter_${category}`, 'blog_categories', 'blog');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse text-gray-600">Loading latest blog posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="CareerCraft Blog - Career Advice & ATS Resume Tips for Indian Job Market"
        description="Expert resume advice, ATS optimization tips, and career insights for Indian job seekers. Learn how to create resumes that get you hired in competitive Indian job markets."
        keywords="Indian resume blog, career advice India, ATS resume tips, job search strategies India, resume writing guide, career development India"
        canonicalUrl="https://careercraft.in/blog"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "CareerCraft Blog",
          "description": "Expert career advice and resume tips for Indian job seekers",
          "url": "https://careercraft.in/blog",
          "publisher": {
            "@type": "Organization",
            "name": "CareerCraft India",
            "logo": {
              "@type": "ImageObject",
              "url": "https://careercraft.in/logos/careercraft-logo-square.png"
            }
          },
          "blogPost": blogPosts.map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "url": `https://careercraft.in/blog/${post.slug}`,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author
            }
          }))
        }}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CareerCraft.in Blog</h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert advice, tips, and insights to help Indian professionals create the perfect resume and land dream jobs.
            </p>
            
            {/* Development Mode Indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-4 inline-block">
                🚧 Development Mode - Showing Local Posts
              </div>
            )}
            
            {/* E-E-A-T Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center text-gray-600 bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-600 mr-2">✓</span>
                Written by Indian Career Experts
              </div>
              <div className="flex items-center text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
                <span className="text-blue-600 mr-2">✓</span>
                ATS-Optimized for Indian Companies
              </div>
              <div className="flex items-center text-gray-600 bg-purple-50 px-4 py-2 rounded-full">
                <span className="text-purple-600 mr-2">✓</span>
                Updated Weekly with Indian Market Insights
              </div>
            </div>
          </div>

          {/* Blog Posts Count */}
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing {blogPosts.length} blog post{blogPosts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {blogPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full cursor-pointer"
                      onClick={() => handleCategoryFilter(post.category)}
                    >
                      {blogCategories[post.category as keyof typeof blogCategories] || post.category}
                    </span>
                    <div className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {post.readTime}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="hover:text-blue-600 transition-colors duration-200 block"
                      onClick={() => handleBlogPostClick(post)}
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  
                  {/* Author Info */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.authorBio}</p>
                    </div>
                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center"
                      onClick={() => handleBlogPostClick(post)}
                    >
                      Read more 
                      <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4">No Blog Posts Found</h3>
                <p className="text-yellow-700 mb-4">
                  {process.env.NODE_ENV === 'development' 
                    ? "No local blog posts found. Make sure you've created blog posts and they're in public/blog-data.json"
                    : "No blog posts available. Please check back later."
                  }
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-600 mb-2">To add a blog post locally, run:</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      npm run new-blog add "slug" "Title" "Excerpt" "category"
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your Professional Indian Resume?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of successful Indian job seekers who landed their dream jobs with our ATS-optimized resume templates and expert guidance tailored for Indian companies.
            </p>
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block transition-colors duration-200 shadow-lg hover:shadow-xl"
              onClick={() => trackCTAClick('blog_cta_builder', 'blog_footer', 'blog')}
            >
              🚀 Start Building Your Indian Resume Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;