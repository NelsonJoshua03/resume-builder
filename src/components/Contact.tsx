import React from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const Contact: React.FC = () => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleEmailClick = (emailType: string) => {
    trackButtonClick('contact_email_click', emailType, 'contact_page');
  };

  const handleSocialClick = (platform: string) => {
    trackButtonClick('social_media_click', platform, 'contact_page');
  };

  const handleHelpLinkClick = (helpType: string) => {
    trackButtonClick('help_link_click', helpType, 'contact_page');
  };

  return (
    <>
      <SEO
        title="Contact Us - CareerCraft.in | India's Career Platform"
        description="Get in touch with CareerCraft.in support team. We're here to help Indian job seekers with resume building, job search, and career guidance."
        keywords="contact career platform India, support, help, customer service, resume help India, ATS resume support, job search assistance India"
        canonicalUrl="https://careercraft.in/contact"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact CareerCraft.in</h1>
          <p className="text-gray-600 mb-8 text-lg">
            We're here to help Indian job seekers and employers. Reach out to us for any questions about our career platform.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Get In Touch</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">General Support & Inquiries</h3>
                  <a 
                    href="mailto:contact@careercraft.in" 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEmailClick('general_support')}
                  >
                    contact@careercraft.in
                  </a>
                  <p className="text-sm text-gray-600 mt-1">For resume building, platform assistance, and general questions</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Privacy Concerns</h3>
                  <a 
                    href="mailto:privacy@careercraft.in" 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEmailClick('privacy_concerns')}
                  >
                    privacy@careercraft.in
                  </a>
                  <p className="text-sm text-gray-600 mt-1">For data protection and privacy inquiries</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Partnerships & Advertising</h3>
                  <a 
                    href="mailto:partners@careercraft.in" 
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEmailClick('partnerships')}
                  >
                    partners@careercraft.in
                  </a>
                  <p className="text-sm text-gray-600 mt-1">For companies and recruitment agencies</p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.linkedin.com/in/career-coach-expert-2a47a0399" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => handleSocialClick('linkedin')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                  <a 
                    href="https://www.instagram.com/career_craft_india/?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-pink-600 hover:text-pink-800 transition-colors"
                    onClick={() => handleSocialClick('instagram')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.017 0z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Help for Indian Users</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Resume Building Issues</h3>
                  <p className="text-gray-600 text-sm">
                    Check our <a 
                      href="/blog" 
                      className="text-blue-600 hover:underline"
                      onClick={() => handleHelpLinkClick('blog_resume_tips')}
                    >
                      blog
                    </a> for ATS resume tips and Indian job market guidance.
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Technical Problems</h3>
                  <p className="text-gray-600 text-sm">
                    Try refreshing the page, clearing cache, or using a different browser. Works best on Chrome and Firefox.
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Feature Requests</h3>
                  <p className="text-gray-600 text-sm">
                    We'd love to hear your suggestions to improve CareerCraft.in for Indian job seekers.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Response Time</h3>
                <p className="text-sm text-gray-600">
                  We typically respond within 24 hours during business days (Monday-Friday, 9 AM - 6 PM IST).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;