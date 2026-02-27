// Feature: website-template-repo, Property 4: Graceful degradation for missing integration env vars
// @vitest-environment jsdom

import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import { initAnalytics } from '@/lib/analytics';
import type { AnalyticsConfig } from '@/lib/analytics';
import { createAxiomLogger } from '@/lib/axiom';
import type { AxiomConfig, LogEntry, WebVitalsMetrics } from '@/lib/axiom';
import {
  initSentry,
  captureError,
  resetSentry,
  type SentryConfig,
  type ErrorReport,
} from '@/lib/sentry';
import type { CookieConsentState } from '@/lib/cookie-consent';

/* ------------------------------------------------------------------ */
/*  Arbitrary generators                                               */
/* ------------------------------------------------------------------ */

/** Disabled analytics config: enabled is always false, tokens may be empty */
const arbDisabledAnalyticsConfig: fc.Arbitrary<AnalyticsConfig> = fc.record({
  provider: fc.constantFrom(
    'google-analytics' as const,
    'plausible' as const,
    'umami' as const,
  ),
  trackingId: fc.oneof(fc.constant(''), fc.string()),
  enabled: fc.constant(false),
});

/** Arbitrary consent state */
const arbConsentState: fc.Arbitrary<CookieConsentState> = fc.record({
  essential: fc.constant(true as const),
  analytics: fc.boolean(),
  marketing: fc.boolean(),
  region: fc.constantFrom('eu' as const, 'ccpa' as const, 'general' as const),
  consentedAt: fc
    .integer({ min: 946684800000, max: 4102444800000 })
    .map((ts) => new Date(ts).toISOString()),
  version: fc.stringMatching(/^\d+\.\d+$/),
});

/** Disabled Axiom config: enabled is always false, token/dataset may be empty */
const arbDisabledAxiomConfig: fc.Arbitrary<AxiomConfig> = fc.record({
  token: fc.oneof(fc.constant(''), fc.string()),
  dataset: fc.oneof(fc.constant(''), fc.string()),
  enabled: fc.constant(false),
});

/** Disabled Sentry config: enabled is always false */
const arbDisabledSentryConfig: fc.Arbitrary<SentryConfig> = fc.record({
  dsn: fc.oneof(fc.constant(''), fc.string()),
  enabled: fc.constant(false),
  environment: fc.oneof(
    fc.constant('production'),
    fc.constant('development'),
    fc.constant('test'),
    fc.string(),
  ),
  tracesSampleRate: fc.double({ min: 0, max: 1, noNaN: true }),
});

/** Arbitrary page path */
const arbPagePath = fc.string({ minLength: 0, maxLength: 200 });

/** Arbitrary web vitals metrics */
const arbWebVitals: fc.Arbitrary<WebVitalsMetrics> = fc.record(
  {
    CLS: fc.double({ min: 0, max: 10, noNaN: true }),
    FID: fc.double({ min: 0, max: 5000, noNaN: true }),
    LCP: fc.double({ min: 0, max: 30000, noNaN: true }),
    FCP: fc.double({ min: 0, max: 30000, noNaN: true }),
    TTFB: fc.double({ min: 0, max: 10000, noNaN: true }),
    INP: fc.double({ min: 0, max: 10000, noNaN: true }),
  },
  { requiredKeys: [] },
);

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('Property 4: Graceful degradation for missing integration env vars', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__analytics_initialized;
    delete (globalThis as Record<string, unknown>).__analytics_provider;
    resetSentry();
  });

  /**
   * **Validates: Requirements 3.2**
   *
   * For any disabled analytics config and any consent state,
   * initAnalytics does not throw.
   */
  it('initAnalytics with enabled=false does not throw for any consent state', () => {
    fc.assert(
      fc.property(
        arbDisabledAnalyticsConfig,
        arbConsentState,
        (config, consent) => {
          expect(() => initAnalytics(config, consent)).not.toThrow();

          // No tracking scripts should be initialized
          const initialized = (globalThis as Record<string, unknown>)
            .__analytics_initialized;
          expect(initialized).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 4.2**
   *
   * For any disabled Axiom config, createAxiomLogger returns a no-op logger
   * whose methods do not throw and produce no log entries.
   */
  it('createAxiomLogger with enabled=false returns no-op logger that never throws or emits', () => {
    fc.assert(
      fc.property(
        arbDisabledAxiomConfig,
        arbPagePath,
        arbWebVitals,
        fc.string(),
        (config, pagePath, vitals, errorMsg) => {
          const entries: LogEntry[] = [];
          const sink = (entry: LogEntry) => entries.push(entry);

          const logger = createAxiomLogger(config, sink);

          // None of these should throw
          expect(() => logger.logPageView(pagePath)).not.toThrow();
          expect(() => logger.logError(new Error(errorMsg))).not.toThrow();
          expect(() => logger.logWebVitals(vitals)).not.toThrow();

          // No entries should be produced
          expect(entries).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 5.2**
   *
   * For any disabled Sentry config, initSentry does not throw,
   * and captureError after disabled init does not throw and produces no reports.
   */
  it('initSentry with enabled=false does not throw, captureError is a no-op', () => {
    fc.assert(
      fc.property(arbDisabledSentryConfig, fc.string(), (config, errorMsg) => {
        resetSentry();

        // initSentry should not throw
        expect(() => initSentry(config)).not.toThrow();

        // captureError should not throw and should produce no reports
        const reports: ErrorReport[] = [];
        const sink = (report: ErrorReport) => reports.push(report);

        expect(() =>
          captureError(new Error(errorMsg), { key: 'value' }, sink),
        ).not.toThrow();

        expect(reports).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});
