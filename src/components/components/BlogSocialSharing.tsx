// src/components/BlogSocialSharing.tsx - UPDATED WITH GOOGLE ANALYTICS
import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { FiTwitter, FiLinkedin, FiFacebook, FiShare2, FiCopy, FiLink } from 'react-icons/fi';

// Add onShare prop to the interface
interface BlogSocialSharingProps {
  title: string;
  url: string;
  description?: string;
  onShare?: (platform: string) => void; // Add this line
}

const BlogSocialSharing: React.FC<BlogSocialSharingProps> = ({ 
  title, 
  url, 
  description = "Check out this amazing blog post on CareerCraft.in",
  onShare // Add this line
}) => {
  const { trackButtonClick, trackSocialShare } = useGoogleAnalytics();
  
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=careercraftIN`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  };

  const handleShare = (platform: string) => {
    trackButtonClick(`share_${platform}`, 'blog_social_sharing', 'blog');
    trackSocialShare(platform, 'blog_post', title);
    
    // Call the onShare prop if provided (for Firebase analytics)
    if (onShare) {
      onShare(platform);
    }
    
    // Additional Google Analytics event
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'blog_post',
        content_id: title,
        event_category: 'Social',
        event_label: `blog_${platform}_share`
      });
    }
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      trackButtonClick('copy_blog_link', 'blog_social_sharing', 'blog');
      
      // Call onShare for copy link
      if (onShare) {
        onShare('copy_link');
      }
      
      alert('Blog post link copied to clipboard!');
      
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'blog_post',
          content_id: title,
          event_category: 'Social',
          event_label: 'blog_copy_link'
        });
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Blog post link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiShare2 className="text-blue-600 mr-2" />
        Share this post
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <FiTwitter />
          Twitter
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiLinkedin />
          LinkedIn
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          <FiFacebook />
          Facebook
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiCopy />
          Copy Link
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 flex items-center">
          <FiLink className="mr-2" />
          Sharing helps other job seekers discover CareerCraft.in! 🙏
        </p>
      </div>

      {/* Analytics Tracking Info */}
      <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
        <p className="text-xs text-green-700">
          📊 Shares are tracked to improve content quality
        </p>
      </div>
    </div>
  );
};

export default BlogSocialSharing;