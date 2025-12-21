// StructuredData.tsx - Reusable structured data component
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Website' | 'SoftwareApplication' | 'JobPosting' | 'Event' | 'Organization' | 'FAQPage' | 'HowTo' | 'BreadcrumbList' | 'Article';
  data: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const getSchemaByType = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };

    // Add additional properties based on type
    switch (type) {
      case 'SoftwareApplication':
        return {
          ...baseSchema,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "permissions": "browser",
          "countriesSupported": "IN",
          "areaServed": "IN",
          "countryOfOrigin": "India"
        };
      case 'JobPosting':
        return {
          ...baseSchema,
          "countryOfOrigin": "India",
          "applicantLocationRequirements": {
            "@type": "Country",
            "name": "India"
          }
        };
      case 'Event':
        return {
          ...baseSchema,
          "location": {
            ...data.location,
            "addressCountry": "IN"
          }
        };
      default:
        return baseSchema;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getSchemaByType())}
      </script>
    </Helmet>
  );
};

// Pre-configured schemas for common use cases
export const WebsiteSchema = ({ url, name, description, searchUrl }: { url: string; name: string; description: string; searchUrl?: string }) => (
  <StructuredData
    type="Website"
    data={{
      "name": name,
      "url": url,
      "description": description,
      "potentialAction": searchUrl ? {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": searchUrl
        },
        "query-input": "required name=search_term_string"
      } : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "CareerCraft India",
        "logo": "https://careercraft.in/logos/careercraft-logo-square.png"
      }
    }}
  />
);

export const OrganizationSchema = () => (
  <StructuredData
    type="Organization"
    data={{
      "name": "CareerCraft India",
      "url": "https://careercraft.in",
      "logo": "https://careercraft.in/logos/careercraft-logo-square.png",
      "description": "India's premier career platform offering free ATS-optimized resume builder and job portal services",
      "email": "contact@careercraft.in",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "sameAs": [
        "https://www.linkedin.com/in/career-coach-expert-2a47a0399",
        "https://www.instagram.com/career_craft_india/"
      ],
      "founder": {
        "@type": "Person",
        "name": "CareerCraft Team"
      },
      "foundingDate": "2024",
      "areaServed": "IN",
      "knowsAbout": [
        "Resume Writing",
        "ATS Optimization",
        "Job Search India",
        "Career Counseling",
        "Interview Preparation"
      ]
    }}
  />
);

export const FAQSchema = ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => (
  <StructuredData
    type="FAQPage"
    data={{
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }}
  />
);

export const BreadcrumbSchema = ({ items }: { items: Array<{ name: string; item: string }> }) => (
  <StructuredData
    type="BreadcrumbList"
    data={{
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.item
      }))
    }}
  />
);

export const HowToSchema = ({ name, description, steps, estimatedCost, timeRequired }: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  estimatedCost?: string;
  timeRequired?: string;
}) => (
  <StructuredData
    type="HowTo"
    data={{
      "name": name,
      "description": description,
      "step": steps.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.name,
        "text": step.text,
        "image": step.image
      })),
      "estimatedCost": estimatedCost ? {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": "0"
      } : undefined,
      "timeRequired": timeRequired
    }}
  />
);

export default StructuredData;