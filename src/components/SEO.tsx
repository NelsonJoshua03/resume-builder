// src/components/SEO.tsx
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
}

export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = "https://careercraft.in/og-image.png",
  type = 'website',
  publishedTime,
  author
}: SEOProps) {
  const fullTitle = title.includes('CareerCraft.in') ? title : `${title} | CareerCraft.in - India's Career Platform`;
  
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
      <meta name="twitter:site" content="@careercraftIN" />
      
      {/* Article-specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebPage',
          "headline": fullTitle,
          "description": description,
          "url": canonicalUrl,
          "image": ogImage,
          "publisher": {
            "@type": "Organization",
            "name": "CareerCraft India",
            "url": "https://careercraft.in",
            "logo": {
              "@type": "ImageObject",
              "url": "https://careercraft.in/logo.png"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            }
          },
          ...(type === 'article' && {
            "datePublished": publishedTime,
            "author": {
              "@type": "Organization",
              "name": author || "CareerCraft India"
            }
          })
        })}
      </script>
    </Helmet>
  );
}