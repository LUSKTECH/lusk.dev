'use client';

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  return (
    <section
      className="section"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <h1 className="section-title">500 — Something Went Wrong</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          maxWidth: 480,
        }}
      >
        We encountered an unexpected error. Please try again or head back home.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="button" onClick={reset} className="hero-cta">
          Try Again
        </button>
        <Link href="/" className="about-link">
          Return Home
        </Link>
      </div>
    </section>
  );
}
