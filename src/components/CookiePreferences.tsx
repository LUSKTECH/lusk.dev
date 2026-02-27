'use client';

import { useState, useCallback } from 'react';
import type { CookieConsentState } from '@/lib/cookie-consent';
import { saveConsent, loadConsent } from '@/lib/cookie-consent';

export interface CookiePreferencesProps {
  onPreferencesChange?: (state: CookieConsentState) => void;
}

const CONSENT_VERSION = '1.0';

const containerStyle: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  color: '#eee',
  padding: '1.5rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  maxWidth: '480px',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '1.1rem',
  fontWeight: 600,
};

const categoryStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0',
  borderBottom: '1px solid #333',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#999',
};

const saveBtnStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
  backgroundColor: '#4361ee',
  color: '#fff',
};

export default function CookiePreferences({
  onPreferencesChange,
}: Readonly<CookiePreferencesProps>) {
  const stored = loadConsent();
  const [analytics, setAnalytics] = useState(stored?.analytics ?? false);
  const [marketing, setMarketing] = useState(stored?.marketing ?? false);
  const [region, setRegion] = useState<CookieConsentState['region']>(
    stored?.region ?? 'general',
  );

  const handleSave = useCallback(() => {
    const state: CookieConsentState = {
      essential: true,
      analytics,
      marketing,
      region,
      consentedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    saveConsent(state);
    onPreferencesChange?.(state);
  }, [analytics, marketing, region, onPreferencesChange]);

  return (
    <section aria-label="Cookie preferences" style={containerStyle}>
      <h2 style={headingStyle}>Cookie Preferences</h2>

      <div style={categoryStyle}>
        <div style={labelStyle}>
          <span>Essential Cookies</span>
          <span style={descStyle}>Required for the site to function.</span>
        </div>
        <input
          type="checkbox"
          checked
          disabled
          aria-label="Essential cookies (always on)"
        />
      </div>

      <div style={categoryStyle}>
        <div style={labelStyle}>
          <span>Analytics Cookies</span>
          <span style={descStyle}>
            Help us understand how visitors use the site.
          </span>
        </div>
        <input
          type="checkbox"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
          aria-label="Analytics cookies"
        />
      </div>

      <div style={categoryStyle}>
        <div style={labelStyle}>
          <span>Marketing Cookies</span>
          <span style={descStyle}>
            Used to deliver relevant advertisements.
          </span>
        </div>
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          aria-label="Marketing cookies"
        />
      </div>

      <button type="button" style={saveBtnStyle} onClick={handleSave}>
        Save Preferences
      </button>
    </section>
  );
}
