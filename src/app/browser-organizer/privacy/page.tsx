import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Browser Organizer — Privacy Policy',
  description: 'How the Browser Organizer browser extension handles your data.',
  // The official public URL the Chrome Web Store / Edge Add-ons listing points at.
  alternates: { canonical: 'https://lusk.dev/browser-organizer/privacy' },
};

const SECTIONS: { heading: string; body: ReactNode }[] = [
  {
    heading: 'What the extension accesses',
    body: (
      <ul>
        <li>Open tab titles and URLs.</li>
        <li>Your bookmarks.</li>
        <li>Browsing-history visit times for bookmarked URLs.</li>
        <li>
          The HTTP status of bookmarked URLs, only if you enable dead-link
          checking.
        </li>
      </ul>
    ),
  },
  {
    heading: 'What is sent to your AI provider',
    body: (
      <p>
        Open tab titles and URLs are sent to the backend you selected to compute
        tab groupings, stale-tab suggestions, bookmark recommendations, and
        typed commands; for a typed command, the text you type is sent as well.
        If you turn on &ldquo;Sort bookmarks&rdquo; (off by default), the title,
        URL, folder path and browser-assigned ID of each bookmark being sorted
        are also sent, along with your folder names and their IDs (the IDs let
        the extension map suggestions back to your bookmarks). When you reject
        the same suggestion twice, a short &ldquo;don&rsquo;t suggest&rdquo;
        note is added to later requests so it stays away; it can contain a
        cleaned link, a group name or a bookmark ID. Before sending,
        query strings and fragments are stripped, embedded credentials are
        removed, and private or loopback hosts are reduced to their origin.
        Protected folders, the Bookmarks Bar (while &ldquo;Never touch the
        Bookmarks Bar&rdquo; is on), and protected domains are never sent. This
        happens under your own AI subscription or key and is subject to that
        provider&apos;s policy.
      </p>
    ),
  },
  {
    heading: 'What stays on your device',
    body: (
      <p>
        Browsing history (only visit times are read, on your machine), dead-link
        checks (plain HTTP requests from your browser to the bookmarked sites
        themselves), grouping rules, duplicate removal, snoozing, and bookmark
        backups are processed entirely on your machine. None of that is sent to
        an AI provider. Bookmarks are sent only by &ldquo;Sort bookmarks&rdquo;,
        as described above.
      </p>
    ),
  },
  {
    heading: 'What we store',
    body: (
      <p>
        Your settings (which features are on, your protected folders and
        domains, and your chosen AI backend) are saved using Chrome&apos;s
        built-in synced storage. If you have Chrome Sync turned on and
        haven&apos;t excluded extensions from what syncs (Chrome lets you toggle
        data types like Extensions individually under Sync settings), this
        follows you to your other signed-in Chrome browsers the same way your
        bookmarks or browser preferences do — this data passes through
        Google&apos;s Chrome Sync infrastructure, not through us. With Sync off,
        or with Extensions excluded from it, it stays on-device like everything
        else below. Tab-activity timestamps, the undo log, snoozed tabs (title,
        URL, wake time), up to three automatic copies of your bookmark tree
        (taken before a run that deletes or moves bookmarks, kept 30 days), and
        — if you use the OpenAI-compatible API backend — your API key encrypted
        at rest (AES-GCM) are kept in local storage only and are never synced
        anywhere. None of it is ever sent to Lusk Technologies; we operate no
        server that stores it.
      </p>
    ),
  },
  {
    heading: 'What we never do',
    body: (
      <p>
        We never sell your data, run analytics on it, or transmit it to Lusk
        Technologies. We operate no server that receives it.
      </p>
    ),
  },
];

export default function BrowserOrganizerPrivacyPage() {
  return (
    <>
      <Navbar />
      <article className="legal-page" role="main">
        <header className="legal-header">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Browser Organizer — Privacy Policy</h1>
          <p className="legal-updated">Last updated: November 8, 2026</p>
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

          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body}
            </section>
          ))}

          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach out at{' '}
            <a href="mailto:hello@lusk.dev">hello@lusk.dev</a>.
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
