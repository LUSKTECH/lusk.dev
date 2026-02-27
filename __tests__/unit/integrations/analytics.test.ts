// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { initAnalytics, type AnalyticsConfig } from '@/lib/analytics';
import type { CookieConsentState } from '@/lib/cookie-consent';

function makeConsent(
  overrides: Partial<CookieConsentState> = {},
): CookieConsentState {
  return {
    essential: true,
    analytics: false,
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
    trackingId: 'G-TEST123',
    enabled: true,
    ...overrides,
  };
}

describe('initAnalytics', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>).__analytics_initialized;
    delete (globalThis as Record<string, unknown>).__analytics_provider;
  });

  it('does not initialize when config.enabled is false', () => {
    initAnalytics(
      makeConfig({ enabled: false }),
      makeConsent({ analytics: true }),
    );
    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBeUndefined();
  });

  it('does not initialize when consent.analytics is false', () => {
    initAnalytics(
      makeConfig({ enabled: true }),
      makeConsent({ analytics: false }),
    );
    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBeUndefined();
  });

  it('initializes when both config.enabled and consent.analytics are true', () => {
    initAnalytics(
      makeConfig({ enabled: true, trackingId: 'G-ABC' }),
      makeConsent({ analytics: true }),
    );
    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBe('G-ABC');
    expect((globalThis as Record<string, unknown>).__analytics_provider).toBe(
      'google-analytics',
    );
  });

  it('sets the correct provider for plausible', () => {
    initAnalytics(
      makeConfig({ provider: 'plausible', trackingId: 'example.com' }),
      makeConsent({ analytics: true }),
    );
    expect((globalThis as Record<string, unknown>).__analytics_provider).toBe(
      'plausible',
    );
    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBe('example.com');
  });

  it('sets the correct provider for umami', () => {
    initAnalytics(
      makeConfig({ provider: 'umami', trackingId: 'umami-id' }),
      makeConsent({ analytics: true }),
    );
    expect((globalThis as Record<string, unknown>).__analytics_provider).toBe(
      'umami',
    );
    expect(
      (globalThis as Record<string, unknown>).__analytics_initialized,
    ).toBe('umami-id');
  });

  it('does not throw when config.enabled is false and env var is missing', () => {
    expect(() =>
      initAnalytics(
        makeConfig({ enabled: false, trackingId: '' }),
        makeConsent({ analytics: true }),
      ),
    ).not.toThrow();
  });
});
