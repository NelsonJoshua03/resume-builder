import React from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const Contact: React.FC = () => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleEmailClick = (emailType: string) => {
    trackButtonClick('contact_email_click', emailType, 'contact_page');
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
            We're here to help Indian job seekers. Reach out to us for any questions about our career platform.
          </p>
          
          <div className="grid md:grid-cols-1 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Get In Touch</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-700 text-xl mb-3">Contact Support</h3>
                  <a 
                    href="mailto:contact@careercraft.in" 
                    className="text-blue-600 hover:underline text-2xl font-medium"
                    onClick={() => handleEmailClick('general_support')}
                  >
                    contact@careercraft.in
                  </a>
                  <p className="text-gray-600 mt-3">For all inquiries including resume building, platform assistance, privacy concerns, and partnerships</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Help for Indian Users</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Resume Building Issues</h3>
                  <p className="text-gray-600 text-sm">
                    Check our blog for ATS resume tips and Indian job market guidance.
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