// Feature: website-template-repo, Property 9: Cookie preferences UI reflects stored state
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import fc from "fast-check";
import CookiePreferences from "@/components/CookiePreferences";
import type { CookieConsentState } from "@/lib/cookie-consent";

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

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  localStorage.clear();
});

afterEach(() => {
  if (root) {
    act(() => root.unmount());
  }
  container.remove();
});

describe("Property 9: Cookie preferences UI reflects stored state", () => {
  /**
   * Validates: Requirements 25.2
   *
   * For any valid CookieConsentState stored in localStorage, the preferences
   * component renders toggles matching the stored boolean values:
   * - Essential is always checked and disabled
   * - Analytics matches stored analytics boolean
   * - Marketing matches stored marketing boolean
   */
  it("should render toggles matching stored CookieConsentState", () => {
    fc.assert(
      fc.property(cookieConsentStateArb, (state) => {
        // Store the consent state in localStorage before rendering
        localStorage.setItem("lusk-cookie-consent", JSON.stringify(state));

        // Create a fresh root for each iteration
        root = createRoot(container);
        act(() => {
          root.render(<CookiePreferences />);
        });

        // Query checkboxes by aria-label
        const essential = container.querySelector(
          'input[aria-label="Essential cookies (always on)"]',
        ) as HTMLInputElement;
        const analytics = container.querySelector(
          'input[aria-label="Analytics cookies"]',
        ) as HTMLInputElement;
        const marketing = container.querySelector(
          'input[aria-label="Marketing cookies"]',
        ) as HTMLInputElement;

        // Essential should always be checked and disabled
        expect(essential.checked).toBe(true);
        expect(essential.disabled).toBe(true);

        // Analytics and marketing should match stored values
        expect(analytics.checked).toBe(state.analytics);
        expect(marketing.checked).toBe(state.marketing);

        // Cleanup for next iteration
        act(() => root.unmount());
        container.innerHTML = "";
        localStorage.clear();
      }),
      { numRuns: 100 },
    );
  });
});
