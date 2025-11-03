import React from 'react';
import SEO from './SEO';

const CookiePolicy: React.FC = () => {
  return (
    <>
      <SEO
        title="Cookie Policy - CareerCraft.in | India's Career Platform"
        description="CareerCraft.in cookie policy. Learn how we use cookies to improve your experience on our career platform for Indian users."
        keywords="cookie policy India, website cookies, privacy cookies, career platform cookies"
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
                CareerCraft.in uses cookies to enhance your career platform experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How We Use Cookies</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the basic functionality of our career platform</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how Indian job seekers interact with our website</li>
                <li><strong>Preference Cookies:</strong> Remember your resume templates and job search preferences</li>
                <li><strong>Security Cookies:</strong> Protect your data and ensure safe browsing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600">
                We use Google Analytics to analyze website traffic from Indian users. These cookies collect information in an anonymous form
                to help us improve our services for the Indian job market.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Managing Cookies</h2>
              <p className="text-gray-600">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer 
                and you can set most browsers to prevent them from being placed. However, disabling cookies may affect your 
                experience on CareerCraft.in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Compliance with Indian Regulations</h2>
              <p className="text-gray-600">
                Our cookie policy complies with Indian IT Act and data protection regulations. We respect your privacy
                and provide transparent information about our cookie usage.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;