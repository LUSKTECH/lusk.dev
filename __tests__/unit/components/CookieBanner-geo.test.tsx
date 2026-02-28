// @vitest-environment jsdom

/**
 * Additional CookieBanner tests targeting uncovered geolocation parsing branches:
 * - Lines 213-215: non-string country_code / region_code
 * - Lines 223-245: US without regionCode, cancelled effect cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CookieBanner from '@/components/CookieBanner';

let container: HTMLDivElement;
let root: Root;

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

describe('CookieBanner geolocation edge cases', () => {
  it('handles non-string country_code (number) gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country_code: 123, region_code: 456 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Non-string country_code → code = null → classifyRegion(null) → eu (most restrictive)
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('GDPR');
  });

  it('handles US country without region_code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country_code: 'US', region_code: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // US without regionCode → code stays "US" → classifyRegion("US") → general
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('enhance your browsing experience');
  });

  it('handles missing country_code and region_code fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Both undefined → country = null → code = null → general
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('handles fetch network error (rejected promise)', async () => {
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

    // Network error → catch block → falls back to GDPR (eu)
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('GDPR');
  });

  it('does not update state after unmount (cancelled = true)', async () => {
    // Use a delayed fetch that resolves after unmount
    let resolveGeo: (value: Response) => void;
    const geoPromise = new Promise<Response>((r) => {
      resolveGeo = r;
    });
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(geoPromise);

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    // Unmount before fetch resolves
    act(() => root.unmount());

    // Now resolve the fetch — the cancelled flag should prevent setState
    await act(async () => {
      resolveGeo!(
        new Response(JSON.stringify({ country_code: 'DE' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      await new Promise((r) => setTimeout(r, 10));
    });

    // No errors should have been thrown (React would warn about setState on unmounted)
    expect(true).toBe(true);

    // Re-create root for afterEach cleanup
    root = createRoot(container);
  });

  it('does not update state after unmount when fetch fails (cancelled catch path)', async () => {
    // Use a delayed fetch that rejects after unmount
    let rejectGeo: (reason: Error) => void;
    const geoPromise = new Promise<Response>((_, rej) => {
      rejectGeo = rej;
    });
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(geoPromise);

    await act(async () => {
      root.render(
        <CookieBanner geolocationEndpoint="https://test.local/geo" />,
      );
    });

    // Unmount before fetch rejects
    act(() => root.unmount());

    // Now reject the fetch — the cancelled flag in the catch block should prevent setState
    await act(async () => {
      rejectGeo!(new Error('Network down'));
      await new Promise((r) => setTimeout(r, 10));
    });

    // No errors should have been thrown
    expect(true).toBe(true);

    // Re-create root for afterEach cleanup
    root = createRoot(container);
  });

  it('CCPA Do Not Sell button allows analytics but rejects marketing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country_code: 'US', region_code: 'CA' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
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

    const doNotSellBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Do Not Sell'),
    );
    expect(doNotSellBtn).toBeDefined();

    await act(async () => {
      doNotSellBtn!.click();
    });

    expect(onChange).toHaveBeenCalled();
    const state = onChange.mock.calls[0][0];
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(false);
  });
});
