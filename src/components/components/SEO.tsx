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