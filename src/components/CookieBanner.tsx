'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CookieConsentState } from '@/lib/cookie-consent';
import { classifyRegion, saveConsent, loadConsent } from '@/lib/cookie-consent';

export interface CookieBannerProps {
  geolocationEndpoint?: string;
  onConsentChange?: (state: CookieConsentState) => void;
}

const DEFAULT_GEO_ENDPOINT = 'https://ipapi.co/json/';
const CONSENT_VERSION = '1.0';

type RegionType = CookieConsentState['region'];

function buildConsentState(
  region: RegionType,
  analytics: boolean,
  marketing: boolean,
): CookieConsentState {
  return {
    essential: true,
    analytics,
    marketing,
    region,
    consentedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
}

const bannerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#1a1a2e',
  color: '#eee',
  padding: '1rem 1.5rem',
  zIndex: 9999,
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '0.75rem',
  flexWrap: 'wrap',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
  backgroundColor: '#4361ee',
  color: '#fff',
};

const secondaryBtnStyle: React.CSSProperties = {
  ...primaryBtnStyle,
  backgroundColor: 'transparent',
  border: '1px solid #888',
  color: '#ccc',
};

const linkBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#4cc9f0',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.85rem',
  padding: 0,
};

function GDPRBanner({
  onAcceptAll,
  onRejectNonEssential,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onCustomize: () => void;
}) {
  return (
    <div role="dialog" aria-label="Cookie consent" style={bannerStyle}>
      <p style={{ margin: 0 }}>
        We use cookies to improve your experience. Under GDPR, we need your
        explicit consent before setting non-essential cookies. You can accept
        all, reject non-essential cookies, or customize your preferences.
      </p>
      <div style={buttonRowStyle}>
        <button type="button" style={primaryBtnStyle} onClick={onAcceptAll}>
          Accept All
        </button>
        <button
          type="button"
          style={secondaryBtnStyle}
          onClick={onRejectNonEssential}
        >
          Reject Non-Essential
        </button>
        <button type="button" style={secondaryBtnStyle} onClick={onCustomize}>
          Customize
        </button>
      </div>
    </div>
  );
}

function CCPABanner({
  onAcceptAll,
  onRejectNonEssential,
  onDoNotSell,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onDoNotSell: () => void;
  onCustomize: () => void;
}) {
  return (
    <div role="dialog" aria-label="Cookie consent" style={bannerStyle}>
      <p style={{ margin: 0 }}>
        We use cookies and similar technologies. Under CCPA, you have the right
        to opt out of the sale of your personal information.
      </p>
      <div style={buttonRowStyle}>
        <button type="button" style={primaryBtnStyle} onClick={onAcceptAll}>
          Accept All
        </button>
        <button
          type="button"
          style={secondaryBtnStyle}
          onClick={onRejectNonEssential}
        >
          Reject Non-Essential
        </button>
        <button type="button" style={linkBtnStyle} onClick={onDoNotSell}>
          Do Not Sell My Personal Information
        </button>
        <button type="button" style={secondaryBtnStyle} onClick={onCustomize}>
          Customize
        </button>
      </div>
    </div>
  );
}

function GeneralBanner({
  onAcceptAll,
  onRejectNonEssential,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onCustomize: () => void;
}) {
  return (
    <div role="dialog" aria-label="Cookie consent" style={bannerStyle}>
      <p style={{ margin: 0 }}>
        This website uses cookies to enhance your browsing experience. You can
        accept all cookies, reject non-essential ones, or customize your
        preferences.
      </p>
      <div style={buttonRowStyle}>
        <button type="button" style={primaryBtnStyle} onClick={onAcceptAll}>
          Accept All
        </button>
        <button
          type="button"
          style={secondaryBtnStyle}
          onClick={onRejectNonEssential}
        >
          Reject Non-Essential
        </button>
        <button type="button" style={secondaryBtnStyle} onClick={onCustomize}>
          Customize
        </button>
      </div>
    </div>
  );
}

export default function CookieBanner({
  geolocationEndpoint = DEFAULT_GEO_ENDPOINT,
  onConsentChange,
}: CookieBannerProps) {
  const [region, setRegion] = useState<RegionType | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (existing) {
      onConsentChange?.(existing);
      return;
    }

    let cancelled = false;

    async function detectRegion() {
      try {
        const res = await fetch(geolocationEndpoint);
        if (!res.ok) throw new Error(`Geolocation failed: ${res.status}`);
        const data = (await res.json()) as Record<string, unknown>;

        // ipapi.co returns country_code and region_code
        const country =
          typeof data.country_code === 'string' ? data.country_code : null;
        const regionCode =
          typeof data.region_code === 'string' ? data.region_code : null;

        // Build a region identifier — e.g. "US-CA" for California
        let code: string | null = country;
        if (country === 'US' && regionCode) {
          code = `US-${regionCode}`;
        }

        if (!cancelled) {
          setRegion(classifyRegion(code));
          setVisible(true);
        }
      } catch {
        // Geolocation failed → default to most restrictive (GDPR)
        if (!cancelled) {
          setRegion('eu');
          setVisible(true);
        }
      }
    }

    void detectRegion();

    return () => {
      cancelled = true;
    };
  }, [geolocationEndpoint, onConsentChange]);

  const handleConsent = useCallback(
    (analytics: boolean, marketing: boolean) => {
      if (!region) return;
      const state = buildConsentState(region, analytics, marketing);
      saveConsent(state);
      onConsentChange?.(state);
      setVisible(false);
    },
    [region, onConsentChange],
  );

  const acceptAll = useCallback(
    () => handleConsent(true, true),
    [handleConsent],
  );

  const rejectNonEssential = useCallback(
    () => handleConsent(false, false),
    [handleConsent],
  );

  // "Do Not Sell" under CCPA: reject marketing but allow analytics
  const doNotSell = useCallback(
    () => handleConsent(true, false),
    [handleConsent],
  );

  // Customize: for now, same as reject (a full preferences modal is task 4.5)
  const customize = useCallback(
    () => handleConsent(false, false),
    [handleConsent],
  );

  if (!visible || !region) return null;

  switch (region) {
    case 'eu':
      return (
        <GDPRBanner
          onAcceptAll={acceptAll}
          onRejectNonEssential={rejectNonEssential}
          onCustomize={customize}
        />
      );
    case 'ccpa':
      return (
        <CCPABanner
          onAcceptAll={acceptAll}
          onRejectNonEssential={rejectNonEssential}
          onDoNotSell={doNotSell}
          onCustomize={customize}
        />
      );
    case 'general':
      return (
        <GeneralBanner
          onAcceptAll={acceptAll}
          onRejectNonEssential={rejectNonEssential}
          onCustomize={customize}
        />
      );
  }
}
