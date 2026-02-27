/**
 * Axiom integration for structured logging and observability.
 *
 * Provides a logger that produces structured log entries for page views,
 * errors, and web vitals. Returns a no-op logger when AXIOM_TOKEN is unset.
 */

export interface AxiomConfig {
  token: string;
  dataset: string;
  enabled: boolean; // false when AXIOM_TOKEN is unset
}

export interface WebVitalsMetrics {
  /** Cumulative Layout Shift */
  CLS?: number;
  /** First Input Delay */
  FID?: number;
  /** Largest Contentful Paint (ms) */
  LCP?: number;
  /** First Contentful Paint (ms) */
  FCP?: number;
  /** Time to First Byte (ms) */
  TTFB?: number;
  /** Interaction to Next Paint (ms) */
  INP?: number;
}

export interface LogEntry {
  timestamp: string;
  type: 'page-view' | 'error' | 'web-vitals';
  data: Record<string, unknown>;
}

export interface AxiomLogger {
  logPageView(path: string, metadata?: Record<string, unknown>): void;
  logError(error: Error, context?: Record<string, unknown>): void;
  logWebVitals(metrics: WebVitalsMetrics): void;
}

/** A sink receives structured log entries. Defaults to console.log. */
export type LogSink = (entry: LogEntry) => void;

const noopLogger: AxiomLogger = {
  logPageView() {},
  logError() {},
  logWebVitals() {},
};

/**
 * Create an AxiomLogger instance.
 *
 * @param config  - Axiom configuration (token, dataset, enabled flag)
 * @param sink    - Optional sink function for log entries (defaults to console.log)
 * @returns An AxiomLogger that produces structured entries, or a no-op logger when disabled
 */
export function createAxiomLogger(
  config: AxiomConfig,
  sink?: LogSink,
): AxiomLogger {
  if (!config.enabled) return noopLogger;

  const emit: LogSink = sink ?? ((entry) => console.log(JSON.stringify(entry)));

  return {
    logPageView(path: string, metadata?: Record<string, unknown>): void {
      emit({
        timestamp: new Date().toISOString(),
        type: 'page-view',
        data: { path, dataset: config.dataset, ...metadata },
      });
    },

    logError(error: Error, context?: Record<string, unknown>): void {
      emit({
        timestamp: new Date().toISOString(),
        type: 'error',
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          dataset: config.dataset,
          ...context,
        },
      });
    },

    logWebVitals(metrics: WebVitalsMetrics): void {
      emit({
        timestamp: new Date().toISOString(),
        type: 'web-vitals',
        data: { dataset: config.dataset, ...metrics },
      });
    },
  };
}
