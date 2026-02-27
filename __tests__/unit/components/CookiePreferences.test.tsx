// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import CookiePreferences from "@/components/CookiePreferences";
import type { CookieConsentState } from "@/lib/cookie-consent";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function storedConsent(
  overrides: Partial<CookieConsentState> = {},
): CookieConsentState {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    region: "general",
    consentedAt: new Date().toISOString(),
    version: "1.0",
    ...overrides,
  };
}

describe("CookiePreferences", () => {
  it("renders with all toggles off when no consent exists", async () => {
    await act(async () => {
      root.render(<CookiePreferences />);
    });

    const section = container.querySelector('[aria-label="Cookie preferences"]');
    expect(section).not.toBeNull();

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(3);

    // Essential: checked and disabled
    const essential = container.querySelector(
      'input[aria-label="Essential cookies (always on)"]',
    ) as HTMLInputElement;
    expect(essential.checked).toBe(true);
    expect(essential.disabled).toBe(true);

    // Analytics: unchecked
    const analytics = container.querySelector(
      'input[aria-label="Analytics cookies"]',
    ) as HTMLInputElement;
    expect(analytics.checked).toBe(false);

    // Marketing: unchecked
    const marketing = container.querySelector(
      'input[aria-label="Marketing cookies"]',
    ) as HTMLInputElement;
    expect(marketing.checked).toBe(false);
  });

  it("reads current consent state from localStorage on mount", async () => {
    localStorage.setItem(
      "lusk-cookie-consent",
      JSON.stringify(storedConsent({ analytics: true, marketing: true })),
    );

    await act(async () => {
      root.render(<CookiePreferences />);
    });

    const analytics = container.querySelector(
      'input[aria-label="Analytics cookies"]',
    ) as HTMLInputElement;
    const marketing = container.querySelector(
      'input[aria-label="Marketing cookies"]',
    ) as HTMLInputElement;

    expect(analytics.checked).toBe(true);
    expect(marketing.checked).toBe(true);
  });

  it("toggles analytics and marketing independently", async () => {
    await act(async () => {
      root.render(<CookiePreferences />);
    });

    const analytics = container.querySelector(
      'input[aria-label="Analytics cookies"]',
    ) as HTMLInputElement;

    await act(async () => {
      analytics.click();
    });

    expect(analytics.checked).toBe(true);

    const marketing = container.querySelector(
      'input[aria-label="Marketing cookies"]',
    ) as HTMLInputElement;
    expect(marketing.checked).toBe(false);
  });

  it("persists updated state to localStorage on save", async () => {
    await act(async () => {
      root.render(<CookiePreferences />);
    });

    const analytics = container.querySelector(
      'input[aria-label="Analytics cookies"]',
    ) as HTMLInputElement;

    await act(async () => {
      analytics.click();
    });

    const saveBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Save Preferences",
    )!;

    await act(async () => {
      saveBtn.click();
    });

    const stored = JSON.parse(
      localStorage.getItem("lusk-cookie-consent")!,
    ) as CookieConsentState;
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(false);
    expect(stored.essential).toBe(true);
  });

  it("calls onPreferencesChange callback on save", async () => {
    const onChange = vi.fn();

    await act(async () => {
      root.render(<CookiePreferences onPreferencesChange={onChange} />);
    });

    const marketing = container.querySelector(
      'input[aria-label="Marketing cookies"]',
    ) as HTMLInputElement;

    await act(async () => {
      marketing.click();
    });

    const saveBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Save Preferences",
    )!;

    await act(async () => {
      saveBtn.click();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const state = onChange.mock.calls[0][0] as CookieConsentState;
    expect(state.marketing).toBe(true);
    expect(state.analytics).toBe(false);
    expect(state.essential).toBe(true);
  });

  it("preserves region from stored consent", async () => {
    localStorage.setItem(
      "lusk-cookie-consent",
      JSON.stringify(storedConsent({ region: "eu", analytics: true })),
    );

    const onChange = vi.fn();

    await act(async () => {
      root.render(<CookiePreferences onPreferencesChange={onChange} />);
    });

    const saveBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Save Preferences",
    )!;

    await act(async () => {
      saveBtn.click();
    });

    const state = onChange.mock.calls[0][0] as CookieConsentState;
    expect(state.region).toBe("eu");
  });
});
