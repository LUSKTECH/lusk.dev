/**
 * Analytics integration with consent gating.
 *
 * Only initializes tracking when both the analytics provider is enabled
 * (env var present) AND the visitor has consented to analytics cookies.
 */

import type { CookieConsentState } from '@/lib/cookie-consent';

export interface AnalyticsConfig {
  provider: 'google-analytics' | 'plausible' | 'umami';
  trackingId: string;
  enabled: boolean; // derived from env var presence
}

/**
 * Initialize analytics tracking, gated on both configuration and consent.
 *
 * - If `config.enabled` is false (env var missing), returns immediately (no-op).
 * - If `consent.analytics` is false, returns immediately (no-op).
 * - Only when both are true does the function proceed with script injection.
 */
export function initAnalytics(
  config: AnalyticsConfig,
  consent: CookieConsentState,
): void {
  if (!config.enabled) return;
  if (!consent.analytics) return;

  injectScript(config.provider, config.trackingId);
}

/* ------------------------------------------------------------------ */
/*  Provider-specific script injection stubs                          */
/* ------------------------------------------------------------------ */

function injectScript(provider: string, trackingId: string): void {
  if (globalThis.window === undefined) return;
  // Stub: in a real implementation this would append the provider's script tag.
  // Google Analytics → <script async src="https://www.googletagmanager.com/gtag/js?id=...">
  // Plausible       → <script defer data-domain="..." src="https://plausible.io/js/script.js">
  // Umami           → <script async data-website-id="..." src="https://analytics.example.com/umami.js">
  (globalThis as Record<string, unknown>).__analytics_provider = provider;
  (globalThis as Record<string, unknown>).__analytics_initialized = trackingId;
}
