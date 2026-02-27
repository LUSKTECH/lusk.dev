// Feature: website-template-repo, Property 5: Axiom logger produces structured output

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createAxiomLogger } from "@/lib/axiom";
import type { LogEntry, WebVitalsMetrics } from "@/lib/axiom";

/** Enabled Axiom config so the logger actually produces entries */
const enabledConfig = {
  token: "test-token",
  dataset: "test-dataset",
  enabled: true,
};

/** Arbitrary web vitals metrics generator */
const arbWebVitalsMetrics: fc.Arbitrary<WebVitalsMetrics> = fc.record(
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

describe("Property 5: Axiom logger produces structured output", () => {
  /**
   * **Validates: Requirements 4.3**
   *
   * For any page path string, logPageView produces a structured entry
   * with type 'page-view', a valid timestamp, and the input path in data.
   */
  it("logPageView produces structured entry with path and timestamp", () => {
    fc.assert(
      fc.property(fc.string(), (path) => {
        const entries: LogEntry[] = [];
        const logger = createAxiomLogger(enabledConfig, (e) => entries.push(e));

        logger.logPageView(path);

        expect(entries).toHaveLength(1);
        const entry = entries[0];
        expect(entry.type).toBe("page-view");
        expect(typeof entry.timestamp).toBe("string");
        expect(entry.timestamp.length).toBeGreaterThan(0);
        expect(() => new Date(entry.timestamp)).not.toThrow();
        expect(entry.data.path).toBe(path);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 4.3**
   *
   * For any Error object, logError produces a structured entry
   * with type 'error', a valid timestamp, and the error message in data.
   */
  it("logError produces structured entry with error message and timestamp", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const entries: LogEntry[] = [];
        const logger = createAxiomLogger(enabledConfig, (e) => entries.push(e));
        const error = new Error(message);

        logger.logError(error);

        expect(entries).toHaveLength(1);
        const entry = entries[0];
        expect(entry.type).toBe("error");
        expect(typeof entry.timestamp).toBe("string");
        expect(entry.timestamp.length).toBeGreaterThan(0);
        expect(() => new Date(entry.timestamp)).not.toThrow();
        expect(entry.data.message).toBe(error.message);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 4.3**
   *
   * For any web vitals metrics, logWebVitals produces a structured entry
   * with type 'web-vitals', a valid timestamp, and the metrics in data.
   */
  it("logWebVitals produces structured entry with metrics and timestamp", () => {
    fc.assert(
      fc.property(arbWebVitalsMetrics, (metrics) => {
        const entries: LogEntry[] = [];
        const logger = createAxiomLogger(enabledConfig, (e) => entries.push(e));

        logger.logWebVitals(metrics);

        expect(entries).toHaveLength(1);
        const entry = entries[0];
        expect(entry.type).toBe("web-vitals");
        expect(typeof entry.timestamp).toBe("string");
        expect(entry.timestamp.length).toBeGreaterThan(0);
        expect(() => new Date(entry.timestamp)).not.toThrow();

        // Verify each provided metric is present in the data
        for (const [key, value] of Object.entries(metrics)) {
          if (value !== undefined) {
            expect(entry.data[key]).toBe(value);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
