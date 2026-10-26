// Server-side Sentry initialization.
// Loaded by @sentry/nextjs whenever the server handles a request.
// DSN is injected via SENTRY_DSN env var — no hardcoded values.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? '';

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
    ],
  });
}
