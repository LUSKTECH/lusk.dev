// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyRegion,
  saveConsent,
  loadConsent,
  resetConsent,
  type CookieConsentState,
} from '@/lib/cookie-consent';

// --- classifyRegion ---

describe('classifyRegion', () => {
  it("returns 'eu' for EU member state codes", () => {
    const euCodes = [
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
    ];
    for (const code of euCodes) {
      expect(classifyRegion(code)).toBe('eu');
    }
  });

  it("returns 'eu' for EEA and UK codes", () => {
    for (const code of ['IS', 'LI', 'NO', 'UK']) {
      expect(classifyRegion(code)).toBe('eu');
    }
  });

  it("returns 'eu' for null or undefined (fallback)", () => {
    expect(classifyRegion(null)).toBe('eu');
    expect(classifyRegion(undefined)).toBe('eu');
  });

  it("returns 'ccpa' for US-CA", () => {
    expect(classifyRegion('US-CA')).toBe('ccpa');
  });

  it('is case-insensitive', () => {
    expect(classifyRegion('de')).toBe('eu');
    expect(classifyRegion('us-ca')).toBe('ccpa');
  });

  it("returns 'general' for non-regulated regions", () => {
    expect(classifyRegion('US')).toBe('general');
    expect(classifyRegion('BR')).toBe('general');
    expect(classifyRegion('JP')).toBe('general');
  });
});

// --- localStorage persistence ---

describe('consent persistence', () => {
  const sampleState: CookieConsentState = {
    essential: true,
    analytics: true,
    marketing: false,
    region: 'eu',
    consentedAt: '2025-01-01T00:00:00.000Z',
    version: '1.0',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('saveConsent + loadConsent round-trips correctly', () => {
    saveConsent(sampleState);
    expect(loadConsent()).toEqual(sampleState);
  });

  it('loadConsent returns null when nothing is stored', () => {
    expect(loadConsent()).toBeNull();
  });

  it('loadConsent returns null for corrupted JSON', () => {
    localStorage.setItem('lusk-cookie-consent', 'not-json{{{');
    expect(loadConsent()).toBeNull();
  });

  it('resetConsent removes the stored consent', () => {
    saveConsent(sampleState);
    resetConsent();
    expect(loadConsent()).toBeNull();
  });
});
