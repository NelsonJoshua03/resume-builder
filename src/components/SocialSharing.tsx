import React from 'react';

interface SocialSharingProps {
  resumeTitle: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({ resumeTitle }) => {
  const shareUrl = 'https://careercraft.in';
  const title = `Check out my ${resumeTitle} resume created with CareerCraft.in`;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=CareerCraft,ResumeBuilder,IndiaJobs`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyReferralLink = async () => {
    const referralLink = 'https://careercraft.in?ref=friend';
    try {
      await navigator.clipboard.writeText(referralLink);
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
            onClick={shareOnFacebook}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fab fa-facebook text-white"></i>
            Facebook
          </button>

          <button
            onClick={shareOnTwitter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <i className="fab fa-twitter text-white"></i>
            Twitter
          </button>

          <button
            onClick={shareOnLinkedIn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <i className="fab fa-linkedin text-white"></i>
            LinkedIn
          </button>

          <button
            onClick={shareOnWhatsApp}
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
      </div>
    </div>
  );
};

export default SocialSharing;