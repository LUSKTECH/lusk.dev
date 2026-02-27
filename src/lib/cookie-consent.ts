/**
 * Cookie consent utilities for region-adaptive consent management.
 *
 * Provides region classification, consent state persistence via localStorage,
 * and helpers for reading/writing/resetting consent preferences.
 */

const STORAGE_KEY = 'lusk-cookie-consent';

/** All 27 EU member state ISO 3166-1 alpha-2 codes */
const EU_COUNTRY_CODES: ReadonlySet<string> = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
]);

/** EEA countries (non-EU) and UK (post-Brexit GDPR equivalent) */
const EEA_AND_UK_CODES: ReadonlySet<string> = new Set(['IS', 'LI', 'NO', 'UK']);

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  region: 'eu' | 'ccpa' | 'general';
  consentedAt: string;
  version: string;
}

/**
 * Classify a region code into a regulatory category.
 *
 * - EU member states and EEA/UK → `'eu'` (GDPR)
 * - `'US-CA'` → `'ccpa'`
 * - `null` / `undefined` → `'eu'` (most restrictive fallback)
 * - Everything else → `'general'`
 */
export function classifyRegion(
  regionCode: string | null | undefined,
): 'eu' | 'ccpa' | 'general' {
  if (regionCode == null) {
    return 'eu';
  }

  const code = regionCode.toUpperCase();

  if (EU_COUNTRY_CODES.has(code) || EEA_AND_UK_CODES.has(code)) {
    return 'eu';
  }

  if (code === 'US-CA') {
    return 'ccpa';
  }

  return 'general';
}

/**
 * Persist a consent state to localStorage.
 */
export function saveConsent(state: CookieConsentState): void {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Load the consent state from localStorage.
 * Returns `null` if the key is missing or the stored value is corrupted.
 */
export function loadConsent(): CookieConsentState | null {
  if (globalThis.window === undefined) return null;

  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as CookieConsentState;
  } catch {
    return null;
  }
}

/**
 * Remove the consent state from localStorage, forcing the banner to re-appear.
 */
export function resetConsent(): void {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.removeItem(STORAGE_KEY);
}
