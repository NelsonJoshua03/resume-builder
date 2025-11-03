// src/components/Privacy.tsx
import React from 'react';
import SEO from './SEO';

const Privacy: React.FC = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - CareerCraft.in | India's Career Platform"
        description="CareerCraft.in privacy policy. We respect your privacy and do not store your personal data. Your resume information stays on your device. Compliant with Indian data protection laws."
        keywords="privacy policy India, data protection, privacy-focused career platform, no data storage, Indian data laws"
        canonicalUrl="https://careercraft.in/privacy"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                CareerCraft.in is committed to protecting your privacy. We designed our career platform with privacy in mind for Indian users:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>We do not require registration or personal accounts</li>
                <li>Your resume data is processed locally in your browser</li>
                <li>We do not store your resume information on our servers</li>
                <li>We only collect anonymous usage statistics to improve our service for Indian job seekers</li>
                <li>We comply with Indian data protection regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Information</h2>
              <p className="text-gray-600">
                Any information you enter into the resume builder remains on your device. 
                We use anonymous analytics to understand how Indian users interact with our platform 
                and make improvements to the user experience specifically for the Indian job market.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Third-Party Services</h2>
              <p className="text-gray-600 mb-4">
                We use the following third-party services that comply with Indian data protection standards:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Google Analytics (anonymous usage data for Indian traffic)</li>
                <li>Netlify (secure hosting services)</li>
                <li>Font Awesome (icons and UI elements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Your Rights Under Indian Law</h2>
              <p className="text-gray-600">
                As an Indian user, you have the right to access, correct, or delete any personal information. 
                Since we don't store your personal data on our servers, you maintain full control 
                over your information at all times, in compliance with Indian IT Act and data protection principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Retention</h2>
              <p className="text-gray-600">
                We do not retain your personal resume data. Your information is temporarily processed in your browser
                and is cleared when you close the tab or refresh the page. Anonymous analytics data is retained for
                26 months as per standard practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@careercraft.in" className="text-blue-600 hover:underline">
                  privacy@careercraft.in
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Data Protection Officer</h2>
              <p className="text-gray-600">
                For any privacy-specific concerns from Indian users, please contact our Data Protection Officer at:
                <br />
                <a href="mailto:dpo@careercraft.in" className="text-blue-600 hover:underline">
                  dpo@careercraft.in
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Updates to Privacy Policy</h2>
              <p className="text-gray-600">
                We may update this privacy policy to reflect changes in Indian data protection laws or our services.
                We will notify users of any material changes through our platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;