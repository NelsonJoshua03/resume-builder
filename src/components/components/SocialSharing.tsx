// src/components/SocialSharing.tsx - UPDATED WITH DUAL ANALYTICS
import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useFirebaseAnalytics } from '../hooks/useFirebaseAnalytics';

// ✅ Updated interface with onShare prop
interface SocialSharingProps {
  resumeTitle: string;
  onShare?: (platform: string) => void; // ✅ Added optional onShare prop
}

const SocialSharing: React.FC<SocialSharingProps> = ({ resumeTitle, onShare }) => {
  const { trackButtonClick, trackSocialShare, trackCTAClick } = useGoogleAnalytics();
  const { trackSocialShare: trackFirebaseSocialShare } = useFirebaseAnalytics(); // ✅ Add Firebase hook
  
  const shareUrl = 'https://careercraft.in';
  const title = `Check out my ${resumeTitle} resume created with CareerCraft.in`;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`;
    trackButtonClick('share_facebook', 'social_sharing', 'resume');
    trackSocialShare('facebook', 'social_sharing', 'resume'); // ✅ Fixed: 3 arguments
    trackFirebaseSocialShare('facebook', 'resume', resumeTitle); // ✅ Firebase tracking
    if (onShare) onShare('facebook'); // ✅ Call parent callback
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=CareerCraft,ResumeBuilder,IndiaJobs`;
    trackButtonClick('share_twitter', 'social_sharing', 'resume');
    trackSocialShare('twitter', 'social_sharing', 'resume'); // ✅ Fixed: 3 arguments
    trackFirebaseSocialShare('twitter', 'resume', resumeTitle); // ✅ Firebase tracking
    if (onShare) onShare('twitter'); // ✅ Call parent callback
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    trackButtonClick('share_linkedin', 'social_sharing', 'resume');
    trackSocialShare('linkedin', 'social_sharing', 'resume'); // ✅ Fixed: 3 arguments
    trackFirebaseSocialShare('linkedin', 'resume', resumeTitle); // ✅ Firebase tracking
    if (onShare) onShare('linkedin'); // ✅ Call parent callback
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`;
    trackButtonClick('share_whatsapp', 'social_sharing', 'resume');
    trackSocialShare('whatsapp', 'social_sharing', 'resume'); // ✅ Fixed: 3 arguments
    trackFirebaseSocialShare('whatsapp', 'resume', resumeTitle); // ✅ Firebase tracking
    if (onShare) onShare('whatsapp'); // ✅ Call parent callback
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyReferralLink = async () => {
    const referralLink = 'https://careercraft.in?ref=friend';
    try {
      await navigator.clipboard.writeText(referralLink);
      trackButtonClick('copy_referral_link', 'social_sharing', 'resume');
      trackCTAClick('referral_link_copied', 'social_sharing', 'resume');
      trackFirebaseSocialShare('referral', 'resume', resumeTitle); // ✅ Firebase tracking
      
      // Track referral copy in Google Analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'share', {
          method: 'referral_link',
          content_type: 'resume',
          content_id: resumeTitle,
          event_category: 'Referral',
          event_label: 'referral_link_copied'
        });
      }
      
      alert('Referral link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Referral link copied to clipboard!');
    }
  };

  const trackShareIntent = (platform: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'generate_lead', {
        method: `share_${platform}`,
        event_category: 'Social Sharing',
        event_label: `resume_${platform}_share`
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Share CareerCraft with Friends
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Help your friends create professional resumes and find better jobs in India
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              shareOnFacebook();
              trackShareIntent('facebook');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fab fa-facebook text-white"></i>
            Facebook
          </button>

          <button
            onClick={() => {
              shareOnTwitter();
              trackShareIntent('twitter');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <i className="fab fa-twitter text-white"></i>
            Twitter
          </button>

          <button
            onClick={() => {
              shareOnLinkedIn();
              trackShareIntent('linkedin');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <i className="fab fa-linkedin text-white"></i>
            LinkedIn
          </button>

          <button
            onClick={() => {
              shareOnWhatsApp();
              trackShareIntent('whatsapp');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <i className="fab fa-whatsapp text-white"></i>
            WhatsApp
          </button>
        </div>

        {/* Referral Program */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Refer & Earn</h4>
          <p className="text-sm text-blue-700 mb-2">
            Share your referral link and earn rewards when friends sign up for premium features!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value="https://careercraft.in?ref=friend"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Analytics Note */}
        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
          <p className="text-xs text-green-700 flex items-center">
            <i className="fas fa-chart-bar mr-2"></i>
            Sharing helps us understand what features you love! Thank you for supporting CareerCraft. 🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialSharing;