// Feature: website-template-repo, Property 2: Consent state round-trip persistence
// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import {
  saveConsent,
  loadConsent,
  resetConsent,
  type CookieConsentState,
} from "@/lib/cookie-consent";

/**
 * Arbitrary generator for valid CookieConsentState objects.
 */
const cookieConsentStateArb: fc.Arbitrary<CookieConsentState> = fc.record({
  essential: fc.constant(true as const),
  analytics: fc.boolean(),
  marketing: fc.boolean(),
  region: fc.constantFrom("eu" as const, "ccpa" as const, "general" as const),
  consentedAt: fc.integer({ min: 946684800000, max: 4102444800000 }).map((ts) => new Date(ts).toISOString()),
  version: fc.string({ minLength: 1 }),
});

describe("Property 2: Consent state round-trip persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Validates: Requirements 2.5, 25.3
   *
   * For any valid CookieConsentState, writing to localStorage via saveConsent
   * and reading back via loadConsent produces a deep-equal object.
   */
  it("should round-trip any valid CookieConsentState through localStorage", () => {
    fc.assert(
      fc.property(cookieConsentStateArb, (state) => {
        saveConsent(state);
        const loaded = loadConsent();
        expect(loaded).toEqual(state);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 2.5, 25.3
   *
   * After resetConsent, loadConsent should return null.
   */
  it("should return null from loadConsent after resetConsent", () => {
    fc.assert(
      fc.property(cookieConsentStateArb, (state) => {
        saveConsent(state);
        resetConsent();
        const loaded = loadConsent();
        expect(loaded).toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});
