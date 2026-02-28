// Test server-side (no window) branches of cookie-consent.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('cookie-consent server-side branches', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
  });

  afterEach(() => {
    // Restore window
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it('saveConsent is a no-op when window is undefined', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Re-import to get fresh module with no window
    const { saveConsent } = await import('@/lib/cookie-consent');

    expect(() =>
      saveConsent({
        essential: true,
        analytics: true,
        marketing: false,
        region: 'eu',
        consentedAt: '2025-01-01T00:00:00.000Z',
        version: '1.0',
      }),
    ).not.toThrow();
  });

  it('loadConsent returns null when window is undefined', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { loadConsent } = await import('@/lib/cookie-consent');
    expect(loadConsent()).toBeNull();
  });

  it('resetConsent is a no-op when window is undefined', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { resetConsent } = await import('@/lib/cookie-consent');
    expect(() => resetConsent()).not.toThrow();
  });
});
