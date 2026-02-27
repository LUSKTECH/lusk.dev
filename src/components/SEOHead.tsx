export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: Record<string, unknown>;
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
}: Readonly<SEOProps>) {
  return (
    <>
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
