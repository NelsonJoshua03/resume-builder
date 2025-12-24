
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  structuredData?: any;
}

// Component for Breadcrumb Schema
export const BreadcrumbSchema = ({ items }: { items: Array<{ name: string; item: string }> }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Component for Organization Schema
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
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
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Component for Website Schema
export const WebsiteSchema = ({ url, name, description, searchUrl }: { 
  url: string; 
  name: string; 
  description: string; 
  searchUrl?: string 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Website",
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
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Component for FAQ Schema
export const FAQSchema = ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Main SEO Component
export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = "https://careercraft.in/logos/careercraft-logo-square.png",
  type = 'website',
  publishedTime,
  author = "CareerCraft India",
  structuredData
}: SEOProps) {
  const fullTitle = title.includes('CareerCraft.in') ? title : `${title} | CareerCraft.in - India's Career Platform`;
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? "Article" : "WebApplication",
    "name": fullTitle,
    "description": description,
    "url": canonicalUrl,
    ...(type === 'article' && {
      "headline": title,
      "datePublished": publishedTime,
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "CareerCraft India",
        "logo": {
          "@type": "ImageObject",
          "url": "https://careercraft.in/logos/careercraft-logo-square.png"
        }
      }
    }),
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "permissions": "browser",
    "areaServed": "IN",
    "countryOfOrigin": "India",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="CareerCraft.in - India's Career Platform" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content={author} />
      <meta name="language" content="EN" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={author} />
        </>
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
}
