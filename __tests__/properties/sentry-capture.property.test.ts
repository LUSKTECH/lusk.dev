// Feature: website-template-repo, Property 6: Sentry captures errors with metadata

import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  initSentry,
  captureError,
  resetSentry,
  type SentryConfig,
  type ErrorReport,
} from '@/lib/sentry';

/** Enabled Sentry config for testing */
const enabledConfig: SentryConfig = {
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  enabled: true,
  environment: 'test',
  tracesSampleRate: 1.0,
};

/** Arbitrary context metadata: record of string keys to JSON-serializable values */
const arbContext: fc.Arbitrary<Record<string, unknown>> = fc.dictionary(
  fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
);

describe('Property 6: Sentry captures errors with metadata', () => {
  afterEach(() => {
    resetSentry();
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * For any Error object and context metadata record, captureError produces
   * a report containing the error message, stack trace (or undefined),
   * all context keys, and a valid ISO 8601 timestamp.
   */
  it('captureError produces report with error message, stack, context keys, and valid timestamp', () => {
    fc.assert(
      fc.property(fc.string(), arbContext, (errorMessage, context) => {
        initSentry(enabledConfig);

        const reports: ErrorReport[] = [];
        const sink = (report: ErrorReport) => reports.push(report);

        const error = new Error(errorMessage);
        captureError(error, context, sink);

        expect(reports).toHaveLength(1);
        const report = reports[0];

        // Report contains the error message
        expect(report.message).toBe(error.message);

        // Report contains the stack trace (string or undefined)
        if (error.stack !== undefined) {
          expect(report.stack).toBe(error.stack);
        } else {
          expect(report.stack).toBeUndefined();
        }

        // Report contains all context metadata keys
        for (const key of Object.keys(context)) {
          expect(report.context).toHaveProperty(key);
          expect(report.context[key]).toEqual(context[key]);
        }

        // Report has a valid ISO 8601 timestamp
        expect(typeof report.timestamp).toBe('string');
        expect(report.timestamp.length).toBeGreaterThan(0);
        const parsed = new Date(report.timestamp);
        expect(parsed.getTime()).not.toBeNaN();
      }),
      { numRuns: 100 },
    );
  });
});
