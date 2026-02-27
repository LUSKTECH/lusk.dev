/**
 * Sentry server-side configuration entry point.
 *
 * This file is loaded by @sentry/nextjs on the server side.
 * It initializes Sentry with environment-derived configuration.
 * When SENTRY_DSN is not set, Sentry is disabled (no-op).
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? "";
const enabled = dsn.length > 0;

if (enabled) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1,
  });
}
