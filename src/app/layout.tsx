import type { Metadata } from 'next';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import { generateOrganizationJsonLd } from '@/lib/json-ld';
import type { SiteMetadata } from '@/lib/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

const siteMetadata: SiteMetadata = {
  siteName: 'Lusk Technologies',
  defaultTitle: 'Lusk Technologies',
  defaultDescription: 'Website template by Lusk Technologies, Inc.',
  defaultImage: `${siteUrl}/og-image.png`,
  siteUrl,
  organization: {
    name: 'Lusk Technologies, Inc.',
    url: siteUrl,
    logo: `${siteUrl}/android-chrome-512x512.png`,
  },
};

export const metadata: Metadata = {
  title: {
    default: siteMetadata.defaultTitle,
    template: `%s | ${siteMetadata.siteName}`,
  },
  description: siteMetadata.defaultDescription,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: siteMetadata.siteName,
    type: 'website',
    locale: 'en_US',
  },
};

const organizationJsonLd = generateOrganizationJsonLd(siteMetadata);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
