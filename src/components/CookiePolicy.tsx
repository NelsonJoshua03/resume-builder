import React from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const CookiePolicy: React.FC = () => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleExternalLinkClick = (linkType: string) => {
    trackButtonClick('cookie_policy_link', linkType, 'cookie_page');
  };

  return (
    <>
      <SEO
        title="Cookie Policy - CareerCraft.in | India's Career Platform"
        description="CareerCraft.in cookie policy. Learn how we use cookies to improve your experience on our career platform."
        keywords="cookie policy India, website cookies, privacy cookies, career platform cookies, Indian data protection"
        canonicalUrl="https://careercraft.in/cookies"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What Are Cookies</h2>
              <p className="text-gray-600">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How We Use Cookies</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the basic functionality of our career platform and resume builder</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our website</li>
                <li><strong>Preference Cookies:</strong> Remember your resume templates and job search preferences</li>
                <li><strong>Performance Cookies:</strong> Monitor website performance and improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics Cookies</h2>
              <p className="text-gray-600 mb-4">
                We use Google Analytics and Firebase Analytics to understand website usage patterns. 
                These cookies collect information in an anonymous form to help us improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Managing Cookies</h2>
              <p className="text-gray-600 mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer 
                and you can set most browsers to prevent them from being placed. However, disabling cookies may affect your 
                experience on CareerCraft.in and our resume builder functionality.
              </p>
              <p className="text-gray-600">
                To learn more about managing cookies, visit: {' '}
                <a 
                  href="https://www.aboutcookies.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  onClick={() => handleExternalLinkClick('about_cookies')}
                >
                  aboutcookies.org
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about our Cookie Policy, please contact us at:{' '}
                <a 
                  href="mailto:privacy@careercraft.in" 
                  className="text-blue-600 hover:underline"
                  onClick={() => handleExternalLinkClick('privacy_email')}
                >
                  privacy@careercraft.in
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;