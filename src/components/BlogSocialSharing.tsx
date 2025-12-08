// src/components/BlogSocialSharing.tsx - FIXED VERSION
import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface BlogSocialSharingProps {
  title: string;
  url: string;
}

const BlogSocialSharing: React.FC<BlogSocialSharingProps> = ({ 
  title, 
  url
}) => {
  const { trackButtonClick, trackSocialShare } = useGoogleAnalytics();
  
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=careercraftIN`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  };

  const handleShare = (platform: string) => {
    trackButtonClick(`share_${platform}`, 'blog_social_sharing', 'blog');
    trackSocialShare(platform);
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      trackButtonClick('copy_blog_link', 'blog_social_sharing', 'blog');
      alert('Blog post link copied to clipboard!');
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Share this post
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          Twitter
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          LinkedIn
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          Facebook
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          WhatsApp
        </button>
        
        <button
          onClick={() => handleShare('telegram')}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Telegram
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Copy Link
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          Sharing helps other job seekers discover CareerCraft.in! 🙏
        </p>
      </div>
    </div>
  );
};

export default BlogSocialSharing;