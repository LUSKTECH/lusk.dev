/**
 * Sentry integration for error tracking and monitoring.
 *
 * Provides configuration, initialization, and error capture utilities.
 * Returns no-op behavior when Sentry is disabled (SENTRY_DSN unset).
 */

export interface SentryConfig {
  dsn: string;
  enabled: boolean; // false when SENTRY_DSN is unset
  environment: string;
  tracesSampleRate: number;
}

export interface ErrorReport {
  message: string;
  stack: string | undefined;
  context: Record<string, unknown>;
  timestamp: string;
}

/** A sink receives error reports. Defaults to Sentry.captureException in production. */
export type ErrorSink = (report: ErrorReport) => void;

let currentSink: ErrorSink | null = null;
let sentryEnabled = false;

/**
 * Initialize Sentry with the given configuration.
 *
 * When `config.enabled` is false, this is a no-op — no SDK calls are made.
 * An optional sink can be provided for testing to capture error reports
 * without requiring the actual Sentry SDK.
 */
export function initSentry(config: SentryConfig, sink?: ErrorSink): void {
  if (!config.enabled) {
    sentryEnabled = false;
    currentSink = null;
    return;
  }

  sentryEnabled = true;
  currentSink = sink ?? null;
}

/**
 * Capture an error with optional context metadata.
 *
 * When Sentry is disabled, this is a no-op.
 * When a sink is configured (testing), the error report is sent to the sink.
 * Otherwise, the error is captured via the Sentry SDK.
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>,
  sink?: ErrorSink,
): void {
  if (!sentryEnabled) return;

  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context: context ?? {},
    timestamp: new Date().toISOString(),
  };

  const target = sink ?? currentSink;
  if (target) {
    target(report);
    return;
  }

  // In production, delegate to the actual Sentry SDK (loaded via entry points)
  // This dynamic import avoids bundling @sentry/nextjs when unused
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureException(error, {
      extra: context,
    });
  });
}

/**
 * Reset Sentry state. Useful for testing.
 */
export function resetSentry(): void {
  sentryEnabled = false;
  currentSink = null;
}
