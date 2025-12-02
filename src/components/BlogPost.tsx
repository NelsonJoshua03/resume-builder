// src/components/BlogPost.tsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
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

  // Clean markdown content function
  const cleanMarkdownContent = (content: string): string => {
    return content
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

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const urls = getBlogUrls();
        
        // Fetch post metadata
        console.log('📡 Fetching blog data from:', urls.dataUrl);
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
            const contentUrl = urls.contentUrl(currentPost.contentFile);
            console.log('📄 Fetching blog content from:', contentUrl);
            const contentResponse = await fetch(contentUrl);
            
            if (contentResponse.ok) {
              let markdownContent = await contentResponse.text();
              
              // Clean up the markdown content
              markdownContent = cleanMarkdownContent(markdownContent);
              
              // Log first few lines for debugging
              console.log('📝 Cleaned markdown preview:', markdownContent.substring(0, 500));
              
              setContent(markdownContent);
            } else {
              console.error('Content response not OK:', contentResponse.status);
              setContent('# Content Loading Error\n\n*Blog content is being updated. Please check back soon!*');
            }
          } catch (contentError) {
            console.error('Error loading blog content:', contentError);
            setContent('# Content Loading Error\n\n*Failed to load blog content. Please try again later.*');
          } finally {
            setContentLoading(false);
          }
        } else {
          setError('Blog post not found');
          console.error('Blog post not found for slug:', slug);
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse text-gray-600">Loading blog post...</div>
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
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2"
            onClick={handleBackToBlog}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to CareerCraft Blog
          </Link>
          
          <article className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                {blogCategories[post.category as keyof typeof blogCategories] || post.category}
              </span>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {post.readTime}
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {post.title}
            </h1>
            
            {/* Author Info */}
            <div className="flex items-center mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-5">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{post.author}</p>
                <p className="text-gray-600 mt-1">{post.authorBio}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Indian Career Expert
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
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
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b border-gray-200" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-10 mb-4" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-3" {...props} />
                    ),
                    h4: ({node, ...props}) => (
                      <h4 className="text-lg md:text-xl font-bold text-gray-900 mt-6 mb-2" {...props} />
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
                    
                    // Links
                    a: ({node, ...props}) => (
                      <a className="text-blue-600 hover:text-blue-700 underline font-medium" {...props} />
                    ),
                    
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
                          <code className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono text-red-700" {...props}>
                            {children}
                          </code>
                        );
                      }
                      
                      return (
                        <div className="my-8 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-3 flex justify-between items-center">
                            <span className="text-xs text-gray-300 font-mono flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              {language.toUpperCase()}
                            </span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              }}
                              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
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
                    
                    // Images
                    img: ({node, ...props}) => (
                      <img className="max-w-full h-auto rounded-xl my-8 shadow-md" {...props} />
                    ),
                    
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
            
            {/* Social Sharing */}
            <BlogSocialSharing 
              title={post.title}
              url={currentUrl}
              description={post.excerpt}
            />
            
            {/* CTA Section */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 md:p-10 text-white">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Create Your Perfect Indian Resume?</h3>
                  <p className="text-blue-100 mb-8 text-lg">
                    Join 50,000+ Indian professionals who landed their dream jobs with our ATS-optimized resume builder.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/builder" 
                      onClick={handleCTAClick}
                      className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 inline-flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Build Free ATS Resume
                    </Link>
                    <Link 
                      to="/templates" 
                      className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 inline-flex items-center justify-center gap-3 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
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
              <div className="flex justify-between">
                <Link 
                  to="/blog" 
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                  onClick={handleBackToBlog}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View All Blog Posts
                </Link>
                <div className="text-gray-500 text-sm">
                  Need help? <a href="mailto:contact@careercraft.in" className="text-blue-600 hover:text-blue-700">Contact us</a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogPost;