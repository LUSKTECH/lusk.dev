import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusk.dev';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Review the terms and conditions for using the Lusk Technologies website.',
  alternates: { canonical: `${siteUrl}/terms` },
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <article className="legal-page">
        <header className="legal-header">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: February 28, 2026</p>
        </header>

        <div className="legal-body">
          <p>
            These Terms of Service govern your use of the Lusk Technologies,
            Inc. website. By accessing lusk.dev, you agree to be bound by these
            terms.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website in any way that violates applicable law.</li>
            <li>
              Attempt to gain unauthorized access to any part of the website or
              its systems.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              website.
            </li>
            <li>
              Transmit material that is defamatory, obscene, or otherwise
              objectionable.
            </li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            All content, features, and functionality on this website are the
            property of Lusk Technologies, Inc. or its licensors and are
            protected by copyright, trademark, and other intellectual property
            laws. You may not reproduce, distribute, or create derivative works
            without prior written consent.
          </p>

          <h2>Open Source Projects</h2>
          <p>
            Projects hosted on GitHub under the lusky3 account are licensed
            under their respective open-source licenses (typically MIT). Those
            licenses govern your use of the project code, not these Terms.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Lusk Technologies shall not
            be liable for any indirect, incidental, special, or consequential
            damages arising from your use of the website. The website is
            provided &quot;as is&quot; without warranties of any kind.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Reach out at{' '}
            <a href="mailto:hello@lusk.dev">hello@lusk.dev</a>.
          </p>

          <hr />
          <p>
            See also: <Link href="/privacy">Privacy Policy</Link>
          </p>
        </div>
      </article>
    </>
  );
}
