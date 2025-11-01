import React from 'react';
import SEO from './SEO';

const TermsOfService: React.FC = () => {
  return (
    <>
      <SEO
        title="Terms of Service - ResumeCVForge"
        description="ResumeCVForge terms of service. Learn about our user agreement, content policies, and service usage terms."
        keywords="terms of service, user agreement, resume builder terms, service conditions"
        canonicalUrl="https://resumecvforge.netlify.app/terms"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using ResumeCVForge, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily use ResumeCVForge for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You are responsible for the content you create using our service</li>
                <li>You must not use the service for any illegal or unauthorized purpose</li>
                <li>You must not transmit any worms or viruses or any code of a destructive nature</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Disclaimer</h2>
              <p className="text-gray-600">
                The materials on ResumeCVForge are provided on an 'as is' basis. ResumeCVForge makes no warranties, 
                expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
                implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Limitations</h2>
              <p className="text-gray-600">
                In no event shall ResumeCVForge or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
                use the materials on ResumeCVForge's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                <a href="mailto:terms@resumecvforge.com" className="text-blue-600 hover:underline">
                  terms@resumecvforge.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;