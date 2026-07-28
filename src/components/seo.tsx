import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  noindex?: boolean;
  schemas?: Record<string, any>[];
  articleData?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
  };
}

/**
 * Strips UTM and tracking parameters from a URL to generate a clean canonical URL.
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const paramsToStrip = ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid"];
    paramsToStrip.forEach((param) => urlObj.searchParams.delete(param));
    return urlObj.toString().replace(/\/$/, ""); // Remove trailing slash
  } catch (e) {
    return url;
  }
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = "https://linqrides.in/social.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  noindex = false,
  schemas = [],
  articleData,
}: SEOProps) {
  const siteName = "linQ";
  const fullTitle = `${title} | ${siteName}`;

  // Use current window location if canonical is not provided (must be absolute)
  const canonicalUrl = canonical
    ? sanitizeUrl(canonical)
    : typeof window !== "undefined"
      ? sanitizeUrl(window.location.href)
      : "https://linqrides.in";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots & Indexing */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Theme & Apple Mobile Web App */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Article specifics */}
      {ogType === "article" && articleData?.author && <meta property="article:author" content={articleData.author} />}
      {ogType === "article" && articleData?.publishedTime && <meta property="article:published_time" content={articleData.publishedTime} />}
      {ogType === "article" && articleData?.modifiedTime && <meta property="article:modified_time" content={articleData.modifiedTime} />}

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {schemas.length > 0 && schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// Predefined Schema Builders
export const SchemaBuilders = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "linQ",
    url: "https://linqrides.in",
    logo: "https://linqrides.in/logo.svg",
    sameAs: [
      "https://twitter.com/linqrides",
      "https://instagram.com/linqrides",
    ],
  }),
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "linQ",
    url: "https://linqrides.in",
  }),
  softwareApplication: () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "linQ",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "TravelApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  }),
  searchAction: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://linqrides.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://linqrides.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }),
  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  faq: (questions: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }),
  article: (title: string, image: string, author: string, datePublished: string) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: [image],
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "linQ",
      logo: {
        "@type": "ImageObject",
        url: "https://linqrides.in/logo.svg",
      },
    },
    datePublished: datePublished,
  }),
};
