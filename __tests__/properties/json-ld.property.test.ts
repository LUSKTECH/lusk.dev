// Feature: website-template-repo, Property 14: JSON-LD produces valid structured data

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  generateOrganizationJsonLd,
  type SiteMetadata,
} from "@/lib/json-ld";

/**
 * Arbitrary generator for valid SiteMetadata objects.
 */
const siteMetadataArb: fc.Arbitrary<SiteMetadata> = fc.record({
  siteName: fc.string({ minLength: 1, maxLength: 200 }),
  defaultTitle: fc.string({ minLength: 1, maxLength: 200 }),
  defaultDescription: fc.string({ minLength: 1, maxLength: 500 }),
  defaultImage: fc.string({ minLength: 1, maxLength: 300 }),
  siteUrl: fc.string({ minLength: 1, maxLength: 300 }),
  twitterHandle: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
    nil: undefined,
  }),
  organization: fc.record({
    name: fc.string({ minLength: 1, maxLength: 200 }),
    url: fc.string({ minLength: 1, maxLength: 300 }),
    logo: fc.string({ minLength: 1, maxLength: 300 }),
  }),
});

describe("Property 14: JSON-LD produces valid structured data", () => {
  /**
   * Validates: Requirements 33.3
   *
   * For any organization data object (name, url, logo), the JSON-LD generator
   * should produce a valid object with @context equal to "https://schema.org",
   * @type equal to "Organization", and fields matching the input values.
   */
  it("should produce valid schema.org Organization JSON-LD for any SiteMetadata", () => {
    fc.assert(
      fc.property(siteMetadataArb, (metadata) => {
        const result = generateOrganizationJsonLd(metadata);

        // Must have correct schema.org context
        expect(result["@context"]).toBe("https://schema.org");

        // Must have Organization type
        expect(result["@type"]).toBe("Organization");

        // Fields must match input organization data
        expect(result.name).toBe(metadata.organization.name);
        expect(result.url).toBe(metadata.organization.url);
        expect(result.logo).toBe(metadata.organization.logo);

        // Output must be JSON-serializable (valid structured data)
        const serialized = JSON.stringify(result);
        const parsed = JSON.parse(serialized);
        expect(parsed["@context"]).toBe("https://schema.org");
        expect(parsed["@type"]).toBe("Organization");
        expect(parsed.name).toBe(metadata.organization.name);
        expect(parsed.url).toBe(metadata.organization.url);
        expect(parsed.logo).toBe(metadata.organization.logo);
      }),
      { numRuns: 100 },
    );
  });
});
