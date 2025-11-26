// src/components/BlogSocialSharing.tsx
import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface BlogSocialSharingProps {
  title: string;
  url: string;
  description?: string;
}

const BlogSocialSharing: React.FC<BlogSocialSharingProps> = ({ 
  title, 
  url, 
  description = "Check out this amazing blog post on CareerCraft.in" 
}) => {
  const { trackButtonClick } = useGoogleAnalytics();
  
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
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-share-alt text-blue-600 mr-2"></i>
        Share this post
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <i className="fab fa-twitter"></i>
          Twitter
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fab fa-linkedin"></i>
          LinkedIn
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          <i className="fab fa-facebook"></i>
          Facebook
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <i className="fab fa-whatsapp"></i>
          WhatsApp
        </button>
        
        <button
          onClick={() => handleShare('telegram')}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <i className="fab fa-telegram"></i>
          Telegram
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          Sharing helps other job seekers discover CareerCraft.in! 🙏
        </p>
      </div>
    </div>
  );
};

export default BlogSocialSharing;