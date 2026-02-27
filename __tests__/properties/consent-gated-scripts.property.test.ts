// Feature: website-template-repo, Property 3: Consent-gated script loading
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { initAnalytics } from '@/lib/analytics';
import type { AnalyticsConfig } from '@/lib/analytics';
import type { CookieConsentState } from '@/lib/cookie-consent';

/** Arbitrary CookieConsentState generator */
const arbCookieConsentState: fc.Arbitrary<CookieConsentState> = fc.record({
  essential: fc.constant(true as const),
  analytics: fc.boolean(),
  marketing: fc.boolean(),
  region: fc.constantFrom('eu' as const, 'ccpa' as const, 'general' as const),
  consentedAt: fc
    .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
    .map((d) => d.toISOString()),
  version: fc.stringMatching(/^\d+\.\d+$/),
});

/** Fixed config with enabled=true so consent is the only variable */
const enabledConfig: AnalyticsConfig = {
  provider: 'google-analytics',
  trackingId: 'GA-TEST-12345',
  enabled: true,
};

describe('Property 3: Consent-gated script loading', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>).__analytics_initialized;
    delete (globalThis as Record<string, unknown>).__analytics_provider;
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__analytics_initialized;
    delete (globalThis as Record<string, unknown>).__analytics_provider;
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * For any CookieConsentState, tracking scripts load iff analytics is true.
   * With a fixed enabled config, __analytics_initialized should be set
   * to the trackingId when consent.analytics is true, and should NOT be set
   * when consent.analytics is false.
   */
  it('should load tracking scripts iff consent.analytics is true', () => {
    fc.assert(
      fc.property(arbCookieConsentState, (consent) => {
        // Clean up before each iteration
        delete (globalThis as Record<string, unknown>).__analytics_initialized;
        delete (globalThis as Record<string, unknown>).__analytics_provider;

        initAnalytics(enabledConfig, consent);

        const initialized = (globalThis as Record<string, unknown>)
          .__analytics_initialized;

        if (consent.analytics) {
          expect(initialized).toBe(enabledConfig.trackingId);
        } else {
          expect(initialized).toBeUndefined();
        }
      }),
      { numRuns: 100 },
    );
  });
});
