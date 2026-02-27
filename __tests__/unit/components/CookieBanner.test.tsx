// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CookieBanner from '@/components/CookieBanner';
import type { CookieConsentState } from '@/lib/cookie-consent';

let container: HTMLDivElement;
let root: Root;

function geoResponse(countryCode: string, regionCode?: string) {
  return new Response(
    JSON.stringify({
      country_code: countryCode,
      region_code: regionCode ?? '',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('CookieBanner', () => {
  it('does not render when consent already exists in localStorage', async () => {
    const existing: CookieConsentState = {
      essential: true,
      analytics: true,
      marketing: false,
      region: 'eu',
      consentedAt: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('lusk-cookie-consent', JSON.stringify(existing));

    const onChange = vi.fn();

    await act(async () => {
      root.render(<CookieBanner onConsentChange={onChange} />);
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).toHaveBeenCalledWith(existing);
  });

  it('renders GDPR banner for EU region', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(geoResponse('DE'));

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    // Wait for the async geolocation fetch to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('GDPR');
    expect(dialog!.textContent).toContain('Accept All');
    expect(dialog!.textContent).toContain('Reject Non-Essential');
    expect(dialog!.textContent).toContain('Customize');
  });

  it('renders CCPA banner for California', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      geoResponse('US', 'CA'),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('CCPA');
    expect(dialog!.textContent).toContain(
      'Do Not Sell My Personal Information',
    );
  });

  it('renders general banner for non-regulated regions', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(geoResponse('BR'));

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('enhance your browsing experience');
    expect(dialog!.textContent).not.toContain('GDPR');
    expect(dialog!.textContent).not.toContain('CCPA');
  });

  it('defaults to GDPR banner when geolocation fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new Error('Network error'),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('GDPR');
  });

  it('persists consent and hides banner on Accept All', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(geoResponse('DE'));
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <CookieBanner
          geolocationEndpoint="https://test.local/geo"
          onConsentChange={onChange}
        />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const acceptBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Accept All',
    );
    expect(acceptBtn).toBeDefined();

    await act(async () => {
      acceptBtn!.click();
    });

    // Banner should be hidden
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Consent should be persisted
    const stored = JSON.parse(
      localStorage.getItem('lusk-cookie-consent')!,
    ) as CookieConsentState;
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(true);
    expect(stored.region).toBe('eu');

    // Callback should have been called
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].analytics).toBe(true);
  });

  it('persists rejection and hides banner on Reject Non-Essential', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(geoResponse('FR'));
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <CookieBanner
          geolocationEndpoint="https://test.local/geo"
          onConsentChange={onChange}
        />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const rejectBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Reject Non-Essential',
    );

    await act(async () => {
      rejectBtn!.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();

    const stored = JSON.parse(
      localStorage.getItem('lusk-cookie-consent')!,
    ) as CookieConsentState;
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
  });

  it('CCPA Do Not Sell rejects marketing but allows analytics', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      geoResponse('US', 'CA'),
    );
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <CookieBanner
          geolocationEndpoint="https://test.local/geo"
          onConsentChange={onChange}
        />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const dnsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Do Not Sell My Personal Information',
    );
    expect(dnsBtn).toBeDefined();

    await act(async () => {
      dnsBtn!.click();
    });

    const stored = JSON.parse(
      localStorage.getItem('lusk-cookie-consent')!,
    ) as CookieConsentState;
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(false);
    expect(stored.region).toBe('ccpa');
  });

  it('uses configurable geolocation endpoint', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(geoResponse('JP'));

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://custom-geo.example.com/api" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://custom-geo.example.com/api');
  });
});
