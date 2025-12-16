// [file name]: Blog.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';
import SEO from './SEO';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiArrowRight,
  FiRefreshCw,
  FiCheckCircle,
  FiBookOpen
} from 'react-icons/fi';

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

// Helper function to send events to both GA4 properties
const sendToBothGA = (eventName: string, params: any = {}) => {
  if (typeof window.gtag !== 'undefined') {
    // Send to first property (careercraft.in)
    window.gtag('event', eventName, {
      ...params,
      send_to: 'G-SW5M9YN8L5'
    });
    
    // Send to second property (www.careercraft.in)
    window.gtag('event', eventName, {
      ...params,
      send_to: 'G-WSKZJDJW77'
    });
  }
};

// Default blog data in case fetch fails
const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "How to Create an ATS-Friendly Resume for Indian Job Market",
    excerpt: "Learn the secrets to crafting resumes that pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, and Wipro.",
    category: "ats-optimization",
    date: "2024-01-15",
    readTime: "5 min",
    slug: "ats-friendly-resume-india",
    author: "CareerCraft Team",
    authorBio: "Indian Career Experts with 10+ years experience",
    contentFile: "ats-resume-guide.md"
  },
  {
    id: 2,
    title: "Top 10 Resume Mistakes Indian Freshers Make (And How to Fix Them)",
    excerpt: "Avoid these common mistakes that prevent freshers from getting interview calls in competitive Indian job markets.",
    category: "fresh-graduate",
    date: "2024-01-10",
    readTime: "7 min",
    slug: "fresher-resume-mistakes",
    author: "Rahul Sharma",
    authorBio: "HR Manager at Tech Mahindra",
    contentFile: "fresher-mistakes.md"
  },
  {
    id: 3,
    title: "Engineering Resume Template for Mechanical Engineers in India",
    excerpt: "Specialized resume format that highlights technical skills and projects for mechanical engineering roles in manufacturing and automotive sectors.",
    category: "industry-specific",
    date: "2024-01-05",
    readTime: "6 min",
    slug: "mechanical-engineer-resume",
    author: "Priya Patel",
    authorBio: "Career Consultant for Engineering Students",
    contentFile: "mechanical-engineer.md"
  },
  {
    id: 4,
    title: "How to Write a Cover Letter That Gets Noticed by Indian Recruiters",
    excerpt: "Indian recruiters look for specific elements in cover letters. Learn what they are and how to include them effectively.",
    category: "resume-tips",
    date: "2024-01-01",
    readTime: "8 min",
    slug: "cover-letter-india",
    author: "Ankit Verma",
    authorBio: "Talent Acquisition Lead at Amazon India",
    contentFile: "cover-letter-guide.md"
  }
];

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Google Analytics hooks
  const { trackPageView, trackBlogView, trackButtonClick, trackCTAClick } = useGoogleAnalytics();
  
  // Firebase Analytics hooks
  const {
    trackEvent,
    trackPageView: trackFirebasePageView,
    trackBlogView: trackFirebaseBlogView,
    trackButtonClick: trackFirebaseButtonClick,
    trackCTAClick: trackFirebaseCTAClick,
    trackBlogSearch: trackFirebaseBlogSearch,
    trackFunnelStep
  } = useFirebaseAnalytics();

  // Track page view on mount - DUAL TRACKING
  useEffect(() => {
    // Google Analytics
    trackPageView('CareerCraft Blog', '/blog');
    
    // Firebase Analytics
    trackFirebasePageView('/blog', 'CareerCraft Blog');
    trackEvent({
      eventName: 'blog_page_view',
      eventCategory: 'Page Views',
      eventLabel: 'blog_page_loaded',
      pagePath: '/blog',
      pageTitle: 'CareerCraft Blog',
      metadata: { 
        source: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent.substring(0, 100)
      }
    });
    
    // Track funnel entry
    trackFunnelStep('user_engagement', 'blog_page_visited', 1, {
      entry_point: 'blog_listing',
      referrer: document.referrer || 'direct',
      user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
    });

    // Track scroll depth on blog page
    const trackScrollDepth = () => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      const depthMilestones = [25, 50, 75, 90];
      
      depthMilestones.forEach(depth => {
        const key = `blog_scroll_depth_${depth}_tracked`;
        if (scrollDepth >= depth && !sessionStorage.getItem(key)) {
          trackEvent({
            eventName: 'blog_scroll_depth',
            eventCategory: 'User Engagement',
            eventLabel: `${depth}%_scroll`,
            pagePath: '/blog',
            pageTitle: 'CareerCraft Blog',
            metadata: { 
              scroll_depth: depth,
              page: '/blog',
              post_count: blogPosts.length
            }
          });
          sessionStorage.setItem(key, 'true');
        }
      });
    };

    window.addEventListener('scroll', trackScrollDepth);
    
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
    };
  }, []);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // Try primary source first (GitHub)
        const primaryUrl = 'https://raw.githubusercontent.com/NelsonJoshua03/resume-builder/main/public/blog-data.json';
        const fallbackUrl = '/blog-data.json'; // Local fallback
        
        console.log('📡 Attempting to fetch blog data from GitHub...');
        
        // Try GitHub with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          const response = await fetch(`${primaryUrl}?t=${Date.now()}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Blog data loaded from GitHub:', data.posts.length, 'posts');
            setBlogPosts(data.posts);
            setUsingFallback(false);
            
            // Track successful GitHub fetch
            trackEvent({
              eventName: 'blog_data_loaded',
              eventCategory: 'Blog',
              eventLabel: 'github_success',
              pagePath: '/blog',
              pageTitle: 'CareerCraft Blog',
              metadata: {
                source: 'github',
                post_count: data.posts.length,
                load_time: Date.now()
              }
            });
          } else {
            throw new Error(`GitHub fetch failed: ${response.status}`);
          }
        } catch (githubError) {
          console.log('GitHub fetch failed, trying local fallback:', githubError);
          
          // Try local fallback
          try {
            const localResponse = await fetch(fallbackUrl);
            if (localResponse.ok) {
              const data = await localResponse.json();
              console.log('✅ Blog data loaded from local:', data.posts.length, 'posts');
              setBlogPosts(data.posts);
              setUsingFallback(true);
              
              trackEvent({
                eventName: 'blog_data_loaded',
                eventCategory: 'Blog',
                eventLabel: 'local_fallback',
                pagePath: '/blog',
                pageTitle: 'CareerCraft Blog',
                metadata: {
                  source: 'local',
                  post_count: data.posts.length,
                  github_error: githubError instanceof Error ? githubError.message : 'Unknown'
                }
              });
            } else {
              throw new Error('Local fetch also failed');
            }
          } catch (localError) {
            console.log('Both sources failed, using default posts');
            setBlogPosts(DEFAULT_BLOG_POSTS);
            setUsingFallback(true);
            
            trackEvent({
              eventName: 'blog_data_loaded',
              eventCategory: 'Blog',
              eventLabel: 'hardcoded_fallback',
              pagePath: '/blog',
              pageTitle: 'CareerCraft Blog',
              metadata: {
                source: 'hardcoded',
                post_count: DEFAULT_BLOG_POSTS.length,
                errors: {
                  github: githubError instanceof Error ? githubError.message : 'Unknown',
                  local: localError instanceof Error ? localError.message : 'Unknown'
                }
              }
            });
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Critical error loading blog posts:', err);
        setBlogPosts(DEFAULT_BLOG_POSTS);
        setUsingFallback(true);
        setLoading(false);
        
        trackEvent({
          eventName: 'blog_load_critical_error',
          eventCategory: 'Errors',
          eventLabel: 'critical_fallback',
          pagePath: '/blog',
          pageTitle: 'CareerCraft Blog',
          metadata: {
            error: err instanceof Error ? err.message : 'Unknown error',
            fallback_used: true
          }
        });
      }
    };

    fetchBlogPosts();
  }, []);

  const handleBlogPostClick = (post: BlogPost) => {
    // Google Analytics
    trackBlogView(post.slug, post.title, post.category);
    trackButtonClick(`blog_post_${post.slug}`, 'blog_grid', 'blog');
    
    // Firebase Analytics
    trackFirebaseBlogView(post.slug, post.title, post.category);
    trackFirebaseButtonClick(`blog_post_${post.slug}`, 'blog_grid', '/blog');
    
    // Track additional event with more details
    trackEvent({
      eventName: 'blog_post_clicked',
      eventCategory: 'Blog',
      eventLabel: post.slug,
      pagePath: '/blog',
      pageTitle: 'CareerCraft Blog',
      metadata: {
        post_slug: post.slug,
        post_title: post.title,
        category: post.category,
        author: post.author,
        read_time: post.readTime,
        date: post.date,
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        using_fallback: usingFallback
      }
    });
    
    // Additional tracking for both GA4 properties
    sendToBothGA('blog_post_clicked', {
      post_slug: post.slug,
      post_title: post.title,
      category: post.category,
      event_category: 'Blog',
      event_label: post.title
    });
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    
    // Google Analytics
    trackButtonClick(`filter_${category}`, 'blog_categories', 'blog');
    
    // Firebase Analytics
    trackFirebaseButtonClick(`filter_${category}`, 'blog_categories', '/blog');
    
    // Track category filter with Firebase
    trackEvent({
      eventName: 'blog_category_filter',
      eventCategory: 'Blog',
      eventLabel: category,
      pagePath: '/blog',
      pageTitle: 'CareerCraft Blog',
      metadata: {
        category: category,
        category_name: blogCategories[category as keyof typeof blogCategories] || category,
        selected_posts_count: category === 'all' ? blogPosts.length : blogPosts.filter(p => p.category === category).length,
        action: category === 'all' ? 'show_all' : 'filter_by_category',
        using_fallback: usingFallback
      }
    });
    
    // Additional tracking for both properties
    sendToBothGA('blog_category_filter', {
      category: category,
      category_name: blogCategories[category as keyof typeof blogCategories] || category,
      event_category: 'Blog',
      event_label: category
    });
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    const results = blogPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase())
    );
    
    // Firebase Analytics - track blog search
    trackFirebaseBlogSearch(query, results.length);
    
    trackEvent({
      eventName: 'blog_search_performed',
      eventCategory: 'Blog',
      eventLabel: query,
      pagePath: '/blog',
      pageTitle: 'CareerCraft Blog',
      metadata: {
        search_query: query,
        results_count: results.length,
        search_type: 'blog_search',
        user_id: localStorage.getItem('firebase_user_id') || 'anonymous',
        using_fallback: usingFallback
      }
    });
  };

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse text-gray-600">
            <FiBookOpen className="w-8 h-8 mx-auto mb-4 text-blue-500" />
            Loading latest blog posts...
          </div>
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
              "url": "https://careercraft.in/favicon.ico"
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
            
            {usingFallback && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <FiRefreshCw className="inline-block mr-2" />
                  Using local blog data. Some content may be limited.
                </p>
              </div>
            )}
            
            {/* E-E-A-T Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center text-gray-600 bg-green-50 px-4 py-2 rounded-full">
                <FiCheckCircle className="text-green-600 mr-2" />
                Written by Indian Career Experts
              </div>
              <div className="flex items-center text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
                <FiCheckCircle className="text-blue-600 mr-2" />
                ATS-Optimized for Indian Companies
              </div>
              <div className="flex items-center text-gray-600 bg-purple-50 px-4 py-2 rounded-full">
                <FiCheckCircle className="text-purple-600 mr-2" />
                Updated Weekly with Indian Market Insights
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryFilter('all')}
              >
                All Posts
              </button>
              {Object.entries(blogCategories).map(([key, label]) => (
                <button
                  key={key}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => handleCategoryFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <input
                type="search"
                placeholder="Search blog posts..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Blog Posts Count */}
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing {filteredPosts.length} blog post{filteredPosts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in "${blogCategories[selectedCategory as keyof typeof blogCategories]}"`}
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {filteredPosts.map(post => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                onClick={() => handleBlogPostClick(post)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryFilter(post.category);
                      }}
                    >
                      {blogCategories[post.category as keyof typeof blogCategories] || post.category}
                    </span>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • 
                      <FiClock className="w-4 h-4 ml-2" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="hover:text-blue-600 transition-colors duration-200 block"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  
                  {/* Author Info */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{post.authorBio}</p>
                    </div>
                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center"
                    >
                      Read more 
                      <FiArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4">No Blog Posts Found</h3>
                <p className="text-yellow-700 mb-4">
                  {selectedCategory !== 'all'
                    ? `No posts found in "${blogCategories[selectedCategory as keyof typeof blogCategories]}". Try another category.`
                    : "No blog posts available. Please check back later."
                  }
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View All Posts
                  </button>
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
              onClick={() => {
                // Google Analytics
                trackCTAClick('blog_cta_builder', 'blog_footer', 'blog');
                
                // Firebase Analytics
                trackFirebaseCTAClick('blog_cta_builder', 'blog_footer', '/blog');
                
                // Track conversion funnel
                trackFunnelStep('user_conversion', 'blog_to_builder', 2, {
                  source: 'blog_footer_cta',
                  cta_type: 'resume_builder',
                  user_id: localStorage.getItem('firebase_user_id') || 'anonymous'
                });
                
                // Additional tracking for both properties
                sendToBothGA('blog_cta_clicked', {
                  cta_type: 'resume_builder',
                  cta_location: 'blog_footer',
                  event_category: 'Conversion',
                  event_label: 'blog_footer_cta'
                });
              }}
            >
              🚀 Start Building Your Indian Resume Now
            </Link>
          </div>

          {/* Analytics Status Indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">📊 Analytics Tracking Active</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Google Analytics: Dual tracking active (2 properties)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Firebase Analytics: {typeof window.firebaseMock !== 'undefined' ? 'Mock Mode' : 'Active'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Blog Data Source: {usingFallback ? 'Fallback' : 'GitHub'}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Tracking: Page views, clicks, category filters, searches, scroll depth
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;