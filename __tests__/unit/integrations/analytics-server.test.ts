// Test server-side (no window) branch of analytics.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initAnalytics, type AnalyticsConfig } from '@/lib/analytics';
import type { CookieConsentState } from '@/lib/cookie-consent';

function makeConsent(
  overrides: Partial<CookieConsentState> = {},
): CookieConsentState {
  return {
    essential: true,
    analytics: true,
    marketing: false,
    region: 'general',
    consentedAt: new Date().toISOString(),
    version: '1.0',
    ...overrides,
  };
}

function makeConfig(overrides: Partial<AnalyticsConfig> = {}): AnalyticsConfig {
  return {
    provider: 'google-analytics',
    trackingId: 'G-TEST',
    enabled: true,
    ...overrides,
  };
}

describe('analytics server-side branch', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
    delete (globalThis as Record<string, unknown>).__analytics_initialized;
    delete (globalThis as Record<string, unknown>).__analytics_provider;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it('does not inject script when window is undefined', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    initAnalytics(makeConfig(), makeConsent());

    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBeUndefined();
  });
});
