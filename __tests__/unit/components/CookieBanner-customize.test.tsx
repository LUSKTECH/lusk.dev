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

describe('CookieBanner Customize button', () => {
  it('Customize on GDPR banner rejects non-essential and hides banner', async () => {
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

    const customizeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Customize',
    );
    expect(customizeBtn).toBeDefined();

    await act(async () => {
      customizeBtn!.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();

    const stored = JSON.parse(
      localStorage.getItem('lusk-cookie-consent')!,
    ) as CookieConsentState;
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
  });

  it('Customize on CCPA banner rejects non-essential', async () => {
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

    const customizeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Customize',
    );

    await act(async () => {
      customizeBtn!.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('Customize on General banner rejects non-essential', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(geoResponse('BR'));

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const customizeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Customize',
    );

    await act(async () => {
      customizeBtn!.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('handles geolocation returning non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 500 }),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Should fall back to GDPR
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('GDPR');
  });
});
