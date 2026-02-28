/**
 * Additional CSP tests targeting uncovered branch lines:
 * - Line 64: non-array base value in mergeConfigs
 * - Line 73: non-array override value in mergeConfigs
 * - Line 95: undefined value skipped in buildCSP iteration
 * - Line 101: empty array directive skipped in buildCSP
 */

import { describe, it, expect } from 'vitest';
import { buildCSP, type CSPConfig } from '@/lib/csp';

describe('buildCSP branch coverage', () => {
  it('handles override with a new directive not in defaults', () => {
    const csp = buildCSP({
      'media-src': ["'self'", 'https://media.example.com'],
    });
    expect(csp).toContain("media-src 'self' https://media.example.com");
  });

  it('handles frame-src directive (not in defaults, so base is empty array)', () => {
    const csp = buildCSP({ 'frame-src': ['https://embed.example.com'] });
    expect(csp).toContain('frame-src https://embed.example.com');
  });

  it('omits directives with empty arrays', () => {
    // Force an empty array by overriding with empty — but since defaults have values,
    // we need a directive that has no default. media-src has no default.
    // Actually, we need to test the "empty array" branch in buildCSP.
    // The defaults don't include media-src, so if we pass it as empty, it won't appear.
    const config: CSPConfig = { 'media-src': [] };
    const csp = buildCSP(config);
    expect(csp).not.toContain('media-src');
  });

  it('handles upgrade-insecure-requests as false override', () => {
    const csp = buildCSP({ 'upgrade-insecure-requests': false });
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('preserves all default directives when no overrides given', () => {
    const csp = buildCSP();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("img-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('deduplicates when override contains same source as default', () => {
    const csp = buildCSP({
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    });
    const fontDirective = csp
      .split(';')
      .find((d) => d.trim().startsWith('font-src'));
    expect(fontDirective).toBeDefined();
    // 'self' should appear only once
    const selfCount = (fontDirective!.match(/'self'/g) || []).length;
    expect(selfCount).toBe(1);
    expect(fontDirective).toContain('https://fonts.gstatic.com');
  });

  it('skips undefined override values during merge', () => {
    // Pass a config where a key is explicitly undefined
    const config = {
      'media-src': undefined,
      'font-src': ['https://fonts.example.com'],
    } as CSPConfig;
    const csp = buildCSP(config);
    // media-src should not appear (it's not in defaults and override is undefined)
    expect(csp).not.toContain('media-src');
    // font-src should be merged
    expect(csp).toContain('https://fonts.example.com');
  });
});
