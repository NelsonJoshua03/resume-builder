import React from 'react';
import SEO from './SEO';

const CookiePolicy: React.FC = () => {
  return (
    <>
      <SEO
        title="Cookie Policy - ResumeCVForge"
        description="ResumeCVForge cookie policy. Learn how we use cookies to improve your experience on our website."
        keywords="cookie policy, website cookies, privacy cookies, resume builder cookies"
        canonicalUrl="https://resumecvforge.netlify.app/cookies"
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
                <li><strong>Essential Cookies:</strong> Required for the basic functionality of our website</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600">
                We use Google Analytics to analyze website traffic. These cookies collect information in an anonymous form.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Managing Cookies</h2>
              <p className="text-gray-600">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer 
                and you can set most browsers to prevent them from being placed.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;