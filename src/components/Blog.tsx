// src/components/Blog.tsx - MOBILE OPTIMIZED VERSION (NO DEV MODE TEXT)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  'fresh-graduate': 'Fresh Graduate Guide',
  'job-drives': 'Job Drives & Walk-ins'
};

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { trackPageView, trackBlogView, trackButtonClick, trackCTAClick } = useGoogleAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView('CareerCraft Blog', '/blog');
  }, [trackPageView]);

  // Get cached blog data
  const getCachedBlogData = (): BlogPost[] | null => {
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
  };

  // Set blog data cache
  const setBlogDataCache = (data: any) => {
    try {
      localStorage.setItem('blog_data_cache', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Error setting cache:', e);
    }
  };

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        
        // Try cache first
        const cachedPosts = getCachedBlogData();
        if (cachedPosts && cachedPosts.length > 0) {
          console.log('📝 Using cached blog posts:', cachedPosts.length);
          setBlogPosts(cachedPosts);
          setFilteredPosts(cachedPosts);
          setLoading(false);
          
          // Fetch fresh data in background
          fetchFreshData();
          return;
        }
        
        // Fetch fresh data
        await fetchFreshData();
        
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    const fetchFreshData = async () => {
      try {
        const dataUrl = '/blog-data.json?t=' + Date.now();
        console.log('📡 Fetching blog data from:', dataUrl);
        
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📝 Loaded blog posts:', data.posts?.length || 0);
        
        if (!data.posts || !Array.isArray(data.posts)) {
          throw new Error('Invalid blog data format');
        }
        
        // Sort by date (newest first)
        const sortedPosts = data.posts.sort((a: BlogPost, b: BlogPost) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setBlogPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
        setBlogDataCache(data);
        setLoading(false);
        
        // Track blog loaded event
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'blog_loaded', {
            post_count: sortedPosts.length,
            event_category: 'Blog',
            event_label: 'blog_page_loaded'
          });
        }
        
      } catch (err) {
        console.error('Error in fetchFreshData:', err);
        
        // If we have ANY cached data, use it
        const cachedPosts = getCachedBlogData();
        if (cachedPosts && cachedPosts.length > 0) {
          console.log('🔄 Using stale cache as fallback');
          setBlogPosts(cachedPosts);
          setFilteredPosts(cachedPosts);
          setLoading(false);
        } else {
          setError('Failed to load blog posts. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter posts by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(blogPosts);
    } else {
      const filtered = blogPosts.filter(post => post.category === selectedCategory);
      setFilteredPosts(filtered);
    }
  }, [selectedCategory, blogPosts]);

  const handleBlogPostClick = (post: BlogPost) => {
    trackBlogView(post.slug, post.title);
    trackButtonClick(`blog_post_${post.slug}`, 'blog_grid', 'blog');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    trackButtonClick(`filter_${category}`, 'blog_categories', 'blog');
  };

  const handleClearCache = () => {
    localStorage.removeItem('blog_data_cache');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-48 sm:w-64 mx-auto mb-3 sm:mb-4"></div>
            <div className="h-4 sm:h-6 bg-gray-200 rounded w-72 sm:w-96 mx-auto"></div>
          </div>
          
          {/* Posts skeleton */}
          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm sm:shadow-lg overflow-hidden border border-gray-100 p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && blogPosts.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 md:p-8 mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800 mb-2 sm:mb-3 md:mb-4">⚠️ Blog Loading Error</h3>
            <p className="text-red-700 mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">{error}</p>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Please check that <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">/public/blog-data.json</code> exists.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Retry
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button 
                  onClick={handleClearCache}
                  className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                >
                  Clear Cache
                </button>
              )}
            </div>
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
      />

      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">CareerCraft.in Blog</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8">
              Expert advice, tips, and insights to help Indian professionals create the perfect resume and land dream jobs.
            </p>
            
            {/* E-E-A-T Trust Signals */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
              <div className="flex items-center text-gray-600 bg-green-50 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="text-green-600 mr-1.5 sm:mr-2">✓</span>
                Written by Indian Career Experts
              </div>
              <div className="flex items-center text-gray-600 bg-blue-50 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="text-blue-600 mr-1.5 sm:mr-2">✓</span>
                ATS-Optimized for Indian Companies
              </div>
              <div className="flex items-center text-gray-600 bg-purple-50 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="text-purple-600 mr-1.5 sm:mr-2">✓</span>
                Updated Weekly with Indian Market Insights
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              <button
                onClick={() => handleCategoryClick('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Posts
              </button>
              {Object.entries(blogCategories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${selectedCategory === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Count */}
          <div className="mb-4 sm:mb-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {filteredPosts.length} of {blogPosts.length} post{blogPosts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in "${blogCategories[selectedCategory as keyof typeof blogCategories]}"`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm sm:shadow-lg overflow-hidden hover:shadow-md sm:hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 sm:mb-3 gap-1.5 sm:gap-0">
                      <span 
                        className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1 rounded-full cursor-pointer hover:bg-blue-200 inline-block w-fit"
                        onClick={() => handleCategoryClick(post.category)}
                      >
                        {blogCategories[post.category as keyof typeof blogCategories] || post.category}
                      </span>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })} • {post.readTime}
                      </div>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 leading-snug sm:leading-tight">
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="hover:text-blue-600 transition-colors duration-200 block line-clamp-2"
                        onClick={() => handleBlogPostClick(post)}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">{post.excerpt}</p>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{post.author}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.authorBio}</p>
                      </div>
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center text-sm sm:text-base whitespace-nowrap"
                        onClick={() => handleBlogPostClick(post)}
                      >
                        Read more 
                        <span className="ml-0.5 sm:ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-800 mb-2 sm:mb-3 md:mb-4">No Posts Found</h3>
                <p className="text-yellow-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  No blog posts found in the "{blogCategories[selectedCategory as keyof typeof blogCategories]}" category.
                </p>
                <button 
                  onClick={() => handleCategoryClick('all')}
                  className="bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-yellow-700 text-sm sm:text-base"
                >
                  View All Posts
                </button>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-8 sm:mt-12 md:mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-100">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 md:mb-4">Ready to Create Your Professional Indian Resume?</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              Join thousands of successful Indian job seekers who landed their dream jobs with our ATS-optimized resume templates and expert guidance tailored for Indian companies.
            </p>
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              onClick={() => trackCTAClick('blog_cta_builder', 'blog_footer', 'blog')}
            >
              🚀 Start Building Your Indian Resume Now
            </Link>
          </div>

          {/* Debug Info (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Total Posts: {blogPosts.length}</p>
                <p>Filtered: {filteredPosts.length}</p>
                <p>Selected Category: {selectedCategory}</p>
                <p>Cache: {getCachedBlogData() ? 'Present' : 'None'}</p>
                <button 
                  onClick={handleClearCache}
                  className="mt-1.5 text-xs bg-gray-600 text-white px-2.5 sm:px-3 py-1 rounded hover:bg-gray-700"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;