import { describe, it, expect } from 'vitest';
import { buildCSP } from '@/lib/csp';

describe('buildCSP', () => {
  it('returns a valid CSP string with defaults', () => {
    const csp = buildCSP();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('merges user overrides with defaults', () => {
    const csp = buildCSP({ 'connect-src': ['https://api.example.com'] });
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it('deduplicates sources', () => {
    const csp = buildCSP({ 'default-src': ["'self'"] });
    const match = csp.match(/default-src/g);
    expect(match).toHaveLength(1);
    // 'self' should appear only once in the default-src directive
    const directive = csp.split(';').find((d) => d.includes('default-src'));
    const selfCount = (directive?.match(/'self'/g) || []).length;
    expect(selfCount).toBe(1);
  });

  it('omits upgrade-insecure-requests when set to false', () => {
    const csp = buildCSP({ 'upgrade-insecure-requests': false });
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('includes upgrade-insecure-requests when explicitly true', () => {
    const csp = buildCSP({ 'upgrade-insecure-requests': true });
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('handles empty config', () => {
    const csp = buildCSP({});
    expect(csp.length).toBeGreaterThan(0);
  });
});
