// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SEOHead from "@/components/SEOHead";

/**
 * SEOHead renders <meta>, <link>, and <script> tags which are metadata elements.
 * jsdom strips <meta>/<link> from <div> containers, so we use renderToStaticMarkup
 * and parse the HTML string to verify the output.
 */
function renderAndParse(props: React.ComponentProps<typeof SEOHead>) {
  const html = renderToStaticMarkup(<SEOHead {...props} />);
  const doc = new DOMParser().parseFromString(
    `<head>${html}</head>`,
    "text/html",
  );
  return doc.head;
}

describe("SEOHead", () => {
  it("renders Open Graph meta tags", () => {
    const head = renderAndParse({
      title: "Test Title",
      description: "Test description",
      url: "https://example.com",
    });

    expect(
      head.querySelector('meta[property="og:title"]')?.getAttribute("content"),
    ).toBe("Test Title");
    expect(
      head
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
    ).toBe("Test description");
    expect(
      head.querySelector('meta[property="og:url"]')?.getAttribute("content"),
    ).toBe("https://example.com");
    expect(
      head.querySelector('meta[property="og:type"]')?.getAttribute("content"),
    ).toBe("website");
  });

  it("renders og:image when image prop is provided", () => {
    const head = renderAndParse({
      title: "Title",
      description: "Desc",
      url: "https://example.com",
      image: "https://example.com/og.png",
    });

    expect(
      head.querySelector('meta[property="og:image"]')?.getAttribute("content"),
    ).toBe("https://example.com/og.png");
  });

  it("does not render og:image when image prop is absent", () => {
    const head = renderAndParse({
      title: "Title",
      description: "Desc",
      url: "https://example.com",
    });

    expect(head.querySelector('meta[property="og:image"]')).toBeNull();
  });

  it("renders Twitter Card meta tags", () => {
    const head = renderAndParse({
      title: "Twitter Test",
      description: "Twitter desc",
      url: "https://example.com",
      image: "https://example.com/tw.png",
    });

    expect(
      head.querySelector('meta[name="twitter:card"]')?.getAttribute("content"),
    ).toBe("summary_large_image");
    expect(
      head
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content"),
    ).toBe("Twitter Test");
    expect(
      head
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content"),
    ).toBe("Twitter desc");
    expect(
      head
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content"),
    ).toBe("https://example.com/tw.png");
  });

  it("renders canonical link tag", () => {
    const head = renderAndParse({
      title: "Title",
      description: "Desc",
      url: "https://example.com/page",
    });

    expect(
      head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://example.com/page");
  });

  it("renders JSON-LD script when jsonLd prop is provided", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Test Org",
    };

    const head = renderAndParse({
      title: "Title",
      description: "Desc",
      url: "https://example.com",
      jsonLd,
    });

    const script = head.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.textContent!)).toEqual(jsonLd);
  });

  it("does not render JSON-LD script when jsonLd prop is absent", () => {
    const head = renderAndParse({
      title: "Title",
      description: "Desc",
      url: "https://example.com",
    });

    expect(
      head.querySelector('script[type="application/ld+json"]'),
    ).toBeNull();
  });

  it("respects custom type and twitterCard props", () => {
    const head = renderAndParse({
      title: "Article",
      description: "An article",
      url: "https://example.com/article",
      type: "article",
      twitterCard: "summary",
    });

    expect(
      head.querySelector('meta[property="og:type"]')?.getAttribute("content"),
    ).toBe("article");
    expect(
      head.querySelector('meta[name="twitter:card"]')?.getAttribute("content"),
    ).toBe("summary");
  });
});
