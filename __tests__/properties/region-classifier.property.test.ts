// Feature: website-template-repo, Property 1: Region-based banner selection

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { classifyRegion } from "@/lib/cookie-consent";

/** All 27 EU member state codes */
const EU_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

/** EEA + UK codes that also map to 'eu' */
const EEA_UK_CODES = ["IS", "LI", "NO", "UK"] as const;

/** All codes that should return 'eu' */
const ALL_EU_CODES = [...EU_CODES, ...EEA_UK_CODES];

/** The only CCPA code */
const CCPA_CODE = "US-CA";

/** Set of all reserved codes (EU + EEA/UK + CCPA) in uppercase for filtering */
const RESERVED_CODES_UPPER = new Set([
  ...ALL_EU_CODES.map((c) => c.toUpperCase()),
  CCPA_CODE.toUpperCase(),
]);

describe("Property 1: Region-based banner selection", () => {
  /**
   * Validates: Requirements 2.1, 2.3, 2.6
   *
   * For any EU member state or EEA/UK code (in any case),
   * classifyRegion should return 'eu'.
   */
  it("should return 'eu' for any EU/EEA/UK country code in any case", () => {
    const euCodeArb = fc.constantFrom(...ALL_EU_CODES).chain((code) =>
      fc.constantFrom(
        code,
        code.toLowerCase(),
        code.charAt(0).toLowerCase() + code.slice(1),
      ),
    );

    fc.assert(
      fc.property(euCodeArb, (code) => {
        expect(classifyRegion(code)).toBe("eu");
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 2.1, 2.3, 2.6
   *
   * 'US-CA' (in any case) should return 'ccpa'.
   */
  it("should return 'ccpa' for US-CA in any case", () => {
    const ccpaArb = fc.constantFrom("US-CA", "us-ca", "Us-Ca", "us-CA", "US-ca");

    fc.assert(
      fc.property(ccpaArb, (code) => {
        expect(classifyRegion(code)).toBe("ccpa");
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 2.6
   *
   * null or undefined should default to 'eu' (most restrictive fallback).
   */
  it("should return 'eu' for null or undefined (geolocation failure fallback)", () => {
    const nullishArb = fc.constantFrom(null, undefined);

    fc.assert(
      fc.property(nullishArb, (code) => {
        expect(classifyRegion(code)).toBe("eu");
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 2.3
   *
   * For any arbitrary string that is NOT in the EU/EEA/UK set and NOT 'US-CA',
   * classifyRegion should return 'general'.
   */
  it("should return 'general' for any region code not in EU/EEA/UK or CCPA", () => {
    const generalCodeArb = fc
      .string({ minLength: 1, maxLength: 10 })
      .filter((s) => !RESERVED_CODES_UPPER.has(s.toUpperCase()));

    fc.assert(
      fc.property(generalCodeArb, (code) => {
        expect(classifyRegion(code)).toBe("general");
      }),
      { numRuns: 100 },
    );
  });
});
