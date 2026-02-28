import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusk.dev';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Lusk Technologies collects, uses, and protects your personal data.',
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <article className="legal-page">
        <header className="legal-header">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: February 28, 2026</p>
        </header>

        <div className="legal-body">
          <p>
            This Privacy Policy describes how Lusk Technologies, Inc.
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
            and shares your personal information when you visit lusk.dev.
          </p>

          <h2>Data Collection</h2>
          <p>We may collect the following when you use our website:</p>
          <ul>
            <li>
              Personal information you provide directly (e.g., email address)
              when contacting us.
            </li>
            <li>
              Usage data collected automatically, such as IP address, browser
              type, pages visited, and time spent on the site.
            </li>
            <li>
              Cookies and similar tracking technologies, subject to your consent
              preferences.
            </li>
          </ul>

          <h2>Data Usage</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our website.</li>
            <li>Respond to your inquiries and communicate with you.</li>
            <li>Analyze usage patterns to enhance user experience.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2>Third-Party Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with
            service providers who assist in operating our website (e.g.,
            analytics, hosting), when required by law, or to protect the rights
            and safety of Lusk Technologies and its users.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, delete, or port your personal data, restrict processing,
            withdraw consent, or opt out of the sale of personal information.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach out at{' '}
            <a href="mailto:hello@lusk.dev">hello@lusk.dev</a>.
          </p>

          <hr />
          <p>
            See also: <Link href="/terms">Terms of Service</Link>
          </p>
        </div>
      </article>
    </>
  );
}
