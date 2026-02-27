'use client';

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  return (
    <main>
      <h1>500 — Something Went Wrong</h1>
      <p>
        We encountered an unexpected error. Please try again later or return to
        the home page.
      </p>
      <p>
        <button type="button" onClick={reset}>
          Try Again
        </button>
      </p>
      <p>
        <Link href="/">Return to Home</Link>
      </p>
    </main>
  );
}
