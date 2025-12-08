// src/components/BlogPost.tsx - MOBILE OPTIMIZED VERSION
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trackBlogView, trackButtonClick, trackPageView, trackCTAClick } = useGoogleAnalytics();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Memoized cache functions to prevent recreation on every render
  const getCachedBlogData = useCallback((): BlogPostData[] | null => {
    try {
      const cached = localStorage.getItem('blog_data_cache');
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_DURATION) {
        return data.posts;
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    return null;
  }, []);

  const getCachedPostContent = useCallback((postSlug: string): string | null => {
    try {
      const cached = localStorage.getItem(`blog_content_${postSlug}`);
      if (!cached) return null;
      
      const { content, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_DURATION) {
        return content;
      }
    } catch (e) {
      console.error('Error reading content cache:', e);
    }
    return null;
  }, []);

  const setPostContentCache = useCallback((postSlug: string, postContent: string) => {
    try {
      localStorage.setItem(`blog_content_${postSlug}`, JSON.stringify({
        content: postContent,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Error setting content cache:', e);
    }
  }, []);

  // Clean markdown content - memoized to prevent recreation
  const cleanMarkdownContent = useCallback((markdownContent: string): string => {
    return markdownContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n/g, '  \n') // Add two spaces at end of line for proper line breaks
      .replace(/align="center"/g, 'data-align="center"')
      .replace(/align="left"/g, 'data-align="left"')
      .replace(/align="right"/g, 'data-align="right"');
  }, []);

  // Track page view once on mount
  useEffect(() => {
    if (post) {
      trackPageView(post.title, `/blog/${slug}`);
    }
  }, [post, slug, trackPageView]);

  // Main data loading effect
  useEffect(() => {
    let isMounted = true;

    const loadBlogPost = async () => {
      if (!slug) {
        if (isMounted) {
          setError('Invalid blog post URL');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError('');
        }
        
        // Step 1: Get all posts from cache or fetch
        let allPosts: BlogPostData[] | null = getCachedBlogData();
        
        if (!allPosts) {
          console.log('📡 Fetching blog data...');
          const response = await fetch('/blog-data.json?t=' + Date.now());
          if (!response.ok) {
            throw new Error('Failed to load blog data');
          }
          
          const data = await response.json();
          allPosts = data.posts || [];
        }
        
        // Step 2: Find current post
        const currentPost = allPosts?.find(p => p.slug === slug);
        
        if (!currentPost) {
          if (isMounted) {
            setError('Blog post not found');
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setPost(currentPost);
          trackBlogView(slug, currentPost.title);
        }
        
        // Step 3: Load content
        const cachedContent = getCachedPostContent(slug);
        
        if (cachedContent) {
          if (isMounted) {
            setContent(cachedContent);
            setContentLoading(false);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setContentLoading(true);
          }
          
          try {
            const contentUrl = `/blog-content/${currentPost.contentFile}?t=${Date.now()}`;
            console.log('📄 Fetching content from:', contentUrl);
            const contentResponse = await fetch(contentUrl);
            
            if (!contentResponse.ok) {
              throw new Error(`Failed to load content: ${contentResponse.status}`);
            }
            
            let markdownContent = await contentResponse.text();
            markdownContent = cleanMarkdownContent(markdownContent);
            
            if (isMounted) {
              setContent(markdownContent);
              setContentLoading(false);
              setLoading(false);
            }
            
            setPostContentCache(slug, markdownContent);
          } catch (contentError) {
            console.error('Error loading content:', contentError);
            if (isMounted) {
              setContent(`# ${currentPost.title}\n\n${currentPost.excerpt}\n\n*Content could not be loaded.*`);
              setContentLoading(false);
              setLoading(false);
            }
          }
        }
        
      } catch (error) {
        console.error('Error loading blog post:', error);
        if (isMounted) {
          setError('Failed to load blog post. Please try again later.');
          setLoading(false);
        }
      }
    };

    loadBlogPost();

    return () => {
      isMounted = false;
    };
  }, [slug, getCachedBlogData, getCachedPostContent, setPostContentCache, cleanMarkdownContent, trackBlogView]);

  const handleCTAClick = useCallback(() => {
    trackButtonClick('build_resume_from_blog', 'blog_post_cta', 'blog');
    trackCTAClick('blog_post_resume_builder', 'blog_post_footer', 'blog');
  }, [trackButtonClick, trackCTAClick]);

  const handleBackToBlog = useCallback(() => {
    trackButtonClick('back_to_blog', 'blog_navigation', 'blog');
    navigate('/blog');
  }, [navigate, trackButtonClick]);

  const handleClearCache = useCallback(() => {
    if (slug) {
      localStorage.removeItem(`blog_content_${slug}`);
      window.location.reload();
    }
  }, [slug]);

  const blogCategories = useMemo(() => ({
    'resume-tips': 'Resume Writing Tips',
    'career-advice': 'Career Advice',
    'industry-specific': 'Industry Specific Guides', 
    'ats-optimization': 'ATS Optimization',
    'fresh-graduate': 'Fresh Graduate Guide',
    'job-drives': 'Job Drives & Walk-ins'
  }), []);

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-11/12 sm:w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-red-800 mb-3 sm:mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-4 sm:mb-6">{error || 'The requested blog post could not be found.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button 
                onClick={handleBackToBlog}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                ← Back to Blog
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
              >
                ↻ Reload Page
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Need help? <a href="mailto:contact@careercraft.in" className="text-blue-600 hover:text-blue-700">Contact support</a>
          </p>
        </div>
      </div>
    );
  }

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
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <nav className="mb-4 sm:mb-8">
            <button 
              onClick={handleBackToBlog}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transform group-hover:-translate-x-0.5 sm:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </button>
          </nav>
          
          <article className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1 rounded-full">
                  {blogCategories[post.category as keyof typeof blogCategories] || post.category}
                </span>
                {post.readTime && (
                  <span className="bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1 rounded-full">
                    ⏱️ {post.readTime}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Author Info */}
            <div className="flex items-start mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
              <div className="flex-shrink-0 mr-3 sm:mr-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
                  {post.author.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm sm:text-base">{post.author}</p>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">{post.authorBio}</p>
              </div>
            </div>
            
            {/* Blog Content */}
            <div className="prose prose-sm sm:prose-base md:prose-lg prose-blue max-w-none mb-6 sm:mb-10">
              {contentLoading ? (
                <div className="animate-pulse space-y-4 sm:space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-11/12"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 sm:mt-8 md:mt-10 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b text-gray-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl md:text-2xl font-bold mt-5 sm:mt-6 md:mt-8 mb-2.5 sm:mb-3 md:mb-4 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base sm:text-lg md:text-xl font-bold mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-2.5 md:mb-3 text-gray-700" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-sm sm:text-base md:text-lg font-bold mt-3 sm:mt-4 md:mt-5 mb-1.5 sm:mb-2 md:mb-2.5 text-gray-700" {...props} />,
                    p: ({node, ...props}) => <p className="my-3 sm:my-4 md:my-5 leading-relaxed text-gray-700 text-sm sm:text-base" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-3 sm:my-4 md:my-5 pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-3 sm:my-4 md:my-5 pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1.5 sm:pl-2" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-3 sm:border-l-4 border-blue-500 pl-3 sm:pl-4 md:pl-5 italic my-4 sm:my-5 md:my-6 py-1.5 sm:py-2 bg-blue-50 rounded-r text-sm sm:text-base text-gray-700" {...props} />
                    ),
                    a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 underline font-medium break-words" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                    code: ({node, className, children, ...props}: any) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg my-4 sm:my-5 md:my-6 overflow-x-auto text-xs sm:text-sm">
                          <code className="block" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4 sm:my-5 md:my-6 border rounded-lg text-sm sm:text-base">
                        <table className="min-w-full divide-y divide-gray-200" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                    th: ({node, ...props}) => <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900" {...props} />,
                    td: ({node, ...props}) => <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 border-t" {...props} />,
                    img: ({node, ...props}) => (
                      <img className="max-w-full h-auto rounded-lg my-4 sm:my-5 md:my-6 shadow-sm sm:shadow-md border mx-auto" {...props} />
                    ),
                    hr: ({node, ...props}) => <hr className="my-4 sm:my-6 md:my-8 border-gray-300" {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
            
            {/* Social Sharing */}
            <BlogSocialSharing 
              title={post.title}
              url={currentUrl}
            />
            
            {/* CTA Section */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl text-white">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Create Your Perfect Resume Today!</h3>
                <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                  Build an ATS-friendly resume that gets noticed by Indian recruiters. Free templates, no sign-up required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link 
                    to="/builder" 
                    onClick={handleCTAClick}
                    className="bg-white text-blue-700 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    🚀 Start Building Free
                  </Link>
                  <Link 
                    to="/templates"
                    className="bg-transparent border border-white text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-white/10 transition-colors text-sm sm:text-base"
                  >
                    View Templates
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-blue-200 mt-3 sm:mt-4">
                  No credit card • 100% Free • Designed for Indian Job Market
                </p>
              </div>
            </div>
            
            {/* Navigation Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <button 
                onClick={handleBackToBlog}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Blog Posts
              </button>
              <div className="text-xs sm:text-sm text-gray-500">
                Need help? <a href="mailto:contact@careercraft.in" className="text-blue-600 hover:text-blue-700">Contact us</a>
              </div>
            </div>
          </article>
          
          {/* Debug Info (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-100 rounded-lg border border-gray-300">
              <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Slug: {slug}</p>
                <p>Content File: {post.contentFile}</p>
                <p>Content Length: {content.length} chars</p>
                <div className="flex gap-2 mt-1.5">
                  <button 
                    onClick={handleClearCache}
                    className="bg-red-600 text-white px-2.5 sm:px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Clear Content Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPost;