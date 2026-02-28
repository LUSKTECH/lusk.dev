import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initSentry,
  captureError,
  resetSentry,
  type SentryConfig,
  type ErrorReport,
} from '@/lib/sentry';

function makeConfig(overrides: Partial<SentryConfig> = {}): SentryConfig {
  return {
    dsn: 'https://test@sentry.io/123',
    enabled: true,
    environment: 'test',
    tracesSampleRate: 1.0,
    ...overrides,
  };
}

describe('sentry integration', () => {
  beforeEach(() => {
    resetSentry();
  });

  it('initSentry with disabled config sets no-op state', () => {
    const sink = vi.fn();
    initSentry(makeConfig({ enabled: false }), sink);
    captureError(new Error('test'));
    expect(sink).not.toHaveBeenCalled();
  });

  it('initSentry with enabled config and sink captures errors', () => {
    const reports: ErrorReport[] = [];
    initSentry(makeConfig(), (r) => reports.push(r));
    captureError(new Error('boom'));
    expect(reports).toHaveLength(1);
    expect(reports[0].message).toBe('boom');
    expect(reports[0].timestamp).toBeTruthy();
  });

  it('captureError includes context metadata', () => {
    const reports: ErrorReport[] = [];
    initSentry(makeConfig(), (r) => reports.push(r));
    captureError(new Error('fail'), { userId: 'u1' });
    expect(reports[0].context).toEqual({ userId: 'u1' });
  });

  it('captureError with per-call sink overrides global sink', () => {
    const globalSink = vi.fn();
    const localSink = vi.fn();
    initSentry(makeConfig(), globalSink);
    captureError(new Error('test'), {}, localSink);
    expect(globalSink).not.toHaveBeenCalled();
    expect(localSink).toHaveBeenCalledTimes(1);
  });

  it('captureError falls back to dynamic import when no sink is set', async () => {
    const mockCapture = vi.fn();
    vi.doMock('@sentry/nextjs', () => ({
      captureException: mockCapture,
    }));

    initSentry(makeConfig());
    captureError(new Error('production error'));

    // Allow the dynamic import promise to resolve
    await new Promise((r) => setTimeout(r, 50));
    expect(mockCapture).toHaveBeenCalledTimes(1);

    vi.doUnmock('@sentry/nextjs');
  });

  it('resetSentry disables capture', () => {
    const sink = vi.fn();
    initSentry(makeConfig(), sink);
    resetSentry();
    captureError(new Error('after reset'));
    expect(sink).not.toHaveBeenCalled();
  });
});
