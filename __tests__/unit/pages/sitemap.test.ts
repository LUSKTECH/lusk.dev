import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('returns an array of sitemap entries', () => {
    const entries = sitemap();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it('includes the home page with priority 1', () => {
    const entries = sitemap();
    const home = entries.find(
      (e) => !e.url.includes('/privacy') && !e.url.includes('/terms'),
    );
    expect(home).toBeDefined();
    expect(home!.priority).toBe(1);
  });

  it('includes privacy and terms pages', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes('/privacy'))).toBe(true);
    expect(urls.some((u) => u.includes('/terms'))).toBe(true);
  });

  it('all entries have lastModified and changeFrequency', () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.lastModified).toBeDefined();
      expect(entry.changeFrequency).toBeDefined();
    }
  });
});
