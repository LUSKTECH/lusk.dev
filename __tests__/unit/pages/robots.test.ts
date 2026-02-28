import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';

describe('robots', () => {
  it('returns a robots config object', () => {
    const config = robots();
    expect(config).toBeDefined();
    expect(config.rules).toBeDefined();
  });

  it('allows all user agents to crawl /', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const allRule = rules.find((r) => r.userAgent === '*');
    expect(allRule).toBeDefined();
    expect(allRule!.allow).toBe('/');
  });

  it('includes a sitemap URL', () => {
    const config = robots();
    expect(config.sitemap).toBeDefined();
    expect(config.sitemap).toContain('sitemap.xml');
  });
});
