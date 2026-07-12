import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusk.dev';

export const metadata: Metadata = {
  title: 'Browser Organizer — Privacy Policy',
  description: 'How the Browser Organizer browser extension handles your data.',
  alternates: { canonical: `${siteUrl}/browser-organizer/privacy` },
};

export default function BrowserOrganizerPrivacyPage() {
  return (
    <>
      <Navbar />
      <article className="legal-page">
        <header className="legal-header">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Browser Organizer — Privacy Policy</h1>
          <p className="legal-updated">Last updated: July 12, 2026</p>
        </header>

        <div className="legal-body">
          <p>
            Browser Organizer is a browser extension published by Lusk
            Technologies. It runs a small helper program on your own computer,
            which invokes the AI backend you choose — a local AI CLI or an
            OpenAI-compatible API endpoint that you configure. That backend
            transmits some data to its AI provider under your own subscription
            or key. Lusk Technologies receives none of this data and operates no
            server that stores it.
          </p>

          <h2>What the extension accesses</h2>
          <ul>
            <li>Open tab titles and URLs.</li>
            <li>Your bookmarks.</li>
            <li>Browsing-history visit times for bookmarked URLs.</li>
            <li>
              The HTTP status of bookmarked URLs, only if you enable dead-link
              checking.
            </li>
          </ul>

          <h2>What is sent to your AI provider</h2>
          <p>
            Open tab titles and URLs are sent to the backend you selected to
            compute tab groupings, stale-tab suggestions, and bookmark
            recommendations. Before sending, query strings and fragments are
            stripped, embedded credentials are removed, and private or loopback
            hosts are reduced to their origin. This happens under your own AI
            subscription or key and is subject to that provider&apos;s policy.
          </p>

          <h2>What stays on your device</h2>
          <p>
            Bookmarks, browsing history, and dead-link HTTP checks are processed
            entirely on your machine and are never sent anywhere.
          </p>

          <h2>What we store</h2>
          <p>
            Your settings, tab-activity timestamps, and an undo log — all in the
            browser&apos;s local storage on your device.
          </p>

          <h2>What we never do</h2>
          <p>
            We never sell your data, run analytics on it, or transmit it to Lusk
            Technologies. We operate no server that receives it.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach out at{' '}
            <a href="mailto:hello@lusk.app">hello@lusk.app</a>.
          </p>

          <hr />
          <p>
            See also:{' '}
            <Link href="/privacy">Lusk Technologies Privacy Policy</Link> and{' '}
            <Link href="/terms">Terms of Service</Link>
          </p>
        </div>
      </article>
    </>
  );
}
