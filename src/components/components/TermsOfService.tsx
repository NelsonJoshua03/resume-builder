import React from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const TermsOfService: React.FC = () => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleEmailClick = () => {
    trackButtonClick('terms_email_click', 'terms_contact', 'terms_page');
  };

  return (
    <>
      <SEO
        title="Terms of Service - CareerCraft.in | India's Career Platform"
        description="CareerCraft.in terms of service. Learn about our user agreement, content policies, and service usage terms for Indian users. Compliant with Indian IT Act and regulations."
        keywords="terms of service India, user agreement, career platform terms, service conditions India, Indian IT Act compliance, resume builder terms"
        canonicalUrl="https://careercraft.in/terms"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using CareerCraft.in, you accept and agree to be bound by the terms and provision of this agreement.
                These terms apply to all users of the Service in India and internationally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily use CareerCraft.in for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title. You may use our services for creating resumes and 
                accessing job opportunities in compliance with Indian laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You are responsible for the content you create using our service</li>
                <li>You must not use the service for any illegal or unauthorized purpose</li>
                <li>You must not transmit any worms or viruses or any code of a destructive nature</li>
                <li>You agree to comply with all applicable Indian laws and regulations</li>
                <li>You are responsible for maintaining the confidentiality of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Disclaimer</h2>
              <p className="text-gray-600">
                The materials on CareerCraft.in are provided on an 'as is' basis. CareerCraft.in makes no warranties, 
                expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
                implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                of intellectual property or other violation of rights. We do not guarantee job placements or interview calls.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Limitations</h2>
              <p className="text-gray-600">
                In no event shall CareerCraft.in or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
                use the materials on CareerCraft.in's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Governing Law</h2>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with the laws of India and 
                you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                <a 
                  href="mailto:terms@careercraft.in" 
                  className="text-blue-600 hover:underline"
                  onClick={handleEmailClick}
                >
                  terms@careercraft.in
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