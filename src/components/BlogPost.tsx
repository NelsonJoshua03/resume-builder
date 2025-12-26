
// src/components/BlogPost.tsx - COMPLETE WITH FIREBASE ANALYTICS
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import BlogSocialSharing from './BlogSocialSharing';
import SEO from './SEO';

// Import React Icons
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiCode,
  FiCopy,
  FiFileText,
  FiPlus,
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiShare2,
  FiMail,
  FiArrowRight,
  FiExternalLink
} from 'react-icons/fi';

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

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  node?: any;
  'data-align'?: string;
  'data-center'?: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Move helper functions outside component to prevent recreation
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

// Move cleanMarkdownContent outside to prevent recreation
const cleanMarkdownContent = (content: string): string => {
  return content
    // Remove any image markdown syntax
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove HTML img tags
    .replace(/<img[^>]*>/g, '')
    // Fix tables with pipe characters
    .replace(/(\|[^\n]+\|\n)(?=\|)/g, (match) => {
      const rows = match.split('\n').filter(row => row.trim());
      if (rows.length >= 2) {
        const header = rows[0];
        const separator = rows[1];
        if (separator.includes('-') || separator.includes('=')) {
          return match;
        }
        const columns = header.split('|').filter(col => col.trim() !== '');
        const separatorRow = `| ${columns.map(() => '---').join(' | ')} |`;
        return `${header}\n${separatorRow}\n`;
      }
      return match;
    })
    // Fix code block language specifiers
    .replace(/```(\w+)?\n/g, '```$1\n')
    // Fix common formatting issues
    .replace(/\n{3,}/g, '\n\n')
    // Fix asterisk lists
    .replace(/^\*\s+/gm, '- ')
    // Ensure proper spacing for headings
    .replace(/^(#{1,6})\s*([^\n]+)/gm, '$1 $2')
    // Fix email addresses
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<$1>')
    // Convert align="center" to data-align="center" for ReactMarkdown
    .replace(/align="center"/g, 'data-align="center"')
    .replace(/align="left"/g, 'data-align="left"')
    .replace(/align="right"/g, 'data-align="right"');
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Google Analytics hooks
  const { trackBlogView, trackButtonClick, trackPageView, trackCTAClick, trackBlogPostEngagement } = useGoogleAnalytics();
  
  // Firebase Analytics hooks
  const {
    trackEvent,
    trackPageView: trackFirebasePageView,
    trackBlogView: trackFirebaseBlogView,
    trackButtonClick: trackFirebaseButtonClick,
    trackCTAClick: trackFirebaseCTAClick,
    trackSocialShare: trackFirebaseSocialShare,
    trackFunnelStep,
    trackUserFlow
  } = useFirebaseAnalytics();
  
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const readStartTime = useRef<number>(0);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const rafId = useRef<number>(0);
  
  // Refs to prevent multiple tracking calls
  const hasTrackedPageView = useRef(false);
  const hasTrackedEngagement = useRef(false);
  const scrollMilestones = useRef<Set<number>>(new Set());

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (!post) return;
    
    if (rafId.current) {
      window.cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = window.requestAnimationFrame(() => {
      const article = document.querySelector('article');
      if (!article) return;
      
      const articleHeight = article.clientHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const articleTop = article.offsetTop;
      const scrollPosition = scrollTop - articleTop;
      
      if (scrollPosition >= 0) {
        const progress = Math.min(100, Math.round((scrollPosition / articleHeight) * 100));
        setReadingProgress(progress);
        
        // Track progress milestones - only once each
        const milestones = [25, 50, 75, 90, 100];
        milestones.forEach(milestone => {
          if (progress >= milestone && !scrollMilestones.current.has(milestone)) {
            // Google Analytics
            trackBlogPostEngagement(post.slug, post.title, `${milestone}_percent_read`);
            
            // Firebase Analytics
            trackEvent({
              eventName: 'blog_post_scroll_milestone',
              eventCategory: 'Blog Engagement',
              eventLabel: `${milestone}%_read`,
              pagePath: `/blog/${post.slug}`,
              pageTitle: post.title,
              eventValue: milestone,
              metadata: {
                post_slug: post.slug,
                post_title: post.title,
                scroll_percentage: milestone,
                read_time_minutes: parseInt(post.readTime) || 0,
                category: post.category,
                user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
              }
            });
            
            scrollMilestones.current.add(milestone);
          }
        });
      }
    });
  }, [post, trackBlogPostEngagement, trackEvent]);

  // Track reading progress
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  // Main effect for fetching blog data
  useEffect(() => {
    let isMounted = true;
    
    const fetchPostData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError('');
        setPost(null);
        setContent('');
        
        const urls = getBlogUrls();
        
        // Fetch post metadata
        console.log('📡 Fetching blog data for:', slug);
        const response = await fetch(urls.dataUrl);
        
        if (!response.ok) {
          throw new Error('Failed to load blog post');
        }
        
        const data = await response.json();
        const currentPost = data.posts.find((p: BlogPostData) => p.slug === slug);
        
        if (!currentPost) {
          throw new Error('Blog post not found');
        }
        
        if (!isMounted) return;
        
        setPost(currentPost);
        
        // Track page view - only once
        if (!hasTrackedPageView.current) {
          // Google Analytics
          trackBlogView(slug, currentPost.title, currentPost.category);
          trackPageView(currentPost.title, `/blog/${slug}`);
          
          // Firebase Analytics
          trackFirebasePageView(`/blog/${slug}`, currentPost.title);
          trackFirebaseBlogView(slug, currentPost.title, currentPost.category);
          
          trackEvent({
            eventName: 'blog_post_viewed',
            eventCategory: 'Blog',
            eventLabel: slug,
            pagePath: `/blog/${slug}`,
            pageTitle: currentPost.title,
            metadata: {
              post_slug: slug,
              post_title: currentPost.title,
              category: currentPost.category,
              author: currentPost.author,
              read_time: currentPost.readTime,
              date: currentPost.date,
              user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
              referrer: document.referrer || 'direct',
              timestamp: new Date().toISOString()
            }
          });
          
          // Track funnel step
          trackFunnelStep('blog_engagement', 'post_viewed', 1, {
            post_slug: slug,
            post_title: currentPost.title,
            category: currentPost.category,
            source: document.referrer || 'direct'
          });
          
          hasTrackedPageView.current = true;
        }
        
        // Start tracking read time
        readStartTime.current = Date.now();
        
        // Fetch markdown content
        setContentLoading(true);
        try {
          const contentUrl = urls.contentUrl(currentPost.contentFile);
          console.log('📄 Fetching blog content from:', contentUrl);
          const contentResponse = await fetch(contentUrl);
          
          if (contentResponse.ok) {
            let markdownContent = await contentResponse.text();
            
            // Clean up the markdown content
            markdownContent = cleanMarkdownContent(markdownContent);
            
            // Log first few lines for debugging
            console.log('📝 Cleaned markdown preview:', markdownContent.substring(0, 500));
            
            if (isMounted) {
              setContent(markdownContent);
            }
          } else {
            console.error('Content response not OK:', contentResponse.status);
            if (isMounted) {
              setContent('# Content Loading Error\n\n*Blog content is being updated. Please check back soon!*');
            }
          }
        } catch (contentError) {
          console.error('Error loading blog content:', contentError);
          if (isMounted) {
            setContent('# Content Loading Error\n\n*Failed to load blog content. Please try again later.*');
          }
        } finally {
          if (isMounted) {
            setContentLoading(false);
          }
        }
        
      } catch (err) {
        console.error('Error loading blog post:', err);
        if (isMounted) {
          setError('Failed to load blog post. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Reset tracking flags when slug changes
    hasTrackedPageView.current = false;
    hasTrackedEngagement.current = false;
    scrollMilestones.current.clear();
    
    fetchPostData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Track read time when component unmounts
  useEffect(() => {
    return () => {
      if (readStartTime.current > 0 && post) {
        const readDuration = Math.round((Date.now() - readStartTime.current) / 1000);
        
        // Only track if user spent reasonable time
        if (readDuration > 5) {
          // Google Analytics
          trackBlogPostEngagement(post.slug, post.title, 'post_closed', readDuration);
          
          // Firebase Analytics
          trackEvent({
            eventName: 'blog_post_read_complete',
            eventCategory: 'Blog Engagement',
            eventLabel: post.slug,
            pagePath: `/blog/${post.slug}`,
            pageTitle: post.title,
            eventValue: readDuration,
            metadata: {
              post_slug: post.slug,
              post_title: post.title,
              read_duration_seconds: readDuration,
              max_scroll_depth: Math.max(...Array.from(scrollMilestones.current)),
              scroll_milestones_reached: scrollMilestones.current.size,
              user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
              completion_percentage: readingProgress
            }
          });
        }
      }
    };
  }, [post, readingProgress]);

  const handleCTAClick = () => {
    // Google Analytics
    trackButtonClick('build_resume_from_blog', 'blog_post_cta', 'blog');
    trackCTAClick('blog_post_resume_builder', 'blog_post_footer', 'blog');
    
    // Firebase Analytics
    trackFirebaseButtonClick('build_resume_from_blog', 'blog_post_cta', `/blog/${slug}`);
    trackFirebaseCTAClick('blog_post_resume_builder', 'blog_post_footer', `/blog/${slug}`);
    
    trackFunnelStep('blog_conversion', 'cta_clicked', 2, {
      post_slug: slug,
      post_title: post?.title || '',
      cta_location: 'blog_post_footer',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
    });
  };

  const handleBackToBlog = () => {
    // Google Analytics
    trackButtonClick('back_to_blog', 'blog_navigation', 'blog');
    
    // Firebase Analytics
    trackFirebaseButtonClick('back_to_blog', 'blog_navigation', `/blog/${slug}`);
    trackUserFlow('blog_post', 'blog_listing', 'back_to_blog');
  };

  // Track when user clicks on internal links in the blog post
  const handleInternalLinkClick = (linkText: string, url: string) => {
    // Google Analytics
    trackButtonClick(`blog_link_${linkText}`, 'blog_content', 'blog');
    
    // Firebase Analytics
    trackFirebaseButtonClick(`blog_link_${linkText}`, 'blog_content', `/blog/${slug}`);
    
    trackEvent({
      eventName: 'blog_internal_link_clicked',
      eventCategory: 'Blog Engagement',
      eventLabel: linkText,
      pagePath: `/blog/${slug}`,
      pageTitle: post?.title || '',
      metadata: {
        post_slug: slug,
        link_text: linkText,
        link_url: url,
        link_type: url.startsWith('/') ? 'internal' : 'external',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    });
  };

  const handleShare = (platform: string) => {
    // Firebase Analytics
    trackFirebaseSocialShare(platform, 'blog_post', slug || '');
    
    trackEvent({
      eventName: 'blog_post_shared',
      eventCategory: 'Social Sharing',
      eventLabel: platform,
      pagePath: `/blog/${slug}`,
      pageTitle: post?.title || '',
      metadata: {
        post_slug: slug,
        post_title: post?.title || '',
        platform: platform,
        share_url: window.location.href,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    });
  };

  const handleCopyCode = (language: string) => {
    trackEvent({
      eventName: 'code_block_copied',
      eventCategory: 'Blog Interaction',
      eventLabel: language,
      pagePath: `/blog/${slug}`,
      pageTitle: post?.title || '',
      metadata: {
        post_slug: slug,
        language: language,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse text-gray-600">
            <FiBookOpen className="w-8 h-8 mx-auto mb-4 text-blue-500" />
            Loading blog post...
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
            onClick={handleBackToBlog}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Blog
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
    'fresh-graduate': 'Fresh Graduate Guide',
    'job-drives': 'Job Drives & Opportunities'
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
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "datePublished": publishedTime,
          "dateModified": publishedTime,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "CareerCraft India"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
          }
        }}
      />

      {/* Reading Progress Bar */}
      {readingProgress > 0 && readingProgress < 100 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
            onClick={handleBackToBlog}
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to CareerCraft Blog
          </Link>
          
          <article className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                {blogCategories[post.category as keyof typeof blogCategories] || post.category}
              </span>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • 
                <FiClock className="w-4 h-4 ml-2" />
                {post.readTime}
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {post.title}
            </h1>
            
            {/* Author Info */}
            <div 
              className="flex items-center mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
              onClick={() => {
                trackEvent({
                  eventName: 'author_section_clicked',
                  eventCategory: 'Blog Interaction',
                  eventLabel: 'author_info',
                  pagePath: `/blog/${slug}`,
                  pageTitle: post.title,
                  metadata: {
                    post_slug: slug,
                    author_name: post.author,
                    user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                  }
                });
              }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-5">
                <FiUser className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{post.author}</p>
                <p className="text-gray-600 mt-1">{post.authorBio}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    Indian Career Expert
                  </span>
                  <span className="flex items-center gap-1">
                    <FiBriefcase className="w-4 h-4" />
                    10+ Years Experience
                  </span>
                </div>
              </div>
            </div>
            
            {/* Blog Content - Using Tailwind Typography */}
            <div className="prose prose-lg prose-blue max-w-none text-gray-800">
              {contentLoading ? (
                <div className="animate-pulse space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Headings
                    h1: ({node, ...props}) => (
                      <h1 
                        className="text-3xl md:text-4xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b border-gray-200" 
                        {...props} 
                      />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 
                        className="text-2xl md:text-3xl font-bold text-gray-900 mt-10 mb-4" 
                        {...props} 
                      />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 
                        className="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-3" 
                        {...props} 
                      />
                    ),
                    h4: ({node, ...props}) => (
                      <h4 
                        className="text-lg md:text-xl font-bold text-gray-900 mt-6 mb-2" 
                        {...props} 
                      />
                    ),
                    
                    // Paragraphs
                    p: ({node, ...props}) => (
                      <p className="my-6 leading-relaxed text-gray-700" {...props} />
                    ),
                    
                    // Lists
                    ul: ({node, ...props}) => (
                      <ul className="my-6 pl-6 space-y-3" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="my-6 pl-6 space-y-3" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="pl-2" {...props} />
                    ),
                    
                    // Blockquotes
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-6 italic my-8 py-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-r-lg" {...props} />
                    ),
                    
                    // Links - Track internal link clicks
                    a: ({node, children, ...props}) => {
                      const isInternalLink = props.href?.startsWith('/');
                      return (
                        <a 
                          className="text-blue-600 hover:text-blue-700 underline font-medium inline-flex items-center gap-1"
                          onClick={(e) => {
                            handleInternalLinkClick(children?.toString() || 'unknown', props.href || '');
                          }}
                          target={props.href?.startsWith('http') ? '_blank' : undefined}
                          rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          {...props}
                        >
                          {children}
                          {props.href?.startsWith('http') && <FiExternalLink className="w-3 h-3" />}
                        </a>
                      );
                    },
                    
                    // Tables
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-8 border border-gray-200 rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => (
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100" {...props} />
                    ),
                    tbody: ({node, ...props}) => (
                      <tbody className="divide-y divide-gray-200" {...props} />
                    ),
                    tr: ({node, ...props}) => (
                      <tr className="hover:bg-gray-50 transition-colors duration-150" {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-6 py-4 text-sm text-gray-800 border-t border-gray-200" {...props} />
                    ),
                    
                    // Code blocks
                    code: ({node, inline, className, children, ...props}: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text';
                      
                      if (inline) {
                        return (
                          <code 
                            className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono text-red-700 cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => handleCopyCode('inline')}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      
                      return (
                        <div className="my-8 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-3 flex justify-between items-center">
                            <span className="text-xs text-gray-300 font-mono flex items-center gap-2">
                              <FiCode className="w-4 h-4" />
                              {language.toUpperCase()}
                            </span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                handleCopyCode(language);
                                trackFirebaseButtonClick('copy_code_block', 'blog_content', `/blog/${slug}`);
                              }}
                              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <FiCopy className="w-3 h-3" />
                              Copy
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus as SyntaxHighlighterProps['style']}
                            language={language}
                            PreTag="div"
                            className="!m-0 !bg-gray-900 text-sm"
                            showLineNumbers={true}
                            lineNumberStyle={{ color: '#6b7280', minWidth: '3em' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                    
                    // Horizontal rule
                    hr: ({node, ...props}) => (
                      <hr className="my-12 border-t-2 border-gray-200" {...props} />
                    ),
                    
                    // Image replacement - Show content boxes instead
                    img: ({node, ...props}) => {
                      const altText = props.alt || "Content box";
                      return (
                        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center mb-3">
                            <FiCheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-blue-800">Key Insight</span>
                          </div>
                          <p className="text-gray-700 italic">
                            {altText === "Blog content" 
                              ? "This section contains important career advice or resume tip."
                              : altText}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            📝 CareerCraft Expert Tip
                          </p>
                        </div>
                      );
                    },
                    
                    // Div elements with custom handling
                    div: ({node, children, ...props}: DivProps) => {
                      const { 'data-align': dataAlign, className, style, ...restProps } = props;
                      
                      // Handle center alignment
                      if (dataAlign === 'center' || className?.includes('text-center')) {
                        return (
                          <div className="text-center my-6" {...restProps}>
                            {children}
                          </div>
                        );
                      }
                      
                      // Handle special styled divs
                      if (className?.includes('bg-') || style?.backgroundColor) {
                        return (
                          <div className="my-8 p-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100" {...restProps}>
                            {children}
                          </div>
                        );
                      }
                      
                      return <div {...restProps}>{children}</div>;
                    },
                    
                    // Strong/Bold
                    strong: ({node, ...props}) => (
                      <strong className="font-bold text-gray-900" {...props} />
                    ),
                    
                    // Emphasis/Italic
                    em: ({node, ...props}) => (
                      <em className="italic text-gray-700" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
            
            {/* Reading Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Reading progress: {readingProgress}%</span>
                <span>{post.readTime} read time</span>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 mt-2">
                  📊 Scroll milestones tracked: {Array.from(scrollMilestones.current).join(', ')}
                </div>
              )}
            </div>
            
            {/* Social Sharing */}
            <BlogSocialSharing 
              title={post.title}
              url={currentUrl}
              description={post.excerpt}
              onShare={handleShare}
            />
            
            {/* CTA Section */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 md:p-10 text-white">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiFileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Create Your Perfect Indian Resume?</h3>
                  <p className="text-blue-100 mb-8 text-lg">
                    Join 50,000+ Indian professionals who landed their dream jobs with our ATS-optimized resume builder.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/free-resume-builder" 
                      onClick={handleCTAClick}
                      className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 inline-flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      <FiPlus className="w-5 h-5" />
                      Build Free ATS Resume
                    </Link>
                    <Link 
                      to="/templates" 
                      onClick={() => {
                        trackFirebaseButtonClick('view_templates_from_blog', 'blog_post_cta', `/blog/${slug}`);
                        trackUserFlow('blog_post', 'template_gallery', 'view_templates');
                      }}
                      className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 inline-flex items-center justify-center gap-3 transition-all duration-200"
                    >
                      <FiGrid className="w-5 h-5" />
                      View Templates
                    </Link>
                  </div>
                  <p className="text-sm text-blue-200 mt-6">
                    No credit card required • 100% Free • Designed for Indian Companies
                  </p>
                </div>
              </div>
            </div>
            
            {/* Related Posts or Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link 
                  to="/blog" 
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                  onClick={handleBackToBlog}
                >
                  <FiArrowLeft className="w-4 h-4" />
                  View All Blog Posts
                </Link>
                <div className="text-gray-500 text-sm flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  Need help? <a 
                    href="mailto:contact@careercraft.in" 
                    className="text-blue-600 hover:text-blue-700 ml-1"
                    onClick={() => {
                      trackEvent({
                        eventName: 'contact_clicked',
                        eventCategory: 'Blog Interaction',
                        eventLabel: 'email_contact',
                        pagePath: `/blog/${slug}`,
                        pageTitle: post.title,
                        metadata: {
                          post_slug: slug,
                          contact_method: 'email',
                          user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                        }
                      });
                    }}
                  >
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </article>
          
          {/* Analytics Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">📊 Blog Post Analytics Tracking</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Page view tracked: {hasTrackedPageView.current ? '✅' : '❌'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Reading progress: {readingProgress}%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Scroll milestones: {scrollMilestones.current.size}/5 reached</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Dual tracking: Google Analytics + Firebase</span>
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
