// Edge Sentry initialization (middleware, edge routes).
// DSN is injected via SENTRY_DSN env var — no hardcoded values.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? '';

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    enableLogs: true,
    sendDefaultPii: true,
  });
}
