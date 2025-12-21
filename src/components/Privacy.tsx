import React from 'react';
import SEO from './SEO';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const Privacy: React.FC = () => {
  const { trackButtonClick } = useGoogleAnalytics();

  const handleEmailClick = (emailType: string) => {
    trackButtonClick('privacy_email_click', emailType, 'privacy_page');
  };

  return (
    <>
      <SEO
        title="Privacy Policy - CareerCraft.in | India's Career Platform"
        description="CareerCraft.in privacy policy. We respect your privacy and are transparent about data usage. Your resume information is processed locally on your device."
        keywords="privacy policy India, data protection, privacy-focused career platform, Indian data laws, IT Act compliance, resume privacy India"
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
                CareerCraft.in is committed to protecting your privacy. We designed our career platform with user privacy in mind:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>We do not require registration or personal accounts</li>
                <li>Your resume data is processed locally in your browser</li>
                <li>We do not store your resume information on our servers</li>
                <li>We collect anonymous usage statistics to improve our service</li>
                <li>We comply with Indian data protection regulations and IT Act</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Information</h2>
              <p className="text-gray-600">
                Any information you enter into the resume builder remains on your device. 
                We use anonymous analytics to understand how users interact with our platform 
                and make improvements to the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Analytics & Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use analytics services to understand how our website is being used:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Google Analytics (anonymous usage data)</li>
                <li>Firebase Analytics (user interaction tracking)</li>
                <li>Page view tracking to improve content</li>
                <li>Feature usage analytics for service improvement</li>
              </ul>
              <p className="text-gray-600 mt-4">
                All analytics data is aggregated and anonymized. We do not collect personally identifiable information through analytics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Your Data Rights</h2>
              <p className="text-gray-600">
                You maintain full control over your information. Since we don't store your personal data on our servers, 
                you can clear your browser data at any time to remove all information.
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Children's Privacy</h2>
              <p className="text-gray-600">
                Our services are not directed to individuals under 13. We do not knowingly collect personal 
                information from children under 13. If we become aware that a child under 13 has provided 
                us with personal information, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a 
                  href="mailto:privacy@careercraft.in" 
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEmailClick('privacy_general')}
                >
                  privacy@careercraft.in
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Grievance Officer</h2>
              <p className="text-gray-600">
                As required under Indian IT Act, we have appointed a Grievance Officer. Contact at:
                <br />
                <a 
                  href="mailto:grievance@careercraft.in" 
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEmailClick('grievance_officer')}
                >
                  grievance@careercraft.in
                </a>
                <br />
                Response time: Within 24 hours on working days
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Updates to Privacy Policy</h2>
              <p className="text-gray-600">
                We may update this privacy policy to reflect changes in data protection laws or our services.
                We will notify users of any material changes through our platform. Continued use of CareerCraft.in
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;