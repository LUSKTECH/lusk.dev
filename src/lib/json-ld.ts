export interface SiteMetadata {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  siteUrl: string;
  twitterHandle?: string;
  organization: {
    name: string;
    url: string;
    logo: string;
  };
}

export function generateOrganizationJsonLd(
  metadata: SiteMetadata
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: metadata.organization.name,
    url: metadata.organization.url,
    logo: metadata.organization.logo,
  };
}
