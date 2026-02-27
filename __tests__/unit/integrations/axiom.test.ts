import { describe, it, expect, vi } from 'vitest';
import {
  createAxiomLogger,
  type AxiomConfig,
  type LogEntry,
  type WebVitalsMetrics,
} from '@/lib/axiom';

function makeConfig(overrides: Partial<AxiomConfig> = {}): AxiomConfig {
  return {
    token: 'test-token',
    dataset: 'test-dataset',
    enabled: true,
    ...overrides,
  };
}

describe('createAxiomLogger', () => {
  it('returns a no-op logger when config.enabled is false', () => {
    const sink = vi.fn();
    const logger = createAxiomLogger(makeConfig({ enabled: false }), sink);

    logger.logPageView('/home');
    logger.logError(new Error('fail'));
    logger.logWebVitals({ CLS: 0.1 });

    expect(sink).not.toHaveBeenCalled();
  });

  it('does not throw when config.enabled is false', () => {
    expect(() =>
      createAxiomLogger(makeConfig({ enabled: false, token: '' })),
    ).not.toThrow();
  });

  describe('logPageView', () => {
    it('produces a structured page-view entry', () => {
      const entries: LogEntry[] = [];
      const logger = createAxiomLogger(makeConfig(), (e) => entries.push(e));

      logger.logPageView('/about');

      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('page-view');
      expect(entries[0].data.path).toBe('/about');
      expect(entries[0].data.dataset).toBe('test-dataset');
      expect(entries[0].timestamp).toBeTruthy();
    });

    it('includes optional metadata', () => {
      const entries: LogEntry[] = [];
      const logger = createAxiomLogger(makeConfig(), (e) => entries.push(e));

      logger.logPageView('/home', { referrer: 'google.com' });

      expect(entries[0].data.referrer).toBe('google.com');
    });
  });

  describe('logError', () => {
    it('produces a structured error entry', () => {
      const entries: LogEntry[] = [];
      const logger = createAxiomLogger(makeConfig(), (e) => entries.push(e));
      const error = new Error('Something broke');

      logger.logError(error);

      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('error');
      expect(entries[0].data.message).toBe('Something broke');
      expect(entries[0].data.name).toBe('Error');
      expect(entries[0].data.stack).toBeDefined();
      expect(entries[0].timestamp).toBeTruthy();
    });

    it('includes optional context', () => {
      const entries: LogEntry[] = [];
      const logger = createAxiomLogger(makeConfig(), (e) => entries.push(e));

      logger.logError(new Error('fail'), { userId: 'u123' });

      expect(entries[0].data.userId).toBe('u123');
    });
  });

  describe('logWebVitals', () => {
    it('produces a structured web-vitals entry', () => {
      const entries: LogEntry[] = [];
      const logger = createAxiomLogger(makeConfig(), (e) => entries.push(e));
      const metrics: WebVitalsMetrics = { CLS: 0.05, LCP: 1200, FID: 10 };

      logger.logWebVitals(metrics);

      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('web-vitals');
      expect(entries[0].data.CLS).toBe(0.05);
      expect(entries[0].data.LCP).toBe(1200);
      expect(entries[0].data.FID).toBe(10);
      expect(entries[0].timestamp).toBeTruthy();
    });
  });
});
