import React from 'react';
import SEO from './SEO';

const Contact: React.FC = () => {
  return (
    <>
      <SEO
        title="Contact Us - ResumeCVForge"
        description="Get in touch with ResumeCVForge support team. We're here to help you with any questions about our resume builder."
        keywords="contact resume builder, support, help, customer service"
        canonicalUrl="https://resumecvforge.netlify.app/contact"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Get In Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">General Support</h3>
                  <a href="mailto:support@resumecvforge.com" className="text-blue-600 hover:underline">
                    support@resumecvforge.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Privacy Concerns</h3>
                  <a href="mailto:privacy@resumecvforge.com" className="text-blue-600 hover:underline">
                    privacy@resumecvforge.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Advertising</h3>
                  <a href="mailto:ads@resumecvforge.com" className="text-blue-600 hover:underline">
                    ads@resumecvforge.com
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Help</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Resume Building Issues:</strong> Check our <a href="/blog" className="text-blue-600 hover:underline">blog</a> for tips and tutorials.
                </p>
                <p className="text-gray-600">
                  <strong>Technical Problems:</strong> Try refreshing the page or using a different browser.
                </p>
                <p className="text-gray-600">
                  <strong>Feature Requests:</strong> We'd love to hear your suggestions for improvement.
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