'use client';

import { useState } from 'react';
import Link from 'next/link';
import CookiePreferences from '@/components/CookiePreferences';

export default function Footer() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}
    >
      <nav
        aria-label="Footer navigation"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <a
          href="https://github.com/lusky3"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          GitHub
        </a>
        <a
          href="mailto:hello@lusk.dev"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Contact
        </a>
        <Link
          href="/privacy"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Terms
        </Link>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            padding: 0,
            textDecoration: 'underline',
          }}
          onClick={() => setShowPreferences(true)}
        >
          Cookies
        </button>
      </nav>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Lusk Technologies, Inc. All rights
        reserved.
      </p>

      {showPreferences && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <CookiePreferences
            onPreferencesChange={() => setShowPreferences(false)}
          />
        </div>
      )}
    </footer>
  );
}
