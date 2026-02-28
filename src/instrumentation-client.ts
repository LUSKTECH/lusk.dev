// Client-side Sentry initialization.
// Loaded automatically by @sentry/nextjs when the browser loads a page.
// DSN is injected via NEXT_PUBLIC_SENTRY_DSN env var — no hardcoded values.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    enableLogs: true,
    sendDefaultPii: true,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
