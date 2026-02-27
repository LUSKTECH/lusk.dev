// Feature: website-template-repo, Property 13: SEO component renders correct meta tags
// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SEOHead, { type SEOProps } from "@/components/SEOHead";

/**
 * Renders SEOHead to static markup and parses it with DOMParser,
 * wrapping in <head> so meta/link tags are preserved by jsdom.
 */
function renderAndParse(props: SEOProps) {
  const html = renderToStaticMarkup(<SEOHead {...props} />);
  const doc = new DOMParser().parseFromString(
    `<head>${html}</head>`,
    "text/html",
  );
  return doc.head;
}

/**
 * Arbitrary generator for valid SEOProps.
 */
const seoPropsArb: fc.Arbitrary<SEOProps> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  url: fc.webUrl(),
  image: fc.option(fc.webUrl(), { nil: undefined }),
  type: fc.option(fc.constantFrom("website" as const, "article" as const), {
    nil: undefined,
  }),
  twitterCard: fc.option(
    fc.constantFrom("summary" as const, "summary_large_image" as const),
    { nil: undefined },
  ),
  jsonLd: fc.option(
    fc.record({
      "@context": fc.constant("https://schema.org"),
      "@type": fc.constant("Organization"),
      name: fc.string({ minLength: 1 }),
    }),
    { nil: undefined },
  ),
});

describe("Property 13: SEO component renders correct meta tags", () => {
  /**
   * Validates: Requirements 33.1, 33.2
   *
   * For any valid SEOProps, the rendered output contains the correct
   * OG, Twitter, and canonical tags with matching values.
   */
  it("should render correct OG, Twitter, and canonical tags for any valid SEOProps", () => {
    fc.assert(
      fc.property(seoPropsArb, (props) => {
        const head = renderAndParse(props);

        // Open Graph tags
        expect(
          head
            .querySelector('meta[property="og:title"]')
            ?.getAttribute("content"),
        ).toBe(props.title);
        expect(
          head
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content"),
        ).toBe(props.description);
        expect(
          head
            .querySelector('meta[property="og:url"]')
            ?.getAttribute("content"),
        ).toBe(props.url);
        expect(
          head
            .querySelector('meta[property="og:type"]')
            ?.getAttribute("content"),
        ).toBe(props.type ?? "website");

        // og:image present iff image prop is provided
        const ogImage = head.querySelector('meta[property="og:image"]');
        if (props.image) {
          expect(ogImage?.getAttribute("content")).toBe(props.image);
        } else {
          expect(ogImage).toBeNull();
        }

        // Twitter Card tags
        expect(
          head
            .querySelector('meta[name="twitter:card"]')
            ?.getAttribute("content"),
        ).toBe(props.twitterCard ?? "summary_large_image");
        expect(
          head
            .querySelector('meta[name="twitter:title"]')
            ?.getAttribute("content"),
        ).toBe(props.title);
        expect(
          head
            .querySelector('meta[name="twitter:description"]')
            ?.getAttribute("content"),
        ).toBe(props.description);

        // twitter:image present iff image prop is provided
        const twImage = head.querySelector('meta[name="twitter:image"]');
        if (props.image) {
          expect(twImage?.getAttribute("content")).toBe(props.image);
        } else {
          expect(twImage).toBeNull();
        }

        // Canonical link
        expect(
          head
            .querySelector('link[rel="canonical"]')
            ?.getAttribute("href"),
        ).toBe(props.url);

        // JSON-LD script present iff jsonLd prop is provided
        const script = head.querySelector(
          'script[type="application/ld+json"]',
        );
        if (props.jsonLd) {
          expect(script).not.toBeNull();
          expect(JSON.parse(script!.textContent!)).toEqual(props.jsonLd);
        } else {
          expect(script).toBeNull();
        }
      }),
      { numRuns: 100 },
    );
  });
});
