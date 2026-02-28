import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { generateOrganizationJsonLd } from '@/lib/json-ld';
import type { SiteMetadata } from '@/lib/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusk.dev';

const siteMetadata: SiteMetadata = {
  siteName: 'lusk.dev by Lusk Technologies, Inc.',
  defaultTitle: 'lusk.dev — Open Source Developer Tools',
  defaultDescription:
    'Open-source tools for WordPress, Docker, and the modern developer workflow. Built by Cody at Lusk Technologies, Inc.',
  defaultImage: `${siteUrl}/android-chrome-512x512.png`,
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
    title: siteMetadata.defaultTitle,
    description: siteMetadata.defaultDescription,
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.defaultTitle,
    description: siteMetadata.defaultDescription,
  },
  alternates: {
    canonical: siteUrl,
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
        <PageTransition />
        {children}
        <Footer />
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
